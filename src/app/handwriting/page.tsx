import type { Metadata } from "next";
import { HandwritingClient } from "./client";

export const metadata: Metadata = {
  title: "Text to Handwriting — Convert Text to Realistic Handwriting (PNG & PDF)",
  description:
    "Turn any text into realistic handwriting. Choose from 10 handwriting fonts, any ink colour, ruled/blank/grid/legal paper, adjust size and realism, and export unlimited pages as PNG or a multi-page PDF. 100% in your browser.",
  keywords: [
    "text to handwriting", "handwriting generator", "convert text to handwriting",
    "handwriting font", "assignment handwriting", "handwritten notes generator", "text to handwriting pdf",
  ],
};

export default function HandwritingPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Text to Handwriting</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Convert typed text into realistic handwriting. Pick a font, ink colour and paper,
          tune the realism, and export <strong>unlimited pages</strong> as PNG or PDF — all in your browser.
        </p>
      </div>
      <HandwritingClient />
    </main>
  );
}
