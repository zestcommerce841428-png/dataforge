"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── Quadratic Equation Solver ── */
export function QuadraticSolver() {
  const [a, setA] = useState(1), [b, setB] = useState(-3), [c, setC] = useState(2);
  const disc = b * b - 4 * a * c;
  let result: string;
  if (a === 0) result = b === 0 ? "Not an equation" : `x = ${(-c / b).toFixed(4)} (linear)`;
  else if (disc > 0) { const s = Math.sqrt(disc); result = `x₁ = ${((-b + s) / (2 * a)).toFixed(4)},  x₂ = ${((-b - s) / (2 * a)).toFixed(4)}`; }
  else if (disc === 0) result = `x = ${(-b / (2 * a)).toFixed(4)} (double root)`;
  else { const re = (-b / (2 * a)).toFixed(3), im = (Math.sqrt(-disc) / (2 * a)).toFixed(3); result = `x = ${re} ± ${im}i (complex)`; }
  return (
    <ToolWrap>
      <div className="flex items-center justify-center gap-2 mb-4 flex-wrap font-mono">
        <input type="number" className="input-field w-20" value={a} onChange={e => setA(+e.target.value)} /><span>x² +</span>
        <input type="number" className="input-field w-20" value={b} onChange={e => setB(+e.target.value)} /><span>x +</span>
        <input type="number" className="input-field w-20" value={c} onChange={e => setC(+e.target.value)} /><span>= 0</span>
      </div>
      <div className="surface rounded-xl border p-4 text-center">
        <div className="text-lg font-bold text-brand-600">{result}</div>
        <div className="text-xs text-muted mt-2">Discriminant Δ = {disc}</div>
      </div>
    </ToolWrap>
  );
}

/* ── Right Triangle Solver ── */
export function RightTriangleSolver() {
  const [a, setA] = useState(3), [b, setB] = useState(4);
  const c = Math.hypot(a, b);
  const area = a * b / 2, perim = a + b + c;
  const angA = Math.atan2(a, b) * 180 / Math.PI, angB = 90 - angA;
  const rows: [string, string][] = [["Hypotenuse c", c.toFixed(4)], ["Area", area.toFixed(4)], ["Perimeter", perim.toFixed(4)], ["Angle A", angA.toFixed(2) + "°"], ["Angle B", angB.toFixed(2) + "°"]];
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <label className="text-sm">Leg a<input type="number" className="input-field w-full mt-1" value={a} onChange={e => setA(+e.target.value)} /></label>
        <label className="text-sm">Leg b<input type="number" className="input-field w-full mt-1" value={b} onChange={e => setB(+e.target.value)} /></label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {rows.map(([l, v]) => <div key={l} className="surface rounded-xl border p-3 text-center"><div className="text-lg font-bold tabular-nums text-brand-600">{v}</div><div className="text-xs text-muted">{l}</div></div>)}
      </div>
    </ToolWrap>
  );
}

/* ── Permutations & Combinations ── */
function fact(n: number): number { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
export function PermutationCombination() {
  const [n, setN] = useState(10), [r, setR] = useState(3);
  const valid = n >= 0 && r >= 0 && r <= n;
  const nPr = valid ? fact(n) / fact(n - r) : NaN;
  const nCr = valid ? nPr / fact(r) : NaN;
  const fmt = (v: number) => Number.isFinite(v) ? v.toLocaleString() : "—";
  return (
    <ToolWrap>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm">n<input type="number" min={0} max={170} className="input-field w-24 ml-1" value={n} onChange={e => setN(+e.target.value)} /></label>
        <label className="text-sm">r<input type="number" min={0} className="input-field w-24 ml-1" value={r} onChange={e => setR(+e.target.value)} /></label>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[["n!", fmt(fact(n))], ["P(n,r)", fmt(nPr)], ["C(n,r)", fmt(nCr)]].map(([l, v]) => (
          <div key={l} className="relative surface rounded-xl border p-4 text-center"><div className="text-xl font-bold text-brand-600 break-all">{v}</div><div className="text-xs text-muted mt-1 font-mono">{l}</div><CopyBtn text={v} absolute /></div>
        ))}
      </div>
      {!valid && <p className="text-sm text-red-500 mt-3">Require 0 ≤ r ≤ n (and n ≤ 170 to stay finite).</p>}
    </ToolWrap>
  );
}

