import 'server-only';

import { getRedis, redisKey } from '@/server/redis/client';

declare global {
  var __elecioDevRateLimits: Map<string, { count: number; expiresAt: number }> | undefined;
}

export type SharedRateLimitPolicy = {
  limit: number;
  windowSeconds: number;
};

export type SharedRateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export async function consumeSharedRateLimit(
  bucket: string,
  discriminator: string,
  policy: SharedRateLimitPolicy
): Promise<SharedRateLimitResult> {
  if (!Number.isInteger(policy.limit) || policy.limit < 1) {
    throw new TypeError('Rate-limit policy.limit must be a positive integer.');
  }
  if (!Number.isInteger(policy.windowSeconds) || policy.windowSeconds < 1) {
    throw new TypeError('Rate-limit policy.windowSeconds must be a positive integer.');
  }

  const normalizedBucket = bucket.replace(/[^a-z0-9:_-]/gi, '_').toLowerCase();
  const normalizedDiscriminator = discriminator.trim().toLowerCase();
  const storageKey = redisKey(`abuse:${normalizedBucket}:${normalizedDiscriminator}`);
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.ALLOW_INSECURE_DEV_ADMIN === 'true' &&
    !process.env.REDIS_URL
  ) {
    globalThis.__elecioDevRateLimits ??= new Map();
    const now = Date.now();
    const current = globalThis.__elecioDevRateLimits.get(storageKey);
    const entry = !current || current.expiresAt <= now
      ? { count: 1, expiresAt: now + policy.windowSeconds * 1000 }
      : { ...current, count: current.count + 1 };
    globalThis.__elecioDevRateLimits.set(storageKey, entry);
    return {
      allowed: entry.count <= policy.limit,
      remaining: Math.max(0, policy.limit - entry.count),
      retryAfterSeconds: Math.max(1, Math.ceil((entry.expiresAt - now) / 1000)),
    };
  }

  const redis = await getRedis();
  const result = await redis.eval(
    `
      local count = redis.call('INCR', KEYS[1])
      if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
      local ttl = redis.call('TTL', KEYS[1])
      return {count, ttl}
    `,
    { keys: [storageKey], arguments: [String(policy.windowSeconds)] }
  );
  const [rawCount, rawTtl] = result as [number, number];
  const count = Number(rawCount);
  const ttl = Number(rawTtl);
  const retryAfterSeconds = ttl > 0 ? ttl : policy.windowSeconds;
  return {
    allowed: count <= policy.limit,
    remaining: Math.max(0, policy.limit - count),
    retryAfterSeconds,
  };
}
