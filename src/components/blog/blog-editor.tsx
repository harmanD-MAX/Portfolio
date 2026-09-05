"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  Eye,
  Edit3,
  Columns,
  Save,
  Send,
  Undo,
  Redo,
  Info,
  ChevronLeft,
  Lock,
  Check,
} from "lucide-react";
import { BlogEntity } from "@/server/repositories/blog-repository";
import { BlogContentRenderer } from "./blog-renderer";
import { AuthorAuthModal } from "./author-auth-modal";

interface BlogEditorProps {
  initialBlog?: BlogEntity;
  isEditing?: boolean;
}

const CATEGORIES = [
  "Algorithms",
  "Distributed Systems",
  "Backend Architecture",
  "System Design",
  "Cloud Infrastructure",
  "Generative AI",
];

export function BlogEditor({ initialBlog, isEditing = false }: BlogEditorProps) {
  const router = useRouter();

  // Author Auth state
  const [authorToken, setAuthorToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingPublishStatus, setPendingPublishStatus] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("harman_author_key") ||
        sessionStorage.getItem("harman_author_key");
      if (stored) {
        setAuthorToken(stored);
      }
    }
  }, []);

  // Blog Fields
  const [title, setTitle] = useState(initialBlog?.title || "");
  const [slug, setSlug] = useState(initialBlog?.slug || "");
  const [excerpt, setExcerpt] = useState(initialBlog?.excerpt || "");
  const [category, setCategory] = useState(initialBlog?.category || "Algorithms");
  const [tagsInput, setTagsInput] = useState(initialBlog?.tags.join(", ") || "LeetCode, Algorithms, System Design");
  const [content, setContent] = useState(
    initialBlog?.content ||
      `## Introduction

Write your technical thoughts, code walkthroughs, or system design insights here.

### 1. Key Concept & Theory

Explain the core idea with examples and clear constraints.

\`\`\`cpp
// Sample Code Snippet
#include <iostream>

void solve() {
    std::cout << "Hello from Harman's Engineering Journal!" << std::endl;
}
\`\`\`

> [!NOTE]
> Add architectural notes, trade-offs, and latency considerations here.

### 2. Summary & Takeaways
- Point 1: Systematic pattern recognition
- Point 2: Cache locality & state space compression`
  );

  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStep, setSaveStep] = useState<"idle" | "saving" | "indexing" | "complete">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // History for Undo/Redo
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const pushHistory = (newContent: string) => {
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(newContent);
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
    setContent(newContent);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };

  // Helper to insert markdown tags around selection or at cursor
  const insertFormatting = (prefix: string, suffix = "", defaultText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const selectedText = currentText.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent =
      currentText.substring(0, start) + replacement + currentText.substring(end);

    pushHistory(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 50);
  };

  const triggerSaveWithAuthCheck = (publishDraft: boolean) => {
    if (!authorToken) {
      setPendingPublishStatus(publishDraft);
      setIsAuthModalOpen(true);
      return;
    }
    executeSave(publishDraft, authorToken);
  };

  const executeSave = async (publishDraft: boolean, token: string) => {
    if (!title.trim()) {
      setStatusMessage("Please enter a title.");
      return;
    }
    if (!content.trim()) {
      setStatusMessage("Please write some content.");
      return;
    }

    setIsSaving(true);
    setSaveStep("saving");
    setStatusMessage("Saving article...");

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const generatedSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const wordCount = content.split(/\s+/).length;
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    const payload = {
      title,
      slug: generatedSlug,
      excerpt: excerpt || content.slice(0, 160).replace(/[#*`_]/g, "") + "...",
      content,
      category,
      tags,
      readTime,
      isDraft: publishDraft,
      author: {
        name: "Harman",
        signature: "Harman",
        role: "Backend & Distributed Systems Engineer",
      },
    };

    try {
      const url = isEditing && initialBlog?.slug ? `/api/blogs/${initialBlog.slug}` : "/api/blogs";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-author-key": token,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSaveStep("indexing");
        setTimeout(() => {
          setSaveStep("complete");
        }, 500);

        const targetSlug = data.blog?.slug || generatedSlug;
        router.refresh();
        setTimeout(() => {
          window.location.href = `/blog/${targetSlug}`;
        }, 1200);
      } else {
        setIsSaving(false);
        setSaveStep("idle");
        if (res.status === 401) {
          setIsAuthModalOpen(true);
          setPendingPublishStatus(publishDraft);
        }
        setStatusMessage(`Error: ${data.error || "Failed to save"}`);
      }
    } catch (err) {
      console.error(err);
      setIsSaving(false);
      setSaveStep("idle");
      setStatusMessage("Error communicating with server.");
    }
  };

  const handleAuthSuccess = (token: string) => {
    setAuthorToken(token);
    if (pendingPublishStatus !== null) {
      executeSave(pendingPublishStatus, token);
      setPendingPublishStatus(null);
    }
  };

  return (
    <>
      {/* Animated Publishing & Saving Overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative flex flex-col items-center gap-5 p-8 rounded-3xl border border-primary/30 bg-card/90 shadow-2xl max-w-sm text-center">
            {/* Glowing Ring Animation */}
            <div className="relative flex items-center justify-center size-20 rounded-2xl bg-primary/15 border border-primary/40 text-primary">
              {saveStep === "complete" ? (
                <div className="flex items-center justify-center size-12 rounded-full bg-emerald-500 text-white animate-in zoom-in-75 duration-300">
                  <Check size={28} />
                </div>
              ) : (
                <>
                  <Send size={28} className="animate-pulse text-primary" />
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary/40 animate-ping opacity-75" />
                </>
              )}
            </div>

            <div>
              <h3 className="serif text-2xl font-normal text-foreground">
                {saveStep === "complete"
                  ? "Article Published!"
                  : saveStep === "indexing"
                  ? "Synchronizing Route..."
                  : "Publishing to Database..."}
              </h3>
              <p className="mono text-xs text-muted-foreground mt-1.5">
                {saveStep === "complete"
                  ? "Redirecting to your live article..."
                  : "Saving content, formatting, and tags..."}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-48 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full bg-primary rounded-full transition-all duration-500 ${
                  saveStep === "saving"
                    ? "w-1/2 animate-pulse"
                    : saveStep === "indexing"
                    ? "w-5/6"
                    : "w-full bg-emerald-500"
                }`}
              />
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-6xl py-8 md:py-12">
        {/* Top Header / Actions Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/blog")}
              className="inline-flex items-center gap-1.5 mono text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Back to Journal</span>
            </button>
            <span className="mono text-xs text-muted-foreground">/</span>
            <span className="mono text-xs text-primary font-semibold">
              {isEditing ? "Edit Article" : "Write New Article"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {statusMessage && (
              <span className="mono text-xs text-primary font-medium">
                {statusMessage}
              </span>
            )}

            {!authorToken && (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="mono text-xs px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Lock size={12} />
                <span>Author Passkey</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => triggerSaveWithAuthCheck(true)}
              disabled={isSaving}
              className="mono text-xs px-4 py-2 rounded-full border border-border/80 bg-card/60 text-foreground hover:border-primary hover:text-primary transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save size={13} />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => triggerSaveWithAuthCheck(false)}
              disabled={isSaving}
              className="mono text-xs px-5 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-primary/25 cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send size={13} />
              <span>{isEditing ? "Update & Publish" : "Publish Article"}</span>
            </button>
          </div>
        </div>

        {/* Article Settings & Metadata Card */}
        <div className="mb-6 rounded-2xl border border-border/60 bg-[hsl(var(--card)/.75)] p-6 backdrop-blur-xl shadow-lg">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {/* Title */}
            <div className="md:col-span-8 flex flex-col gap-1.5">
              <label className="mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                Article Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pattern Recognition in LeetCode: Dynamic Programming"
                className="w-full rounded-xl border border-border/80 bg-background/60 px-4 py-2.5 font-serif text-xl md:text-2xl text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Category */}
            <div className="md:col-span-4 flex flex-col gap-1.5">
              <label className="mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border/80 bg-background/60 px-4 py-3 font-sans text-sm text-foreground focus:border-primary focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-card text-foreground">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Slug */}
            <div className="md:col-span-6 flex flex-col gap-1.5">
              <label className="mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                URL Slug (Optional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. pattern-recognition-leetcode-dp"
                className="w-full rounded-xl border border-border/80 bg-background/60 px-3.5 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Tags */}
            <div className="md:col-span-6 flex flex-col gap-1.5">
              <label className="mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="LeetCode, C++, Distributed Systems"
                className="w-full rounded-xl border border-border/80 bg-background/60 px-3.5 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Excerpt */}
            <div className="md:col-span-12 flex flex-col gap-1.5">
              <label className="mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                Short Excerpt / Summary
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A concise synopsis of the engineering problem and takeaway..."
                className="w-full rounded-xl border border-border/80 bg-background/60 px-3.5 py-2 font-sans text-xs md:text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Google Docs-Style Formatting Toolbar */}
        <div className="sticky top-20 z-30 mb-4 rounded-xl border border-border/80 bg-[hsl(var(--card)/.95)] p-2 backdrop-blur-xl shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Text & Style Formatting Tools */}
            <div className="flex flex-wrap items-center gap-1">
              {/* History */}
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex === 0}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-30 cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <Undo size={14} />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex === history.length - 1}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-30 cursor-pointer"
                title="Redo (Ctrl+Y)"
              >
                <Redo size={14} />
              </button>

              <div className="h-4 w-px bg-border/60 mx-1" />

              {/* Headings */}
              <button
                type="button"
                onClick={() => insertFormatting("# ", "", "Large Heading")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                title="Heading 1"
              >
                <Heading1 size={15} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("## ", "", "Section Heading")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                title="Heading 2"
              >
                <Heading2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("### ", "", "Subheading")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                title="Heading 3"
              >
                <Heading3 size={15} />
              </button>

              <div className="h-4 w-px bg-border/60 mx-1" />

              {/* Inlines */}
              <button
                type="button"
                onClick={() => insertFormatting("**", "**", "bold text")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                title="Bold"
              >
                <Bold size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*", "italic text")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                title="Italic"
              >
                <Italic size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("`", "`", "inline_code()")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                title="Inline Code"
              >
                <Code size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("[", "](https://example.com)", "Link Title")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                title="Insert Link"
              >
                <Link2 size={14} />
              </button>

              <div className="h-4 w-px bg-border/60 mx-1" />

              {/* Blocks */}
              <button
                type="button"
                onClick={() => insertFormatting("```cpp\n", "\n```", "// Write code here")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                title="Code Block"
              >
                <Code size={14} className="text-primary" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("> ", "", "Notable quote or key takeaway")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                title="Blockquote"
              >
                <Quote size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("> [!NOTE]\n> ", "", "Important architectural tip")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                title="Alert Callout Box"
              >
                <Info size={14} className="text-primary" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("- ", "", "Bullet item")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                title="Bullet List"
              >
                <List size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("1. ", "", "First step")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                title="Numbered List"
              >
                <ListOrdered size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("\n---\n")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                title="Divider Line"
              >
                <Minus size={14} />
              </button>
            </div>

            {/* View Mode Switcher (Edit / Split / Preview) */}
            <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-secondary/30 p-1">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className={`px-2.5 py-1 rounded-md text-[0.65rem] mono transition-all cursor-pointer ${
                  viewMode === "edit"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Edit3 size={11} className="inline mr-1" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`hidden md:inline-flex px-2.5 py-1 rounded-md text-[0.65rem] mono transition-all cursor-pointer ${
                  viewMode === "split"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Columns size={11} className="inline mr-1" />
                Split
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`px-2.5 py-1 rounded-md text-[0.65rem] mono transition-all cursor-pointer ${
                  viewMode === "preview"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye size={11} className="inline mr-1" />
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* Editor & Live Preview Workspace */}
        <div
          className={`grid gap-6 ${
            viewMode === "split"
              ? "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-1"
          }`}
        >
          {/* Editor Area */}
          {(viewMode === "edit" || viewMode === "split") && (
            <div className="flex flex-col rounded-2xl border border-border/60 bg-[#0c1216] p-4 md:p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3">
                <span className="mono text-[0.62rem] text-muted-foreground uppercase tracking-wider">
                  Markdown & Rich Editor
                </span>
                <span className="mono text-[0.62rem] text-muted-foreground">
                  {content.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => pushHistory(e.target.value)}
                placeholder="Write your article in markdown or use the Google Docs toolbar above..."
                rows={24}
                className="w-full flex-1 resize-y bg-transparent font-mono text-sm leading-relaxed text-[#e6edf3] focus:outline-none min-h-[500px]"
              />
            </div>
          )}

          {/* Live Preview Area */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div className="rounded-2xl border border-border/60 bg-[hsl(var(--card)/.7)] p-6 md:p-8 backdrop-blur-xl shadow-xl overflow-y-auto max-h-[750px]">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-6">
                <span className="mono text-[0.62rem] text-primary font-semibold uppercase tracking-wider">
                  Live Document Preview
                </span>
                <span className="mono text-[0.62rem] text-muted-foreground">
                  Reader View
                </span>
              </div>

              {/* Preview Render */}
              <div>
                <span className="mono text-[0.65rem] text-primary uppercase tracking-widest font-semibold block mb-1">
                  {category}
                </span>
                <h1 className="serif text-3xl md:text-4xl font-normal text-foreground leading-tight">
                  {title || "Untitled Article"}
                </h1>
                {excerpt && (
                  <p className="text-sm text-foreground/75 font-sans mt-2 mb-6 italic">
                    {excerpt}
                  </p>
                )}

                <hr className="my-6 border-border/40" />

                <BlogContentRenderer content={content} />

                {/* Cursive Signature Preview */}
                <div className="mt-12 border-t border-border/40 pt-6 flex items-center justify-between">
                  <div>
                    <span className="mono text-[0.6rem] text-muted-foreground block">
                      Author
                    </span>
                    <span className="font-sans text-sm font-semibold text-foreground">
                      Harman
                    </span>
                  </div>
                  <div className="font-cursive text-4xl text-primary font-bold">
                    Harmanpreet Singh
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthorAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        actionTitle="Harman Author Passkey Required"
      />
    </>
  );
}
