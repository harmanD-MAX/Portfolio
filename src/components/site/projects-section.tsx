"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ExternalLink, Sparkles, Award } from "lucide-react";
import { projects, SECTION_IDS, ProjectEntry } from "@/lib/site-data";

function SectionLabel({ number, children }: { number: string; children: string }) {
  return (
    <div className="mono section-label flex items-center gap-3">
      <span className="section-number">{number}</span>
      <span className="section-dash" />
      <span>{children}</span>
    </div>
  );
}

export function ProjectsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  // Track active project as cards pin/stack at the top during scroll
  useEffect(() => {
    const handleScroll = () => {
      // Top pinning threshold (corresponds to sticky top-28 offset ~110px)
      const topOffset = 140;

      let currentActive = 0;
      cardRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // If the card has reached or passed the top pinning zone
        if (rect.top <= topOffset) {
          currentActive = index;
        }
      });

      setActiveIndex(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial sync

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToProject = (index: number) => {
    const el = cardRefs.current[index];
    if (el) {
      const topOffset = 110;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - topOffset,
        behavior: "smooth",
      });
    }
  };

  const activeProject = projects[activeIndex] || projects[0];

  return (
    <section
      id={SECTION_IDS.projects}
      aria-labelledby="projects-heading"
      className="page-wrap section-rule scroll-mt-8 py-24 md:py-32"
    >
      {/* Section Header */}
      <div className="mb-14 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
        <div>
          <SectionLabel number="04">Selected work</SectionLabel>
          <h2
            id="projects-heading"
            className="serif mt-6 text-5xl leading-[.95] tracking-[-.035em] md:text-7xl"
          >
            Built with <span className="italic text-[hsl(var(--primary))]">care.</span>
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-7 text-[hsl(var(--foreground)/.58)] font-sans">
          Distributed backends, AI systems, and cloud-native applications. Scroll to turn through each project page.
        </p>
      </div>

      {/* Split Timeline Layout: Left Sticky Index + Right Paged Stacking Deck */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left Column: Neat & Clean Sticky Project Index (Desktop) */}
        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-28 flex flex-col gap-5 rounded-2xl border border-[hsl(var(--border)/.6)] bg-[hsl(var(--card)/.75)] p-6 backdrop-blur-xl shadow-xl">
            {/* Active Page Counter */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <span className="mono text-xs text-primary font-semibold tracking-wider uppercase">
                Project 0{activeIndex + 1} / 0{projects.length}
              </span>
            </div>

            {/* Active Project Title & Kicker */}
            <div key={activeProject.name} className="animate-fadeIn flex flex-col gap-1 min-h-[4.5rem] justify-center">
              <span className="mono text-[0.65rem] uppercase tracking-widest text-primary/90 font-medium">
                {activeProject.kicker}
              </span>
              <h3 className="serif text-3xl font-normal tracking-tight text-foreground truncate">
                {activeProject.name}
              </h3>
            </div>

            {/* Interactive Timeline Index Navigator */}
            <div className="border-t border-border/40 pt-4">
              <span className="mono text-[0.58rem] text-muted-foreground uppercase tracking-wider block mb-2.5">
                Index
              </span>
              <nav className="flex flex-col gap-1" aria-label="Projects Index">
                {projects.map((project, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={project.name}
                      type="button"
                      onClick={() => scrollToProject(idx)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all text-xs mono cursor-pointer ${
                        isActive
                          ? "bg-primary/15 text-primary font-semibold border-l-2 border-primary pl-3.5"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[0.62rem] opacity-60">0{idx + 1}</span>
                        <span className="font-sans text-xs">{project.name}</span>
                      </div>
                      {isActive && (
                        <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Right Column: Neat Paged Stacking Cards */}
        <div className="lg:col-span-8 flex flex-col gap-16 md:gap-24 pb-20">
          {projects.map((project, index) => {
            const isActive = index === activeIndex;
            return (
              <article
                key={project.name}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                style={{
                  zIndex: 10 + index,
                }}
                className={`sticky top-24 md:top-28 flex flex-col justify-between rounded-2xl border bg-[hsl(var(--card)/.98)] p-6 md:p-7 backdrop-blur-2xl shadow-2xl transition-all duration-300 ${
                  isActive
                    ? "border-primary/55 ring-1 ring-primary/25 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    : "border-border/60 hover:border-border"
                }`}
              >
                {/* Neat Card Top Bar */}
                <div className="flex items-center justify-between border-b border-border/40 pb-3.5 mb-5">
                  <div className="flex items-center gap-3">
                    <span className="mono text-[0.65rem] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold border border-primary/25">
                      0{index + 1}
                    </span>
                    <span className="mono text-[0.65rem] text-muted-foreground uppercase tracking-wider">
                      {project.kicker}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="mono text-[0.62rem] px-2.5 py-0.5 rounded-full bg-secondary/40 border border-border/70 text-foreground/85 font-medium tracking-wider">
                      {project.stack[0]}
                    </span>
                  </div>
                </div>

                {/* Neat Card Body: 2-Column Responsive Split */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start">
                  {/* Image Column */}
                  <div className="md:col-span-5 relative aspect-[16/10] md:aspect-[4/3] w-full overflow-hidden rounded-xl border border-foreground/10 bg-secondary/30 group">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={`${project.name} preview showcase`}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-secondary flex items-center justify-center text-muted-foreground mono text-xs">
                        Showcase
                      </div>
                    )}
                  </div>

                  {/* Content Column */}
                  <div className="md:col-span-7 flex flex-col justify-between gap-3.5">
                    <div>
                      <h3 className="serif text-2xl md:text-3xl font-normal text-foreground">
                        {project.name}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[hsl(var(--foreground)/.75)] font-sans font-normal">
                        {project.description}
                      </p>
                    </div>

                    {/* Compact Stack Pills */}
                    <div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.stack.map((tag) => (
                          <span
                            key={tag}
                            className="mono text-[0.6rem] px-2 py-0.5 rounded-md border border-border/60 bg-secondary/30 text-foreground/85"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Awards Highlight (if present) */}
                    {project.award && (
                      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={13} className="text-amber-400" />
                          <span className="mono text-[0.6rem] font-semibold uppercase tracking-wider text-amber-400">
                            {project.award.label}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {project.award.links.map((link) => (
                            <a
                              key={link.label}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mono text-[0.68rem] text-foreground/90 hover:text-primary underline-offset-2 hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>{link.label}</span>
                              <ArrowUpRight size={11} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Neat Card Footer */}
                <div className="flex items-center justify-between border-t border-border/40 pt-3.5 mt-5">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <span className="serif text-base font-normal italic tracking-tight text-foreground">
                      h<span className="text-primary not-italic font-mono">_</span>
                    </span>
                    <span className="mono text-[0.6rem] opacity-75">· 2026</span>
                  </span>
                  {project.href && (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                    >
                      <span>Explore Repository</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
