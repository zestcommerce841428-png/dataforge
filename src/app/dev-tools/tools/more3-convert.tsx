"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

function Grid({ rows }: { rows: [string, string][] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {rows.map(([l, v]) => (
        <div key={l} className="relative surface rounded-xl border p-3 text-center"><div className="font-mono text-base font-bold text-brand-600">{v}</div><div className="text-xs text-muted">{l}</div><CopyBtn text={v} absolute /></div>
      ))}
    </div>
  );
}

/* ── Cooking Converter ── */
export function CookingConverter() {
  const [val, setVal] = useState(1), [unit, setUnit] = useState("cup");
  // base: milliliters
  const toMl: Record<string, number> = { cup: 236.588, tbsp: 14.787, tsp: 4.929, ml: 1, "fl-oz": 29.574, pint: 473.176, liter: 1000 };
  const ml = val * toMl[unit];
  const rows: [string, string][] = [["Cups", (ml / toMl.cup).toFixed(2)], ["Tbsp", (ml / toMl.tbsp).toFixed(1)], ["Tsp", (ml / toMl.tsp).toFixed(1)], ["mL", ml.toFixed(0)], ["Fl oz", (ml / toMl["fl-oz"]).toFixed(2)], ["Pints", (ml / toMl.pint).toFixed(2)]];
  return (
    <ToolWrap>
      <div className="mb-4 flex gap-2"><input type="number" step="any" className="input-field flex-1" value={val} onChange={(e) => setVal(+e.target.value)} /><select className="input-field" value={unit} onChange={(e) => setUnit(e.target.value)}>{Object.keys(toMl).map((u) => <option key={u} value={u}>{u}</option>)}</select></div>
      <Grid rows={rows} />
      <p className="mt-2 text-xs text-muted">Volume only — for flour/sugar weight varies by ingredient.</p>
    </ToolWrap>
  );
}

/* ── Shoe Size Converter ── */
const SHOE: { us: number; uk: number; eu: number; cm: number }[] = [
  { us: 6, uk: 5.5, eu: 39, cm: 24 }, { us: 7, uk: 6.5, eu: 40, cm: 25 }, { us: 8, uk: 7.5, eu: 41, cm: 26 },
  { us: 9, uk: 8.5, eu: 42.5, cm: 27 }, { us: 10, uk: 9.5, eu: 44, cm: 28 }, { us: 11, uk: 10.5, eu: 45, cm: 29 }, { us: 12, uk: 11.5, eu: 46, cm: 30 },
];
export function ShoeSizeConverter() {
  const [us, setUs] = useState(9);
  const row = SHOE.reduce((a, b) => Math.abs(b.us - us) < Math.abs(a.us - us) ? b : a);
  return <ToolWrap><label className="mb-4 block text-sm">US men&apos;s size<input type="number" step="0.5" className="input-field mt-1 w-full" value={us} onChange={(e) => setUs(+e.target.value)} /></label><Grid rows={[["US", String(row.us)], ["UK", String(row.uk)], ["EU", String(row.eu)], ["Foot (cm)", String(row.cm)]]} /></ToolWrap>;
}

/* ── Ring Size Converter ── */
export function RingSizeConverter() {
  const [mm, setMm] = useState(17.3);
  const us = (mm * 1.5 - 11.5).toFixed(1);
  const uk = String.fromCharCode(65 + Math.round((mm - 12) * 2));
  const eu = (mm * Math.PI).toFixed(1);
  return <ToolWrap><label className="mb-4 block text-sm">Inner diameter (mm)<input type="number" step="0.1" className="input-field mt-1 w-full" value={mm} onChange={(e) => setMm(+e.target.value)} /></label><Grid rows={[["US", us], ["UK", uk], ["EU", eu], ["Circumf. mm", (mm * Math.PI).toFixed(1)]]} /></ToolWrap>;
}

/* ── Fuel Economy Converter ── */
export function FuelEconomyConverter() {
  const [val, setVal] = useState(15), [unit, setUnit] = useState("kmpl");
  let l100: number;
  if (unit === "kmpl") l100 = 100 / val; else if (unit === "mpg") l100 = 235.215 / val; else l100 = val;
  const rows: [string, string][] = [["km/L", (100 / l100).toFixed(2)], ["L/100km", l100.toFixed(2)], ["MPG (US)", (235.215 / l100).toFixed(1)], ["MPG (UK)", (282.481 / l100).toFixed(1)]];
  return <ToolWrap><div className="mb-4 flex gap-2"><input type="number" step="any" className="input-field flex-1" value={val} onChange={(e) => setVal(+e.target.value)} /><select className="input-field" value={unit} onChange={(e) => setUnit(e.target.value)}><option value="kmpl">km/L</option><option value="l100">L/100km</option><option value="mpg">MPG (US)</option></select></div><Grid rows={rows} /></ToolWrap>;
}

