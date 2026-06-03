import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Next.js's dev runtime (HMR / React Refresh) evaluates code via eval(),
// so 'unsafe-eval' is required in development. Production stays strict.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

// Tesseract.js WASM workers run as blob: URLs and require wasm-eval in dev
const workerSrc = isDev
  ? "worker-src 'self' blob:"
  : "worker-src 'self' blob:";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://coin-images.coingecko.com https://assets.coingecko.com",
  "font-src 'self'",
  "connect-src 'self' https://api.coingecko.com https://api.binance.com https://fapi.binance.com wss://stream.binance.com:9443 https://api.alternative.me https://tessdata.projectnaptha.com https://cloudflare-dns.com http://ip-api.com https://tinyurl.com https://is.gd https://v.gd https://clck.ru" + (isDev ? " ws: http://localhost:*" : ""),
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

export default nextConfig;
