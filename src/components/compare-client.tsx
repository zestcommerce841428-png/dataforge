"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TOOL_META, getGenerator, type GenOptions, type ToolMeta } from "@/lib/generators";

/* ── Mini generator panel ──────────────────────────────────────────────────── */
function MiniPanel({
  initialSlug,
  label,
}: {
  initialSlug: string;
  label: string;
}) {
  const [slug, setSlug] = useState(initialSlug);
  const gen = useMemo(() => getGenerator(slug), [slug]);

  const initial = useMemo<GenOptions>(() => {
    if (!gen) return {};
    const o: GenOptions = {};
    for (const f of gen.fields) o[f.key] = f.default;
    return o;
  }, [gen]);

  const [opts, setOpts] = useState<GenOptions>(initial);
  const [result, setResult] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset opts when slug changes
  useEffect(() => { setOpts(initial); setResult(""); }, [initial]);

  const setField = (key: string, value: string | number | boolean) =>
    setOpts((p) => ({ ...p, [key]: value }));

  const run = useCallback(async () => {
    if (!gen) return;
    setBusy(true);
    try {
      const out = await Promise.resolve(gen.generate(opts));
      setResult(out);
    } catch (e) {
      setResult(`Error: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }, [gen, opts]);

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  if (!gen) return null;

  const isVisual = result.startsWith("data:image/") || result.trimStart().startsWith("<svg");

  return (
    <div className="surface flex flex-col rounded-2xl border shadow-sm">
      {/* Header — generator selector */}
      <div className="surface-2 rounded-t-2xl border-b border-app px-4 py-3">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </label>
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          aria-label={`Select generator for ${label}`}
          className="surface w-full rounded-lg border border-app px-3 py-2 text-sm font-medium"
        >
          {TOOL_META.map((t: ToolMeta) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Options */}
      <div className="flex-1 space-y-3 p-4">
        {gen.fields.map((f) => (
          <div key={f.key}>
            {f.type === "checkbox" ? (
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(opts[f.key])}
                  onChange={(e) => setField(f.key, e.target.checked)}
                  className="h-4 w-4 rounded accent-brand-600"
                />
                <span className="text-xs font-medium">{f.label}</span>
              </label>
            ) : (
              <label className="block">
                <span className="mb-1 block text-xs font-medium">{f.label}</span>
                {f.type === "select" ? (
                  <select
                    value={String(opts[f.key])}
                    onChange={(e) => setField(f.key, e.target.value)}
                    className="surface-2 w-full rounded-lg border border-app px-2 py-1.5 text-xs"
                  >
                    {f.options?.map((op) => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type === "number" ? "number" : "text"}
                    value={String(opts[f.key])}
                    min={f.min}
                    max={f.max}
                    onChange={(e) =>
                      setField(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)
                    }
                    className="surface-2 w-full rounded-lg border border-app px-2 py-1.5 text-xs"
                  />
                )}
              </label>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="w-full rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? "…" : "Generate"}
        </button>

        {/* Result */}
        {result && (
          <div className="surface-2 rounded-xl border border-app p-3">
            {isVisual ? (
              result.startsWith("data:image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={result} alt="Generated" className="max-w-full rounded" />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: result }} />
              )
            ) : (
              <div className="flex items-start justify-between gap-2">
                <pre className="flex-1 break-all whitespace-pre-wrap font-mono text-xs leading-relaxed">
                  {result}
                </pre>
                <button
                  type="button"
                  onClick={copy}
                  className="surface shrink-0 rounded-md border border-app px-2 py-1 text-xs font-medium hover:bg-[var(--surface-2)]"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Compare page client ──────────────────────────────────────────────────── */
export function CompareClient({ slugA, slugB }: { slugA: string; slugB: string }) {
  const [runKey, setRunKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Generator Comparison</h1>
          <p className="mt-1 text-sm text-muted">
            Run two generators side by side and compare their output.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRunKey((k) => k + 1)}
          className="shrink-0 rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-brand-700"
          title="Run both generators simultaneously"
        >
          ⇄ Run both
        </button>
      </div>

      <div key={runKey} className="grid gap-6 lg:grid-cols-2">
        <MiniPanel initialSlug={slugA} label="Generator A" />
        <MiniPanel initialSlug={slugB} label="Generator B" />
      </div>

      <p className="text-center text-xs text-muted">
        Select any two generators from the dropdowns above. Use{" "}
        <strong>⇄ Run both</strong> to generate from each simultaneously.
      </p>
    </div>
  );
}
