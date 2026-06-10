"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: {
  href: string;
  label: string;
  show: "sm" | "md" | "lg";
  exact?: boolean;
}[] = [
  { href: "/",                label: "All tools",    show: "sm", exact: true },
  { href: "/crypto",          label: "₿ Crypto",     show: "sm" },
  { href: "/dev-tools",       label: "🛠 Dev Tools",  show: "sm" },
  { href: "/ocr",             label: "🔍 OCR",        show: "sm" },
  { href: "/file-converter",  label: "🔄 Convert",    show: "sm" },
  { href: "/image-tools",     label: "🖼️ Image",      show: "md" },
  { href: "/pdf-tools",       label: "📄 PDF",        show: "md" },
  { href: "/handwriting",     label: "✍️ Handwriting", show: "lg" },
  { href: "/code-formatter",  label: "{ } Formatter", show: "lg" },
  { href: "/workbook",        label: "⊞ Workbook",    show: "sm" },
  { href: "/formula-manager", label: "ƒ Formulas",    show: "lg" },
  { href: "/typing",          label: "⌨ Typing",      show: "lg" },
  { href: "/compare",         label: "⇄ Compare",     show: "lg" },
  { href: "/shortcuts",       label: "⚡ Shortcuts",   show: "lg" },
  { href: "/about",           label: "About",         show: "lg" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/") || pathname.startsWith(href + "?");
}

const SHOW_CLASS: Record<"sm" | "md" | "lg", string> = {
  sm: "hidden sm:inline-flex",
  md: "hidden md:inline-flex",
  lg: "hidden lg:inline-flex",
};

export function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center sm:flex" aria-label="Primary navigation">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`${SHOW_CLASS[item.show]} items-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
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

      {/* Mobile hamburger button */}
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        onClick={() => setOpen((v) => !v)}
        className="surface-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-app text-muted transition-colors hover:text-[var(--text)] sm:hidden"
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

      {/* Mobile menu panel */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm sm:hidden"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-nav-menu"
            role="dialog"
            aria-label="Navigation menu"
            className="surface fixed inset-x-0 top-[57px] z-40 border-b border-app shadow-2xl sm:hidden"
          >
            <nav className="mx-auto max-w-6xl px-4 py-3" aria-label="Mobile navigation">
              <div className="grid grid-cols-2 gap-1">
                {NAV.map((item) => {
                  const active = isActive(pathname, item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        active
                          ? "bg-brand-500/10 text-brand-600"
                          : "hover:bg-[var(--surface-2)]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
