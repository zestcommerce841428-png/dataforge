"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SitemapEntry } from "./page";

type Section = "all" | "static" | "tools" | "blog" | "api";
type ViewMode = "grid" | "tree" | "table";
type SortKey  = "priority" | "alpha" | "date";

interface Stats {
  total: number;
  static: number;
  tools: number;
  blog: number;
  api: number;
  siteUrl: string;
  buildDate: string;
}

const SECTION_META: Record<Section, { label: string; icon: string; accent: string; dot: string; ring: string }> = {
  all:    { label: "All Pages",   icon: "🗺",  accent: "bg-brand-500 text-white border-brand-500",   dot: "bg-brand-500",   ring: "ring-brand-300" },
  static: { label: "Pages",      icon: "📄",  accent: "bg-sky-500 text-white border-sky-500",        dot: "bg-sky-500",     ring: "ring-sky-300" },
  tools:  { label: "Generators", icon: "⚡",  accent: "bg-purple-500 text-white border-purple-500",  dot: "bg-purple-500",  ring: "ring-purple-300" },
  blog:   { label: "Blog",       icon: "📝",  accent: "bg-emerald-500 text-white border-emerald-500",dot: "bg-emerald-500", ring: "ring-emerald-300" },
  api:    { label: "API",        icon: "{ }", accent: "bg-amber-500 text-white border-amber-500",    dot: "bg-amber-500",   ring: "ring-amber-300" },
};

const PRIORITY_BADGE: Record<string, string> = {
  "1.0": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "0.9": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "0.8": "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  "0.7": "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  "0.6": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};
function priorityBadge(p: number) {
  return PRIORITY_BADGE[(p).toFixed(1)] ?? "bg-[var(--surface-2)] text-muted";
}

/* ── Helpers ── */
function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => { e.preventDefault(); await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1400); }}
      title={label}
      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium transition-all ${ok ? "bg-green-100 text-green-700" : "bg-[var(--surface-2)] text-muted hover:text-brand-600"}`}
    >
      {ok ? "✓ copied" : "⧉"}
    </button>
  );
}

function NewBadge() {
  return <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[9px] font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">NEW</span>;
}

function SectionDot({ section }: { section: Section }) {
  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${SECTION_META[section].dot}`} />;
}

/* ── Grid card ── */
function GridEntry({ entry, siteUrl, onVisit }: { entry: SitemapEntry; siteUrl: string; onVisit: (path: string) => void }) {
  return (
    <Link
      href={entry.path}
      onClick={() => onVisit(entry.path)}
      className="surface group relative flex flex-col rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 hover:shadow-lg"
    >
      <div className="absolute right-2.5 top-2.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <CopyBtn text={`${siteUrl}${entry.path}`} label="Copy URL" />
      </div>
      <div className="mb-2 flex items-center gap-2">
        <SectionDot section={entry.section} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{entry.category}</span>
        {entry.isNew && <NewBadge />}
      </div>
      <p className="flex-1 text-sm font-semibold leading-snug group-hover:text-brand-600 transition-colors">{entry.title}</p>
      <p className="mt-1.5 line-clamp-2 text-xs text-muted leading-relaxed">{entry.description}</p>
      <div className="mt-3 flex items-center gap-2 border-t border-app pt-2.5">
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${priorityBadge(entry.priority)}`}>P{entry.priority.toFixed(1)}</span>
        <span className="truncate font-mono text-[10px] text-muted">{entry.path}</span>
        <span aria-hidden className="ml-auto shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600 text-sm">→</span>
      </div>
    </Link>
  );
}

/* ── Tree row ── */
function TreeEntry({ entry, siteUrl, onVisit }: { entry: SitemapEntry; siteUrl: string; onVisit: (path: string) => void }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--surface-2)]">
      <SectionDot section={entry.section} />
      <Link href={entry.path} onClick={() => onVisit(entry.path)} className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium group-hover:text-brand-600 transition">{entry.title}</span>
          {entry.isNew && <NewBadge />}
        </div>
        <div className="mt-0.5 font-mono text-[10px] text-muted">{entry.path}</div>
      </Link>
      <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold sm:block ${priorityBadge(entry.priority)}`}>{entry.priority.toFixed(1)}</span>
      <span className="hidden shrink-0 text-[10px] tabular-nums text-muted md:block">{entry.lastModified}</span>
      <CopyBtn text={`${siteUrl}${entry.path}`} label="Copy URL" />
    </div>
  );
}

