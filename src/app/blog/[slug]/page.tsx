import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { getPostBySlug, getAllPosts, getAllSlugs } from "@/lib/blog";
import { SITE, PERSONAL } from "@/lib/constants";
import Badge from "@/components/ui/Badge";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt || SITE.description,
    openGraph: {
      title: `${post.title} | ${PERSONAL.name}`,
      description: post.excerpt || SITE.description,
      url: `${SITE.url}/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [PERSONAL.name],
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Prev / next
  const allPosts = getAllPosts();
  const idx = allPosts.findIndex((p) => p.slug === slug);
  const prev = allPosts[idx + 1] ?? null;
  const next = allPosts[idx - 1] ?? null;

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-3xl mx-auto px-6 py-24">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-frost transition-colors mb-10"
        >
          ← Semua Artikel
        </Link>

        {/* Article header */}
        <header className="mb-10">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="tag">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-text-muted">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingTime} mnt baca</span>
          </div>
        </header>

        {/* MDX content */}
        <article className="prose-dark">
          <MDXRemote
            source={post.content}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug, rehypeHighlight],
              },
            }}
          />
        </article>

        {/* Prev / Next navigation */}
        {(prev || next) && (
          <nav
            aria-label="Navigasi artikel"
            className="mt-16 pt-8 border-t border-nord-border/30 grid sm:grid-cols-2 gap-4"
          >
            {prev && (
              <Link
                href={`/blog/${prev.slug}`}
                className="group flex flex-col p-4 rounded-xl border border-nord-border/40 hover:border-frost/30 transition-colors"
              >
                <span className="text-xs text-text-muted mb-1">← Lebih lama</span>
                <span className="text-sm text-text-secondary group-hover:text-frost transition-colors font-medium leading-snug">
                  {prev.title}
                </span>
              </Link>
            )}
            {next && (
              <Link
                href={`/blog/${next.slug}`}
                className="group flex flex-col p-4 rounded-xl border border-nord-border/40 hover:border-frost/30 transition-colors sm:text-right sm:col-start-2"
              >
                <span className="text-xs text-text-muted mb-1">Lebih baru →</span>
                <span className="text-sm text-text-secondary group-hover:text-frost transition-colors font-medium leading-snug">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
