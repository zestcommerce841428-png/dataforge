"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

const BASE_URL = "https://dataforge-omega.vercel.app";

const TOOLS_LIST = [
  { slug: "uuid", label: "UUID Generator", options: "version: 1|4 (default 4)" },
  { slug: "password", label: "Password Generator", options: "length, uppercase, numbers, symbols" },
  { slug: "color", label: "Color Generator", options: "format: hex|rgb|hsl" },
  { slug: "json", label: "JSON Data", options: "fields: string[]" },
  { slug: "base64", label: "Base64 Encode/Decode", options: "input, mode: encode|decode" },
  { slug: "hash", label: "Hash Generator", options: "algorithm: md5|sha1|sha256|sha512, input" },
  { slug: "jwt", label: "JWT Decode", options: "token" },
  { slug: "url", label: "URL Encode/Decode", options: "input, mode: encode|decode" },
  { slug: "timestamp", label: "Unix Timestamp", options: "unit: s|ms" },
  { slug: "cron", label: "Cron Expression", options: "expression" },
  { slug: "regex", label: "Regex Tester", options: "pattern, flags, input" },
  { slug: "lorem", label: "Lorem Ipsum", options: "words, paragraphs" },
  { slug: "name", label: "Random Name", options: "locale" },
  { slug: "email", label: "Fake Email", options: "domain" },
  { slug: "phone", label: "Phone Number", options: "country" },
  { slug: "ip", label: "IP Address", options: "version: 4|6" },
  { slug: "mac", label: "MAC Address", options: "" },
  { slug: "credit-card", label: "Credit Card (Test)", options: "brand" },
  { slug: "iban", label: "IBAN", options: "country" },
  { slug: "sql", label: "SQL Formatter", options: "dialect: mysql|postgres|sqlite" },
];

