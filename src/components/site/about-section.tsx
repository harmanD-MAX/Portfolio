"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FaJava } from "react-icons/fa";
import { SiCplusplus, SiGo } from "react-icons/si";

import { SECTION_IDS } from "@/lib/site-data";

import { Tilt3D } from "./tilt-3d";

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
          initial: { opacity: 0, y: 28, rotateX: 14 },
          whileInView: { opacity: 1, y: 0, rotateX: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.7, delay, ease },
        };

  return (
    <section
      id={SECTION_IDS.about}
      aria-labelledby="about-heading"
      className="page-wrap section-rule scroll-mt-8 py-24 md:py-32"
    >
      <div className="grid gap-12 md:grid-cols-[.85fr_1.15fr] md:gap-24 [perspective:1200px]">
        <motion.div {...rise()} style={{ transformOrigin: "50% 100%" }}>
          <div className="mono section-label flex items-center gap-3">
            <span className="section-number">01</span>
            <span className="section-dash" />
            <span>About me</span>
          </div>
          <h2
            id="about-heading"
            className="serif heading-3d mt-7 max-w-md text-5xl leading-[.95] tracking-[-.035em] md:text-7xl"
          >
            I like the parts <span className="italic text-primary">nobody sees.</span>
          </h2>
        </motion.div>

        <motion.div
          {...rise(0.1)}
          style={{ transformOrigin: "50% 100%" }}
          className="max-w-xl space-y-5 pt-1 text-[0.95rem] leading-8 text-foreground/75 md:pt-14"
        >
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
            when the job calls for it, like{" "}
            <span className="serif italic text-primary text-[1.08em]">Lyra</span>, the AI
            vocal studio I&apos;m building right now.
          </p>
        </motion.div>
      </div>

      {/* Language cards: 3D tilt with raised layers */}
      <div className="mt-16 grid gap-6 md:mt-20 md:grid-cols-3 [perspective:1200px]">
        {LANGUAGES.map((lang, i) => {
          const Icon = lang.icon;
          return (
            <motion.div key={lang.name} {...rise(0.08 * i)} style={{ transformOrigin: "50% 100%" }}>
              <Tilt3D className="surface-3d h-full rounded-2xl">
                <article className="flex h-full flex-col p-6">
                  <div className="depth-2 flex items-center gap-3">
                    <span className="icon-3d flex size-11 items-center justify-center rounded-xl text-primary">
                      <Icon size={20} />
                    </span>
                    <div>
                      <h3 className="serif text-2xl leading-none text-foreground">{lang.name}</h3>
                      <p className="mono mt-1 text-[0.6rem] uppercase tracking-wider text-primary/90">
                        {lang.role}
                      </p>
                    </div>
                  </div>
                  <p className="depth-1 mt-5 flex-1 text-sm leading-7 text-foreground/72">{lang.body}</p>
                  <div className="depth-1 mt-5 flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-4">
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
                </article>
              </Tilt3D>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
