import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SpotlightCard from "@/components/ui/SpotlightCard";
import Badge from "@/components/ui/Badge";
import RevealGroup from "@/components/motion/RevealGroup";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogSection() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <SectionWrapper
      id="blog"
      eyebrow="Blog"
      title="Tulisan Terbaru"
      subtitle="Catatan eksplorasi, tips, dan pemikiran seputar frontend development."
    >
      {posts.length === 0 ? (
        <p className="text-center text-text-muted py-12">Belum ada artikel. Segera hadir!</p>
      ) : (
        <RevealGroup batch selector=".blog-card" stagger={0.1}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <SpotlightCard className="blog-card h-full p-5 flex flex-col gap-3">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="tag">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="text-text-primary font-semibold text-sm leading-snug group-hover:text-frost transition-colors flex-1">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-text-muted text-xs leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center justify-between text-[10px] text-text-muted pt-2 border-t border-nord-border/20 mt-auto">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span>{post.readingTime} mnt baca</span>
                  </div>
                </SpotlightCard>
              </Link>
            ))}
          </div>
        </RevealGroup>
      )}

      {/* View all */}
      <div className="text-center mt-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-frost hover:text-frost-cyan transition-colors border border-frost/30 hover:border-frost/60 px-5 py-2.5 rounded-lg"
        >
          Lihat Semua Artikel →
        </Link>
      </div>
    </SectionWrapper>
  );
}
