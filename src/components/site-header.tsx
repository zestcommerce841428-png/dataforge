import Link from "next/link";
import { ThemeControls } from "./theme-controls";
import { ThemeSwitcher } from "./theme-switcher";
import { RegionSwitcher } from "./region-switcher";
import { NavLinks } from "./nav-links";
import { CollectionsPanel } from "./collections-panel";

export function SiteHeader() {
  /* Controls rendered both in desktop header AND inside the mobile panel */
  const controls = (
    <>
      <CollectionsPanel />
      <ThemeSwitcher />
      <RegionSwitcher />
      <ThemeControls />
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-app backdrop-blur-md supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bg-base)_80%,transparent)] will-change-transform">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-3">

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="DataForge home"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-black text-white shadow-sm sm:h-9 sm:w-9">
            ⚡
          </span>
          <span className="text-base font-extrabold tracking-tight sm:text-lg">
            Data<span className="text-brand-600">Forge</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex min-w-0 items-center gap-1">

          {/* Desktop nav + controls (md and up) */}
          <NavLinks mobileControls={controls} />

          {/* Controls: desktop only (md+) – on mobile they appear inside the hamburger panel */}
          <div className="hidden md:flex items-center gap-1" aria-label="Site controls">
            <div className="mx-1 h-5 w-px bg-[var(--border)]" aria-hidden />
            {controls}
          </div>

        </div>
      </div>
    </header>
  );
}
