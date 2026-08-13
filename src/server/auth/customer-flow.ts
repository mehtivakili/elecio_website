import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { knex } from '@/server/db/knex';

export const TERMS_VERSION = '2026-08-13';
export const PRIVACY_VERSION = '2026-08-13';
export const OTP_INTENT_TTL_SECONDS = 5 * 60;
export const INTERNAL_AUTH_HEADER = 'x-elecio-customer-auth';
export const OTP_FLOW_COOKIE = 'elecio_otp_flow';

function requiredSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error('BETTER_AUTH_SECRET is not configured safely.');
  return secret;
}

export function hashPhoneNumber(phoneNumber: string): string {
  return createHmac('sha256', requiredSecret()).update(`phone:${phoneNumber}`).digest('hex');
}

export function hashConsentSignal(value: string | null): string | null {
  if (!value) return null;
  const salt = process.env.IP_HASH_SALT;
  if (!salt || salt.length < 32) return null;
  return createHmac('sha256', salt).update(value).digest('hex');
}

export function phoneLookupVariants(phoneNumber: string): string[] {
  const national = `0${phoneNumber.slice(3)}`;
  return [phoneNumber, phoneNumber.slice(1), national, national.slice(1)];
}

export function hasTrustedRequestOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const allowed = [process.env.BETTER_AUTH_URL, ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '').split(',')]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.trim().replace(/\/$/, ''));
  return allowed.includes(origin.replace(/\/$/, ''));
}

function internalAuthValue(): string {
  return createHmac('sha256', requiredSecret()).update('elecio:customer-auth-gateway:v1').digest('hex');
}

export function internalAuthHeaders(source?: Headers): Headers {
  const headers = new Headers(source);
  headers.set(INTERNAL_AUTH_HEADER, internalAuthValue());
  return headers;
}

export function hasValidInternalAuthHeader(headers: Headers | undefined): boolean {
  const supplied = headers?.get(INTERNAL_AUTH_HEADER);
  if (!supplied) return false;
  const expected = internalAuthValue();
  if (supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export function createOtpFlowCookie(intentId: string, phoneNumber: string, expiresAt: Date): string {
  const payload = Buffer.from(
    JSON.stringify({ intentId, phoneNumber, expiresAt: expiresAt.getTime() }),
    'utf8'
  ).toString('base64url');
  const signature = createHmac('sha256', requiredSecret()).update(`otp-flow:${payload}`).digest('base64url');
  return `${payload}.${signature}`;
}

export function readOtpFlowCookie(value: string | undefined): {
  intentId: string;
  phoneNumber: string;
  expiresAt: number;
} | null {
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', requiredSecret()).update(`otp-flow:${payload}`).digest('base64url');
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      intentId?: unknown;
      phoneNumber?: unknown;
      expiresAt?: unknown;
    };
    if (
      typeof parsed.intentId !== 'string' ||
      typeof parsed.phoneNumber !== 'string' ||
      typeof parsed.expiresAt !== 'number' ||
      parsed.expiresAt <= Date.now()
    ) return null;
    return parsed as { intentId: string; phoneNumber: string; expiresAt: number };
  } catch {
    return null;
  }
}

export async function localeForPendingOtp(phoneNumber: string): Promise<'fa' | 'en'> {
  const intent = await knex('otp_intents')
    .select('locale')
    .where({ phone_hash: hashPhoneNumber(phoneNumber), consumed_at: null })
    .where('expires_at', '>', knex.fn.now())
    .orderBy('created_at', 'desc')
    .first();
  return intent?.locale === 'en' ? 'en' : 'fa';
}