/* ── Table ── */
function TableView({ entries, siteUrl, onVisit }: { entries: SitemapEntry[]; siteUrl: string; onVisit: (path: string) => void }) {
  return (
    <div className="surface overflow-hidden rounded-2xl border shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-app text-left text-[11px] font-bold uppercase tracking-widest text-muted">
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3 hidden sm:table-cell">Path</th>
              <th className="px-4 py-3 hidden md:table-cell">Type</th>
              <th className="px-4 py-3 hidden lg:table-cell">Category</th>
              <th className="px-4 py-3">Pri</th>
              <th className="px-4 py-3 hidden lg:table-cell">Updated</th>
              <th className="px-4 py-3 w-16" scope="col"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app">
            {entries.map((e, i) => (
              <tr key={i} className="group transition hover:bg-[var(--surface-2)]">
                <td className="px-4 py-2.5 max-w-[180px]">
                  <Link href={e.path} onClick={() => onVisit(e.path)} className="flex items-center gap-1.5 font-medium group-hover:text-brand-600 transition truncate">
                    {e.title}
                    {e.isNew && <NewBadge />}
                  </Link>
                </td>
                <td className="px-4 py-2.5 hidden sm:table-cell font-mono text-[11px] text-muted max-w-[160px] truncate">{e.path}</td>
                <td className="px-4 py-2.5 hidden md:table-cell">
                  <div className="flex items-center gap-1.5"><SectionDot section={e.section} /><span className="text-xs capitalize">{e.section}</span></div>
                </td>
                <td className="px-4 py-2.5 hidden lg:table-cell text-xs text-muted">{e.category}</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${priorityBadge(e.priority)}`}>{e.priority.toFixed(1)}</span>
                </td>
                <td className="px-4 py-2.5 hidden lg:table-cell text-xs tabular-nums text-muted">{e.lastModified}</td>
                <td className="px-4 py-2.5"><CopyBtn text={`${siteUrl}${e.path}`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Stats mini-bar chart (SVG to avoid inline style) ── */
function StatsBar({ stats }: { stats: Stats }) {
  const bars = [
    { key: "static" as Section, count: stats.static, fill: "#38bdf8" },
    { key: "tools"  as Section, count: stats.tools,  fill: "#a855f7" },
    { key: "blog"   as Section, count: stats.blog,   fill: "#34d399" },
    { key: "api"    as Section, count: stats.api,    fill: "#fbbf24" },
  ];
  let x = 0;
  return (
    <svg className="mt-4 h-2 w-full rounded-full overflow-hidden" aria-hidden>
      {bars.map((b) => {
        const pct = (b.count / stats.total) * 100;
        const rect = <rect key={b.key} x={`${x}%`} y="0" width={`${pct}%`} height="100%" fill={b.fill}><title>{`${SECTION_META[b.key].label}: ${b.count}`}</title></rect>;
        x += pct;
        return rect;
      })}
    </svg>
  );
}

/* ── Export helpers ── */
function exportJSON(entries: SitemapEntry[], siteUrl: string) {
  const data = entries.map((e) => ({ ...e, url: `${siteUrl}${e.path}` }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "sitemap.json"; a.click();
}
function exportCSV(entries: SitemapEntry[], siteUrl: string) {
  const header = ["url", "title", "section", "category", "priority", "lastModified", "isNew"];
  const rows = entries.map((e) => [
    `${siteUrl}${e.path}`, e.title, e.section, e.category,
    e.priority, e.lastModified, e.isNew ? "true" : "false",
  ]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "sitemap.csv"; a.click();
}
function copyAllUrls(entries: SitemapEntry[], siteUrl: string) {
  navigator.clipboard.writeText(entries.map((e) => `${siteUrl}${e.path}`).join("\n"));
}

const VISITED_KEY = "df-sitemap-visited";
function loadVisited(): string[] {
  try { return JSON.parse(localStorage.getItem(VISITED_KEY) ?? "[]"); } catch { return []; }
}
function saveVisited(paths: string[]) {
  try { localStorage.setItem(VISITED_KEY, JSON.stringify(paths.slice(0, 30))); } catch { /* noop */ }
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════════════════════ */
export function SitemapUI({ entries, stats }: { entries: SitemapEntry[]; stats: Stats }) {
  const [query, setQuery]         = useState("");
  const [section, setSection]     = useState<Section>("all");
  const [view, setView]           = useState<ViewMode>("grid");
  const [sort, setSort]           = useState<SortKey>("priority");
  const [newOnly, setNewOnly]     = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(["__all__"]));
  const [visited, setVisited]     = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  /* Load recently-visited from localStorage */
  useEffect(() => { setVisited(loadVisited()); }, []);

  /* Keyboard shortcut: / → focus search */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const onVisit = (path: string) => {
    setVisited((prev) => {
      const next = [path, ...prev.filter((p) => p !== path)];
      saveVisited(next);
      return next;
    });
  };

  /* Filter + sort */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = entries.filter((e) => {
      if (section !== "all" && e.section !== section) return false;
      if (newOnly && !e.isNew) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.path.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    });
    if (sort === "priority") list = [...list].sort((a, b) => b.priority - a.priority);
    else if (sort === "alpha") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "date")  list = [...list].sort((a, b) => b.lastModified.localeCompare(a.lastModified));
    return list;
  }, [entries, section, query, newOnly, sort]);

  /* Group by category */
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
  const allExpanded = expandedCats.has("__all__") || expandedCats.size >= grouped.size;
  const toggleAll   = () => allExpanded
    ? setExpandedCats(new Set())
    : setExpandedCats(new Set(["__all__", ...grouped.keys()]));

  const recentEntries = visited
    .map((p) => entries.find((e) => e.path === p))
    .filter(Boolean) as SitemapEntry[];

  const newCount = entries.filter((e) => e.isNew).length;

  /* ── Render ── */
  return (
    <div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              🗺 Site Map
            </h1>
            <p className="mt-2 max-w-2xl text-muted">
              Every page, generator and API route on DataForge — searchable, filterable, sortable, exportable.
            </p>
          </div>
          {/* Export buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => { copyAllUrls(filtered, stats.siteUrl); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 1500); }}
              className="surface-2 flex items-center gap-1.5 rounded-xl border border-app px-3 py-1.5 text-xs font-medium hover:border-brand-400 transition"
            >
              {copiedAll ? "✓ Copied!" : "⧉ Copy all URLs"}
            </button>
            <button type="button" onClick={() => exportCSV(filtered, stats.siteUrl)} className="surface-2 flex items-center gap-1.5 rounded-xl border border-app px-3 py-1.5 text-xs font-medium hover:border-brand-400 transition">
              ↓ CSV
            </button>
            <button type="button" onClick={() => exportJSON(filtered, stats.siteUrl)} className="surface-2 flex items-center gap-1.5 rounded-xl border border-app px-3 py-1.5 text-xs font-medium hover:border-brand-400 transition">
              ↓ JSON
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {([
            { label: "Total URLs",  value: stats.total,  color: "text-brand-600",   bg: "bg-brand-500/8" },
            { label: "Pages",       value: stats.static, color: "text-sky-600",      bg: "bg-sky-500/8" },
            { label: "Generators",  value: stats.tools,  color: "text-purple-600",   bg: "bg-purple-500/8" },
            { label: "Blog posts",  value: stats.blog,   color: "text-emerald-600",  bg: "bg-emerald-500/8" },
            { label: "API routes",  value: stats.api,    color: "text-amber-600",    bg: "bg-amber-500/8" },
          ] as const).map((s) => (
            <div key={s.label} className={`surface rounded-2xl border border-app p-4 shadow-sm ${s.bg}`}>
              <p className={`text-3xl font-extrabold tabular-nums leading-none ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-xs text-muted font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Distribution bar */}
        <StatsBar stats={stats} />
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted">
          {(["static","tools","blog","api"] as const).map((s) => (
            <span key={s} className="flex items-center gap-1">
              <SectionDot section={s} />
              {SECTION_META[s].label}
            </span>
          ))}
        </div>

        {/* Build + links */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
          <span>Built: <strong className="text-[var(--text)]">{stats.buildDate}</strong></span>
          <span>·</span>
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 underline">XML sitemap ↗</a>
          <span>·</span>
          <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 underline">robots.txt ↗</a>
          <span>·</span>
          <span>{newCount} new this build</span>
          <span>·</span>
          <kbd className="rounded border border-app bg-[var(--surface-2)] px-1 font-mono text-[10px]">/</kbd>
          <span>to search</span>
        </div>
      </div>

      {/* ── Recently visited ─────────────────────────────────────────── */}
      {recentEntries.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">🕐 Recently visited</h2>
          <div className="flex flex-wrap gap-2">
            {recentEntries.slice(0, 8).map((e) => (
              <Link
                key={e.path}
                href={e.path}
                onClick={() => onVisit(e.path)}
                className="surface-2 flex items-center gap-1.5 rounded-xl border border-app px-3 py-1.5 text-xs font-medium hover:border-brand-400 hover:text-brand-600 transition"
              >
                <SectionDot section={e.section} />
                {e.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Controls bar ─────────────────────────────────────────────── */}
      <div className="surface sticky top-[52px] sm:top-[57px] z-20 mb-6 rounded-2xl border p-3 shadow-md">
        {/* Search */}
        <div className="relative mb-3">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm" aria-hidden>🔍</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search pages, paths, descriptions…  ( press / )'
            aria-label="Search sitemap"
            className="surface-2 w-full rounded-xl border border-app py-2.5 pl-10 pr-10 text-sm outline-none focus:border-brand-400 transition"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[var(--text)] text-sm">
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Section filters */}
          {(Object.keys(SECTION_META) as Section[]).map((s) => {
            const meta  = SECTION_META[s];
            const count = s === "all" ? entries.length : entries.filter((e) => e.section === s).length;
            const active = section === s;
            return (
              <button key={s} type="button" onClick={() => setSection(s)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active ? `${meta.accent} border-transparent shadow-sm` : "surface-2 border-app text-muted hover:text-[var(--text)]"
                }`}
              >
                <span>{meta.icon}</span>
                <span className="hidden sm:inline">{meta.label}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/25" : "bg-[var(--surface)] text-muted"}`}>{count}</span>
              </button>
            );
          })}

          {/* New only toggle */}
          <button type="button" onClick={() => setNewOnly((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              newOnly ? "border-brand-500 bg-brand-500 text-white shadow-sm" : "surface-2 border-app text-muted hover:text-[var(--text)]"
            }`}
          >
            ✨ New <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${newOnly ? "bg-white/25" : "bg-[var(--surface)] text-muted"}`}>{newCount}</span>
          </button>

          {/* Right side controls */}
          <div className="ml-auto flex items-center gap-1.5 flex-wrap">
            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="surface-2 rounded-xl border border-app px-2.5 py-1.5 text-xs font-medium text-muted outline-none focus:border-brand-400 cursor-pointer"
              aria-label="Sort order"
            >
              <option value="priority">↓ Priority</option>
              <option value="alpha">A → Z</option>
              <option value="date">↓ Date</option>
            </select>

            {/* Expand/collapse */}
            {view !== "table" && (
              <button type="button" onClick={toggleAll}
                className="surface-2 rounded-xl border border-app px-2.5 py-1.5 text-xs text-muted hover:text-[var(--text)] transition">
                {allExpanded ? "Collapse" : "Expand"}
              </button>
            )}

            {/* View toggle */}
            <div className="flex rounded-xl border border-app overflow-hidden surface-2">
              {(["grid", "tree", "table"] as ViewMode[]).map((v, i) => (
                <button key={v} type="button" onClick={() => setView(v)}
                  title={v.charAt(0).toUpperCase() + v.slice(1) + " view"}
                  className={`px-2.5 py-1.5 text-xs font-medium transition ${
                    view === v ? "bg-brand-500 text-white" : "text-muted hover:text-[var(--text)]"
                  } ${i > 0 ? "border-l border-app" : ""}`}
                >
                  {v === "grid" ? "⊞" : v === "tree" ? "≡" : "▤"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Result count ─────────────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between" aria-live="polite">
        <p className="text-sm text-muted">
          {filtered.length === 0
            ? "No results found."
            : <><strong className="text-[var(--text)]">{filtered.length}</strong> of {entries.length} pages</>}
        </p>
        {query && (
          <button type="button" onClick={() => setQuery("")} className="text-xs text-brand-600 hover:underline">Clear search</button>
        )}
      </div>

      {/* ── Table view ───────────────────────────────────────────────── */}
      {view === "table" && <TableView entries={filtered} siteUrl={stats.siteUrl} onVisit={onVisit} />}

      {/* ── Grid / Tree (grouped) ────────────────────────────────────── */}
      {view !== "table" && (
        <div className="space-y-6">
          {filtered.length === 0 ? null : [...grouped.entries()].map(([key, items]) => {
            const label     = view === "tree" ? key.split("::")[1] : key;
            const secId     = view === "tree" ? (key.split("::")[0] as Section) : items[0].section;
            const meta      = SECTION_META[secId];
            const isOpen    = expandedCats.has("__all__") || expandedCats.has(key);
            return (
              <section key={key} aria-label={label}>
                <button type="button" onClick={() => toggleCat(key)}
                  className="group mb-3 flex w-full items-center gap-2.5 text-left"
                >
                  <span className={`inline-block h-3 w-3 rounded-full ${meta.dot}`} />
                  <h2 className="text-sm font-bold uppercase tracking-widest group-hover:text-brand-600 transition">{label}</h2>
                  <span className="surface rounded-lg border border-app px-1.5 py-0.5 text-[10px] font-bold text-muted tabular-nums">{items.length}</span>
                  <svg className={`ml-auto h-4 w-4 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  view === "grid" ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {items.map((e, i) => <GridEntry key={i} entry={e} siteUrl={stats.siteUrl} onVisit={onVisit} />)}
                    </div>
                  ) : (
                    <div className="surface overflow-hidden rounded-2xl border">
                      {items.map((e, i) => <TreeEntry key={i} entry={e} siteUrl={stats.siteUrl} onVisit={onVisit} />)}
                    </div>
                  )
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="surface flex flex-col items-center gap-4 rounded-2xl border border-dashed border-app py-20 text-center">
          <span className="text-5xl">🗺</span>
          <div>
            <p className="font-semibold">No pages found</p>
            <p className="mt-1 text-sm text-muted">Try a different search term or filter.</p>
          </div>
          <div className="flex gap-2">
            {query && <button type="button" onClick={() => setQuery("")} className="rounded-xl border border-app px-4 py-2 text-sm hover:bg-[var(--surface-2)] transition">Clear search</button>}
            {section !== "all" && <button type="button" onClick={() => setSection("all")} className="rounded-xl border border-app px-4 py-2 text-sm hover:bg-[var(--surface-2)] transition">Show all sections</button>}
            {newOnly && <button type="button" onClick={() => setNewOnly(false)} className="rounded-xl border border-app px-4 py-2 text-sm hover:bg-[var(--surface-2)] transition">Remove "new only" filter</button>}
          </div>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-app pt-6 text-xs text-muted">
        <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 underline">XML sitemap</a>
        <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 underline">robots.txt</a>
        <span className="ml-auto tabular-nums">{stats.total} total URLs indexed</span>
      </div>
    </div>
  );
}
