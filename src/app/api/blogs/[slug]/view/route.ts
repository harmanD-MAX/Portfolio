import { NextRequest, NextResponse } from "next/server";
import { BlogRepository } from "@/server/repositories/blog-repository";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const views = await BlogRepository.incrementViews(slug);
    return NextResponse.json({ success: true, views });
  } catch (error: any) {
    console.error("POST /api/blogs/[slug]/view error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to increment views" },
      { status: 500 }
    );
  }
}
