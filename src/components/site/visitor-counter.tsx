"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

const STORAGE_KEY = "h_vid";

function readStoredId(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeId(id: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // storage blocked (private mode) — the cookie still identifies the device
  }
}

type VisitorResponse = { count?: number | null; visitorId?: string } | null;

// One registration per page load, shared by every mount (StrictMode, remounts).
let registration: Promise<VisitorResponse> | null = null;

function registerVisit(): Promise<VisitorResponse> {
  registration ??= fetch("/api/visitors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify({ visitorId: readStoredId() }),
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((data: VisitorResponse) => {
      if (data && typeof data.visitorId === "string") storeId(data.visitorId);
      return data;
    })
    .catch(() => null);
  return registration;
}

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    registerVisit().then((data) => {
      if (!cancelled && data && typeof data.count === "number") setCount(data.count);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span
      className="mono inline-flex items-center gap-1.5 text-[0.68rem] text-muted-foreground/80"
      aria-live="polite"
    >
      <Eye size={12} aria-hidden />
      {count === null ? "— visitors" : `${count.toLocaleString()} visitor${count === 1 ? "" : "s"}`}
    </span>
  );
}
