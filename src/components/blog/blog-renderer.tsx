"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Edit3,
  Share2,
  Terminal,
  Trash2,
  Eye,
  Heart,
  Sparkles,
  AlertTriangle,
  Loader2,
  Flame,
} from "lucide-react";
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

      <pre className="overflow-x-auto p-4 text-[0.78rem] leading-relaxed text-[#e6edf3]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function BlogContentRenderer({ content }: { content: string }) {
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = "";
    let codeBuffer: string[] = [];
    let blockquoteBuffer: string[] = [];

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
      }
    };

    lines.forEach((line, index) => {
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

      if (line.startsWith(">")) {
        blockquoteBuffer.push(line.replace(/^>\s?/, ""));
        return;
      } else {
        flushBlockquote(index);
      }

      if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={`h3-${index}`}
            className="serif text-xl md:text-2xl font-normal text-foreground mt-8 mb-3"
          >
            {line.replace("### ", "")}
          </h3>
        );
        return;
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={`h2-${index}`}
            className="serif text-2xl md:text-3xl font-normal text-foreground mt-10 mb-4 pb-2 border-b border-border/40"
          >
            {line.replace("## ", "")}
          </h2>
        );
        return;
      }
      if (line.startsWith("# ")) {
        elements.push(
          <h1
            key={`h1-${index}`}
            className="serif text-3xl md:text-4xl font-normal text-foreground mt-12 mb-5"
          >
            {line.replace("# ", "")}
          </h1>
        );
        return;
      }

      if (line.trim() === "---" || line.trim() === "***") {
        elements.push(<hr key={`hr-${index}`} className="my-8 border-border/40" />);
        return;
      }

      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        elements.push(
          <li
            key={`li-${index}`}
            className="ml-6 list-disc text-sm md:text-base leading-7 text-foreground/80 font-sans my-1"
            dangerouslySetInnerHTML={{
              __html: formatInline(line.trim().replace(/^[-*]\s/, "")),
            }}
          />
        );
        return;
      }

      if (/^\d+\.\s/.test(line.trim())) {
        elements.push(
          <li
            key={`oli-${index}`}
            className="ml-6 list-decimal text-sm md:text-base leading-7 text-foreground/80 font-sans my-1"
            dangerouslySetInnerHTML={{
              __html: formatInline(line.trim().replace(/^\d+\.\s/, "")),
            }}
          />
        );
        return;
      }

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingAction, setPendingAction] = useState<"edit" | "delete" | null>(null);

  const [viewsCount, setViewsCount] = useState(blog.views || 0);

  const [likesCount, setLikesCount] = useState(blog.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [likeParticleBurst, setLikeParticleBurst] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLike = localStorage.getItem(`liked_blog_${blog.slug}`);
      if (storedLike === "true") {
        setHasLiked(true);
      }
    }

    fetch(`/api/blogs/${blog.slug}/view`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.views === "number") {
          setViewsCount(data.views);
        }
      })
      .catch(() => {});
  }, [blog.slug]);

  const handleToggleLike = async () => {
    if (isLiking) return;
    const newLiked = !hasLiked;
    const nextCount = Math.max(0, likesCount + (newLiked ? 1 : -1));

    setHasLiked(newLiked);
    setLikesCount(nextCount);
    if (newLiked) {
      setLikeParticleBurst(true);
      setTimeout(() => setLikeParticleBurst(false), 1200);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(`liked_blog_${blog.slug}`, newLiked ? "true" : "false");
    }

    setIsLiking(true);
    try {
      const res = await fetch(`/api/blogs/${blog.slug}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: newLiked ? "like" : "unlike" }),
      });
      const data = await res.json();
      if (data.success && typeof data.likes === "number") {
        setLikesCount(data.likes);
      }
    } catch (err) {
      console.error("Failed to sync like:", err);
    } finally {
      setIsLiking(false);
    }
  };

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
      setIsDeleteModalOpen(true);
    } else {
      setPendingAction("delete");
      setIsAuthModalOpen(true);
    }
  };

  const executeDelete = async (token?: string) => {
    const keyToUse = token || getStoredAuthorKey() || "";
    if (!keyToUse) {
      setPendingAction("delete");
      setIsAuthModalOpen(true);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/blogs/${blog.slug}`, {
        method: "DELETE",
        headers: {
          "x-author-key": keyToUse,
        },
      });
      const data = await res.json();
      if (data.success) {
        setTimeout(() => {
          router.refresh();
          window.location.href = "/blog";
        }, 1200);
      } else {
        alert(data.error || "Failed to delete article");
        setIsDeleting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting article");
      setIsDeleting(false);
    }
  };

  const handleAuthSuccess = (token: string) => {
    if (pendingAction === "edit") {
      router.push(`/blog/edit/${blog.slug}`);
    } else if (pendingAction === "delete") {
      setIsDeleteModalOpen(true);
    }
  };

  return (
    <>
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative flex flex-col items-center gap-5 p-8 rounded-3xl border border-red-500/30 bg-card/90 shadow-2xl max-w-sm text-center">
            <div className="relative flex items-center justify-center size-20 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-400">
              <Trash2 size={32} className="animate-bounce" />
              <div className="absolute inset-0 rounded-2xl border-2 border-red-500/30 animate-ping opacity-75" />
            </div>

            <div>
              <h3 className="serif text-2xl font-normal text-foreground">
                Deleting Article
              </h3>
              <p className="mono text-xs text-muted-foreground mt-1.5">
                Permanently removing from database...
              </p>
            </div>

            <div className="flex items-center gap-2 mono text-[0.65rem] text-primary">
              <Loader2 size={13} className="animate-spin" />
              <span>Synchronizing cache...</span>
            </div>
          </div>
        </div>
      )}

      <article className="mx-auto max-w-3xl py-12 md:py-16">
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
              <span className="mono text-xs px-2.5 py-1 rounded-full bg-secondary/40 border border-border/60 text-muted-foreground inline-flex items-center gap-1.5 shadow-sm">
                <Eye size={13} className="text-primary" />
                <span className="text-foreground/90 font-medium">
                  {viewsCount.toLocaleString()}
                </span>
                <span className="text-[0.65rem] opacity-75">
                  {viewsCount === 1 ? "view" : "views"}
                </span>
              </span>

              <span className="mono text-xs text-muted-foreground hidden sm:inline">
                {blog.publishedAt}
              </span>

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

          <h1 className="serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-foreground mt-6 leading-[1.05]">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="mt-4 text-base md:text-lg leading-relaxed text-foreground/75 font-sans font-normal">
              {blog.excerpt}
            </p>
          )}

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

        <BlogContentRenderer content={blog.content} />

        <div className="my-14 rounded-2xl border border-border/60 bg-gradient-to-b from-card/80 to-card/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                <Flame size={16} className="text-primary animate-pulse" />
                <span className="mono text-xs font-semibold uppercase tracking-wider text-primary">
                  Enjoyed this engineering breakdown?
                </span>
              </div>
              <p className="text-sm text-foreground/75 font-sans leading-relaxed">
                Leave a like to applaud this journal entry and support technical writings.
              </p>
            </div>

            <div className="relative">
              {likeParticleBurst && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center animate-bounce">
                  <Sparkles size={20} className="text-red-400 animate-spin" />
                </div>
              )}

              <button
                type="button"
                onClick={handleToggleLike}
                className={`group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-full border transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
                  hasLiked
                    ? "border-red-500/50 bg-red-500/15 text-red-400 shadow-red-500/20 ring-2 ring-red-500/25"
                    : "border-border/80 bg-secondary/40 text-foreground hover:border-red-400 hover:text-red-400 hover:bg-red-500/10"
                }`}
              >
                <Heart
                  size={18}
                  className={`transition-all duration-300 ${
                    hasLiked
                      ? "fill-red-500 text-red-500 scale-110"
                      : "text-foreground/80 group-hover:text-red-400 group-hover:scale-110"
                  }`}
                />
                <span className="mono text-xs font-semibold">
                  {hasLiked ? "Liked" : "Like Article"}
                </span>
                <span className="mono text-xs px-2 py-0.5 rounded-full bg-background/80 border border-border/60 text-foreground font-mono">
                  {likesCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-10">
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

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/40 bg-[hsl(var(--card))] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30 text-red-400">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="serif text-2xl font-normal text-foreground">
                  Delete Article?
                </h3>
                <p className="mono text-[0.65rem] text-muted-foreground">
                  Permanent Database Action
                </p>
              </div>
            </div>

            <p className="text-xs text-foreground/80 font-sans leading-relaxed mb-6">
              Are you sure you want to permanently delete <strong className="text-foreground">&ldquo;{blog.title}&rdquo;</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="mono text-xs px-4 py-2 rounded-full border border-border/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  executeDelete();
                }}
                className="mono text-xs px-5 py-2 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/25 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthorAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        actionTitle={pendingAction === "edit" ? "Edit Article Access" : "Delete Article Access"}
      />
    </>
  );
}
