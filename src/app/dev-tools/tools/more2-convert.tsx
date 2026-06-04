"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── Roman ↔ Number (extended w/ live both ways) handled elsewhere; here: Temperature feels-like skipped ── */

/* ── Binary / Hex / Decimal / ASCII Multi-Converter ── */
export function NumberBaseMulti() {
  const [val, setVal] = useState("255");
  const [from, setFrom] = useState(10);
  const n = parseInt(val.trim(), from);
  const valid = !isNaN(n);
  const rows: [string, string][] = valid ? [["Binary", n.toString(2)], ["Octal", n.toString(8)], ["Decimal", n.toString(10)], ["Hex", n.toString(16).toUpperCase()], ["Base36", n.toString(36)]] : [];
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3 items-end">
        <label className="text-sm flex-1">Value<input className="input-field w-full font-mono mt-1" value={val} onChange={e => setVal(e.target.value)} /></label>
        <label className="text-sm">From base<select className="input-field mt-1" value={from} onChange={e => setFrom(+e.target.value)}>{[2, 8, 10, 16, 36].map(b => <option key={b} value={b}>{b}</option>)}</select></label>
      </div>
      {valid ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {rows.map(([l, v]) => <div key={l} className="relative surface rounded-xl border p-3 text-center"><div className="font-mono text-sm font-bold text-brand-600 break-all">{v}</div><div className="text-xs text-muted mt-1">{l}</div><CopyBtn text={v} absolute /></div>)}
        </div>
      ) : <p className="text-sm text-red-500">Not a valid base-{from} number.</p>}
    </ToolWrap>
  );
}

