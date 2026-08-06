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
  coverImage: "/images/projects/botpass.png",
  featured: true,
  status: "active",
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
  test("keeps a valid lifecycle status and cover image", () => {
    const result = projectSchema.safeParse(project);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("active");
      expect(result.data.coverImage).toBe("/images/projects/botpass.png");
    }
  });

  test("rejects a project without a cover image", () => {
    const result = projectSchema.safeParse({
      ...project,
      coverImage: null,
    });

    expect(result.success).toBe(false);
  });

  test("rejects an unknown lifecycle status", () => {
    const result = projectSchema.safeParse({
      ...project,
      status: "archived",
    });

    expect(result.success).toBe(false);
  });

  test("rejects a project without a lifecycle status", () => {
    const withoutStatus = { ...project };
    Reflect.deleteProperty(withoutStatus, "status");

    expect(projectSchema.safeParse(withoutStatus).success).toBe(false);
  });

  test("rejects placeholder cover text", () => {
    const result = projectSchema.safeParse({
      ...project,
      coverImage: "TODO: tambahkan screenshot",
    });

    expect(result.success).toBe(false);
  });
});
