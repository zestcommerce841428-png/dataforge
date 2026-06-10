"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TOOL_META } from "@/lib/generators";

const RECENT_KEY = "df-recent";

export function RecentTools() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setSlugs(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

  if (slugs.length === 0) return null;

  const tools = slugs
    .map((slug) => TOOL_META.find((t) => t.slug === slug))
    .filter(Boolean) as typeof TOOL_META;

  if (tools.length === 0) return null;

  return (
    <section className="mb-6" aria-label="Recently used tools">
      <h2 className="mb-3 text-sm font-semibold text-muted uppercase tracking-wide">Recently used</h2>
      <div className="flex flex-wrap gap-2">
        {tools.map((t) => (
          <Link
            key={t.slug}
            href={`/tools/${t.slug}`}
            className="surface inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm text-muted transition hover:border-brand-400 hover:text-brand-600"
          >
            <span aria-hidden className="text-xs text-brand-600">↩</span>
            {t.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
