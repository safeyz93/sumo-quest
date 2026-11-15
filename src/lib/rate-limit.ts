import { HttpError } from "@/lib/http";

type Bucket = { count: number; resetAt: number };

/**
 * Tiny in-memory rate limiter. Good enough for a single-instance MVP.
 * If this app is deployed to multiple serverless instances, move the state to
 * Redis / Upstash and keep the same interface.
 */
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5_000;

function pruneExpired(now: number) {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function consume(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    pruneExpired(now);
    return { ok: true as const, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false as const,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return {
    ok: true as const,
    remaining: limit - bucket.count,
    retryAfter: 0,
  };
}

export function enforceRateLimit(
  identity: string,
  scope: string,
  limit: number,
  windowMs: number,
): void {
  const result = consume(`${scope}:${identity}`, limit, windowMs);
  if (!result.ok) {
    throw new HttpError(
      429,
      `Too many requests. Try again in ${result.retryAfter}s.`,
      "RATE_LIMITED",
      { "Retry-After": String(result.retryAfter) },
    );
  }
}
