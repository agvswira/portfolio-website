"use client";

import { useState } from "react";
import Link from "next/link";
import { FiGithub, FiExternalLink } from "react-icons/fi";
import { isPublicUrl, type ProjectMeta } from "@/lib/project-types";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SpotlightCard from "@/components/ui/SpotlightCard";
import Badge from "@/components/ui/Badge";
import RevealGroup from "@/components/motion/RevealGroup";

interface ProjectsProps {
  projects: ProjectMeta[];
}

export default function Projects({ projects }: ProjectsProps) {
  const [activeTag, setActiveTag] = useState("All");
  const allTags = Array.from(new Set(projects.flatMap((project) => project.tags))).sort();

  const filtered =
    activeTag === "All" ? projects : projects.filter((project) => project.tags.includes(activeTag));

  return (
    <SectionWrapper
      id="projects"
      eyebrow="Proyek"
      title="Karya Pilihan"
      subtitle="Proyek belajar yang aku bangun sambil eksplorasi teknologi baru."
    >
      {/* Filter tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {["All", ...allTags].map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
              activeTag === tag
                ? "bg-frost/15 text-frost border-frost/40"
                : "bg-transparent text-text-muted border-nord-border/40 hover:border-frost/20 hover:text-text-secondary"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Cards grid — key on filter triggers re-mount → re-stagger */}
      <RevealGroup key={activeTag} batch selector=".project-card" stagger={0.07}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <SpotlightCard
              key={project.slug}
              as="article"
              beam={project.featured}
              className="project-card flex flex-col p-5 gap-4"
            >
              <div className="flex-1 flex flex-col gap-2">
                {/* Title + Featured badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-text-primary font-semibold leading-snug text-sm">
                    {project.title}
                  </h3>
                  {project.featured && (
                    <Badge variant="featured" className="flex-shrink-0">
                      Featured
                    </Badge>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">
                    Outcome
                  </p>
                  <ul className="space-y-2 text-text-muted text-xs leading-relaxed">
                    {project.outcome.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden="true" className="text-frost">
                          →
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="tag">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-nord-border/20">
                <Link
                  href={`/projects/${project.slug}`}
                  className="text-xs font-medium text-frost hover:text-frost-cyan transition-colors"
                >
                  Case study →
                </Link>
                {isPublicUrl(project.repoUrl) && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`GitHub — ${project.title}`}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-frost transition-colors"
                  >
                    <FiGithub size={13} aria-hidden="true" />
                    GitHub
                  </a>
                )}
                {isPublicUrl(project.demoUrl) && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Live Demo — ${project.title}`}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-frost transition-colors"
                  >
                    <FiExternalLink size={13} aria-hidden="true" />
                    Live Demo
                  </a>
                )}
              </div>
            </SpotlightCard>
          ))}
        </div>
      </RevealGroup>

      {filtered.length === 0 && (
        <p className="text-center text-text-muted py-12">
          Tidak ada proyek dengan tag &ldquo;{activeTag}&rdquo;.
        </p>
      )}
    </SectionWrapper>
  );
}
