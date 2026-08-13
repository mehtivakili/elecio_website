import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
export const STAFF_INTERNAL_HEADER = 'x-elecio-staff-auth';
function secret() { const value = process.env.BETTER_AUTH_SECRET; if (!value || value.length < 32) throw new Error('BETTER_AUTH_SECRET is not configured safely.'); return value; }
function internalValue() { return createHmac('sha256', secret()).update('elecio:staff-auth-gateway:v1').digest('hex'); }
export function staffInternalHeaders(source?: Headers) { const result = new Headers(source); result.set(STAFF_INTERNAL_HEADER, internalValue()); return result; }
export function hasStaffInternalHeader(source?: Headers) { const supplied = source?.get(STAFF_INTERNAL_HEADER); const expected = internalValue(); return Boolean(supplied && supplied.length === expected.length && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))); }
