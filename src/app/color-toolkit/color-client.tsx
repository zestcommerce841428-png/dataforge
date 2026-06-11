"use client";

import { useMemo, useState } from "react";

// ── Conversions ───────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const c = hex.replace("#", "");
  const full = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [parseInt(full.slice(0,2), 16), parseInt(full.slice(2,4), 16), parseInt(full.slice(4,6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hn = h / 360, sn = s / 100, ln = l / 100;
  if (sn === 0) { const v = Math.round(ln * 255); return [v, v, v]; }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue2rgb = (pp: number, qq: number, t: number) => {
    let tt = t; if (tt < 0) tt++; if (tt > 1) tt--;
    if (tt < 1/6) return pp + (qq - pp) * 6 * tt;
    if (tt < 1/2) return qq;
    if (tt < 2/3) return pp + (qq - pp) * (2/3 - tt) * 6;
    return pp;
  };
  return [Math.round(hue2rgb(p, q, hn + 1/3) * 255), Math.round(hue2rgb(p, q, hn) * 255), Math.round(hue2rgb(p, q, hn - 1/3) * 255)];
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return [0, 0, 0, 100];
  return [Math.round((1 - rn - k) / (1 - k) * 100), Math.round((1 - gn - k) / (1 - k) * 100), Math.round((1 - bn - k) / (1 - k) * 100), Math.round(k * 100)];
}

function luminance(r: number, g: number, b: number): number {
  const lin = (v: number) => { const n = v / 255; return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(l1: number, l2: number): number {
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}

// ── Color blindness simulation matrices (Brettel model approximation) ─────────
const CB_MATRICES: Record<string, number[]> = {
  Protanopia:   [0.56667, 0.43333, 0, 0.55833, 0.44167, 0, 0, 0.24167, 0.75833],
  Deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  Tritanopia:   [0.95, 0.05, 0, 0, 0.43333, 0.56667, 0, 0.475, 0.525],
  Achromatopsia:[0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
};

function simulateCB(r: number, g: number, b: number, matrix: number[]): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  return [
    Math.round(Math.min(255, Math.max(0, (matrix[0]*rn + matrix[1]*gn + matrix[2]*bn) * 255))),
    Math.round(Math.min(255, Math.max(0, (matrix[3]*rn + matrix[4]*gn + matrix[5]*bn) * 255))),
    Math.round(Math.min(255, Math.max(0, (matrix[6]*rn + matrix[7]*gn + matrix[8]*bn) * 255))),
  ];
}

// ── Palette generation ────────────────────────────────────────────────────────
function complementary(h: number, s: number, l: number): string[] {
  return [
    rgbToHex(...hslToRgb(h, s, l)),
    rgbToHex(...hslToRgb((h + 180) % 360, s, l)),
  ];
}
function triadic(h: number, s: number, l: number): string[] {
  return [0, 120, 240].map((offset) => rgbToHex(...hslToRgb((h + offset) % 360, s, l)));
}
function analogous(h: number, s: number, l: number): string[] {
  return [-30, -15, 0, 15, 30].map((offset) => rgbToHex(...hslToRgb((h + offset + 360) % 360, s, l)));
}
function shades(h: number, s: number): string[] {
  return [90, 75, 60, 45, 30, 15].map((l) => rgbToHex(...hslToRgb(h, s, l)));
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
      className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition ${copied ? "bg-green-100 text-green-700" : "surface-2 border border-app text-muted hover:text-brand-600"}`}>
      {copied ? "✓" : "Copy"}
    </button>
  );
}

function Swatch({ hex, label }: { hex: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={async () => { await navigator.clipboard.writeText(hex); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      title={`${hex} — click to copy`}
      className="flex flex-col items-center gap-1 rounded-lg overflow-hidden border border-app transition hover:scale-105"
    >
      <div className="h-12 w-12" style={{ background: hex }} />
      <span className="w-full bg-[var(--surface-2)] px-1 py-0.5 text-center font-mono text-[8px] text-muted truncate">
        {copied ? "Copied!" : (label ?? hex)}
      </span>
    </button>
  );
}

export function ColorToolkit() {
  const [hex, setHex] = useState("#3478F6");
  const [pickerColor, setPickerColor] = useState("#3478F6");

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const [r, g, b] = rgb ?? [0, 0, 0];
  const [h, s, l] = useMemo(() => rgb ? rgbToHsl(r, g, b) : [0, 0, 0], [rgb, r, g, b]);
  const [c, m, y, k] = useMemo(() => rgb ? rgbToCmyk(r, g, b) : [0, 0, 0, 0], [rgb, r, g, b]);

  const bgLum = useMemo(() => rgb ? luminance(r, g, b) : 0, [rgb, r, g, b]);
  const whiteLum = 1, blackLum = 0;
  const contrastWhite = contrastRatio(bgLum, whiteLum);
  const contrastBlack = contrastRatio(bgLum, blackLum);

  const wcagPass = (ratio: number, level: "AA" | "AAA", large = false) =>
    large ? (level === "AA" ? ratio >= 3 : ratio >= 4.5) : (level === "AA" ? ratio >= 4.5 : ratio >= 7);

  const isValid = rgb !== null;

  const handleHexInput = (v: string) => {
    setHex(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) setPickerColor(v);
  };

  const cssSnippet = isValid
    ? `/* ${hex} */\n--color: ${hex};\n--color-rgb: ${r}, ${g}, ${b};\n--color-hsl: ${h}deg ${s}% ${l}%;`
    : "";

  return (
    <div className="space-y-6">
      {/* Input row */}
      <div className="surface rounded-2xl border p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Native color picker */}
          <div className="relative">
            <input type="color" value={pickerColor}
              onChange={(e) => { setPickerColor(e.target.value); setHex(e.target.value.toUpperCase()); }}
              className="h-14 w-14 cursor-pointer rounded-xl border border-app p-1" aria-label="Color picker" />
          </div>
          {/* Hex input */}
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold text-muted">Hex</label>
            <input type="text" value={hex} onChange={(e) => handleHexInput(e.target.value)}
              className={`surface-2 w-full rounded-xl border px-3 py-2 font-mono text-sm uppercase outline-none ${isValid ? "border-app" : "border-red-400"}`}
              placeholder="#RRGGBB" aria-label="Hex color" />
          </div>
          {isValid && (
            <>
              <div className="flex-1 min-w-[120px]">
                <p className="mb-1 text-xs font-semibold text-muted">RGB</p>
                <p className="font-mono text-sm">rgb({r}, {g}, {b})</p>
              </div>
              <div className="flex-1 min-w-[140px]">
                <p className="mb-1 text-xs font-semibold text-muted">HSL</p>
                <p className="font-mono text-sm">hsl({h}, {s}%, {l}%)</p>
              </div>
            </>
          )}
        </div>
      </div>

      {!isValid && hex.trim() && <p className="text-sm text-red-500">Enter a valid hex color (e.g. #3478F6)</p>}

      {isValid && (
        <>
          {/* Conversions */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "HEX",  value: hex.toUpperCase() },
              { label: "RGB",  value: `rgb(${r}, ${g}, ${b})` },
              { label: "HSL",  value: `hsl(${h}, ${s}%, ${l}%)` },
              { label: "CMYK", value: `cmyk(${c}%, ${m}%, ${y}%, ${k}%)` },
            ].map((f) => (
              <div key={f.label} className="surface rounded-xl border p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-muted">{f.label}</span>
                  <CopyBtn value={f.value} />
                </div>
                <p className="font-mono text-sm break-all">{f.value}</p>
              </div>
            ))}
          </div>

          {/* Preview + Contrast */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Preview */}
            <section className="surface rounded-2xl border p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Preview</h2>
              <div className="space-y-3">
                {[["#FFFFFF", "#000000", "White bg"], ["#000000", "#FFFFFF", "Black bg"], [hex, "#FFFFFF", "White text"], [hex, "#000000", "Black text"]].map(([bg, fg, label]) => (
                  <div key={label} className="flex items-center justify-between gap-2 rounded-xl p-3" style={{ background: bg, color: fg }}>
                    <span className="font-semibold">{label}</span>
                    <span className="font-mono text-sm">{label.includes("text") ? hex : fg}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* WCAG Contrast */}
            <section className="surface rounded-2xl border p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">WCAG Contrast</h2>
              <div className="space-y-3">
                {[
                  { label: "vs White", ratio: contrastWhite },
                  { label: "vs Black", ratio: contrastBlack },
                ].map(({ label, ratio }) => (
                  <div key={label} className="surface-2 rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-semibold">{label}</span>
                      <span className="font-mono text-sm font-bold">{ratio.toFixed(2)}:1</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {[["AA Normal", false, false], ["AA Large", false, true], ["AAA Normal", true, false], ["AAA Large", true, true]].map(([name, aaa, large]) => {
                        const pass = wcagPass(ratio, aaa ? "AAA" : "AA", large as boolean);
                        return (
                          <span key={name as string} className={`rounded px-2 py-0.5 font-medium ${pass ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"}`}>
                            {pass ? "✓" : "✗"} {name as string}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Color blindness simulation */}
          <section className="surface rounded-2xl border p-5 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Color Blindness Simulation</h2>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="h-14 w-20 rounded-xl border border-app" style={{ background: hex }} />
                <span className="text-xs text-muted">Original</span>
              </div>
              {Object.entries(CB_MATRICES).map(([name, matrix]) => {
                const [sr, sg, sb] = simulateCB(r, g, b, matrix);
                const simHex = rgbToHex(sr, sg, sb);
                return (
                  <div key={name} className="flex flex-col items-center gap-2">
                    <div className="h-14 w-20 rounded-xl border border-app" style={{ background: simHex }} />
                    <span className="text-center text-[10px] text-muted">{name}</span>
                    <span className="font-mono text-[9px] text-muted">{simHex}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Palettes */}
          <div className="grid gap-5 lg:grid-cols-2">
            {[
              { label: "Complementary", colors: complementary(h, s, l) },
              { label: "Triadic",       colors: triadic(h, s, l) },
              { label: "Analogous",     colors: analogous(h, s, l) },
              { label: `Shades (H=${h})`, colors: shades(h, s) },
            ].map((palette) => (
              <section key={palette.label} className="surface rounded-2xl border p-4 shadow-sm">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">{palette.label}</h2>
                <div className="flex flex-wrap gap-2">
                  {palette.colors.map((c) => <Swatch key={c} hex={c} />)}
                </div>
              </section>
            ))}
          </div>

          {/* CSS snippet */}
          <section className="surface rounded-2xl border p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">CSS Variables</h2>
              <CopyBtn value={cssSnippet} />
            </div>
            <pre className="surface-2 rounded-xl border border-app p-3 font-mono text-xs leading-relaxed">{cssSnippet}</pre>
          </section>
        </>
      )}
    </div>
  );
}
