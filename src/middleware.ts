import { NextRequest, NextResponse } from "next/server";

// Simple edge-level bot / abuse guard.
// Full rate limiting is done per-route; this middleware adds a fast
// first-pass check for obviously bad requests.

const BOT_UA_PATTERNS = [
  /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /zgrab/i,
  /dirbuster/i, /gobuster/i, /nuclei/i, /wfuzz/i, /hydra/i,
];

const BLOCKED_PATHS = [
  "/wp-admin", "/wp-login", "/.env", "/phpmyadmin",
  "/admin.php", "/xmlrpc.php", "/.git", "/config.php",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Block common attack paths immediately
  if (BLOCKED_PATHS.some((p) => pathname.startsWith(p))) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Block known scanner user-agents
  const ua = req.headers.get("user-agent") ?? "";
  if (BOT_UA_PATTERNS.some((p) => p.test(ua))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Block empty user-agents on API routes (likely automated abuse)
  if (pathname.startsWith("/api/") && !ua) {
    return new NextResponse(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = NextResponse.next();

  // Add Timing-Allow-Origin for performance monitoring
  res.headers.set("Timing-Allow-Origin", "*");

  return res;
}

export const config = {
  matcher: [
    // Apply to all paths except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon\\.svg|icons/|manifest\\.webmanifest|sw\\.js).*)",
  ],
};
