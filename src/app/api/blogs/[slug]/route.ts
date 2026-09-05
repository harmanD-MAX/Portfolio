import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { BlogRepository } from "@/server/repositories/blog-repository";
import { verifyAuthorRequest } from "@/server/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blog = await BlogRepository.findBySlugOrId(slug);

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, blog });
  } catch (error) {
    console.error("GET /api/blogs/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!verifyAuthorRequest(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Valid author passkey required." },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const updates = await request.json();

    const updated = await BlogRepository.update(slug, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Article not found to update" },
        { status: 404 }
      );
    }

    try {
      revalidatePath("/blog");
      revalidatePath(`/blog/${slug}`);
      revalidatePath(`/blog/${updated.slug}`);
      revalidatePath("/");
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, blog: updated });
  } catch (error: any) {
    console.error("PUT /api/blogs/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update article" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!verifyAuthorRequest(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Valid author passkey required." },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const deleted = await BlogRepository.delete(slug);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Article not found to delete" },
        { status: 404 }
      );
    }

    try {
      revalidatePath("/blog");
      revalidatePath(`/blog/${slug}`);
      revalidatePath("/");
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: "Article deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/blogs/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete article" },
      { status: 500 }
    );
  }
}

