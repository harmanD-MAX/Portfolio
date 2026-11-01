"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiCplusplus,
  SiPostgresql,
  SiMysql,
  SiGo,
  SiRedis,
  SiMongodb,
  SiDocker,
  SiKubernetes,
  SiGit,
  SiGithubactions,
  SiLinux,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiExpress,
  SiSpringboot,
  SiDotnet,
  SiGoogle,
  SiSpring,
  SiFirebase,
  SiCloudflare,
  SiAndroid,
} from "react-icons/si";
import {
  FaJava,
  FaAws,
  FaDatabase,
    FaJira,
  FaRobot,
  FaCheckCircle,
  FaCodeBranch,
  FaBug,
  FaSyncAlt,
} from "react-icons/fa";
import { TbApi, TbBrandAzure, TbNetwork, TbWaveSine } from "react-icons/tb";

import { SECTION_IDS, skills } from "@/lib/site-data";

import { Wireframe3D } from "./wireframe-3d";

const skillIconMap: Record<string, React.ElementType> = {
  Java: FaJava,
  "C++": SiCplusplus,
  Go: SiGo,
  Python: SiPython,
  TypeScript: SiTypescript,
  JavaScript: SiJavascript,
  SQL: FaDatabase,
  "Distributed systems": TbNetwork,
  "REST APIs": TbApi,
  PostgreSQL: SiPostgresql,
  MySQL: SiMysql,
  Redis: SiRedis,
  MongoDB: SiMongodb,
  Kubernetes: SiKubernetes,
  Docker: SiDocker,
  AWS: FaAws,
  Azure: TbBrandAzure,
  Firebase: SiFirebase,
  Cloudflare: SiCloudflare,
  "CI/CD": FaSyncAlt,
  "GitHub Actions": SiGithubactions,
  Linux: SiLinux,
  Git: SiGit,
  "Spring Boot": SiSpringboot,
  ".NET / ASP.NET Core": SiDotnet,
  "Node.js": SiNodedotjs,
  Express: SiExpress,
  React: SiReact,
  "Next.js": SiNextdotjs,
  Android: SiAndroid,
  Gemini: SiGoogle,
  "Spring AI": SiSpring,
  LLMs: FaRobot,
  "Diffusion models": TbWaveSine,
  "Code reviews": FaCodeBranch,
  "Unit and E2E testing": FaCheckCircle,
  Debugging: FaBug,
  "Agile/Scrum": FaJira,
};

// Single source of truth: categories and items come from site-data.
type SkillGroupTitle = (typeof skills)[number]["title"];
const skillGroups = Object.fromEntries(
  skills.map((group) => [group.title, group.items as readonly string[]]),
) as Record<SkillGroupTitle, readonly string[]>;

type SkillGroupKey = keyof typeof skillGroups;

function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(element);
    const fallback = window.setTimeout(() => setIsVisible(true), 280);
    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  return { ref, className: `reveal${isVisible ? " is-visible" : ""}` };
}

function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mono section-label flex items-center gap-3">
      <span className="section-number">{number}</span>
      <span className="section-dash" />
      <span>{children}</span>
    </div>
  );
}

export function SkillsSection() {
  const skillsReveal = useReveal<HTMLDivElement>();
  const [activeGroup, setActiveGroup] = useState<SkillGroupKey>("Languages");
  const visibleSkills = useMemo(() => skillGroups[activeGroup], [activeGroup]);

  return (
    <section
      id={SECTION_IDS.skills}
      aria-labelledby="skills-title"
      className="page-wrap section-rule scroll-mt-8 py-24 md:py-32"
    >
      <div className="grid gap-14 md:grid-cols-[.85fr_1.15fr] md:gap-24">
        <div>
          <SectionLabel number="03">Skills & arsenal</SectionLabel>
          <h2
            id="skills-title"
            className="serif mt-7 max-w-md text-5xl leading-[.95] tracking-[-.035em] md:text-7xl"
          >
            Tools are just <span className="italic text-[hsl(var(--primary))]">verbs.</span>
          </h2>
          <p className="mt-8 max-w-xs text-sm leading-7 text-[hsl(var(--foreground)/.56)]">
            A structured view of the tools, frameworks, and domains I work across.
          </p>
          <Wireframe3D
            shape="cube"
            inner="octahedron"
            rings={1}
            nodes
            speed={-0.24}
            className="mt-12 hidden w-40 opacity-80 md:block lg:w-48"
          />
        </div>

        <div ref={skillsReveal.ref} className={`${skillsReveal.className} pt-1`}>
          <div className="skill-tabs" role="tablist" aria-label="Skill categories">
            {(Object.keys(skillGroups) as SkillGroupKey[]).map((group) => (
              <button
                key={group}
                type="button"
                role="tab"
                aria-selected={activeGroup === group}
                className={`skill-tab mono ${activeGroup === group ? "is-selected" : ""}`}
                onClick={() => setActiveGroup(group)}
              >
                {group}
              </button>
            ))}
          </div>

          <div className="skill-cloud" role="tabpanel">
            {visibleSkills.map((skill, index) => {
              const Icon = skillIconMap[skill];
              return (
                <span
                  data-testid={`skill-${skill.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  key={`${activeGroup}-${skill}`}
                  className="skill-pill mono inline-flex items-center gap-2 cursor-default select-none"
                  style={{ animationDelay: `${index * 35}ms` }}
                >
                  {Icon && <Icon className="size-3.5 opacity-80 transition-transform group-hover:scale-110" />}
                  <span>{skill}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
