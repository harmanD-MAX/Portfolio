"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bot,
  Cloud,
  Cpu,
  Database,
  FlaskConical,
  MapPinned,
  Network,
  Route,
  Server,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

import { expertiseLayers } from "@/lib/site-data";

const ICONS: Record<string, LucideIcon> = {
  ai: Bot,
  geo: MapPinned,
  mobile: Smartphone,
  backend: Server,
  data: Database,
  distributed: Network,
  algorithms: Route,
  reliability: FlaskConical,
  infra: Cloud,
  lowlevel: Cpu,
};

const CYCLE_MS = 3800;

// useLayoutEffect warns during SSR; fall back to useEffect there.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Interactive "systems stack" of expertise: a grid of layers + a detail pane. */
export function HeroStack() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // The detail pane is as tall as the tallest layer's details, so switching
  // layers never changes the hero's height.
  const [detailHeight, setDetailHeight] = useState<number | undefined>(undefined);
  const detailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const paneRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const measure = () => {
      const tallest = Math.max(0, ...detailRefs.current.map((el) => el?.scrollHeight ?? 0));
      if (tallest > 0) setDetailHeight(Math.ceil(tallest));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (paneRef.current) ro.observe(paneRef.current);
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

  const total = expertiseLayers.length;

  return (
    <motion.div
      className="relative mt-10 w-full max-w-5xl"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="rounded-2xl border border-[hsl(var(--border)/.55)] bg-[hsl(var(--card)/.55)] p-2 shadow-2xl backdrop-blur-xl">
        <div className="mono flex items-center justify-between px-3 pb-2 pt-1.5 text-[0.6rem] uppercase tracking-[0.18em] text-[hsl(var(--foreground)/.45)]">
          <span>Expertise · full stack, top to metal</span>
          <span className="text-primary">
            L{total - active}/{total}
          </span>
        </div>

        <ol
          className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5"
          aria-label="Areas of expertise"
        >
          {expertiseLayers.map((layer, i) => {
            const Icon = ICONS[layer.id] ?? Server;
            const isActive = i === active;
            return (
              <li key={layer.id} className="min-w-0">
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  aria-controls="expertise-detail"
                  className={`relative flex h-full w-full items-center gap-2.5 overflow-hidden rounded-xl border px-2.5 py-2.5 text-left transition-colors duration-300 ${
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
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300 ${
                      isActive
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-[hsl(var(--border)/.6)] text-[hsl(var(--foreground)/.5)]"
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-[0.8rem] font-medium leading-tight transition-colors ${
                        isActive ? "text-foreground" : "text-[hsl(var(--foreground)/.72)]"
                      }`}
                    >
                      {layer.title}
                    </span>
                    <span className="mono mt-0.5 block text-[0.55rem] text-[hsl(var(--foreground)/.35)]">
                      L{total - i}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Detail pane: all layers stacked, only the active one visible. */}
        <div
          ref={paneRef}
          id="expertise-detail"
          aria-live="polite"
          className="relative mx-1 mb-1 mt-2 border-t border-[hsl(var(--border)/.45)]"
          style={{ height: detailHeight }}
        >
          {expertiseLayers.map((layer, i) => {
            const isActive = i === active;
            return (
              <div
                key={layer.id}
                ref={(el) => {
                  detailRefs.current[i] = el;
                }}
                aria-hidden={!isActive}
                className="absolute inset-x-0 top-0 grid gap-x-8 gap-y-2 px-2 pt-3 md:grid-cols-[1.2fr_1fr]"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive || reduce ? "none" : "translateY(4px)",
                  transition: reduce ? "none" : "opacity 320ms ease, transform 320ms ease",
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <p className="text-sm leading-6 text-[hsl(var(--foreground)/.78)]">
                  <span className="font-medium text-foreground">{layer.title}.</span>{" "}
                  {layer.summary}
                </p>
                <div className="space-y-1.5">
                  <p className="mono text-[0.64rem] leading-5 text-primary/90">
                    {layer.stack.join("  ·  ")}
                  </p>
                  <p className="mono text-[0.58rem] uppercase leading-5 tracking-wider text-[hsl(var(--foreground)/.45)]">
                    Shipped in → {layer.provenIn.join(", ")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
