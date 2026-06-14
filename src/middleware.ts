import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const BOT_UA_PATTERNS = [
  /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /zgrab/i,
  /dirbuster/i, /gobuster/i, /nuclei/i, /wfuzz/i, /hydra/i,
];

const BLOCKED_PATHS = [
  "/wp-admin", "/wp-login", "/.env", "/phpmyadmin",
  "/admin.php", "/xmlrpc.php", "/.git", "/config.php",
];

// All tool routes require authentication
const PROTECTED_ROUTES = [
  "/profile",
  "/api-docs",
  "/api-keys",
  "/base-converter",
  "/bulk-template",
  "/code-formatter",
  "/color-toolkit",
  "/compare",
  "/cron-builder",
  "/cron-monitor",
  "/crypto",
  "/dashboard",
  "/dev-tools",
  "/diff",
  "/file-converter",
  "/format-converter",
  "/formula-manager",
  "/handwriting",
  "/http-tester",
  "/image-tools",
  "/json-path",
  "/json-formatter",
  "/jwt",
  "/notes",
  "/ocr",
  "/pdf-tools",
  "/qr-generator",
  "/regex",
  "/resume",
  "/shortcuts",
  "/snippets",
  "/sql-formatter",
  "/ssl-checker",
  "/text-escape",
  "/tools",
  "/typing",
  "/url-checker",
  "/url-monitor",
  "/uuid-generator",
  "/webhook-inspector",
  "/workbook",
];

// API endpoints that must stay public: the contact form, network info used on
// public pages, the signup avatar upload, and the inbound webhook/cron
// ingestion endpoints (called by third parties, not by signed-in users).
const PUBLIC_API_ROUTES = [
  "/api/contact",
  "/api/my-ip",
  "/api/upload-public-avatar",
  "/api/webhook/",   // inbound webhook ingestion: /api/webhook/[id]
  "/api/cron-ping/", // inbound cron ping: /api/cron-ping/[id]
];

// Routes only for unauthenticated users
const AUTH_ROUTES = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (BLOCKED_PATHS.some((p) => pathname.startsWith(p))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  if (BOT_UA_PATTERNS.some((p) => p.test(ua))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (pathname.startsWith("/api/") && !ua) {
    return new NextResponse(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let res = NextResponse.next({ request: req });

  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    // Gate tool API backends: everything under /api except the explicit
    // public allowlist requires a signed-in user.
    if (
      !user &&
      pathname.startsWith("/api/") &&
      !PUBLIC_API_ROUTES.some((r) => pathname === r.replace(/\/$/, "") || pathname.startsWith(r))
    ) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!user && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
      const homeUrl = req.nextUrl.clone();
      homeUrl.pathname = "/profile";
      return NextResponse.redirect(homeUrl);
    }
  }

  res.headers.set("Timing-Allow-Origin", "*");
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.svg|icons/|manifest\\.webmanifest|sw\\.js).*)",
  ],
};
