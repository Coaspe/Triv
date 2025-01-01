import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=17&size=800x400&markers=color:red%7C${lat},${lng}&key=${apiKey}`;

  return NextResponse.redirect(staticMapUrl);
}
