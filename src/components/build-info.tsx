"use client";

import { useEffect, useState, useRef } from "react";

interface Props {
  sha: string;
  version: string;
  timeIso: string;
  branch: string;
  env: string;
  region: string;
  author: string;
  message: string;
  nodeVersion: string;
  nextVersion: string;
}

function timeAgo(from: Date): string {
  const secs = Math.floor((Date.now() - from.getTime()) / 1000);
  if (secs < 60)    return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60)    return `${mins}m ago`;
  const hrs  = Math.floor(mins / 60);
  if (hrs < 24)     return `${hrs}h ${mins % 60}m ago`;
  const days = Math.floor(hrs / 24);
  const remH = hrs % 24;
  return remH ? `${days}d ${remH}h ago` : `${days}d ago`;
}

const ENV_STYLES: Record<string, string> = {
  production:  "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  preview:     "border-amber-500/40   bg-amber-500/10   text-amber-600   dark:text-amber-400",
  development: "border-sky-500/40     bg-sky-500/10     text-sky-600     dark:text-sky-400",
};

const ENV_DOT: Record<string, string> = {
  production:  "bg-emerald-500",
  preview:     "bg-amber-500",
  development: "bg-sky-500",
};

export function BuildInfo({ sha, version, timeIso, branch, env, region, author, message, nodeVersion, nextVersion }: Props) {
  const built     = new Date(timeIso);
  // Start empty so server and client render the same HTML; relative time is
  // computed only after mount to avoid a hydration mismatch (React #418).
  const [ago, setAgo] = useState("");
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAgo(timeAgo(new Date(timeIso)));
    const id = setInterval(() => setAgo(timeAgo(new Date(timeIso))), 30_000);
    return () => clearInterval(id);
  }, [timeIso]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    function onOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
    };
  }, [open]);

  const envKey = (env in ENV_STYLES) ? env : "development";
  const envStyle = ENV_STYLES[envKey];
  const dotStyle = ENV_DOT[envKey];

  const buildDate = built.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
  const buildTime = built.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC", hour12: false });

  return (
    <div ref={panelRef} className="relative flex flex-wrap items-center justify-center gap-2">

      {/* Environment badge */}
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${envStyle}`}>
        <span className={`inline-block h-1.5 w-1.5 animate-pulse rounded-full ${dotStyle}`} aria-hidden />
        {env}
      </span>

      {/* Version */}
      <span className="inline-flex items-center gap-1 rounded-full border border-app bg-[var(--surface-2)] px-2.5 py-0.5 font-mono text-[11px] text-muted">
        {version}
      </span>

      {/* Branch */}
      {branch && (
        <span className="inline-flex items-center gap-1 rounded-full border border-app bg-[var(--surface-2)] px-2.5 py-0.5 font-mono text-[11px] text-muted">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden className="shrink-0 opacity-60">
            <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h1.5v2.128a2.251 2.251 0 1 0 1.5 0V8.5h1.5a2.25 2.25 0 0 0 2.25-2.25V5.372a2.25 2.25 0 1 0-1.5 0V6.25a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878zm3.75 7.378a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm3-8.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z"/>
          </svg>
          {branch}
        </span>
      )}

      {/* SHA */}
      {sha && (
        <span className="inline-flex items-center gap-1 rounded-full border border-app bg-[var(--surface-2)] px-2.5 py-0.5 font-mono text-[11px] text-muted">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden className="shrink-0 opacity-60">
            <path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5H11.93zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0z"/>
          </svg>
          {sha}
        </span>
      )}

      {/* Live "ago" — clickable to expand details */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Toggle deployment details"
        className="inline-flex items-center gap-1.5 rounded-full border border-app bg-[var(--surface-2)] px-2.5 py-0.5 font-mono text-[11px] text-muted transition-colors hover:border-brand-400 hover:text-brand-600"
      >
        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden className="shrink-0 opacity-60">
          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"/>
        </svg>
        <span suppressHydrationWarning>{ago || buildDate}</span>
        <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <path d="M2 5l6 6 6-6"/>
        </svg>
      </button>

      {/* Expanded details panel */}
      {open && (
        <div className="surface absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-[min(360px,calc(100vw-32px))] -translate-x-1/2 rounded-2xl border border-app p-4 shadow-2xl">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold">Deployment Details</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-0.5 text-muted hover:text-[var(--text)]"
              aria-label="Close"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M2 2l12 12M14 2L2 14"/>
              </svg>
            </button>
          </div>

          <dl className="space-y-2 text-xs">
            <Row label="Status">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${envStyle}`}>
                <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${dotStyle}`} aria-hidden />
                {env}
              </span>
            </Row>

            <Row label="Version">
              <Mono>{version}</Mono>
            </Row>

            {branch && (
              <Row label="Branch">
                <Mono>{branch}</Mono>
              </Row>
            )}

            {sha && (
              <Row label="Commit">
                <Mono>{sha}</Mono>
              </Row>
            )}

            {message && (
              <Row label="Message">
                <span className="max-w-[200px] truncate text-[var(--text)]" title={message}>
                  {message}
                </span>
              </Row>
            )}

            {author && (
              <Row label="Author">
                <span className="text-[var(--text)]">{author}</span>
              </Row>
            )}

            <Row label="Built at">
              <time dateTime={timeIso} className="tabular-nums text-[var(--text)]">
                {buildDate} {buildTime} UTC
              </time>
            </Row>

            <Row label="Age">
              <span className="tabular-nums text-[var(--text)]" suppressHydrationWarning>{ago || "—"}</span>
            </Row>

            {region && (
              <Row label="Region">
                <Mono>{region}</Mono>
              </Row>
            )}

            {nodeVersion && (
              <Row label="Node.js">
                <Mono>v{nodeVersion}</Mono>
              </Row>
            )}

            {nextVersion && (
              <Row label="Next.js">
                <Mono>{nextVersion}</Mono>
              </Row>
            )}
          </dl>

          {/* Arrow pointer */}
          <div className="absolute -bottom-[6px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-app bg-[var(--surface)]" aria-hidden />
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="flex min-w-0 items-center justify-end">{children}</dd>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[10px] text-[var(--text)]">{children}</span>;
}
