"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, type ToolMeta } from "@/lib/generators";

const FAV_KEY = "df-favorites";

export function ToolExplorer({ tools }: { tools: ToolMeta[] }) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavs(new Set(JSON.parse(raw)));
    } catch { /* noop */ }
    setMounted(true);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
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
  }, [tools, query, activeCat, favs, showFavsOnly]);

  const catName = (id: string) => CATEGORIES.find((c) => c.id === id)?.name ?? id;

  return (
    <div>
      {/* Search bar */}
      <div className="surface sticky top-16 z-30 mb-6 rounded-2xl border p-3 shadow-sm">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden>
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${tools.length} tools… (e.g. "password", "uuid", "color")`}
            aria-label="Search tools"
            className="surface-2 w-full rounded-xl border border-app py-3 pl-11 pr-4 text-sm outline-none"
          />
        </div>

        {/* Category filter chips */}
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
          ? showFavsOnly ? "No favourites yet — click ★ on any tool to pin it." : "No tools match your search."
          : `Showing ${filtered.length} ${filtered.length === 1 ? "tool" : "tools"}`}
      </p>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((t) => {
          const isFav = favs.has(t.slug);
          return (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}`}
              className="surface group relative flex flex-col rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md"
            >
              {/* Favourite star */}
              {mounted && (
                <button
                  type="button"
                  onClick={(e) => toggleFav(t.slug, e)}
                  aria-label={isFav ? `Remove ${t.name} from favourites` : `Add ${t.name} to favourites`}
                  title={isFav ? "Remove from favourites" : "Add to favourites"}
                  className={`absolute right-3 top-3 text-sm transition-opacity ${isFav ? "text-amber-400" : "text-muted opacity-0 group-hover:opacity-100"}`}
                >
                  {isFav ? "★" : "☆"}
                </button>
              )}
              <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-600">
                {catName(t.category)}
              </span>
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
