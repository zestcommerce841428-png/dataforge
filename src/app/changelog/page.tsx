import type { Metadata } from "next";
import Link from "next/link";
import { getChangelog } from "@/lib/changelog";
import { BUILD_SHA, BUILD_VERSION, BUILD_BRANCH } from "@/lib/version";

export const metadata: Metadata = {
  title: "Changelog — DataForge",
  description: "What's new in DataForge — full commit history and release notes.",
};

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
  } catch { return iso.slice(0, 10); }
}

function categoryBadge(msg: string): { label: string; color: string } {
  const lower = msg.toLowerCase();
  if (lower.startsWith("feat") || lower.startsWith("add"))  return { label: "Feature",  color: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300" };
  if (lower.startsWith("fix") || lower.startsWith("bug"))   return { label: "Fix",      color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" };
  if (lower.startsWith("perf") || lower.startsWith("opt"))  return { label: "Perf",     color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" };
  if (lower.startsWith("refactor") || lower.startsWith("chore")) return { label: "Internal", color: "bg-[var(--surface-2)] text-muted" };
  if (lower.startsWith("doc"))                              return { label: "Docs",     color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" };
  return { label: "Update", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" };
}

export default function ChangelogPage() {
  const commits = getChangelog(80);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-[var(--text)]">
          ← All tools
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">What&apos;s New</h1>
        <p className="mt-2 text-muted">Full commit history for DataForge. Latest first.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="surface rounded-lg border border-app px-2.5 py-1 font-mono">v{BUILD_VERSION}</span>
          <span className="surface rounded-lg border border-app px-2.5 py-1 font-mono">{BUILD_SHA}</span>
          <span className="surface rounded-lg border border-app px-2.5 py-1 font-mono">{BUILD_BRANCH}</span>
        </div>
      </div>

      {commits.length === 0 ? (
        <div className="surface rounded-2xl border border-app p-8 text-center text-muted">
          <p>No git history available in this build environment.</p>
        </div>
      ) : (
        <ol className="relative border-l-2 border-app pl-6 space-y-0">
          {commits.map((c, i) => {
            const badge = categoryBadge(c.msg);
            const date = formatDate(c.date);
            const isFirst = i === 0;
            return (
              <li key={c.sha} className="relative pb-8">
                {/* Timeline dot */}
                <span className={`absolute -left-[calc(0.75rem+1px)] top-1.5 flex h-3 w-3 items-center justify-center rounded-full border-2 ${isFirst ? "border-brand-500 bg-brand-500" : "border-app bg-[var(--surface)]"}`} />

                <div className="surface rounded-xl border border-app px-4 py-3 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="font-mono text-xs text-muted">{c.sha}</span>
                    <span className="ml-auto text-xs text-muted">{date}</span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium leading-snug">{c.msg}</p>
                  <p className="mt-1 text-xs text-muted">{c.author}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
