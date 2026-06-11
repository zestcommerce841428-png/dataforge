import type { Metadata } from "next";
import { RegexPlayground } from "./regex-client";

export const metadata: Metadata = {
  title: "Regex Playground — Live Tester & Pattern Library",
  description: "Test regular expressions live with real-time match highlighting, capture groups, named groups, flags, replace mode and a built-in pattern library. Free, in-browser.",
  alternates: { canonical: "/regex" },
};

export default function RegexPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Regex Playground</h1>
        <p className="mt-2 text-muted">Test patterns live, inspect captures, replace, and pick from a built-in pattern library.</p>
      </header>
      <RegexPlayground />
    </main>
  );
}
