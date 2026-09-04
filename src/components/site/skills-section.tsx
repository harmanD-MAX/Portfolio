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
  SiDatastax,
  SiDocker,
  SiKubernetes,
  SiGit,
  SiGithubactions,
  SiLinux,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiDjango,
  SiFlask,
  SiFastapi,
  SiSpringboot,
  SiDotnet,
  SiGraphql,
  SiGoogle,
  SiSpring,
} from "react-icons/si";
import {
  FaJava,
  FaAws,
  FaNetworkWired,
  FaProjectDiagram,
  FaJira,
  FaRobot,
  FaCheckCircle,
} from "react-icons/fa";
import { TbBrandAzure, TbNetwork } from "react-icons/tb";

import { SECTION_IDS } from "@/lib/site-data";

const skillIconMap: Record<string, React.ElementType> = {
  Python: SiPython,
  JavaScript: SiJavascript,
  TypeScript: SiTypescript,
  Java: FaJava,
  "C++": SiCplusplus,
  Go: SiGo,
  Redis: SiRedis,
  PostgreSQL: SiPostgresql,
  MySQL: SiMysql,
  MongoDB: SiMongodb,
  "Astra DB": SiDatastax,
  Asio: FaNetworkWired,
  "TCP/IP": TbNetwork,
  SignalR: SiDotnet,
  Docker: SiDocker,
  Kubernetes: SiKubernetes,
  AWS: FaAws,
  Azure: TbBrandAzure,
  Git: SiGit,
  "GitHub Actions": SiGithubactions,
  "Linux / Shell": SiLinux,
  React: SiReact,
  "Next.js": SiNextdotjs,
  "Node.js": SiNodedotjs,
  Django: SiDjango,
  Flask: SiFlask,
  FastAPI: SiFastapi,
  "Spring Boot": SiSpringboot,
  ".NET": SiDotnet,
  GraphQL: SiGraphql,
  "Gemini AI": SiGoogle,
  "Spring AI": SiSpring,
  "Retrieval & Embeddings": FaRobot,
  SDLC: FaProjectDiagram,
  "Agile / Scrum": FaJira,
  OOD: FaCheckCircle,
  LLD: FaCheckCircle,
  JUnit: FaCheckCircle,
  Espresso: FaCheckCircle,
  "Prompt engineering": FaRobot,
  "GenAI productivity": FaRobot,
};

const skillGroups = {
  Languages: ["Python", "JavaScript", "TypeScript", "Java", "C++", "Go"],
  "Systems & data": [
    "Redis",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Astra DB",
    "Asio",
    "TCP/IP",
    "SignalR",
  ],
  "Cloud & DevOps": [
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "Git",
    "GitHub Actions",
    "Linux / Shell",
  ],
  "Frameworks & AI": [
    "React",
    "Next.js",
    "Node.js",
    "Django",
    "Flask",
    "FastAPI",
    "Spring Boot",
    ".NET",
    "GraphQL",
    "Gemini AI",
    "Spring AI",
    "Retrieval & Embeddings",
  ],
  "Engineering practice": [
    "SDLC",
    "Agile / Scrum",
    "OOD",
    "LLD",
    "JUnit",
    "Espresso",
    "Prompt engineering",
    "GenAI productivity",
  ],
} as const;

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
