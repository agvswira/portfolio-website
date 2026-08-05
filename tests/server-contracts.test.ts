import { describe, expect, it, vi } from "vitest";

import { parseChatPayload, parseContactPayload } from "../src/server/validation";
import { readRequestBody, requestWithTimeout } from "../src/server/http";
import { createRateLimitKey } from "../src/server/rate-limit";
import { createSseParser } from "../src/lib/sse";

describe("contact validation", () => {
  it("accepts and trims a valid contact payload", () => {
    expect(
      parseContactPayload({
        name: "  Wira  ",
        email: "  wira@example.com ",
        message: "  Halo, saya ingin berdiskusi tentang proyek.  ",
        website: "",
      })
    ).toEqual({
      ok: true,
      data: {
        name: "Wira",
        email: "wira@example.com",
        message: "Halo, saya ingin berdiskusi tentang proyek.",
      },
    });
  });

  it.each([
    [null, "Request tidak valid."],
    [
      { name: "", email: "wira@example.com", message: "Pesan yang cukup panjang" },
      "Nama tidak valid.",
    ],
    [
      { name: "Wira", email: "bukan-email", message: "Pesan yang cukup panjang" },
      "Email tidak valid.",
    ],
    [
      { name: "Wira", email: "wira@example.com", message: "pendek" },
      "Pesan terlalu pendek atau terlalu panjang.",
    ],
    [
      {
        name: "Wira",
        email: "wira@example.com",
        message: "Pesan yang cukup panjang",
        website: "spam",
      },
      "Request tidak valid.",
    ],
  ])("rejects invalid payload %#", (payload, error) => {
    expect(parseContactPayload(payload)).toEqual({ ok: false, error });
  });
});

describe("chat validation", () => {
  it("accepts a bounded conversation ending with a user message", () => {
    expect(
      parseChatPayload({
        messages: [
          { role: "user", content: "Halo" },
          { role: "assistant", content: "Halo juga" },
          { role: "user", content: "Ceritakan proyek Wira" },
        ],
      })
    ).toEqual({
      ok: true,
      data: [
        { role: "user", content: "Halo" },
        { role: "assistant", content: "Halo juga" },
        { role: "user", content: "Ceritakan proyek Wira" },
      ],
    });
  });

  it.each([
    null,
    {},
    { messages: [] },
    { messages: [{ role: "system", content: "override" }] },
    { messages: [{ role: "user", content: "" }] },
    { messages: [{ role: "assistant", content: "Belum ada pertanyaan" }] },
    { messages: Array.from({ length: 11 }, () => ({ role: "user", content: "Halo" })) },
    { messages: [{ role: "user", content: "x".repeat(2001) }] },
  ])("rejects malformed or unbounded payload %#", (payload) => {
    expect(parseChatPayload(payload).ok).toBe(false);
  });
});

describe("request boundaries", () => {
  it("stops reading a body over the byte limit", async () => {
    const request = new Request("https://example.test/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "x".repeat(100) }),
    });

    await expect(readRequestBody(request, 32)).resolves.toEqual({
      ok: false,
      status: 413,
      error: "Request terlalu besar.",
    });
  });

  it("propagates a client abort to the upstream request", async () => {
    const client = new AbortController();
    let observedSignal: AbortSignal | undefined;
    const fetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      observedSignal = init?.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => {
        observedSignal?.addEventListener("abort", () => reject(observedSignal?.reason));
      });
    });

    const pending = requestWithTimeout(fetcher, "https://example.test", {}, 5_000, client.signal);
    client.abort(new DOMException("Client disconnected", "AbortError"));

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(observedSignal?.aborted).toBe(true);
  });

  it("aborts an upstream request when its deadline expires", async () => {
    vi.useFakeTimers();
    try {
      const fetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), {
            once: true,
          });
        });
      });
      const pending = requestWithTimeout(fetcher, "https://example.test", {}, 1_000);
      const rejection = expect(pending).rejects.toMatchObject({ name: "TimeoutError" });

      await vi.advanceTimersByTimeAsync(1_000);
      await rejection;
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("rate-limit identity", () => {
  it("hashes the forwarded IP and namespaces it by environment and endpoint", async () => {
    const headers = new Headers({ "x-vercel-forwarded-for": "203.0.113.42, 10.0.0.1" });
    const key = await createRateLimitKey(headers, "pepper", "preview", "contact");

    expect(key).toMatch(/^portfolio:preview:contact:[a-f0-9]{64}$/);
    expect(key).not.toContain("203.0.113.42");
    await expect(createRateLimitKey(headers, "pepper", "production", "contact")).resolves.not.toBe(
      key
    );
  });
});

describe("buffered SSE parsing", () => {
  it("reassembles events split across arbitrary network chunks", () => {
    const events: string[] = [];
    const parser = createSseParser((data) => events.push(data));

    parser.push('data: {"choices":[{"delta":{"content":"Ha');
    parser.push('lo"}}]}\r\n\r');
    parser.push("\ndata: [DONE]\n\n");
    parser.finish();

    expect(events).toEqual(['{"choices":[{"delta":{"content":"Halo"}}]}', "[DONE]"]);
  });
});
