import type { NextRequest } from "next/server";

/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Good enough for a single-instance deployment (and as a first line of
 * defense on serverless — each instance keeps its own counters).
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets (0 when allowed). */
  retryAfterSec: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  // opportunistic cleanup of expired entries (keeps memory bounded)
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.resetAt < now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

/** Best-effort client IP behind the gateway/proxy. */
export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "local";
}
