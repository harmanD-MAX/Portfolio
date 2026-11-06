import { createHash, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { VisitorRepository } from "@/server/repositories/visitor-repository";

const COOKIE = "h_vid";
const ID_PATTERN = /^[a-f0-9-]{36}$/i;
const TWO_YEARS = 60 * 60 * 24 * 365 * 2;
const BOT_UA =
  /bot|crawl|spider|slurp|preview|screenshot|headless|lighthouse|pagespeed|vercel|facebookexternalhit|embedly|whatsapp|telegram|discord|slack|curl|wget|python|node-fetch|axios/i;

export const dynamic = "force-dynamic";

function fingerprintOf(request: NextRequest): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "";
  const ua = request.headers.get("user-agent") || "";
  return createHash("sha256").update(`portfolio-visitor|${ip}|${ua}`).digest("hex");
}

export async function GET() {
  try {
    return NextResponse.json({ count: await VisitorRepository.count() });
  } catch (error) {
    console.error("GET /api/visitors error:", error);
    return NextResponse.json({ count: null }, { status: 500 });
  }
}

/**
 * Registers the current device at most once. The device is matched by its
 * cookie, the id kept in localStorage, or a hashed IP + browser fingerprint,
 * so refreshes, extra tabs and repeat visits never recount. Bots are ignored.
 */
export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get("user-agent") || "";
    if (!ua || BOT_UA.test(ua)) {
      return NextResponse.json({ count: await VisitorRepository.count() });
    }

    let bodyId: unknown;
    try {
      bodyId = (await request.json())?.visitorId;
    } catch {
      bodyId = undefined;
    }

    const cookieId = request.cookies.get(COOKIE)?.value;
    const candidate = (
      (cookieId && ID_PATTERN.test(cookieId) && cookieId) ||
      (typeof bodyId === "string" && ID_PATTERN.test(bodyId) && bodyId) ||
      randomUUID()
    ).toLowerCase();

    const { id, count } = await VisitorRepository.register(candidate, fingerprintOf(request));

    const res = NextResponse.json({ count, visitorId: id });
    res.headers.set("Cache-Control", "no-store");
    res.cookies.set(COOKIE, id, {
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
