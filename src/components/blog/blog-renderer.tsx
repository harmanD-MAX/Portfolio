"use client";

import { useState, useEffect, useRef } from "react";
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
  Play,
  RefreshCw,
  Code as CodeIcon,
  Layers,
} from "lucide-react";
import { BlogEntity } from "@/server/repositories/blog-repository";
import { AuthorAuthModal } from "./author-auth-modal";
import { useRouter } from "next/navigation";

function isInteractiveBlock(lang: string) {
  const l = lang.toLowerCase().trim();
  return (
    l === "interactive" ||
    l === "html:interactive" ||
    l === "html:preview" ||
    l === "widget" ||
    l === "live" ||
    l === "guide" ||
    l === "sandbox" ||
    l === "playground" ||
    l.startsWith("interactive:") ||
    l.startsWith("widget:") ||
    l.startsWith("guide:")
  );
}

function extractWidgetTitle(lang: string) {
  if (lang.includes(":")) {
    const parts = lang.split(":");
    if (
      parts.length > 1 &&
      parts[1].trim() &&
      parts[1].trim() !== "interactive" &&
      parts[1].trim() !== "preview"
    ) {
      return parts.slice(1).join(":").trim();
    }
  }
  return "Interactive Guide";
}

function InteractiveWidget({
  code,
  language,
  title = "Interactive Guide",
}: {
  code: string;
  language: string;
  title?: string;
}) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [key, setKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab !== "preview" || !containerRef.current) return;
    setRuntimeError(null);
    const container = containerRef.current;
    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "interactive-guide-root w-full";
    wrapper.innerHTML = code;
    container.appendChild(wrapper);

    // Extract and execute scripts safely within local container context
    try {
      const scripts = wrapper.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        const scriptBody = oldScript.textContent || "";
        newScript.textContent = `
          (function() {
            try {
              const root = document.currentScript ? document.currentScript.closest('.interactive-guide-root') : document;
              ${scriptBody}
            } catch(err) {
              console.error("Interactive Guide Script Error:", err);
            }
          })();
        `;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    } catch (err: any) {
      console.error(err);
      setRuntimeError(err?.message || "Error running interactive script");
    }
  }, [code, activeTab, key]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-primary/35 bg-card/85 backdrop-blur-xl shadow-2xl transition-all">
      {/* Widget Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-secondary/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Play size={10} className="fill-emerald-400 ml-0.5" />
          </div>
          <span className="mono text-xs font-semibold text-foreground">
            {title}
          </span>
          <span className="mono text-[0.62rem] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium hidden sm:inline">
            Interactive
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
            title="Reset Simulation"
          >
            <RefreshCw size={13} />
          </button>
          <div className="h-3.5 w-px bg-border/60 mx-1" />
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`mono text-[0.68rem] px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            }`}
          >
            Interactive Demo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`mono text-[0.68rem] px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === "code"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            }`}
          >
            Source Code
          </button>
          {activeTab === "code" && (
            <button
              type="button"
              onClick={handleCopy}
              className="ml-1 mono text-[0.68rem] px-2 py-1 rounded-md border border-border/60 text-muted-foreground hover:text-foreground cursor-pointer inline-flex items-center gap-1"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Widget Body */}
      {activeTab === "preview" ? (
        <div className="p-4 sm:p-6 bg-background/50 overflow-x-auto min-h-[120px]">
          {runtimeError && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 mono text-xs text-red-400">
              Simulation Error: {runtimeError}
            </div>
          )}
          <div ref={containerRef} className="w-full" />
        </div>
      ) : (
        <div className="p-4 bg-[#0d1419] overflow-x-auto font-mono text-xs text-[#e6edf3] leading-relaxed">
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

function RawHtmlBlock({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "raw-html-article-embed w-full";
    wrapper.innerHTML = html;
    container.appendChild(wrapper);

    // Re-execute scripts
    const scripts = wrapper.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      const scriptBody = oldScript.textContent || "";
      newScript.textContent = `
        (function() {
          try {
            const root = document.currentScript ? document.currentScript.closest('.raw-html-article-embed') : document;
            ${scriptBody}
          } catch(err) {
            console.error("Direct Script Error:", err);
          }
        })();
      `;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [html]);

  return <div ref={containerRef} className="my-6 w-full overflow-x-auto" />;
}

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
    let inHtmlBlock = false;
    let htmlBuffer: string[] = [];

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

    const flushHtmlBlock = (key: number) => {
      if (htmlBuffer.length > 0) {
        elements.push(
          <RawHtmlBlock key={`html-${key}`} html={htmlBuffer.join("\n")} />
        );
        htmlBuffer = [];
        inHtmlBlock = false;
      }
    };

    lines.forEach((line, index) => {
      // Code block handling
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          if (isInteractiveBlock(codeLanguage)) {
            elements.push(
              <InteractiveWidget
                key={`interactive-${index}`}
                code={codeBuffer.join("\n")}
                language={codeLanguage}
                title={extractWidgetTitle(codeLanguage)}
              />
            );
          } else {
            elements.push(
              <CodeBlock
                key={`code-${index}`}
                code={codeBuffer.join("\n")}
                language={codeLanguage}
              />
            );
          }
          codeBuffer = [];
          inCodeBlock = false;
          codeLanguage = "";
        } else {
          flushBlockquote(index);
          flushHtmlBlock(index);
          inCodeBlock = true;
          codeLanguage = line.trim().replace(/^```/, "").trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Raw multi-line HTML block detection (<style>, <script>, <div, <section, <canvas, <table, <form, <details)
      const trimmed = line.trim();
      const isHtmlTagStart = /^<(style|script|div|section|canvas|svg|details|table|form|iframe|figure)(\s|>)/i.test(
        trimmed
      );

      if (isHtmlTagStart && !inHtmlBlock) {
        flushBlockquote(index);
        inHtmlBlock = true;
        htmlBuffer.push(line);
        return;
      }

      if (inHtmlBlock) {
        htmlBuffer.push(line);
        const isHtmlTagEnd = /<\/(style|script|div|section|canvas|svg|details|table|form|iframe|figure)>$/i.test(
          trimmed
        );
        if (isHtmlTagEnd) {
          flushHtmlBlock(index);
        }
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
    flushHtmlBlock(lines.length);
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
  const viewRecordedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedLike = localStorage.getItem(`liked_blog_${blog.slug}`);
    if (storedLike === "true") {
      setHasLiked(true);
    }

    const viewKey = `viewed_blog_${blog.slug}`;
    const alreadyViewed = localStorage.getItem(viewKey);

    if (!alreadyViewed && !viewRecordedRef.current) {
      viewRecordedRef.current = true;
      localStorage.setItem(viewKey, "true");

      fetch(`/api/blogs/${blog.slug}/view`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && typeof data.views === "number") {
            setViewsCount(data.views);
          }
        })
        .catch(() => {});
    }
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
        window.location.replace("/blog");
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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/50 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="relative flex flex-col items-center gap-5 p-8 rounded-3xl border border-red-500/30 bg-card/85 backdrop-blur-2xl shadow-2xl max-w-sm text-center">
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
              <span>Redirecting to blog index...</span>
            </div>
          </div>
        </div>
      )}

      <article className="mx-auto max-w-3xl py-12 md:py-16">
        <div className="mb-8 border-b border-border/40 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="mono text-xs text-primary font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-primary/10 border border-primary/25">
                {blog.category}
              </span>
              <span className="mono text-xs text-muted-foreground">
                {blog.readTime}
              </span>
              <span className="mono text-xs text-muted-foreground hidden sm:inline">
                · {blog.publishedAt}
              </span>
            </div>

            <div className="flex items-center gap-2">
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
            <p className="mt-4 text-lg md:text-xl font-serif text-muted-foreground italic leading-relaxed">
              &ldquo;{blog.excerpt}&rdquo;
            </p>
          )}

          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="mono text-[0.7rem] px-2 py-0.5 rounded-md bg-secondary/40 text-foreground/75 border border-border/40"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <BlogContentRenderer content={blog.content} />

        <div className="my-14 rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                <Flame size={16} className="text-primary animate-pulse" />
                <span className="mono text-xs font-semibold uppercase tracking-wider text-primary">
                  Enjoyed this article?
                </span>
              </div>
              <p className="text-sm text-foreground/75 font-sans leading-relaxed">
                Applaud this journal entry and support technical writings.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-border/70 bg-secondary/40 text-muted-foreground shadow-sm">
                <Eye size={15} className="text-primary" />
                <span className="mono text-xs font-medium text-foreground">
                  {viewsCount.toLocaleString()}
                </span>
                <span className="mono text-[0.65rem] text-muted-foreground">
                  {viewsCount === 1 ? "view" : "views"}
                </span>
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
                  className={`group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
                    hasLiked
                      ? "border-red-500/50 bg-red-500/15 text-red-400 shadow-red-500/20 ring-2 ring-red-500/25"
                      : "border-border/80 bg-secondary/40 text-foreground hover:border-red-400 hover:text-red-400 hover:bg-red-500/10"
                  }`}
                >
                  <Heart
                    size={17}
                    className={`transition-all duration-300 ${
                      hasLiked
                        ? "fill-red-500 text-red-500 scale-110"
                        : "text-foreground/80 group-hover:text-red-400 group-hover:scale-110"
                    }`}
                  />
                  <span className="mono text-xs font-semibold">
                    {hasLiked ? "Liked" : "Like"}
                  </span>
                  <span className="mono text-xs px-2 py-0.5 rounded-full bg-background/80 border border-border/60 text-foreground font-mono">
                    {likesCount}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-10">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6 md:p-8 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 p-4 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/40 bg-card/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
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