/* ── Ratio Simplifier ── */
export function RatioSimplifier() {
  const [a, setA] = useState(1920), [b, setB] = useState(1080);
  const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : x;
  const g = gcd(Math.abs(a), Math.abs(b)) || 1;
  return (
    <ToolWrap>
      <div className="flex items-center justify-center gap-3 mb-4">
        <input type="number" className="input-field w-28" value={a} onChange={e => setA(+e.target.value)} /><span className="text-2xl">:</span>
        <input type="number" className="input-field w-28" value={b} onChange={e => setB(+e.target.value)} />
      </div>
      <div className="relative surface rounded-xl border p-5 text-center">
        <div className="text-3xl font-black text-brand-600">{a / g} : {b / g}</div>
        <div className="text-xs text-muted mt-2">Decimal: {(b ? a / b : 0).toFixed(4)} · GCD: {g}</div>
        <CopyBtn text={`${a / g}:${b / g}`} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── Scientific Notation Converter ── */
export function ScientificNotation() {
  const [input, setInput] = useState("0.00042");
  const num = parseFloat(input);
  const sci = Number.isFinite(num) ? num.toExponential() : "—";
  const eng = (() => {
    if (!Number.isFinite(num) || num === 0) return "0";
    const exp = Math.floor(Math.log10(Math.abs(num)) / 3) * 3;
    return `${(num / 10 ** exp).toFixed(3)} × 10^${exp}`;
  })();
  return (
    <ToolWrap>
      <input className="input-field w-full font-mono mb-3" value={input} onChange={e => setInput(e.target.value)} placeholder="Enter a number…" />
      <div className="grid gap-3 sm:grid-cols-3">
        {[["Standard", Number.isFinite(num) ? num.toLocaleString("en-US", { maximumFractionDigits: 20 }) : "—"], ["Scientific", sci], ["Engineering", eng]].map(([l, v]) => (
          <div key={l} className="relative surface rounded-xl border p-3 text-center"><div className="font-mono text-sm font-bold break-all">{v}</div><div className="text-xs text-muted mt-1">{l}</div><CopyBtn text={String(v)} absolute /></div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Running Pace Calculator ── */
export function PaceCalculator() {
  const [dist, setDist] = useState(10), [min, setMin] = useState(50), [sec, setSec] = useState(0), [unit, setUnit] = useState("km");
  const totalSec = min * 60 + sec;
  const pace = dist ? totalSec / dist : 0;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
  const speed = totalSec ? (dist / (totalSec / 3600)).toFixed(2) : "0";
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <label className="text-sm">Distance<div className="flex gap-2 mt-1"><input type="number" className="input-field flex-1" value={dist} onChange={e => setDist(+e.target.value)} /><select className="input-field" value={unit} onChange={e => setUnit(e.target.value)}><option>km</option><option>mi</option></select></div></label>
        <label className="text-sm">Time (min : sec)<div className="flex gap-2 mt-1"><input type="number" className="input-field w-full" value={min} onChange={e => setMin(+e.target.value)} /><input type="number" className="input-field w-full" value={sec} onChange={e => setSec(+e.target.value)} /></div></label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="surface rounded-xl border p-4 text-center"><div className="text-2xl font-black text-brand-600">{fmt(pace)}</div><div className="text-xs text-muted">min / {unit}</div></div>
        <div className="surface rounded-xl border p-4 text-center"><div className="text-2xl font-black text-green-600">{speed}</div><div className="text-xs text-muted">{unit}/h</div></div>
      </div>
    </ToolWrap>
  );
}

/* ── Salary Converter ── */
export function SalaryConverter() {
  const [annual, setAnnual] = useState(60000), [hrs, setHrs] = useState(40), [weeks, setWeeks] = useState(52);
  const hourly = annual / (hrs * weeks);
  const rows: [string, number][] = [["Hourly", hourly], ["Daily", hourly * (hrs / 5)], ["Weekly", annual / weeks], ["Monthly", annual / 12], ["Annual", annual]];
  const fmt = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        <label className="text-sm">Annual salary ($)<input type="number" className="input-field w-full mt-1" value={annual} onChange={e => setAnnual(+e.target.value)} /></label>
        <label className="text-sm">Hours / week<input type="number" className="input-field w-full mt-1" value={hrs} onChange={e => setHrs(+e.target.value)} /></label>
        <label className="text-sm">Weeks / year<input type="number" className="input-field w-full mt-1" value={weeks} onChange={e => setWeeks(+e.target.value)} /></label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {rows.map(([l, v]) => <div key={l} className="surface rounded-xl border p-3 text-center"><div className="text-base font-bold tabular-nums text-brand-600">{fmt(v)}</div><div className="text-xs text-muted">{l}</div></div>)}
      </div>
    </ToolWrap>
  );
}

/* ── Fuel Cost Calculator ── */
export function FuelCostCalc() {
  const [dist, setDist] = useState(500), [eff, setEff] = useState(8), [price, setPrice] = useState(1.6);
  const liters = dist / 100 * eff;
  const cost = liters * price;
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        <label className="text-sm">Distance (km)<input type="number" className="input-field w-full mt-1" value={dist} onChange={e => setDist(+e.target.value)} /></label>
        <label className="text-sm">Consumption (L/100km)<input type="number" step={0.1} className="input-field w-full mt-1" value={eff} onChange={e => setEff(+e.target.value)} /></label>
        <label className="text-sm">Fuel price (/L)<input type="number" step={0.01} className="input-field w-full mt-1" value={price} onChange={e => setPrice(+e.target.value)} /></label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="surface rounded-xl border p-4 text-center"><div className="text-2xl font-black text-brand-600">{liters.toFixed(1)} L</div><div className="text-xs text-muted">fuel needed</div></div>
        <div className="surface rounded-xl border p-4 text-center"><div className="text-2xl font-black text-green-600">{cost.toFixed(2)}</div><div className="text-xs text-muted">total cost</div></div>
      </div>
    </ToolWrap>
  );
}

/* ── Bitwise Calculator ── */
export function BitwiseCalculator() {
  const [a, setA] = useState(12), [b, setB] = useState(10);
  const ops: [string, number][] = [["a AND b", a & b], ["a OR b", a | b], ["a XOR b", a ^ b], ["NOT a", ~a], ["a << 1", a << 1], ["a >> 1", a >> 1]];
  const bin = (n: number) => (n >>> 0).toString(2).padStart(8, "0");
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <label className="text-sm">a<input type="number" className="input-field w-full mt-1" value={a} onChange={e => setA(+e.target.value)} /><span className="text-xs text-muted font-mono">{bin(a)}</span></label>
        <label className="text-sm">b<input type="number" className="input-field w-full mt-1" value={b} onChange={e => setB(+e.target.value)} /><span className="text-xs text-muted font-mono">{bin(b)}</span></label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ops.map(([l, v]) => <div key={l} className="relative surface rounded-xl border p-3 text-center"><div className="text-lg font-bold text-brand-600">{v}</div><div className="text-[10px] text-muted font-mono">{bin(v)}</div><div className="text-xs text-muted mt-1 font-mono">{l}</div><CopyBtn text={String(v)} absolute /></div>)}
      </div>
    </ToolWrap>
  );
}
