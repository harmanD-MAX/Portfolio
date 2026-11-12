/** Merged pull requests for an author in a GitHub org, via the Search API. */

export type MergedPr = {
  number: number;
  title: string;
  url: string;
  repo: string;
  mergedAt: string;
  labels: { name: string; color: string }[];
};

/** Allowlisted sources the public API route may query. */
export const PR_SOURCES = {
  meshery: { org: "meshery", author: "harmanD-MAX" },
} as const;

export type PrSource = keyof typeof PR_SOURCES;

/** How long GitHub results are cached before re-fetching (seconds). */
export const PR_REVALIDATE_SECONDS = 300;

type SearchItem = {
  number: number;
  title: string;
  html_url: string;
  repository_url: string;
  closed_at: string | null;
  labels?: { name: string; color: string }[];
  pull_request?: { merged_at: string | null };
};

export async function fetchMergedPrs(source: PrSource): Promise<MergedPr[]> {
  const { org, author } = PR_SOURCES[source];
  const q = `org:${org} author:${author} is:pr is:merged`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=created&order=desc&per_page=100`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "portfolio-merged-prs",
  };
  // Own variable name so CI/sandbox-provided GITHUB_TOKENs (often repo-scoped) are never picked up.
  const token = process.env.PORTFOLIO_GITHUB_TOKEN;
  const get = (withToken: boolean) =>
    fetch(url, {
      headers: withToken && token ? { ...headers, Authorization: `Bearer ${token}` } : headers,
      next: { revalidate: PR_REVALIDATE_SECONDS },
    });

  let res = await get(true);
  // A bad or expired token shouldn't take the table down — fall back to anonymous.
  if (res.status === 401 && token) res = await get(false);
  if (!res.ok) throw new Error(`GitHub search failed: ${res.status}`);
  const data = (await res.json()) as { items?: SearchItem[] };

  return (data.items ?? [])
    .map((item) => ({
      number: item.number,
      title: item.title,
      url: item.html_url,
      repo: item.repository_url.split("/").slice(-2).join("/"),
      mergedAt: item.pull_request?.merged_at ?? item.closed_at ?? "",
      labels: (item.labels ?? []).map((l) => ({ name: l.name, color: l.color })),
    }))
    .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
}
