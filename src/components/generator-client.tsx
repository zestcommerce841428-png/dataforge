"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getGenerator, type GenOptions } from "@/lib/generators";

const HISTORY_LIMIT = 50;
const RECENT_KEY = "df-recent";
const RECENT_LIMIT = 8;

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function saveRecent(slug: string) {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const prev: string[] = raw ? JSON.parse(raw) : [];
    const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, RECENT_LIMIT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* noop */ }
}

function hexSwatches(value: string): string[] {
  const matches = value.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g);
  return matches ? [...new Set(matches)] : [];
}

/* ── Result value renderer ───────────────────────────────────────────────── */
function ResultValue({ value, slug }: { value: string; slug: string }) {
  if (value.startsWith("data:image/")) {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Generated image" className="rounded-lg border border-app" style={{ maxWidth: "280px" }} />
        <a href={value} download={`${slug}.png`} className="text-xs font-medium text-brand-600 underline hover:text-brand-700">
          ↓ Download PNG
        </a>
      </div>
    );
  }
  if (value.trimStart().startsWith("<svg")) {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <div className="overflow-auto rounded border border-app bg-white p-3" dangerouslySetInnerHTML={{ __html: value }} />
        <button
          type="button"
          onClick={() => {
            const blob = new Blob([value], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `${slug}.svg`; a.click();
            URL.revokeObjectURL(url);
          }}
          className="text-xs font-medium text-brand-600 underline hover:text-brand-700"
        >
          ↓ Download SVG
        </button>
      </div>
    );
  }

  const swatches = hexSwatches(value);
  return (
    <span className="break-all">
      {value}
      {swatches.length > 0 && (
        <span className="ml-2 inline-flex items-center gap-1">
          {swatches.map((hex) => (
            <span
              key={hex}
              title={hex}
              className="inline-block h-4 w-4 rounded-full border border-app shadow-sm"
              style={{ background: hex } as React.CSSProperties}
            />
          ))}
        </span>
      )}
    </span>
  );
}

