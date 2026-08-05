import { jsonResponse, mediaType, readRequestBody } from "./http";
import {
  createRateLimitKey,
  rateLimitHeaders,
  type RateLimitCheck,
  type RateLimitResult,
} from "./rate-limit";
import { parseContactPayload, type ContactMessage } from "./validation";

const MAX_CONTACT_BYTES = 8 * 1_024;

export type ContactDeliveryResult = { ok: true } | { ok: false; status: 502 | 503 };

export interface ContactDependencies {
  salt: string;
  environment: string;
  rateLimit: RateLimitCheck;
  sendContact:
    | ((message: ContactMessage, signal: AbortSignal) => Promise<ContactDeliveryResult>)
    | null;
}

function redirectToContact(
  request: Request,
  state: "success" | "error",
  headers?: HeadersInit
): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("location", new URL(`/#contact-${state}`, request.url).href);
  responseHeaders.set("cache-control", "no-store");
  return new Response(null, { status: 303, headers: responseHeaders });
}

function errorResponse(
  request: Request,
  isNativeForm: boolean,
  error: string,
  status: number,
  headers?: HeadersInit
): Response {
  return isNativeForm
    ? redirectToContact(request, "error", headers)
    : jsonResponse({ error }, status, headers);
}

async function enforceRateLimit(
  request: Request,
  deps: ContactDependencies
): Promise<RateLimitResult> {
  if (!deps.salt) throw new Error("RATE_LIMIT_SALT is missing");
  const key = await createRateLimitKey(request.headers, deps.salt, deps.environment, "contact");
  return deps.rateLimit(key);
}

export async function handleContactRequest(
  request: Request,
  deps: ContactDependencies
): Promise<Response> {
  const type = mediaType(request);
  const isNativeForm = type === "application/x-www-form-urlencoded";
  if (type !== "application/json" && !isNativeForm) {
    return jsonResponse({ error: "Content-Type tidak didukung." }, 415);
  }

  let rateLimit: RateLimitResult;
  try {
    rateLimit = await enforceRateLimit(request, deps);
  } catch {
    return errorResponse(request, isNativeForm, "Layanan sedang tidak tersedia.", 503);
  }
  const limitHeaders = rateLimitHeaders(rateLimit);
  if (!rateLimit.success) {
    return errorResponse(
      request,
      isNativeForm,
      "Terlalu banyak permintaan. Coba lagi nanti.",
      429,
      limitHeaders
    );
  }

  const body = await readRequestBody(request, MAX_CONTACT_BYTES);
  if (!body.ok) {
    return errorResponse(request, isNativeForm, body.error, body.status, limitHeaders);
  }

  let rawPayload: unknown;
  try {
    rawPayload = isNativeForm
      ? Object.fromEntries(new URLSearchParams(body.text))
      : (JSON.parse(body.text) as unknown);
  } catch {
    return errorResponse(request, isNativeForm, "Request tidak valid.", 400, limitHeaders);
  }

  const payload = parseContactPayload(rawPayload);
  if (!payload.ok) {
    return errorResponse(request, isNativeForm, payload.error, 400, limitHeaders);
  }
  if (!deps.sendContact) {
    return errorResponse(
      request,
      isNativeForm,
      "Form kontak sedang tidak tersedia.",
      503,
      limitHeaders
    );
  }

  let delivery: ContactDeliveryResult;
  try {
    delivery = await deps.sendContact(payload.data, request.signal);
  } catch (error) {
    if (request.signal.aborted) throw error;
    delivery = { ok: false, status: 502 };
  }
  if (!delivery.ok) {
    const message =
      delivery.status === 503 ? "Form kontak sedang tidak tersedia." : "Gagal mengirim email.";
    return errorResponse(request, isNativeForm, message, delivery.status, limitHeaders);
  }

  if (isNativeForm) return redirectToContact(request, "success", limitHeaders);
  return jsonResponse({ success: true }, 200, limitHeaders);
}
