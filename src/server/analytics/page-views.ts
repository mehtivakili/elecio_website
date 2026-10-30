import 'server-only';

import { createHmac } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { knex } from '@/server/db/knex';
import { requestIp } from '@/server/services/ip-hash';
import type { PageViewTarget } from '@/lib/page-analytics';

const TABLE = 'page_view_daily_visitors';

function visitorSecret(): string | null {
  const secret = process.env.IP_HASH_SALT || process.env.BETTER_AUTH_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

/**
 * "One visitor" = one browser on one network for one day. The day is part of the keyed input, so
 * the same person produces unrelated hashes on different days and cannot be followed across them.
 */
function dailyVisitorHash(request: NextRequest, day: string): string | null {
  const secret = visitorSecret();
  if (!secret) return null;
  const userAgent = request.headers.get('user-agent') ?? '';
  return createHmac('sha256', secret)
    .update(`page-visitor:v1\n${day}\n${requestIp(request)}\n${userAgent}`)
    .digest('hex')
    .slice(0, 32);
}

export async function recordPageView(request: NextRequest, target: PageViewTarget, day: string): Promise<void> {
  const visitor = dailyVisitorHash(request, day);
  if (!visitor) return;
  await knex.raw(
    `insert into ${TABLE} (day, locale, path, visitor_hash, views)
     values (?, ?, ?, ?, 1)
     on duplicate key update views = views + 1`,
    [day, target.locale, target.path, visitor],
  );
}

export type DailyTraffic = { day: string; views: number; visitors: number };
export type PageTraffic = { locale: 'fa' | 'en'; path: string; views: number; visitors: number };

/** Per-day totals; a visitor who opens several pages in a day counts once for that day. */
export async function getDailyTraffic(from: string, to: string): Promise<DailyTraffic[]> {
  const rows: Array<{ day: string; views: string | number; visitors: string | number }> = await knex(TABLE)
    .select(knex.raw("date_format(day, '%Y-%m-%d') as day"))
    .sum({ views: 'views' })
    .countDistinct({ visitors: 'visitor_hash' })
    .whereBetween('day', [from, to])
    .groupBy(`${TABLE}.day`);
  return rows.map((row) => ({ day: row.day, views: Number(row.views), visitors: Number(row.visitors) }));
}

/** Per-page totals. Across several days, `visitors` is the sum of each day's unique visitors. */
export async function getPageTraffic(from: string, to: string, limit = 200): Promise<PageTraffic[]> {
  const rows: Array<{ locale: 'fa' | 'en'; path: string; views: string | number; visitors: string | number }> = await knex(TABLE)
    .select('locale', 'path')
    .sum({ views: 'views' })
    .count({ visitors: '*' })
    .whereBetween('day', [from, to])
    .groupBy('locale', 'path')
    .orderBy([{ column: 'views', order: 'desc' }, { column: 'visitors', order: 'desc' }])
    .limit(limit);
  return rows.map((row) => ({ locale: row.locale, path: row.path, views: Number(row.views), visitors: Number(row.visitors) }));
}
