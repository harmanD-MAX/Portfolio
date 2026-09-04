"use client";

import { SiteNavbar } from "@/components/site/navbar";
import { BlogBackground } from "@/components/blog/blog-background";
import { BlogEditor } from "@/components/blog/blog-editor";

export default function WriteBlogPage() {
  return (
    <>
      <BlogBackground />
      <SiteNavbar />

      <main className="relative z-10 flex min-h-dvh flex-col">
        <div className="page-wrap py-10 md:py-16">
          <BlogEditor isEditing={false} />
        </div>
      </main>
    </>
  );
}
