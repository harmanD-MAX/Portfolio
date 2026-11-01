"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, BookOpen, Mail, MapPin, Mic } from "lucide-react";

import { profile, SECTION_IDS } from "@/lib/site-data";

import { HeroRotatingTagline } from "./hero-rotating-tagline";
import { ScrollDownIndicator } from "./scroll-down-indicator";



function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function HeroSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id={SECTION_IDS.about}
      className="page-wrap relative flex min-h-[calc(100dvh-4.5rem)] flex-col justify-center py-20 md:py-28"
      aria-labelledby="hero-heading"
    >
      <div className="w-full">
        <div className="max-w-3xl text-left">
          {/* Top Kicker Label */}
          <div className="mono text-xs tracking-widest text-primary uppercase mb-4">
            CS @ UAlberta · Backend · Distributed Systems · Cloud
          </div>

          {/* Main Name Heading in Serif */}
          <motion.h1
            id="hero-heading"
            className="serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[-0.04em] leading-[0.92] text-foreground pb-1"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Harmanpreet <span className="italic text-primary">Singh</span>
          </motion.h1>

          {/* Role Subheading */}
          <motion.p
            className="mt-4 text-base sm:text-lg md:text-xl font-medium text-foreground/90 font-sans tracking-tight"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.6 }}
          >
            {profile.title}
          </motion.p>

          {/* Rotating Tagline Focus Pill */}
          <div className="mt-3 flex justify-start">
            <HeroRotatingTagline />
          </div>

          {/* Editorial Bio Card */}
          <motion.div
            className="relative mt-7 max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-card/55 p-5 sm:p-6 backdrop-blur-md shadow-lg"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.6 }}
          >
            {/* Accent rail */}
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-primary via-primary/50 to-transparent"
            />

            <div className="flex flex-wrap items-center gap-2">
              <span className="mono inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[0.62rem] uppercase tracking-wider text-primary">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
                Open to Summer 2027 internships
              </span>
              <span className="mono inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/30 px-3 py-1 text-[0.62rem] uppercase tracking-wider text-foreground/70">
                <MapPin size={11} />
                {profile.location}
              </span>
            </div>

            <p className="mt-4 text-sm sm:text-base leading-7 sm:leading-8 text-foreground/80 font-sans">
              Final-year CS student building{" "}
              <span className="text-foreground">backend systems, APIs and cloud infrastructure</span>.
              I contribute to{" "}
              <span className="text-primary font-medium">Volcano-sh</span>, a CNCF
              Kubernetes scheduler, and I&apos;m currently building{" "}
              <span className="serif italic text-primary text-[1.08em]">Lyra</span>, an
              AI vocal studio. Looking for Summer 2027 software engineering internships.
            </p>
          </motion.div>

          {/* Now Building: Lyra demo callout */}
          <motion.a
            href={`mailto:${profile.email}?subject=${encodeURIComponent("Lyra demo")}&body=${encodeURIComponent("Hi Harman, I'd like to set up a demo of Lyra.")}`}
            className="group mt-4 flex max-w-2xl items-center gap-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/12 via-card/50 to-card/40 p-4 backdrop-blur-md transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.55 }}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 text-primary">
              <Mic size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="mono block text-[0.6rem] uppercase tracking-widest text-primary">
                Now building · Lyra
              </span>
              <span className="mt-0.5 block text-sm text-foreground/85 font-sans">
                Working on Lyra, an AI vocal studio. Email me to set up a live demo.
              </span>
            </span>
            <span className="mono hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-primary-foreground transition-transform group-hover:translate-x-0.5">
              Book a demo
              <Mail size={12} />
            </span>
            <Mail size={16} className="sm:hidden shrink-0 text-primary" />
          </motion.a>

          {/* Action Buttons */}
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-4"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <button
              type="button"
              onClick={() => scrollTo(SECTION_IDS.projects)}
              className="mono text-xs uppercase tracking-wider px-7 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-primary/20 cursor-pointer inline-flex items-center gap-2 group"
            >
              <span>View Projects</span>
              <ArrowDown size={13} className="transition-transform group-hover:translate-y-0.5" />
            </button>

            <Link
              href="/blog"
              className="mono text-xs uppercase tracking-wider px-7 py-3 rounded-full border border-border/80 bg-card/60 backdrop-blur-md text-foreground hover:border-primary hover:text-primary transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm group"
            >
              <span>Read Articles</span>
              <BookOpen size={13} className="transition-transform group-hover:scale-110" />
            </Link>
          </motion.div>
        </div>
      </div>
      <ScrollDownIndicator />
    </section>
  );
}
