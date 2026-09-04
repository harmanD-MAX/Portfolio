"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SiteNavbar } from "@/components/site/navbar";
import { BlogBackground } from "@/components/blog/blog-background";
import { BlogEditor } from "@/components/blog/blog-editor";
import { BlogEntity } from "@/server/repositories/blog-repository";

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<BlogEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBlog() {
      if (!slug) return;
      try {
        const res = await fetch(`/api/blogs/${slug}`);
        const data = await res.json();
        if (data.success && data.blog) {
          setBlog(data.blog);
        } else {
          router.push("/blog");
        }
      } catch (err) {
        console.error("Failed to load blog for editing:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBlog();
  }, [slug, router]);

  return (
    <>
      <BlogBackground />
      <SiteNavbar />

      <main className="relative z-10 flex min-h-dvh flex-col">
        <div className="page-wrap py-10 md:py-16">
          {isLoading ? (
            <div className="py-24 text-center mono text-xs text-muted-foreground">
              Loading article from database in editor...
            </div>
          ) : blog ? (
            <BlogEditor initialBlog={blog} isEditing={true} />
          ) : (
            <div className="py-24 text-center mono text-xs text-muted-foreground">
              Article not found in database.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
