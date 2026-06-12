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

// Routes that require an authenticated session
const PROTECTED_ROUTES = ["/profile"];
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

  // Only run Supabase session refresh when env vars exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let res = NextResponse.next({ request: req });

  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
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

    // Redirect unauthenticated users away from protected routes
    if (!user && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages
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
