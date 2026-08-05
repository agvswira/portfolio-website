export interface ProjectEvidence {
  label: string;
  url: string;
}

export interface ProjectMeta {
  title: string;
  slug: string;
  summary: string;
  problem: string;
  role: string;
  timeline: string;
  stack: string[];
  outcome: string[];
  demoUrl: string;
  repoUrl: string;
  coverImage: string;
  featured: boolean;
  tags: string[];
  evidence: ProjectEvidence[];
}

export interface Project extends ProjectMeta {
  content: string;
}

export function isPublicUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}
