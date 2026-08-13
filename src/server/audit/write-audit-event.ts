import 'server-only';

import { createHash, randomUUID } from 'node:crypto';
import { knex } from '@/server/db/knex';

const forbiddenMetadataKeys = /(?:password|passcode|otp|token|secret|authorization|cookie|api[_-]?key)/i;

export type AuditOutcome = 'success' | 'failure' | 'denied';
export type AuditEventInput = {
  actorUserId?: string | null;
  actorRole?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  outcome: AuditOutcome;
  requestId?: string;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
};

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[max-depth]';
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => redact(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 50)
        .map(([key, item]) => [key, forbiddenMetadataKeys.test(key) ? '[redacted]' : redact(item, depth + 1)])
    );
  }
  if (typeof value === 'string') return value.slice(0, 1_000);
  return value;
}

function hashIp(ipAddress: string | null | undefined): string | null {
  if (!ipAddress) return null;
  const salt = process.env.IP_HASH_SALT;
  if (!salt) return null;
  return createHash('sha256').update(`${salt}:${ipAddress}`).digest('hex');
}

export async function writeAuditEvent(input: AuditEventInput): Promise<string> {
  const id = randomUUID();
  await knex('audit_events').insert({
    id,
    actor_user_id: input.actorUserId ?? null,
    actor_role: input.actorRole ?? null,
    action: input.action,
    resource: input.resource,
    resource_id: input.resourceId ?? null,
    outcome: input.outcome,
    request_id: input.requestId ?? randomUUID(),
    ip_hash: hashIp(input.ipAddress),
    metadata: JSON.stringify(redact(input.metadata ?? {})),
  });
  return id;
}
