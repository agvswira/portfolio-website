import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import { blogSchema, projectSchema } from "@/lib/content-schemas";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: blogSchema,
});

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" }),
  schema: projectSchema,
});

export const collections = { blog, projects };
