import type { Metadata } from "next";
import Link from "next/link";
import { TypingClient } from "./client";

export const metadata: Metadata = {
  title: "Typing Practice — Free Online Typing Speed Test (WPM & Accuracy)",
  description:
    "Improve your typing speed with a free, private typing test. Measure WPM and accuracy in timed or word-count modes, with practice text for words, quotes, code and numbers. Runs 100% in your browser.",
  keywords: [
    "typing test", "typing practice", "wpm test", "typing speed test", "learn to type",
    "touch typing", "keyboard practice", "typing game", "code typing practice",
  ],
};

export default function TypingPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Typing Practice</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Measure and improve your typing speed. Choose a timed or word-count test, start typing,
            and watch your WPM and accuracy live. Nothing is uploaded — it all runs in your browser.
          </p>
        </div>
        <Link href="/shortcuts" className="rounded-xl border border-app px-4 py-2 text-sm font-medium text-muted hover:border-brand-400 hover:text-brand-600">
          ⌨ Keyboard shortcuts →
        </Link>
      </div>
      <TypingClient />
    </main>
  );
}
