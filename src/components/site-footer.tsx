import Link from "next/link";
import { CATEGORIES, TOTAL_GENERATORS } from "@/lib/generators";

export function SiteFooter() {
  return (
    <footer className="border-t border-app">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        {/* Top row */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-lg font-extrabold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm text-white">
                ⚡
              </span>
              Data<span className="text-brand-600">Forge</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              {TOTAL_GENERATORS} free, fast and privacy-first data generators.
              Everything runs locally — no data ever leaves your device.
            </p>
            <p className="mt-3 text-xs text-muted">
              Built with Next.js {"&"} Tailwind CSS.
            </p>
          </div>

          {/* Categories col 1 */}
          <div>
            <h2 className="text-sm font-semibold">Categories</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link href={`/#tools`} className="hover:text-[var(--text)]">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories col 2 */}
          <div>
            <h2 className="text-sm font-semibold">&nbsp;</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {CATEGORIES.slice(6).map((c) => (
                <li key={c.id}>
                  <Link href={`/#tools`} className="hover:text-[var(--text)]">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Site links */}
          <div>
            <h2 className="text-sm font-semibold">Site</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/#tools" className="hover:text-[var(--text)]">All {TOTAL_GENERATORS} tools</Link></li>
              <li><Link href="/crypto" className="hover:text-[var(--text)]">₿ Crypto Tracker</Link></li>
              <li><Link href="/about" className="hover:text-[var(--text)]">About</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--text)]">Privacy policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-app py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} DataForge · Generated data is fictional and for testing only ·{" "}
        <Link href="/privacy" className="hover:text-[var(--text)]">Privacy</Link>
      </div>
    </footer>
  );
}
