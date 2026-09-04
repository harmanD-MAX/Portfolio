"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { experiences, SECTION_IDS } from "@/lib/site-data";

function useReveal<T extends HTMLElement = HTMLDivElement>() {
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

function SectionLabel({ number, children }: { number: string; children: string }) {
  return (
    <div className="mono section-label">
      <span className="section-number">{number}</span>
      <span className="section-dash" />
      <span>{children}</span>
    </div>
  );
}

export function ExperienceSection() {
  const timeline = useReveal<HTMLDivElement>();

  return (
    <section
      id={SECTION_IDS.experience}
      aria-labelledby="experience-heading"
      className="page-wrap section-rule scroll-mt-8 py-24 md:py-32"
    >
      <div className="grid gap-14 md:grid-cols-[.85fr_1.15fr] md:gap-24">
        <div>
          <SectionLabel number="02">Career</SectionLabel>
          <h2
            id="experience-heading"
            className="serif mt-7 max-w-md text-5xl leading-[.95] tracking-[-.035em] md:text-7xl"
          >
            A trail of <span className="italic text-[hsl(var(--primary))]">useful</span>{" "}
            things.
          </h2>
          <p className="mt-8 max-w-xs text-sm leading-7 text-[hsl(var(--foreground)/.56)]">
            Open source and industry work where I shipped high-reliability backend systems,
            APIs, and cloud infrastructure.
          </p>
        </div>

        <div ref={timeline.ref} className={`${timeline.className} pt-1`}>
          {experiences.map((exp, i) => (
            <div
              key={`${exp.company}-${i}`}
              className={`timeline-item${i < experiences.length - 1 ? " pb-12" : ""}`}
            >
              <div className="timeline-dot" />
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h3 className="text-lg font-semibold">{exp.role}</h3>
                  <p className="mt-1 text-sm text-[hsl(var(--foreground)/.57)]">
                    {exp.company}
                  </p>
                </div>
                <span className="mono text-[hsl(var(--foreground)/.48)]">
                  {exp.duration}
                </span>
              </div>

              <ul className="mt-5 max-w-lg space-y-3">
                {exp.bullets.map((bullet) => (
                  <li
                    key={bullet.slice(0, 48)}
                    className="flex gap-3 text-sm leading-7 text-[hsl(var(--foreground)/.75)]"
                  >
                    <span
                      className="mt-2.5 size-1 shrink-0 rounded-full bg-[var(--bullet)]"
                      aria-hidden
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {exp.certLink && (
                <a
                  href={exp.certLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono mt-5 inline-flex items-center gap-2 text-[hsl(var(--primary))]"
                >
                  {exp.certText || "Certificate available on request"}
                  <ArrowUpRight size={13} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
