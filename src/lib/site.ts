/**
 * Canonical absolute site URL used for metadata, Open Graph, JSON-LD,
 * the sitemap and robots.txt.
 *
 * Override per environment with NEXT_PUBLIC_SITE_URL (e.g. a custom domain).
 * Vercel also exposes VERCEL_PROJECT_PRODUCTION_URL for production builds.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "https://dataforge-naushad-alam-s-projects1.vercel.app";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "DataForge";
