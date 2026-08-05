import { jsonResponse, mediaType, readRequestBody } from "./http";
import {
  createRateLimitKey,
  rateLimitHeaders,
  type RateLimitCheck,
  type RateLimitResult,
} from "./rate-limit";
import { parseChatPayload, type ChatMessage } from "./validation";

const MAX_CHAT_BYTES = 25 * 1_024;

export interface ChatDependencies {
  salt: string;
  environment: string;
  rateLimit: RateLimitCheck;
  streamChat: ((messages: ChatMessage[], signal: AbortSignal) => Promise<Response>) | null;
}

async function enforceRateLimit(
  request: Request,
  deps: ChatDependencies
): Promise<RateLimitResult> {
  if (!deps.salt) throw new Error("RATE_LIMIT_SALT is missing");
  const key = await createRateLimitKey(request.headers, deps.salt, deps.environment, "chat");
  return deps.rateLimit(key);
}

export async function handleChatRequest(
  request: Request,
  deps: ChatDependencies
): Promise<Response> {
  if (mediaType(request) !== "application/json") {
    return jsonResponse({ error: "Content-Type tidak didukung." }, 415);
  }

  let rateLimit: RateLimitResult;
  try {
    rateLimit = await enforceRateLimit(request, deps);
  } catch {
    return jsonResponse({ error: "Layanan sedang tidak tersedia." }, 503);
  }
  const limitHeaders = rateLimitHeaders(rateLimit);
  if (!rateLimit.success) {
    return jsonResponse(
      { error: "Terlalu banyak permintaan. Coba lagi nanti." },
      429,
      limitHeaders
    );
  }

  const body = await readRequestBody(request, MAX_CHAT_BYTES);
  if (!body.ok) return jsonResponse({ error: body.error }, body.status, limitHeaders);

  let rawPayload: unknown;
  try {
    rawPayload = JSON.parse(body.text) as unknown;
  } catch {
    return jsonResponse({ error: "Request tidak valid." }, 400, limitHeaders);
  }
  const payload = parseChatPayload(rawPayload);
  if (!payload.ok) return jsonResponse({ error: payload.error }, 400, limitHeaders);
  if (!deps.streamChat) {
    return jsonResponse({ error: "Chat sedang tidak tersedia." }, 503, limitHeaders);
  }
  if (request.signal.aborted) throw request.signal.reason;

  let upstream: Response;
  try {
    upstream = await deps.streamChat(payload.data, request.signal);
  } catch (error) {
    if (request.signal.aborted) throw error;
    return jsonResponse({ error: "Gagal menghubungi AI." }, 502, limitHeaders);
  }

  const contentType = upstream.headers.get("content-type")?.toLowerCase() ?? "";
  if (!upstream.ok || !upstream.body || !contentType.includes("text/event-stream")) {
    return jsonResponse({ error: "Respons AI tidak valid." }, 502, limitHeaders);
  }

  const headers = new Headers(limitHeaders);
  headers.set("content-type", "text/event-stream; charset=utf-8");
  headers.set("cache-control", "no-cache, no-store");
  headers.set("x-accel-buffering", "no");
  return new Response(upstream.body, { status: 200, headers });
}
