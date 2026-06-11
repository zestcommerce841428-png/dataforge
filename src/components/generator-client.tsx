"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getGenerator, type GenOptions } from "@/lib/generators";
import { HistoryPanel } from "@/components/history-panel";

const HISTORY_LIMIT = 50;
const RECENT_KEY   = "df-recent";
const USAGE_KEY    = "df-usage";
const RECENT_LIMIT = 8;

function incrementUsage(slug: string) {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    map[slug] = (map[slug] ?? 0) + 1;
    localStorage.setItem(USAGE_KEY, JSON.stringify(map));
  } catch { /* noop */ }
}

function getRating(slug: string): "up" | "down" | null {
  try { return (localStorage.getItem(`df-rating-${slug}`) as "up" | "down" | null) ?? null; } catch { return null; }
}
function setRating(slug: string, val: "up" | "down" | null) {
  try {
    if (val === null) localStorage.removeItem(`df-rating-${slug}`);
    else localStorage.setItem(`df-rating-${slug}`, val);
  } catch { /* noop */ }
}

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

  const trimmed = value.trim();
  if (/^(linear|radial|conic)-gradient\(/.test(trimmed)) {
    return (
      <div className="w-full space-y-2">
        <div className="h-16 w-full rounded-lg border border-app" style={{ background: trimmed } as React.CSSProperties} />
        <code className="block break-all text-sm">{value}</code>
      </div>
    );
  }

  const swatches = hexSwatches(value);

  if (swatches.length >= 4) {
    return (
      <div className="w-full space-y-2">
        <div className="flex overflow-hidden rounded-xl border border-app">
          {swatches.map((hex) => (
            <div key={hex} className="flex flex-1 flex-col items-center justify-end pb-2 pt-16" style={{ background: hex } as React.CSSProperties}>
              <span className="rounded px-1 font-mono text-[9px] font-bold" style={{ background: "rgba(0,0,0,0.45)", color: "#fff" } as React.CSSProperties}>
                {hex}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(trimmed)) {
    return (
      <div className="w-full space-y-2">
        <div className="flex gap-2">
          <div className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-app p-3" style={{ background: "#ffffff" } as React.CSSProperties}>
            <div className="h-10 w-full rounded-md" style={{ background: trimmed } as React.CSSProperties} />
            <span className="text-[10px] font-medium" style={{ color: "#555" } as React.CSSProperties}>on white</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-app p-3" style={{ background: "#111111" } as React.CSSProperties}>
            <div className="h-10 w-full rounded-md" style={{ background: trimmed } as React.CSSProperties} />
            <span className="text-[10px] font-medium" style={{ color: "#aaa" } as React.CSSProperties}>on dark</span>
          </div>
        </div>
        <code className="block text-center font-mono font-bold">{value}</code>
      </div>
    );
  }

  return (
    <span className="break-all">
      {value}
      {swatches.length > 0 && (
        <span className="ml-2 inline-flex items-center gap-1">
          {swatches.map((hex) => (
            <span key={hex} title={hex} className="inline-block h-4 w-4 rounded-full border border-app shadow-sm" style={{ background: hex } as React.CSSProperties} />
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
      className={`surface-2 inline-flex shrink-0 items-center gap-1.5 rounded-md border border-app font-medium transition-colors hover:bg-[var(--surface-2)] ${small ? "px-2 py-0.5 text-xs" : "px-3 py-1.5 text-sm"} ${copied ? "border-green-500/40 text-green-600" : ""}`}
      aria-label={copied ? "Copied!" : `Copy: ${value.slice(0, 24)}`}
    >
      {copied ? (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>Copied</>
      ) : (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copy</>
      )}
    </button>
  );
}

export function GeneratorClient({ slug }: { slug: string }) {
  const gen = getGenerator(slug)!;
  const initial = useMemo<GenOptions>(() => {
    const o: GenOptions = {};
    for (const f of gen.fields) o[f.key] = f.default;
    return o;
  }, [gen]);

  const [opts, setOpts]           = useState<GenOptions>(initial);
  const [count, setCount]         = useState(1);
  const [results, setResults]     = useState<string[]>([]);
  const [history, setHistory]     = useState<Array<{ value: string; ts: number }>>([]);
  const [busy, setBusy]           = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshMs, setRefreshMs] = useState(3000);
  const [dlFormat, setDlFormat]   = useState<"txt" | "csv" | "json">("txt");
  const [shareMsg, setShareMsg]   = useState("");
  const [rating, setRatingState]  = useState<"up" | "down" | null>(null);
  const [showApiUsage, setShowApiUsage] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const historyKey = `df-history-${slug}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(historyKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        const migrated = (parsed as Array<string | { value: string; ts: number }>).map((e) =>
          typeof e === "string" ? { value: e, ts: 0 } : e
        );
        setHistory(migrated);
      }
    } catch { /* noop */ }
    saveRecent(slug);
    setRatingState(getRating(slug));
  }, [historyKey, slug]);

  // Restore opts from URL search params (also pre-fill result if ?result= present)
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
    const preResult = params.get("result");
    if (preResult) setResults([preResult]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const setField = (key: string, value: string | number | boolean) => setOpts((p) => ({ ...p, [key]: value }));

  const run = useCallback(async () => {
    setBusy(true);
    incrementUsage(slug);
    try {
      const n = Math.max(1, Math.min(1000, count || 1));
      const out = await Promise.all(Array.from({ length: n }, () => Promise.resolve(gen.generate(opts))));
      setResults(out);
      const textOnly = out.filter(r => !r.startsWith("data:image/") && !r.trimStart().startsWith("<svg"));
      if (textOnly.length) {
        const now = Date.now();
        const newEntries = textOnly.slice().reverse().map((value) => ({ value, ts: now }));
        setHistory((prev) => {
          const next = [...newEntries, ...prev].slice(0, HISTORY_LIMIT);
          try { localStorage.setItem(historyKey, JSON.stringify(next)); } catch { /* noop */ }
          return next;
        });
      }
    } catch (e) {
      setResults([`Error: ${(e as Error).message}`]);
    } finally {
      setBusy(false);
    }
  }, [gen, opts, count, historyKey, slug]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh) {
      intervalRef.current = setInterval(() => { run(); }, refreshMs);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, refreshMs, run]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      if (e.key === "r" || e.key === "R") { e.preventDefault(); run(); }
      if (e.key === "Escape") setAutoRefresh(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [run]);

  const clearHistory = () => { setHistory([]); try { localStorage.removeItem(historyKey); } catch { /* noop */ } };

  const downloadHistory = (fmt: "txt" | "csv" | "json" = "txt") => {
    if (!history.length) return;
    let content: string, mime: string, ext: string;
    if (fmt === "json") {
      content = JSON.stringify(history.map((e) => ({ value: e.value, generated_at: e.ts ? new Date(e.ts).toISOString() : null, tool: gen.name, slug })), null, 2);
      mime = "application/json"; ext = "json";
    } else if (fmt === "csv") {
      const rows = [["value", "generated_at", "tool"]];
      for (const e of history) rows.push([`"${e.value.replace(/"/g, '""')}"`, e.ts ? new Date(e.ts).toISOString() : "", gen.name]);
      content = rows.map((r) => r.join(",")).join("\n");
      mime = "text/csv"; ext = "csv";
    } else {
      content = history.map((e) => e.value).join("\n");
      mime = "text/plain"; ext = "txt";
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${slug}-history.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  const download = () => {
    const textRows = results.filter(r => !r.startsWith("data:image/") && !r.trimStart().startsWith("<svg"));
    if (!textRows.length) return;
    let content: string, mime: string, ext: string;
    if (dlFormat === "json") {
      content = JSON.stringify(textRows, null, 2); mime = "application/json"; ext = "json";
    } else if (dlFormat === "csv") {
      content = textRows.map(r => `"${r.replace(/"/g, '""')}"`).join("\n"); mime = "text/csv"; ext = "csv";
    } else {
      content = textRows.join("\n"); mime = "text/plain"; ext = "txt";
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

  const shareResult = async () => {
    const textRows = results.filter(r => !r.startsWith("data:image/") && !r.trimStart().startsWith("<svg"));
    if (!textRows.length) return;
    const value = textRows.length === 1 ? textRows[0] : textRows.join("\n");
    const params = new URLSearchParams();
    if (textRows.length === 1) params.set("result", value);
    for (const f of gen.fields) {
      if (opts[f.key] !== f.default) params.set(f.key, String(opts[f.key]));
    }
    const url = `${window.location.origin}${window.location.pathname}?${params}`;
    await navigator.clipboard.writeText(url);
    setShareMsg("Result link copied!");
    setTimeout(() => setShareMsg(""), 2000);
  };

  const copyAll = async () => {
    const textRows = results.filter(r => !r.startsWith("data:image/") && !r.trimStart().startsWith("<svg"));
    if (!textRows.length) return;
    await navigator.clipboard.writeText(textRows.join("\n"));
    setShareMsg("All copied!");
    setTimeout(() => setShareMsg(""), 2000);
  };

  const handlePrint = () => window.print();

  const handleRating = (val: "up" | "down") => {
    const next = rating === val ? null : val;
    setRatingState(next);
    setRating(slug, next);
  };

  const isVisualGen  = gen.slug === "qr-code" || gen.slug === "barcode";
  const hasTextResults = results.some(r => !r.startsWith("data:image/") && !r.trimStart().startsWith("<svg"));
  const isBulk       = results.length > 1;
  const origin       = typeof window !== "undefined" ? window.location.origin : "https://dataforge-omega.vercel.app";

  // Build live API URL with current field values
  const fieldParams = gen.fields
    .map((f) => `${encodeURIComponent(f.key)}=${encodeURIComponent(String(opts[f.key] ?? f.default))}`)
    .join("&");
  const liveApiUrl = `${origin}/api/generate?tool=${slug}&count=5${fieldParams ? "&" + fieldParams : ""}`;

  const apiExample = `# cURL (with current field values)
curl "${liveApiUrl}"

# JavaScript (fetch)
const res = await fetch("${liveApiUrl}");
const { results } = await res.json();

# Python
import requests
data = requests.get("${origin}/api/generate", params={"tool": "${slug}", "count": 5${gen.fields.length > 0 ? ", " + gen.fields.map((f) => `"${f.key}": "${String(opts[f.key] ?? f.default)}"`).join(", ") : ""}}).json()
print(data["results"])`;

  return (
    <>
    {showHistoryPanel && <HistoryPanel onClose={() => setShowHistoryPanel(false)} />}
    <div className="grid gap-6 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
      {/* Controls */}
      <section className="surface h-fit rounded-2xl border p-5 shadow-sm" aria-label="Options">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">Options</h2>
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

          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white shadow-md transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? (
              <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Generating…</>
            ) : "Generate"}
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
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${autoRefresh ? "translate-x-4" : "translate-x-1"}`} />
                </button>
              </div>
              {autoRefresh && (
                <div className="mt-2">
                  <select value={refreshMs} onChange={(e) => setRefreshMs(Number(e.target.value))} aria-label="Auto-refresh interval" className="surface-2 w-full rounded-lg border border-app px-2 py-1 text-xs">
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

          {/* Action buttons row */}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={shareURL} className="surface-2 flex-1 rounded-lg border border-app px-2 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">
              🔗 Share URL
            </button>
            <Link href={`/compare?a=${slug}`} className="surface-2 rounded-lg border border-app px-2 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]" title="Compare side-by-side">
              ⇄ Compare
            </Link>
            {shareMsg && <span className="w-full text-center text-xs text-brand-600">{shareMsg}</span>}
          </div>

          {/* API usage toggle */}
          <button
            type="button"
            onClick={() => setShowApiUsage((v) => !v)}
            className="surface-2 flex w-full items-center justify-between rounded-lg border border-app px-3 py-2 text-xs font-medium text-muted hover:text-[var(--text)]"
          >
            <span>{"{ }"} API Usage</span>
            <span aria-hidden>{showApiUsage ? "▲" : "▼"}</span>
          </button>
          {showApiUsage && (
            <div className="space-y-2">
              <div className="surface-2 flex items-center gap-2 overflow-hidden rounded-lg border border-app px-3 py-2">
                <span className="shrink-0 text-[10px] font-semibold text-brand-600">GET</span>
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[10px] text-muted">{liveApiUrl}</span>
                <button type="button" onClick={async () => { await navigator.clipboard.writeText(liveApiUrl); }}
                  className="shrink-0 rounded border border-app px-1.5 py-0.5 text-[10px] text-muted hover:text-brand-600">
                  Copy URL
                </button>
              </div>
              <pre className="surface-2 overflow-x-auto rounded-xl border border-app p-3 text-[10px] leading-relaxed text-muted">
                {apiExample}
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* Output + history */}
      <div className="space-y-6 print-output">
        <section className="surface rounded-2xl border p-5 shadow-sm" aria-label="Results">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
              {isBulk ? `Results (${results.length})` : "Result"}
              {autoRefresh && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden />}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {isBulk && hasTextResults && (
                <>
                  <button type="button" onClick={copyAll} className="surface-2 rounded-lg border border-app px-2 py-1 text-xs font-medium hover:bg-[var(--surface-2)]">
                    Copy all
                  </button>
                  <select value={dlFormat} onChange={(e) => setDlFormat(e.target.value as "txt"|"csv"|"json")} aria-label="Download format" className="surface-2 rounded-lg border border-app px-2 py-1 text-xs">
                    <option value="txt">.txt</option>
                    <option value="csv">.csv</option>
                    <option value="json">.json</option>
                  </select>
                  <button type="button" onClick={download} className="surface-2 rounded-lg border border-app px-2 py-1 text-xs font-medium hover:bg-[var(--surface-2)]">
                    ↓ Download
                  </button>
                </>
              )}
              {hasTextResults && (
                <button type="button" onClick={shareResult} title="Copy sharable link with this result" className="surface-2 rounded-lg border border-app px-2 py-1 text-xs font-medium hover:bg-[var(--surface-2)]">
                  🔗 Share result
                </button>
              )}
              {results.length > 0 && (
                <button type="button" onClick={handlePrint} title="Print results" className="surface-2 rounded-lg border border-app px-2 py-1 text-xs font-medium hover:bg-[var(--surface-2)] print:hidden">
                  🖨 Print
                </button>
              )}
            </div>
          </div>

          <div aria-live="polite">
            {results.length === 0 ? (
              <div className="surface-2 flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-app p-8 text-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted opacity-30" aria-hidden>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-muted">No output yet</p>
                  <p className="mt-1 text-xs text-muted">
                    Click <strong className="font-semibold">Generate</strong> or press{" "}
                    <kbd className="rounded border border-app bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px]">R</kbd>
                  </p>
                </div>
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

          {/* Rating */}
          {results.length > 0 && (
            <div className="mt-4 flex items-center gap-3 border-t border-app pt-3">
              <span className="text-xs text-muted">Was this useful?</span>
              <button
                type="button"
                onClick={() => handleRating("up")}
                aria-pressed={rating === "up" ? "true" : "false"}
                className={`rounded-lg border px-2.5 py-1 text-sm transition ${rating === "up" ? "border-green-500 bg-green-50 text-green-600 dark:bg-green-950" : "border-app text-muted hover:border-green-400"}`}
              >
                👍
              </button>
              <button
                type="button"
                onClick={() => handleRating("down")}
                aria-pressed={rating === "down" ? "true" : "false"}
                className={`rounded-lg border px-2.5 py-1 text-sm transition ${rating === "down" ? "border-red-400 bg-red-50 text-red-600 dark:bg-red-950" : "border-app text-muted hover:border-red-400"}`}
              >
                👎
              </button>
              {rating && <span className="text-xs text-muted">{rating === "up" ? "Thanks for the feedback!" : "We'll keep improving."}</span>}
            </div>
          )}
        </section>

        {/* History */}
        {!isVisualGen && (
          <section className="surface rounded-2xl border p-5 shadow-sm" aria-label="History">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                History <span className="font-normal">({history.length}/{HISTORY_LIMIT})</span>
              </h2>
              {history.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    aria-label="History export format"
                    className="surface-2 rounded border border-app px-1.5 py-0.5 text-xs text-muted"
                    defaultValue="txt"
                    onChange={(e) => downloadHistory(e.target.value as "txt" | "csv" | "json")}
                  >
                    <option value="txt">.txt</option>
                    <option value="csv">.csv</option>
                    <option value="json">.json</option>
                  </select>
                  <button type="button" onClick={() => downloadHistory("txt")} className="text-xs font-medium text-muted hover:text-[var(--text)]">↓ Export</button>
                  <button type="button" onClick={clearHistory} className="text-xs font-medium text-muted hover:text-[var(--text)]">Clear</button>
                </div>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-muted">Nothing yet — generated values are saved here on this device.</p>
            ) : (
              <ul className="max-h-72 space-y-1.5 overflow-auto font-mono text-sm">
                {history.map((e, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 border-b border-app pb-1.5 last:border-0">
                    <div className="min-w-0">
                      <span className="break-all">{e.value}</span>
                      {e.ts > 0 && (
                        <time dateTime={new Date(e.ts).toISOString()} className="ml-2 text-[10px] text-muted tabular-nums" title={new Date(e.ts).toLocaleString()}>
                          {new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </time>
                      )}
                    </div>
                    <CopyButton value={e.value} small />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
    </>
  );
}
