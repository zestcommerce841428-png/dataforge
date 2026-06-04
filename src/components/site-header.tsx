import Link from "next/link";
import { ThemeControls } from "./theme-controls";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-app backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bg-base)_75%,transparent)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="DataForge home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-black text-white shadow-md">
            ⚡
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Data<span className="text-brand-600">Forge</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4" aria-label="Primary">
          <Link href="/#tools" className="hidden text-sm font-medium text-muted hover:text-[var(--text)] sm:inline">
            All tools
          </Link>
          <Link href="/crypto" className="hidden items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)] sm:inline-flex">
            <span aria-hidden>₿</span> Crypto
          </Link>
          <Link href="/dev-tools" className="hidden items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)] sm:inline-flex">
            <span aria-hidden>🛠</span> Dev Tools
          </Link>
          <Link href="/ocr" className="hidden items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)] sm:inline-flex">
            <span aria-hidden>🔍</span> OCR
          </Link>
          <Link href="/file-converter" className="hidden items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)] sm:inline-flex">
            <span aria-hidden>🔄</span> Convert
          </Link>
          <Link href="/workbook" className="hidden items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)] sm:inline-flex">
            <span aria-hidden>⊞</span> Workbook
          </Link>
          <Link href="/formula-manager" className="hidden items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)] lg:inline-flex">
            <span aria-hidden>ƒ</span> Formulas
          </Link>
          <Link href="/typing" className="hidden items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)] lg:inline-flex">
            <span aria-hidden>⌨</span> Typing
          </Link>
          <Link href="/shortcuts" className="hidden items-center gap-1 text-sm font-medium text-muted hover:text-[var(--text)] lg:inline-flex">
            <span aria-hidden>⚡</span> Shortcuts
          </Link>
          <Link href="/about" className="hidden text-sm font-medium text-muted hover:text-[var(--text)] lg:inline">
            About
          </Link>
          <ThemeControls />
        </nav>
      </div>
    </header>
  );
}
