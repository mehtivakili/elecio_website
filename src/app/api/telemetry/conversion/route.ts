import { NextRequest, NextResponse } from 'next/server';
import { knex } from '@/server/db/knex';
import { hasTrustedRequestOrigin } from '@/server/auth/customer-flow';
import { isRateLimited } from '@/server/services/rate-limit';
import { hashRequestIp } from '@/server/services/ip-hash';
import { isConversionEvent } from '@/lib/telemetry';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (isRateLimited(`telemetry:${hashRequestIp(request)}`, { limit: 30, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  if (!isConversionEvent(body?.event) || !['fa', 'en'].includes(body?.locale)) {
    return NextResponse.json({ error: 'invalid_event' }, { status: 400 });
  }
  const day = new Date().toISOString().slice(0, 10);
  await knex.raw(
    `insert into conversion_daily_counts (day, event, locale, count)
     values (?, ?, ?, 1)
     on conflict (day, event, locale)
     do update set count = conversion_daily_counts.count + 1`,
    [day, body.event, body.locale],
  );
  return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}
