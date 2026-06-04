# DataForge ⚡

A free, fast, secure and privacy-first suite of **online data generators**, rebuilt as a
professional web app with the latest **Next.js (App Router)** and **Tailwind CSS v4**.

Everything runs **locally in the browser** using the Web Crypto API — no data ever leaves
your device.

## Features

- **27 generators** across 5 categories:
  - **Numbers** — integer, float, prime, PIN, IMEI, ISBN, EAN-13, ASIN, WPS PIN
  - **Developer** — password, UUID, base64, byte string, hash (SHA-1/256/384/512), htpasswd
  - **Address & Network** — address, city, person, IP (v4/v6), MAC, MAC vendor, crypto address
  - **Date & Time** — date, time, date-time
  - **Hex & Secrets** — hex string, 64-byte secret key
- **🎨 Background toggle** — cycle Aurora / Sunset / Mesh / Plain backgrounds, plus a
  light/dark mode switch. Preferences persist via local storage with no flash on load.
- **Bulk generation** — create up to 1,000 values at once, then copy or download as `.txt`.
- **SEO-friendly** — per-tool metadata, Open Graph, JSON-LD structured data, sitemap & robots.
- **Accessible** — keyboard navigation, skip link, ARIA live regions, focus styles,
  reduced-motion support.
- **Secure** — strict CSP and security headers, no third-party trackers.
- **Fast** — statically rendered pages, zero runtime dependencies beyond React.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Build for production:

```bash
npm run build
npm start
```

## Deployment

The app is a standard Next.js project with serverless API routes and **no required
environment variables** — it deploys as-is.

### Vercel (recommended)
1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Framework auto-detects as Next.js → **Deploy**. No env vars needed.

### Cloudflare Pages / Netlify / Node host
- Build command: `next build` · Output: `.next` · Start: `next start`.

### Optional: error monitoring
Copy `.env.example` → `.env.local` and set `NEXT_PUBLIC_SENTRY_DSN` to enable
[Sentry](https://sentry.io). Leave it blank to keep Sentry disabled (default).
Set `SENTRY_ORG`, `SENTRY_PROJECT` and `SENTRY_AUTH_TOKEN` to upload source maps in CI.

### CI
`.github/workflows/ci.yml` runs type-check, lint and build on every push and PR to `main`.

## Tech stack

- Next.js 15+ (App Router, React 19, TypeScript)
- Tailwind CSS v4 (CSS-first config)
- Web Crypto API for all randomness

## Notes

All generated identifiers, addresses and wallet strings are **fictional** and intended for
software testing, demos and education only.
