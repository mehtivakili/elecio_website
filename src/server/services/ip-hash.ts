import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';

export function requestIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

/** Lightweight rate-limit/spam signal, not an identity store — never persist the raw IP. */
export function hashRequestIp(request: NextRequest): string {
  return createHash('sha256').update(requestIp(request)).digest('hex').slice(0, 16);
}
