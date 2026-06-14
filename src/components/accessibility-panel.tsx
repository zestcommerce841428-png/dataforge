"use client";
import { useEffect, useRef, useState, useCallback } from "react";

// Advanced options — each maps to data-a11y-<id> on <html>, styled in globals.css.
const ADV: { id: string; label: string; icon: string }[] = [
  { id: "bold", label: "Bold all text", icon: "𝐁" },
  { id: "underline-links", label: "Underline links", icon: "_" },
  { id: "highlight-headings", label: "Highlight headings", icon: "🔆" },
  { id: "readable-font", label: "Readable font", icon: "🅰" },
  { id: "mono-font", label: "Monospace font", icon: "⌨" },
  { id: "serif-font", label: "Serif font", icon: "🆂" },
  { id: "left-align", label: "Left-align text", icon: "⬅" },
  { id: "justify-text", label: "Justify text", icon: "▦" },
  { id: "center-text", label: "Center text", icon: "≣" },
  { id: "no-italic", label: "Remove italics", icon: "𝘐" },
  { id: "wide-letters", label: "Wide letter spacing", icon: "↔" },
  { id: "wide-words", label: "Wide word spacing", icon: "⎵" },
  { id: "tall-lines", label: "Taller line height", icon: "≡" },
  { id: "para-spacing", label: "Paragraph spacing", icon: "¶" },
  { id: "max-legibility", label: "Max legibility", icon: "👓" },
  { id: "uppercase-headings", label: "Uppercase headings", icon: "AB" },
  { id: "big-headings", label: "Bigger headings", icon: "🅷" },
  { id: "grayscale", label: "Grayscale", icon: "◐" },
  { id: "invert", label: "Invert colours", icon: "🌗" },
  { id: "sepia", label: "Sepia tone", icon: "🟤" },
  { id: "saturate", label: "Boost saturation", icon: "🌈" },
  { id: "desaturate", label: "Mute colours", icon: "🎚" },
  { id: "dim", label: "Dim brightness", icon: "🔅" },
  { id: "warm-filter", label: "Warm / blue-light filter", icon: "🌅" },
  { id: "contrast-soft", label: "Soft contrast", icon: "◑" },
  { id: "remove-shadows", label: "Remove shadows", icon: "▤" },
  { id: "hide-images", label: "Hide images", icon: "🚫" },
  { id: "gray-images", label: "Grayscale images", icon: "🖼" },
  { id: "hide-bg", label: "Remove backgrounds", icon: "▢" },
  { id: "big-targets", label: "Bigger click targets", icon: "⬜" },
  { id: "big-inputs", label: "Bigger form fields", icon: "🔲" },
  { id: "big-checkboxes", label: "Bigger checkboxes", icon: "☑" },
  { id: "big-icons", label: "Bigger icons", icon: "🔍" },
  { id: "highlight-buttons", label: "Outline buttons", icon: "🔘" },
  { id: "highlight-forms", label: "Outline form fields", icon: "📝" },
  { id: "underline-buttons", label: "Underline buttons", icon: "‗" },
  { id: "external-link-mark", label: "Mark external links", icon: "↗" },
  { id: "focus-ring", label: "Strong focus outline", icon: "▣" },
  { id: "always-focus", label: "Always show focus", icon: "🎯" },
  { id: "hover-highlight", label: "Highlight on hover", icon: "✨" },
  { id: "highlight-paragraph", label: "Highlight paragraph", icon: "❡" },
  { id: "block-caret", label: "Visible text caret", icon: "▮" },
  { id: "zebra-tables", label: "Striped tables", icon: "🦓" },
  { id: "table-borders", label: "Table borders", icon: "▦" },
  { id: "pause-animations", label: "Pause animations", icon: "⏸" },
  { id: "tooltip-titles", label: "Bigger buttons text", icon: "🔠" },
  { id: "letter-box", label: "Reading width", icon: "▥" },
  { id: "narrow-column", label: "Narrow column", icon: "▮" },
];

type Prefs = {
  fontScale: number;
  spacing: boolean;
  contrast: boolean;
  links: boolean;
  dyslexia: boolean;
  motion: boolean;
  cursor: boolean;
  guide: boolean;
  adv: Record<string, boolean>;
};

const DEFAULTS: Prefs = {
  fontScale: 1, spacing: false, contrast: false, links: false,
  dyslexia: false, motion: false, cursor: false, guide: false, adv: {},
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
  for (const o of ADV) set(`data-a11y-${o.id}`, !!p.adv?.[o.id]);
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
    stopSpeaking();
    try { localStorage.removeItem(KEY); } catch {}
  };

  // --- Text-to-speech tools ---
  const [speaking, setSpeaking] = useState(false);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    const clean = text.trim().replace(/\s+/g, " ");
    if (!clean) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean.slice(0, 32000));
    u.rate = 1; u.pitch = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  const readSelection = () => {
    const sel = window.getSelection?.()?.toString() ?? "";
    if (sel.trim()) return speak(sel);
    const main = document.getElementById("main") ?? document.querySelector("main") ?? document.body;
    speak(main?.innerText ?? "");
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  useEffect(() => () => stopSpeaking(), []);

  const toggleAdv = (id: string) =>
    update({ adv: { ...prefs.adv, [id]: !prefs.adv?.[id] } });

  const advCount = ADV.filter((o) => prefs.adv?.[o.id]).length;

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
              <div>
                <h2 className="text-base font-bold">Accessibility</h2>
                <p className="text-[11px] text-muted">{ADV.length + 10}+ tools to personalise your experience</p>
              </div>
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

            {/* Reading tools */}
            <div className="mt-4 border-t border-[var(--border)] pt-3">
              <h3 className="mb-2 text-sm font-semibold">Reading tools</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={readSelection}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-app px-3 py-2.5 text-sm transition-colors hover:border-brand-400"
                >
                  <span aria-hidden>🔊</span> Read aloud
                </button>
                <button
                  type="button"
                  onClick={stopSpeaking}
                  disabled={!speaking}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-app px-3 py-2.5 text-sm transition-colors hover:border-brand-400 disabled:opacity-40"
                >
                  <span aria-hidden>⏹</span> Stop
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-muted">Select text first to read just that, or read the whole page.</p>
            </div>

            {/* Advanced options */}
            <div className="mt-4 border-t border-[var(--border)] pt-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Advanced <span className="text-muted">({ADV.length})</span></h3>
                {advCount > 0 && <span className="text-[11px] text-brand-600">{advCount} on</span>}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {ADV.map((o) => {
                  const on = !!prefs.adv?.[o.id];
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => toggleAdv(o.id)}
                      aria-pressed={on}
                      title={o.label}
                      className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] text-left transition-colors ${on ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface hover:border-brand-400"}`}
                    >
                      <span aria-hidden className="text-sm">{o.icon}</span>
                      <span className="flex-1 leading-tight">{o.label}</span>
                    </button>
                  );
                })}
              </div>
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
