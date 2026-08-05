import type { APIRoute } from "astro";

import { handleContactRequest } from "../../server/contact";
import { createResendSender } from "../../server/providers";
import { createUpstashRateLimit, type RateLimitCheck } from "../../server/rate-limit";

export const prerender = false;

let rateLimit: RateLimitCheck | undefined;

function getRateLimit(): RateLimitCheck {
  if (rateLimit) return rateLimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  rateLimit =
    url && token
      ? createUpstashRateLimit(url, token, 5)
      : async () => {
          throw new Error("Rate-limit service is not configured");
        };
  return rateLimit;
}

export const POST: APIRoute = ({ request }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_EMAIL;
  const sendContact = apiKey && from && to ? createResendSender({ apiKey, from, to }) : null;

  return handleContactRequest(request, {
    salt: process.env.RATE_LIMIT_SALT ?? "",
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    rateLimit: getRateLimit(),
    sendContact,
  });
};
