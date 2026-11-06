import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { VisitorRepository } from "@/server/repositories/visitor-repository";

const COOKIE = "h_vid";
const ID_PATTERN = /^[a-f0-9-]{36}$/i;
const TWO_YEARS = 60 * 60 * 24 * 365 * 2;

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ count: await VisitorRepository.count() });
  } catch (error) {
    console.error("GET /api/visitors error:", error);
    return NextResponse.json({ count: null }, { status: 500 });
  }
}

/**
 * Registers the current device. The device id comes from the cookie first,
 * then from the id the client kept in localStorage, and is only created when
 * neither exists — so refreshes, extra tabs and repeat visits never recount.
 */
export async function POST(request: NextRequest) {
  try {
    let bodyId: unknown;
    try {
      bodyId = (await request.json())?.visitorId;
    } catch {
      bodyId = undefined;
    }

    const cookieId = request.cookies.get(COOKIE)?.value;
    const visitorId =
      (cookieId && ID_PATTERN.test(cookieId) && cookieId) ||
      (typeof bodyId === "string" && ID_PATTERN.test(bodyId) && bodyId) ||
      randomUUID();

    const count = await VisitorRepository.register(visitorId.toLowerCase());

    const res = NextResponse.json({ count, visitorId });
    res.cookies.set(COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: TWO_YEARS,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("POST /api/visitors error:", error);
    return NextResponse.json({ count: null }, { status: 500 });
  }
}
