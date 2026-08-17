/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  SCHOLARLENS — Section 5: Tests & Error Handling                   │
 * │  File: rate-limiter.test.ts                                         │
 * │  Owner: AlBaraa (AI & Backend Engineer)                             │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Unit tests for the in-memory rate limiter.
 *
 * WHAT THESE TESTS PROVE:
 *   - Requests within the limit are allowed.
 *   - Requests exceeding the limit are blocked with correct metadata.
 *   - Different client IPs have independent limits.
 *   - Expired entries are pruned correctly.
 *   - The reset() method clears all stored data.
 *
 * DETERMINISTIC: These tests use controlled time via vi.useFakeTimers().
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RateLimiter } from "../../src/lib/ai/rate-limiter";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    // 3 requests per 10 seconds for easy testing
    limiter = new RateLimiter({ maxRequests: 3, windowMs: 10_000 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within the limit", () => {
    const r1 = limiter.check("192.168.1.1");
    const r2 = limiter.check("192.168.1.1");
    const r3 = limiter.check("192.168.1.1");

    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests exceeding the limit", () => {
    limiter.check("192.168.1.1");
    limiter.check("192.168.1.1");
    limiter.check("192.168.1.1");

    const blocked = limiter.check("192.168.1.1");

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("different IPs have independent limits", () => {
    // Fill up limit for IP A
    limiter.check("192.168.1.1");
    limiter.check("192.168.1.1");
    limiter.check("192.168.1.1");

    // IP B should still be allowed
    const resultB = limiter.check("192.168.1.2");

    expect(resultB.allowed).toBe(true);
    expect(resultB.remaining).toBe(2);
  });

  it("allows requests again after the window expires", () => {
    limiter.check("192.168.1.1");
    limiter.check("192.168.1.1");
    limiter.check("192.168.1.1");

    // Should be blocked now
    expect(limiter.check("192.168.1.1").allowed).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(11_000);

    // Should be allowed again
    const result = limiter.check("192.168.1.1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("returns correct retryAfterSeconds", () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    limiter.check("192.168.1.1");

    vi.setSystemTime(new Date("2026-01-01T00:00:02Z"));
    limiter.check("192.168.1.1");

    vi.setSystemTime(new Date("2026-01-01T00:00:04Z"));
    limiter.check("192.168.1.1");

    vi.setSystemTime(new Date("2026-01-01T00:00:05Z"));
    const blocked = limiter.check("192.168.1.1");

    expect(blocked.allowed).toBe(false);
    // Oldest request at t=0, window is 10s, so retry after 10-5 = 5s
    expect(blocked.retryAfterSeconds).toBe(5);
  });

  it("reset() clears all stored data", () => {
    limiter.check("192.168.1.1");
    limiter.check("192.168.1.1");
    limiter.check("192.168.1.1");

    expect(limiter.check("192.168.1.1").allowed).toBe(false);

    limiter.reset();

    expect(limiter.check("192.168.1.1").allowed).toBe(true);
    expect(limiter.check("192.168.1.1").remaining).toBe(1);
  });
});
