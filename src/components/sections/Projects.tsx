"use client";

import { useState } from "react";
import { FiGithub, FiExternalLink } from "react-icons/fi";
import { PROJECTS, ALL_TAGS } from "@/lib/data/projects";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SpotlightCard from "@/components/ui/SpotlightCard";
import Badge from "@/components/ui/Badge";
import RevealGroup from "@/components/motion/RevealGroup";

export default function Projects() {
  const [activeTag, setActiveTag] = useState("All");

  const filtered =
    activeTag === "All" ? PROJECTS : PROJECTS.filter((p) => p.tags.includes(activeTag));

  return (
    <SectionWrapper
      id="projects"
      eyebrow="Proyek"
      title="Karya Pilihan"
      subtitle="Proyek yang saya bangun — dari side project eksplorasi hingga solusi produksi."
    >
      {/* Filter tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {["All", ...ALL_TAGS].map((tag) => (
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
              key={project.id}
              as="article"
              beam={project.featured}
              className="project-card flex flex-col p-5 gap-4"
            >
              {/* Thumbnail placeholder */}
              <div
                className="w-full h-36 rounded-lg bg-bg-elevated/70 border border-nord-border/30 flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-text-muted/30 text-4xl font-bold select-none">
                  {project.title.charAt(0)}
                </span>
              </div>

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

                <p className="text-text-muted text-xs leading-relaxed flex-1">
                  {project.description}
                </p>

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
              <div className="flex items-center gap-3 pt-1 border-t border-nord-border/20">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`GitHub — ${project.title}`}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-frost transition-colors"
                  >
                    <FiGithub size={13} aria-hidden="true" />
                    GitHub
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
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
