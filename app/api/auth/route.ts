import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ authenticated: true }, { status: 200 });

      response.cookies.set({
        name: "admin_session",
        value: "true",
        httpOnly: true,
        secure: false, // 로컬 개발 환경에서는 false로 설정
        sameSite: "lax", // strict에서 lax로 변경
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      return response;
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const adminSession = request.cookies.get("admin_session");

  if (adminSession?.value === "true") {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
