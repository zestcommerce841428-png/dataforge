"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Sentry/console in production
    console.error("[DataForge error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="surface rounded-2xl border p-8 shadow-sm max-w-md w-full">
        <div className="mb-4 text-4xl">⚡</div>
        <h1 className="mb-2 text-xl font-bold">Something went wrong</h1>
        <p className="mb-6 text-sm text-muted">
          An unexpected error occurred. Your data is safe — try refreshing or go back to the home page.
        </p>
        {error.digest && (
          <p className="mb-4 font-mono text-[10px] text-muted">Error ID: {error.digest}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-app px-5 py-2.5 text-sm font-semibold text-muted transition hover:text-[var(--text)]"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
