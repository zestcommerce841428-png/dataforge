import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Returns the caller's public IP as seen from request headers. */
export async function GET(req: NextRequest) {
  const fwd = req.headers.get("x-forwarded-for");
  const ip =
    (fwd ? fwd.split(",")[0].trim() : null) ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";
  return NextResponse.json({ ip });
}
