"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, ExternalLink, GitMerge, Search } from "lucide-react";
import type { MergedPr } from "@/server/github-prs";

type Payload = { prs: MergedPr[] | null; allPrsUrl?: string };

const COLLAPSED_ROWS = 5;

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MergedPrTable({ source, label }: { source: string; label: string }) {
  const [data, setData] = useState<Payload | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/github-prs?source=${encodeURIComponent(source)}`)
      .then((r) => r.json())
      .then((d: Payload) => {
        if (cancelled) return;
        if (!d.prs) setFailed(true);
        setData(d);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [source]);

  const rows = useMemo(() => {
    const prs = data?.prs ?? [];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? prs.filter(
          (pr) =>
            pr.title.toLowerCase().includes(q) ||
            pr.repo.toLowerCase().includes(q) ||
            String(pr.number).includes(q) ||
            pr.labels.some((l) => l.name.toLowerCase().includes(q)),
        )
      : prs;
    return newestFirst ? filtered : [...filtered].reverse();
  }, [data, query, newestFirst]);

  const total = data?.prs?.length ?? 0;
  const visible = expanded ? rows : rows.slice(0, COLLAPSED_ROWS);

  return (
    <div className="mt-6 max-w-lg overflow-hidden rounded-xl border border-[hsl(var(--border)/.6)] bg-[hsl(var(--card)/.55)] backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 border-b border-[hsl(var(--border)/.45)] px-4 py-3">
        <span className="mono inline-flex items-center gap-2 whitespace-nowrap text-[0.68rem] uppercase tracking-wider text-[hsl(var(--primary))]">
          <GitMerge size={13} aria-hidden />
          Merged PRs<span className="hidden sm:inline"> · {label}</span>
          {data?.prs && (
            <span className="rounded-full bg-[hsl(var(--primary)/.15)] px-1.5 py-px text-[0.6rem]">
              {total}
            </span>
          )}
        </span>
        {data?.allPrsUrl && (
          <a
            href={data.allPrsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mono inline-flex items-center gap-1 whitespace-nowrap text-[0.62rem] text-[hsl(var(--foreground)/.55)] hover:text-[hsl(var(--primary))]"
          >
            <span className="hidden sm:inline">All on</span> GitHub <ExternalLink size={11} aria-hidden />
          </a>
        )}
      </div>

      {total > 0 && (
        <div className="flex items-center gap-2 border-b border-[hsl(var(--border)/.35)] px-4 py-2">
          <Search size={13} className="shrink-0 text-[hsl(var(--foreground)/.45)]" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title, label or #"
            aria-label="Filter merged pull requests"
            className="mono min-w-0 flex-1 bg-transparent text-[0.7rem] text-[hsl(var(--foreground)/.85)] placeholder:text-[hsl(var(--foreground)/.35)] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setNewestFirst((v) => !v)}
            className="mono inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[0.62rem] text-[hsl(var(--foreground)/.6)] hover:bg-[hsl(var(--foreground)/.06)] hover:text-[hsl(var(--foreground))]"
            aria-label={`Sort ${newestFirst ? "oldest" : "newest"} first`}
          >
            <ArrowDownUp size={11} aria-hidden />
            {newestFirst ? "Newest" : "Oldest"}
          </button>
        </div>
      )}

      {!data && !failed && (
        <div className="space-y-2 px-4 py-4" aria-busy="true" aria-label="Loading pull requests">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-[hsl(var(--foreground)/.07)]" />
          ))}
        </div>
      )}

      {failed && (
        <p className="px-4 py-4 text-xs text-[hsl(var(--foreground)/.55)]">
          Couldn&apos;t reach GitHub right now — see the full list on GitHub.
        </p>
      )}

      {data?.prs && total === 0 && (
        <p className="px-4 py-4 text-xs leading-6 text-[hsl(var(--foreground)/.6)]">
          First contributions are in review — merged PRs will appear here automatically.
        </p>
      )}

      {total > 0 && (
        <>
          <table className="w-full text-left text-xs">
            <thead className="sr-only">
              <tr>
                <th>Pull request</th>
                <th>Merged</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((pr) => (
                <tr
                  key={pr.url}
                  className="group border-b border-[hsl(var(--border)/.3)] last:border-0 hover:bg-[hsl(var(--foreground)/.04)]"
                >
                  <td className="px-4 py-2.5 align-top">
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="leading-5 text-[hsl(var(--foreground)/.85)] group-hover:text-[hsl(var(--primary))]"
                    >
                      {pr.title}
                    </a>
                    <div className="mono mt-1 flex flex-wrap items-center gap-1.5 text-[0.6rem] text-[hsl(var(--foreground)/.45)]">
                      <span>
                        {pr.repo.split("/")[1]}#{pr.number}
                      </span>
                      {pr.labels.slice(0, 3).map((l) => (
                        <span
                          key={l.name}
                          className="rounded-full border px-1.5 py-px"
                          style={{ borderColor: `#${l.color}66`, color: `#${l.color}` }}
                        >
                          {l.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="mono whitespace-nowrap px-4 py-2.5 text-right align-top text-[0.62rem] text-[hsl(var(--foreground)/.5)]">
                    {formatDate(pr.mergedAt)}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-xs text-[hsl(var(--foreground)/.5)]">
                    No PRs match “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {rows.length > COLLAPSED_ROWS && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mono w-full border-t border-[hsl(var(--border)/.35)] py-2 text-[0.62rem] text-[hsl(var(--primary))] hover:bg-[hsl(var(--foreground)/.04)]"
            >
              {expanded ? "Show less" : `Show all ${rows.length}`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
