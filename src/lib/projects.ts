import "server-only";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Project, ProjectEvidence, ProjectMeta } from "@/lib/project-types";

const PROJECTS_DIR = path.join(process.cwd(), "src/content/projects");
const PROJECT_EXTENSION = /\.(mdx|md)$/;
const PROJECT_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REQUIRED_SECTIONS = ["Problem", "Approach", "Architecture", "Outcome", "Lessons"];

function requireString(data: Record<string, unknown>, field: string, filename: string): string {
  const value = data[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${filename}: frontmatter "${field}" wajib berupa string non-kosong.`);
  }
  return value;
}

function requireStringArray(
  data: Record<string, unknown>,
  field: string,
  filename: string
): string[] {
  const value = data[field];
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => typeof item !== "string" || item.trim() === "")
  ) {
    throw new Error(`${filename}: frontmatter "${field}" wajib berupa array string non-kosong.`);
  }
  return value;
}

function requireEvidence(data: Record<string, unknown>, filename: string): ProjectEvidence[] {
  const value = data.evidence;
  if (!Array.isArray(value)) {
    throw new Error(`${filename}: frontmatter "evidence" wajib berupa array.`);
  }

  return value.map((item, index) => {
    if (
      typeof item !== "object" ||
      item === null ||
      !("label" in item) ||
      typeof item.label !== "string" ||
      !("url" in item) ||
      typeof item.url !== "string"
    ) {
      throw new Error(
        `${filename}: evidence[${index}] wajib memiliki label dan url berupa string.`
      );
    }

    return { label: item.label, url: item.url };
  });
}

function validateCaseStudyOutline(content: string, filename: string): void {
  if (/^#\s+/m.test(content)) {
    throw new Error(
      `${filename}: body project tidak boleh memiliki H1; title route adalah satu-satunya H1.`
    );
  }

  const sections = Array.from(content.matchAll(/^##\s+(.+?)\s*$/gm), (match) => match[1]);
  if (sections.join("|") !== REQUIRED_SECTIONS.join("|")) {
    throw new Error(
      `${filename}: urutan H2 wajib ${REQUIRED_SECTIONS.join(" → ")} tanpa H2 tambahan.`
    );
  }
}

function parseProject(filename: string): Project {
  const raw = fs.readFileSync(path.join(PROJECTS_DIR, filename), "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = data as Record<string, unknown>;
  const fileSlug = filename.replace(PROJECT_EXTENSION, "");
  const slug = requireString(frontmatter, "slug", filename);

  if (!PROJECT_SLUG.test(slug)) {
    throw new Error(`${filename}: slug harus memakai format kebab-case.`);
  }
  if (slug !== fileSlug) {
    throw new Error(`${filename}: slug frontmatter harus sama dengan nama file.`);
  }
  if (typeof frontmatter.featured !== "boolean") {
    throw new Error(`${filename}: frontmatter "featured" wajib berupa boolean.`);
  }

  validateCaseStudyOutline(content, filename);

  return {
    title: requireString(frontmatter, "title", filename),
    slug,
    summary: requireString(frontmatter, "summary", filename),
    problem: requireString(frontmatter, "problem", filename),
    role: requireString(frontmatter, "role", filename),
    timeline: requireString(frontmatter, "timeline", filename),
    stack: requireStringArray(frontmatter, "stack", filename),
    outcome: requireStringArray(frontmatter, "outcome", filename),
    demoUrl: requireString(frontmatter, "demoUrl", filename),
    repoUrl: requireString(frontmatter, "repoUrl", filename),
    coverImage: requireString(frontmatter, "coverImage", filename),
    featured: frontmatter.featured,
    tags: requireStringArray(frontmatter, "tags", filename),
    evidence: requireEvidence(frontmatter, filename),
    content,
  };
}

function getProjectFiles(): string[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((filename) => PROJECT_EXTENSION.test(filename))
    .sort();
}

export function getAllProjects(): ProjectMeta[] {
  return getProjectFiles()
    .map((filename) => {
      const project = parseProject(filename);
      return {
        title: project.title,
        slug: project.slug,
        summary: project.summary,
        problem: project.problem,
        role: project.role,
        timeline: project.timeline,
        stack: project.stack,
        outcome: project.outcome,
        demoUrl: project.demoUrl,
        repoUrl: project.repoUrl,
        coverImage: project.coverImage,
        featured: project.featured,
        tags: project.tags,
        evidence: project.evidence,
      };
    })
    .sort(
      (a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title, "id")
    );
}

export function getProjectBySlug(slug: string): Project | null {
  if (!PROJECT_SLUG.test(slug)) return null;

  const filename = getProjectFiles().find(
    (candidate) => candidate.replace(PROJECT_EXTENSION, "") === slug
  );
  return filename ? parseProject(filename) : null;
}

export function getAllProjectSlugs(): string[] {
  return getProjectFiles().map((filename) => filename.replace(PROJECT_EXTENSION, ""));
}
