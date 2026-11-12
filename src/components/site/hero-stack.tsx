"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bot,
  Cloud,
  Cpu,
  Network,
  Server,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

import { expertiseLayers } from "@/lib/site-data";

const ICONS: Record<string, LucideIcon> = {
  ai: Bot,
  mobile: Smartphone,
  backend: Server,
  distributed: Network,
  infra: Cloud,
  lowlevel: Cpu,
};

const CYCLE_MS = 3600;
/** Fallback before measuring; real value = tallest layer's details. */
const DEFAULT_DETAIL_HEIGHT = 92;

// useLayoutEffect warns during SSR; fall back to useEffect there.
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Interactive layered "systems stack" of expertise for the hero. */
export function HeroStack() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Every layer expands to the same height (the tallest one), so the panel
  // never changes size while cycling and nothing needs truncating.
  const [detailHeight, setDetailHeight] = useState(DEFAULT_DETAIL_HEIGHT);
  const detailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useIsoLayoutEffect(() => {
    const measure = () => {
      const tallest = Math.max(
        0,
        ...detailRefs.current.map((el) => el?.scrollHeight ?? 0),
      );
      if (tallest > 0) setDetailHeight(Math.ceil(tallest));
    };
    measure();
    const ro = new ResizeObserver(measure);
    const list = detailRefs.current[0]?.closest("ol");
    if (list) ro.observe(list);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || paused) return;
    const t = window.setInterval(
      () => setActive((i) => (i + 1) % expertiseLayers.length),
      CYCLE_MS,
    );
    return () => window.clearInterval(t);
  }, [reduce, paused]);

  return (
    <motion.div
      className="relative w-full max-w-md"
      initial={reduce ? false : { opacity: 0, x: 24 }}
      animate={reduce ? undefined : { opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="rounded-2xl border border-[hsl(var(--border)/.55)] bg-[hsl(var(--card)/.55)] p-2 shadow-2xl backdrop-blur-xl">
        <div className="mono flex items-center justify-between px-3 pb-2 pt-1.5 text-[0.6rem] uppercase tracking-[0.18em] text-[hsl(var(--foreground)/.45)]">
          <span>Full stack, top to metal</span>
          <span className="text-primary">
            L{expertiseLayers.length - active}/{expertiseLayers.length}
          </span>
        </div>

        <ol
          className="relative flex flex-col gap-1"
          aria-label="Areas of expertise"
        >
          {expertiseLayers.map((layer, i) => {
            const Icon = ICONS[layer.id] ?? Server;
            const isActive = i === active;
            const level = expertiseLayers.length - i;
            return (
              <li key={layer.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-expanded={isActive}
                  className={`group relative w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-colors duration-300 ${
                    isActive
                      ? "border-primary/45 bg-primary/[.09]"
                      : "border-transparent hover:bg-[hsl(var(--foreground)/.04)]"
                  }`}
                >
                  {isActive && !reduce && !paused && (
                    <motion.span
                      key={`bar-${active}`}
                      aria-hidden
                      className="absolute bottom-0 left-0 h-px bg-primary/70"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                    />
                  )}
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300 ${
                        isActive
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-[hsl(var(--border)/.6)] text-[hsl(var(--foreground)/.5)]"
                      }`}
                    >
                      <Icon size={15} strokeWidth={1.75} aria-hidden />
                    </span>
                    <span
                      className={`flex-1 text-sm font-medium transition-colors ${
                        isActive
                          ? "text-foreground"
                          : "text-[hsl(var(--foreground)/.7)]"
                      }`}
                    >
                      {layer.title}
                    </span>
                    <span className="mono text-[0.58rem] text-[hsl(var(--foreground)/.35)]">
                      L{level}
                    </span>
                  </div>

                  <div
                    aria-hidden={!isActive}
                    style={{
                      height: isActive ? detailHeight : 0,
                      opacity: isActive ? 1 : 0,
                      transition: reduce
                        ? "none"
                        : "height 380ms cubic-bezier(.22,1,.36,1), opacity 300ms ease",
                    }}
                    className="overflow-hidden"
                  >
                    <div
                      ref={(el) => {
                        detailRefs.current[i] = el;
                      }}
                      className="pb-0.5"
                    >
                      <p className="mt-2 pl-11 text-xs leading-5 text-[hsl(var(--foreground)/.68)]">
                        {layer.summary}
                      </p>
                      <p className="mono mt-1 pl-11 text-[0.62rem] leading-5 text-primary/90">
                        {layer.stack.join("  ·  ")}
                      </p>
                      <p className="mono mt-0.5 pl-11 text-[0.58rem] uppercase leading-5 tracking-wider text-[hsl(var(--foreground)/.42)]">
                        Shipped in → {layer.provenIn.join(", ")}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </motion.div>
  );
}
