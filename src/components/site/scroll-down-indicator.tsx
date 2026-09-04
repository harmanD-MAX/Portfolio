"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { SECTION_IDS } from "@/lib/site-data";

export function ScrollDownIndicator() {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      className="group mt-16 flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      onClick={() => {
        document
          .getElementById(SECTION_IDS.skills)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      aria-label="Scroll to Skills section"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.6 }}
    >
      <span className="text-xs font-medium tracking-[0.2em] uppercase">
        Scroll Down ↓
      </span>
      <motion.span
        aria-hidden
        animate={
          reduce
            ? undefined
            : {
                y: [0, 6, 0],
              }
        }
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <ChevronDown className="size-5 opacity-70 group-hover:opacity-100" />
      </motion.span>
    </motion.button>
  );
}
