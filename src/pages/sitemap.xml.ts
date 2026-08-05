import type { APIRoute } from "astro";

const routes = [
  "/",
  "/blog",
  "/blog/awal-perjalanan-masuk-informatika",
  "/blog/mulai-mencatat-dengan-obsidian",
  "/projects/botpass",
  "/projects/eling-bot",
  "/projects/portfolio-website",
];

export const GET: APIRoute = () => {
  const urls = routes
    .map((route) => `<url><loc>${new URL(route, "https://aguswira.dev")}</loc></url>`)
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    }
  );
};
