/**
 * Minimal in-memory fixed-window rate limiter. Deliberately not Redis-backed — this app runs as
 * a single Node process (doc/plan.md D2/D8), so a process-local Map is sufficient for v1 and
 * avoids adding infrastructure for a problem we don't have yet. If this ever runs as multiple
 * instances behind a load balancer, this stops being correct and needs a shared store.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, { limit = 5, windowMs = 60_000 } = {}): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}
