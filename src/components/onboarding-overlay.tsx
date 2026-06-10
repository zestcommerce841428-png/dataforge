"use client";

import { useEffect, useState } from "react";

const KEY = "df-onboarded";

const tips = [
  { icon: "R", label: "Press R to regenerate", desc: "Anywhere on a tool page, press R to instantly re-run the generator without clicking Generate." },
  { icon: "★", label: "Star your favourites", desc: "Click ★ on any tool card to pin it. Filter by Favourites to find them instantly." },
  { icon: "🔗", label: "Share your settings", desc: "Use the Share URL button to copy a link with all your current options pre-filled." },
  { icon: "⇄", label: "Compare two generators", desc: "Click Compare on any tool to run two generators side-by-side and contrast their output." },
  { icon: "↩", label: "Recently used", desc: "Tools you visit appear in a quick-access strip above the grid so you can jump back fast." },
];

export function OnboardingOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch { /* noop */ }
  }, []);

  const dismiss = () => {
    setOpen(false);
    try { localStorage.setItem(KEY, "1"); } catch { /* noop */ }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to DataForge"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="surface relative z-10 w-full max-w-lg rounded-2xl border p-6 shadow-2xl">
        <div className="mb-1 text-2xl" aria-hidden>⚡</div>
        <h2 className="text-xl font-extrabold">Welcome to DataForge</h2>
        <p className="mt-1 text-sm text-muted">
          A few tips to get the most out of {"{"}your{"}"} generators:
        </p>

        <ul className="mt-5 space-y-3">
          {tips.map((t) => (
            <li key={t.label} className="flex items-start gap-3">
              <span className="surface-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-app text-sm font-bold">
                {t.icon}
              </span>
              <div>
                <p className="text-sm font-semibold">{t.label}</p>
                <p className="text-xs text-muted">{t.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={dismiss}
          className="mt-6 w-full rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white shadow-md transition hover:bg-brand-700"
          autoFocus
        >
          Got it — let&apos;s go!
        </button>

        <p className="mt-3 text-center text-xs text-muted">
          This message is shown once and never again.
        </p>
      </div>
    </div>
  );
}
