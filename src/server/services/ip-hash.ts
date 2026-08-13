import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';

/** Lightweight rate-limit/spam signal, not an identity store — never persist the raw IP. */
export function hashRequestIp(request: NextRequest): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}
