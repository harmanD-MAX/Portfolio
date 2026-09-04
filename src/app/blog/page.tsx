import { BlogRepository } from "@/server/repositories/blog-repository";
import { SiteNavbar } from "@/components/site/navbar";
import { BlogBackground } from "@/components/blog/blog-background";
import { BlogListingClient } from "@/components/blog/blog-listing-client";

export const dynamic = "force-dynamic";

export default async function BlogListingPage() {
  const blogs = await BlogRepository.findAll();

  return (
    <>
      <BlogBackground />
      <SiteNavbar />

      <main className="relative z-10 flex min-h-dvh flex-col" suppressHydrationWarning>
        <BlogListingClient initialBlogs={blogs} />

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
