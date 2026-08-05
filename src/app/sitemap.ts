import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getAllSlugs } from "@/lib/blog";
import { getAllProjects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs();
  const projects = getAllProjects();

  const blogUrls = slugs.map((slug) => ({
    url: `${SITE.url}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const projectUrls = projects.map((project) => ({
    url: `${SITE.url}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: project.featured ? 0.9 : 0.7,
  }));

  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE.url}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...projectUrls,
    ...blogUrls,
  ];
}
