"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MapPin } from "lucide-react";
import { FaJava } from "react-icons/fa";
import { SiCplusplus, SiGo } from "react-icons/si";

import { profile, SECTION_IDS } from "@/lib/site-data";

const LANGUAGES = [
  {
    name: "Java",
    icon: FaJava,
    role: "My everyday language for services",
    body: "I build REST APIs with Spring Boot and Spring AI, and shipped a team Android app in it. Java taught me clean structure, real testing, and writing code other people can pick up and run with.",
    usedIn: ["TripWise", "Mood Tracker"],
  },
  {
    name: "C++",
    icon: SiCplusplus,
    role: "Where I go when performance matters",
    body: "I wrote ArenaNet, a C++20 multiplayer backend with async TCP on Asio, matchmaking, and ELO rankings. C++ taught me to think about memory, concurrency, and every byte on the wire.",
    usedIn: ["ArenaNet"],
  },
  {
    name: "Go",
    icon: SiGo,
    role: "The language of cloud-native infra",
    body: "I contribute Go to Volcano-sh, a CNCF Kubernetes scheduler, including tracking down a Redis pipeline bug that was silently aborting GC batches. Go showed me how real distributed systems get reviewed and shipped.",
    usedIn: ["Volcano-sh"],
  },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

export function AboutSection() {
  const reduce = useReducedMotion();
  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.7, delay, ease },
        };

  return (
    <section
      id={SECTION_IDS.about}
      aria-labelledby="about-heading"
      className="page-wrap section-rule scroll-mt-8 py-24 md:py-32"
    >
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
        {/* Story */}
        <motion.div {...rise()}>
          <div className="mono section-label flex items-center gap-3">
            <span className="section-number">01</span>
            <span className="section-dash" />
            <span>About me</span>
          </div>
          <h2
            id="about-heading"
            className="serif mt-7 max-w-xl text-5xl leading-[.95] tracking-[-.035em] md:text-7xl"
          >
            I like the parts <span className="italic text-primary">nobody sees.</span>
          </h2>

          <div className="mt-8 max-w-xl space-y-5 text-[0.95rem] leading-8 text-foreground/75">
            <p>
              I&apos;m Harman, a final-year Computer Science student at the University of
              Alberta. I&apos;m happiest on the backend: the services, queues and data layers
              that quietly keep a product standing once real traffic shows up.
            </p>
            <p>
              Most of what I build lives in <span className="text-foreground">Java</span>,{" "}
              <span className="text-foreground">C++</span> and{" "}
              <span className="text-foreground">Go</span>. Each one taught me something
              different about writing systems that hold up. I reach for Python and TypeScript
              when the job calls for it, like <span className="serif italic text-primary text-[1.08em]">Lyra</span>,
              the AI vocal studio I&apos;m building right now.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="mono inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[0.65rem] uppercase tracking-wider text-primary">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              Open to Summer 2027 internships
            </span>
            <span className="mono inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/30 px-3 py-1 text-[0.65rem] uppercase tracking-wider text-foreground/70">
              <MapPin size={11} />
              {profile.location}
            </span>
          </div>
        </motion.div>

        {/* Illustration */}
        <motion.figure {...rise(0.12)} className="relative">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(closest-side,hsl(var(--primary)/0.22),transparent)] blur-2xl"
          />
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/about-coder.svg"
              alt="A programmer seen from behind, coding at a desk lit by three monitors in a dark room"
              className="block h-auto w-full"
              width={640}
              height={520}
            />
          </div>
          <figcaption className="mono mt-3 text-right text-[0.65rem] uppercase tracking-widest text-muted-foreground">
            Late nights, green builds
          </figcaption>
        </motion.figure>
      </div>

      {/* Language cards */}
      <div className="mt-20 grid gap-5 md:grid-cols-3">
        {LANGUAGES.map((lang, i) => {
          const Icon = lang.icon;
          return (
            <motion.article
              key={lang.name}
              {...rise(0.08 * i)}
              className="group relative flex flex-col rounded-2xl border border-border/60 bg-card/55 p-6 backdrop-blur-md transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="serif text-2xl leading-none text-foreground">{lang.name}</h3>
                  <p className="mono mt-1 text-[0.6rem] uppercase tracking-wider text-primary/90">
                    {lang.role}
                  </p>
                </div>
              </div>
              <p className="mt-5 flex-1 text-sm leading-7 text-foreground/72">{lang.body}</p>
              <div className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-4">
                <span className="mono text-[0.58rem] uppercase tracking-wider text-muted-foreground">
                  Used in
                </span>
                {lang.usedIn.map((name) => (
                  <span
                    key={name}
                    className="mono rounded-md border border-border/60 bg-secondary/30 px-2 py-0.5 text-[0.6rem] text-foreground/85"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
