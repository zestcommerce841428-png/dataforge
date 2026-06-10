import Link from "next/link";
import {
  GENERATORS,
  TOOL_META,
  TOTAL_GENERATORS,
  CATEGORIES,
} from "@/lib/generators";
import { ToolExplorer } from "@/components/tool-explorer";
import { RecentTools } from "@/components/recent-tools";

const features = [
  {
    icon: "🔒",
    title: "Private & secure",
    text: "Everything runs locally in your browser. No data is ever sent to a server.",
  },
  {
    icon: "⚡",
    title: "Instant & fast",
    text: "Statically rendered, no-login, zero wait. Results appear in milliseconds.",
  },
  {
    icon: "🎲",
    title: "Cryptographically random",
    text: "Powered by the Web Crypto API for unbiased, high-quality randomness.",
  },
  {
    icon: "♿",
    title: "Fully accessible",
    text: "Keyboard-navigable, ARIA live regions, skip link, reduced-motion safe.",
  },
];

const highlights = [
  { slug: "password",    label: "Password" },
  { slug: "uuid",        label: "UUID" },
  { slug: "json-mock",   label: "JSON Mock" },
  { slug: "credit-card", label: "Test Cards" },
  { slug: "mnemonic",    label: "Mnemonic" },
  { slug: "my-ip",       label: "My IP" },
];

const featured = [
  { href: "/dev-tools",       icon: "🛠",  title: "397+ Developer Tools",        desc: "JSON, regex, hashing, converters, finance, health & more" },
  { href: "/handwriting",     icon: "✍️",  title: "Text to Handwriting",         desc: "30 fonts, inks & papers, unlimited pages, PNG/PDF export" },
  { href: "/image-tools",     icon: "🖼️",  title: "Image Resizer & Compressor",  desc: "Resize, crop, compress to target KB, convert formats" },
  { href: "/pdf-tools",       icon: "📄",  title: "PDF Tools",                   desc: "Merge, split, compress, rotate, images ↔ PDF" },
  { href: "/format-converter",icon: "⇄",  title: "Format Converter",            desc: "JSON / YAML / XML / CSV — convert between any formats" },
  { href: "/code-formatter",  icon: "{}",  title: "Code Formatter",              desc: "Beautify or minify JSON, CSS, SQL, HTML, JS" },
  { href: "/workbook",        icon: "⊞",  title: "Spreadsheet Workbook",        desc: "Excel-style grid with 360+ built-in formulas" },
  { href: "/crypto",          icon: "₿",  title: "Live Crypto Tracker",         desc: "Real-time prices, charts, order book, WebSocket data" },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="py-14 text-center sm:py-24">
        <Link
          href="#tools"
          className="surface inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium text-muted transition-colors hover:border-brand-400 hover:text-brand-600"
        >
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" aria-hidden />
          {TOTAL_GENERATORS} free generators · 100% in-browser · no sign-up
        </Link>

        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          Generate{" "}
          <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
            useful data
          </span>{" "}
          in seconds
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          DataForge is a fast, secure, privacy-first toolkit for developers, testers and
          creators. Passwords, UUIDs, JSON, IBAN, BIP39 phrases, colors, countries and
          more — all generated locally, instantly, for free.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="#tools"
            className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-brand-700 active:scale-[0.97]"
          >
            Browse all {TOTAL_GENERATORS} tools
          </Link>
          <Link
            href="/tools/password"
            className="surface rounded-xl border px-6 py-3 font-semibold shadow-sm transition hover:bg-[var(--surface-2)] active:scale-[0.97]"
          >
            Try password generator →
          </Link>
        </div>

        {/* Quick-access pills */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {highlights.map((h) => (
            <Link
              key={h.slug}
              href={`/tools/${h.slug}`}
              className="surface rounded-full border px-3 py-1 text-sm text-muted transition-colors hover:border-brand-400 hover:text-brand-600"
            >
              {h.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────────────────────────── */}
      <section
        className="grid gap-4 pb-8 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Why DataForge"
      >
        {features.map((f) => (
          <div key={f.title} className="surface rounded-2xl border p-5 shadow-sm">
            <div className="text-2xl" aria-hidden>{f.icon}</div>
            <h2 className="mt-3 font-semibold">{f.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{f.text}</p>
          </div>
        ))}
      </section>

      {/* ── Category chips ────────────────────────────────────────────────── */}
      <section className="mb-2 flex flex-wrap gap-2 pb-4" aria-label="Browse by category">
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href="#tools"
            className="surface rounded-full border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-brand-400 hover:text-brand-600"
          >
            {c.icon} {c.name}
          </Link>
        ))}
      </section>

      {/* ── Featured apps ─────────────────────────────────────────────────── */}
      <section className="py-4" aria-label="Featured tools">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">Explore our tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="surface group rounded-2xl border p-5 shadow-sm transition-colors hover:border-brand-400"
            >
              <div className="text-2xl" aria-hidden>{a.icon}</div>
              <h3 className="mt-2 font-bold group-hover:text-brand-600">{a.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{a.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Crypto banner ─────────────────────────────────────────────────── */}
      <section className="surface my-6 overflow-hidden rounded-2xl border shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 bg-gradient-to-r from-brand-600/10 via-brand-500/5 to-transparent p-6 sm:flex-row sm:items-center">
          <div>
            <span className="text-2xl" aria-hidden>₿</span>
            <h2 className="mt-1 text-lg font-bold">Live Crypto Tracker</h2>
            <p className="mt-1 text-sm text-muted">
              Real-time market prices · Binance order book · Trade feed · Candlestick charts · WebSocket live data
            </p>
          </div>
          <Link
            href="/crypto"
            className="shrink-0 rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-brand-700 active:scale-[0.97]"
          >
            Open Tracker →
          </Link>
        </div>
      </section>

      {/* ── Tools explorer ────────────────────────────────────────────────── */}
      <section id="tools" className="scroll-mt-20 py-4">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">All generators</h2>
            <p className="mt-1 text-muted">
              Search, filter by category, and click any tool to start generating.
            </p>
          </div>
        </div>
        <RecentTools />
        <ToolExplorer tools={TOOL_META} />
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "DataForge",
            description:
              "Free online data generators that run locally in your browser.",
            potentialAction: {
              "@type": "SearchAction",
              target: "/tools/{search_term_string}",
              "query-input": "required name=search_term_string",
            },
            hasPart: GENERATORS.map((g) => ({
              "@type": "SoftwareApplication",
              name: g.name,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            })),
          }),
        }}
      />
    </>
  );
}
