import type { NextConfig } from "next";
import { execSync } from "child_process";

const isDev = process.env.NODE_ENV !== "production";

// Capture build-time metadata once, at config evaluation time
function getBuildSha(): string {
  try { return execSync("git rev-parse --short HEAD").toString().trim(); } catch { return ""; }
}
const BUILD_SHA   = process.env.NEXT_PUBLIC_BUILD_SHA   ?? getBuildSha();
const BUILD_TIME  = process.env.NEXT_PUBLIC_BUILD_TIME  ?? new Date().toISOString();
const BUILD_VER   = process.env.NEXT_PUBLIC_BUILD_VERSION ?? (process.env.npm_package_version ?? "1.0.0");

function getBuildBranch(): string {
  try { return execSync("git rev-parse --abbrev-ref HEAD").toString().trim(); } catch { return ""; }
}
function getCommitMessage(): string {
  try { return execSync("git log -1 --pretty=%s").toString().trim(); } catch { return ""; }
}
function getCommitAuthor(): string {
  try { return execSync("git log -1 --pretty=%an").toString().trim(); } catch { return ""; }
}

const BUILD_BRANCH  = process.env.NEXT_PUBLIC_BUILD_BRANCH  ?? process.env.VERCEL_GIT_COMMIT_REF     ?? getBuildBranch();
const BUILD_ENV     = process.env.NEXT_PUBLIC_BUILD_ENV     ?? process.env.VERCEL_ENV                ?? process.env.NODE_ENV ?? "development";
const BUILD_REGION  = process.env.NEXT_PUBLIC_BUILD_REGION  ?? process.env.VERCEL_REGION             ?? "";
const BUILD_AUTHOR  = process.env.NEXT_PUBLIC_BUILD_AUTHOR  ?? process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME ?? getCommitAuthor();
const BUILD_MESSAGE = process.env.NEXT_PUBLIC_BUILD_MESSAGE ?? process.env.VERCEL_GIT_COMMIT_MESSAGE  ?? getCommitMessage();
const BUILD_NODE    = process.env.NEXT_PUBLIC_BUILD_NODE    ?? process.versions?.node ?? "";

