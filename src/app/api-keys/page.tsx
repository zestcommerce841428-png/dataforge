"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { appUrl } from "@/lib/site";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
  key?: string; // only present right after creation
}

function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function isExpired(iso: string | null) {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

export default function ApiKeysPage() {
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [expiresDays, setExpiresDays] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [newKeyData, setNewKeyData] = useState<ApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ? { id: data.user.id } : null));
  }, [supabase]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/api-keys").then((r) => r.json()).then((d) => { setKeys(d); setLoading(false); });
  }, [user]);

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text }); setTimeout(() => setMsg(null), 5000);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/api-keys", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, expires_days: expiresDays ? Number(expiresDays) : undefined }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { flash("err", data.error); return; }
    setNewKeyData(data);
    setKeys((prev) => [{ ...data, key: undefined }, ...prev]);
    setCreating(false); setNewName(""); setExpiresDays("");
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    const res = await fetch(`/api/api-keys?id=${id}`, { method: "DELETE" });
    if (res.ok) { setKeys((prev) => prev.filter((k) => k.id !== id)); flash("ok", "Key revoked."); }
    else flash("err", "Failed to revoke key.");
  }

  function copyKey() {
    if (!newKeyData?.key) return;
    navigator.clipboard.writeText(newKeyData.key);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mb-4 text-5xl">🔑</div>
        <h1 className="mb-2 text-2xl font-bold">Sign in to manage API keys</h1>
        <p className="mb-6 text-muted">Generate personal API keys to use DataForge tools programmatically.</p>
        <a href="/auth/login" className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Sign in</a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">API Keys</h1>
        <p className="mt-1 text-sm text-muted">
          Generate personal tokens to use DataForge APIs from scripts and CI pipelines.
        </p>
      </div>

      {msg && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${msg.type === "ok" ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}>
          {msg.text}
        </div>
      )}

      {/* New key revealed */}
      {newKeyData && (
        <div className="mb-6 rounded-2xl border border-green-300 bg-green-50 p-5 dark:border-green-800/40 dark:bg-green-950/20">
          <p className="mb-1 font-semibold text-green-700 dark:text-green-400">Your new API key</p>
          <p className="mb-3 text-sm text-green-600 dark:text-green-500">Copy it now — it will never be shown again.</p>
          <div className="flex gap-2">
            <code className="flex-1 overflow-x-auto rounded-xl bg-white px-4 py-3 font-mono text-sm dark:bg-black/20">
              {newKeyData.key}
            </code>
            <button type="button" onClick={copyKey}
              className="shrink-0 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button type="button" onClick={() => setNewKeyData(null)} className="mt-3 text-xs text-green-700 hover:underline dark:text-green-400">
            I've copied it — dismiss
          </button>
        </div>
      )}

      {/* Usage example */}
      <div className="surface mb-6 rounded-2xl border border-app p-5">
        <p className="mb-2 text-sm font-semibold">Usage</p>
        <pre className="overflow-x-auto rounded-xl bg-[var(--surface-2)] p-4 text-xs font-mono">
{`# URL shortener example
curl -X POST ${appUrl("/api/shorten")} \\
  -H "X-API-Key: df_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com"}'`}
        </pre>
        <p className="mt-2 text-xs text-muted">Pass your key as the <code className="rounded bg-[var(--surface-2)] px-1">X-API-Key</code> header on any DataForge API route.</p>
      </div>

      {/* Create form */}
      {creating ? (
        <div className="surface mb-6 rounded-2xl border border-app p-5">
          <h2 className="mb-4 font-semibold">Create new key</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Key name *</label>
              <input required value={newName} onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                placeholder="My CI pipeline" maxLength={60} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Expires in (optional)</label>
              <select value={expiresDays} onChange={(e) => setExpiresDays(e.target.value)}
                className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 cursor-pointer">
                <option value="">Never</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                {saving ? "Creating…" : "Create key"}
              </button>
              <button type="button" onClick={() => setCreating(false)}
                className="rounded-xl border border-app px-5 py-2.5 text-sm text-muted hover:bg-[var(--surface-2)]">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button type="button" onClick={() => setCreating(true)} disabled={keys.length >= 10}
          className="mb-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          + Generate new API key
        </button>
      )}

      {keys.length >= 10 && <p className="mb-4 text-xs text-muted">Maximum 10 keys per account reached.</p>}

      {/* Keys list */}
      {loading ? (
        <div className="py-8 text-center text-sm text-muted">Loading…</div>
      ) : keys.length === 0 ? (
        <div className="surface rounded-2xl border border-app py-16 text-center">
          <div className="mb-3 text-4xl">🔑</div>
          <p className="font-medium">No API keys yet</p>
          <p className="mt-1 text-sm text-muted">Create your first key to use DataForge APIs programmatically</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((k) => {
            const expired = isExpired(k.expires_at);
            return (
              <div key={k.id} className={`surface rounded-2xl border p-5 ${expired ? "border-red-200 dark:border-red-900/40 opacity-70" : "border-app"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{k.name}</span>
                      {expired && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-400">Expired</span>}
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-muted">{k.key_prefix}</p>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted">
                      <span>Created {timeAgo(k.created_at)}</span>
                      <span>Last used: {timeAgo(k.last_used_at)}</span>
                      {k.expires_at && <span>Expires: {new Date(k.expires_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <button type="button" onClick={() => handleRevoke(k.id)}
                    className="rounded-xl border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/10">
                    Revoke
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
