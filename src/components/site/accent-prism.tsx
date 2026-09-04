"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const MODES = ["luxe", "bloom", "ion"] as const;
export type AccentMode = (typeof MODES)[number];

const LABELS: Record<AccentMode, string> = {
  luxe: "Luxe",
  bloom: "Bloom",
  ion: "Ion",
};

const PRISM_GRADIENT: Record<AccentMode, string> = {
  luxe: "radial-gradient(circle at 35% 35%, #f4e4bc, #c9a227 45%, #6b5320)",
  bloom: "radial-gradient(circle at 40% 40%, #fda4af, #e879f9 50%, #a78bfa)",
  ion: "radial-gradient(circle at 35% 35%, #a5f3fc, #22d3ee 45%, #6366f1)",
};

type Props = {
  className?: string;
};

export function AccentPrism({ className }: Props) {
  const wrapRef = useRef<HTMLButtonElement>(null);
  const [mode, setMode] = useState<AccentMode>("luxe");
  const [flash, setFlash] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(mx, { stiffness: 220, damping: 28 });
  const ry = useSpring(my, { stiffness: 220, damping: 28 });

  useEffect(() => {
    document.documentElement.dataset.accent = mode;
  }, [mode]);

  function cycle() {
    setMode((m) => {
      const i = MODES.indexOf(m);
      return MODES[(i + 1) % MODES.length];
    });
    setFlash(true);
    window.setTimeout(() => setFlash(false), 420);
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <motion.button
        type="button"
        ref={wrapRef}
        onClick={cycle}
        onMouseMove={(e) => {
          const el = wrapRef.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          mx.set(px * 10);
          my.set(py * 10);
        }}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        className={cn(
          "relative size-7 rounded-full border border-white/20 bg-black/40 shadow-[0_0_16px_rgba(0,0,0,0.5)] backdrop-blur-sm [perspective:200px]",
          "outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring",
          flash && "shadow-[0_0_28px_var(--prism-flash)]",
        )}
        style={
          {
            "--prism-flash": "oklch(0.85 0.15 85 / 0.55)",
          } as Record<string, string>
        }
        aria-label={`Cycle site accent color theme (${LABELS[mode]})`}
        title="Cycle accent"
      >
        <motion.span
          className="absolute inset-[2px] rounded-full"
          style={{
            background: PRISM_GRADIENT[mode],
            rotateX: ry,
            rotateY: rx,
            transformStyle: "preserve-3d",
          }}
        />
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-35" />
        <span className="absolute inset-[1px] rounded-full ring-1 ring-inset ring-white/25" />
      </motion.button>
    </div>
  );
}
