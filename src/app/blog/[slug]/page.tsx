import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BlogRepository } from "@/server/repositories/blog-repository";
import { SiteNavbar } from "@/components/site/navbar";
import { BlogBackground } from "@/components/blog/blog-background";
import { BlogArticleView } from "@/components/blog/blog-renderer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await BlogRepository.findBySlugOrId(slug);

  if (!blog) {
    notFound();
  }

  return (
    <>
      <BlogBackground />
      <SiteNavbar />

      <main className="relative z-10 flex min-h-dvh flex-col">
        <div className="page-wrap py-10 md:py-16">
          {/* Top Breadcrumb Nav */}
          <div className="mx-auto max-w-3xl flex items-center justify-between border-b border-border/40 pb-4 mb-4">
            <Link
              href="/blog"
              className="mono inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Back to all articles</span>
            </Link>
          </div>

          {/* Full Article Reader with Cursive Signature & h_ Monogram */}
          <BlogArticleView blog={blog} />
        </div>

        {/* Footer */}
        <footer className="page-wrap site-footer flex flex-col justify-between gap-4 border-t border-border/40 py-8 md:flex-row md:items-center mt-auto">
          <div className="flex items-center">
            <span className="serif text-2xl font-normal italic tracking-tight text-foreground">
              h<span className="text-primary not-italic font-mono">_</span>
            </span>
          </div>
          <p className="serif italic text-sm text-foreground/75 text-center">
            &ldquo;From first principles to distributed scale.&rdquo;
          </p>
          <span className="mono text-[0.68rem] text-muted-foreground/80 md:text-right">
            harman_ · © {new Date().getFullYear()}
          </span>
        </footer>
      </main>
    </>
  );
}
