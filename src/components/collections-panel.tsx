"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const STORE_KEY = "df-collections";

interface Collection {
  id:    string;
  name:  string;
  tools: string[]; // slugs
  ts:    number;
}

function load(): Collection[] {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]"); } catch { return []; }
}

function save(cols: Collection[]) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(cols)); } catch { /* noop */ }
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// Encode collections as a shareable URL hash
function encodeShare(col: Collection): string {
  const params = new URLSearchParams({ name: col.name, tools: col.tools.join(",") });
  return `${window.location.origin}/?collection=${encodeURIComponent(params.toString())}`;
}

export function CollectionsPanel() {
  const [open,  setOpen]  = useState(false);
  const [cols,  setCols]  = useState<Collection[]>([]);
  const [newName, setNewName] = useState("");
  const [newTools, setNewTools] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setCols(load()); }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const m = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", h);
    document.addEventListener("mousedown", m);
    return () => { document.removeEventListener("keydown", h); document.removeEventListener("mousedown", m); };
  }, [open]);

  function addCollection() {
    const name  = newName.trim();
    const tools = newTools.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
    if (!name || !tools.length) return;
    const next = [{ id: uid(), name, tools, ts: Date.now() }, ...cols];
    save(next); setCols(next);
    setNewName(""); setNewTools(""); setAddMode(false);
  }

  function removeCollection(id: string) {
    const next = cols.filter((c) => c.id !== id);
    save(next); setCols(next);
  }

  async function share(col: Collection) {
    const url = encodeShare(col);
    await navigator.clipboard.writeText(url);
    setCopied(col.id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Tool collections"
        aria-expanded={open === true}
        title="My collections"
        className="surface inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium shadow-sm hover:bg-[var(--surface-2)]"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <path d="M1.5 2.5A1.5 1.5 0 0 1 3 1h10a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 13 7H3a1.5 1.5 0 0 1-1.5-1.5v-3zM3 2a.5.5 0 0 0-.5.5v3A.5.5 0 0 0 3 6h10a.5.5 0 0 0 .5-.5v-3A.5.5 0 0 0 13 2H3zM1.5 9.5A1.5 1.5 0 0 1 3 8h10a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 13 14H3a1.5 1.5 0 0 1-1.5-1.5v-3zM3 9a.5.5 0 0 0-.5.5v3A.5.5 0 0 0 3 13h10a.5.5 0 0 0 .5-.5v-3A.5.5 0 0 0 13 9H3z"/>
        </svg>
        <span className="hidden sm:inline">Collections</span>
        {cols.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
            {cols.length}
          </span>
        )}
      </button>

      {open && (
        <div className="surface absolute right-0 top-full z-50 mt-2 w-[min(380px,calc(100vw-24px))] rounded-2xl border shadow-2xl">
          <div className="flex items-center justify-between border-b border-app px-4 py-3">
            <h2 className="text-sm font-semibold">My Collections</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-muted hover:text-[var(--text)]">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M2 2l12 12M14 2L2 14" />
              </svg>
            </button>
          </div>

          <div className="max-h-[60vh] overflow-auto p-3">
            {cols.length === 0 && !addMode && (
              <p className="py-4 text-center text-sm text-muted">No collections yet. Save a set of tools to access them quickly.</p>
            )}

            {cols.map((col) => (
              <div key={col.id} className="surface-2 mb-2 rounded-xl border border-app p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{col.name}</p>
                    <p className="mt-0.5 text-xs text-muted">{col.tools.length} tools</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => share(col)}
                      title="Copy shareable link"
                      className="rounded p-1 text-xs text-muted hover:text-brand-600"
                      aria-label={`Share collection ${col.name}`}
                    >
                      {copied === col.id ? "✓" : "🔗"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCollection(col.id)}
                      title="Delete collection"
                      className="rounded p-1 text-xs text-muted hover:text-red-500"
                      aria-label={`Delete collection ${col.name}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {col.tools.map((slug) => (
                    <Link
                      key={slug}
                      href={`/tools/${slug}`}
                      onClick={() => setOpen(false)}
                      className="rounded-full border border-app bg-[var(--surface)] px-2 py-0.5 text-[11px] font-medium hover:border-brand-400 hover:text-brand-600"
                    >
                      {slug}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {addMode ? (
              <div className="surface-2 rounded-xl border border-brand-400/40 p-3">
                <p className="mb-2 text-xs font-semibold text-muted uppercase tracking-wide">New collection</p>
                <input
                  type="text"
                  placeholder="Collection name (e.g. My testing kit)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="surface mb-2 w-full rounded-lg border border-app px-3 py-2 text-sm outline-none focus:border-brand-400"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Tool slugs, comma-separated (e.g. password, uuid, json-mock)"
                  value={newTools}
                  onChange={(e) => setNewTools(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addCollection(); }}
                  className="surface mb-3 w-full rounded-lg border border-app px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addCollection}
                    disabled={!newName.trim() || !newTools.trim()}
                    className="flex-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAddMode(false); setNewName(""); setNewTools(""); }}
                    className="surface flex-1 rounded-lg border border-app px-3 py-1.5 text-sm hover:bg-[var(--surface-2)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddMode(true)}
                className="mt-1 w-full rounded-xl border border-dashed border-app py-2.5 text-sm text-muted hover:border-brand-400 hover:text-brand-600"
              >
                + New collection
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
