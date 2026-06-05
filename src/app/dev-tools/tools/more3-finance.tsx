"use client";
import { useState } from "react";
import { ToolWrap } from "../ui";

const money = (v: number, cur = "₹") => cur + (Number.isFinite(v) ? v.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "0");

function Result({ rows }: { rows: [string, string, string?][] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {rows.map(([l, v, c]) => (
        <div key={l} className="surface rounded-xl border p-3 text-center">
          <div className={`text-lg font-bold tabular-nums ${c ?? "text-brand-600"}`}>{v}</div>
          <div className="text-xs text-muted">{l}</div>
        </div>
      ))}
    </div>
  );
}
function Field({ label, value, set, step = 1 }: { label: string; value: number; set: (n: number) => void; step?: number }) {
  return <label className="text-sm block">{label}<input type="number" step={step} className="input-field mt-1 w-full" value={value} onChange={(e) => set(+e.target.value)} /></label>;
}

/* ── Simple Interest ── */
export function SimpleInterestCalc() {
  const [p, setP] = useState(100000), [r, setR] = useState(7.5), [t, setT] = useState(5);
  const si = (p * r * t) / 100;
  return <ToolWrap><div className="mb-4 grid gap-3 sm:grid-cols-3"><Field label="Principal" value={p} set={setP} /><Field label="Rate % p.a." value={r} set={setR} step={0.1} /><Field label="Years" value={t} set={setT} /></div><Result rows={[["Interest", money(si)], ["Total", money(p + si), "text-green-600"]]} /></ToolWrap>;
}

/* ── Compound / SIP-style growth ── */
export function SIPCalculator() {
  const [m, setM] = useState(5000), [r, setR] = useState(12), [y, setY] = useState(10);
  const n = y * 12, i = r / 100 / 12;
  const fv = i > 0 ? m * ((Math.pow(1 + i, n) - 1) / i) * (1 + i) : m * n;
  const invested = m * n;
  return <ToolWrap><div className="mb-4 grid gap-3 sm:grid-cols-3"><Field label="Monthly SIP" value={m} set={setM} /><Field label="Return % p.a." value={r} set={setR} step={0.5} /><Field label="Years" value={y} set={setY} /></div><Result rows={[["Invested", money(invested)], ["Est. value", money(fv), "text-green-600"], ["Gains", money(fv - invested), "text-brand-600"]]} /></ToolWrap>;
}

/* ── EMI ── */
export function EMICalculator() {
  const [p, setP] = useState(1000000), [r, setR] = useState(9), [y, setY] = useState(20);
  const n = y * 12, i = r / 100 / 12;
  const emi = i > 0 ? (p * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1) : p / n;
  const total = emi * n;
  return <ToolWrap><div className="mb-4 grid gap-3 sm:grid-cols-3"><Field label="Loan amount" value={p} set={setP} /><Field label="Rate % p.a." value={r} set={setR} step={0.1} /><Field label="Tenure (yrs)" value={y} set={setY} /></div><Result rows={[["Monthly EMI", money(emi), "text-brand-600"], ["Total interest", money(total - p), "text-red-500"], ["Total payable", money(total)]]} /></ToolWrap>;
}

