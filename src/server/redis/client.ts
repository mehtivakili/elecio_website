import 'server-only';

import { createClient } from 'redis';

type ElecioRedisClient = ReturnType<typeof createClient>;

declare global {
  var __elecioRedis: ElecioRedisClient | undefined;
  var __elecioRedisConnecting: Promise<ElecioRedisClient> | undefined;
  var __elecioDevAuthStorage: Map<string, { value: string; expiresAt: number | null }> | undefined;
}

function isInsecureDevStorageEnabled(): boolean {
  return process.env.NODE_ENV === 'development' &&
    process.env.ALLOW_INSECURE_DEV_ADMIN === 'true' &&
    !process.env.REDIS_URL;
}

function devStorage() {
  globalThis.__elecioDevAuthStorage ??= new Map();
  return globalThis.__elecioDevAuthStorage;
}

function configuredClient(): ElecioRedisClient {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error('REDIS_URL is required for authentication and shared rate limiting.');
  }

  if (!globalThis.__elecioRedis) {
    const client = createClient({
      url,
      socket: {
        connectTimeout: 5_000,
        reconnectStrategy: (retries) => Math.min(retries * 100, 3_000),
      },
    });
    client.on('error', (error) => {
      console.error('[redis] connection error', { message: error.message });
    });
    globalThis.__elecioRedis = client;
  }

  return globalThis.__elecioRedis;
}

export async function getRedis(): Promise<ElecioRedisClient> {
  const client = configuredClient();
  if (client.isReady) return client;

  globalThis.__elecioRedisConnecting ??= client.connect().then(() => client);
  try {
    return await globalThis.__elecioRedisConnecting;
  } finally {
    globalThis.__elecioRedisConnecting = undefined;
  }
}

const namespace = process.env.REDIS_KEY_PREFIX?.trim() || 'elecio';
export const redisKey = (value: string) => `${namespace}:${value}`;

export const redisSecondaryStorage = {
  async get(storageKey: string): Promise<string | null> {
    if (isInsecureDevStorageEnabled()) {
      const entry = devStorage().get(redisKey(storageKey));
      if (!entry) return null;
      if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
        devStorage().delete(redisKey(storageKey));
        return null;
      }
      return entry.value;
    }
    return (await getRedis()).get(redisKey(storageKey));
  },
  async set(storageKey: string, value: string, ttl?: number): Promise<void> {
    if (isInsecureDevStorageEnabled()) {
      devStorage().set(redisKey(storageKey), {
        value,
        expiresAt: ttl && ttl > 0 ? Date.now() + Math.ceil(ttl) * 1000 : null,
      });
      return;
    }
    const redis = await getRedis();
    if (ttl && ttl > 0) {
      await redis.set(redisKey(storageKey), value, { EX: Math.ceil(ttl) });
      return;
    }
    await redis.set(redisKey(storageKey), value);
  },
  async delete(storageKey: string): Promise<void> {
    if (isInsecureDevStorageEnabled()) {
      devStorage().delete(redisKey(storageKey));
      return;
    }
    await (await getRedis()).del(redisKey(storageKey));
  },
};
