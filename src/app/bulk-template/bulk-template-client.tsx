"use client";

import { useCallback, useMemo, useState } from "react";
import { TOOL_META } from "@/lib/generators";

const COUNT_OPTIONS = [5, 10, 20, 50, 100, 200];

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function BulkTemplateGenerator() {
  const [slug, setSlug] = useState(TOOL_META[0]?.slug ?? "");
  const [count, setCount] = useState(20);
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const sortedMeta = useMemo(
    () => [...TOOL_META].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const generate = useCallback(async () => {
    setLoading(true);
    setResults([]);
    setSelected(new Set());
    try {
      const { getGenerator } = await import("@/lib/generators");
      const gen = getGenerator(slug);
      if (!gen) return;
      const out: string[] = [];
      for (let i = 0; i < count; i++) {
        const r = await Promise.resolve(gen.generate({}));
        out.push(r);
      }
      setResults(out);
    } finally {
      setLoading(false);
    }
  }, [slug, count]);

  const copyAll = async () => {
    await navigator.clipboard.writeText(results.join("\n\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadCsv = () => {
    const rows = results.map((r) => `"${r.replace(/"/g, '""')}"`).join("\n");
    downloadText(`result\n${rows}`, `${slug}-bulk.csv`, "text/csv");
  };

  const downloadJson = () => {
    downloadText(JSON.stringify(results, null, 2), `${slug}-bulk.json`, "application/json");
  };

  const toggleSelect = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const copySelected = async () => {
    const sel = results.filter((_, i) => selected.has(i));
    await navigator.clipboard.writeText(sel.join("\n\n"));
  };

  const currentMeta = TOOL_META.find((t) => t.slug === slug);

  return (
    <div className="space-y-5">
      {/* Config */}
      <div className="surface rounded-2xl border p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">Generator</label>
            <select value={slug} onChange={(e) => setSlug(e.target.value)} aria-label="Select generator"
              className="surface-2 w-full rounded-xl border border-app px-3 py-2.5 text-sm outline-none">
              {sortedMeta.map((t) => (
                <option key={t.slug} value={t.slug}>{t.name}</option>
              ))}
            </select>
            {currentMeta && <p className="mt-1.5 text-xs text-muted">{currentMeta.short}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">Count</label>
            <div className="flex gap-1.5">
              {COUNT_OPTIONS.map((c) => (
                <button key={c} type="button" onClick={() => setCount(c)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${count === c ? "border-brand-500 bg-brand-500 text-white" : "surface-2 border-app text-muted hover:border-brand-400"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end">
            <button type="button" onClick={generate} disabled={loading}
              className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
              {loading ? "Generating…" : "Generate"}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{results.length} results</span>
            <button type="button" onClick={copyAll}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${copied ? "border-green-500 text-green-600" : "surface border-app text-muted hover:text-[var(--text)]"}`}>
              {copied ? "✓ Copied all" : "Copy all"}
            </button>
            <button type="button" onClick={downloadCsv}
              className="surface rounded-lg border border-app px-3 py-1.5 text-xs font-medium text-muted hover:text-[var(--text)] transition">
              ↓ CSV
            </button>
            <button type="button" onClick={downloadJson}
              className="surface rounded-lg border border-app px-3 py-1.5 text-xs font-medium text-muted hover:text-[var(--text)] transition">
              ↓ JSON
            </button>
            {selected.size > 0 && (
              <button type="button" onClick={copySelected}
                className="rounded-lg border border-brand-400 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 transition">
                Copy {selected.size} selected
              </button>
            )}
            <span className="ml-auto text-xs text-muted">Click rows to select</span>
          </div>

          <div className="surface rounded-2xl border shadow-sm overflow-hidden">
            <ol className="max-h-[600px] overflow-y-auto divide-y divide-app">
              {results.map((r, i) => (
                <li key={i}
                  onClick={() => toggleSelect(i)}
                  className={`flex cursor-pointer gap-3 px-4 py-3 transition ${selected.has(i) ? "bg-brand-50 dark:bg-brand-950" : "hover:bg-[var(--surface-2)]"}`}>
                  <span className="mt-0.5 shrink-0 text-[10px] tabular-nums text-muted w-5">{i + 1}</span>
                  <pre className="flex-1 whitespace-pre-wrap font-mono text-xs break-all">{r}</pre>
                  {selected.has(i) && <span className="shrink-0 text-brand-600 text-xs">✓</span>}
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {results.length === 0 && !loading && (
        <div className="surface rounded-2xl border p-10 text-center shadow-sm">
          <p className="text-2xl mb-2">⚡</p>
          <p className="text-sm text-muted">Choose a generator and count, then click Generate to produce bulk results.</p>
        </div>
      )}
    </div>
  );
}
