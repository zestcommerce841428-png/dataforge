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

// Next.js's dev runtime (HMR / React Refresh) evaluates code via eval(),
// so 'unsafe-eval' is required in development. Production stays strict.
const translateScripts = "https://translate.google.com https://translate.googleapis.com https://www.gstatic.com https://www.google.com https://www.recaptcha.net https://cdnjs.cloudflare.com";
const scriptSrc = isDev
  ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com ${translateScripts}`
  : `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com ${translateScripts}`;

// Tesseract.js WASM workers run as blob: URLs and require wasm-eval in dev
const workerSrc = "worker-src 'self' blob: https://cdnjs.cloudflare.com https://cdn.jsdelivr.net";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://coin-images.coingecko.com https://assets.coingecko.com https://www.google-analytics.com https://*.google-analytics.com https://www.gstatic.com https://translate.googleapis.com https://www.google.com https://fonts.gstatic.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://api.coingecko.com https://api.binance.com https://fapi.binance.com wss://stream.binance.com:9443 https://api.alternative.me https://tessdata.projectnaptha.com https://cloudflare-dns.com http://ip-api.com https://tinyurl.com https://is.gd https://v.gd https://clck.ru https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://translate.googleapis.com https://translate.google.com https://translate-pa.googleapis.com https://*.gstatic.com https://www.google.com https://www.recaptcha.net https://cdnjs.cloudflare.com https://cdn.jsdelivr.net" + (isDev ? " ws: http://localhost:*" : ""),
  workerSrc,
  "child-src 'self' blob: https://translate.google.com https://translate.googleapis.com https://www.google.com https://www.recaptcha.net",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_BUILD_SHA:     BUILD_SHA,
    NEXT_PUBLIC_BUILD_TIME:    BUILD_TIME,
    NEXT_PUBLIC_BUILD_VERSION: BUILD_VER,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: csp },
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
