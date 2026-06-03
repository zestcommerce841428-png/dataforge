import type { Metadata } from "next";
import Link from "next/link";
import { Workbook } from "./workbook";

export const metadata: Metadata = {
  title: "Workbook — Free Online Excel-Style Spreadsheet",
  description:
    "A real online spreadsheet that runs entirely in your browser. 360+ Excel-compatible formulas, multiple sheets, cell formatting, number formats, CSV/JSON import & export, undo/redo, and live recalculation. No sign-up, 100% private.",
  keywords: [
    "online spreadsheet", "excel online", "free spreadsheet", "browser spreadsheet",
    "excel formulas", "csv editor", "spreadsheet app", "google sheets alternative",
    "vlookup", "sumif", "pivot", "workbook",
  ],
  openGraph: {
    title: "Workbook — Free Online Excel-Style Spreadsheet",
    description: "A real in-browser spreadsheet with 360+ Excel formulas, formatting, multiple sheets and CSV/JSON import-export.",
    type: "website",
  },
};

export default function WorkbookPage() {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-3 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Workbook</h1>
          <p className="mt-2 max-w-2xl text-muted">
            A real Excel-style spreadsheet, 100% in your browser. Type values or formulas
            (start with <code className="rounded bg-[var(--surface-2)] px-1 font-mono text-sm">=</code>),
            reference cells like <code className="rounded bg-[var(--surface-2)] px-1 font-mono text-sm">A1</code> or
            ranges like <code className="rounded bg-[var(--surface-2)] px-1 font-mono text-sm">B2:B10</code>.
            Everything recalculates live and autosaves to your device.
          </p>
        </div>
        <Link href="/formula-manager" className="rounded-xl border border-app px-4 py-2 text-sm font-medium text-muted hover:border-brand-400 hover:text-brand-600">
          ⊞ Formula reference →
        </Link>
      </div>

      <Workbook />

      {/* Feature grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: "∑", title: "360+ Excel functions", body: "The complete Excel 365 list — SUM, VLOOKUP, XLOOKUP, INDEX/MATCH, SUMIFS, PMT, database D-functions, complex IM-functions, statistical distributions, dynamic arrays and more, all evaluated locally." },
          { icon: "🎨", title: "Real formatting", body: "Bold, italic, underline, alignment, text & fill colors, plus number/currency/percent/date formats." },
          { icon: "📑", title: "Multiple sheets", body: "Add, rename and delete sheets. Each sheet keeps its own data, formats and column layout." },
          { icon: "⇄", title: "CSV & JSON I/O", body: "Import any CSV and export your work back to CSV or JSON. Undo/redo and autosave included." },
        ].map(f => (
          <div key={f.title} className="surface rounded-2xl border p-5">
            <div className="mb-2 text-2xl">{f.icon}</div>
            <h3 className="font-bold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.body}</p>
          </div>
        ))}
      </div>

      {/* Keyboard shortcuts */}
      <div className="surface mt-6 rounded-2xl border p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Keyboard shortcuts</h2>
        <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Arrow keys", "Move selection"],
            ["Shift + Arrows", "Extend selection"],
            ["Enter", "Edit / confirm & move down"],
            ["Tab", "Confirm & move right"],
            ["Ctrl/⌘ + C / X / V", "Copy / cut / paste"],
            ["Ctrl/⌘ + Z / Y", "Undo / redo"],
            ["Ctrl/⌘ + B / I / U", "Bold / italic / underline"],
            ["Ctrl/⌘ + A", "Select all"],
            ["Delete", "Clear cells"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <kbd className="rounded border border-app bg-[var(--surface-2)] px-2 py-0.5 font-mono text-xs">{k}</kbd>
              <span className="text-muted">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
