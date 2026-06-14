"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { appUrl } from "@/lib/site";

interface Monitor {
  id: string; name: string; schedule: string;
  last_ping_at: string | null; last_status: string;
  alert_email: string; grace_minutes: number; created_at: string;
}

const CRON_PRESETS = [
  { label: "Every minute", expr: "* * * * *" },
  { label: "Every 5 min", expr: "*/5 * * * *" },
  { label: "Every 15 min", expr: "*/15 * * * *" },
  { label: "Every hour", expr: "0 * * * *" },
  { label: "Daily at midnight", expr: "0 0 * * *" },
  { label: "Weekly (Mon)", expr: "0 0 * * 1" },
];

const INPUT_CLS = "w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function StatusBadge({ status, lastPing }: { status: string; lastPing: string | null }) {
  if (!lastPing) return <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">Waiting</span>;
  if (status === "fail") return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-950/40 dark:text-red-400">Failed</span>;
  return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700 dark:bg-green-950/40 dark:text-green-400">Healthy</span>;
}

export default function CronMonitorPage() {
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", schedule: "*/5 * * * *", alert_email: "", grace_minutes: "5" });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
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
    fetch("/api/cron-monitors").then((r) => r.json()).then((d) => { setMonitors(d); setLoading(false); });
  }, [user]);

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text }); setTimeout(() => setMsg(null), 4000);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const res = await fetch("/api/cron-monitors", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, grace_minutes: Number(form.grace_minutes) }),
    });
    const data = await res.json(); setSaving(false);
    if (!res.ok) { flash("err", data.error); return; }
    setMonitors((prev) => [data, ...prev]);
    setCreating(false); setForm({ name: "", schedule: "*/5 * * * *", alert_email: user?.email ?? "", grace_minutes: "5" });
    flash("ok", "Monitor created!");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this monitor?")) return;
    await fetch(`/api/cron-monitors?id=${id}`, { method: "DELETE" });
    setMonitors((prev) => prev.filter((m) => m.id !== id));
    flash("ok", "Monitor deleted.");
  }

  function copyPingUrl(m: Monitor) {
    const url = appUrl(`/api/cron-ping/${m.id}`);
    navigator.clipboard.writeText(url);
    setCopied(m.id); setTimeout(() => setCopied(null), 2000);
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mb-4 text-5xl">⏱️</div>
        <h1 className="mb-2 text-2xl font-bold">Sign in to use Cron Monitor</h1>
        <p className="mb-6 text-muted">Monitor your cron jobs and get email alerts when they stop running.</p>
        <a href="/auth/login" className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Sign in</a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Cron Job Monitor</h1>
          <p className="mt-1 text-sm text-muted">Add a ping URL to your cron job. Get email alerts if it stops checking in.</p>
        </div>
        <button type="button" onClick={() => setCreating(true)} disabled={creating}
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          + New monitor
        </button>
      </div>

      {msg && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${msg.type === "ok" ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}>
          {msg.text}
        </div>
      )}

      {/* How it works */}
      <div className="surface mb-6 rounded-2xl border border-app p-5">
        <p className="mb-2 text-sm font-semibold">How it works</p>
        <ol className="space-y-1 text-sm text-muted list-decimal list-inside">
          <li>Create a monitor and copy the ping URL</li>
          <li>Add a <code className="rounded bg-[var(--surface-2)] px-1 text-xs">curl</code> call to the ping URL at the end of your cron job script</li>
          <li>DataForge records the last ping time — if your job stops pinging, we email you</li>
        </ol>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-[var(--surface-2)] p-3 text-xs font-mono">
{`# Add to your crontab (runs every 5 minutes)
*/5 * * * * /path/to/script.sh && curl -s ${appUrl("/api/cron-ping/YOUR_ID")}`}
        </pre>
      </div>

      {/* Create form */}
      {creating && (
        <div className="surface mb-6 rounded-2xl border border-app p-6">
          <h2 className="mb-4 font-semibold">New cron monitor</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Monitor name *</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={INPUT_CLS} placeholder="Database backup" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Expected schedule *</label>
                <input required value={form.schedule} onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
                  className={INPUT_CLS + " font-mono"} placeholder="*/5 * * * *" />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {CRON_PRESETS.map((p) => (
                    <button key={p.expr} type="button" onClick={() => setForm((f) => ({ ...f, schedule: p.expr }))}
                      className={`rounded-md px-2 py-0.5 text-xs border transition-colors ${form.schedule === p.expr ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/20" : "border-app hover:border-brand-400"}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Alert email</label>
                <input type="email" value={form.alert_email} onChange={(e) => setForm((f) => ({ ...f, alert_email: e.target.value }))}
                  className={INPUT_CLS} placeholder={user.email ?? "you@example.com"} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Grace period (minutes)</label>
                <select value={form.grace_minutes} onChange={(e) => setForm((f) => ({ ...f, grace_minutes: e.target.value }))}
                  className={INPUT_CLS + " cursor-pointer"}>
                  {["1", "2", "5", "10", "15", "30", "60"].map((v) => (
                    <option key={v} value={v}>{v} minute{Number(v) !== 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                {saving ? "Creating…" : "Create monitor"}
              </button>
              <button type="button" onClick={() => setCreating(false)}
                className="rounded-xl border border-app px-5 py-2.5 text-sm text-muted hover:bg-[var(--surface-2)]">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Monitors */}
      {loading ? (
        <div className="py-8 text-center text-sm text-muted">Loading…</div>
      ) : monitors.length === 0 ? (
        <div className="surface rounded-2xl border border-app py-16 text-center">
          <div className="mb-3 text-4xl">⏱️</div>
          <p className="font-medium">No monitors yet</p>
          <p className="mt-1 text-sm text-muted">Create your first monitor to start tracking cron jobs</p>
        </div>
      ) : (
        <div className="space-y-4">
          {monitors.map((m) => (
            <div key={m.id} className="surface rounded-2xl border border-app p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{m.name}</h3>
                    <StatusBadge status={m.last_status} lastPing={m.last_ping_at} />
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-muted">{m.schedule}</p>
                  <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted">
                    <span>Last ping: {timeAgo(m.last_ping_at)}</span>
                    <span>Grace: {m.grace_minutes}m</span>
                    <span>Alert: {m.alert_email}</span>
                  </div>
                </div>
                <button type="button" onClick={() => handleDelete(m.id)}
                  className="rounded-xl border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/10">
                  Delete
                </button>
              </div>

              {/* Ping URL */}
              <div className="mt-4 rounded-xl border border-app bg-[var(--surface-2)] p-3">
                <p className="mb-1.5 text-xs font-medium">Ping URL — add to end of your cron script:</p>
                <div className="flex gap-2">
                  <code className="flex-1 overflow-x-auto rounded-lg bg-[var(--surface)] px-3 py-2 text-[11px] font-mono">
                    {appUrl(`/api/cron-ping/${m.id}`)}
                  </code>
                  <button type="button" onClick={() => copyPingUrl(m)}
                    className="shrink-0 rounded-lg border border-app px-3 py-2 text-xs hover:bg-[var(--surface)]">
                    {copied === m.id ? "✓" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
