"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Max tilt in degrees at the card's edge. */
  max?: number;
  /** Show the soft light glare that follows the pointer. */
  glare?: boolean;
};

/**
 * Gives a block real 3D depth: it tilts toward the mouse in perspective and
 * children marked with `.depth-1` / `.depth-2` float above the surface.
 * Mouse only (touch scrolling is left alone); reduced motion disables it in CSS.
 */
export function Tilt3D({ children, className, max = 7, glare = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width;
      const py = (clientY - r.top) / r.height;
      el.style.setProperty("--tilt-y", `${(px - 0.5) * 2 * max}deg`);
      el.style.setProperty("--tilt-x", `${(0.5 - py) * 2 * max}deg`);
      el.style.setProperty("--glare-x", `${px * 100}%`);
      el.style.setProperty("--glare-y", `${py * 100}%`);
      el.dataset.tilting = "true";
    });
  };

  const onLeave = () => {
    cancelAnimationFrame(frame.current);
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
    delete el.dataset.tilting;
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={cn("tilt-3d", className)}>
      {children}
      {glare && <span aria-hidden className="tilt-3d-glare" />}
    </div>
  );
}
