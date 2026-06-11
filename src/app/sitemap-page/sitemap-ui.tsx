"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { SitemapEntry } from "./page";

type Section = "all" | "static" | "tools" | "blog" | "api";
type ViewMode = "grid" | "tree" | "table";

interface Stats {
  total: number;
  static: number;
  tools: number;
  blog: number;
  api: number;
  siteUrl: string;
  buildDate: string;
}

const SECTION_META: Record<Section, { label: string; icon: string; color: string; dot: string }> = {
  all:    { label: "All Pages",    icon: "🗺",  color: "border-brand-500 bg-brand-500 text-white",                   dot: "bg-brand-500" },
  static: { label: "Site Pages",  icon: "📄",  color: "border-sky-500 bg-sky-500 text-white",                       dot: "bg-sky-500" },
  tools:  { label: "Generators",  icon: "⚡",  color: "border-purple-500 bg-purple-500 text-white",                 dot: "bg-purple-500" },
  blog:   { label: "Blog",        icon: "📝",  color: "border-emerald-500 bg-emerald-500 text-white",               dot: "bg-emerald-500" },
  api:    { label: "API Routes",  icon: "{ }", color: "border-amber-500 bg-amber-500 text-white",                   dot: "bg-amber-500" },
};

const PRIORITY_STYLE: Record<number, string> = {
  1.0: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  0.9: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  0.8: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  0.7: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  0.6: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  0.5: "bg-[var(--surface-2)] text-muted",
  0.4: "bg-[var(--surface-2)] text-muted",
  0.3: "bg-[var(--surface-2)] text-muted",
  0.2: "bg-[var(--surface-2)] text-muted",
};

function priorityStyle(p: number) {
  return PRIORITY_STYLE[Math.round(p * 10) / 10] ?? "bg-[var(--surface-2)] text-muted";
}

function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      title="Copy URL"
      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium transition-all ${
        copied ? "bg-green-100 text-green-700" : "bg-[var(--surface-2)] text-muted hover:text-brand-600"
      }`}
    >
      {copied ? "✓" : "⧉"}
    </button>
  );
}

function SectionDot({ section }: { section: Section }) {
  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${SECTION_META[section].dot}`} />;
}

