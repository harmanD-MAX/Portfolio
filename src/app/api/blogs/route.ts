import { NextRequest, NextResponse } from "next/server";
import { BlogRepository } from "@/server/repositories/blog-repository";
import { isValidAuthorPasskey } from "@/server/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    const blogs = await BlogRepository.findAll({
      category,
      search,
      includeDrafts,
    });

    return NextResponse.json({ success: true, blogs });
  } catch (error) {
    console.error("GET /api/blogs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const passkey = request.headers.get("x-author-key");
    if (!isValidAuthorPasskey(passkey)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Valid author passkey required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, slug, excerpt, content, category, tags, readTime, isDraft } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, error: "Title, slug, and content are required." },
        { status: 400 }
      );
    }

    const created = await BlogRepository.create({
      title,
      slug,
      excerpt: excerpt || "",
      content,
      category: category || "Algorithms",
      tags: tags || [],
      readTime: readTime || "5 min read",
      isDraft: Boolean(isDraft),
      author: {
        name: "Harman",
        signature: "Harmanpreet Singh",
        role: "Backend & Distributed Systems Engineer",
      },
    });

    return NextResponse.json({ success: true, blog: created }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/blogs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create blog" },
      { status: 500 }
    );
  }
}
