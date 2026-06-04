import type { Metadata } from "next";
import Link from "next/link";
import { PdfToolsClient } from "./client";

export const metadata: Metadata = {
  title: "PDF Tools — Merge, Split, Rotate & Convert PDF Free Online",
  description:
    "Free in-browser PDF toolkit: merge PDFs, extract or delete pages, rotate, and convert images to PDF. Fast, private and 100% client-side — your files never leave your device.",
  keywords: [
    "pdf tools", "merge pdf", "split pdf", "rotate pdf", "image to pdf", "jpg to pdf",
    "combine pdf", "delete pdf pages", "extract pdf pages", "free pdf editor",
  ],
};

export default function PdfToolsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">PDF Tools</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Merge, split, rotate and build PDFs right in your browser. Your files are processed
            locally with WebAssembly — nothing is ever uploaded to a server.
          </p>
        </div>
        <Link href="/image-tools" className="rounded-xl border border-app px-4 py-2 text-sm font-medium text-muted hover:border-brand-400 hover:text-brand-600">
          🖼️ Image tools →
        </Link>
      </div>
      <PdfToolsClient />
    </main>
  );
}
