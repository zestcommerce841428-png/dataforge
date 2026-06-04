import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Next.js's dev runtime (HMR / React Refresh) evaluates code via eval(),
// so 'unsafe-eval' is required in development. Production stays strict.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com"
  : "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com";

// Tesseract.js WASM workers run as blob: URLs and require wasm-eval in dev
const workerSrc = isDev
  ? "worker-src 'self' blob:"
  : "worker-src 'self' blob:";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://coin-images.coingecko.com https://assets.coingecko.com https://www.google-analytics.com https://*.google-analytics.com",
  "font-src 'self'",
  "connect-src 'self' https://api.coingecko.com https://api.binance.com https://fapi.binance.com wss://stream.binance.com:9443 https://api.alternative.me https://tessdata.projectnaptha.com https://cloudflare-dns.com http://ip-api.com https://tinyurl.com https://is.gd https://v.gd https://clck.ru https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com" + (isDev ? " ws: http://localhost:*" : ""),
  workerSrc,
  "child-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
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
