import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth/config';
import {
  createOtpFlowCookie,
  hashPhoneNumber,
  internalAuthHeaders,
  OTP_FLOW_COOKIE,
  OTP_INTENT_TTL_SECONDS,
  readOtpFlowCookie,
  hasTrustedRequestOrigin,
} from '@/server/auth/customer-flow';
import { knex } from '@/server/db/knex';
import { consumeSharedRateLimit } from '@/server/services/shared-rate-limit';
import { hashRequestIp } from '@/server/services/ip-hash';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (process.env.CUSTOMER_REGISTRATION_ENABLED === 'false') {
    return NextResponse.json({ error: 'temporarily_unavailable' }, { status: 503 });
  }
  const flow = readOtpFlowCookie(request.cookies.get(OTP_FLOW_COOKIE)?.value);
  if (!flow) return NextResponse.json({ error: 'expired_or_invalid' }, { status: 400 });
  const previous = await knex('otp_intents').where({ id: flow.intentId }).first();
  if (!previous) return NextResponse.json({ error: 'expired_or_invalid' }, { status: 400 });

  const phoneHash = hashPhoneNumber(flow.phoneNumber);
  try {
    const limits = await Promise.all([
      consumeSharedRateLimit('otp:cooldown', phoneHash, { limit: 1, windowSeconds: 60 }),
      consumeSharedRateLimit('otp:phone:daily', phoneHash, { limit: 5, windowSeconds: 86_400 }),
      consumeSharedRateLimit('otp:ip:daily', hashRequestIp(request), { limit: 15, windowSeconds: 86_400 }),
    ]);
    const blocked = limits.find((result) => !result.allowed);
    if (blocked) return NextResponse.json(
      { error: 'rate_limited', retryAfterSeconds: blocked.retryAfterSeconds },
      { status: 429 }
    );
  } catch {
    return NextResponse.json({ error: 'temporarily_unavailable' }, { status: 503 });
  }

  const intentId = randomUUID();
  const expiresAt = new Date(Date.now() + OTP_INTENT_TTL_SECONDS * 1_000);
  await knex('otp_intents').insert({
    id: intentId,
    phone_hash: phoneHash,
    terms_version: previous.terms_version,
    privacy_version: previous.privacy_version,
    locale: previous.locale,
    expires_at: expiresAt,
  });
  try {
    await auth.api.sendPhoneNumberOTP({
      body: { phoneNumber: flow.phoneNumber },
      headers: internalAuthHeaders(request.headers),
    });
    await knex('otp_intents').where({ id: flow.intentId, consumed_at: null }).update({ consumed_at: knex.fn.now() });
    const response = NextResponse.json({ ok: true, intentId, resendAfterSeconds: 60 });
    response.cookies.set(OTP_FLOW_COOKIE, createOtpFlowCookie(intentId, flow.phoneNumber, expiresAt), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/customer-auth',
      maxAge: OTP_INTENT_TTL_SECONDS,
    });
    return response;
  } catch {
    await knex('otp_intents').where({ id: intentId }).delete();
    return NextResponse.json({ error: 'sms_unavailable' }, { status: 503 });
  }
}