/* ── Pressure Converter ── */
export function PressureConverter() {
  const [val, setVal] = useState(1), [unit, setUnit] = useState("bar");
  const toPa: Record<string, number> = { bar: 100000, psi: 6894.76, atm: 101325, kpa: 1000, mmhg: 133.322 };
  const pa = val * toPa[unit];
  return <ToolWrap><div className="mb-4 flex gap-2"><input type="number" step="any" className="input-field flex-1" value={val} onChange={(e) => setVal(+e.target.value)} /><select className="input-field" value={unit} onChange={(e) => setUnit(e.target.value)}>{Object.keys(toPa).map((u) => <option key={u} value={u}>{u}</option>)}</select></div><Grid rows={[["bar", (pa / toPa.bar).toFixed(3)], ["psi", (pa / toPa.psi).toFixed(2)], ["atm", (pa / toPa.atm).toFixed(3)], ["kPa", (pa / toPa.kpa).toFixed(2)], ["mmHg", (pa / toPa.mmhg).toFixed(1)]]} /></ToolWrap>;
}

/* ── Energy Converter ── */
export function EnergyConverter() {
  const [val, setVal] = useState(1), [unit, setUnit] = useState("kwh");
  const toJ: Record<string, number> = { j: 1, kj: 1000, cal: 4.184, kcal: 4184, kwh: 3600000, btu: 1055.06, wh: 3600 };
  const j = val * toJ[unit];
  return <ToolWrap><div className="mb-4 flex gap-2"><input type="number" step="any" className="input-field flex-1" value={val} onChange={(e) => setVal(+e.target.value)} /><select className="input-field" value={unit} onChange={(e) => setUnit(e.target.value)}>{Object.keys(toJ).map((u) => <option key={u} value={u}>{u}</option>)}</select></div><Grid rows={[["Joule", j.toFixed(0)], ["kJ", (j / 1000).toFixed(2)], ["kcal", (j / 4184).toFixed(2)], ["kWh", (j / 3600000).toFixed(4)], ["BTU", (j / 1055.06).toFixed(2)]]} /></ToolWrap>;
}

/* ── Power Converter ── */
export function PowerConverter() {
  const [val, setVal] = useState(100), [unit, setUnit] = useState("hp");
  const toW: Record<string, number> = { w: 1, kw: 1000, hp: 745.7, ps: 735.5, btuh: 0.293071 };
  const w = val * toW[unit];
  return <ToolWrap><div className="mb-4 flex gap-2"><input type="number" step="any" className="input-field flex-1" value={val} onChange={(e) => setVal(+e.target.value)} /><select className="input-field" value={unit} onChange={(e) => setUnit(e.target.value)}>{Object.keys(toW).map((u) => <option key={u} value={u}>{u}</option>)}</select></div><Grid rows={[["Watt", w.toFixed(0)], ["kW", (w / 1000).toFixed(3)], ["HP", (w / 745.7).toFixed(2)], ["PS", (w / 735.5).toFixed(2)]]} /></ToolWrap>;
}

/* ── Oven Temperature ── */
export function OvenTempConverter() {
  const [c, setC] = useState(180);
  const f = c * 9 / 5 + 32;
  const gas = Math.max(1, Math.round((c - 135) / 14) + 1);
  const desc = c < 150 ? "Cool" : c < 180 ? "Moderate" : c < 220 ? "Hot" : "Very hot";
  return <ToolWrap><label className="mb-4 block text-sm">Celsius (°C)<input type="number" className="input-field mt-1 w-full" value={c} onChange={(e) => setC(+e.target.value)} /></label><Grid rows={[["°C", c.toString()], ["°F", f.toFixed(0)], ["Gas mark", String(gas)], ["Description", desc]]} /></ToolWrap>;
}

/* ── Paper Size Reference ── */
export function PaperSizeReference() {
  const sizes: [string, string, string][] = [["A0", "841 × 1189", "33.1 × 46.8"], ["A1", "594 × 841", "23.4 × 33.1"], ["A2", "420 × 594", "16.5 × 23.4"], ["A3", "297 × 420", "11.7 × 16.5"], ["A4", "210 × 297", "8.27 × 11.7"], ["A5", "148 × 210", "5.83 × 8.27"], ["A6", "105 × 148", "4.13 × 5.83"], ["Letter", "216 × 279", "8.5 × 11"], ["Legal", "216 × 356", "8.5 × 14"]];
  return <ToolWrap><div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left text-muted"><th className="py-1">Size</th><th>mm</th><th>inches</th></tr></thead><tbody>{sizes.map(([n, mm, inch]) => <tr key={n} className="border-t border-[var(--border)]"><td className="py-1.5 font-semibold">{n}</td><td className="font-mono">{mm}</td><td className="font-mono">{inch}</td></tr>)}</tbody></table></div></ToolWrap>;
}
