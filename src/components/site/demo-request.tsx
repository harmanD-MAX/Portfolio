"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Mail, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { profile } from "@/lib/site-data";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Book a demo" button that expands into a small email form.
 * Like the contact form, it hands off to the visitor's mail app
 * with the request pre-filled (no backend involved).
 */
export function DemoRequest({ project }: { project: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!emailRe.test(value)) {
      setError("Enter a valid email so I can reach you.");
      return;
    }
    setError("");
    const subject = encodeURIComponent(`${project} demo request`);
    const body = encodeURIComponent(
      `Hi Harman,\n\nI'd like to set up a demo of ${project}.\nYou can reach me at: ${value}\n`,
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <div className="w-full">
      <AnimatePresence initial={false} mode="wait">
        {!open ? (
          <motion.button
            key="cta"
            type="button"
            onClick={() => setOpen(true)}
            className="mono inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Mail size={12} />
            Book a demo
          </motion.button>
        ) : sent ? (
          <motion.p
            key="sent"
            className="mono inline-flex items-center gap-2 text-[0.7rem] text-primary"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            role="status"
          >
            <Check size={13} />
            Thanks! Your mail app should open with the request ready to send.
          </motion.p>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            noValidate
            className="flex w-full flex-col gap-1.5"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <label htmlFor={`demo-email-${project}`} className="mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
              Your email, and I&apos;ll set up a live demo of {project}
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                id={`demo-email-${project}`}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                aria-invalid={!!error}
                aria-describedby={error ? `demo-error-${project}` : undefined}
                className="min-w-0 flex-1 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary"
              />
              <button
                type="submit"
                className="mono inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer"
              >
                <Send size={12} />
                <span className="hidden sm:inline">Request</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError("");
                }}
                aria-label="Cancel demo request"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            {error && (
              <p id={`demo-error-${project}`} className="text-xs text-red-400">
                {error}
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