// Next.js's dev runtime (HMR / React Refresh) evaluates code via eval(),
// so 'unsafe-eval' is required in development. Production stays strict.
const translateScripts = "https://translate.google.com https://translate.googleapis.com https://www.gstatic.com https://www.google.com https://www.recaptcha.net https://cdnjs.cloudflare.com https://cdn.jsdelivr.net";
const scriptSrc = isDev
  ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com ${translateScripts}`
  : `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com ${translateScripts}`;

// Tesseract.js WASM workers run as blob: URLs and require wasm-eval in dev
const workerSrc = "worker-src 'self' blob: https://cdnjs.cloudflare.com https://cdn.jsdelivr.net";

// Supabase origin (auth, REST, storage, realtime) â€” derived from the public env
// var so the CSP stays correct for any project without hardcoding the host.
// Some env vars get pasted with a leading BOM / zero-width / whitespace which
// breaks new URL() and exact string matches. Strip those before use.
const STRIP_INVIS = new RegExp('[' + String.fromCharCode(0xFEFF, 0x200B, 0x200C, 0x200D, 0x2060) + ']', 'g');
function cleanEnv(v?: string): string {
  return (v ?? '').replace(STRIP_INVIS, '').trim();
}

function supabaseOrigin(): string {
  try {
    const u = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
    return u ? new URL(u).origin : "";
  } catch { return ""; }
}
const SUPA = supabaseOrigin();
const SUPA_WSS = SUPA ? SUPA.replace(/^https:/, "wss:") : "";
const supabaseConnect = [SUPA, SUPA_WSS].filter(Boolean).join(" ");
const supabaseImg = SUPA; // storage-hosted avatars

// Hostinger host that serves uploaded avatars (same host as the upload URL).
function hostingerHost(): string {
  try {
    const u = cleanEnv(process.env.NEXT_PUBLIC_HOSTINGER_UPLOAD_URL);
    return u ? new URL(u).host : "";
  } catch { return ""; }
}
const HOSTINGER_HOST = hostingerHost();
const hostingerImg = HOSTINGER_HOST ? `https://${HOSTINGER_HOST}` : "";
// Static avatar CDN host — always allowed regardless of env var
const ZEST_HOST = "api.zestcommerce.in";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  `img-src 'self' data: blob: ${supabaseImg} ${hostingerImg} https://${ZEST_HOST} https://coin-images.coingecko.com https://assets.coingecko.com https://www.google-analytics.com https://*.google-analytics.com https://www.gstatic.com https://translate.googleapis.com https://www.google.com https://fonts.gstatic.com`,
  "font-src 'self' https://fonts.gstatic.com",
  `connect-src 'self' ${supabaseConnect} https://${ZEST_HOST} https://api.coingecko.com https://api.binance.com https://fapi.binance.com wss://stream.binance.com:9443 https://api.alternative.me https://tessdata.projectnaptha.com https://cloudflare-dns.com http://ip-api.com https://tinyurl.com https://is.gd https://v.gd https://clck.ru https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://translate.googleapis.com https://translate.google.com https://translate-pa.googleapis.com https://*.gstatic.com https://www.google.com https://www.recaptcha.net https://cdnjs.cloudflare.com https://cdn.jsdelivr.net${isDev ? " ws: http://localhost:*" : ""}`,
  workerSrc,
  "child-src 'self' blob: https://translate.google.com https://translate.googleapis.com https://www.google.com https://www.recaptcha.net",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  generateBuildId: () => `build-${BUILD_TIME.replace(/[:.]/g, "-")}`,
  env: {
    NEXT_PUBLIC_BUILD_SHA:     BUILD_SHA,
    NEXT_PUBLIC_BUILD_TIME:    BUILD_TIME,
    NEXT_PUBLIC_BUILD_VERSION: BUILD_VER,
    NEXT_PUBLIC_BUILD_BRANCH:  BUILD_BRANCH,
    NEXT_PUBLIC_BUILD_ENV:     BUILD_ENV,
    NEXT_PUBLIC_BUILD_REGION:  BUILD_REGION,
    NEXT_PUBLIC_BUILD_AUTHOR:  BUILD_AUTHOR,
    NEXT_PUBLIC_BUILD_MESSAGE: BUILD_MESSAGE,
    NEXT_PUBLIC_BUILD_NODE:    BUILD_NODE,
    NEXT_PUBLIC_BUILD_NEXT:    process.env.npm_package_dependencies_next ?? "",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "coin-images.coingecko.com" },
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: ZEST_HOST },
      ...(HOSTINGER_HOST ? [{ protocol: "https" as const, hostname: HOSTINGER_HOST }] : []),
      ...(SUPA ? [{ protocol: "https" as const, hostname: new URL(SUPA).host }] : []),
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  compress: true,
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options",          value: "nosniff" },
      { key: "X-Frame-Options",                  value: "DENY" },
      { key: "X-DNS-Prefetch-Control",           value: "on" },
      { key: "Referrer-Policy",                  value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy",               value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), battery=()" },
      { key: "Content-Security-Policy",          value: csp },
      // Enforce HTTPS for 2 years, include subdomains
      { key: "Strict-Transport-Security",        value: "max-age=63072000; includeSubDomains; preload" },
      // Cross-origin isolation
      { key: "Cross-Origin-Opener-Policy",       value: "same-origin-allow-popups" },
      { key: "Cross-Origin-Resource-Policy",     value: "cross-origin" },
      { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
    ];

    return [
      // Security headers on every response
      { source: "/(.*)", headers: securityHeaders },
      // Long-lived cache for immutable Next.js static chunks
      {
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Cache optimised images for 1 day
      {
        source: "/_next/image(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      // Cache public assets (favicon, manifest, sw) for 1 week
      {
        source: "/(favicon\\.svg|manifest\\.webmanifest|logo\\.svg|sw\\.js)",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
      // API routes: no store, set CORS
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control",               value: "no-store, no-cache, must-revalidate" },
          { key: "Access-Control-Allow-Origin",  value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

// Wrap with Sentry only when a DSN is configured, so local/CI builds without
// Sentry credentials stay clean. Source maps upload only if SENTRY_AUTH_TOKEN is set.
let exported: NextConfig = nextConfig;
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { withSentryConfig } = require("@sentry/nextjs");
  exported = withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: true,
    disableLogger: true,
  });
}

export default exported;
