"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, BookOpen } from "lucide-react";

import { profile, SECTION_IDS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

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
            CS @ University of Alberta · Backend Systems · GenAI
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

          {/* Editorial Bio Copy */}
          <motion.div
            className="mt-6 max-w-2xl space-y-3.5 text-sm sm:text-base leading-relaxed text-foreground/80 font-sans"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.6 }}
          >
            <p>
              CS student focused on backend architecture, request routing, caching,
              and how distributed systems communicate.
            </p>
            <p>
              Deep in generative AI lately — how retrieval, embeddings, and prompt design fit into real production systems.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="mt-9 flex flex-wrap items-center gap-4"
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
