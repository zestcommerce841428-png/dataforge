"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── Flexbox Playground ── */
export function FlexboxPlayground() {
  const [dir, setDir] = useState("row");
  const [justify, setJustify] = useState("flex-start");
  const [align, setAlign] = useState("stretch");
  const [wrap, setWrap] = useState("nowrap");
  const [gap, setGap] = useState(8);
  const [count, setCount] = useState(4);
  const css = `display: flex;\nflex-direction: ${dir};\njustify-content: ${justify};\nalign-items: ${align};\nflex-wrap: ${wrap};\ngap: ${gap}px;`;
  const Sel = ({ label, val, set, opts }: { label: string; val: string; set: (v: string) => void; opts: string[] }) => (
    <label className="text-sm block"><span className="text-xs text-muted block mb-1">{label}</span>
      <select className="input-field w-full" value={val} onChange={e => set(e.target.value)}>{opts.map(o => <option key={o}>{o}</option>)}</select>
    </label>
  );
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        <Sel label="flex-direction" val={dir} set={setDir} opts={["row", "row-reverse", "column", "column-reverse"]} />
        <Sel label="justify-content" val={justify} set={setJustify} opts={["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"]} />
        <Sel label="align-items" val={align} set={setAlign} opts={["stretch", "flex-start", "center", "flex-end", "baseline"]} />
        <Sel label="flex-wrap" val={wrap} set={setWrap} opts={["nowrap", "wrap", "wrap-reverse"]} />
        <label className="text-sm block"><span className="text-xs text-muted block mb-1">gap: {gap}px</span><input type="range" min={0} max={40} value={gap} onChange={e => setGap(+e.target.value)} className="w-full" /></label>
        <label className="text-sm block"><span className="text-xs text-muted block mb-1">items: {count}</span><input type="range" min={1} max={8} value={count} onChange={e => setCount(+e.target.value)} className="w-full" /></label>
      </div>
      <div className="surface-2 rounded-xl border p-3 mb-3 min-h-32" style={{ display: "flex", flexDirection: dir as React.CSSProperties["flexDirection"], justifyContent: justify, alignItems: align, flexWrap: wrap as React.CSSProperties["flexWrap"], gap }}>
        {Array.from({ length: count }, (_, i) => <div key={i} className="grid place-items-center rounded-lg bg-brand-500/20 border border-brand-400 text-brand-600 font-bold" style={{ width: 48, height: 40 + (i % 3) * 16 }}>{i + 1}</div>)}
      </div>
      <div className="relative surface rounded-xl border p-3 font-mono text-xs whitespace-pre">{css}<CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}

/* ── CSS Grid Generator ── */
export function CssGridGenerator() {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(2);
  const [gap, setGap] = useState(8);
  const css = `display: grid;\ngrid-template-columns: repeat(${cols}, 1fr);\ngrid-template-rows: repeat(${rows}, 1fr);\ngap: ${gap}px;`;
  return (
    <ToolWrap>
      <div className="flex flex-wrap gap-4 mb-4">
        <label className="text-sm">Columns: {cols}<input type="range" min={1} max={8} value={cols} onChange={e => setCols(+e.target.value)} className="block w-40" /></label>
        <label className="text-sm">Rows: {rows}<input type="range" min={1} max={6} value={rows} onChange={e => setRows(+e.target.value)} className="block w-40" /></label>
        <label className="text-sm">Gap: {gap}px<input type="range" min={0} max={40} value={gap} onChange={e => setGap(+e.target.value)} className="block w-40" /></label>
      </div>
      <div className="surface-2 rounded-xl border p-3 mb-3" style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gridTemplateRows: `repeat(${rows},1fr)`, gap }}>
        {Array.from({ length: cols * rows }, (_, i) => <div key={i} className="grid place-items-center rounded-lg bg-brand-500/20 border border-brand-400 text-brand-600 text-sm font-bold h-12">{i + 1}</div>)}
      </div>
      <div className="relative surface rounded-xl border p-3 font-mono text-xs whitespace-pre">{css}<CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}

/* ── Text Shadow Generator ── */
export function TextShadowGenerator() {
  const [x, setX] = useState(2), [y, setY] = useState(2), [blur, setBlur] = useState(4), [color, setColor] = useState("#3b82f6");
  const css = `text-shadow: ${x}px ${y}px ${blur}px ${color};`;
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-4 mb-4">
        <label className="text-sm">X: {x}<input type="range" min={-20} max={20} value={x} onChange={e => setX(+e.target.value)} className="block w-full" /></label>
        <label className="text-sm">Y: {y}<input type="range" min={-20} max={20} value={y} onChange={e => setY(+e.target.value)} className="block w-full" /></label>
        <label className="text-sm">Blur: {blur}<input type="range" min={0} max={40} value={blur} onChange={e => setBlur(+e.target.value)} className="block w-full" /></label>
        <label className="text-sm flex items-center gap-2 mt-4">Color <input type="color" value={color} onChange={e => setColor(e.target.value)} /></label>
      </div>
      <div className="surface-2 rounded-xl border p-8 mb-3 text-center text-4xl font-black" style={{ textShadow: `${x}px ${y}px ${blur}px ${color}` }}>Preview</div>
      <div className="relative surface rounded-xl border p-3 font-mono text-xs">{css}<CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}

