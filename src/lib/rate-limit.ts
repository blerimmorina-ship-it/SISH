// In-memory token bucket rate limiter. For production, swap to Redis/Upstash.

type Bucket = { tokens: number; updatedAt: number };
const buckets = new Map<string, Bucket>();

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, max = MAX_REQUESTS, windowMs = WINDOW_MS): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: max, updatedAt: now };
  const elapsed = now - bucket.updatedAt;
  const refill = Math.floor((elapsed / windowMs) * max);
  bucket.tokens = Math.min(max, bucket.tokens + refill);
  bucket.updatedAt = now;

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    buckets.set(key, bucket);
    return { allowed: true, remaining: bucket.tokens, resetAt: now + windowMs };
  }
  buckets.set(key, bucket);
  return { allowed: false, remaining: 0, resetAt: now + windowMs };
}

// Periodic cleanup
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - WINDOW_MS * 4;
    for (const [k, b] of buckets) {
      if (b.updatedAt < cutoff) buckets.delete(k);
    }
  }, WINDOW_MS);
}
