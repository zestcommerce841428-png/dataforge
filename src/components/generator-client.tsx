"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getGenerator, type GenOptions } from "@/lib/generators";

const HISTORY_LIMIT = 50;

/* ── Result value renderer ───────────────────────────────────────────────── */
function ResultValue({ value, slug }: { value: string; slug: string }) {
  if (value.startsWith("data:image/")) {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Generated QR Code" className="rounded-lg border border-app" style={{ maxWidth: "280px" }} />
        <a href={value} download={`${slug}.png`} className="text-xs font-medium text-brand-600 underline hover:text-brand-700">
          ↓ Download PNG
        </a>
      </div>
    );
  }
  if (value.trimStart().startsWith("<svg")) {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <div
          className="overflow-auto rounded border border-app bg-white p-3"
          dangerouslySetInnerHTML={{ __html: value }}
        />
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
  return <span className="break-all">{value}</span>;
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
  const historyKey = `df-history-${slug}`;

  useEffect(() => {
    try { const raw = localStorage.getItem(historyKey); if (raw) setHistory(JSON.parse(raw)); } catch { /* noop */ }
  }, [historyKey]);

  const setField = (key: string, value: string | number | boolean) => setOpts((p) => ({ ...p, [key]: value }));

  const run = useCallback(async () => {
    setBusy(true);
    try {
      const n = Math.max(1, Math.min(1000, count || 1));
      const out = await Promise.all(Array.from({ length: n }, () => Promise.resolve(gen.generate(opts))));
      setResults(out);
      // Only save non-visual results to history
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

  const clearHistory = () => { setHistory([]); try { localStorage.removeItem(historyKey); } catch { /* noop */ } };

  const downloadAll = () => {
    const text = results.filter(r => !r.startsWith("data:image/") && !r.trimStart().startsWith("<svg")).join("\n");
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${gen.slug}.txt`; a.click();
    URL.revokeObjectURL(url);
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
              <span className="mt-1 block text-xs text-muted">1 for single, up to 1,000 in bulk.</span>
            </label>
          )}

          <button type="button" onClick={run} disabled={busy} className="w-full rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white shadow-md transition hover:bg-brand-700 disabled:opacity-60">
            {busy ? "Generating…" : "Generate"}
          </button>
        </div>
      </section>

      {/* Output + history */}
      <div className="space-y-6">
        <section className="surface rounded-2xl border p-5 shadow-sm" aria-label="Results">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {isBulk ? `Results (${results.length})` : "Result"}
            </h2>
            {isBulk && hasTextResults && (
              <button type="button" onClick={downloadAll} className="surface-2 rounded-lg border border-app px-3 py-1.5 text-sm font-medium hover:bg-[var(--surface-2)]">
                Download .txt
              </button>
            )}
          </div>

          <div aria-live="polite">
            {results.length === 0 ? (
              <div className="surface-2 grid min-h-32 place-items-center rounded-xl border border-app p-4">
                <p className="text-muted">Press "Generate" to create your data.</p>
              </div>
            ) : isVisualGen ? (
              /* Visual grid for QR / barcode */
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

        {/* History — text only */}
        {!isVisualGen && (
          <section className="surface rounded-2xl border p-5 shadow-sm" aria-label="History">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Your last generated data</h2>
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
