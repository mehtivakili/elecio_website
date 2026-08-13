import { createHash, randomBytes } from 'node:crypto';
export function createInvitationToken() { return randomBytes(32).toString('base64url'); }
export function hashInvitationToken(token: string) { return createHash('sha256').update(token).digest('hex'); }
export function strongPassword(value: string) { return value.length >= 14 && value.length <= 128 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value); }
