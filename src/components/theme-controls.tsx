"use client";

import { useEffect, useRef, useState } from "react";
import { BACKGROUNDS, BG_KEY, applyBg } from "@/lib/backgrounds";

export function ThemeControls() {
  const [dark, setDark] = useState(false);
  const [bgId, setBgId] = useState("aurora-radial");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = document.documentElement;
    setDark(el.classList.contains("dark"));
    try {
      const saved = localStorage.getItem(BG_KEY);
      if (saved) setBgId(saved);
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function toggleDark() {
    const el = document.documentElement;
    const next = !el.classList.contains("dark");
    el.classList.toggle("dark", next);
    localStorage.setItem("df-theme", next ? "dark" : "light");
    setDark(next);
  }

  function choose(id: string) {
    const b = BACKGROUNDS.find((x) => x.id === id);
    if (b) {
      applyBg(b);
      setBgId(id);
    }
  }

  const current = BACKGROUNDS.find((b) => b.id === bgId) ?? BACKGROUNDS[0];

  return (
    <div className="flex items-center gap-2">
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="surface flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-[var(--surface-2)]"
          aria-label={`Change background. Current: ${current.label}`}
          aria-expanded={open}
          title="Change background"
        >
          <span aria-hidden className="h-4 w-4 rounded-full border border-black/10" style={{ background: current.css === "none" ? "var(--surface-2)" : current.css }} />
          <span className="hidden sm:inline">{mounted ? current.label : "Background"}</span>
        </button>

        {open && (
          <div className="surface absolute right-0 z-50 mt-2 w-72 rounded-2xl border p-3 shadow-2xl">
            <p className="mb-2 text-xs font-semibold text-muted">Background · {BACKGROUNDS.length}</p>
            <div className="grid max-h-72 grid-cols-6 gap-2 overflow-auto">
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => choose(b.id)}
                  title={b.label}
                  aria-label={b.label}
                  className={`h-8 w-8 rounded-lg border-2 transition-transform hover:scale-110 ${bgId === b.id ? "border-[var(--text)] scale-110" : "border-transparent"}`}
                  style={{ background: b.css === "none" ? "var(--surface-2)" : b.css, backgroundColor: "var(--surface-2)" }}
                />
              ))}
            </div>
            <p className="mt-2 text-center text-[11px] text-muted">{current.label}</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={toggleDark}
        className="surface flex h-9 w-9 items-center justify-center rounded-full border shadow-sm hover:bg-[var(--surface-2)]"
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        aria-pressed={dark}
        title="Toggle light / dark"
      >
        <span aria-hidden>{mounted ? (dark ? "☀️" : "🌙") : "🌓"}</span>
      </button>
    </div>
  );
}
