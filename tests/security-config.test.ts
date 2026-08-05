import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

interface VercelConfig {
  headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
}

describe("Vercel security headers", () => {
  it("defines a hash-based CSP and the full defensive header set", () => {
    const config = JSON.parse(
      readFileSync(resolve(process.cwd(), "vercel.json"), "utf8")
    ) as VercelConfig;
    const global = config.headers.find(({ source }) => source === "/(.*)");
    const headers = new Map(global?.headers.map(({ key, value }) => [key.toLowerCase(), value]));
    const csp = headers.get("content-security-policy") ?? "";

    expect(csp).toContain("script-src 'self' 'sha256-");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp.match(/script-src[^;]*/)?.[0]).not.toContain("'unsafe-inline'");

    expect(headers.get("strict-transport-security")).toContain("max-age=63072000");
    expect(headers.get("x-content-type-options")).toBe("nosniff");
    expect(headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("permissions-policy")).toContain("camera=()");
    expect(headers.get("cross-origin-opener-policy")).toBe("same-origin");
    expect(headers.get("x-frame-options")).toBe("DENY");
  });
});