/* ── Text ↔ Binary ── */
export function TextBinaryConverter() {
  const [text, setText] = useState("Hi"), [mode, setMode] = useState<"enc" | "dec">("enc");
  let out = "";
  try {
    if (mode === "enc") out = [...text].map(c => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" ");
    else out = text.trim().split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join("");
  } catch { out = "Error"; }
  return (
    <ToolWrap>
      <div className="flex gap-2 mb-3">{(["enc", "dec"] as const).map(m => <button key={m} onClick={() => setMode(m)} className={`rounded-lg border px-3 py-1.5 text-sm ${mode === m ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{m === "enc" ? "Text → Binary" : "Binary → Text"}</button>)}</div>
      <textarea className="input-area w-full font-mono text-sm mb-3" rows={3} value={text} onChange={e => setText(e.target.value)} />
      <div className="relative surface rounded-xl border p-3 font-mono text-sm break-all">{out}<CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── Temperature Feels-Like ── */
export function FeelsLikeCalc() {
  const [temp, setTemp] = useState(30), [humidity, setHumidity] = useState(70), [wind, setWind] = useState(10);
  // Heat index (Rothfusz) for warm, wind chill for cold
  const heatIndex = () => {
    const T = temp * 9 / 5 + 32, R = humidity;
    const hi = -42.379 + 2.04901523 * T + 10.14333127 * R - 0.22475541 * T * R - 0.00683783 * T * T - 0.05481717 * R * R + 0.00122874 * T * T * R + 0.00085282 * T * R * R - 0.00000199 * T * T * R * R;
    return (hi - 32) * 5 / 9;
  };
  const windChill = () => { const v = wind; return 13.12 + 0.6215 * temp - 11.37 * Math.pow(v, 0.16) + 0.3965 * temp * Math.pow(v, 0.16); };
  const feels = temp >= 27 ? heatIndex() : temp <= 10 && wind > 4.8 ? windChill() : temp;
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        <label className="text-sm">Temp (°C)<input type="number" className="input-field w-full mt-1" value={temp} onChange={e => setTemp(+e.target.value)} /></label>
        <label className="text-sm">Humidity (%)<input type="number" className="input-field w-full mt-1" value={humidity} onChange={e => setHumidity(+e.target.value)} /></label>
        <label className="text-sm">Wind (km/h)<input type="number" className="input-field w-full mt-1" value={wind} onChange={e => setWind(+e.target.value)} /></label>
      </div>
      <div className="surface rounded-xl border p-6 text-center">
        <div className="text-4xl font-black text-brand-600">{feels.toFixed(1)}°C</div>
        <div className="text-sm text-muted mt-2">feels like {temp >= 27 ? "(heat index)" : temp <= 10 ? "(wind chill)" : "(actual)"}</div>
      </div>
    </ToolWrap>
  );
}

/* ── BMI Calculator ── */
export function BmiCalculator() {
  const [weight, setWeight] = useState(70), [height, setHeight] = useState(175);
  const bmi = height ? weight / ((height / 100) ** 2) : 0;
  const cat = bmi < 18.5 ? ["Underweight", "text-blue-500"] : bmi < 25 ? ["Normal", "text-green-600"] : bmi < 30 ? ["Overweight", "text-amber-500"] : ["Obese", "text-red-500"];
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <label className="text-sm">Weight (kg)<input type="number" className="input-field w-full mt-1" value={weight} onChange={e => setWeight(+e.target.value)} /></label>
        <label className="text-sm">Height (cm)<input type="number" className="input-field w-full mt-1" value={height} onChange={e => setHeight(+e.target.value)} /></label>
      </div>
      <div className="surface rounded-xl border p-6 text-center">
        <div className="text-4xl font-black text-brand-600">{bmi.toFixed(1)}</div>
        <div className={`text-lg font-bold mt-1 ${cat[1]}`}>{cat[0]}</div>
        <div className="text-xs text-muted mt-2">Healthy range: 18.5 – 24.9</div>
      </div>
    </ToolWrap>
  );
}

/* ── Area & Volume (Geometry) ── */
export function GeometryCalc() {
  const [shape, setShape] = useState("circle");
  const [a, setA] = useState(5), [b, setB] = useState(3), [c, setC] = useState(4);
  const compute = (): [string, string][] => {
    switch (shape) {
      case "circle": return [["Area", (Math.PI * a * a).toFixed(3)], ["Circumference", (2 * Math.PI * a).toFixed(3)]];
      case "rectangle": return [["Area", (a * b).toFixed(3)], ["Perimeter", (2 * (a + b)).toFixed(3)], ["Diagonal", Math.hypot(a, b).toFixed(3)]];
      case "triangle": { const s = (a + b + c) / 2; const area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c))); return [["Area (Heron)", area.toFixed(3)], ["Perimeter", (a + b + c).toFixed(3)]]; }
      case "sphere": return [["Volume", (4 / 3 * Math.PI * a ** 3).toFixed(3)], ["Surface area", (4 * Math.PI * a * a).toFixed(3)]];
      case "cylinder": return [["Volume", (Math.PI * a * a * b).toFixed(3)], ["Surface area", (2 * Math.PI * a * (a + b)).toFixed(3)]];
      case "cube": return [["Volume", (a ** 3).toFixed(3)], ["Surface area", (6 * a * a).toFixed(3)], ["Diagonal", (a * Math.sqrt(3)).toFixed(3)]];
      default: return [];
    }
  };
  const labels: Record<string, string[]> = { circle: ["radius"], rectangle: ["width", "height"], triangle: ["side a", "side b", "side c"], sphere: ["radius"], cylinder: ["radius", "height"], cube: ["edge"] };
  const fields = labels[shape];
  const setters = [setA, setB, setC], vals = [a, b, c];
  return (
    <ToolWrap>
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.keys(labels).map(s => <button key={s} onClick={() => setShape(s)} className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${shape === s ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{s}</button>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        {fields.map((f, i) => <label key={f} className="text-sm capitalize">{f}<input type="number" className="input-field w-full mt-1" value={vals[i]} onChange={e => setters[i](+e.target.value)} /></label>)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {compute().map(([l, v]) => <div key={l} className="relative surface rounded-xl border p-3 text-center"><div className="text-lg font-bold tabular-nums text-brand-600">{v}</div><div className="text-xs text-muted">{l}</div><CopyBtn text={v} absolute /></div>)}
      </div>
    </ToolWrap>
  );
}

/* ── Fraction ↔ Decimal ── */
function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : a; }
export function FractionConverter() {
  const [mode, setMode] = useState<"d2f" | "f2d">("d2f");
  const [dec, setDec] = useState("0.75"), [num, setNum] = useState("3"), [den, setDen] = useState("4");
  let out = "";
  if (mode === "d2f") {
    const d = parseFloat(dec);
    if (Number.isFinite(d)) {
      const denom = 1000000; let n = Math.round(d * denom), dn = denom;
      const g = gcd(Math.abs(n), dn) || 1; n /= g; dn /= g;
      out = `${n}/${dn}` + (dn === 1 ? " (whole)" : "");
    }
  } else {
    const n = +num, d = +den; out = d ? (n / d).toString() : "∞ (division by zero)";
  }
  return (
    <ToolWrap>
      <div className="flex gap-2 mb-3">{(["d2f", "f2d"] as const).map(m => <button key={m} onClick={() => setMode(m)} className={`rounded-lg border px-3 py-1.5 text-sm ${mode === m ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{m === "d2f" ? "Decimal → Fraction" : "Fraction → Decimal"}</button>)}</div>
      {mode === "d2f" ? (
        <input type="number" step="any" className="input-field w-full font-mono mb-3" value={dec} onChange={e => setDec(e.target.value)} />
      ) : (
        <div className="flex items-center gap-2 mb-3"><input type="number" className="input-field w-24" value={num} onChange={e => setNum(e.target.value)} /><span className="text-2xl">/</span><input type="number" className="input-field w-24" value={den} onChange={e => setDen(e.target.value)} /></div>
      )}
      <div className="relative surface rounded-xl border p-5 text-center"><div className="text-2xl font-black text-brand-600">{out || "—"}</div><CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── Roman Numeral (live both ways) ── */
const ROMAN: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
export function RomanConverterLive() {
  const [num, setNum] = useState("2024");
  const toRoman = (n: number) => { if (n < 1 || n > 3999) return "—"; let r = ""; for (const [v, s] of ROMAN) while (n >= v) { r += s; n -= v; } return r; };
  const fromRoman = (s: string) => { let i = 0, n = 0; const up = s.toUpperCase(); for (const [v, sym] of ROMAN) while (up.startsWith(sym, i)) { n += v; i += sym.length; } return i === up.length && n ? n : null; };
  const isNum = /^\d+$/.test(num.trim());
  const result = isNum ? toRoman(+num) : (fromRoman(num.trim())?.toString() ?? "Invalid");
  return (
    <ToolWrap>
      <input className="input-field w-full font-mono text-lg mb-3" value={num} onChange={e => setNum(e.target.value)} placeholder="Number (1–3999) or Roman numeral…" />
      <div className="relative surface rounded-xl border p-6 text-center"><div className="text-3xl font-black text-brand-600 break-all">{result}</div><div className="text-xs text-muted mt-2">{isNum ? "Arabic → Roman" : "Roman → Arabic"}</div><CopyBtn text={result} absolute /></div>
    </ToolWrap>
  );
}

/* ── Angle Converter ── */
export function AngleConverter() {
  const [val, setVal] = useState("90"), [unit, setUnit] = useState("deg");
  const n = parseFloat(val);
  const toRad: Record<string, number> = { deg: Math.PI / 180, rad: 1, grad: Math.PI / 200, turn: 2 * Math.PI };
  const rad = Number.isFinite(n) ? n * toRad[unit] : NaN;
  const rows: [string, string][] = [["Degrees", (rad / toRad.deg).toFixed(4)], ["Radians", rad.toFixed(6)], ["Gradians", (rad / toRad.grad).toFixed(4)], ["Turns", (rad / toRad.turn).toFixed(6)]];
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3 items-end">
        <label className="text-sm flex-1">Value<input type="number" step="any" className="input-field w-full font-mono mt-1" value={val} onChange={e => setVal(e.target.value)} /></label>
        <label className="text-sm">Unit<select className="input-field mt-1" value={unit} onChange={e => setUnit(e.target.value)}>{["deg", "rad", "grad", "turn"].map(u => <option key={u}>{u}</option>)}</select></label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {rows.map(([l, v]) => <div key={l} className="relative surface rounded-xl border p-3 text-center"><div className="font-mono text-sm font-bold text-brand-600 break-all">{v}</div><div className="text-xs text-muted mt-1">{l}</div><CopyBtn text={v} absolute /></div>)}
      </div>
    </ToolWrap>
  );
}

/* ── Byte Size Humanizer ── */
export function ByteSizeHumanizer() {
  const [bytes, setBytes] = useState("1536000");
  const n = parseFloat(bytes);
  const fmt = (val: number, base: number, units: string[]) => {
    if (!Number.isFinite(val) || val < 0) return "—";
    let i = 0; let v = val; while (v >= base && i < units.length - 1) { v /= base; i++; }
    return `${v.toFixed(2)} ${units[i]}`;
  };
  return (
    <ToolWrap>
      <input type="number" className="input-field w-full font-mono mb-3" value={bytes} onChange={e => setBytes(e.target.value)} placeholder="Bytes…" />
      <div className="grid grid-cols-2 gap-3">
        <div className="relative surface rounded-xl border p-4 text-center"><div className="text-xl font-bold text-brand-600">{fmt(n, 1024, ["B", "KiB", "MiB", "GiB", "TiB", "PiB"])}</div><div className="text-xs text-muted mt-1">Binary (1024)</div></div>
        <div className="relative surface rounded-xl border p-4 text-center"><div className="text-xl font-bold text-green-600">{fmt(n, 1000, ["B", "KB", "MB", "GB", "TB", "PB"])}</div><div className="text-xs text-muted mt-1">Decimal (1000)</div></div>
      </div>
    </ToolWrap>
  );
}
