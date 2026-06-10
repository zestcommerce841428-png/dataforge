import Link from "next/link";
import { ThemeControls } from "./theme-controls";
import { ThemeSwitcher } from "./theme-switcher";
import { RegionSwitcher } from "./region-switcher";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-app backdrop-blur-md supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bg-base)_80%,transparent)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="DataForge home"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-black text-white shadow-sm">
            ⚡
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Data<span className="text-brand-600">Forge</span>
          </span>
        </Link>

        {/* Right side: nav + controls */}
        <div className="flex min-w-0 items-center gap-1.5">
          <NavLinks />
          <div className="mx-1 hidden h-5 w-px bg-[var(--border)] sm:block" aria-hidden />
          <ThemeSwitcher />
          <RegionSwitcher />
          <ThemeControls />
        </div>

      </div>
    </header>
  );
}