// ── Grid card view ────────────────────────────────────────────────────────────
function GridEntry({ entry, siteUrl }: { entry: SitemapEntry; siteUrl: string }) {
  const meta = SECTION_META[entry.section];
  return (
    <Link
      href={entry.path}
      className="surface group relative flex flex-col rounded-xl border p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md"
    >
      <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <CopyUrlButton url={`${siteUrl}${entry.path}`} />
      </div>
      <div className="flex items-center gap-2">
        <SectionDot section={entry.section} />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">{entry.category}</span>
        {entry.isNew && (
          <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[9px] font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">NEW</span>
        )}
      </div>
      <p className="mt-1.5 text-sm font-semibold leading-tight group-hover:text-brand-600">{entry.title}</p>
      <p className="mt-1 line-clamp-2 text-xs text-muted">{entry.description}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${priorityStyle(entry.priority)}`}>
          P{entry.priority.toFixed(1)}
        </span>
        <span className="text-[10px] text-muted tabular-nums">{entry.lastModified}</span>
        <span aria-hidden className="ml-auto text-muted transition group-hover:translate-x-0.5 group-hover:text-brand-600 text-xs">→</span>
      </div>
    </Link>
  );
}

// ── Tree row view ─────────────────────────────────────────────────────────────
function TreeEntry({ entry, siteUrl }: { entry: SitemapEntry; siteUrl: string }) {
  const meta = SECTION_META[entry.section];
  return (
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-[var(--surface-2)]">
      <SectionDot section={entry.section} />
      <Link href={entry.path} className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-sm group-hover:text-brand-600 transition truncate">{entry.title}</span>
          {entry.isNew && (
            <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[9px] font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">NEW</span>
          )}
        </div>
        <div className="mt-0.5 font-mono text-[10px] text-muted truncate">{entry.path}</div>
      </Link>
      <span className={`hidden shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium sm:block ${priorityStyle(entry.priority)}`}>
        {entry.priority.toFixed(1)}
      </span>
      <span className="hidden shrink-0 text-[10px] text-muted md:block">{entry.lastModified}</span>
      <CopyUrlButton url={`${siteUrl}${entry.path}`} />
    </div>
  );
}

// ── Table row view ────────────────────────────────────────────────────────────
function TableView({ entries, siteUrl }: { entries: SitemapEntry[]; siteUrl: string }) {
  return (
    <div className="surface overflow-hidden rounded-2xl border shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-app text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3 hidden sm:table-cell">Path</th>
              <th className="px-4 py-3 hidden md:table-cell">Section</th>
              <th className="px-4 py-3 hidden lg:table-cell">Category</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3 hidden lg:table-cell">Updated</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app">
            {entries.map((e, i) => (
              <tr key={i} className="group transition hover:bg-[var(--surface-2)]">
                <td className="px-4 py-2.5">
                  <Link href={e.path} className="font-medium group-hover:text-brand-600 transition block max-w-[200px] truncate">
                    {e.title}
                  </Link>
                  {e.isNew && (
                    <span className="ml-1 rounded-full bg-brand-100 px-1.5 py-0.5 text-[9px] font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">NEW</span>
                  )}
                </td>
                <td className="px-4 py-2.5 hidden sm:table-cell">
                  <span className="font-mono text-[11px] text-muted">{e.path}</span>
                </td>
                <td className="px-4 py-2.5 hidden md:table-cell">
                  <div className="flex items-center gap-1.5">
                    <SectionDot section={e.section} />
                    <span className="text-xs capitalize">{e.section}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 hidden lg:table-cell text-xs text-muted">{e.category}</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${priorityStyle(e.priority)}`}>
                    {e.priority.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-2.5 hidden lg:table-cell text-xs text-muted tabular-nums">{e.lastModified}</td>
                <td className="px-4 py-2.5">
                  <CopyUrlButton url={`${siteUrl}${e.path}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function SitemapUI({ entries, stats }: { entries: SitemapEntry[]; stats: Stats }) {
  const [query, setQuery]     = useState("");
  const [section, setSection] = useState<Section>("all");
  const [view, setView]       = useState<ViewMode>("grid");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(["all"]));
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (section !== "all" && e.section !== section) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.path.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    });
  }, [entries, section, query]);

  // Group by category for tree/grid views
  const grouped = useMemo(() => {
    const map = new Map<string, SitemapEntry[]>();
    for (const e of filtered) {
      const key = view === "tree" ? `${e.section}::${e.category}` : e.category;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [filtered, view]);

  const toggleCat = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const allExpanded = expandedCats.size >= grouped.size;
  const toggleAll = () => {
    if (allExpanded) setExpandedCats(new Set());
    else setExpandedCats(new Set(["all", ...grouped.keys()]));
  };

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Site Map</h1>
        <p className="mt-1.5 text-muted">
          Every page, tool and API route on DataForge — searchable, filterable, copy-to-clipboard.
        </p>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(
            [
              { label: "Total pages", value: stats.total,  color: "text-brand-600" },
              { label: "Site pages",  value: stats.static, color: "text-sky-600" },
              { label: "Generators",  value: stats.tools,  color: "text-purple-600" },
              { label: "Blog posts",  value: stats.blog,   color: "text-emerald-600" },
              { label: "API routes",  value: stats.api,    color: "text-amber-600" },
            ] as const
          ).map((s) => (
            <div key={s.label} className="surface rounded-xl border border-app p-3.5 shadow-sm">
              <p className={`text-2xl font-extrabold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="mt-0.5 text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Build info */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted">
          <span>Last built: <strong className="text-[var(--text)]">{stats.buildDate}</strong></span>
          <span>·</span>
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 underline">
            XML sitemap ↗
          </a>
          <span>·</span>
          <span className="font-mono">{stats.siteUrl}</span>
        </div>
      </div>

      {/* ── Controls bar ───────────────────────────────────────────────── */}
      <div className="surface sticky top-16 z-30 mb-6 rounded-2xl border p-3 shadow-sm">
        {/* Search */}
        <div className="relative mb-3">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden>🔍</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, tools, paths, descriptions…"
            aria-label="Search sitemap"
            className="surface-2 w-full rounded-xl border border-app py-2.5 pl-11 pr-4 text-sm outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[var(--text)] text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Section tabs */}
          {(Object.keys(SECTION_META) as Section[]).map((s) => {
            const meta = SECTION_META[s];
            const count = s === "all" ? entries.length : entries.filter((e) => e.section === s).length;
            const active = section === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSection(s)}
                aria-pressed={active ? "true" : "false"}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active ? meta.color + " border-transparent" : "surface-2 border-app text-muted hover:text-[var(--text)]"
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/25" : "bg-[var(--surface)] text-muted"}`}>
                  {count}
                </span>
              </button>
            );
          })}

          {/* View mode + expand/collapse — pushed right */}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleAll}
              className="surface-2 rounded-lg border border-app px-2.5 py-1.5 text-xs text-muted hover:text-[var(--text)]"
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
            {(["grid", "tree", "table"] as ViewMode[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v ? "true" : "false"}
                title={v.charAt(0).toUpperCase() + v.slice(1) + " view"}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                  view === v ? "border-brand-500 bg-brand-500 text-white" : "surface-2 border-app text-muted hover:text-[var(--text)]"
                }`}
              >
                {v === "grid" ? "⊞" : v === "tree" ? "≡" : "▤"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Result count ───────────────────────────────────────────────── */}
      <p className="mb-4 text-sm text-muted" aria-live="polite">
        {filtered.length === 0
          ? "No pages match your search."
          : `${filtered.length} of ${entries.length} pages`}
      </p>

      {/* ── Table view (flat) ───────────────────────────────────────────── */}
      {view === "table" && <TableView entries={filtered} siteUrl={stats.siteUrl} />}

      {/* ── Grid / Tree views (grouped by category) ─────────────────────── */}
      {view !== "table" && (
        <div className="space-y-8">
          {[...grouped.entries()].map(([key, items]) => {
            const label = view === "tree" ? key.split("::")[1] : key;
            const sectionId = view === "tree" ? (key.split("::")[0] as Section) : items[0].section;
            const meta = SECTION_META[sectionId];
            const isExpanded = expandedCats.has(key) || expandedCats.has("all");
            return (
              <section key={key}>
                {/* Category header */}
                <button
                  type="button"
                  onClick={() => toggleCat(key)}
                  className="mb-3 flex w-full items-center gap-3 text-left group"
                >
                  <span className={`inline-block h-3 w-3 rounded-full ${meta.dot}`} />
                  <h2 className="font-bold text-sm uppercase tracking-wide group-hover:text-brand-600 transition">
                    {label}
                  </h2>
                  <span className="surface rounded border border-app px-1.5 py-0.5 text-[10px] font-semibold text-muted tabular-nums">
                    {items.length}
                  </span>
                  <span className="ml-auto text-muted text-xs">{isExpanded ? "▲" : "▼"}</span>
                </button>

                {isExpanded && (
                  view === "grid" ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {items.map((e, i) => <GridEntry key={i} entry={e} siteUrl={stats.siteUrl} />)}
                    </div>
                  ) : (
                    <div className="surface rounded-xl border border-app overflow-hidden">
                      {items.map((e, i) => <TreeEntry key={i} entry={e} siteUrl={stats.siteUrl} />)}
                    </div>
                  )
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="surface flex flex-col items-center gap-3 rounded-2xl border border-dashed border-app py-16 text-center">
          <span className="text-4xl">🗺</span>
          <p className="text-muted">No pages match &quot;{query}&quot;</p>
          <button type="button" onClick={() => setQuery("")} className="text-sm text-brand-600 underline">
            Clear search
          </button>
        </div>
      )}

      {/* ── Footer note ─────────────────────────────────────────────────── */}
      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-app pt-6 text-xs text-muted">
        <span>Machine-readable: <a href="/sitemap.xml" className="hover:text-brand-600 underline" target="_blank" rel="noopener noreferrer">/sitemap.xml</a></span>
        <span>Robots: <a href="/robots.txt" className="hover:text-brand-600 underline" target="_blank" rel="noopener noreferrer">/robots.txt</a></span>
        <span className="ml-auto">{stats.total} total URLs indexed</span>
      </div>
    </div>
  );
}
