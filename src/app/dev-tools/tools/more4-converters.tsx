"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";
import { CONV, PAIRS, convert } from "@/lib/conversions";

// Re-export the data so the dev-tools registry can build converter entries.
export { CONV, PAIRS };

export function UnitConverter({ catId, initFrom, initTo }: { catId: string; initFrom?: string; initTo?: string }) {
  const cat = CONV.find((c) => c.id === catId)!;
  const names = Object.keys(cat.units);
  const [value, setValue] = useState(1);
  const [from, setFrom] = useState(initFrom && names.includes(initFrom) ? initFrom : names[0]);
  const [to, setTo] = useState(initTo && names.includes(initTo) ? initTo : (names[1] ?? names[0]));
  const result = convert(cat, value, from, to);
  const fmt = (n: number) => Number.isFinite(n) ? (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-4 && n !== 0) ? n.toExponential(6) : +n.toFixed(6)).toString() : "—";
  return (
    <ToolWrap>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm">Value<input type="number" step="any" className="input-field mt-1 w-full" value={value} onChange={(e) => setValue(+e.target.value)} /></label>
        <label className="flex-1 text-sm">From<select className="input-field mt-1 w-full" value={from} onChange={(e) => setFrom(e.target.value)}>{names.map((n) => <option key={n}>{n}</option>)}</select></label>
        <button onClick={() => { setFrom(to); setTo(from); }} className="surface rounded-lg border px-3 py-2 text-sm" title="Swap">⇄</button>
        <label className="flex-1 text-sm">To<select className="input-field mt-1 w-full" value={to} onChange={(e) => setTo(e.target.value)}>{names.map((n) => <option key={n}>{n}</option>)}</select></label>
      </div>
      <div className="relative surface mt-3 rounded-xl border p-4 text-center">
        <div className="text-2xl font-black text-brand-600 break-all">{fmt(result)}</div>
        <div className="mt-1 text-sm text-muted">{value} {from} = {fmt(result)} {to}</div>
        <CopyBtn text={fmt(result)} absolute />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {names.filter((n) => n !== from).slice(0, 6).map((n) => (
          <div key={n} className="surface rounded-lg border px-2 py-1.5 text-center"><div className="font-mono text-sm font-semibold">{fmt(convert(cat, value, from, n))}</div><div className="text-[10px] text-muted">{n}</div></div>
        ))}
      </div>
    </ToolWrap>
  );
}
