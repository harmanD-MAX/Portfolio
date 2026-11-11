import { NextRequest, NextResponse } from "next/server";
import {
  fetchMergedPrs,
  PR_REVALIDATE_SECONDS,
  PR_SOURCES,
  type PrSource,
} from "@/server/github-prs";

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("source") ?? "";
  if (!(source in PR_SOURCES)) {
    return NextResponse.json({ error: "Unknown source" }, { status: 400 });
  }

  const { org, author } = PR_SOURCES[source as PrSource];
  const allPrsUrl = `https://github.com/pulls?q=${encodeURIComponent(
    `is:pr author:${author} org:${org}`,
  )}`;

  try {
    const prs = await fetchMergedPrs(source as PrSource);
    return NextResponse.json(
      { prs, allPrsUrl, updatedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${PR_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
        },
      },
    );
  } catch (error) {
    console.error("GET /api/github-prs error:", error);
    return NextResponse.json({ prs: null, allPrsUrl }, { status: 502 });
  }
}
