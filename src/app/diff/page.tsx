import type { Metadata } from "next";
import { DiffViewer } from "./diff-client";

export const metadata: Metadata = {
  title: "Diff Viewer — Text & Code Comparison Tool",
  description: "Compare two text blocks side-by-side or in unified view with character-level and line-level diff highlighting. Free, in-browser, no upload.",
  alternates: { canonical: "/diff" },
};

export default function DiffPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Diff Viewer</h1>
        <p className="mt-2 text-muted">Compare two texts side-by-side. Instant, in-browser — nothing uploaded.</p>
      </header>
      <DiffViewer />
    </main>
  );
}
