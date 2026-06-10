import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, TOOL_META, TOTAL_GENERATORS } from "@/lib/generators";

export const metadata: Metadata = {
  title: "Public API — DataForge",
  description: `DataForge public REST API — generate ${TOTAL_GENERATORS}+ types of test data with a single HTTP request. No auth, no rate limits, free forever.`,
};

const BASE = "https://dataforge-omega.vercel.app";

const EXAMPLES = [
  { title: "Generate 5 UUIDs", curl: `curl "${BASE}/api/generate?tool=uuid&count=5"` },
  { title: "Generate a password (length 24)", curl: `curl "${BASE}/api/generate?tool=password&length=24&count=1"` },
  { title: "Generate 10 random emails", curl: `curl "${BASE}/api/generate?tool=email&count=10"` },
  { title: "List all available tools", curl: `curl "${BASE}/api/generate/tools"` },
];

const JS_EXAMPLE = `const res = await fetch("${BASE}/api/generate?tool=uuid&count=3");
const { tool, results, generated_at } = await res.json();
console.log(results); // ["550e8400-...", "550e8400-...", "550e8400-..."]`;

const PY_EXAMPLE = `import requests

r = requests.get("${BASE}/api/generate", params={
    "tool": "password",
    "count": 5,
    "length": 20,
})
data = r.json()
print(data["results"])`;

const RESPONSE_EXAMPLE = `{
  "tool": "uuid",
  "name": "UUID / GUID",
  "category": "developer",
  "count": 3,
  "results": [
    "550e8400-e29b-41d4-a716-446655440000",
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "6ba7b811-9dad-11d1-80b4-00c04fd430c8"
  ],
  "generated_at": "2026-06-11T12:00:00.000Z"
}`;

export default function ApiDocsPage() {
  const byCategory = CATEGORIES.map((c) => ({
    ...c,
    tools: TOOL_META.filter((t) => t.category === c.id && t.slug !== "qr-code" && t.slug !== "barcode"),
  })).filter((c) => c.tools.length > 0);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-[var(--text)]">
          ← All tools
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">Public API</h1>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">Free · No auth</span>
        </div>
        <p className="mt-3 max-w-2xl text-muted">
          Generate {TOTAL_GENERATORS}+ types of test data with a single HTTP request. No API key, no sign-up, unlimited use.
          All generation happens server-side and results are never stored.
        </p>
      </div>

      {/* Base URL */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold">Base URL</h2>
        <code className="surface block rounded-xl border border-app px-4 py-3 font-mono text-sm">{BASE}</code>
      </section>

      {/* Endpoints */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold">Endpoints</h2>
        <div className="space-y-4">
          <div className="surface rounded-xl border border-app p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-brand-600 px-2 py-0.5 font-mono text-xs font-bold text-white">GET</span>
              <code className="font-mono text-sm">/api/generate</code>
            </div>
            <p className="mt-2 text-sm text-muted">Generate one or more values from any tool.</p>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-app text-left text-xs font-semibold text-muted">
                  <th className="pb-2 pr-4">Parameter</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Required</th>
                  <th className="pb-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {[
                  { name: "tool", type: "string", req: "Yes", desc: "Tool slug (e.g. uuid, password, email)" },
                  { name: "count", type: "number", req: "No", desc: "Number of results (1–100, default 1)" },
                  { name: "...fields", type: "various", req: "No", desc: "Tool-specific field overrides (see tool schema)" },
                ].map((r) => (
                  <tr key={r.name}>
                    <td className="py-2 pr-4 font-mono text-xs">{r.name}</td>
                    <td className="py-2 pr-4 text-xs text-muted">{r.type}</td>
                    <td className="py-2 pr-4 text-xs">{r.req}</td>
                    <td className="py-2 text-xs text-muted">{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="surface rounded-xl border border-app p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-brand-600 px-2 py-0.5 font-mono text-xs font-bold text-white">GET</span>
              <code className="font-mono text-sm">/api/generate/tools</code>
            </div>
            <p className="mt-2 text-sm text-muted">
              Returns the complete list of available tools with their field schemas. Cached for 1 hour.
            </p>
          </div>
        </div>
      </section>

      {/* Response format */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold">Response Format</h2>
        <pre className="surface overflow-x-auto rounded-xl border border-app p-4 font-mono text-xs leading-relaxed text-muted">
          {RESPONSE_EXAMPLE}
        </pre>
      </section>

      {/* Code examples */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold">Examples</h2>
        <div className="space-y-4">
          {EXAMPLES.map((ex) => (
            <div key={ex.title} className="surface rounded-xl border border-app p-4">
              <p className="mb-2 text-sm font-semibold">{ex.title}</p>
              <pre className="surface-2 overflow-x-auto rounded-lg px-3 py-2 font-mono text-xs text-muted">{ex.curl}</pre>
            </div>
          ))}

          <div className="surface rounded-xl border border-app p-4">
            <p className="mb-2 text-sm font-semibold">JavaScript (fetch)</p>
            <pre className="surface-2 overflow-x-auto rounded-lg px-3 py-2 font-mono text-xs leading-relaxed text-muted">{JS_EXAMPLE}</pre>
          </div>

          <div className="surface rounded-xl border border-app p-4">
            <p className="mb-2 text-sm font-semibold">Python (requests)</p>
            <pre className="surface-2 overflow-x-auto rounded-lg px-3 py-2 font-mono text-xs leading-relaxed text-muted">{PY_EXAMPLE}</pre>
          </div>
        </div>
      </section>

      {/* Rate limits */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold">Rate Limits</h2>
        <div className="surface rounded-xl border border-app p-5 text-sm">
          <ul className="space-y-2 text-muted">
            <li>• <strong className="text-[var(--text)]">60 requests per minute</strong> per IP address</li>
            <li>• <strong className="text-[var(--text)]">100 values per request</strong> maximum (count parameter)</li>
            <li>• Rate limit headers returned: <code className="surface-2 rounded px-1 font-mono text-xs">X-RateLimit-Limit</code>, <code className="surface-2 rounded px-1 font-mono text-xs">X-RateLimit-Remaining</code>, <code className="surface-2 rounded px-1 font-mono text-xs">X-RateLimit-Reset</code></li>
            <li>• Exceeding the limit returns <code className="surface-2 rounded px-1 font-mono text-xs">429 Too Many Requests</code></li>
          </ul>
        </div>
      </section>

      {/* Tool list */}
      <section>
        <h2 className="mb-4 text-lg font-bold">Available Tools ({TOTAL_GENERATORS - 2} via API)</h2>
        <p className="mb-4 text-sm text-muted">QR code and barcode generators are excluded (visual output only).</p>
        <div className="space-y-6">
          {byCategory.map((cat) => (
            <div key={cat.id}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600">{cat.name}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.tools.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tools/${t.slug}`}
                    title={t.short}
                    className="surface rounded-lg border border-app px-2.5 py-1 font-mono text-xs text-muted transition hover:border-brand-400 hover:text-brand-600"
                  >
                    {t.slug}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
