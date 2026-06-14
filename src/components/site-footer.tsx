import Link from "next/link";
import { CATEGORIES, TOTAL_GENERATORS } from "@/lib/generators";
import {
  BUILD_VERSION, BUILD_SHA, BUILD_TIME_ISO,
  BUILD_BRANCH, BUILD_ENV, BUILD_REGION,
  BUILD_AUTHOR, BUILD_MESSAGE, BUILD_NODE, BUILD_NEXT,
} from "@/lib/version";
import { BuildInfo } from "./build-info";

const TOOL_COLS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Popular Tools",
    links: [
      { href: "/dev-tools",       label: "🛠 Dev Tools (420+)" },
      { href: "/crypto",          label: "₿ Crypto Tracker" },
      { href: "/workbook",        label: "⊞ Spreadsheet" },
      { href: "/ocr",             label: "🔍 OCR / Scan" },
      { href: "/file-converter",  label: "🔄 File Converter" },
      { href: "/handwriting",     label: "✍️ Handwriting" },
      { href: "/image-tools",     label: "🖼️ Image Tools" },
      { href: "/pdf-tools",       label: "📄 PDF Tools" },
    ],
  },
  {
    heading: "Developer",
    links: [
      { href: "/code-formatter",  label: "{} Code Formatter" },
      { href: "/json-formatter",  label: "{ } JSON Formatter" },
      { href: "/sql-formatter",   label: "🗄 SQL Formatter" },
      { href: "/uuid-generator",  label: "🔢 UUID Generator" },
      { href: "/url-checker",     label: "🔗 URL Checker" },
      { href: "/text-escape",     label: "✎ Text Escape" },
      { href: "/format-converter",label: "⇄ Format Converter" },
      { href: "/diff",            label: "⇄ Diff Viewer" },
      { href: "/regex",           label: "⋅* Regex Tester" },
      { href: "/jwt",             label: "🔑 JWT Decoder" },
      { href: "/json-path",       label: "$ JSONPath" },
      { href: "/base-converter",  label: "01 Base Converter" },
    ],
  },
  {
    heading: "Productivity",
    links: [
      { href: "/formula-manager", label: "ƒ Formula Manager" },
      { href: "/typing",          label: "⌨ Typing Test" },
      { href: "/shortcuts",       label: "⚡ Keyboard Shortcuts" },
      { href: "/cron-builder",    label: "⏱ Cron Builder" },
      { href: "/bulk-template",   label: "⚡ Bulk Generator" },
      { href: "/color-toolkit",   label: "🎨 Color Toolkit" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about",           label: "About" },
      { href: "/blog",            label: "Blog & Guides" },
      { href: "/changelog",       label: "Changelog" },
      { href: "/api-docs",        label: "API Docs" },
      { href: "/sitemap-page",    label: "Site Map" },
      { href: "/contact",         label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy",         label: "Privacy Policy" },
      { href: "/terms",           label: "Terms of Service" },
      { href: "/cookies",         label: "Cookie Policy" },
      { href: "/disclaimer",      label: "Disclaimer" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-app">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">

        {/* Brand + contact row */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 text-lg font-extrabold">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm text-white">
                ⚡
              </span>
              Data<span className="text-brand-600">Forge</span>
            </div>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              {TOTAL_GENERATORS}+ free, fast and privacy-first tools.
              Everything runs locally in your browser — no data ever leaves your device.
            </p>
            <p className="mt-2 text-xs text-muted">Built with Next.js &amp; Tailwind CSS · India</p>
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted sm:text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Get in touch</p>
            <a href="mailto:contact@zestcommerce.in" className="hover:text-[var(--text)] transition-colors">
              ✉️ contact@zestcommerce.in
            </a>
            <a href="https://wa.me/917492068998" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors">
              💬 WhatsApp: +91 74920 68998
            </a>
          </div>
        </div>

        {/* Tool links grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {TOOL_COLS.map((col) => (
            <div key={col.heading}>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
                {col.heading}
              </h2>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-[var(--text)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Generator categories */}
        <div className="mt-10 border-t border-app pt-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Generator Categories</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href="/#tools"
                className="rounded-full border border-app px-3 py-1 text-xs text-muted transition-colors hover:border-brand-500/40 hover:bg-brand-500/5 hover:text-brand-600"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-app py-6 text-center text-xs text-muted">
        <p>
          © {new Date(BUILD_TIME_ISO).getFullYear()} DataForge · Built by{" "}
          <span className="font-medium text-[var(--text)]">Naushad Alam</span> with Claude · India ·{" "}
          <Link href="/privacy" className="hover:text-[var(--text)]">Privacy</Link> ·{" "}
          <Link href="/terms" className="hover:text-[var(--text)]">Terms</Link>
        </p>
        <div className="mt-3">
          <BuildInfo
            sha={BUILD_SHA}
            version={BUILD_VERSION}
            timeIso={BUILD_TIME_ISO}
            branch={BUILD_BRANCH}
            env={BUILD_ENV}
            region={BUILD_REGION}
            author={BUILD_AUTHOR}
            message={BUILD_MESSAGE}
            nodeVersion={BUILD_NODE}
            nextVersion={BUILD_NEXT}
          />
        </div>
      </div>
    </footer>
  );
}
