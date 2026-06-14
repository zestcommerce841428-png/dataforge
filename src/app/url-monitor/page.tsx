"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Monitor {
  id: string; url: string; name: string;
  last_content_hash: string | null; last_checked_at: string | null;
  alert_email: string; check_interval_hours: number; created_at: string;
}

const INPUT_CLS = "w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

function timeAgo(iso: string | null) {
  if (!iso) return "Never checked";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function UrlMonitorPage() {
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ url: "", name: "", alert_email: "", check_interval_hours: "24" });
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState<string | null>(null);
  const [checkResults, setCheckResults] = useState<Record<string, { changed: boolean; checked_at: string }>>({});
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
        setForm((f) => ({ ...f, alert_email: data.user!.email ?? "" }));
      }
    });
  }, [supabase]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/url-monitor").then((r) => r.json()).then((d) => { setMonitors(d); setLoading(false); });
  }, [user]);

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text }); setTimeout(() => setMsg(null), 5000);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const res = await fetch("/api/url-monitor", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, check_interval_hours: Number(form.check_interval_hours) }),
    });
    const data = await res.json(); setSaving(false);
    if (!res.ok) { flash("err", data.error); return; }
    setMonitors((prev) => [data, ...prev]);
    setCreating(false); setForm({ url: "", name: "", alert_email: user?.email ?? "", check_interval_hours: "24" });
    flash("ok", "Monitor created! Click Check now to take a baseline snapshot.");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this monitor?")) return;
    await fetch(`/api/url-monitor?id=${id}`, { method: "DELETE" });
    setMonitors((prev) => prev.filter((m) => m.id !== id));
    flash("ok", "Monitor deleted.");
  }

  async function handleCheck(id: string) {
    setChecking(id);
    const res = await fetch("/api/url-monitor", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    const data = await res.json();
    setChecking(null);
    if (!res.ok) { flash("err", data.error); return; }
    setCheckResults((prev) => ({ ...prev, [id]: { changed: data.changed, checked_at: data.checked_at } }));
    setMonitors((prev) => prev.map((m) => m.id === id ? { ...m, last_checked_at: data.checked_at } : m));
    flash(data.changed ? "err" : "ok", data.changed ? "Change detected! Alert email sent." : "No change detected.");
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mb-4 text-5xl">🔔</div>
        <h1 className="mb-2 text-2xl font-bold">Sign in to use URL Monitor</h1>
        <p className="mb-6 text-muted">Monitor any web page for content changes and get email alerts.</p>
        <a href="/auth/login" className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Sign in</a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight">URL Change Monitor</h1>
          <p className="mt-1 text-sm text-muted">Get email alerts when a web page's content changes.</p>
        </div>
        <button type="button" onClick={() => setCreating(true)} disabled={creating}
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          + Add URL
        </button>
      </div>

      {msg && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${msg.type === "ok" ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}>
          {msg.text}
        </div>
      )}

      {creating && (
        <div className="surface mb-6 rounded-2xl border border-app p-6">
          <h2 className="mb-4 font-semibold">Add URL monitor</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">URL to monitor *</label>
              <input required type="url" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                className={INPUT_CLS} placeholder="https://example.com/pricing" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Monitor name *</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={INPUT_CLS} placeholder="Competitor pricing page" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Check every</label>
                <select value={form.check_interval_hours} onChange={(e) => setForm((f) => ({ ...f, check_interval_hours: e.target.value }))}
                  className={INPUT_CLS + " cursor-pointer"}>
                  <option value="1">1 hour</option>
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="168">Weekly</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Alert email</label>
                <input type="email" value={form.alert_email} onChange={(e) => setForm((f) => ({ ...f, alert_email: e.target.value }))}
                  className={INPUT_CLS} placeholder={user.email ?? "you@example.com"} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                {saving ? "Adding…" : "Add monitor"}
              </button>
              <button type="button" onClick={() => setCreating(false)}
                className="rounded-xl border border-app px-5 py-2.5 text-sm text-muted hover:bg-[var(--surface-2)]">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="surface mb-4 rounded-2xl border border-app p-4">
        <p className="text-sm text-muted">
          <strong>How it works:</strong> Click <em>Check now</em> to take a baseline snapshot. On subsequent checks, we compare the page content hash. If it changes, you get an email. Automated checks run per your chosen interval (requires a Vercel cron or external scheduler hitting <code className="rounded bg-[var(--surface-2)] px-1 text-xs">PATCH /api/url-monitor</code>).
        </p>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-muted">Loading…</div>
      ) : monitors.length === 0 ? (
        <div className="surface rounded-2xl border border-app py-16 text-center">
          <div className="mb-3 text-4xl">🔔</div>
          <p className="font-medium">No monitors yet</p>
          <p className="mt-1 text-sm text-muted">Add a URL to start monitoring it for changes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {monitors.map((m) => {
            const result = checkResults[m.id];
            return (
              <div key={m.id} className="surface rounded-2xl border border-app p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{m.name}</h3>
                    <a href={m.url} target="_blank" rel="noopener noreferrer"
                      className="mt-0.5 block truncate text-xs text-brand-600 hover:underline">{m.url}</a>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted">
                      <span>Last checked: {timeAgo(m.last_checked_at)}</span>
                      <span>Interval: {m.check_interval_hours}h</span>
                      <span>Alert: {m.alert_email}</span>
                      {!m.last_content_hash && <span className="text-yellow-600">No baseline yet — click Check now</span>}
                    </div>
                    {result && (
                      <p className={`mt-1.5 text-xs font-medium ${result.changed ? "text-red-600" : "text-green-600"}`}>
                        {result.changed ? "⚠️ Change detected — alert sent" : "✓ No change detected"}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => handleCheck(m.id)} disabled={checking === m.id}
                      className="rounded-xl border border-app px-4 py-2 text-xs font-medium hover:bg-[var(--surface-2)] disabled:opacity-60">
                      {checking === m.id ? "Checking…" : "Check now"}
                    </button>
                    <button type="button" onClick={() => handleDelete(m.id)}
                      className="rounded-xl border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/40">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
