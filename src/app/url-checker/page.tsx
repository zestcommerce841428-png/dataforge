"use client";

import { useState, useCallback } from "react";

interface UrlResult {
  url: string;
  valid: boolean;
  protocol: string;
  host: string;
  path: string;
  query: string;
  hash: string;
  error?: string;
}

function parseUrl(raw: string): UrlResult {
  const url = raw.trim();
  try {
    const u = new URL(url);
    return {
      url,
      valid: true,
      protocol: u.protocol,
      host: u.host,
      path: u.pathname,
      query: u.search,
      hash: u.hash,
    };
  } catch {
    return { url, valid: false, protocol: "", host: "", path: "", query: "", hash: "", error: "Invalid URL" };
  }
}

function encodeUrl(url: string): string {
  try { return encodeURIComponent(url); } catch { return url; }
}
function decodeUrl(url: string): string {
  try { return decodeURIComponent(url); } catch { return url; }
}

const SAMPLES = [
  "https://example.com/path/to/page?query=hello+world&lang=en#section",
  "https://api.github.com/repos/facebook/react/commits?per_page=5&sha=main",
  "ftp://files.example.com/downloads/file.zip",
  "not-a-valid-url",
];

export default function UrlCheckerPage() {
  const [input, setInput] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [mode, setMode] = useState<"single" | "bulk" | "encode">("single");
  const [result, setResult] = useState<UrlResult | null>(null);
  const [bulkResults, setBulkResults] = useState<UrlResult[]>([]);
  const [encodeInput, setEncodeInput] = useState("");
  const [encodeOutput, setEncodeOutput] = useState("");
  const [encodeMode, setEncodeMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  const check = useCallback(() => {
    if (!input.trim()) return;
    setResult(parseUrl(input));
  }, [input]);

  function checkBulk() {
    const lines = bulkInput.split("\n").map((l) => l.trim()).filter(Boolean);
    setBulkResults(lines.map(parseUrl));
  }

  function handleEncodeDecode() {
    setEncodeOutput(encodeMode === "encode" ? encodeUrl(encodeInput) : decodeUrl(encodeInput));
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const INPUT_CLS = "w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm font-mono outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">URL Checker & Validator</h1>
        <p className="mt-1 text-sm text-muted">
          Validate URLs, parse components, bulk-check multiple URLs, and encode/decode URL strings.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="mb-6 flex rounded-xl border border-app bg-[var(--surface-2)] p-1 w-fit gap-1">
        {(["single", "bulk", "encode"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${mode === m ? "surface shadow text-[var(--text)]" : "text-muted hover:text-[var(--text)]"}`}>
            {m === "single" ? "Single URL" : m === "bulk" ? "Bulk Check" : "Encode / Decode"}
          </button>
        ))}
      </div>

      {/* Single mode */}
      {mode === "single" && (
        <div className="space-y-4">
          <div className="surface rounded-2xl border border-app p-6">
            <label htmlFor="url-input" className="mb-2 block text-sm font-medium">URL to check</label>
            <div className="flex gap-2">
              <input id="url-input" type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && check()}
                className={INPUT_CLS} placeholder="https://example.com/path?query=value#hash" />
              <button type="button" onClick={check}
                className="shrink-0 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                Check
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button key={s} type="button" onClick={() => setInput(s)}
                  className="rounded-lg border border-app px-2.5 py-0.5 text-xs hover:border-brand-500 hover:text-brand-600 font-mono truncate max-w-[200px]">
                  {s.length > 30 ? s.slice(0, 30) + "…" : s}
                </button>
              ))}
            </div>
          </div>

          {result && (
            <div className={`surface rounded-2xl border p-6 ${result.valid ? "border-green-200 dark:border-green-900/40" : "border-red-200 dark:border-red-900/40"}`}>
              <div className="mb-4 flex items-center gap-2">
                <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${result.valid ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}>
                  {result.valid ? "✓ Valid URL" : "✗ Invalid URL"}
                </span>
                {result.error && <span className="text-sm text-red-500">{result.error}</span>}
              </div>

              {result.valid && (
                <div className="grid gap-3">
                  {[
                    { label: "Protocol", value: result.protocol },
                    { label: "Host", value: result.host },
                    { label: "Path", value: result.path || "/" },
                    { label: "Query string", value: result.query || "—" },
                    { label: "Hash / Fragment", value: result.hash || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                      <span className="w-36 shrink-0 text-xs font-medium text-muted">{label}</span>
                      <code className="rounded-lg bg-[var(--surface-2)] px-3 py-1 font-mono text-sm">{value}</code>
                    </div>
                  ))}

                  {result.query && (
                    <div className="mt-2">
                      <p className="mb-2 text-xs font-medium text-muted">Query parameters</p>
                      <div className="overflow-hidden rounded-xl border border-app">
                        {Array.from(new URLSearchParams(result.query).entries()).map(([k, v]) => (
                          <div key={k} className="flex items-center gap-3 border-b border-app px-4 py-2 last:border-b-0">
                            <code className="text-xs text-brand-600 font-mono">{k}</code>
                            <span className="text-muted">→</span>
                            <code className="text-xs font-mono">{v}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bulk mode */}
      {mode === "bulk" && (
        <div className="surface rounded-2xl border border-app p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Bulk URL Validator</h2>
            <span className="text-xs text-muted">One URL per line</span>
          </div>
          <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)}
            className="mb-4 h-40 w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] p-4 font-mono text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            placeholder={"https://example.com\nhttps://api.github.com\nnot-a-url"} spellCheck={false} />
          <button type="button" onClick={checkBulk}
            className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Check All
          </button>

          {bulkResults.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex gap-3 text-xs text-muted">
                <span className="text-green-600 font-medium">{bulkResults.filter((r) => r.valid).length} valid</span>
                <span className="text-red-500 font-medium">{bulkResults.filter((r) => !r.valid).length} invalid</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-app">
                {bulkResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-app px-4 py-2.5 last:border-b-0">
                    <span className={`shrink-0 text-sm font-bold ${r.valid ? "text-green-500" : "text-red-500"}`}>
                      {r.valid ? "✓" : "✗"}
                    </span>
                    <code className="flex-1 truncate font-mono text-xs">{r.url}</code>
                    {r.valid && <span className="shrink-0 text-xs text-muted">{r.host}</span>}
                    {!r.valid && <span className="shrink-0 text-xs text-red-500">{r.error}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Encode / Decode mode */}
      {mode === "encode" && (
        <div className="surface rounded-2xl border border-app p-6">
          <div className="mb-4 flex rounded-xl border border-app bg-[var(--surface-2)] p-1 w-fit gap-1">
            {(["encode", "decode"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setEncodeMode(m)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${encodeMode === m ? "surface shadow" : "text-muted"}`}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="encode-input" className="mb-1.5 block text-sm font-medium">Input</label>
              <textarea id="encode-input" value={encodeInput} onChange={(e) => setEncodeInput(e.target.value)}
                className="h-28 w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] p-4 font-mono text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                placeholder={encodeMode === "encode" ? "https://example.com/path?q=hello world&lang=en" : "https%3A%2F%2Fexample.com%2Fpath%3Fq%3Dhello%20world"}
                spellCheck={false} />
            </div>

            <button type="button" onClick={handleEncodeDecode}
              className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              {encodeMode === "encode" ? "URL Encode" : "URL Decode"}
            </button>

            {encodeOutput && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium">Output</label>
                  <button type="button" onClick={() => copy(encodeOutput)}
                    className="text-xs text-muted hover:text-brand-600">{copied ? "Copied!" : "Copy"}</button>
                </div>
                <div className="rounded-xl border border-app bg-[var(--surface-2)] p-4 font-mono text-sm break-all">
                  {encodeOutput}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