/* ── Cubic Bezier Easing ── */
export function CubicBezier() {
  const presets: [string, number[]][] = [["ease", [.25, .1, .25, 1]], ["ease-in", [.42, 0, 1, 1]], ["ease-out", [0, 0, .58, 1]], ["ease-in-out", [.42, 0, .58, 1]], ["bounce-ish", [.68, -.55, .27, 1.55]]];
  const [p, setP] = useState([.25, .1, .25, 1]);
  const css = `transition-timing-function: cubic-bezier(${p.map(v => +v.toFixed(2)).join(", ")});`;
  const W = 200, H = 200;
  const path = `M0,${H} C${p[0] * W},${H - p[1] * H} ${p[2] * W},${H - p[3] * H} ${W},0`;
  return (
    <ToolWrap>
      <div className="flex flex-wrap gap-2 mb-3">
        {presets.map(([n, v]) => <button key={n} onClick={() => setP(v)} className="rounded-lg border surface px-3 py-1 text-xs">{n}</button>)}
      </div>
      <div className="flex gap-4 flex-wrap items-center mb-3">
        <svg width={W} height={H} className="surface-2 rounded-xl border">
          <line x1="0" y1={H} x2={W} y2="0" stroke="var(--border)" strokeDasharray="4" />
          <path d={path} fill="none" stroke="#3b82f6" strokeWidth="2" />
          <circle cx={p[0] * W} cy={H - p[1] * H} r="5" fill="#22c55e" />
          <circle cx={p[2] * W} cy={H - p[3] * H} r="5" fill="#ef4444" />
        </svg>
        <div className="grid grid-cols-2 gap-2">
          {["x1", "y1", "x2", "y2"].map((lbl, i) => (
            <label key={lbl} className="text-xs">{lbl}: {(+p[i]).toFixed(2)}<input type="range" min={i % 2 ? -1 : 0} max={i % 2 ? 2 : 1} step={0.01} value={p[i]} onChange={e => setP(pp => pp.map((v, j) => j === i ? +e.target.value : v))} className="block w-28" /></label>
          ))}
        </div>
      </div>
      <div className="relative surface rounded-xl border p-3 font-mono text-xs">{css}<CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}

/* ── Aspect Ratio Calculator ── */
export function AspectRatioCalc() {
  const [w, setW] = useState(1920), [h, setH] = useState(1080), [nw, setNw] = useState(1280);
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const g = gcd(w, h) || 1;
  const ratio = `${w / g}:${h / g}`;
  const nh = w ? Math.round(nw * h / w) : 0;
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2 mb-3">
        <label className="text-sm">Original Width<input type="number" className="input-field w-full mt-1" value={w} onChange={e => setW(+e.target.value)} /></label>
        <label className="text-sm">Original Height<input type="number" className="input-field w-full mt-1" value={h} onChange={e => setH(+e.target.value)} /></label>
      </div>
      <div className="surface rounded-xl border p-4 mb-3 text-center"><div className="text-2xl font-black text-brand-600">{ratio}</div><div className="text-xs text-muted">aspect ratio</div></div>
      <div className="surface rounded-xl border p-4">
        <p className="text-sm mb-2">Scale: at width <input type="number" className="input-field w-28 mx-1" value={nw} onChange={e => setNw(+e.target.value)} /> → height <strong className="text-brand-600">{nh}px</strong></p>
      </div>
    </ToolWrap>
  );
}

/* ── CSS Unit Converter ── */
export function CssUnitConverter() {
  const [px, setPx] = useState(16), [base, setBase] = useState(16);
  const rows: [string, string][] = [["px", px.toString()], ["rem", (px / base).toFixed(4)], ["em", (px / base).toFixed(4)], ["pt", (px * 0.75).toFixed(2)], ["%", (px / base * 100).toFixed(2)], ["vw (1080p)", (px / 1920 * 100).toFixed(3)]];
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <label className="text-sm">Pixels<input type="number" className="input-field w-full mt-1" value={px} onChange={e => setPx(+e.target.value)} /></label>
        <label className="text-sm">Root font-size (px)<input type="number" className="input-field w-full mt-1" value={base} onChange={e => setBase(+e.target.value)} /></label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {rows.map(([u, v]) => <div key={u} className="relative surface rounded-xl border p-3 text-center"><div className="text-lg font-bold tabular-nums">{v}</div><div className="text-xs text-muted">{u}</div><CopyBtn text={v} absolute /></div>)}
      </div>
    </ToolWrap>
  );
}

