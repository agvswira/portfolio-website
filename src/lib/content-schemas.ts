import { z } from "astro/zod";

import { isLocalOrPublicImage } from "./content-guards";

const nonEmpty = z.string().trim().min(1);
const stringList = z.array(nonEmpty).min(1);

export const blogSchema = z.object({
  title: nonEmpty,
  excerpt: nonEmpty,
  date: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: stringList,
});

export const projectSchema = z.object({
  title: nonEmpty,
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: nonEmpty,
  problem: nonEmpty,
  role: nonEmpty,
  timeline: nonEmpty,
  stack: stringList,
  outcome: stringList,
  demoUrl: z.url().nullable(),
  repoUrl: z.url(),
  coverImage: z
    .string()
    .refine(isLocalOrPublicImage, "coverImage wajib berupa URL publik atau path lokal")
    .nullable(),
  featured: z.boolean(),
  tags: stringList,
  evidence: z.array(
    z.object({
      label: nonEmpty,
      url: z.url(),
    })
  ),
  publishedDate: z.coerce.date(),
  updatedDate: z.coerce.date(),
});

export type BlogData = z.infer<typeof blogSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
