/**
 * Canonical absolute site URL used for metadata, Open Graph, JSON-LD,
 * the sitemap and robots.txt.
 *
 * Override per environment with NEXT_PUBLIC_SITE_URL (e.g. a custom domain).
 * Vercel also exposes VERCEL_PROJECT_PRODUCTION_URL for production builds.
 */
const FALLBACK_URL = "https://dataforge-omega.vercel.app";

function isValidUrl(s: string): boolean {
  try { new URL(s); return true; } catch { return false; }
}

function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null,
    FALLBACK_URL,
  ];
  for (const c of candidates) {
    if (!c) continue;
    // Strip BOM or other invisible leading chars before the scheme
    const clean = c.replace(/^[\s﻿​]+/, "").replace(/\/$/, "");
    if (isValidUrl(clean)) return clean;
  }
  return FALLBACK_URL;
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "DataForge";

/**
 * Canonical origin to use for outward-facing links (OAuth/email redirects,
 * copyable webhook/share URLs). Always the production domain — except on a
 * real localhost dev server, where the live origin is used so local auth works.
 */
export function appOrigin(): string {
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0") {
      return window.location.origin;
    }
  }
  return SITE_URL;
}

/** Join the canonical origin with a path (path should start with "/"). */
export function appUrl(path = ""): string {
  return `${appOrigin()}${path}`;
}
