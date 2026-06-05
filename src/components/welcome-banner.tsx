"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "df-welcome-v1";

export function WelcomeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try { if (!localStorage.getItem(KEY)) setShow(true); } catch {}
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="border-b border-app bg-gradient-to-r from-brand-500/10 via-brand-500/5 to-transparent">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <span aria-hidden className="text-lg">👋</span>
        <p className="flex-1 text-sm">
          <span className="font-semibold">Welcome to DataForge!</span>{" "}
          <span className="text-muted">200+ free, private tools — generators, image &amp; PDF tools, a spreadsheet, and more. Nothing is uploaded.</span>{" "}
          <Link href="/dev-tools" className="font-medium text-brand-600 hover:underline">Explore tools →</Link>
        </p>
        <button onClick={dismiss} aria-label="Dismiss welcome message" className="shrink-0 rounded-lg px-2 py-1 text-muted hover:bg-[var(--surface-2)] hover:text-[var(--text)]">✕</button>
      </div>
    </div>
  );
}
