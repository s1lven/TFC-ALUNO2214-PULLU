// Sliding-window in-memory rate limiter keyed by an arbitrary string.
// Resets on cold starts (serverless) — sufficient for catching rapid
// button-click abuse within a warm instance.

const windows = new Map<string, number[]>();

/**
 * Returns true if the request is allowed, false if it should be blocked.
 * @param key      Unique key, e.g. `translate:${userId}`
 * @param limit    Max requests allowed within the window
 * @param windowMs Window size in milliseconds (default: 60 000 = 1 minute)
 */
export function checkRateLimit(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const hits = (windows.get(key) ?? []).filter((t) => t > cutoff);
  if (hits.length >= limit) {
    windows.set(key, hits);
    return false;
  }
  hits.push(now);
  windows.set(key, hits);
  return true;
}
