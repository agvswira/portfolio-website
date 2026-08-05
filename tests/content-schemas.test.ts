import { describe, expect, test } from "vitest";

import { blogSchema, projectSchema } from "../src/lib/content-schemas";

const project = {
  title: "BOTPass",
  slug: "botpass",
  summary: "Ringkasan",
  problem: "Masalah",
  role: "Solo builder",
  timeline: "Juli 2026",
  stack: ["TypeScript"],
  outcome: ["Berhasil dirilis"],
  demoUrl: null,
  repoUrl: "https://github.com/agvswira/botpass",
  coverImage: null,
  featured: true,
  tags: ["Web3"],
  evidence: [{ label: "Repository", url: "https://github.com/agvswira/botpass" }],
  publishedDate: "2026-08-05",
  updatedDate: "2026-08-05",
};

describe("blogSchema", () => {
  test("rejects an invalid publication date", () => {
    const result = blogSchema.safeParse({
      title: "Tulisan",
      excerpt: "Ringkasan",
      date: "bukan-tanggal",
      tags: ["Catatan"],
    });

    expect(result.success).toBe(false);
  });
});

describe("projectSchema", () => {
  test("allows unavailable demo and cover values to be null", () => {
    expect(projectSchema.safeParse(project).success).toBe(true);
  });

  test("rejects placeholder cover text", () => {
    const result = projectSchema.safeParse({
      ...project,
      coverImage: "TODO: tambahkan screenshot",
    });

    expect(result.success).toBe(false);
  });
});
