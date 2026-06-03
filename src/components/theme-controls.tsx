"use client";

import { useEffect, useState } from "react";

const BACKGROUNDS = [
  { id: "aurora", label: "Aurora" },
  { id: "sunset", label: "Sunset" },
  { id: "mesh", label: "Mesh" },
  { id: "plain", label: "Plain" },
] as const;

export function ThemeControls() {
  const [dark, setDark] = useState(false);
  const [bg, setBg] = useState<string>("aurora");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    setDark(el.classList.contains("dark"));
    setBg(el.getAttribute("data-bg") || "aurora");
    setMounted(true);
  }, []);

  function toggleDark() {
    const el = document.documentElement;
    const next = !el.classList.contains("dark");
    el.classList.toggle("dark", next);
    localStorage.setItem("df-theme", next ? "dark" : "light");
    setDark(next);
  }

  function cycleBg() {
    const idx = BACKGROUNDS.findIndex((b) => b.id === bg);
    const next = BACKGROUNDS[(idx + 1) % BACKGROUNDS.length];
    document.documentElement.setAttribute("data-bg", next.id);
    localStorage.setItem("df-bg", next.id);
    setBg(next.id);
  }

  const current = BACKGROUNDS.find((b) => b.id === bg) ?? BACKGROUNDS[0];

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={cycleBg}
        className="surface flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-[var(--surface-2)]"
        aria-label={`Change background. Current: ${current.label}`}
        title="Change background"
      >
        <span aria-hidden className="text-base">🎨</span>
        <span className="hidden sm:inline">{mounted ? current.label : "Theme"}</span>
      </button>
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
