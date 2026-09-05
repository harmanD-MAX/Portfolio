"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, PenTool, Search } from "lucide-react";
import { BlogEntity } from "@/server/repositories/blog-repository";
import { AuthorAuthModal } from "@/components/blog/author-auth-modal";

const CATEGORIES = [
  "All",
  "Algorithms",
  "Distributed Systems",
  "Backend Architecture",
  "System Design",
  "Generative AI",
];

export function BlogListingClient({ initialBlogs = [] }: { initialBlogs: BlogEntity[] }) {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogEntity[]>(initialBlogs);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setBlogs(initialBlogs);
  }, [initialBlogs]);

  const handleWriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const key =
      typeof window !== "undefined"
        ? localStorage.getItem("harman_author_key") || sessionStorage.getItem("harman_author_key")
        : null;
    if (key) {
      router.push("/blog/write");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    if (activeCategory !== "All" && blog.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = blog.title.toLowerCase().includes(q);
      const inExcerpt = blog.excerpt?.toLowerCase().includes(q);
      const inTags = blog.tags?.some((t) => t.toLowerCase().includes(q));
      if (!inTitle && !inExcerpt && !inTags) return false;
    }
    return true;
  });

  return (
    <>
      <div className="page-wrap py-16 md:py-24" suppressHydrationWarning>
        {/* Header Section */}
        <div className="mb-12 flex flex-col justify-between gap-6 border-b border-border/40 pb-12 md:flex-row md:items-end">
          <div>
            <div className="mono section-label flex items-center gap-3">
              <span className="section-number">Journal</span>
              <span className="section-dash" />
              <span>Engineering & Systems</span>
            </div>
            <h1 className="serif mt-6 text-5xl sm:text-6xl md:text-7xl font-normal tracking-[-0.04em] leading-[0.92] text-foreground">
              Technical <span className="italic text-primary">writings.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm md:text-base leading-relaxed text-foreground/75 font-sans">
              Deep dives on algorithmic pattern recognition, distributed systems architectures, real-time networking, and generative AI.
            </p>
          </div>

          {/* Write Article Action (Author Protected) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleWriteClick}
              className="mono text-xs uppercase tracking-wider px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-primary/25 inline-flex items-center gap-2 cursor-pointer"
            >
              <PenTool size={13} />
              <span>Write Article</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2" role="tablist">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`mono text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "border border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles & tags..."
              className="w-full rounded-full border border-border/60 bg-card/60 pl-9 pr-4 py-2 text-xs font-sans text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none backdrop-blur-md"
            />
          </div>
        </div>

        {/* Article Cards Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-card/40 p-12 text-center backdrop-blur-md">
            <p className="font-serif text-2xl text-foreground">No articles found.</p>
            <p className="mono text-xs text-muted-foreground mt-2">
              Try adjusting your search query or category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.id}
                className="group flex flex-col justify-between rounded-2xl border border-border/60 bg-[hsl(var(--card)/.75)] p-7 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:translate-y-[-3px]"
              >
                <div>
                  {/* Top Card Meta */}
                  <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                    <span className="mono text-[0.65rem] px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary font-semibold">
                      {blog.category}
                    </span>
                    <span className="mono text-[0.62rem] text-muted-foreground">
                      {blog.readTime} · {blog.publishedAt}
                    </span>
                  </div>

                  {/* Article Title */}
                  <Link href={`/blog/${blog.slug}`}>
                    <h2 className="serif text-2xl sm:text-3xl font-normal text-foreground group-hover:text-primary transition-colors leading-snug">
                      {blog.title}
                    </h2>
                  </Link>

                  {/* Excerpt */}
                  {blog.excerpt && (
                    <p className="mt-3 text-sm leading-relaxed text-foreground/75 font-sans line-clamp-3">
                      {blog.excerpt}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-5">
                    {blog.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="mono text-[0.6rem] px-2 py-0.5 rounded-md border border-border/50 bg-secondary/30 text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-6">
                  <div className="flex items-center gap-1.5">
                    <span className="serif text-base font-normal italic text-foreground">
                      h<span className="text-primary not-italic font-mono">_</span>
                    </span>
                    <span className="mono text-[0.6rem] text-muted-foreground">
                      Harman
                    </span>
                  </div>

                  <Link
                    href={`/blog/${blog.slug}`}
                    className="mono inline-flex items-center gap-1.5 text-xs text-primary font-medium group-hover:underline cursor-pointer"
                  >
                    <span>Read Article</span>
                    <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <AuthorAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          router.push("/blog/write");
        }}
        actionTitle="Harman Author Verification"
      />
    </>
  );
}
