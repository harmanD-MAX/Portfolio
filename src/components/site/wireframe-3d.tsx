"use client";

import { useEffect, useId, useMemo, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Lightweight 3D vector graphics: a wireframe solid projected to SVG lines.
 * No WebGL — geometry is rotated and perspective-projected on each frame and
 * written straight to the SVG attributes (no React re-render per frame).
 * Pauses when off-screen and renders a single static frame for reduced motion.
 */

type Vec = [number, number, number];
type Edge = [number, number];
export type WireShape = "icosahedron" | "octahedron" | "cube" | "torus";

const PHI = (1 + Math.sqrt(5)) / 2;

function normalize(vs: Vec[], radius = 1): Vec[] {
  const max = Math.max(...vs.map(([x, y, z]) => Math.hypot(x, y, z)));
  return vs.map(([x, y, z]) => [(x / max) * radius, (y / max) * radius, (z / max) * radius]);
}

/** Connects every pair of vertices separated by the shortest distance. */
function nearestEdges(vs: Vec[]): Edge[] {
  let min = Infinity;
  const d = (a: Vec, b: Vec) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  for (let i = 0; i < vs.length; i++)
    for (let j = i + 1; j < vs.length; j++) min = Math.min(min, d(vs[i], vs[j]));
  const edges: Edge[] = [];
  for (let i = 0; i < vs.length; i++)
    for (let j = i + 1; j < vs.length; j++) if (d(vs[i], vs[j]) < min * 1.01) edges.push([i, j]);
  return edges;
}

function buildGeometry(shape: WireShape): { v: Vec[]; e: Edge[] } {
  if (shape === "torus") {
    const R = 0.78, r = 0.32, seg = 22, ring = 9;
    const v: Vec[] = [];
    const e: Edge[] = [];
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      for (let j = 0; j < ring; j++) {
        const b = (j / ring) * Math.PI * 2;
        v.push([(R + r * Math.cos(b)) * Math.cos(a), r * Math.sin(b), (R + r * Math.cos(b)) * Math.sin(a)]);
        const idx = i * ring + j;
        e.push([idx, i * ring + ((j + 1) % ring)]);
        e.push([idx, ((i + 1) % seg) * ring + j]);
      }
    }
    return { v, e };
  }
  let raw: Vec[];
  if (shape === "icosahedron") {
    raw = [];
    for (const a of [-1, 1]) for (const b of [-PHI, PHI]) {
      raw.push([0, a, b], [a, b, 0], [b, 0, a]);
    }
  } else if (shape === "octahedron") {
    raw = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  } else {
    raw = [];
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) raw.push([x, y, z]);
  }
  const v = normalize(raw);
  return { v, e: nearestEdges(v) };
}

function rotate([x, y, z]: Vec, ax: number, ay: number, az = 0): Vec {
  // Y axis
  let cos = Math.cos(ay), sin = Math.sin(ay);
  [x, z] = [x * cos + z * sin, -x * sin + z * cos];
  // X axis
  cos = Math.cos(ax); sin = Math.sin(ax);
  [y, z] = [y * cos - z * sin, y * sin + z * cos];
  // Z axis
  if (az) {
    cos = Math.cos(az); sin = Math.sin(az);
    [x, y] = [x * cos - y * sin, x * sin + y * cos];
  }
  return [x, y, z];
}

const FOCAL = 3.4;
function project([x, y, z]: Vec): [number, number, number] {
  const s = FOCAL / (FOCAL + z);
  return [x * s, y * s, z];
}

const RING_POINTS = 72;

type Props = {
  shape?: WireShape;
  className?: string;
  /** Radians per second around the Y axis. */
  speed?: number;
  /** Draw glowing vertex nodes. */
  nodes?: boolean;
  /** Number of orbit rings around the solid (0-2). */
  rings?: 0 | 1 | 2;
  /** Inner counter-rotating solid. */
  inner?: WireShape;
  /** Pointer parallax strength (radians at the viewport edge). */
  parallax?: number;
};

