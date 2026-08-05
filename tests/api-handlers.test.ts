import { describe, expect, it, vi } from "vitest";

import { handleChatRequest } from "../src/server/chat";
import { handleContactRequest } from "../src/server/contact";
import type { RateLimitResult } from "../src/server/rate-limit";

const allowed: RateLimitResult = {
  success: true,
  limit: 5,
  remaining: 4,
  reset: Date.now() + 60_000,
};

function jsonRequest(path: string, body: unknown, signal?: AbortSignal): Request {
  return new Request(`https://portfolio.test${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-vercel-forwarded-for": "203.0.113.42",
    },
    body: JSON.stringify(body),
    signal,
  });
}

const contactPayload = {
  name: "Wira",
  email: "wira@example.com",
  message: "Halo, saya tertarik membahas proyek ini.",
};

const chatPayload = { messages: [{ role: "user", content: "Apa proyek utama Wira?" }] };

describe("contact API handler", () => {
  it("preserves the JSON success contract and rate-limit headers", async () => {
    const sendContact = vi.fn().mockResolvedValue({ ok: true });
    const response = await handleContactRequest(jsonRequest("/api/contact", contactPayload), {
      salt: "pepper",
      environment: "test",
      rateLimit: vi.fn().mockResolvedValue(allowed),
      sendContact,
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(response.headers.get("x-ratelimit-remaining")).toBe("4");
    expect(sendContact).toHaveBeenCalledWith(contactPayload, expect.any(AbortSignal));
  });

  it("supports the native form fallback with a 303 redirect", async () => {
    const nativeRequest = () =>
      new Request("https://portfolio.test/api/contact", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(contactPayload),
      });
    const response = await handleContactRequest(nativeRequest(), {
      salt: "pepper",
      environment: "test",
      rateLimit: vi.fn().mockResolvedValue(allowed),
      sendContact: vi.fn().mockResolvedValue({ ok: true }),
    });

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://portfolio.test/#contact-success");
    expect(response.headers.get("x-ratelimit-remaining")).toBe("4");

    const failed = await handleContactRequest(nativeRequest(), {
      salt: "pepper",
      environment: "test",
      rateLimit: vi.fn().mockResolvedValue(allowed),
      sendContact: vi.fn().mockResolvedValue({ ok: false, status: 502 }),
    });
    expect(failed.status).toBe(303);
    expect(failed.headers.get("location")).toBe("https://portfolio.test/#contact-error");
  });

  it("rejects unsupported media, oversized bodies, and validation failures", async () => {
    const deps = {
      salt: "pepper",
      environment: "test",
      rateLimit: vi.fn().mockResolvedValue(allowed),
      sendContact: vi.fn().mockResolvedValue({ ok: true } as const),
    };
    const unsupported = new Request("https://portfolio.test/api/contact", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "hello",
    });
    const oversized = jsonRequest("/api/contact", {
      ...contactPayload,
      message: "x".repeat(8_200),
    });

    expect((await handleContactRequest(unsupported, deps)).status).toBe(415);
    expect((await handleContactRequest(oversized, deps)).status).toBe(413);
    expect((await handleContactRequest(jsonRequest("/api/contact", null), deps)).status).toBe(400);
  });

  it("fails closed when Redis is unavailable and emits Retry-After when denied", async () => {
    const base = {
      salt: "pepper",
      environment: "test",
      sendContact: vi.fn().mockResolvedValue({ ok: true } as const),
    };
    const unavailable = await handleContactRequest(jsonRequest("/api/contact", contactPayload), {
      ...base,
      rateLimit: vi.fn().mockRejectedValue(new Error("redis offline")),
    });
    const denied = await handleContactRequest(jsonRequest("/api/contact", contactPayload), {
      ...base,
      rateLimit: vi.fn().mockResolvedValue({ ...allowed, success: false, remaining: 0 }),
    });

    expect(unavailable.status).toBe(503);
    expect(denied.status).toBe(429);
    expect(Number(denied.headers.get("retry-after"))).toBeGreaterThan(0);
  });

  it("maps provider failures without exposing their details", async () => {
    const response = await handleContactRequest(jsonRequest("/api/contact", contactPayload), {
      salt: "pepper",
      environment: "test",
      rateLimit: vi.fn().mockResolvedValue(allowed),
      sendContact: vi.fn().mockResolvedValue({ ok: false, status: 502 }),
    });

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: "Gagal mengirim email." });
  });
});

describe("chat API handler", () => {
  it("proxies a valid SSE stream with defensive headers", async () => {
    const streamChat = vi.fn().mockResolvedValue(
      new Response('data: {"choices":[{"delta":{"content":"Halo"}}]}\n\ndata: [DONE]\n\n', {
        headers: { "content-type": "text/event-stream; charset=utf-8" },
      })
    );
    const response = await handleChatRequest(jsonRequest("/api/chat", chatPayload), {
      salt: "pepper",
      environment: "test",
      rateLimit: vi.fn().mockResolvedValue({ ...allowed, limit: 20, remaining: 19 }),
      streamChat,
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(response.headers.get("x-accel-buffering")).toBe("no");
    expect(response.headers.get("x-ratelimit-limit")).toBe("20");
    expect(await response.text()).toContain("[DONE]");
  });

  it("rejects invalid payloads and malformed upstream responses", async () => {
    const cancel = vi.fn();
    const base = {
      salt: "pepper",
      environment: "test",
      rateLimit: vi.fn().mockResolvedValue(allowed),
    };
    const invalid = await handleChatRequest(jsonRequest("/api/chat", { messages: null }), {
      ...base,
      streamChat: vi.fn(),
    });
    const malformed = await handleChatRequest(jsonRequest("/api/chat", chatPayload), {
      ...base,
      streamChat: vi.fn().mockResolvedValue(
        new Response(
          new ReadableStream({
            cancel,
          })
        )
      ),
    });

    expect(invalid.status).toBe(400);
    expect(malformed.status).toBe(502);
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("returns 503 when the AI service is not configured", async () => {
    const response = await handleChatRequest(jsonRequest("/api/chat", chatPayload), {
      salt: "pepper",
      environment: "test",
      rateLimit: vi.fn().mockResolvedValue(allowed),
      streamChat: null,
    });

    expect(response.status).toBe(503);
  });

  it("does not swallow a client abort", async () => {
    const client = new AbortController();
    const streamChat = vi.fn((_messages, signal: AbortSignal) => {
      return new Promise<Response>((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      });
    });
    const pending = handleChatRequest(jsonRequest("/api/chat", chatPayload, client.signal), {
      salt: "pepper",
      environment: "test",
      rateLimit: vi.fn().mockResolvedValue(allowed),
      streamChat,
    });
    client.abort(new DOMException("Client disconnected", "AbortError"));

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
});
