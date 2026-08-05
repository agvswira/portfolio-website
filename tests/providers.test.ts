import { describe, expect, it, vi } from "vitest";

import { createAiStreamer, createResendSender } from "../src/server/providers";

describe("Resend provider", () => {
  it("sends the validated message without exposing credentials in content", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    const sender = createResendSender(
      {
        apiKey: "resend-secret",
        from: "Portfolio <portfolio@example.com>",
        to: "owner@example.com",
      },
      fetcher
    );

    await expect(
      sender(
        { name: "Wira", email: "wira@example.com", message: "Halo dari pengunjung." },
        new AbortController().signal
      )
    ).resolves.toEqual({ ok: true });
    const [, init] = fetcher.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({ Authorization: "Bearer resend-secret" });
    expect(JSON.parse(String(init.body))).toMatchObject({
      from: "Portfolio <portfolio@example.com>",
      to: "owner@example.com",
      reply_to: "wira@example.com",
    });
  });

  it("maps a rejected provider response to a safe failure", async () => {
    const sender = createResendSender(
      { apiKey: "key", from: "from@example.com", to: "to@example.com" },
      vi.fn().mockResolvedValue(new Response("provider detail", { status: 400 }))
    );

    await expect(
      sender(
        { name: "Wira", email: "wira@example.com", message: "Halo dari pengunjung." },
        new AbortController().signal
      )
    ).resolves.toEqual({ ok: false, status: 502 });
  });
});

describe("AI provider", () => {
  it("requests an OpenAI-compatible streaming response", async () => {
    const upstream = new Response("data: [DONE]\n\n", {
      headers: { "content-type": "text/event-stream" },
    });
    const fetcher = vi.fn().mockResolvedValue(upstream);
    const stream = createAiStreamer(
      {
        apiKey: "ai-secret",
        baseUrl: "https://ai.example.test/v1/",
        model: "test-model",
        systemPrompt: "Stay on portfolio topics.",
      },
      fetcher
    );

    await expect(
      stream([{ role: "user", content: "Halo" }], new AbortController().signal)
    ).resolves.toBe(upstream);
    const [url, init] = fetcher.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://ai.example.test/v1/chat/completions");
    expect(JSON.parse(String(init.body))).toMatchObject({
      model: "test-model",
      stream: true,
      messages: [
        { role: "system", content: "Stay on portfolio topics." },
        { role: "user", content: "Halo" },
      ],
    });
  });
});
