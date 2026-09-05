"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Edit3, Share2, Terminal, Trash2 } from "lucide-react";
import { BlogEntity } from "@/server/repositories/blog-repository";
import { AuthorAuthModal } from "./author-auth-modal";
import { useRouter } from "next/navigation";

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 overflow-hidden rounded-xl border border-border/70 bg-[#0d1419] font-mono text-xs shadow-xl">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between border-b border-border/40 bg-secondary/30 px-4 py-2.5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Terminal size={13} className="text-primary" />
          <span className="mono text-[0.62rem] uppercase tracking-wider text-primary/80 font-medium">
            {language || "code"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[0.65rem] text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="overflow-x-auto p-4 text-[0.78rem] leading-relaxed text-[#e6edf3]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function BlogContentRenderer({ content }: { content: string }) {
  // Parse markdown blocks
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = "";
    let codeBuffer: string[] = [];
    let blockquoteBuffer: string[] = [];
    let inBlockquote = false;

    const flushBlockquote = (key: number) => {
      if (blockquoteBuffer.length > 0) {
        const quoteText = blockquoteBuffer.join("\n");
        elements.push(
          <blockquote
            key={`quote-${key}`}
            className="my-5 border-l-2 border-primary pl-5 italic text-foreground/85 font-sans leading-relaxed text-sm md:text-base bg-primary/5 py-3 rounded-r-xl"
          >
            {quoteText}
          </blockquote>
        );
        blockquoteBuffer = [];
        inBlockquote = false;
      }
    };

    lines.forEach((line, index) => {
      // Code block start/end
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <CodeBlock
              key={`code-${index}`}
              code={codeBuffer.join("\n")}
              language={codeLanguage}
            />
          );
          codeBuffer = [];
          inCodeBlock = false;
          codeLanguage = "";
        } else {
          flushBlockquote(index);
          inCodeBlock = true;
          codeLanguage = line.trim().replace(/^```/, "").trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Blockquotes
      if (line.startsWith(">")) {
        inBlockquote = true;
        blockquoteBuffer.push(line.replace(/^>\s*/, ""));
        return;
      } else if (inBlockquote && line.trim() === "") {
        flushBlockquote(index);
      }

      // Headings
      if (line.startsWith("### ")) {
        flushBlockquote(index);
        elements.push(
          <h3
            key={`h3-${index}`}
            className="serif text-2xl md:text-3xl font-normal text-foreground mt-8 mb-3"
          >
            {line.replace("### ", "")}
          </h3>
        );
        return;
      }

      if (line.startsWith("## ")) {
        flushBlockquote(index);
        elements.push(
          <h2
            key={`h2-${index}`}
            className="serif text-3xl md:text-4xl font-normal text-foreground mt-10 mb-4 pb-2 border-b border-border/40"
          >
            {line.replace("## ", "")}
          </h2>
        );
        return;
      }

      if (line.startsWith("# ")) {
        flushBlockquote(index);
        elements.push(
          <h1
            key={`h1-${index}`}
            className="serif text-4xl md:text-5xl font-normal text-foreground mt-12 mb-5"
          >
            {line.replace("# ", "")}
          </h1>
        );
        return;
      }

      // Horizontal rules
      if (line.trim() === "---" || line.trim() === "***") {
        flushBlockquote(index);
        elements.push(
          <hr key={`hr-${index}`} className="my-8 border-t border-border/50" />
        );
        return;
      }

      // Unordered lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        flushBlockquote(index);
        const itemText = line.trim().replace(/^[-*]\s+/, "");
        elements.push(
          <li
            key={`li-${index}`}
            className="ml-5 list-disc text-sm md:text-base leading-7 text-foreground/85 my-1"
          >
            <span dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
          </li>
        );
        return;
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        flushBlockquote(index);
        const itemText = line.trim().replace(/^\d+\.\s+/, "");
        elements.push(
          <li
            key={`oli-${index}`}
            className="ml-5 list-decimal text-sm md:text-base leading-7 text-foreground/85 my-1"
          >
            <span dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
          </li>
        );
        return;
      }

      // Regular paragraphs
      if (line.trim() !== "") {
        flushBlockquote(index);
        elements.push(
          <p
            key={`p-${index}`}
            className="text-sm md:text-base leading-7 md:leading-8 text-foreground/85 font-sans my-4 font-normal"
            dangerouslySetInnerHTML={{ __html: formatInline(line) }}
          />
        );
      }
    });

    flushBlockquote(lines.length);
    return elements;
  };

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-foreground">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="mono px-1.5 py-0.5 rounded bg-secondary/60 text-primary border border-primary/20 text-[0.72rem]">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80 transition-colors">$1</a>');
  };

  return <div className="article-body max-w-none">{renderMarkdown(content)}</div>;
}

export function BlogArticleView({ blog }: { blog: BlogEntity }) {
  const router = useRouter();
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"edit" | "delete" | null>(null);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getStoredAuthorKey = () => {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("harman_author_key") ||
      sessionStorage.getItem("harman_author_key")
    );
  };

  const handleEditClick = () => {
    const authorKey = getStoredAuthorKey();
    if (authorKey) {
      router.push(`/blog/edit/${blog.slug}`);
    } else {
      setPendingAction("edit");
      setIsAuthModalOpen(true);
    }
  };

  const handleDeleteClick = () => {
    const authorKey = getStoredAuthorKey();
    if (authorKey) {
      executeDelete(authorKey);
    } else {
      setPendingAction("delete");
      setIsAuthModalOpen(true);
    }
  };

  const executeDelete = async (token: string) => {
    if (!confirm("Are you sure you want to permanently delete this article?")) return;
    try {
      const res = await fetch(`/api/blogs/${blog.slug}`, {
        method: "DELETE",
        headers: {
          "x-author-key": token,
        },
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
        window.location.href = "/blog";
      } else {
        alert(data.error || "Failed to delete article");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting article");
    }
  };

  const handleAuthSuccess = (token: string) => {
    if (pendingAction === "edit") {
      router.push(`/blog/edit/${blog.slug}`);
    } else if (pendingAction === "delete") {
      executeDelete(token);
    }
  };

  return (
    <>
      <article className="mx-auto max-w-3xl py-12 md:py-16">
        {/* Header Meta */}
        <div className="mb-8 border-b border-border/40 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="mono text-xs text-primary font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-primary/10 border border-primary/25">
                {blog.category}
              </span>
              <span className="mono text-xs text-muted-foreground">
                {blog.readTime}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="mono text-xs text-muted-foreground">
                {blog.publishedAt}
              </span>

              {/* Author Actions */}
              <button
                type="button"
                onClick={handleEditClick}
                className="inline-flex items-center gap-1.5 mono text-[0.65rem] px-2.5 py-1 rounded-full border border-border/60 bg-secondary/30 text-foreground/80 hover:text-primary hover:border-primary transition-all cursor-pointer"
                title="Author Edit"
              >
                <Edit3 size={11} />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteClick}
                className="inline-flex items-center gap-1.5 mono text-[0.65rem] px-2.5 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                title="Author Delete"
              >
                <Trash2 size={11} />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 mono text-[0.65rem] px-2.5 py-1 rounded-full border border-border/60 bg-secondary/30 text-foreground/80 hover:text-primary hover:border-primary transition-all cursor-pointer"
              >
                <Share2 size={11} />
                <span>{copiedLink ? "Link Copied" : "Share"}</span>
              </button>
            </div>
          </div>

          {/* Article Title */}
          <h1 className="serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-foreground mt-6 leading-[1.05]">
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="mt-4 text-base md:text-lg leading-relaxed text-foreground/75 font-sans font-normal">
              {blog.excerpt}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-6">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="mono text-[0.62rem] px-2.5 py-0.5 rounded-md border border-border/50 bg-secondary/20 text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <BlogContentRenderer content={blog.content} />

        {/* Author Section with Cursive Signature & h_ Monogram Footer */}
        <div className="mt-16 border-t border-border/40 pt-10">
          <div className="rounded-2xl border border-border/60 bg-[hsl(var(--card)/.75)] p-6 md:p-8 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="serif text-2xl font-normal italic tracking-tight text-foreground">
                  h<span className="text-primary not-italic font-mono">_</span>
                </span>
                <span className="mono text-xs text-muted-foreground">· Author</span>
              </div>
              <p className="text-sm text-foreground/80 font-sans">
                Written by <strong className="font-semibold text-foreground">Harman</strong>
              </p>
              <p className="mono text-xs text-muted-foreground mt-0.5">
                {blog.author.role}
              </p>
            </div>

            {/* Cursive Signature Box */}
            <div className="flex flex-col items-start md:items-end">
              <span className="mono text-[0.58rem] text-muted-foreground uppercase tracking-widest block mb-1">
                Author Signature
              </span>
              <div className="font-cursive text-4xl text-primary font-bold tracking-wide select-none">
                Harmanpreet Singh
              </div>
            </div>
          </div>
        </div>
      </article>

      <AuthorAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        actionTitle={pendingAction === "edit" ? "Edit Article Access" : "Delete Article Access"}
      />
    </>
  );
}
