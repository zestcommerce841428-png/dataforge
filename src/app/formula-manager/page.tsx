import type { Metadata } from "next";
import { FormulaManagerClient } from "./client";

export const metadata: Metadata = {
  title: "Excel Formula Manager — All 360+ Excel 365 Functions, Live",
  description:
    "Interactive reference for the complete Excel 365 function list — 360+ functions, all executable live in your browser. Math, Text, Date, Logical, Lookup, Statistical, Financial, Database, Complex, Engineering and Dynamic-Array functions with real examples and copy support.",
  keywords: [
    "excel formulas", "excel 365 functions", "spreadsheet formulas", "formula reference", "vlookup", "sumif",
    "countif", "if formula", "index match", "excel functions list", "formula calculator",
    "learn excel", "google sheets formulas", "formula executor",
  ],
  openGraph: {
    title: "Excel Formula Manager — All 360+ Excel 365 Functions",
    description: "The complete Excel 365 function list, executable live in your browser with real examples.",
    type: "website",
  },
};

export default function FormulaManagerPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Excel Formula Manager
        </h1>
        <p className="mt-2 text-muted">
          The complete Excel 365 function list — all 360+ functions, executable live in your browser.
          Real examples, live results, copy-ready syntax. Scroll down for the full A–Z coverage list.
        </p>
      </div>
      <FormulaManagerClient />
    </main>
  );
}
