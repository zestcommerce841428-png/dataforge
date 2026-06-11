"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, type ToolMeta } from "@/lib/generators";

const FAV_KEY   = "df-favorites";
const USAGE_KEY = "df-usage";

function getUsage(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(USAGE_KEY) ?? "{}"); } catch { return {}; }
}

type SortMode = "az" | "za" | "usage";

export function ToolExplorer({ tools }: { tools: ToolMeta[] }) {
  const [query, setQuery]           = useState("");
  const [activeCat, setActiveCat]   = useState<string>("all");
  const [favs, setFavs]             = useState<Set<string>>(new Set());
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [usage, setUsage]           = useState<Record<string, number>>({});
  const [sort, setSort]             = useState<SortMode>("az");
  const [quickCopied, setQuickCopied] = useState<string | null>(null);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const gridRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavs(new Set(JSON.parse(raw)));
    } catch { /* noop */ }
    setUsage(getUsage());
    setMounted(true);
  }, []);

  // '/' global shortcut → focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // 'G' shortcut on focused card → quick-generate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "g" && e.key !== "G") return;
      const el = document.activeElement as HTMLElement;
      if (!el?.hasAttribute("data-card")) return;
      const slug = el.getAttribute("href")?.replace("/tools/", "");
      if (!slug) return;
      e.preventDefault();
      // Simulate click on the ⚡ button inside the focused card
      const btn = el.querySelector<HTMLButtonElement>("[data-quickgen]");
      btn?.click();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Arrow-key navigation within the tool grid
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      const grid = gridRef.current;
      if (!grid) return;
      const links = Array.from(grid.querySelectorAll<HTMLAnchorElement>("a[data-card]"));
      const idx = links.indexOf(document.activeElement as HTMLAnchorElement);
      if (idx === -1) return;
      e.preventDefault();
      const firstRect  = links[0]?.getBoundingClientRect();
      const secondRect = links[1]?.getBoundingClientRect();
      const cols = firstRect && secondRect && secondRect.top === firstRect.top ? Math.round(grid.clientWidth / firstRect.width) : 1;
      let next = idx;
      if (e.key === "ArrowRight") next = idx + 1;
      else if (e.key === "ArrowLeft") next = idx - 1;
      else if (e.key === "ArrowDown") next = idx + cols;
      else if (e.key === "ArrowUp") next = idx - cols;
      const target = links[Math.max(0, Math.min(next, links.length - 1))];
      target?.focus();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleFav = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      try { localStorage.setItem(FAV_KEY, JSON.stringify([...next])); } catch { /* noop */ }
      return next;
    });
  };

  // Quick-generate and copy — lazy-loads generators bundle only on first click
  const quickGenerate = useCallback(async (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quickLoading) return;
    setQuickLoading(slug);
    try {
      const { getGenerator } = await import("@/lib/generators");
      const gen = getGenerator(slug);
      if (!gen) return;
      const opts: Record<string, string | number | boolean> = {};
      for (const f of gen.fields) opts[f.key] = f.default;
      const result = await Promise.resolve(gen.generate(opts));
      if (!result.startsWith("data:image/") && !result.trimStart().startsWith("<svg")) {
        await navigator.clipboard.writeText(result);
        setQuickCopied(slug);
        setTimeout(() => setQuickCopied(null), 1600);
        // Increment usage counter
        try {
          const raw = localStorage.getItem(USAGE_KEY);
          const map: Record<string, number> = raw ? JSON.parse(raw) : {};
          map[slug] = (map[slug] ?? 0) + 1;
          localStorage.setItem(USAGE_KEY, JSON.stringify(map));
          setUsage({ ...map });
        } catch { /* noop */ }
      }
    } catch { /* noop */ } finally {
      setQuickLoading(null);
    }
  }, [quickLoading]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = tools.filter((t) => {
      if (showFavsOnly && !favs.has(t.slug)) return false;
      if (!showFavsOnly && activeCat !== "all" && t.category !== activeCat) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        t.slug.includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });

    if (sort === "usage") return [...base].sort((a, b) => (usage[b.slug] ?? 0) - (usage[a.slug] ?? 0));
    if (sort === "za")    return [...base].sort((a, b) => b.name.localeCompare(a.name));
    return [...base].sort((a, b) => a.name.localeCompare(b.name));
  }, [tools, query, activeCat, favs, showFavsOnly, sort, usage]);

  const catName = (id: string) => CATEGORIES.find((c) => c.id === id)?.name ?? id;

  return (
    <div>
      {/* Search + sort bar */}
      <div className="surface sticky top-16 z-30 mb-6 rounded-2xl border p-3 shadow-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden>
              🔍
            </span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${tools.length} tools… (e.g. "password", "uuid", "color")`}
              aria-label="Search tools"
              className="surface-2 w-full rounded-xl border border-app py-3 pl-11 pr-14 text-sm outline-none"
            />
            <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 hidden rounded border border-app bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block" aria-hidden>
              /
            </kbd>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            aria-label="Sort tools"
            title="Sort order"
            className="surface-2 rounded-xl border border-app px-3 py-2 text-xs text-muted outline-none"
          >
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
            <option value="usage">Most used</option>
          </select>
        </div>

        {/* Category chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip active={activeCat === "all" && !showFavsOnly} onClick={() => { setActiveCat("all"); setShowFavsOnly(false); }}>
            All ({tools.length})
          </Chip>
          {mounted && favs.size > 0 && (
            <Chip active={showFavsOnly} onClick={() => { setShowFavsOnly((v) => !v); setActiveCat("all"); }}>
              ★ Favourites ({favs.size})
            </Chip>
          )}
          {!showFavsOnly && CATEGORIES.map((c) => {
            const n = tools.filter((t) => t.category === c.id).length;
            if (!n) return null;
            return (
              <Chip key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
                {c.name} ({n})
              </Chip>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-muted" aria-live="polite">
        {filtered.length === 0
          ? showFavsOnly
            ? "No favourites yet — click ★ on any tool to pin it."
            : "No tools match your search."
          : `Showing ${filtered.length} ${filtered.length === 1 ? "tool" : "tools"}`}
      </p>

      {/* Grid */}
      <div ref={gridRef} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((t) => {
          const isFav     = favs.has(t.slug);
          const isCopied  = quickCopied === t.slug;
          const isLoading = quickLoading === t.slug;
          const isVisual  = t.slug === "qr-code" || t.slug === "barcode";
          return (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}`}
              data-card
              className="surface group relative flex flex-col rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md"
            >
              {/* Favourite star */}
              {mounted && (
                <button
                  type="button"
                  onClick={(e) => toggleFav(t.slug, e)}
                  aria-label={isFav ? `Remove ${t.name} from favourites` : `Add ${t.name} to favourites`}
                  title={isFav ? "Remove from favourites" : "Add to favourites"}
                  className={`absolute right-9 top-3 text-sm transition-opacity ${
                    isFav ? "text-amber-400" : "text-muted opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {isFav ? "★" : "☆"}
                </button>
              )}

              {/* Quick generate & copy */}
              {mounted && !isVisual && (
                <button
                  type="button"
                  data-quickgen
                  onClick={(e) => quickGenerate(t.slug, e)}
                  aria-label={`Quick-generate ${t.name} and copy to clipboard`}
                  title={isCopied ? "Copied!" : "Generate & copy (G)"}
                  className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded text-xs transition-opacity ${
                    isCopied
                      ? "text-green-500 opacity-100"
                      : isLoading
                        ? "text-muted opacity-100"
                        : "text-muted opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {isCopied ? "✓" : isLoading ? "…" : "⚡"}
                </button>
              )}

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-600">
                  {catName(t.category)}
                </span>
                {mounted && (usage[t.slug] ?? 0) > 0 && (
                  <span className="text-[10px] text-muted tabular-nums" title={`Used ${usage[t.slug]} times`}>
                    {usage[t.slug]}×
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <h3 className="font-semibold leading-tight group-hover:text-brand-600">{t.name}</h3>
                <span aria-hidden className="text-muted transition group-hover:translate-x-0.5 group-hover:text-brand-600">→</span>
              </div>
              <p className="mt-1 text-sm text-muted">{t.short}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active ? "true" : "false"}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "surface-2 border-app text-muted hover:text-[var(--text)]"
      }`}
    >
      {children}
    </button>
  );
}