const QUICK_EXAMPLES = [
  { label: "UUID v4", body: { tool: "uuid", count: 5 } },
  { label: "Password", body: { tool: "password", count: 3, options: { length: 16, symbols: true } } },
  { label: "Color (HEX)", body: { tool: "color", count: 8, options: { format: "hex" } } },
  { label: "Lorem", body: { tool: "lorem", count: 2, options: { paragraphs: 1 } } },
];

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="group relative rounded-xl bg-[var(--surface-2)] text-sm">
      <button type="button" onClick={copy}
        className="absolute right-3 top-3 rounded-lg border border-app px-2 py-0.5 text-xs text-muted opacity-0 transition group-hover:opacity-100 hover:text-[var(--text)]">
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function ApiDocsPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<"reference" | "try" | "keys">("reference");
  const [tryBody, setTryBody] = useState(JSON.stringify({ tool: "uuid", count: 5 }, null, 2));
  const [tryResult, setTryResult] = useState("");
  const [tryLoading, setTryLoading] = useState(false);
  const [tryError, setTryError] = useState("");
  const [tryStatus, setTryStatus] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (user) setApiKey(`df_${btoa(user.id).replace(/[^a-z0-9]/gi, "").slice(0, 32)}`);
  }, [user]);

  const runTry = useCallback(async () => {
    setTryLoading(true);
    setTryError("");
    setTryResult("");
    setTryStatus(null);
    try {
      let body: unknown;
      try { body = JSON.parse(tryBody); } catch { setTryError("Invalid JSON body."); setTryLoading(false); return; }
      const res = await fetch(`${BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setTryStatus(res.status);
      const data = await res.json();
      setTryResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setTryError((e as Error).message);
    } finally {
      setTryLoading(false);
    }
  }, [tryBody]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            API v1 · Live
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">DataForge REST API</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Programmatic access to all DataForge generators — UUID, password, color, JSON, hash, and 15+ more.
            Integrate directly into your apps, CI pipelines, and test suites.
          </p>
        </div>
        <code className="rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2 font-mono text-xs text-muted whitespace-nowrap">
          {BASE_URL}
        </code>
      </div>

      {/* Tab nav */}
      <div className="mb-6 flex rounded-xl border border-app bg-[var(--surface-2)] p-1 w-fit gap-1">
        {(["reference", "try", "keys"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${tab === t ? "surface shadow text-[var(--text)]" : "text-muted hover:text-[var(--text)]"}`}>
            {t === "reference" ? "Reference" : t === "try" ? "Try it out" : "API Keys"}
          </button>
        ))}
      </div>

      {/* ── Reference ── */}
      {tab === "reference" && (
        <div className="space-y-6">
          {/* POST /api/generate */}
          <section className="surface rounded-2xl border border-app p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">POST</span>
              <code className="rounded-lg bg-[var(--surface-2)] px-3 py-1 font-mono text-sm">/api/generate</code>
              <span className="text-sm font-medium text-muted">Generate test / fake data</span>
            </div>
            <p className="mb-5 text-sm text-muted">
              Returns an array of generated values for the requested tool. All parameters are sent as JSON in the request body.
            </p>
            <div className="mb-5 overflow-hidden rounded-xl border border-app">
              <table className="w-full text-sm">
                <thead className="bg-[var(--surface-2)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wide">Parameter</th>
                    <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wide">Type</th>
                    <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wide">Required</th>
                    <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wide">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "tool", type: "string", req: true, desc: "Tool slug — see available tools below" },
                    { name: "count", type: "number", req: false, desc: "Values to generate (1–100, default: 10)" },
                    { name: "options", type: "object", req: false, desc: "Tool-specific options (see examples)" },
                  ].map((p) => (
                    <tr key={p.name} className="border-t border-app">
                      <td className="px-4 py-2 font-mono text-xs text-brand-600">{p.name}</td>
                      <td className="px-4 py-2 font-mono text-xs text-muted">{p.type}</td>
                      <td className="px-4 py-2 text-xs">{p.req ? <span className="font-semibold text-red-500">yes</span> : <span className="text-muted">no</span>}</td>
                      <td className="px-4 py-2 text-xs text-muted">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {QUICK_EXAMPLES.map((ex) => (
                <div key={ex.label}>
                  <p className="mb-1 text-xs font-semibold text-muted">{ex.label}</p>
                  <CodeBlock code={JSON.stringify(ex.body, null, 2)} />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="mb-1 text-xs font-semibold text-muted">Response</p>
              <CodeBlock code={`{
  "ok": true,
  "tool": "uuid",
  "count": 5,
  "values": [
    "550e8400-e29b-41d4-a716-446655440000",
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "11223344-5566-7788-99aa-bbccddeeff00"
  ]
}`} />
            </div>
          </section>

          {/* GET /api/generate/tools */}
          <section className="surface rounded-2xl border border-app p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-green-500 px-2 py-0.5 text-xs font-bold text-white">GET</span>
              <code className="rounded-lg bg-[var(--surface-2)] px-3 py-1 font-mono text-sm">/api/generate/tools</code>
              <span className="text-sm font-medium text-muted">List available tools</span>
            </div>
            <p className="text-sm text-muted">
              Returns an array of all supported tool slugs with their display names and option schemas.
            </p>
          </section>

          {/* Code examples */}
          <section className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-4 text-lg font-bold">Code examples</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-muted">cURL</p>
                <CodeBlock lang="bash" code={`curl -X POST ${BASE_URL}/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{"tool":"uuid","count":5}'`} />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-muted">JavaScript (fetch)</p>
                <CodeBlock lang="js" code={`const res = await fetch("${BASE_URL}/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ tool: "uuid", count: 5 }),
});
const { values } = await res.json();
console.log(values); // ["550e8400-...", ...]`} />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-muted">Python</p>
                <CodeBlock lang="python" code={`import requests

r = requests.post("${BASE_URL}/api/generate", json={
    "tool": "password",
    "count": 5,
    "options": {"length": 20, "symbols": True}
})
print(r.json()["values"])`} />
              </div>
            </div>
          </section>

          {/* Available tools */}
          <section className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-4 text-lg font-bold">Available tools <span className="ml-1 text-base font-normal text-muted">({TOOLS_LIST.length})</span></h2>
            <div className="overflow-x-auto rounded-xl border border-app">
              <table className="w-full text-sm">
                <thead className="bg-[var(--surface-2)]">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">Slug</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">Tool</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {TOOLS_LIST.map((t) => (
                    <tr key={t.slug} className="border-t border-app hover:bg-[var(--surface-2)]">
                      <td className="px-4 py-2 font-mono text-xs text-brand-600">{t.slug}</td>
                      <td className="px-4 py-2 text-xs">{t.label}</td>
                      <td className="px-4 py-2 text-xs text-muted">{t.options || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Rate limits */}
          <section className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-4 text-lg font-bold">Rate limits</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { v: "60", l: "Requests / minute", s: "per authenticated user" },
                { v: "100", l: "Max values / call", s: "count parameter" },
                { v: "1 MB", l: "Max payload", s: "request body" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-app bg-[var(--surface-2)] p-4">
                  <p className="text-2xl font-bold text-brand-600">{s.v}</p>
                  <p className="text-sm font-medium">{s.l}</p>
                  <p className="text-xs text-muted">{s.s}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted">
              Exceeding limits returns <code className="rounded bg-[var(--surface-2)] px-1">429 Too Many Requests</code> with a <code className="rounded bg-[var(--surface-2)] px-1">Retry-After</code> header.
            </p>
          </section>
        </div>
      )}

      {/* ── Try it out ── */}
      {tab === "try" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-4 text-lg font-bold">Request</h2>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">POST</span>
              <code className="font-mono text-xs text-muted">/api/generate</code>
            </div>
            <div className="mb-3">
              <p className="mb-2 text-xs font-medium text-muted">Quick examples</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_EXAMPLES.map((ex) => (
                  <button key={ex.label} type="button"
                    onClick={() => setTryBody(JSON.stringify(ex.body, null, 2))}
                    className="rounded-lg border border-app px-2.5 py-1 text-xs hover:border-brand-500 hover:text-brand-600 transition-colors">
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
            <label htmlFor="try-body" className="mb-1.5 block text-xs font-medium text-muted">Body (JSON)</label>
            <textarea id="try-body" value={tryBody} onChange={(e) => setTryBody(e.target.value)}
              className="h-44 w-full resize-y rounded-xl border border-app bg-[var(--surface-2)] p-4 font-mono text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
            <button type="button" onClick={runTry} disabled={tryLoading}
              className="mt-3 w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {tryLoading ? "Sending…" : "Send Request"}
            </button>
          </div>

          <div className="surface rounded-2xl border border-app p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Response</h2>
              {tryStatus && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tryStatus < 300 ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}>
                  {tryStatus}
                </span>
              )}
            </div>
            {tryError && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
                {tryError}
              </div>
            )}
            {tryResult ? (
              <CodeBlock code={tryResult} />
            ) : (
              <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-app text-sm text-muted">
                Response will appear here
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── API Keys ── */}
      {tab === "keys" && (
        <div className="surface max-w-2xl rounded-2xl border border-app p-6">
          <h2 className="mb-1 text-lg font-bold">Your API Key</h2>
          <p className="mb-6 text-sm text-muted">
            Pass this in the <code className="rounded bg-[var(--surface-2)] px-1">X-API-Key</code> header for authenticated requests. Treat it like a password.
          </p>
          {user ? (
            <>
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium">API Key</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 overflow-hidden rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 font-mono text-sm break-all">
                    {apiKey}
                  </code>
                  <button type="button" onClick={() => navigator.clipboard.writeText(apiKey)}
                    className="shrink-0 rounded-xl border border-app px-3 py-2.5 text-sm hover:bg-[var(--surface-2)]">
                    Copy
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400">
                This key is derived from your account — do not share it publicly.
              </div>
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold text-muted">Example with key</p>
                <CodeBlock lang="bash" code={`curl -X POST ${BASE_URL}/api/generate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{"tool":"uuid","count":10}'`} />
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-app bg-[var(--surface-2)] p-8 text-center">
              <p className="mb-4 text-sm text-muted">Sign in to get your API key.</p>
              <Link href="/auth/login?redirect=/api-docs"
                className="inline-block rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                Sign in
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
