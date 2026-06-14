"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface ToolEntry { href: string; label: string; count: number; lastUsed: number; }

// Mirrors the history panel's localStorage key convention
function loadHistory(): ToolEntry[] {
  try {
    const raw = localStorage.getItem("df_tool_history");
    if (!raw) return [];
    const parsed: { href: string; label: string; ts: number }[] = JSON.parse(raw);
    const map = new Map<string, ToolEntry>();
    parsed.forEach((e) => {
      if (map.has(e.href)) {
        const ex = map.get(e.href)!;
        ex.count++;
        if (e.ts > ex.lastUsed) ex.lastUsed = e.ts;
      } else {
        map.set(e.href, { href: e.href, label: e.label, count: 1, lastUsed: e.ts });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  } catch { return []; }
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const QUICK_LINKS = [
  { href: "/snippets", icon: "📋", label: "Snippets" },
  { href: "/notes", icon: "📝", label: "Notes" },
  { href: "/api-keys", icon: "🔑", label: "API Keys" },
  { href: "/webhook-inspector", icon: "🪝", label: "Webhooks" },
  { href: "/cron-monitor", icon: "⏱️", label: "Cron Monitor" },
  { href: "/profile", icon: "👤", label: "Profile" },
];

export default function DashboardPage() {
  const supabase = createClient();
  const [user, setUser] = useState<{ email?: string; user_metadata?: Record<string, unknown> } | null>(null);
  const [toolHistory, setToolHistory] = useState<ToolEntry[]>([]);
  const [totalUses, setTotalUses] = useState(0);
  const [snippetCount, setSnippetCount] = useState<number | null>(null);
  const [noteCount, setNoteCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const raw = localStorage.getItem("df_tool_history");
    const all: { href: string; label: string; ts: number }[] = raw ? JSON.parse(raw) : [];
    setTotalUses(all.length);
    setToolHistory(loadHistory());
  }, [supabase]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/snippets").then((r) => r.ok ? r.json() : []).then((d) => setSnippetCount(d.length));
    fetch("/api/notes").then((r) => r.ok ? r.json() : []).then((d) => setNoteCount(d.length));
  }, [user]);

  const topTools = toolHistory.slice(0, 10);
  const recentTools = [...toolHistory].sort((a, b) => b.lastUsed - a.lastUsed).slice(0, 5);
  const name = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "there";

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mb-4 text-5xl">📊</div>
        <h1 className="mb-2 text-2xl font-bold">Sign in to see your dashboard</h1>
        <p className="mb-6 text-muted">Track your tool usage, access your notes, snippets, and more.</p>
        <a href="/auth/login" className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Sign in</a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {name} 👋</h1>
        <p className="mt-1 text-sm text-muted">{user.email}</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Tool uses", value: totalUses, icon: "⚡" },
          { label: "Unique tools", value: toolHistory.length, icon: "🛠️" },
          { label: "Snippets", value: snippetCount ?? "—", icon: "📋" },
          { label: "Notes", value: noteCount ?? "—", icon: "📝" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="surface rounded-2xl border border-app p-5 text-center">
            <div className="mb-1 text-2xl">{icon}</div>
            <div className="text-2xl font-extrabold">{value}</div>
            <div className="text-xs text-muted">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="surface mb-6 rounded-2xl border border-app p-5">
        <h2 className="mb-4 font-semibold">Quick access</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {QUICK_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-app p-3 text-center hover:bg-[var(--surface-2)] hover:border-brand-400 transition-colors">
              <span className="text-2xl">{l.icon}</span>
              <span className="text-xs font-medium">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most used tools */}
        <div className="surface rounded-2xl border border-app p-5">
          <h2 className="mb-4 font-semibold">Most used tools</h2>
          {topTools.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">Start using tools to see your stats here</p>
          ) : (
            <div className="space-y-2">
              {topTools.map((t, i) => {
                const maxCount = topTools[0].count;
                return (
                  <Link key={t.href} href={t.href}
                    className="flex items-center gap-3 rounded-xl p-2 hover:bg-[var(--surface-2)] transition-colors">
                    <span className="w-5 shrink-0 text-center text-xs font-bold text-muted">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.label}</p>
                      <div className="mt-0.5 h-1.5 w-full rounded-full bg-[var(--surface-2)]">
                        <div className="h-1.5 rounded-full bg-brand-500 transition-all" style={{ width: `${(t.count / maxCount) * 100}%` }} />
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-brand-600">{t.count}×</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recently used */}
        <div className="surface rounded-2xl border border-app p-5">
          <h2 className="mb-4 font-semibold">Recently used</h2>
          {recentTools.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">Your recent tool activity will appear here</p>
          ) : (
            <div className="space-y-2">
              {recentTools.map((t) => (
                <Link key={t.href} href={t.href}
                  className="flex items-center justify-between rounded-xl p-2 hover:bg-[var(--surface-2)] transition-colors">
                  <span className="truncate text-sm font-medium">{t.label}</span>
                  <span className="ml-3 shrink-0 text-xs text-muted">{timeAgo(t.lastUsed)}</span>
                </Link>
              ))}
            </div>
          )}
          <Link href="/" className="mt-4 block text-center text-xs text-brand-600 hover:underline">Browse all tools →</Link>
        </div>
      </div>
    </div>
  );
}
