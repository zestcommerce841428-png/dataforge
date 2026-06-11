import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found — DataForge",
  description: "The page you are looking for does not exist.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="surface rounded-2xl border p-10 shadow-sm w-full max-w-sm">
        <div className="mb-4">
          <span className="text-6xl font-black text-brand-600">404</span>
        </div>
        <h1 className="mb-2 text-xl font-bold">Page not found</h1>
        <p className="mb-6 text-sm text-muted">
          This page doesn&apos;t exist or has been moved. Explore 200+ free tools below.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Browse all tools
          </Link>
          <Link
            href="/sitemap-page"
            className="rounded-xl border border-app px-5 py-2.5 text-sm font-semibold text-muted transition hover:text-[var(--text)]"
          >
            Site map
          </Link>
        </div>
      </div>
    </div>
  );
}
