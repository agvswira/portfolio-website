import type { ContactDeliveryResult } from "./contact";
import { requestWithTimeout, type FetchLike } from "./http";
import type { ContactMessage, ChatMessage } from "./validation";

interface ResendConfig {
  apiKey: string;
  from: string;
  to: string;
}

interface AiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  systemPrompt: string;
}

export function createResendSender(config: ResendConfig, fetcher: FetchLike = fetch) {
  return async (
    message: ContactMessage,
    clientSignal: AbortSignal
  ): Promise<ContactDeliveryResult> => {
    const response = await requestWithTimeout(
      fetcher,
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          from: config.from,
          to: config.to,
          reply_to: message.email,
          subject: `[Portfolio] Pesan dari ${message.name}`,
          text: `Dari: ${message.name} <${message.email}>\n\n${message.message}`,
        }),
      },
      10_000,
      clientSignal
    );
    return response.ok ? { ok: true } : { ok: false, status: 502 };
  };
}

export function createAiStreamer(config: AiConfig, fetcher: FetchLike = fetch) {
  return (messages: ChatMessage[], clientSignal: AbortSignal): Promise<Response> => {
    const baseUrl = config.baseUrl.replace(/\/+$/, "");
    return requestWithTimeout(
      fetcher,
      `${baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          stream: true,
          max_tokens: 512,
          messages: [{ role: "system", content: config.systemPrompt }, ...messages],
        }),
      },
      60_000,
      clientSignal
    );
  };
}
