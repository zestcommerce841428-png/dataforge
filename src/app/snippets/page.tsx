"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Snippet {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

const LANGUAGES = [
  "text", "javascript", "typescript", "python", "bash", "sql", "html", "css",
  "json", "yaml", "markdown", "rust", "go", "java", "php", "ruby", "c", "cpp",
  "csharp", "swift", "kotlin", "r", "graphql", "regex", "dockerfile",
];

const INPUT_CLS = "w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SnippetsPage() {
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Snippet | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", language: "text", tags: "", is_public: false });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ? { id: data.user.id } : null));
  }, [supabase]);

  const load = useCallback(async (q = "") => {
    setLoading(true);
    const res = await fetch(`/api/snippets${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    if (res.ok) setSnippets(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  useEffect(() => {
    const t = setTimeout(() => { if (user) load(search); }, 300);
    return () => clearTimeout(t);
  }, [search, user, load]);

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  }

  function startCreate() {
    setForm({ title: "", content: "", language: "text", tags: "", is_public: false });
    setEditing(null); setCreating(true);
  }

  function startEdit(s: Snippet) {
    setForm({ title: s.title, content: s.content, language: s.language, tags: s.tags.join(", "), is_public: s.is_public });
    setEditing(s); setCreating(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      content: form.content,
      language: form.language,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_public: form.is_public,
    };

    const res = editing
      ? await fetch("/api/snippets", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...payload }) })
      : await fetch("/api/snippets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    const data = await res.json();
    setSaving(false);
    if (!res.ok) { flash("err", data.error); return; }
    flash("ok", editing ? "Snippet updated!" : "Snippet saved!");
    setCreating(false); setEditing(null);
    load(search);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this snippet?")) return;
    const res = await fetch(`/api/snippets?id=${id}`, { method: "DELETE" });
    if (res.ok) { flash("ok", "Deleted."); setSnippets((s) => s.filter((x) => x.id !== id)); }
    else flash("err", "Delete failed.");
  }

  function copySnippet(s: Snippet) {
    navigator.clipboard.writeText(s.content);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mb-4 text-5xl">📋</div>
        <h1 className="mb-2 text-2xl font-bold">Sign in to use Snippets</h1>
        <p className="mb-6 text-muted">Save and manage code snippets across all your devices.</p>
        <a href="/auth/login" className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Sign in</a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight">My Snippets</h1>
          <p className="mt-1 text-sm text-muted">Save and reuse code snippets across sessions</p>
        </div>
        <button type="button" onClick={startCreate}
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          + New snippet
        </button>
      </div>

      {msg && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${msg.type === "ok" ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}>
          {msg.text}
        </div>
      )}

      {/* Create/Edit form */}
      {creating && (
        <div className="surface mb-6 rounded-2xl border border-app p-6">
          <h2 className="mb-4 font-semibold">{editing ? "Edit snippet" : "New snippet"}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Title *</label>
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={INPUT_CLS} placeholder="My useful snippet" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Language</label>
                <select value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                  className={INPUT_CLS + " cursor-pointer"}>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Content *</label>
              <textarea required value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={10} spellCheck={false}
                className={"resize-y font-mono text-xs " + INPUT_CLS}
                placeholder="Paste your code or text here…" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Tags (comma separated)</label>
                <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className={INPUT_CLS} placeholder="react, hooks, typescript" />
              </div>
              <div className="flex items-end pb-2.5">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_public} onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))}
                    className="accent-brand-600" />
                  Make public (shareable link)
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                {saving ? "Saving…" : editing ? "Update" : "Save snippet"}
              </button>
              <button type="button" onClick={() => { setCreating(false); setEditing(null); }}
                className="rounded-xl border border-app px-5 py-2.5 text-sm text-muted hover:bg-[var(--surface-2)]">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search snippets…" className={INPUT_CLS} />
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-sm text-muted">Loading…</div>
      ) : snippets.length === 0 ? (
        <div className="surface rounded-2xl border border-app py-16 text-center">
          <div className="mb-3 text-4xl">{search ? "🔍" : "📋"}</div>
          <p className="font-medium">{search ? "No snippets match your search" : "No snippets yet"}</p>
          {!search && <p className="mt-1 text-sm text-muted">Create your first snippet to get started</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {snippets.map((s) => (
            <div key={s.id} className="surface rounded-2xl border border-app">
              <div className="flex flex-wrap items-start gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold truncate">{s.title}</h3>
                    <span className="rounded-md bg-[var(--surface-2)] px-2 py-0.5 text-xs font-mono">{s.language}</span>
                    {s.is_public && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">public</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">Updated {timeAgo(s.updated_at)}</p>
                  {s.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {s.tags.map((t) => <span key={t} className="rounded-md bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-950/20 dark:text-brand-400">{t}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => copySnippet(s)}
                    className="rounded-lg border border-app px-3 py-1.5 text-xs hover:bg-[var(--surface-2)]">
                    {copiedId === s.id ? "✓ Copied" : "Copy"}
                  </button>
                  <button type="button" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    className="rounded-lg border border-app px-3 py-1.5 text-xs hover:bg-[var(--surface-2)]">
                    {expandedId === s.id ? "Hide" : "View"}
                  </button>
                  <button type="button" onClick={() => startEdit(s)}
                    className="rounded-lg border border-app px-3 py-1.5 text-xs hover:bg-[var(--surface-2)]">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(s.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/10">
                    Delete
                  </button>
                </div>
              </div>
              {expandedId === s.id && (
                <div className="border-t border-app px-5 pb-4 pt-3">
                  <pre className="max-h-96 overflow-auto rounded-xl bg-[var(--surface-2)] p-4 text-xs font-mono whitespace-pre-wrap break-all">
                    {s.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
