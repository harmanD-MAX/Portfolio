import { NextRequest, NextResponse } from "next/server";
import { BlogRepository } from "@/server/repositories/blog-repository";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const action = body.action === "unlike" ? "unlike" : "like";

    const likes = await BlogRepository.toggleLikes(slug, action);
    return NextResponse.json({ success: true, likes });
  } catch (error: any) {
    console.error("POST /api/blogs/[slug]/like error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to toggle like" },
      { status: 500 }
    );
  }
}
