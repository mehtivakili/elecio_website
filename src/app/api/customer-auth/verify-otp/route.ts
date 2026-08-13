import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth/config';
import {
  hashPhoneNumber,
  hashConsentSignal,
  internalAuthHeaders,
  OTP_FLOW_COOKIE,
  readOtpFlowCookie,
  phoneLookupVariants,
  hasTrustedRequestOrigin,
} from '@/server/auth/customer-flow';
import { normalizeOtpCode } from '@/server/auth/phone';
import { knex } from '@/server/db/knex';
import { writeAuditEvent } from '@/server/audit/write-audit-event';
import { consumeSharedRateLimit } from '@/server/services/shared-rate-limit';
import { hashRequestIp } from '@/server/services/ip-hash';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const flow = readOtpFlowCookie(request.cookies.get(OTP_FLOW_COOKIE)?.value);
  const phoneNumber = flow?.phoneNumber ?? null;
  const code = typeof body?.code === 'string' ? normalizeOtpCode(body.code) : null;
  const intentId = typeof body?.intentId === 'string' ? body.intentId : '';
  if (!phoneNumber || !code || !/^[0-9a-f-]{36}$/i.test(intentId)) {
    return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
  }

  if (flow?.intentId !== intentId) {
    return NextResponse.json({ error: 'expired_or_invalid' }, { status: 400 });
  }
  const intent = await knex('otp_intents')
    .where({ id: intentId, phone_hash: hashPhoneNumber(phoneNumber), consumed_at: null })
    .where('expires_at', '>', knex.fn.now())
    .first();
  if (!intent) return NextResponse.json({ error: 'expired_or_invalid' }, { status: 400 });

  try {
    const limit = await consumeSharedRateLimit('otp:verify', `${intentId}:${hashRequestIp(request)}`, {
      limit: 5,
      windowSeconds: 300,
    });
    if (!limit.allowed) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }
  } catch {
    return NextResponse.json({ error: 'temporarily_unavailable' }, { status: 503 });
  }

  try {
    const authResponse = await auth.api.verifyPhoneNumber({
      body: { phoneNumber, code },
      headers: internalAuthHeaders(request.headers),
      asResponse: true,
    });
    const payload = await authResponse.clone().json();
    if (!authResponse.ok || !payload?.status || !payload?.user?.id) {
      return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
    }

    const userId = payload.user.id as string;
    await knex.transaction(async (trx) => {
      const consumed = await trx('otp_intents')
        .where({ id: intentId, consumed_at: null })
        .update({ consumed_at: trx.fn.now() });
      if (consumed !== 1) throw new Error('OTP intent was already consumed.');

      const consentRows = [
        { document_type: 'terms', document_version: intent.terms_version },
        { document_type: 'privacy', document_version: intent.privacy_version },
      ].map((consent) => ({
        id: randomUUID(),
        user_id: userId,
        ...consent,
        ip_hash: hashConsentSignal(request.headers.get('x-real-ip')),
        user_agent_hash: hashConsentSignal(request.headers.get('user-agent')),
        metadata: JSON.stringify({ locale: intent.locale, source: 'phone_otp' }),
      }));
      await trx('user_consents').insert(consentRows).onConflict([
        'user_id',
        'document_type',
        'document_version',
      ]).ignore();
      const variants = phoneLookupVariants(phoneNumber);
      await trx('contact_submissions').whereNull('user_id').whereIn('phone', variants).update({ user_id: userId });
      await trx('download_requests').whereNull('user_id').whereIn('phone', variants).update({ user_id: userId });
    });
    await writeAuditEvent({
      actorUserId: userId,
      actorRole: 'customer',
      action: 'otp.verified',
      resource: 'otp_intent',
      resourceId: intentId,
      outcome: 'success',
    });

    const response = NextResponse.json({ ok: true, locale: intent.locale });
    const setCookies = typeof authResponse.headers.getSetCookie === 'function'
      ? authResponse.headers.getSetCookie()
      : [authResponse.headers.get('set-cookie')].filter(Boolean) as string[];
    for (const cookie of setCookies) response.headers.append('set-cookie', cookie);
    response.cookies.set(OTP_FLOW_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/customer-auth',
      maxAge: 0,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch {
    await writeAuditEvent({
      action: 'otp.verification_failed',
      resource: 'otp_intent',
      resourceId: intentId,
      outcome: 'failure',
    });
    return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
  }
}
