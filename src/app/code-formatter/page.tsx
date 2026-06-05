import type { Metadata } from "next";
import { CodeFormatterClient } from "./client";

export const metadata: Metadata = {
  title: "Code Formatter & Minifier — Beautify JSON, CSS, SQL, XML, HTML, JS",
  description:
    "Free online code formatter and minifier. Beautify or minify JSON, CSS, SQL, XML, HTML and JavaScript with adjustable indentation. Fast, private and 100% in your browser.",
  keywords: [
    "code formatter", "code beautifier", "json formatter", "css formatter", "sql formatter",
    "html formatter", "xml formatter", "js minifier", "css minifier", "beautify code online",
  ],
};

export default function CodeFormatterPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Code Formatter &amp; Minifier</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Beautify or minify <strong>JSON, CSS, SQL, XML, HTML and JavaScript</strong>. Pick a
          language and indentation, then format — all in your browser, nothing uploaded.
        </p>
      </div>
      <CodeFormatterClient />
    </main>
  );
}
