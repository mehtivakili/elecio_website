import { NextRequest, NextResponse, userAgent } from 'next/server';
import { hasTrustedRequestOrigin } from '@/server/auth/customer-flow';
import { isRateLimited } from '@/server/services/rate-limit';
import { hashRequestIp } from '@/server/services/ip-hash';
import { recordPageView } from '@/server/analytics/page-views';
import { analyticsDay, parsePageViewPath } from '@/lib/page-analytics';

export const runtime = 'nodejs';

const noContent = () => new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: NextRequest) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (userAgent(request).isBot) return noContent();
  if (isRateLimited(`pageview:${hashRequestIp(request)}`, { limit: 60, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const target = parsePageViewPath(body?.path);
  if (!target) return NextResponse.json({ error: 'invalid_path' }, { status: 400 });
  await recordPageView(request, target, analyticsDay(new Date()));
  return noContent();
}
