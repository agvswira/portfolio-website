import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";

import { handleContactRequest } from "../../server/contact";
import { createResendSender } from "../../server/providers";
import { createUpstashRateLimit, type RateLimitCheck } from "../../server/rate-limit";

export const prerender = false;

let rateLimit: RateLimitCheck | undefined;

function getRateLimit(): RateLimitCheck {
  if (rateLimit) return rateLimit;
  const url = getSecret("UPSTASH_REDIS_REST_URL");
  const token = getSecret("UPSTASH_REDIS_REST_TOKEN");
  rateLimit =
    url && token
      ? createUpstashRateLimit(url, token, 5)
      : async () => {
          throw new Error("Rate-limit service is not configured");
        };
  return rateLimit;
}

export const POST: APIRoute = ({ request }) => {
  const apiKey = getSecret("RESEND_API_KEY");
  const from = getSecret("CONTACT_FROM_EMAIL");
  const to = getSecret("CONTACT_EMAIL");
  const sendContact = apiKey && from && to ? createResendSender({ apiKey, from, to }) : null;

  return handleContactRequest(request, {
    salt: getSecret("RATE_LIMIT_SALT") ?? "",
    environment: getSecret("VERCEL_ENV") ?? getSecret("NODE_ENV") ?? "development",
    rateLimit: getRateLimit(),
    sendContact,
  });
};
