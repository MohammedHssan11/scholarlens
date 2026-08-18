/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  SCHOLARLENS — Section 5: Tests & Error Handling                   │
 * │  File: rate-limiter.ts                                              │
 * │  Owner: AlBaraa (AI & Backend Engineer)                             │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * In-memory sliding-window rate limiter.
 *
 * WHY IN-MEMORY (not Redis):
 *   For the MVP beta, an in-memory store is sufficient because:
 *     1. Single-server deployment (Vercel serverless functions share
 *        a warm instance for a short period, so this provides partial
 *        protection even in serverless).
 *     2. No external dependency to configure or pay for.
 *     3. Resets on server restart — acceptable for a beta.
 *
 *   LIMITATION: In a multi-instance deployment, each instance has its
 *   own counter. A production system would use Redis or Upstash.
 *
 * DESIGN:
 *   Sliding window — tracks individual request timestamps per client IP.
 *   Expired entries are pruned on every check to prevent memory leaks.
 */

/** Configuration for the rate limiter. */
interface RateLimiterConfig {
  /** Maximum requests allowed within the time window. */
  maxRequests: number;
  /** Time window duration in milliseconds. */
  windowMs: number;
}

/** Result of a rate limit check. */
export interface RateLimitResult {
  /** Whether the request is allowed. */
  allowed: boolean;
  /** Number of remaining requests in the current window. */
  remaining: number;
  /** Seconds until the window resets (for Retry-After header). */
  retryAfterSeconds: number;
}

/**
 * Sliding-window rate limiter.
 *
 * Usage:
 *   const limiter = new RateLimiter({ maxRequests: 10, windowMs: 60_000 });
 *   const result = limiter.check(clientIp);
 *   if (!result.allowed) return 429;
 */
export class RateLimiter {
  /**
   * Map of client IP → array of request timestamps (ms).
   * Timestamps older than windowMs are pruned on each check.
   */
  private readonly store = new Map<string, number[]>();

  private readonly config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  /**
   * Check whether a request from `clientId` is allowed.
   *
   * SIDE EFFECT: If allowed, the current timestamp is recorded.
   * This means calling check() twice without a request between them
   * will consume two slots — only call it once per real request.
   *
   * @param clientId - Typically the client's IP address.
   * @returns Whether the request is allowed and rate limit metadata.
   */
  check(clientId: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing timestamps, prune expired ones
    const timestamps = (this.store.get(clientId) ?? []).filter(
      (t) => t > windowStart,
    );

    if (timestamps.length >= this.config.maxRequests) {
      // Rate limit exceeded — calculate when the oldest entry expires
      const oldestTimestamp = timestamps[0];
      const retryAfterMs = oldestTimestamp + this.config.windowMs - now;

      // Update store with pruned timestamps (don't add the rejected request)
      this.store.set(clientId, timestamps);

      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
      };
    }

    // Allowed — record this request
    timestamps.push(now);
    this.store.set(clientId, timestamps);

    return {
      allowed: true,
      remaining: this.config.maxRequests - timestamps.length,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Clear all stored rate limit data.
   * Useful for testing.
   */
  reset(): void {
    this.store.clear();
  }
}

// ─── Default Instance ────────────────────────────────────────────────────────

/**
 * Default rate limiter: 10 requests per minute per IP.
 *
 * Shared across all route handlers via import. Since this is module-scoped,
 * it persists as long as the serverless function instance is warm.
 */
export const apiRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60_000, // 1 minute
});
