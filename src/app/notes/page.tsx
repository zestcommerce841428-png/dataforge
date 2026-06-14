"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { marked } from "marked";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

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

marked.setOptions({ breaks: true });

export default function NotesPage() {
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ? { id: data.user.id } : null));
  }, [supabase]);

  const load = useCallback(async (q = "") => {
    setLoading(true);
    const res = await fetch(`/api/notes${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    if (res.ok) setNotes(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);
  useEffect(() => {
    const t = setTimeout(() => { if (user) load(search); }, 300);
    return () => clearTimeout(t);
  }, [search, user, load]);

  function openNote(n: Note) {
    setActiveNote(n); setEditTitle(n.title); setEditContent(n.content);
    setEditTags(n.tags.join(", ")); setDirty(false); setPreview(false);
  }

  async function createNote() {
    const res = await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "Untitled" }) });
    if (res.ok) {
      const n = await res.json();
      setNotes((prev) => [n, ...prev]);
      openNote(n);
    }
  }

  async function save(n: Note, title: string, content: string, tags: string) {
    setSaving(true);
    const res = await fetch("/api/notes", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: n.id, title: title.trim() || "Untitled", content, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) }),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      setNotes((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      setActiveNote(updated); setDirty(false);
      setMsg("Saved"); setTimeout(() => setMsg(null), 2000);
    }
  }

  function onContentChange(v: string) {
    setEditContent(v); setDirty(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (activeNote) save(activeNote, editTitle, v, editTags);
    }, 2000);
  }

  function onTitleChange(v: string) {
    setEditTitle(v); setDirty(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (activeNote) save(activeNote, v, editContent, editTags);
    }, 1500);
  }

  async function togglePin(n: Note) {
    const res = await fetch("/api/notes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: n.id, pinned: !n.pinned }) });
    if (res.ok) {
      const updated = await res.json();
      setNotes((prev) => prev.map((x) => x.id === updated.id ? updated : x).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)));
      if (activeNote?.id === n.id) setActiveNote(updated);
    }
  }

  async function deleteNote(n: Note) {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes?id=${n.id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((x) => x.id !== n.id));
    if (activeNote?.id === n.id) { setActiveNote(null); setDirty(false); }
  }

  function downloadMd() {
    if (!activeNote) return;
    const blob = new Blob([editContent], { type: "text/markdown" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${editTitle || "note"}.md`; a.click();
  }

  function downloadHtml() {
    if (!activeNote) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${editTitle}</title><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6}pre{background:#f4f4f5;padding:12px;border-radius:8px;overflow:auto}code{background:#f4f4f5;padding:2px 4px;border-radius:4px}</style></head><body>${marked.parse(editContent)}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${editTitle || "note"}.html`; a.click();
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mb-4 text-5xl">📝</div>
        <h1 className="mb-2 text-2xl font-bold">Sign in to use Notes</h1>
        <p className="mb-6 text-muted">Write and save markdown notes synced to your account.</p>
        <a href="/auth/login" className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Sign in</a>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden">
      {/* Sidebar */}
      <div className="flex w-72 shrink-0 flex-col border-r border-app surface">
        <div className="flex items-center gap-2 border-b border-app p-3">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes…" className="flex-1 rounded-lg border border-app bg-[var(--surface-2)] px-3 py-1.5 text-sm outline-none focus:border-brand-500" />
          <button type="button" onClick={createNote}
            className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700" title="New note">
            +
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-xs text-muted">Loading…</div>
          ) : notes.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted">
              {search ? "No results" : "No notes yet — click + to create one"}
            </div>
          ) : (
            notes.map((n) => (
              <button key={n.id} type="button" onClick={() => openNote(n)}
                className={`w-full border-b border-app px-4 py-3 text-left transition-colors hover:bg-[var(--surface-2)] ${activeNote?.id === n.id ? "bg-brand-50 dark:bg-brand-950/20" : ""}`}>
                <div className="flex items-center gap-1.5">
                  {n.pinned && <span className="text-xs" title="Pinned">📌</span>}
                  <span className="truncate text-sm font-medium">{n.title || "Untitled"}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted">{n.content.slice(0, 60) || "Empty"}</p>
                <p className="mt-0.5 text-[10px] text-muted">{timeAgo(n.updated_at)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      {activeNote ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-app px-4 py-2">
            <input value={editTitle} onChange={(e) => onTitleChange(e.target.value)}
              className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-base font-bold outline-none hover:border-app focus:border-brand-500 focus:bg-[var(--surface-2)]"
              placeholder="Note title" />
            <div className="flex shrink-0 items-center gap-2">
              {msg && <span className="text-xs text-green-600">{msg}</span>}
              {saving && <span className="text-xs text-muted">Saving…</span>}
              {dirty && !saving && <span className="text-xs text-muted">Unsaved</span>}
              <button type="button" onClick={() => setPreview((v) => !v)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${preview ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/20" : "border-app hover:bg-[var(--surface-2)]"}`}>
                {preview ? "Edit" : "Preview"}
              </button>
              <button type="button" onClick={() => activeNote && save(activeNote, editTitle, editContent, editTags)} disabled={saving || !dirty}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                Save
              </button>
              <button type="button" onClick={() => togglePin(activeNote)} title={activeNote.pinned ? "Unpin" : "Pin"}
                className="rounded-lg border border-app px-2.5 py-1.5 text-sm hover:bg-[var(--surface-2)]">
                {activeNote.pinned ? "📌" : "📍"}
              </button>
              <button type="button" onClick={downloadMd} className="rounded-lg border border-app px-2.5 py-1.5 text-xs hover:bg-[var(--surface-2)]">↓ MD</button>
              <button type="button" onClick={downloadHtml} className="rounded-lg border border-app px-2.5 py-1.5 text-xs hover:bg-[var(--surface-2)]">↓ HTML</button>
              <button type="button" onClick={() => deleteNote(activeNote)}
                className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900/40">
                Delete
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="border-b border-app px-4 py-2">
            <input value={editTags} onChange={(e) => { setEditTags(e.target.value); setDirty(true); }}
              onBlur={() => activeNote && save(activeNote, editTitle, editContent, editTags)}
              placeholder="Tags: react, typescript, ideas…"
              className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs text-muted outline-none hover:border-app focus:border-brand-500 focus:bg-[var(--surface-2)]" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {preview ? (
              <div
                className="prose prose-sm dark:prose-invert mx-auto max-w-3xl px-6 py-6"
                dangerouslySetInnerHTML={{ __html: marked.parse(editContent) as string }}
              />
            ) : (
              <textarea value={editContent} onChange={(e) => onContentChange(e.target.value)}
                spellCheck={false}
                className="h-full w-full resize-none bg-transparent px-6 py-6 font-mono text-sm outline-none"
                placeholder="Start writing in Markdown…&#10;&#10;# Heading&#10;**bold** _italic_ `code`&#10;- List item&#10;```&#10;code block&#10;```" />
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-center">
          <div>
            <div className="mb-3 text-5xl">📝</div>
            <p className="font-medium">Select a note or create a new one</p>
            <button type="button" onClick={createNote}
              className="mt-4 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              + New note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
