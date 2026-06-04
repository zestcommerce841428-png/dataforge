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

          {/* Site & legal links */}
          <div>
            <h2 className="text-sm font-semibold">Company</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/about" className="hover:text-[var(--text)]">About</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--text)]">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--text)]">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--text)]">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-[var(--text)]">Cookie Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-[var(--text)]">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact row */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-app pt-6 text-sm text-muted">
          <a href="mailto:contact@zestcommerce.in" className="hover:text-[var(--text)]">✉ contact@zestcommerce.in</a>
          <a href="https://wa.me/917492068998" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)]">💬 WhatsApp: +91 74920 68998</a>
          <span>🌐 India</span>
        </div>
      </div>

      <div className="border-t border-app py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} DataForge · Built by <span className="font-medium text-[var(--text)]">Naushad Alam</span> with Claude · India ·{" "}
        <Link href="/privacy" className="hover:text-[var(--text)]">Privacy</Link> ·{" "}
        <Link href="/terms" className="hover:text-[var(--text)]">Terms</Link>
      </div>
    </footer>
  );
}
