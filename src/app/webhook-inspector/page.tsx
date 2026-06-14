"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { appUrl } from "@/lib/site";

interface Endpoint { id: string; name: string; created_at: string; }
interface WRequest {
  id: string; method: string; headers: Record<string, string>;
  body: string | null; query_params: Record<string, string>;
  ip: string | null; received_at: string;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-100 text-green-700", POST: "bg-blue-100 text-blue-700",
  PUT: "bg-yellow-100 text-yellow-700", PATCH: "bg-orange-100 text-orange-700",
  DELETE: "bg-red-100 text-red-700",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function tryFormat(s: string | null) {
  if (!s) return "";
  try { return JSON.stringify(JSON.parse(s), null, 2); } catch { return s; }
}

export default function WebhookInspectorPage() {
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [activeEp, setActiveEp] = useState<Endpoint | null>(null);
  const [requests, setRequests] = useState<WRequest[]>([]);
  const [activeReq, setActiveReq] = useState<WRequest | null>(null);
  const [reqTab, setReqTab] = useState<"body" | "headers" | "query">("body");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ? { id: data.user.id } : null));
  }, [supabase]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/webhooks").then((r) => r.json()).then((d) => { setEndpoints(d); setLoading(false); });
  }, [user]);

  const loadRequests = useCallback(async (epId: string) => {
    const res = await fetch(`/api/webhook-requests?endpoint_id=${epId}`);
    if (res.ok) setRequests(await res.json());
  }, []);

  useEffect(() => {
    if (!activeEp) return;
    loadRequests(activeEp.id);
    pollRef.current = setInterval(() => loadRequests(activeEp.id), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeEp, loadRequests]);

  async function createEndpoint(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/webhooks", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName || "My Webhook" }),
    });
    if (res.ok) {
      const ep = await res.json();
      setEndpoints((prev) => [ep, ...prev]);
      setCreating(false); setNewName("");
      setActiveEp(ep); setRequests([]); setActiveReq(null);
    }
  }

  async function deleteEndpoint(ep: Endpoint) {
    if (!confirm(`Delete "${ep.name}" and all its requests?`)) return;
    await fetch(`/api/webhooks?id=${ep.id}`, { method: "DELETE" });
    setEndpoints((prev) => prev.filter((x) => x.id !== ep.id));
    if (activeEp?.id === ep.id) { setActiveEp(null); setRequests([]); setActiveReq(null); }
  }

  async function clearRequests() {
    if (!activeEp) return;
    await fetch(`/api/webhook-requests?endpoint_id=${activeEp.id}`, { method: "DELETE" });
    setRequests([]); setActiveReq(null);
  }

  function copyUrl(ep: Endpoint) {
    const url = appUrl(`/api/webhook/${ep.id}`);
    navigator.clipboard.writeText(url);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const webhookUrl = activeEp ? appUrl(`/api/webhook/${activeEp.id}`) : "";

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mb-4 text-5xl">🪝</div>
        <h1 className="mb-2 text-2xl font-bold">Sign in to use Webhook Inspector</h1>
        <p className="mb-6 text-muted">Get unique URLs to capture and inspect incoming webhook requests.</p>
        <a href="/auth/login" className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Sign in</a>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden">
      {/* Left — endpoints list */}
      <div className="flex w-64 shrink-0 flex-col border-r border-app surface">
        <div className="border-b border-app p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">Endpoints</p>
          {creating ? (
            <form onSubmit={createEndpoint} className="flex gap-1.5">
              <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="Name" className="flex-1 rounded-lg border border-app bg-[var(--surface-2)] px-2 py-1.5 text-xs outline-none focus:border-brand-500" />
              <button type="submit" className="rounded-lg bg-brand-600 px-2 py-1.5 text-xs text-white">✓</button>
              <button type="button" onClick={() => setCreating(false)} className="rounded-lg border border-app px-2 py-1.5 text-xs">✕</button>
            </form>
          ) : (
            <button type="button" onClick={() => setCreating(true)} disabled={endpoints.length >= 5}
              className="w-full rounded-lg border border-app py-1.5 text-xs hover:bg-[var(--surface-2)] disabled:opacity-50">
              + New endpoint
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="p-4 text-center text-xs text-muted">Loading…</div> :
            endpoints.length === 0 ? <div className="p-4 text-center text-xs text-muted">No endpoints yet</div> :
            endpoints.map((ep) => (
              <div key={ep.id}
                className={`group flex cursor-pointer items-center gap-2 border-b border-app px-3 py-3 hover:bg-[var(--surface-2)] ${activeEp?.id === ep.id ? "bg-brand-50 dark:bg-brand-950/20" : ""}`}
                onClick={() => { setActiveEp(ep); setActiveReq(null); }}>
                <span className="flex-1 truncate text-sm font-medium">{ep.name}</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); deleteEndpoint(ep); }}
                  className="hidden shrink-0 rounded px-1 text-xs text-red-500 group-hover:block">✕</button>
              </div>
            ))
          }
        </div>
      </div>

      {/* Middle — requests */}
      <div className="flex w-72 shrink-0 flex-col border-r border-app">
        {activeEp ? (
          <>
            <div className="border-b border-app p-3">
              <p className="mb-1 truncate text-sm font-semibold">{activeEp.name}</p>
              <div className="flex gap-1.5">
                <code className="flex-1 overflow-hidden truncate rounded-lg bg-[var(--surface-2)] px-2 py-1.5 text-[10px] font-mono">
                  {webhookUrl}
                </code>
                <button type="button" onClick={() => copyUrl(activeEp)}
                  className="shrink-0 rounded-lg border border-app px-2 py-1.5 text-xs hover:bg-[var(--surface-2)]">
                  {copied ? "✓" : "Copy"}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted">{requests.length} requests (auto-refreshes)</span>
                <button type="button" onClick={clearRequests} className="text-xs text-red-500 hover:underline">Clear</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {requests.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted">
                  <p className="mb-2">Waiting for requests…</p>
                  <p className="text-xs">Send a request to your endpoint URL above</p>
                </div>
              ) : requests.map((r) => (
                <button key={r.id} type="button" onClick={() => { setActiveReq(r); setReqTab("body"); }}
                  className={`w-full border-b border-app px-3 py-3 text-left hover:bg-[var(--surface-2)] ${activeReq?.id === r.id ? "bg-brand-50 dark:bg-brand-950/20" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${METHOD_COLORS[r.method] ?? "bg-gray-100 text-gray-700"}`}>{r.method}</span>
                    <span className="text-xs text-muted">{timeAgo(r.received_at)}</span>
                  </div>
                  {r.ip && <p className="mt-0.5 text-[10px] text-muted">{r.ip}</p>}
                  {r.body && <p className="mt-0.5 truncate text-[10px] text-muted font-mono">{r.body.slice(0, 50)}</p>}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-center p-6">
            <div>
              <div className="mb-2 text-3xl">🪝</div>
              <p className="text-sm text-muted">Select or create an endpoint</p>
            </div>
          </div>
        )}
      </div>

      {/* Right — request detail */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {activeReq ? (
          <>
            <div className="flex items-center gap-3 border-b border-app px-5 py-3">
              <span className={`rounded px-2 py-1 text-xs font-bold ${METHOD_COLORS[activeReq.method] ?? "bg-gray-100"}`}>{activeReq.method}</span>
              <span className="text-sm text-muted">{new Date(activeReq.received_at).toLocaleString()}</span>
              {activeReq.ip && <span className="text-xs text-muted">from {activeReq.ip}</span>}
              <div className="ml-auto flex gap-1">
                {(["body", "headers", "query"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setReqTab(t)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${reqTab === t ? "bg-brand-600 text-white" : "border border-app hover:bg-[var(--surface-2)]"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-auto p-5">
              {reqTab === "body" && (
                <pre className="h-full rounded-xl bg-[var(--surface-2)] p-4 text-xs font-mono whitespace-pre-wrap break-all">
                  {tryFormat(activeReq.body) || "(empty body)"}
                </pre>
              )}
              {reqTab === "headers" && (
                <dl className="space-y-2">
                  {Object.entries(activeReq.headers).map(([k, v]) => (
                    <div key={k} className="flex gap-3 text-sm">
                      <dt className="w-48 shrink-0 font-mono text-xs font-medium text-muted">{k}</dt>
                      <dd className="break-all font-mono text-xs">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {reqTab === "query" && (
                Object.keys(activeReq.query_params).length === 0
                  ? <p className="text-sm text-muted">No query parameters</p>
                  : <dl className="space-y-2">
                    {Object.entries(activeReq.query_params).map(([k, v]) => (
                      <div key={k} className="flex gap-3 text-sm">
                        <dt className="w-40 shrink-0 font-mono text-xs font-medium text-muted">{k}</dt>
                        <dd className="break-all font-mono text-xs">{v}</dd>
                      </div>
                    ))}
                  </dl>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-center p-6">
            <div>
              <div className="mb-2 text-3xl">📨</div>
              <p className="text-sm text-muted">Click a request to inspect it</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
