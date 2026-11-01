"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/** Thin accent bar at the top of the viewport that fills as the page scrolls. */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-primary/40 via-primary to-primary/60"
      style={{ scaleX: reduce ? scrollYProgress : scaleX }}
    />
  );
}
