import type { Metadata } from "next";
import { JsonPathExplorer } from "./json-path-client";

export const metadata: Metadata = {
  title: "JSON Path Explorer — Query & Extract JSON with JSONPath",
  description: "Run JSONPath expressions against any JSON. Explore nested data structures, test queries live, and extract values with dot-notation or bracket syntax.",
  alternates: { canonical: "/json-path" },
};

export default function JsonPathPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">JSON Path Explorer</h1>
        <p className="mt-2 text-muted">Query JSON with JSONPath expressions. Explore nested structures and extract values live.</p>
      </header>
      <JsonPathExplorer />
    </main>
  );
}
