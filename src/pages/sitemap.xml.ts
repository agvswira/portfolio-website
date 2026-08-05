import type { APIRoute } from "astro";

import { getBlogPosts, getProjects } from "@/lib/content";
import { SITE } from "@/lib/constants";

function sitemapUrl(path: string, updatedDate: Date): string {
  const location = new URL(path, SITE.url).toString();
  return `<url><loc>${location}</loc><lastmod>${updatedDate.toISOString()}</lastmod></url>`;
}

export const GET: APIRoute = async () => {
  const [posts, projects] = await Promise.all([getBlogPosts(), getProjects()]);
  const contentDates = [
    ...posts.map((post) => post.data.updatedDate ?? post.data.date),
    ...projects.map((project) => project.data.updatedDate),
  ];
  const homepageDate = new Date(Math.max(...contentDates.map((date) => date.getTime())));
  const urls = [
    sitemapUrl("/", homepageDate),
    sitemapUrl("/blog", homepageDate),
    ...posts.map((post) =>
      sitemapUrl(`/blog/${post.slug}`, post.data.updatedDate ?? post.data.date)
    ),
    ...projects.map((project) =>
      sitemapUrl(`/projects/${project.data.slug}`, project.data.updatedDate)
    ),
  ].join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } }
  );
};