function CopyButton({ value, small }: { value: string; small?: boolean }) {
  const [copied, setCopied] = useState(false);
  const isVisual = value.startsWith("data:image/") || value.trimStart().startsWith("<svg");
  if (isVisual) return null;
  return (
    <button
      type="button"
      onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
      className={`surface-2 shrink-0 rounded-md border border-app font-medium hover:bg-[var(--surface-2)] ${small ? "px-2 py-0.5 text-xs" : "px-3 py-1.5 text-sm"}`}
      aria-label={`Copy: ${value.slice(0, 24)}`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export function GeneratorClient({ slug }: { slug: string }) {
  const gen = getGenerator(slug)!;
  const initial = useMemo<GenOptions>(() => {
    const o: GenOptions = {};
    for (const f of gen.fields) o[f.key] = f.default;
    return o;
  }, [gen]);

  const [opts, setOpts] = useState<GenOptions>(initial);
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshMs, setRefreshMs] = useState(3000);
  const [dlFormat, setDlFormat] = useState<"txt" | "csv" | "json">("txt");
  const [shareMsg, setShareMsg] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const historyKey = `df-history-${slug}`;

  // Restore history & track recent
  useEffect(() => {
    try { const raw = localStorage.getItem(historyKey); if (raw) setHistory(JSON.parse(raw)); } catch { /* noop */ }
    saveRecent(slug);
  }, [historyKey, slug]);

  // Restore opts from URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const restored: GenOptions = { ...initial };
    let found = false;
    for (const f of gen.fields) {
      const v = params.get(f.key);
      if (v !== null) {
        restored[f.key] = f.type === "number" ? Number(v) : f.type === "checkbox" ? v === "true" : v;
        found = true;
      }
    }
    if (found) setOpts(restored);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const setField = (key: string, value: string | number | boolean) => setOpts((p) => ({ ...p, [key]: value }));

  const run = useCallback(async () => {
    setBusy(true);
    try {
      const n = Math.max(1, Math.min(1000, count || 1));
      const out = await Promise.all(Array.from({ length: n }, () => Promise.resolve(gen.generate(opts))));
      setResults(out);
      const textOnly = out.filter(r => !r.startsWith("data:image/") && !r.trimStart().startsWith("<svg"));
      if (textOnly.length) {
        setHistory((prev) => {
          const next = [...textOnly.slice().reverse(), ...prev].slice(0, HISTORY_LIMIT);
          try { localStorage.setItem(historyKey, JSON.stringify(next)); } catch { /* noop */ }
          return next;
        });
      }
    } catch (e) {
      setResults([`Error: ${(e as Error).message}`]);
    } finally {
      setBusy(false);
    }
  }, [gen, opts, count, historyKey]);

  // Auto-refresh interval
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh) {
      intervalRef.current = setInterval(() => { run(); }, refreshMs);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, refreshMs, run]);

  // Keyboard shortcut: R = generate, Escape = stop auto-refresh
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT","TEXTAREA","SELECT"].includes(tag)) return;
      if (e.key === "r" || e.key === "R") { e.preventDefault(); run(); }
      if (e.key === "Escape") setAutoRefresh(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [run]);

  const clearHistory = () => { setHistory([]); try { localStorage.removeItem(historyKey); } catch { /* noop */ } };

  const download = () => {
    const textRows = results.filter(r => !r.startsWith("data:image/") && !r.trimStart().startsWith("<svg"));
    if (!textRows.length) return;
    let content: string, mime: string, ext: string;
    if (dlFormat === "json") {
      content = JSON.stringify(textRows, null, 2);
      mime = "application/json"; ext = "json";
    } else if (dlFormat === "csv") {
      content = textRows.map(r => `"${r.replace(/"/g, '""')}"`).join("\n");
      mime = "text/csv"; ext = "csv";
    } else {
      content = textRows.join("\n");
      mime = "text/plain"; ext = "txt";
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${gen.slug}.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  const shareURL = async () => {
    const params = new URLSearchParams();
    for (const f of gen.fields) {
      if (opts[f.key] !== f.default) params.set(f.key, String(opts[f.key]));
    }
    const url = `${window.location.origin}${window.location.pathname}${params.toString() ? "?" + params : ""}`;
    await navigator.clipboard.writeText(url);
    setShareMsg("Link copied!");
    setTimeout(() => setShareMsg(""), 2000);
  };

  const copyAll = async () => {
    const textRows = results.filter(r => !r.startsWith("data:image/") && !r.trimStart().startsWith("<svg"));
    if (!textRows.length) return;
    await navigator.clipboard.writeText(textRows.join("\n"));
    setShareMsg("All copied!");
    setTimeout(() => setShareMsg(""), 2000);
  };

  const isVisualGen = gen.slug === "qr-code" || gen.slug === "barcode";
  const hasTextResults = results.some(r => !r.startsWith("data:image/") && !r.trimStart().startsWith("<svg"));
  const isBulk = results.length > 1;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Controls */}
      <section className="surface h-fit rounded-2xl border p-5 shadow-sm" aria-label="Options">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Options</h2>
        <div className="space-y-4">
          {gen.fields.map((f) => (
            <div key={f.key}>
              {f.type === "checkbox" ? (
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={Boolean(opts[f.key])} onChange={(e) => setField(f.key, e.target.checked)} className="h-5 w-5 rounded accent-brand-600" />
                  <span className="text-sm font-medium">{f.label}</span>
                </label>
              ) : (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">{f.label}</span>
                  {f.type === "select" ? (
                    <select value={String(opts[f.key])} onChange={(e) => setField(f.key, e.target.value)} className="surface-2 w-full rounded-lg border border-app px-3 py-2 text-sm">
                      {f.options?.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type === "number" ? "number" : "text"}
                      value={String(opts[f.key])} min={f.min} max={f.max}
                      onChange={(e) => setField(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                      className="surface-2 w-full rounded-lg border border-app px-3 py-2 text-sm"
                    />
                  )}
                  {f.help && <span className="mt-1 block text-xs text-muted">{f.help}</span>}
                </label>
              )}
            </div>
          ))}

          {!isVisualGen && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">How many?</span>
              <input type="number" min={1} max={1000} value={count} onChange={(e) => setCount(Number(e.target.value))} className="surface-2 w-full rounded-lg border border-app px-3 py-2 text-sm" />
              <span className="mt-1 block text-xs text-muted">1–1,000. Press <kbd className="rounded border border-app px-1 py-0.5 font-mono text-[10px]">R</kbd> to regenerate.</span>
            </label>
          )}

          <button type="button" onClick={run} disabled={busy} className="w-full rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white shadow-md transition hover:bg-brand-700 disabled:opacity-60">
            {busy ? "Generating…" : "Generate"}
          </button>

          {/* Auto-refresh */}
          {!isVisualGen && (
            <div className="surface-2 rounded-xl border border-app p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold">Auto-refresh</span>
                <button
                  type="button"
                  onClick={() => setAutoRefresh((v) => !v)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoRefresh ? "bg-brand-600" : "bg-[var(--border)]"}`}
                  aria-pressed={autoRefresh ? "true" : "false"}
                  aria-label={autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"}
                  title={autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${autoRefresh ? "translate-x-4" : "translate-x-1"}`} />
                </button>
              </div>
              {autoRefresh && (
                <div className="mt-2">
                  <select value={refreshMs} onChange={(e) => setRefreshMs(Number(e.target.value))} aria-label="Auto-refresh interval" title="Auto-refresh interval" className="surface-2 w-full rounded-lg border border-app px-2 py-1 text-xs">
                    <option value={1000}>Every 1 second</option>
                    <option value={2000}>Every 2 seconds</option>
                    <option value={3000}>Every 3 seconds</option>
                    <option value={5000}>Every 5 seconds</option>
                    <option value={10000}>Every 10 seconds</option>
                    <option value={30000}>Every 30 seconds</option>
                  </select>
                  <p className="mt-1 text-[10px] text-muted">Press Esc to stop.</p>
                </div>
              )}
            </div>
          )}

          {/* Share URL */}
          <div className="flex gap-2">
            <button type="button" onClick={shareURL} className="surface-2 flex-1 rounded-lg border border-app px-2 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">
              🔗 Share URL
            </button>
            {shareMsg && <span className="self-center text-xs text-brand-600">{shareMsg}</span>}
          </div>
        </div>
      </section>

      {/* Output + history */}
      <div className="space-y-6">
        <section className="surface rounded-2xl border p-5 shadow-sm" aria-label="Results">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {isBulk ? `Results (${results.length})` : "Result"}
              {autoRefresh && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden />}
            </h2>
            {isBulk && hasTextResults && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={copyAll} className="surface-2 rounded-lg border border-app px-2 py-1 text-xs font-medium hover:bg-[var(--surface-2)]">
                  Copy all
                </button>
                <select value={dlFormat} onChange={(e) => setDlFormat(e.target.value as "txt"|"csv"|"json")} aria-label="Download format" title="Download format" className="surface-2 rounded-lg border border-app px-2 py-1 text-xs">
                  <option value="txt">.txt</option>
                  <option value="csv">.csv</option>
                  <option value="json">.json</option>
                </select>
                <button type="button" onClick={download} className="surface-2 rounded-lg border border-app px-2 py-1 text-xs font-medium hover:bg-[var(--surface-2)]">
                  ↓ Download
                </button>
              </div>
            )}
          </div>

          <div aria-live="polite">
            {results.length === 0 ? (
              <div className="surface-2 grid min-h-32 place-items-center rounded-xl border border-app p-4">
                <p className="text-muted">Press "Generate" or <kbd className="rounded border border-app px-1.5 py-0.5 font-mono text-xs">R</kbd> to create your data.</p>
              </div>
            ) : isVisualGen ? (
              <div className={`grid gap-4 ${isBulk ? "sm:grid-cols-2" : ""}`}>
                {results.map((r, i) => (
                  <div key={i} className="surface-2 flex flex-col items-center rounded-xl border border-app p-3">
                    <ResultValue value={r} slug={gen.slug} />
                  </div>
                ))}
              </div>
            ) : isBulk ? (
              <ul className="surface-2 max-h-96 space-y-1.5 overflow-auto rounded-xl border border-app p-4 font-mono text-sm">
                {results.map((r, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 border-b border-app pb-1.5 last:border-0">
                    <ResultValue value={r} slug={gen.slug} />
                    <CopyButton value={r} small />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="surface-2 flex items-center justify-between gap-3 rounded-xl border border-app p-5">
                <output className="break-all font-mono text-xl font-semibold">
                  <ResultValue value={results[0]} slug={gen.slug} />
                </output>
                <CopyButton value={results[0]} />
              </div>
            )}
          </div>
        </section>

        {/* History */}
        {!isVisualGen && (
          <section className="surface rounded-2xl border p-5 shadow-sm" aria-label="History">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                History <span className="text-muted font-normal">({history.length}/{HISTORY_LIMIT})</span>
              </h2>
              {history.length > 0 && (
                <button type="button" onClick={clearHistory} className="text-sm font-medium text-muted hover:text-[var(--text)]">Clear</button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-muted">Nothing yet — generated values are saved here on this device.</p>
            ) : (
              <ul className="max-h-72 space-y-1.5 overflow-auto font-mono text-sm">
                {history.map((r, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 border-b border-app pb-1.5 last:border-0">
                    <span className="break-all">{r}</span>
                    <CopyButton value={r} small />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
