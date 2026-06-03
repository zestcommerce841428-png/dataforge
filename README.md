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

## Tech stack

- Next.js 15+ (App Router, React 19, TypeScript)
- Tailwind CSS v4 (CSS-first config)
- Web Crypto API for all randomness

## Notes

All generated identifiers, addresses and wallet strings are **fictional** and intended for
software testing, demos and education only.
