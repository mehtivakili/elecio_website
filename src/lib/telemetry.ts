export const CONVERSION_EVENTS = [
  'contact_submitted',
  'download_requested',
  'order_clicked',
  'account_signed_in',
  'article_product_interest',
] as const;

export type ConversionEvent = typeof CONVERSION_EVENTS[number];
export const ANALYTICS_CONSENT_KEY = 'elecio-analytics-consent';

export function isConversionEvent(value: unknown): value is ConversionEvent {
  return typeof value === 'string' && CONVERSION_EVENTS.includes(value as ConversionEvent);
}

export function recordConversion(event: ConversionEvent, locale: string): void {
  if (typeof window === 'undefined' || window.localStorage.getItem(ANALYTICS_CONSENT_KEY) !== 'granted') return;
  void fetch('/api/telemetry/conversion', {
    method: 'POST',
    credentials: 'omit',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, locale: locale === 'en' ? 'en' : 'fa' }),
  }).catch(() => undefined);
}

// Page visits are counted cookielessly for everyone except visitors who chose "Necessary only".
export function sendPageView(path: string): void {
  if (typeof window === 'undefined' || window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'denied') return;
  void fetch('/api/telemetry/pageview', {
    method: 'POST',
    credentials: 'omit',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  }).catch(() => undefined);
}
