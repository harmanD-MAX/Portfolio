"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";

import { hyperspeedPresets } from "@/components/hyperspeed/HyperSpeedPresets";
import { SECTION_IDS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const Hyperspeed = dynamic(
  () => import("@/components/hyperspeed/Hyperspeed"),
  { ssr: false },
);

type HyperspeedEffect = NonNullable<
  ComponentProps<typeof Hyperspeed>["effectOptions"]
>;

const presetOne = hyperspeedPresets.one as unknown as HyperspeedEffect;

function computeHeroLit(): boolean {
  const el = document.getElementById(SECTION_IDS.about);
  if (!el) return true;
  const rect = el.getBoundingClientRect();
  const center = rect.top + rect.height * 0.35;
  return center > 0 && center < window.innerHeight * 0.92;
}

export function HyperspeedBackground() {
  const [heroInView, setHeroInView] = useState(true);

  useEffect(() => {
    const onScroll = () => setHeroInView(computeHeroLit());
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div
        className={cn(
          "absolute inset-y-0 -left-[25vw] w-[150vw] -z-10 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]",
          heroInView
            ? "opacity-[0.92] translate-x-0 lg:translate-x-[25vw]"
            : "opacity-[0.52] translate-x-0",
        )}
      >
        <Hyperspeed effectOptions={presetOne} />
      </div>
      <div
        className={cn(
          "absolute inset-0 -z-10 bg-gradient-to-b transition-opacity duration-700",
          heroInView
            ? "from-background/45 via-background/28 to-background/55 dark:from-background/70 dark:via-background/50 dark:to-background/70"
            : "from-background/82 via-background/76 to-background/88 dark:from-background/90 dark:via-background/85 dark:to-background/90",
        )}
      />
      <div
        className={cn(
          "absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--accent-glow),transparent)] transition-opacity duration-700",
          heroInView ? "opacity-50" : "opacity-40",
        )}
      />
    </div>
  );
}
