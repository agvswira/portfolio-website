interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store — resets on server restart, not multi-instance safe
const store = new Map<string, RateLimitEntry>();

/**
 * @param ip      Client identifier (IP address)
 * @param limit   Max requests allowed per window
 * @param windowMs Window duration in milliseconds
 * @returns true if the request is allowed, false if rate-limited
 */
export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}
