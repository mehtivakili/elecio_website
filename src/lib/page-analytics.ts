// Shared by the page-view beacon route and the admin traffic report. Kept free of server-only
// imports so tests can exercise the parsing rules directly.

// Days are bucketed in the business's local time (Iran has no DST since 2022, so a day is always
// 24h), so "today" in the admin report matches the team's calendar rather than UTC.
export const ANALYTICS_TIME_ZONE = 'Asia/Tehran';
const MAX_PATH_LENGTH = 255;

export type PageViewTarget = { locale: 'fa' | 'en'; path: string };

/** Accepts a same-site pathname like `/fa/blog/x?y=1` and returns its locale + locale-less path. */
export function parsePageViewPath(value: unknown): PageViewTarget | null {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return null;
  let pathname = value.split(/[?#]/, 1)[0];
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const match = /^\/(fa|en)(?=\/|$)(.*)$/.exec(pathname);
  if (!match) return null;
  const path = match[2].replace(/\/+$/, '') || '/';
  if (path.length > MAX_PATH_LENGTH || /[\u0000-\u001f\u007f]/.test(path)) return null;
  // Staff browsing the admin panel would otherwise dominate a small site's numbers.
  if (path === '/admin' || path.startsWith('/admin/')) return null;
  return { locale: match[1] as PageViewTarget['locale'], path };
}

export function analyticsDay(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ANALYTICS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function shiftDay(day: string, deltaDays: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + deltaDays);
  return date.toISOString().slice(0, 10);
}

export function isAnalyticsDay(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && shiftDay(value, 0) === value;
}