export function Wireframe3D({
  shape = "icosahedron",
  className,
  speed = 0.22,
  nodes = false,
  rings = 0,
  inner,
  parallax = 0.35,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gradId = `wf-core-${useId().replace(/:/g, "")}`;
  const outer = useMemo(() => buildGeometry(shape), [shape]);
  const innerGeo = useMemo(() => (inner ? buildGeometry(inner) : null), [inner]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const lines = svg.querySelectorAll<SVGLineElement>("line[data-o]");
    const innerLines = svg.querySelectorAll<SVGLineElement>("line[data-i]");
    const dots = svg.querySelectorAll<SVGCircleElement>("circle[data-n]");
    const ringEls = svg.querySelectorAll<SVGPolylineElement>("polyline[data-r]");
    const sats = svg.querySelectorAll<SVGCircleElement>("circle[data-s]");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = { x: 0, y: 0 };
    const tilt = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      target = {
        x: (e.clientY / window.innerHeight - 0.5) * parallax,
        y: (e.clientX / window.innerWidth - 0.5) * parallax,
      };
    };

    const draw = (t: number) => {
      tilt.x += (target.x - tilt.x) * 0.06;
      tilt.y += (target.y - tilt.y) * 0.06;
      const ay = t * speed + tilt.y;
      const ax = -0.42 + Math.sin(t * 0.35) * 0.12 + tilt.x;

      const pts = outer.v.map((p) => project(rotate(p, ax, ay)));
      outer.e.forEach(([a, b], k) => {
        const el = lines[k];
        const pa = pts[a], pb = pts[b];
        el.setAttribute("x1", pa[0].toFixed(4));
        el.setAttribute("y1", pa[1].toFixed(4));
        el.setAttribute("x2", pb[0].toFixed(4));
        el.setAttribute("y2", pb[1].toFixed(4));
        // depth cue: near edges brighter
        const depth = (pa[2] + pb[2]) / 2;
        el.style.opacity = (0.62 - depth * 0.38).toFixed(3);
      });
      dots.forEach((el, k) => {
        const p = pts[k];
        el.setAttribute("cx", p[0].toFixed(4));
        el.setAttribute("cy", p[1].toFixed(4));
        el.style.opacity = (0.9 - p[2] * 0.55).toFixed(3);
        el.setAttribute("r", (0.034 - p[2] * 0.012).toFixed(4));
      });

      if (innerGeo) {
        const ip = innerGeo.v.map((p) =>
          project(rotate([p[0] * 0.48, p[1] * 0.48, p[2] * 0.48], -ax * 0.8, -ay * 1.6)),
        );
        innerGeo.e.forEach(([a, b], k) => {
          const el = innerLines[k];
          el.setAttribute("x1", ip[a][0].toFixed(4));
          el.setAttribute("y1", ip[a][1].toFixed(4));
          el.setAttribute("x2", ip[b][0].toFixed(4));
          el.setAttribute("y2", ip[b][1].toFixed(4));
        });
      }

      ringEls.forEach((el, r) => {
        const radius = r === 0 ? 1.3 : 1.12;
        const tiltX = r === 0 ? 1.15 : 1.35;
        const tiltZ = r === 0 ? 0.35 : -0.6;
        const spin = t * (r === 0 ? 0.12 : -0.18);
        const ringPts: string[] = [];
        let sat: [number, number, number] | null = null;
        for (let i = 0; i <= RING_POINTS; i++) {
          const a = (i / RING_POINTS) * Math.PI * 2;
          const p = project(
            rotate([Math.cos(a) * radius, 0, Math.sin(a) * radius], tiltX + tilt.x, spin + tilt.y, tiltZ),
          );
          ringPts.push(`${p[0].toFixed(3)},${p[1].toFixed(3)}`);
        }
        const sa = t * (r === 0 ? 0.55 : -0.8);
        sat = project(
          rotate([Math.cos(sa) * radius, 0, Math.sin(sa) * radius], tiltX + tilt.x, spin + tilt.y, tiltZ),
        );
        el.setAttribute("points", ringPts.join(" "));
        const s = sats[r];
        if (s && sat) {
          s.setAttribute("cx", sat[0].toFixed(4));
          s.setAttribute("cy", sat[1].toFixed(4));
          s.style.opacity = (0.95 - sat[2] * 0.45).toFixed(3);
        }
      });
    };

    if (reduce) {
      draw(1.2);
      return;
    }

    let raf = 0;
    let running = false;
    let last = performance.now();
    let clock = 1.2;
    const loop = (now: number) => {
      clock += Math.min(now - last, 64) / 1000;
      last = now;
      draw(clock);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    draw(clock);
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
      rootMargin: "80px",
    });
    io.observe(svg);
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, [outer, innerGeo, speed, parallax]);

  return (
    <svg
      ref={svgRef}
      viewBox="-1.6 -1.6 3.2 3.2"
      className={cn("pointer-events-none select-none text-primary", className)}
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="60%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="0" cy="0" r="1.15" fill={`url(#${gradId})`} />

      {Array.from({ length: rings }).map((_, r) => (
        <polyline
          key={`r${r}`}
          data-r=""
          fill="none"
          stroke="currentColor"
          strokeOpacity={r === 0 ? 0.28 : 0.18}
          strokeWidth={1}
          strokeDasharray={r === 0 ? undefined : "2 5"}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      <g stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" vectorEffect="non-scaling-stroke">
        {outer.e.map((_, k) => (
          <line key={`o${k}`} data-o="" vectorEffect="non-scaling-stroke" />
        ))}
      </g>

      {innerGeo && (
        <g stroke="currentColor" strokeOpacity={0.45} strokeWidth={1} vectorEffect="non-scaling-stroke">
          {innerGeo.e.map((_, k) => (
            <line key={`i${k}`} data-i="" vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      )}

      {nodes && (
        <g fill="currentColor">
          {outer.v.map((_, k) => (
            <circle key={`n${k}`} data-n="" r="0.03" />
          ))}
        </g>
      )}

      {Array.from({ length: rings }).map((_, r) => (
        <circle key={`s${r}`} data-s="" r="0.045" fill="currentColor" />
      ))}
    </svg>
  );
}