/* ── GST ── */
export function GSTCalculator() {
  const [amt, setAmt] = useState(1000), [rate, setRate] = useState(18), [mode, setMode] = useState<"add" | "remove">("add");
  const gst = mode === "add" ? amt * rate / 100 : amt - amt * 100 / (100 + rate);
  const net = mode === "add" ? amt : amt - gst;
  const gross = mode === "add" ? amt + gst : amt;
  return (
    <ToolWrap>
      <div className="mb-3 flex gap-2">{(["add", "remove"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={`rounded-lg border px-3 py-1.5 text-sm ${mode === m ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{m === "add" ? "Add GST" : "Remove GST"}</button>)}</div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2"><Field label="Amount" value={amt} set={setAmt} /><label className="text-sm block">GST %<select className="input-field mt-1 w-full" value={rate} onChange={(e) => setRate(+e.target.value)}>{[0, 3, 5, 12, 18, 28].map((x) => <option key={x} value={x}>{x}%</option>)}</select></label></div>
      <Result rows={[["Net", money(net)], ["GST", money(gst), "text-brand-600"], ["Gross", money(gross), "text-green-600"]]} />
      <p className="mt-2 text-xs text-muted">CGST {money(gst / 2)} + SGST {money(gst / 2)}</p>
    </ToolWrap>
  );
}

/* ── Income Tax (India, new regime FY24-25) ── */
export function IncomeTaxIndia() {
  const [income, setIncome] = useState(1200000);
  const taxable = Math.max(0, income - 75000); // standard deduction
  const slabs = [[300000, 0], [700000, 0.05], [1000000, 0.1], [1200000, 0.15], [1500000, 0.2], [Infinity, 0.3]] as [number, number][];
  let tax = 0, prev = 0;
  for (const [limit, rate] of slabs) { if (taxable > prev) { tax += (Math.min(taxable, limit) - prev) * rate; prev = limit; } else break; }
  if (taxable <= 700000) tax = 0; // 87A rebate
  const cess = tax * 0.04;
  return <ToolWrap><div className="mb-4"><Field label="Annual income (₹)" value={income} set={setIncome} /></div><Result rows={[["Taxable", money(taxable)], ["Tax", money(tax), "text-red-500"], ["+ 4% cess", money(cess)], ["Total tax", money(tax + cess), "text-brand-600"], ["Take-home", money(income - tax - cess), "text-green-600"]]} /><p className="mt-2 text-xs text-muted">New regime, FY 2024-25, incl. ₹75k standard deduction &amp; §87A rebate. Estimate only.</p></ToolWrap>;
}

/* ── Profit Margin ── */
export function ProfitMarginCalc() {
  const [cost, setCost] = useState(70), [price, setPrice] = useState(100);
  const profit = price - cost;
  const margin = price ? (profit / price) * 100 : 0;
  const markup = cost ? (profit / cost) * 100 : 0;
  return <ToolWrap><div className="mb-4 grid gap-3 sm:grid-cols-2"><Field label="Cost" value={cost} set={setCost} /><Field label="Selling price" value={price} set={setPrice} /></div><Result rows={[["Profit", money(profit, "$"), profit >= 0 ? "text-green-600" : "text-red-500"], ["Margin", margin.toFixed(1) + "%", "text-brand-600"], ["Markup", markup.toFixed(1) + "%"]]} /></ToolWrap>;
}

/* ── ROI ── */
export function ROICalculator() {
  const [invest, setInvest] = useState(10000), [ret, setRet] = useState(13000), [years, setYears] = useState(2);
  const gain = ret - invest;
  const roi = invest ? (gain / invest) * 100 : 0;
  const annualized = invest > 0 && years > 0 ? (Math.pow(ret / invest, 1 / years) - 1) * 100 : 0;
  return <ToolWrap><div className="mb-4 grid gap-3 sm:grid-cols-3"><Field label="Invested" value={invest} set={setInvest} /><Field label="Returned" value={ret} set={setRet} /><Field label="Years" value={years} set={setYears} /></div><Result rows={[["Net gain", money(gain, "$"), gain >= 0 ? "text-green-600" : "text-red-500"], ["Total ROI", roi.toFixed(1) + "%", "text-brand-600"], ["Annualized", annualized.toFixed(1) + "%"]]} /></ToolWrap>;
}

/* ── Savings Goal ── */
export function SavingsGoalCalc() {
  const [goal, setGoal] = useState(500000), [have, setHave] = useState(50000), [months, setMonths] = useState(24), [r, setR] = useState(6);
  const remaining = Math.max(0, goal - have);
  const i = r / 100 / 12;
  const monthly = i > 0 ? remaining * i / (Math.pow(1 + i, months) - 1) : remaining / months;
  return <ToolWrap><div className="mb-4 grid gap-3 sm:grid-cols-2"><Field label="Goal amount" value={goal} set={setGoal} /><Field label="Already saved" value={have} set={setHave} /><Field label="Months" value={months} set={setMonths} /><Field label="Return % p.a." value={r} set={setR} step={0.5} /></div><Result rows={[["Need to save", money(remaining)], ["Per month", money(monthly), "text-brand-600"]]} /></ToolWrap>;
}

/* ── Inflation ── */
export function InflationCalc() {
  const [amt, setAmt] = useState(100000), [rate, setRate] = useState(6), [years, setYears] = useState(10);
  const future = amt * Math.pow(1 + rate / 100, years);
  const power = amt / Math.pow(1 + rate / 100, years);
  return <ToolWrap><div className="mb-4 grid gap-3 sm:grid-cols-3"><Field label="Amount today" value={amt} set={setAmt} /><Field label="Inflation % p.a." value={rate} set={setRate} step={0.5} /><Field label="Years" value={years} set={setYears} /></div><Result rows={[["Cost in future", money(future), "text-red-500"], ["Today's value then", money(power), "text-brand-600"]]} /><p className="mt-2 text-xs text-muted">What costs {money(amt)} today will cost {money(future)} in {years} years at {rate}% inflation.</p></ToolWrap>;
}
