/** @format */

import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password === ADMIN_PASSWORD) {
    const cookieString = `admin_session=true; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24}`;

    const headers = new Headers();
    headers.append("Set-Cookie", cookieString);

    return new NextResponse(JSON.stringify({ authenticated: true }), {
      status: 200,
      headers,
    });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function GET(request: NextRequest) {
  const adminSession = request.cookies.get("admin_session");
  console.log("Cookie in GET:", adminSession);

  if (adminSession?.value === "true") {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
