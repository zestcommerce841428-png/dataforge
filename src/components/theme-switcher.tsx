"use client";
import { useEffect, useRef, useState } from "react";
import { THEMES, applyTheme, THEME_KEY } from "@/lib/themes";

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [themeId, setThemeId] = useState("blue");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try { const t = localStorage.getItem(THEME_KEY); if (t) setThemeId(t); } catch {}
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const choose = (id: string) => {
    const t = THEMES.find((x) => x.id === id);
    if (t) { applyTheme(t); setThemeId(id); }
  };

  const current = THEMES.find((t) => t.id === themeId);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="surface flex h-9 w-9 items-center justify-center rounded-full border shadow-sm hover:bg-[var(--surface-2)]"
        aria-label="Change colour theme"
        aria-expanded={open}
        title={`Theme: ${current?.name ?? "Custom"}`}
      >
        <span className="h-4 w-4 rounded-full border border-black/10" style={{ background: current ? `hsl(${current.h} ${current.s}% 52%)` : "#3478f6" }} />
      </button>

      {open && (
        <div className="surface absolute right-0 z-50 mt-2 w-64 rounded-2xl border p-3 shadow-2xl">
          <p className="mb-2 text-xs font-semibold text-muted">Colour theme · {THEMES.length}</p>
          <div className="grid max-h-64 grid-cols-7 gap-2 overflow-auto">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => choose(t.id)}
                title={t.name}
                aria-label={t.name}
                className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${themeId === t.id ? "border-[var(--text)] scale-110" : "border-transparent"}`}
                style={{ background: `hsl(${t.h} ${t.s}% 52%)` }}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted">{current?.name ?? "Custom"}</p>
        </div>
      )}
    </div>
  );
}
