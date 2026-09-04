"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const PHRASES = [
  "Distributed Systems",
  "Generative AI",
  "System Design",
  "Cloud Infrastructure",
] as const;

const INTERVAL_MS = 2800;

export function HeroRotatingTagline() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduce]);

  if (reduce) {
    return (
      <span className="mono text-[0.72rem] text-primary font-medium tracking-wider inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/25">
        &lt; {PHRASES[0]} /&gt;
      </span>
    );
  }

  return (
    <div
      className="relative flex min-h-[2rem] items-center justify-start"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={PHRASES[index]}
          className="mono text-[0.72rem] text-primary font-medium tracking-wider whitespace-nowrap inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/25"
          initial={{ opacity: 0, y: 5, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -5, filter: "blur(3px)" }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          &lt; {PHRASES[index]} /&gt;
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
