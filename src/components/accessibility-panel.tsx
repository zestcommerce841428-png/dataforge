"use client";
import { useEffect, useRef, useState, useCallback } from "react";

type Prefs = {
  fontScale: number;
  spacing: boolean;
  contrast: boolean;
  links: boolean;
  dyslexia: boolean;
  motion: boolean;
  cursor: boolean;
  guide: boolean;
};

const DEFAULTS: Prefs = {
  fontScale: 1, spacing: false, contrast: false, links: false,
  dyslexia: false, motion: false, cursor: false, guide: false,
};

const KEY = "df-a11y";

function applyPrefs(p: Prefs) {
  const el = document.documentElement;
  el.style.setProperty("--a11y-font-scale", String(p.fontScale));
  const set = (name: string, on: boolean) =>
    on ? el.setAttribute(name, "1") : el.removeAttribute(name);
  set("data-a11y-spacing", p.spacing);
  set("data-a11y-contrast", p.contrast);
  set("data-a11y-links", p.links);
  set("data-a11y-dyslexia", p.dyslexia);
  set("data-a11y-motion", p.motion);
  set("data-a11y-cursor", p.cursor);
}

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const guideRef = useRef<HTMLDivElement | null>(null);

  // Restore prefs on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = { ...DEFAULTS, ...JSON.parse(raw) } as Prefs;
        setPrefs(p);
        applyPrefs(p);
      }
    } catch {}
  }, []);

  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      applyPrefs(next);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // Reading guide ruler follows the pointer
  useEffect(() => {
    if (!prefs.guide) {
      guideRef.current?.remove();
      guideRef.current = null;
      return;
    }
    const bar = document.createElement("div");
    bar.className = "a11y-reading-guide";
    document.body.appendChild(bar);
    guideRef.current = bar;
    const move = (e: MouseEvent) => { bar.style.top = `${e.clientY}px`; };
    window.addEventListener("mousemove", move);
    return () => { window.removeEventListener("mousemove", move); bar.remove(); };
  }, [prefs.guide]);

  const reset = () => {
    setPrefs(DEFAULTS);
    applyPrefs(DEFAULTS);
    try { localStorage.removeItem(KEY); } catch {}
  };

  const Toggle = ({ k, label, icon }: { k: keyof Prefs; label: string; icon: string }) => (
    <button
      onClick={() => update({ [k]: !prefs[k] } as Partial<Prefs>)}
      aria-pressed={!!prefs[k]}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm text-left transition-colors ${prefs[k] ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface hover:border-brand-400"}`}
    >
      <span aria-hidden className="text-base">{icon}</span>
      <span className="flex-1">{label}</span>
      <span className={`text-xs ${prefs[k] ? "" : "text-muted"}`}>{prefs[k] ? "On" : "Off"}</span>
    </button>
  );

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 left-4 z-50 grid h-12 w-12 place-items-center rounded-full border border-app bg-brand-600 text-white shadow-lg hover:bg-brand-700"
        aria-label="Accessibility and language options"
        aria-expanded={open}
        title="Accessibility & language"
      >
        <span aria-hidden className="text-xl">♿</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-label="Accessibility and language"
            className="surface fixed bottom-20 left-4 z-50 w-[min(92vw,340px)] max-h-[78vh] overflow-auto rounded-2xl border p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">Accessibility</h2>
              <button onClick={reset} className="text-xs text-brand-600 hover:underline">Reset all</button>
            </div>

            {/* Font size */}
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">Text size</span>
                <span className="text-muted">{Math.round(prefs.fontScale * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => update({ fontScale: Math.max(0.8, +(prefs.fontScale - 0.1).toFixed(2)) })} className="surface h-9 w-9 rounded-lg border text-lg font-bold">A−</button>
                <input type="range" min={0.8} max={1.6} step={0.1} value={prefs.fontScale} onChange={(e) => update({ fontScale: +e.target.value })} className="flex-1" aria-label="Text size" />
                <button onClick={() => update({ fontScale: Math.min(1.6, +(prefs.fontScale + 0.1).toFixed(2)) })} className="surface h-9 w-9 rounded-lg border text-lg font-bold">A+</button>
              </div>
            </div>

            <div className="grid gap-2">
              <Toggle k="contrast" label="High contrast" icon="◑" />
              <Toggle k="spacing" label="More text spacing" icon="↕" />
              <Toggle k="links" label="Highlight links" icon="🔗" />
              <Toggle k="dyslexia" label="Dyslexia-friendly font" icon="🔤" />
              <Toggle k="motion" label="Reduce motion" icon="🛑" />
              <Toggle k="cursor" label="Large cursor" icon="🖱" />
              <Toggle k="guide" label="Reading guide" icon="📏" />
            </div>

            <p className="mt-4 border-t border-[var(--border)] pt-3 text-[11px] text-muted">
              🌐 To translate the site, use the country/flag switcher in the header.
            </p>
          </div>
        </>
      )}
    </>
  );
}
