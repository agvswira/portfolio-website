import { describe, expect, test } from "vitest";

import {
  assertNoBodyH1,
  assertProjectOutline,
  calculateReadingTime,
  isLocalOrPublicImage,
  projectSlugMatchesId,
} from "../src/lib/content-guards";

describe("calculateReadingTime", () => {
  test("rounds 201 words up to two minutes", () => {
    const content = Array.from({ length: 201 }, () => "kata").join(" ");

    expect(calculateReadingTime(content)).toBe(2);
  });

  test("keeps empty content at a one-minute minimum", () => {
    expect(calculateReadingTime("   ")).toBe(1);
  });
});

describe("content heading guards", () => {
  test("rejects an H1 in an article body", () => {
    expect(() => assertNoBodyH1("# Judul kedua\n\nIsi", "article.mdx")).toThrow(
      "article.mdx: body tidak boleh memiliki H1"
    );
  });

  test("accepts the exact project case-study outline", () => {
    const body = ["Problem", "Approach", "Architecture", "Outcome", "Lessons"]
      .map((heading) => `## ${heading}\n\nIsi`)
      .join("\n\n");

    expect(() => assertProjectOutline(body, "project.mdx")).not.toThrow();
  });

  test("rejects reordered project sections", () => {
    const body = ["Approach", "Problem", "Architecture", "Outcome", "Lessons"]
      .map((heading) => `## ${heading}\n\nIsi`)
      .join("\n\n");

    expect(() => assertProjectOutline(body, "project.mdx")).toThrow(
      "Problem → Approach → Architecture → Outcome → Lessons"
    );
  });
});

describe("project metadata guards", () => {
  test("matches a content id with or without an MDX extension", () => {
    expect(projectSlugMatchesId("botpass", "botpass.mdx")).toBe(true);
    expect(projectSlugMatchesId("botpass", "other-project")).toBe(false);
  });

  test("accepts public and root-relative images but rejects placeholder text", () => {
    expect(isLocalOrPublicImage("https://example.com/cover.png")).toBe(true);
    expect(isLocalOrPublicImage("/images/cover.png")).toBe(true);
    expect(isLocalOrPublicImage("TODO: tambahkan gambar")).toBe(false);
  });
});
