import { describe, it, expect, vi, afterEach } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

afterEach(() => {
  vi.useRealTimers();
});

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test:${Math.random()}`;
    expect(checkRateLimit(key, 5)).toBe(true);
    expect(checkRateLimit(key, 5)).toBe(true);
    expect(checkRateLimit(key, 5)).toBe(true);
  });

  it("blocks the request that exceeds the limit", () => {
    const key = `test:${Math.random()}`;
    checkRateLimit(key, 3);
    checkRateLimit(key, 3);
    checkRateLimit(key, 3);
    // 4th request should be blocked
    expect(checkRateLimit(key, 3)).toBe(false);
  });

  it("allows exactly 'limit' requests before blocking", () => {
    const key = `test:${Math.random()}`;
    const limit = 10;
    for (let i = 0; i < limit; i++) {
      expect(checkRateLimit(key, limit)).toBe(true);
    }
    expect(checkRateLimit(key, limit)).toBe(false);
  });

  it("uses separate counters per key", () => {
    const key1 = `test-a:${Math.random()}`;
    const key2 = `test-b:${Math.random()}`;
    checkRateLimit(key1, 1);
    // key1 is now blocked but key2 is untouched
    expect(checkRateLimit(key1, 1)).toBe(false);
    expect(checkRateLimit(key2, 1)).toBe(true);
  });

  it("allows requests again after the window expires", () => {
    vi.useFakeTimers();

    const key = `test:${Math.random()}`;
    checkRateLimit(key, 1);
    expect(checkRateLimit(key, 1)).toBe(false);

    // Advance time beyond the default 60-second window
    vi.advanceTimersByTime(61_000);

    expect(checkRateLimit(key, 1)).toBe(true);
  });

  it("respects a custom window size", () => {
    vi.useFakeTimers();

    const key = `test:${Math.random()}`;
    const windowMs = 5_000;

    checkRateLimit(key, 1, windowMs);
    expect(checkRateLimit(key, 1, windowMs)).toBe(false);

    vi.advanceTimersByTime(5_001);

    expect(checkRateLimit(key, 1, windowMs)).toBe(true);
  });
});
