"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── Primary nav — always visible at md+ ──────────────────────────── */
const PRIMARY_NAV: { href: string; label: string; exact?: boolean }[] = [
  { href: "/",               label: "All Tools",    exact: true },
  { href: "/crypto",         label: "₿ Crypto" },
  { href: "/dev-tools",      label: "🛠 Dev Tools" },
  { href: "/workbook",       label: "⊞ Workbook" },
  { href: "/file-converter", label: "🔄 Convert" },
  { href: "/ocr",            label: "🔍 OCR" },
];

/* ── "More" mega-menu — grouped by category ───────────────────────── */
const MORE_GROUPS: { heading: string; links: { href: string; label: string; icon: string }[] }[] = [
  {
    heading: "Creative Tools",
    links: [
      { href: "/image-tools",     icon: "🖼️", label: "Image Tools" },
      { href: "/pdf-tools",       icon: "📄", label: "PDF Tools" },
      { href: "/handwriting",     icon: "✍️", label: "Handwriting" },
      { href: "/color-toolkit",   icon: "🎨", label: "Color Toolkit" },
    ],
  },
  {
    heading: "Developer",
    links: [
      { href: "/code-formatter",  icon: "{}", label: "Code Formatter" },
      { href: "/json-formatter",  icon: "{ }", label: "JSON Formatter" },
      { href: "/sql-formatter",   icon: "🗄",  label: "SQL Formatter" },
      { href: "/format-converter",icon: "⇄",  label: "Format Converter" },
      { href: "/diff",            icon: "⇄",  label: "Diff Viewer" },
      { href: "/compare",         icon: "⇄",  label: "Compare" },
      { href: "/regex",           icon: "⋅*", label: "Regex Tester" },
      { href: "/jwt",             icon: "🔑", label: "JWT Decoder" },
      { href: "/uuid-generator",  icon: "🔢", label: "UUID Generator" },
      { href: "/url-checker",     icon: "🔗", label: "URL Checker" },
      { href: "/text-escape",     icon: "✎",  label: "Text Escape" },
      { href: "/base-converter",  icon: "01", label: "Base Converter" },
      { href: "/json-path",       icon: "$",  label: "JSONPath" },
    ],
  },
  {
    heading: "Productivity",
    links: [
      { href: "/formula-manager",   icon: "ƒ",  label: "Formula Manager" },
      { href: "/typing",            icon: "⌨",  label: "Typing Test" },
      { href: "/shortcuts",         icon: "⚡", label: "Keyboard Shortcuts" },
      { href: "/cron-builder",      icon: "⏱", label: "Cron Builder" },
      { href: "/bulk-template",     icon: "⚡", label: "Bulk Generator" },
      { href: "/qr-generator",      icon: "⬛", label: "QR Generator" },
      { href: "/resume",            icon: "📄", label: "Resume Generator" },
    ],
  },
  {
    heading: "Developer Tools",
    links: [
      { href: "/http-tester",       icon: "🌐", label: "HTTP Tester" },
      { href: "/ssl-checker",       icon: "🔒", label: "SSL Checker" },
      { href: "/webhook-inspector", icon: "🪝", label: "Webhook Inspector" },
      { href: "/cron-monitor",      icon: "⏱️", label: "Cron Monitor" },
      { href: "/url-monitor",       icon: "🔔", label: "URL Monitor" },
      { href: "/api-keys",          icon: "🔑", label: "API Keys" },
    ],
  },
  {
    heading: "Personal",
    links: [
      { href: "/dashboard",         icon: "📊", label: "Dashboard" },
      { href: "/snippets",          icon: "📋", label: "My Snippets" },
      { href: "/notes",             icon: "📝", label: "My Notes" },
    ],
  },
  {
    heading: "Info & Docs",
    links: [
      { href: "/api-docs",          icon: "{ }", label: "API Docs" },
      { href: "/changelog",         icon: "📋",  label: "Changelog" },
      { href: "/sitemap-page",      icon: "🗺",  label: "Site Map" },
      { href: "/about",             icon: "ℹ️",  label: "About" },
      { href: "/blog",              icon: "📝",  label: "Blog" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/profile",           icon: "👤", label: "My Profile" },
      { href: "/auth/login",        icon: "🔐", label: "Sign In" },
      { href: "/auth/signup",       icon: "✨", label: "Create Account" },
    ],
  },
];

/* ── Mobile quick pins ──────────────────────────────────────────────── */
const PINNED = ["/", "/crypto", "/dev-tools", "/workbook", "/ocr", "/file-converter"];
const ALL_NAV = [
  ...PRIMARY_NAV,
  ...MORE_GROUPS.flatMap((g) => g.links.map((l) => ({ href: l.href, label: l.label }))),
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/") || pathname.startsWith(href + "?");
}

export function NavLinks({ mobileControls }: { mobileControls?: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMobileOpen(false); setMoreOpen(false); setQ(""); }, [pathname]);

  /* Escape closes both panels */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMobileOpen(false); setMoreOpen(false); setQ(""); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  /* Outside-click closes More dropdown */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* Auto-focus mobile search */
  useEffect(() => {
    if (mobileOpen) setTimeout(() => searchRef.current?.focus(), 60);
  }, [mobileOpen]);

  const filtered = q.trim()
    ? ALL_NAV.filter((n) => n.label.toLowerCase().includes(q.toLowerCase()) || n.href.includes(q.toLowerCase()))
    : ALL_NAV;

  return (
    <>
      {/* ── Desktop primary nav (md+) ─────────────────────────────── */}
      <nav className="hidden items-center md:flex" aria-label="Primary navigation">
        {PRIMARY_NAV.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
                active
                  ? "bg-brand-500/10 text-brand-600"
                  : "text-muted hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        {/* ── More ▾ mega dropdown ──────────────────────────────── */}
        <div className="relative" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen === true}
            aria-haspopup="true"
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
              moreOpen ? "bg-brand-500/10 text-brand-600" : "text-muted hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            }`}
          >
            More
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              aria-hidden
              className={`transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
            >
              <path d="M2 4l4 4 4-4" />
            </svg>
          </button>

          {moreOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-30"
                aria-hidden
                onClick={() => setMoreOpen(false)}
              />
              {/* Mega panel */}
              <div
                role="dialog"
                aria-label="More navigation links"
                className="surface absolute left-1/2 top-full z-50 mt-2 w-[640px] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border border-app p-5 shadow-2xl"
              >
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
                  {MORE_GROUPS.map((group) => (
                    <div key={group.heading}>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted">
                        {group.heading}
                      </p>
                      <ul className="space-y-0.5">
                        {group.links.map((link) => {
                          const active = isActive(pathname, link.href);
                          return (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                onClick={() => setMoreOpen(false)}
                                aria-current={active ? "page" : undefined}
                                className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                                  active
                                    ? "bg-brand-500/10 text-brand-600 font-medium"
                                    : "text-muted hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                                }`}
                              >
                                <span aria-hidden className="shrink-0 text-base leading-none">{link.icon}</span>
                                <span className="truncate">{link.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* ── Hamburger button (< md) ────────────────────────────────── */}
      <button
        type="button"
        aria-label={mobileOpen ? "Close menu" : "Open navigation menu"}
        aria-expanded={mobileOpen === true}
        aria-controls="mobile-nav-menu"
        onClick={() => { setMobileOpen((v) => !v); setQ(""); }}
        className="surface-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-app text-muted transition-colors hover:text-[var(--text)] md:hidden"
      >
        {mobileOpen ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
        )}
      </button>

      {/* ── Mobile slide-down panel ───────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
            aria-hidden
            onClick={() => { setMobileOpen(false); setQ(""); }}
          />

          <div
            id="mobile-nav-menu"
            role="dialog"
            aria-label="Navigation menu"
            className="surface fixed inset-x-0 top-[52px] z-40 max-h-[calc(100dvh-52px)] overflow-y-auto border-b border-app shadow-2xl md:hidden sm:top-[57px] sm:max-h-[calc(100dvh-57px)]"
          >
            <div className="mx-auto max-w-6xl px-3 pb-4 pt-3 sm:px-6">

              {/* Search */}
              <div className="mb-3 flex items-center gap-2 rounded-xl surface-2 border border-app px-3 py-2">
                <svg className="h-4 w-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search all pages…"
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

              {/* Pinned quick-access row */}
              {!q && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {ALL_NAV.filter((n) => PINNED.includes(n.href)).map((item) => {
                    const active = isActive(pathname, item.href, PRIMARY_NAV.find((p) => p.href === item.href)?.exact);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
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

              {/* Nav links — grouped when not searching */}
              {!q ? (
                <div className="mb-4 space-y-4">
                  {MORE_GROUPS.map((group) => (
                    <div key={group.heading}>
                      <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                        {group.heading}
                      </p>
                      <div className="grid grid-cols-2 gap-1 xs:grid-cols-3">
                        {group.links.map((link) => {
                          const active = isActive(pathname, link.href);
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => { setMobileOpen(false); setQ(""); }}
                              aria-current={active ? "page" : undefined}
                              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                                active
                                  ? "bg-brand-500/10 text-brand-600"
                                  : "hover:bg-[var(--surface-2)] text-[var(--text)]"
                              }`}
                            >
                              <span aria-hidden>{link.icon}</span>
                              <span className="truncate">{link.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <nav aria-label="Search results" className="mb-4">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted px-1">
                    Results for &ldquo;{q}&rdquo;
                  </p>
                  {filtered.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted">No pages match &ldquo;{q}&rdquo;</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-1 xs:grid-cols-3">
                      {filtered.map((item) => {
                        const active = isActive(pathname, item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => { setMobileOpen(false); setQ(""); }}
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
              )}

              {/* Appearance controls */}
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
