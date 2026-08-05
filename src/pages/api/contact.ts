import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = () =>
  Response.json({ error: "Endpoint sedang dimigrasikan." }, { status: 503 });
