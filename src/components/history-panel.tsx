"use client";

import { useEffect, useState } from "react";

interface HistoryEntry {
  slug: string;
  name: string;
  result: string;
  ts: number;
}

function loadHistory(): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("df-history-")) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as HistoryEntry[];
      entries.push(...parsed);
    } catch { /* skip malformed */ }
  }
  return entries.sort((a, b) => b.ts - a.ts).slice(0, 200);
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function HistoryPanel({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  const filtered = search.trim()
    ? entries.filter(
        (e) =>
          e.name?.toLowerCase().includes(search.toLowerCase()) ||
          e.slug?.toLowerCase().includes(search.toLowerCase()) ||
          e.result?.toLowerCase().includes(search.toLowerCase()),
      )
    : entries;

  const clearAll = () => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith("df-history-")) localStorage.removeItem(k);
    }
    setEntries([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" role="dialog" aria-modal="true" aria-label="Generation History">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col surface border-l border-app shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-app px-4 py-3">
          <h2 className="text-sm font-bold">Generation History</h2>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <button type="button" onClick={clearAll}
                className="rounded-lg border border-app px-2.5 py-1 text-xs text-red-500 hover:border-red-400 transition">
                Clear all
              </button>
            )}
            <button type="button" onClick={onClose} aria-label="Close history panel"
              className="rounded-lg border border-app px-2.5 py-1 text-xs text-muted hover:text-[var(--text)] transition">
              ✕
            </button>
          </div>
        </header>

        {entries.length > 0 && (
          <div className="border-b border-app px-4 py-2">
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history…"
              className="surface-2 w-full rounded-lg border border-app px-3 py-1.5 text-xs outline-none" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted">
              <span className="text-2xl">📋</span>
              <p className="text-sm">{entries.length === 0 ? "No history yet" : "No matches"}</p>
              <p className="text-xs text-center px-6">Generate something using any tool — your results will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-app">
              {filtered.map((entry, i) => (
                <li key={i} className="group px-4 py-3 hover:bg-[var(--surface-2)] transition">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-brand-600 truncate">{entry.name || entry.slug}</span>
                    <span className="shrink-0 text-[10px] text-muted">{timeAgo(entry.ts)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <pre className="flex-1 overflow-hidden text-ellipsis whitespace-pre-wrap font-mono text-[11px] text-muted line-clamp-3">
                      {entry.result}
                    </pre>
                    <button type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(entry.result);
                        setCopied(i);
                        setTimeout(() => setCopied(null), 1400);
                      }}
                      className={`shrink-0 rounded border px-2 py-0.5 text-[10px] transition ${copied === i ? "border-green-500 text-green-600" : "border-app text-muted opacity-0 group-hover:opacity-100"}`}>
                      {copied === i ? "✓" : "Copy"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-app px-4 py-2">
          <p className="text-[10px] text-muted">{filtered.length} of {entries.length} entries · stored in localStorage</p>
        </footer>
      </div>
    </div>
  );
}
