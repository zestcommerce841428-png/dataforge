"use client";

import { useState } from "react";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

interface Header { key: string; value: string; enabled: boolean; }

interface HttpResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  elapsed: number;
  truncated: boolean;
  redirected: boolean;
  url: string;
  error?: string;
}

const METHOD_COLORS: Record<Method, string> = {
  GET: "text-green-600", POST: "text-blue-600", PUT: "text-yellow-600",
  PATCH: "text-orange-600", DELETE: "text-red-600", HEAD: "text-purple-600", OPTIONS: "text-gray-600",
};

const INPUT_CLS = "w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

function StatusChip({ status }: { status: number }) {
  const color = status < 300 ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
    : status < 400 ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
    : status < 500 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
    : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${color}`}>{status}</span>;
}

const PRESETS = [
  { label: "JSONPlaceholder GET", method: "GET" as Method, url: "https://jsonplaceholder.typicode.com/posts/1", headers: [], body: "" },
  { label: "JSONPlaceholder POST", method: "POST" as Method, url: "https://jsonplaceholder.typicode.com/posts", headers: [{ key: "Content-Type", value: "application/json", enabled: true }], body: '{"title":"foo","body":"bar","userId":1}' },
  { label: "IP API", method: "GET" as Method, url: "https://api.ipify.org?format=json", headers: [], body: "" },
  { label: "GitHub API", method: "GET" as Method, url: "https://api.github.com/repos/vercel/next.js", headers: [{ key: "Accept", value: "application/vnd.github+json", enabled: true }], body: "" },
];

export default function HttpTesterPage() {
  const [method, setMethod] = useState<Method>("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Header[]>([{ key: "", value: "", enabled: true }]);
  const [body, setBody] = useState("");
  const [followRedirects, setFollowRedirects] = useState(true);
  const [activeTab, setActiveTab] = useState<"response" | "headers" | "raw">("response");
  const [result, setResult] = useState<HttpResult | null>(null);
  const [loading, setLoading] = useState(false);

  function setHeader(i: number, field: keyof Header, value: string | boolean) {
    setHeaders((h) => h.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  }
  function addHeader() { setHeaders((h) => [...h, { key: "", value: "", enabled: true }]); }
  function removeHeader(i: number) { setHeaders((h) => h.filter((_, idx) => idx !== i)); }

  function applyPreset(p: typeof PRESETS[0]) {
    setMethod(p.method); setUrl(p.url);
    setHeaders(p.headers.length ? p.headers : [{ key: "", value: "", enabled: true }]);
    setBody(p.body); setResult(null);
  }

  async function send() {
    if (!url.trim()) return;
    setLoading(true); setResult(null);
    const enabledHeaders: Record<string, string> = {};
    headers.filter((h) => h.enabled && h.key.trim()).forEach((h) => { enabledHeaders[h.key.trim()] = h.value; });

    try {
      const res = await fetch("/api/http-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), method, headers: enabledHeaders, body: body || undefined, followRedirects }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ status: 0, statusText: "Network Error", headers: {}, body: "", elapsed: 0, truncated: false, redirected: false, url: "", error: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  function tryFormatJson(s: string) {
    try { return JSON.stringify(JSON.parse(s), null, 2); } catch { return s; }
  }

  const bodyHasJson = result?.headers["content-type"]?.includes("json");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">HTTP Request Tester</h1>
        <p className="mt-1 text-sm text-muted">
          Send HTTP requests from our servers (no CORS). Test APIs, webhooks, and endpoints.
        </p>
      </div>

      {/* Presets */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="self-center text-xs font-medium text-muted">Presets:</span>
        {PRESETS.map((p) => (
          <button key={p.label} type="button" onClick={() => applyPreset(p)}
            className="rounded-lg border border-app px-3 py-1.5 text-xs hover:bg-[var(--surface-2)] hover:text-brand-600">
            {p.label}
          </button>
        ))}
      </div>

      {/* URL bar */}
      <div className="surface mb-4 rounded-2xl border border-app p-4">
        <div className="flex gap-3">
          <select value={method} onChange={(e) => setMethod(e.target.value as Method)}
            className={`w-32 shrink-0 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2.5 text-sm font-bold outline-none focus:border-brand-500 ${METHOD_COLORS[method]}`}>
            {(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as Method[]).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="https://api.example.com/endpoint"
            className={INPUT_CLS + " flex-1"} aria-label="Request URL" />
          <button type="button" onClick={send} disabled={loading || !url.trim()}
            className="shrink-0 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {loading ? "Sending…" : "Send"}
          </button>
        </div>

        {/* Headers */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Headers</p>
            <button type="button" onClick={addHeader} className="text-xs text-brand-600 hover:underline">+ Add header</button>
          </div>
          <div className="space-y-2">
            {headers.map((h, i) => (
              <div key={i} className="flex gap-2">
                <input type="checkbox" checked={h.enabled} onChange={(e) => setHeader(i, "enabled", e.target.checked)}
                  className="mt-3 accent-brand-600 shrink-0" aria-label="Enable header" />
                <input type="text" value={h.key} onChange={(e) => setHeader(i, "key", e.target.value)}
                  placeholder="Header name" className="flex-1 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-brand-500" />
                <input type="text" value={h.value} onChange={(e) => setHeader(i, "value", e.target.value)}
                  placeholder="Value" className="flex-1 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-brand-500" />
                <button type="button" onClick={() => removeHeader(i)} className="shrink-0 rounded-lg px-2 text-muted hover:text-red-600" aria-label="Remove header">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        {!["GET", "HEAD"].includes(method) && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium">Request body</p>
            <textarea value={body} onChange={(e) => setBody(e.target.value)}
              rows={5} placeholder='{"key": "value"}' spellCheck={false}
              className={"resize-y font-mono text-xs " + INPUT_CLS} />
          </div>
        )}

        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={followRedirects} onChange={(e) => setFollowRedirects(e.target.checked)} className="accent-brand-600" />
          Follow redirects
        </label>
      </div>

      {/* Result */}
      {result && (
        <div className="surface rounded-2xl border border-app">
          <div className="flex flex-wrap items-center gap-3 border-b border-app px-5 py-3">
            {result.status > 0 ? (
              <>
                <StatusChip status={result.status} />
                <span className="text-sm text-muted">{result.statusText}</span>
                <span className="text-xs text-muted">{result.elapsed}ms</span>
                {result.redirected && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">Redirected</span>}
                {result.truncated && <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Response truncated at 1 MB</span>}
              </>
            ) : (
              <span className="text-sm text-red-600 font-medium">{result.error}</span>
            )}
            <div className="ml-auto flex gap-1">
              {(["response", "headers", "raw"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setActiveTab(t)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${activeTab === t ? "bg-brand-600 text-white" : "hover:bg-[var(--surface-2)]"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {activeTab === "response" && (
              <pre className="max-h-[500px] overflow-auto rounded-xl bg-[var(--surface-2)] p-4 text-xs font-mono whitespace-pre-wrap break-all">
                {bodyHasJson ? tryFormatJson(result.body) : result.body || "(empty)"}
              </pre>
            )}
            {activeTab === "headers" && (
              <dl className="space-y-2">
                {Object.entries(result.headers).map(([k, v]) => (
                  <div key={k} className="flex gap-3 text-sm">
                    <dt className="w-48 shrink-0 font-mono text-xs font-medium text-muted truncate">{k}</dt>
                    <dd className="break-all font-mono text-xs">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {activeTab === "raw" && (
              <pre className="max-h-[500px] overflow-auto rounded-xl bg-[var(--surface-2)] p-4 text-xs font-mono whitespace-pre-wrap break-all">
                {`HTTP/1.1 ${result.status} ${result.statusText}\n`}
                {Object.entries(result.headers).map(([k, v]) => `${k}: ${v}`).join("\n")}
                {"\n\n"}
                {result.body}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
