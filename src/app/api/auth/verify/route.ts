import { NextRequest, NextResponse } from "next/server";
import { isValidAuthorPasskey } from "@/server/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passkey } = body;

    if (!passkey || !isValidAuthorPasskey(passkey)) {
      return NextResponse.json(
        { success: false, error: "Invalid author passkey" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      token: passkey,
      author: {
        name: "Harman",
        signature: "Harmanpreet Singh",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
