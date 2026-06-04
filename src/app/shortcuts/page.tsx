import type { Metadata } from "next";
import Link from "next/link";
import { ShortcutsClient } from "./client";

export const metadata: Metadata = {
  title: "Keyboard Shortcuts — Learn Shortcuts for Windows, macOS, VS Code & More",
  description:
    "A searchable cheat-sheet of keyboard shortcuts for Windows, macOS, VS Code, Chrome, Excel, Photoshop, Gmail, the terminal and Git. Learn the shortcuts that make you faster.",
  keywords: [
    "keyboard shortcuts", "shortcuts cheat sheet", "windows shortcuts", "mac shortcuts",
    "vs code shortcuts", "excel shortcuts", "photoshop shortcuts", "chrome shortcuts",
    "gmail shortcuts", "git commands", "hotkeys",
  ],
};

export default function ShortcutsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Keyboard Shortcuts</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Learn the shortcuts that make you faster across the apps you use every day.
            Pick an app or search across all of them.
          </p>
        </div>
        <Link href="/typing" className="rounded-xl border border-app px-4 py-2 text-sm font-medium text-muted hover:border-brand-400 hover:text-brand-600">
          ⌨ Practice typing →
        </Link>
      </div>
      <ShortcutsClient />
    </main>
  );
}
