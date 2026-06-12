"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: {
  href: string;
  label: string;
  show: "md" | "lg" | "xl";
  exact?: boolean;
}[] = [
  { href: "/",                label: "All tools",      show: "md",  exact: true },
  { href: "/crypto",          label: "₿ Crypto",       show: "md" },
  { href: "/dev-tools",       label: "🛠 Dev Tools",    show: "md" },
  { href: "/ocr",             label: "🔍 OCR",          show: "md" },
  { href: "/file-converter",  label: "🔄 Convert",      show: "md" },
  { href: "/workbook",        label: "⊞ Workbook",      show: "md" },
  { href: "/image-tools",     label: "🖼️ Image",        show: "lg" },
  { href: "/pdf-tools",       label: "📄 PDF",          show: "lg" },
  { href: "/handwriting",     label: "✍️ Handwriting",  show: "lg" },
  { href: "/code-formatter",  label: "{ } Formatter",  show: "lg" },
  { href: "/formula-manager", label: "ƒ Formulas",      show: "lg" },
  { href: "/typing",          label: "⌨ Typing",        show: "lg" },
  { href: "/compare",         label: "⇄ Compare",       show: "xl" },
  { href: "/shortcuts",       label: "⚡ Shortcuts",     show: "xl" },
  { href: "/regex",           label: "⋅* Regex",        show: "xl" },
  { href: "/jwt",             label: "🔑 JWT",           show: "xl" },
  { href: "/diff",            label: "⇄ Diff",           show: "xl" },
  { href: "/base-converter",  label: "01 Base",          show: "xl" },
  { href: "/color-toolkit",   label: "🎨 Color",         show: "xl" },
  { href: "/cron-builder",    label: "⏱ Cron",           show: "xl" },
  { href: "/json-path",       label: "$ JSONPath",       show: "xl" },
  { href: "/bulk-template",   label: "⚡ Bulk Gen",      show: "xl" },
  { href: "/changelog",       label: "📋 Changelog",     show: "xl" },
  { href: "/api-docs",        label: "{ } API",          show: "xl" },
  { href: "/sitemap-page",    label: "🗺 Site Map",      show: "xl" },
  { href: "/about",           label: "About",            show: "xl" },
];

/* Pinned quick-links always shown in the mobile panel top row */
const PINNED = ["/", "/crypto", "/dev-tools", "/workbook", "/ocr", "/file-converter"];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/") || pathname.startsWith(href + "?");
}

const SHOW_CLASS: Record<"md" | "lg" | "xl", string> = {
  md: "hidden md:inline-flex",
  lg: "hidden lg:inline-flex",
  xl: "hidden xl:inline-flex",
};

export function NavLinks({ mobileControls }: { mobileControls?: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setOpen(false); setQ(""); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setQ(""); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 60);
  }, [open]);

  const filtered = q.trim()
    ? NAV.filter((n) => n.label.toLowerCase().includes(q.toLowerCase()) || n.href.includes(q.toLowerCase()))
    : NAV;

  return (
    <>
      {/* ── Desktop nav (md+) ── */}
      <nav className="hidden items-center md:flex" aria-label="Primary navigation">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`${SHOW_CLASS[item.show]} items-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
                active
                  ? "bg-brand-500/10 text-brand-600"
                  : "text-muted hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Mobile hamburger (< md) ── */}
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        onClick={() => { setOpen((v) => !v); setQ(""); }}
        className="surface-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-app text-muted transition-colors hover:text-[var(--text)] md:hidden"
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
        )}
      </button>

      {/* ── Mobile panel ── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
            aria-hidden="true"
            onClick={() => { setOpen(false); setQ(""); }}
          />

          {/* Slide-down panel */}
          <div
            id="mobile-nav-menu"
            role="dialog"
            aria-label="Navigation menu"
            className="surface fixed inset-x-0 top-[52px] z-40 max-h-[calc(100dvh-52px)] overflow-y-auto border-b border-app shadow-2xl md:hidden sm:top-[57px] sm:max-h-[calc(100dvh-57px)]"
          >
            <div className="mx-auto max-w-6xl px-3 pb-4 pt-3 sm:px-6">

              {/* Search */}
              <div className="mb-3 flex items-center gap-2 rounded-xl surface-2 border border-app px-3 py-2">
                <svg className="h-4 w-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search pages…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none text-[var(--text)] placeholder:text-muted"
                />
                {q && (
                  <button type="button" onClick={() => setQ("")} className="text-muted" aria-label="Clear search">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Pinned quick-access row (hidden when searching) */}
              {!q && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {NAV.filter((n) => PINNED.includes(n.href)).map((item) => {
                    const active = isActive(pathname, item.href, item.exact);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          active
                            ? "border-brand-500/40 bg-brand-500/10 text-brand-600"
                            : "border-app hover:bg-[var(--surface-2)] text-muted hover:text-[var(--text)]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* All nav links grid */}
              <nav aria-label="All pages" className="mb-4">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted px-1">
                  {q ? `Results for "${q}"` : "All pages"}
                </p>
                {filtered.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted">No pages match &ldquo;{q}&rdquo;</p>
                ) : (
                  <div className="grid grid-cols-2 gap-1 xs:grid-cols-3">
                    {filtered.map((item) => {
                      const active = isActive(pathname, item.href, item.exact);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => { setOpen(false); setQ(""); }}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                            active
                              ? "bg-brand-500/10 text-brand-600"
                              : "hover:bg-[var(--surface-2)] text-[var(--text)]"
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </nav>

              {/* Controls section — theme, region, background, dark mode */}
              {mobileControls && (
                <div className="border-t border-app pt-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted px-1">Appearance</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {mobileControls}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