/* ── Color Shade Scale ── */
function hexToRgb(hex: string) { const m = hex.replace("#", "").match(/.{2}/g); return m ? m.map(x => parseInt(x, 16)) : [0, 0, 0]; }
const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
export function ColorShadeScale() {
  const [color, setColor] = useState("#3b82f6");
  const [r, g, b] = hexToRgb(color);
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const mix = (t: number) => t < 500 ? { f: (1 - t / 500), to: 255 } : { f: ((t - 500) / 450), to: 0 };
  const shades = steps.map(s => {
    const { f, to } = mix(s);
    return { step: s, hex: `#${toHex(r + (to - r) * f)}${toHex(g + (to - g) * f)}${toHex(b + (to - b) * f)}` };
  });
  return (
    <ToolWrap>
      <label className="text-sm flex items-center gap-2 mb-4">Base color <input type="color" value={color} onChange={e => setColor(e.target.value)} /> <input className="input-field w-32 font-mono" value={color} onChange={e => setColor(e.target.value)} /></label>
      <div className="space-y-1">
        {shades.map(({ step, hex }) => (
          <div key={step} className="flex items-center gap-3 rounded-lg overflow-hidden border border-[var(--border)]">
            <div className="h-9 w-20 shrink-0" style={{ background: hex }} />
            <span className="text-xs text-muted w-10">{step}</span>
            <span className="font-mono text-sm flex-1">{hex}</span>
            <CopyBtn text={hex} />
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── CSS Scrollbar Generator ── */
export function CssScrollbarGenerator() {
  const [w, setW] = useState(10), [track, setTrack] = useState("#1f2937"), [thumb, setThumb] = useState("#3b82f6"), [radius, setRadius] = useState(8);
  const css = `/* WebKit */\n::-webkit-scrollbar { width: ${w}px; height: ${w}px; }\n::-webkit-scrollbar-track { background: ${track}; }\n::-webkit-scrollbar-thumb { background: ${thumb}; border-radius: ${radius}px; }\n\n/* Firefox */\nscrollbar-width: thin;\nscrollbar-color: ${thumb} ${track};`;
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-4 mb-3">
        <label className="text-sm">Width: {w}px<input type="range" min={4} max={24} value={w} onChange={e => setW(+e.target.value)} className="block w-full" /></label>
        <label className="text-sm">Radius: {radius}px<input type="range" min={0} max={20} value={radius} onChange={e => setRadius(+e.target.value)} className="block w-full" /></label>
        <label className="text-sm flex items-center gap-2 mt-4">Track <input type="color" value={track} onChange={e => setTrack(e.target.value)} /></label>
        <label className="text-sm flex items-center gap-2 mt-4">Thumb <input type="color" value={thumb} onChange={e => setThumb(e.target.value)} /></label>
      </div>
      <div className="relative surface rounded-xl border p-3 font-mono text-xs whitespace-pre overflow-x-auto">{css}<CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}

/* ── CSS Loader / Spinner Generator ── */
export function CssLoaderGenerator() {
  const [size, setSize] = useState(40), [color, setColor] = useState("#3b82f6"), [speed, setSpeed] = useState(1);
  const css = `.loader {\n  width: ${size}px;\n  height: ${size}px;\n  border: ${Math.max(2, size / 10)}px solid ${color}33;\n  border-top-color: ${color};\n  border-radius: 50%;\n  animation: spin ${speed}s linear infinite;\n}\n@keyframes spin { to { transform: rotate(360deg); } }`;
  return (
    <ToolWrap>
      <style>{`@keyframes df-spin{to{transform:rotate(360deg)}}`}</style>
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        <label className="text-sm">Size: {size}px<input type="range" min={16} max={80} value={size} onChange={e => setSize(+e.target.value)} className="block w-full" /></label>
        <label className="text-sm">Speed: {speed}s<input type="range" min={0.3} max={3} step={0.1} value={speed} onChange={e => setSpeed(+e.target.value)} className="block w-full" /></label>
        <label className="text-sm flex items-center gap-2 mt-4">Color <input type="color" value={color} onChange={e => setColor(e.target.value)} /></label>
      </div>
      <div className="surface-2 rounded-xl border p-8 mb-3 grid place-items-center">
        <div style={{ width: size, height: size, border: `${Math.max(2, size / 10)}px solid ${color}33`, borderTopColor: color, borderRadius: "50%", animation: `df-spin ${speed}s linear infinite` }} />
      </div>
      <div className="relative surface rounded-xl border p-3 font-mono text-xs whitespace-pre overflow-x-auto">{css}<CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}
