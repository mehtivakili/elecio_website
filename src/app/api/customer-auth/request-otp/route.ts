import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth/config';
import {
  hashPhoneNumber,
  internalAuthHeaders,
  createOtpFlowCookie,
  OTP_INTENT_TTL_SECONDS,
  OTP_FLOW_COOKIE,
  PRIVACY_VERSION,
  TERMS_VERSION,
  hasTrustedRequestOrigin,
} from '@/server/auth/customer-flow';
import { maskPhoneNumber, normalizeIranianPhoneNumber } from '@/server/auth/phone';
import { knex } from '@/server/db/knex';
import { writeAuditEvent } from '@/server/audit/write-audit-event';
import { consumeSharedRateLimit } from '@/server/services/shared-rate-limit';
import { hashRequestIp } from '@/server/services/ip-hash';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (process.env.CUSTOMER_REGISTRATION_ENABLED === 'false') {
    return NextResponse.json({ error: 'temporarily_unavailable' }, { status: 503 });
  }
  const body = await request.json().catch(() => null);
  const phoneNumber = typeof body?.phoneNumber === 'string'
    ? normalizeIranianPhoneNumber(body.phoneNumber)
    : null;
  const locale = body?.locale === 'en' ? 'en' : 'fa';
  if (!phoneNumber || body?.acceptTerms !== true || body?.acceptPrivacy !== true) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const phoneHash = hashPhoneNumber(phoneNumber);
  const ipHash = hashRequestIp(request);
  try {
    const limits = await Promise.all([
      consumeSharedRateLimit('otp:cooldown', phoneHash, { limit: 1, windowSeconds: 60 }),
      consumeSharedRateLimit('otp:phone:daily', phoneHash, { limit: 5, windowSeconds: 86_400 }),
      consumeSharedRateLimit('otp:ip:daily', ipHash, { limit: 15, windowSeconds: 86_400 }),
    ]);
    const blocked = limits.find((result) => !result.allowed);
    if (blocked) {
      return NextResponse.json(
        { error: 'rate_limited', retryAfterSeconds: blocked.retryAfterSeconds },
        { status: 429, headers: { 'Retry-After': String(blocked.retryAfterSeconds) } }
      );
    }
  } catch {
    return NextResponse.json({ error: 'temporarily_unavailable' }, { status: 503 });
  }

  const intentId = randomUUID();
  const expiresAt = new Date(Date.now() + OTP_INTENT_TTL_SECONDS * 1_000);
  await knex('otp_intents').insert({
    id: intentId,
    phone_hash: phoneHash,
    terms_version: TERMS_VERSION,
    privacy_version: PRIVACY_VERSION,
    locale,
    expires_at: expiresAt,
  });

  try {
    await auth.api.sendPhoneNumberOTP({
      body: { phoneNumber },
      headers: internalAuthHeaders(request.headers),
    });
    await writeAuditEvent({
      action: 'otp.requested',
      resource: 'otp_intent',
      resourceId: intentId,
      outcome: 'success',
      ipAddress: request.headers.get('x-real-ip'),
      metadata: { providerConfigured: process.env.SMS_PROVIDER === 'kavenegar' },
    });
    const response = NextResponse.json({
      ok: true,
      intentId,
      maskedPhone: maskPhoneNumber(phoneNumber),
      expiresAt: expiresAt.toISOString(),
      resendAfterSeconds: 60,
    });
    response.cookies.set(OTP_FLOW_COOKIE, createOtpFlowCookie(intentId, phoneNumber, expiresAt), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/customer-auth',
      maxAge: OTP_INTENT_TTL_SECONDS,
    });
    return response;
  } catch (error) {
    await knex('otp_intents').where({ id: intentId }).delete();
    await writeAuditEvent({
      action: 'otp.request_failed',
      resource: 'otp_intent',
      resourceId: intentId,
      outcome: 'failure',
      metadata: { reason: error instanceof Error ? error.name : 'unknown' },
    });
    return NextResponse.json({ error: 'sms_unavailable' }, { status: 503 });
  }
}
