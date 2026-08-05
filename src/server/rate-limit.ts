import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const encoder = new TextEncoder();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export type RateLimitCheck = (key: string) => Promise<RateLimitResult>;

export async function createRateLimitKey(
  headers: Headers,
  salt: string,
  environment: string,
  endpoint: "contact" | "chat"
): Promise<string> {
  const forwarded =
    headers.get("x-vercel-forwarded-for") ?? headers.get("x-forwarded-for") ?? "unknown";
  const client = forwarded.split(",", 1)[0]?.trim() || "unknown";
  const source = `${salt}:${environment}:${endpoint}:${client}`;
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(source));
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return `portfolio:${environment}:${endpoint}:${hash}`;
}

export function createUpstashRateLimit(
  url: string,
  token: string,
  requests: number
): RateLimitCheck {
  const ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(requests, "1 m"),
    prefix: "ratelimit",
    analytics: false,
    timeout: 3_000,
  });

  return async (key) => {
    const result = await ratelimit.limit(key);
    if (result.reason === "timeout") throw new Error("Rate-limit store timed out");
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  };
}

export function rateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers({
    "x-ratelimit-limit": String(result.limit),
    "x-ratelimit-remaining": String(Math.max(0, result.remaining)),
    "x-ratelimit-reset": String(Math.ceil(result.reset / 1_000)),
  });
  if (!result.success) {
    headers.set("retry-after", String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1_000))));
  }
  return headers;
}
