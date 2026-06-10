"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

export type PostMeta = { slug: string; title: string; description: string; date: string; readMins: number; category: string };

const PER_PAGE = 12;

export function BlogList({ items, categories }: { items: PostMeta[]; categories: string[] }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) =>
      (cat === "All" || p.category === cat) &&
      (!q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    );
  }, [items, query, cat]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const shown = filtered.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  const reset = (fn: () => void) => { fn(); setPage(1); };

  return (
    <div>
      <input
        className="input-field mb-4 w-full py-3 text-base"
        placeholder={`Search ${items.length} articles…`}
        value={query}
        onChange={(e) => reset(() => setQuery(e.target.value))}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => reset(() => setCat(c))}
            className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${cat === c ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface hover:border-brand-400"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-muted">{filtered.length} article{filtered.length !== 1 ? "s" : ""}{cat !== "All" && ` in ${cat}`}{query && ` matching “${query}”`}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {shown.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="surface block rounded-2xl border p-5 transition-colors hover:border-brand-400">
            <span className="text-xs font-medium text-brand-600">{p.category}</span>
            <h2 className="mt-1 font-bold leading-snug">{p.title}</h2>
            <p className="mt-1 text-sm text-muted line-clamp-2">{p.description}</p>
            <p className="mt-2 text-xs text-muted">{new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {p.readMins} min read</p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && <p className="py-16 text-center text-muted">No articles found. Try a different search or category.</p>}

      {pages > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={cur === 1} className="rounded-lg border surface px-3 py-1.5 text-sm disabled:opacity-40">← Prev</button>
          {Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - cur) <= 1).map((n, idx, arr) => (
            <span key={n} className="flex items-center">
              {idx > 0 && n - arr[idx - 1] > 1 && <span className="px-1 text-muted">…</span>}
              <button onClick={() => setPage(n)} className={`rounded-lg border px-3 py-1.5 text-sm ${n === cur ? "border-brand-500 bg-brand-500/10 text-brand-600 font-semibold" : "surface"}`}>{n}</button>
            </span>
          ))}
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={cur === pages} className="rounded-lg border surface px-3 py-1.5 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
