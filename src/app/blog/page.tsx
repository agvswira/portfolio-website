import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { SITE, PERSONAL } from "@/lib/constants";
import Footer from "@/components/Footer";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Blog",
  description: `Tulisan tentang perjalanan belajar, teknologi, dan eksperimen oleh ${PERSONAL.name}.`,
  openGraph: {
    title: `Blog | ${PERSONAL.name}`,
    description: `Tulisan tentang perjalanan belajar oleh ${PERSONAL.name}.`,
    url: `${SITE.url}/blog`,
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-3xl mx-auto px-6 py-24">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-frost transition-colors mb-10"
        >
          ← Kembali ke Beranda
        </Link>

        {/* Header */}
        <header className="mb-14">
          <p className="eyebrow mb-3">Blog</p>
          <h1 className="text-4xl font-semibold text-text-primary tracking-tight mb-4">Tulisan</h1>
          <p className="text-text-muted text-lg leading-relaxed">
            Catatan perjalanan, pemikiran, dan hal-hal yang sedang aku pelajari.
          </p>
        </header>

        {/* Post list */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-lg">Belum ada artikel.</p>
            <p className="text-text-muted text-sm mt-2">Segera hadir!</p>
          </div>
        ) : (
          <ol className="flex flex-col gap-0" reversed>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-6 border-b border-nord-border/30 hover:border-frost/20 transition-colors"
                >
                  <time
                    dateTime={post.date}
                    className="text-sm text-text-muted flex-shrink-0 font-mono w-36"
                  >
                    {formatDate(post.date)}
                  </time>

                  <div className="flex-1">
                    <h2 className="text-text-primary font-medium group-hover:text-frost transition-colors mb-2 leading-snug">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-text-muted text-sm leading-relaxed mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="tag">
                          {tag}
                        </Badge>
                      ))}
                      <span className="text-xs text-text-muted ml-auto">
                        {post.readingTime} mnt baca
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
      <Footer />
    </div>
  );
}
