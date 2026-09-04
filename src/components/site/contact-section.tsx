"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { profile, SECTION_IDS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type FieldErrors = Partial<
  Record<"name" | "email" | "message", string>
>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const social = [
  {
    label: "GitHub",
    href: profile.github,
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: profile.linkedin,
    icon: Linkedin,
  },
] as const;

export function ContactSection() {
  const reduce = useReducedMotion();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!emailRe.test(email.trim()))
      next.email = "Enter a valid email address.";
    if (!message.trim()) next.message = "Please enter a message.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const subject = encodeURIComponent(`Portfolio contact from ${name.trim()}`);
    const body = encodeURIComponent(
      [
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        date ? `Preferred date: ${date}` : "",
        time ? `Preferred time: ${time}` : "",
        "",
        message.trim(),
      ]
        .filter(Boolean)
        .join("\n"),
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <section
      id={SECTION_IDS.contact}
      className="page-wrap section-rule scroll-mt-8 py-24 md:py-32"
      aria-labelledby="contact-heading"
    >
      <div className="w-full">
        <motion.div
          className="mb-14 md:mb-16"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="mono section-label flex items-center gap-3">
            <span className="section-number">05</span>
            <span className="section-dash" />
            <span>The next page</span>
          </div>
          <h2
            id="contact-heading"
            className="serif mt-7 text-5xl leading-[.88] tracking-[-.04em] md:text-7xl"
          >
            Have a knot to <span className="italic text-[hsl(var(--primary))]">untangle?</span>
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-7 text-[hsl(var(--foreground)/.56)] font-sans">
            Reach out for opportunities, collaborations, or discussing distributed systems and AI.
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            className="space-y-8"
            initial={reduce ? false : { opacity: 0, x: -12 }}
            whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div
              className={cn(
                "rounded-2xl border border-white/[0.08] bg-card p-8",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_8px_32px_-12px_rgba(0,0,0,0.4)]",
              )}
            >
              <h3 className="font-heading text-lg font-semibold">
                Let&apos;s connect
              </h3>
              <div className="mt-5">
                <span className="mono text-[0.68rem] uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Direct Email
                </span>
                <a
                  href={`mailto:${profile.email}`}
                  className="group inline-flex items-center gap-2.5 font-sans text-sm md:text-base text-foreground/90 transition-colors hover:text-primary underline-offset-4 hover:underline"
                >
                  <Mail className="size-4 text-primary shrink-0 transition-transform group-hover:scale-110" />
                  <span>{profile.email}</span>
                </a>
              </div>
              <div className="mt-8 flex gap-3">
                {social.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel={
                      href.startsWith("mailto") ? undefined : "noopener noreferrer"
                    }
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full border border-border/50",
                      "bg-background/30 transition-all hover:shadow-[0_0_20px_var(--social-glow)]",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    )}
                    aria-label={label}
                    title={label}
                  >
                    <Icon className="size-5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, x: 12 }}
            whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <form
              onSubmit={handleSubmit}
              className={cn(
                "rounded-2xl border border-white/[0.08] bg-card p-8",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_8px_32px_-12px_rgba(0,0,0,0.4)]",
              )}
              noValidate
            >
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    name="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name)
                        setErrors((o) => ({ ...o, name: undefined }));
                    }}
                    className={cn(
                      "bg-background/50 transition-shadow duration-200",
                      "focus-visible:shadow-[0_0_0_3px_var(--input-glow)]",
                      errors.name && "border-destructive",
                    )}
                    aria-invalid={!!errors.name}
                    aria-describedby={
                      errors.name ? "contact-name-error" : undefined
                    }
                    autoComplete="name"
                  />
                  {errors.name ? (
                    <p
                      id="contact-name-error"
                      className="text-xs text-destructive"
                      role="alert"
                    >
                      {errors.name}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email)
                        setErrors((o) => ({ ...o, email: undefined }));
                    }}
                    className={cn(
                      "bg-background/50 transition-shadow duration-200",
                      "focus-visible:shadow-[0_0_0_3px_var(--input-glow)]",
                      errors.email && "border-destructive",
                    )}
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? "contact-email-error" : undefined
                    }
                    autoComplete="email"
                  />
                  {errors.email ? (
                    <p
                      id="contact-email-error"
                      className="text-xs text-destructive"
                      role="alert"
                    >
                      {errors.email}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="contact-date">Preferred Date</Label>
                    <Input
                      id="contact-date"
                      name="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-background/50 transition-shadow duration-200 focus-visible:shadow-[0_0_0_3px_var(--input-glow)]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-time">Preferred Time</Label>
                    <Input
                      id="contact-time"
                      name="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="bg-background/50 transition-shadow duration-200 focus-visible:shadow-[0_0_0_3px_var(--input-glow)]"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message)
                        setErrors((o) => ({ ...o, message: undefined }));
                    }}
                    className={cn(
                      "min-h-[120px] resize-y bg-background/50 transition-shadow duration-200",
                      "focus-visible:shadow-[0_0_0_3px_var(--input-glow)]",
                      errors.message && "border-destructive",
                    )}
                    aria-invalid={!!errors.message}
                    aria-describedby={
                      errors.message ? "contact-message-error" : undefined
                    }
                  />
                  {errors.message ? (
                    <p
                      id="contact-message-error"
                      className="text-xs text-destructive"
                      role="alert"
                    >
                      {errors.message}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full rounded-full sm:w-auto sm:px-12 shadow-[0_0_0_1px_var(--btn-ring),0_8px_32px_-8px_var(--btn-glow)]"
                >
                  Send Message
                </Button>
                {submitted ? (
                  <p className="text-sm text-muted-foreground" role="status">
                    If your mail client did not open, you can email directly at{" "}
                    {profile.email}.
                  </p>
                ) : null}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
