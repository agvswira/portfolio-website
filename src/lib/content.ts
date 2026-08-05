import { getCollection, type CollectionEntry } from "astro:content";

import {
  assertNoBodyH1,
  assertProjectOutline,
  calculateReadingTime,
  projectSlugMatchesId,
} from "./content-guards";

export type BlogEntry = CollectionEntry<"blog"> & { readingTime: number; slug: string };
export type ProjectEntry = CollectionEntry<"projects">;

function idToSlug(id: string): string {
  return id.replace(/\.(md|mdx)$/, "");
}

export async function getBlogPosts(): Promise<BlogEntry[]> {
  const entries = await getCollection("blog");

  return entries
    .map((entry) => {
      assertNoBodyH1(entry.body ?? "", entry.id);
      return {
        ...entry,
        slug: idToSlug(entry.id),
        readingTime: calculateReadingTime(entry.body ?? ""),
      };
    })
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getProjects(): Promise<ProjectEntry[]> {
  const entries = await getCollection("projects");

  for (const entry of entries) {
    if (!projectSlugMatchesId(entry.data.slug, entry.id)) {
      throw new Error(`${entry.id}: slug frontmatter harus sama dengan nama file`);
    }
    assertProjectOutline(entry.body ?? "", entry.id);
  }

  return entries.sort(
    (a, b) =>
      Number(b.data.featured) - Number(a.data.featured) ||
      a.data.title.localeCompare(b.data.title, "id")
  );
}

export function formatIndonesianDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Makassar",
  }).format(date);
}
