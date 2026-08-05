import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import Footer from "@/components/Footer";
import Badge from "@/components/ui/Badge";
import { PERSONAL, SITE } from "@/lib/constants";
import { isPublicUrl } from "@/lib/project-types";
import { getAllProjectSlugs, getProjectBySlug } from "@/lib/projects";

export async function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: `${project.title} | ${PERSONAL.name}`,
      description: project.summary,
      url: `${SITE.url}/projects/${project.slug}`,
      type: "article",
      images: isPublicUrl(project.coverImage) ? [project.coverImage] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <main id="main" className="w-full max-w-4xl mx-auto px-6 py-24 flex-1">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-frost transition-colors mb-10"
        >
          ← Kembali ke proyek
        </Link>

        <article>
          <header className="mb-14">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {project.featured && <Badge variant="featured">Featured</Badge>}
              {project.tags.map((tag) => (
                <Badge key={tag} variant="tag">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl sm:text-5xl font-semibold text-text-primary tracking-tight leading-tight text-balance">
              {project.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-muted">
              {project.summary}
            </p>

            <dl className="mt-8 grid gap-5 border-y border-nord-border/30 py-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wider text-text-muted">Role</dt>
                <dd className="mt-2 text-sm leading-relaxed text-text-secondary">{project.role}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-text-muted">Timeline</dt>
                <dd className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {project.timeline}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {isPublicUrl(project.demoUrl) && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-frost hover:text-frost-cyan transition-colors"
                >
                  Live site ↗
                </a>
              )}
              {isPublicUrl(project.repoUrl) && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-frost hover:text-frost-cyan transition-colors"
                >
                  Repository ↗
                </a>
              )}
              {project.evidence.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-frost hover:text-frost-cyan transition-colors"
                >
                  {item.label} ↗
                </a>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Stack</p>
              <ul className="flex flex-wrap gap-2" aria-label="Technology stack">
                {project.stack.map((item) => (
                  <li key={item}>
                    <Badge variant="tag">{item}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </header>

          <div className="prose-dark">
            <MDXRemote
              source={project.content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug, rehypeHighlight],
                },
              }}
            />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
