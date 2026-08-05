import type { APIRoute } from "astro";

import { CHATBOT_SYSTEM_PROMPT } from "../../lib/constants";
import { handleChatRequest } from "../../server/chat";
import { createAiStreamer } from "../../server/providers";
import { createUpstashRateLimit, type RateLimitCheck } from "../../server/rate-limit";

export const prerender = false;

let rateLimit: RateLimitCheck | undefined;

function getRateLimit(): RateLimitCheck {
  if (rateLimit) return rateLimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  rateLimit =
    url && token
      ? createUpstashRateLimit(url, token, 20)
      : async () => {
          throw new Error("Rate-limit service is not configured");
        };
  return rateLimit;
}

export const POST: APIRoute = ({ request }) => {
  const apiKey = process.env.AI_API_KEY;
  const streamChat = apiKey
    ? createAiStreamer({
        apiKey,
        baseUrl: process.env.AI_BASE_URL ?? "https://api.openai.com/v1",
        model: process.env.AI_MODEL ?? "gpt-4o-mini",
        systemPrompt: CHATBOT_SYSTEM_PROMPT,
      })
    : null;

  return handleChatRequest(request, {
    salt: process.env.RATE_LIMIT_SALT ?? "",
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    rateLimit: getRateLimit(),
    streamChat,
  });
};
