const PROJECT_SECTIONS = ["Problem", "Approach", "Architecture", "Outcome", "Lessons"];

export function calculateReadingTime(content: string): number {
  const trimmed = content.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function assertNoBodyH1(content: string, filename: string): void {
  if (/^#\s+/m.test(content)) {
    throw new Error(`${filename}: body tidak boleh memiliki H1`);
  }
}

export function assertProjectOutline(content: string, filename: string): void {
  assertNoBodyH1(content, filename);
  const headings = Array.from(content.matchAll(/^##\s+(.+?)\s*$/gm), (match) => match[1]);

  if (headings.join("|") !== PROJECT_SECTIONS.join("|")) {
    throw new Error(`${filename}: urutan H2 wajib ${PROJECT_SECTIONS.join(" → ")}`);
  }
}

export function projectSlugMatchesId(slug: string, id: string): boolean {
  return id.replace(/\.(md|mdx)$/, "") === slug;
}

export function isLocalOrPublicImage(value: string): boolean {
  if (value.startsWith("/")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
