"use client";

import { useState, useMemo } from "react";

/* ─── 1. Break-Even Calculator ────────────────────────────────────────── */
export function BreakEvenCalculator() {
  const [fixedCost, setFixedCost] = useState("10000");
  const [varCost, setVarCost] = useState("20");
  const [price, setPrice] = useState("50");

  const fc = parseFloat(fixedCost) || 0;
  const vc = parseFloat(varCost) || 0;
  const sp = parseFloat(price) || 0;
  const contribution = sp - vc;
  const breakEvenUnits = contribution > 0 ? Math.ceil(fc / contribution) : null;
  const breakEvenRevenue = breakEvenUnits ? breakEvenUnits * sp : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Fixed Costs ($)", fixedCost, setFixedCost], ["Variable Cost / unit ($)", varCost, setVarCost], ["Selling Price / unit ($)", price, setPrice]].map(([label, val, set]) => (
          <div key={label as string}>
            <label className="mb-1 block text-sm font-medium">{label as string}</label>
            <input type="number" min={0} value={val as string} onChange={(e) => (set as (v: string) => void)(e.target.value)}
              className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-app bg-[var(--surface-2)] p-4 text-center">
          <p className="text-xs text-muted">Contribution Margin</p>
          <p className="mt-1 text-2xl font-black text-brand-600">${contribution.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-app bg-[var(--surface-2)] p-4 text-center">
          <p className="text-xs text-muted">Break-Even Units</p>
          <p className="mt-1 text-2xl font-black text-brand-600">{breakEvenUnits?.toLocaleString() ?? "∞"}</p>
        </div>
        <div className="rounded-xl border border-app bg-[var(--surface-2)] p-4 text-center">
          <p className="text-xs text-muted">Break-Even Revenue</p>
          <p className="mt-1 text-2xl font-black text-brand-600">${breakEvenRevenue?.toLocaleString() ?? "∞"}</p>
        </div>
      </div>
      {contribution <= 0 && <p className="text-sm text-red-500">⚠️ Selling price must be greater than variable cost.</p>}
    </div>
  );
}

/* ─── 2. Stock Profit/Loss Calculator ────────────────────────────────── */
export function StockProfitLoss() {
  const [shares, setShares] = useState("100");
  const [buyPrice, setBuyPrice] = useState("50");
  const [sellPrice, setSellPrice] = useState("75");
  const [brokerage, setBrokerage] = useState("0.1");

  const s = parseFloat(shares) || 0;
  const bp = parseFloat(buyPrice) || 0;
  const sp = parseFloat(sellPrice) || 0;
  const br = parseFloat(brokerage) || 0;

  const invested = s * bp;
  const proceeds = s * sp;
  const brokerageFee = (invested + proceeds) * (br / 100);
  const pnl = proceeds - invested - brokerageFee;
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {[["Shares", shares, setShares], ["Buy Price ($)", buyPrice, setBuyPrice],
          ["Sell Price ($)", sellPrice, setSellPrice], ["Brokerage (%)", brokerage, setBrokerage]].map(([l,v,s]) => (
          <div key={l as string}>
            <label className="mb-1 block text-sm font-medium">{l as string}</label>
            <input type="number" min={0} step="any" value={v as string} onChange={(e) => (s as (v: string)=>void)(e.target.value)}
              className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-app bg-[var(--surface-2)] p-4">
          <p className="text-xs text-muted">Total Invested</p>
          <p className="text-xl font-bold">${invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-xl border border-app bg-[var(--surface-2)] p-4">
          <p className="text-xs text-muted">Brokerage Fee</p>
          <p className="text-xl font-bold">${brokerageFee.toFixed(2)}</p>
        </div>
        <div className={`rounded-xl border p-4 col-span-full sm:col-span-2 ${pnl >= 0 ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"}`}>
          <p className={`text-xs ${pnl >= 0 ? "text-green-600" : "text-red-500"}`}>Profit / Loss</p>
          <p className={`text-3xl font-black ${pnl >= 0 ? "text-green-600" : "text-red-500"}`}>
            {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── 3. Dollar Cost Averaging Calculator ────────────────────────────── */
export function DcaCalculator() {
  const [assetPrice, setAssetPrice] = useState("100");
  const [monthlyInvest, setMonthlyInvest] = useState("200");
  const [months, setMonths] = useState("12");
  const [appreciation, setAppreciation] = useState("5");

  const periods = parseInt(months) || 1;
  const invest = parseFloat(monthlyInvest) || 0;
  const apr = parseFloat(appreciation) || 0;
  const initPrice = parseFloat(assetPrice) || 1;
  const monthlyRate = apr / 100 / 12;

  const rows = useMemo(() => {
    let totalInvested = 0;
    let totalUnits = 0;
    const r: { month: number; price: number; units: number; totalInvested: number; value: number }[] = [];
    for (let m = 1; m <= Math.min(periods, 60); m++) {
      const price = initPrice * Math.pow(1 + monthlyRate, m - 1);
      const units = invest / price;
      totalInvested += invest;
      totalUnits += units;
      const value = totalUnits * price;
      r.push({ month: m, price, units, totalInvested, value });
    }
    return r;
  }, [periods, invest, monthlyRate, initPrice]);

  const last = rows[rows.length - 1];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {[["Asset price ($)", assetPrice, setAssetPrice], ["Monthly investment ($)", monthlyInvest, setMonthlyInvest],
          ["Months", months, setMonths], ["Annual appreciation (%)", appreciation, setAppreciation]].map(([l,v,s]) => (
          <div key={l as string}>
            <label className="mb-1 block text-sm font-medium">{l as string}</label>
            <input type="number" min={0} step="any" value={v as string} onChange={(e) => (s as (v:string)=>void)(e.target.value)}
              className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" />
          </div>
        ))}
      </div>
      {last && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-app bg-[var(--surface-2)] p-4 text-center">
            <p className="text-xs text-muted">Total Invested</p>
            <p className="text-xl font-bold text-brand-600">${last.totalInvested.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-app bg-[var(--surface-2)] p-4 text-center">
            <p className="text-xs text-muted">Portfolio Value</p>
            <p className="text-xl font-bold text-green-600">${last.value.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-app bg-[var(--surface-2)] p-4 text-center">
            <p className="text-xs text-muted">Gain</p>
            <p className="text-xl font-bold text-green-600">+${(last.value - last.totalInvested).toFixed(2)}</p>
          </div>
        </div>
      )}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-app">
          <table className="w-full text-xs">
            <thead className="bg-[var(--surface-2)]">
              <tr>
                {["Month","Price","Units Bought","Total Invested","Portfolio Value"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.month} className="border-t border-app">
                  <td className="px-3 py-1.5">{r.month}</td>
                  <td className="px-3 py-1.5">${r.price.toFixed(2)}</td>
                  <td className="px-3 py-1.5">{r.units.toFixed(4)}</td>
                  <td className="px-3 py-1.5">${r.totalInvested.toFixed(2)}</td>
                  <td className={`px-3 py-1.5 font-semibold ${r.value >= r.totalInvested ? "text-green-600" : "text-red-500"}`}>${r.value.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── 4. FIRE Calculator ─────────────────────────────────────────────── */
export function FireCalculator() {
  const [currentAge, setCurrentAge] = useState("30");
  const [currentSavings, setCurrentSavings] = useState("50000");
  const [annualExpenses, setAnnualExpenses] = useState("40000");
  const [annualSavings, setAnnualSavings] = useState("30000");
  const [returnRate, setReturnRate] = useState("7");
  const [safeWithdrawal, setSafeWithdrawal] = useState("4");

  const expenses = parseFloat(annualExpenses) || 1;
  const savings = parseFloat(annualSavings) || 0;
  const currSavings = parseFloat(currentSavings) || 0;
  const swr = parseFloat(safeWithdrawal) || 4;
  const ret = parseFloat(returnRate) || 7;
  const fireNumber = (expenses / (swr / 100));
  const monthlyRate = ret / 100 / 12;
  const monthlySavings = savings / 12;

  let balance = currSavings;
  let yearsToFire = 0;
  while (balance < fireNumber && yearsToFire < 100) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyRate) + monthlySavings;
    }
    yearsToFire++;
  }

  const fireAge = parseInt(currentAge) + yearsToFire;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Calculate when you can achieve Financial Independence, Retire Early (FIRE)</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Current age", currentAge, setCurrentAge], ["Current savings ($)", currentSavings, setCurrentSavings],
          ["Annual expenses ($)", annualExpenses, setAnnualExpenses], ["Annual savings ($)", annualSavings, setAnnualSavings],
          ["Return rate (%)", returnRate, setReturnRate], ["Safe withdrawal (%)", safeWithdrawal, setSafeWithdrawal]].map(([l,v,s]) => (
          <div key={l as string}>
            <label className="mb-1 block text-sm font-medium">{l as string}</label>
            <input type="number" min={0} step="any" value={v as string} onChange={(e) => (s as (v:string)=>void)(e.target.value)}
              className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-center dark:border-brand-900/40 dark:bg-brand-950/20">
          <p className="text-xs text-muted">FIRE Number</p>
          <p className="text-2xl font-black text-brand-600">${fireNumber.toLocaleString(undefined,{maximumFractionDigits:0})}</p>
        </div>
        <div className="rounded-xl border border-app bg-[var(--surface-2)] p-4 text-center">
          <p className="text-xs text-muted">Years to FIRE</p>
          <p className="text-2xl font-black text-green-600">{yearsToFire >= 100 ? "100+" : yearsToFire}</p>
        </div>
        <div className="rounded-xl border border-app bg-[var(--surface-2)] p-4 text-center">
          <p className="text-xs text-muted">FIRE Age</p>
          <p className="text-2xl font-black">{yearsToFire >= 100 ? "100+" : fireAge}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── 5. Invoice Generator ───────────────────────────────────────────── */
type InvoiceLine = { desc: string; qty: string; rate: string };

export function InvoiceGenerator() {
  const [from, setFrom] = useState("Your Business Name\nyour@email.com");
  const [to, setTo] = useState("Client Name\nclient@email.com");
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [due, setDue] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [lines, setLines] = useState<InvoiceLine[]>([{ desc: "Service", qty: "1", rate: "500" }]);
  const [tax, setTax] = useState("0");
  const [notes, setNotes] = useState("");

  function addLine() { setLines((p) => [...p, { desc: "", qty: "1", rate: "" }]); }
  function removeLine(i: number) { setLines((p) => p.filter((_, idx) => idx !== i)); }
  function updateLine(i: number, key: keyof InvoiceLine, val: string) {
    setLines((p) => p.map((l, idx) => idx === i ? { ...l, [key]: val } : l));
  }

  const subtotal = lines.reduce((s, l) => s + (parseFloat(l.qty) || 0) * (parseFloat(l.rate) || 0), 0);
  const taxAmt = subtotal * (parseFloat(tax) || 0) / 100;
  const total = subtotal + taxAmt;

  function print() { window.print(); }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">From</label>
          <textarea value={from} onChange={(e) => setFrom(e.target.value)} rows={3}
            className="w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Bill To</label>
          <textarea value={to} onChange={(e) => setTo(e.target.value)} rows={3}
            className="w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Invoice #", invoiceNo, setInvoiceNo], ["Date", date, setDate], ["Due Date", due, setDue]].map(([l,v,s]) => (
          <div key={l as string}>
            <label className="mb-1 block text-sm font-medium">{l as string}</label>
            <input type={l === "Date" || l === "Due Date" ? "date" : "text"} value={v as string} onChange={(e) => (s as (v:string)=>void)(e.target.value)}
              className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" />
          </div>
        ))}
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold">Line Items</p>
        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input value={l.desc} onChange={(e) => updateLine(i, "desc", e.target.value)} placeholder="Description"
                className="flex-1 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm" />
              <input value={l.qty} onChange={(e) => updateLine(i, "qty", e.target.value)} placeholder="Qty" type="number" min={0}
                className="w-16 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm" />
              <input value={l.rate} onChange={(e) => updateLine(i, "rate", e.target.value)} placeholder="Rate" type="number" min={0} step="any"
                className="w-24 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm" />
              <span className="flex w-20 items-center justify-end text-sm font-mono">
                ${((parseFloat(l.qty)||0)*(parseFloat(l.rate)||0)).toFixed(2)}
              </span>
              {lines.length > 1 && (
                <button onClick={() => removeLine(i)} className="text-red-500 hover:text-red-700" aria-label="Remove">✕</button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addLine} className="mt-2 text-sm text-brand-600 hover:underline">+ Add line</button>
      </div>
      <div className="flex justify-end gap-6 rounded-xl border border-app bg-[var(--surface-2)] p-4">
        <div className="space-y-1 text-sm text-right">
          <div className="flex gap-8">
            <span className="text-muted">Subtotal</span>
            <span className="font-mono">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex gap-8 items-center">
            <span className="text-muted">Tax (%)</span>
            <input type="number" min={0} max={100} value={tax} onChange={(e) => setTax(e.target.value)}
              className="w-16 rounded border border-app bg-[var(--bg-base)] px-2 py-1 text-right text-sm" />
          </div>
          <div className="flex gap-8 border-t border-app pt-1">
            <span className="font-semibold">Total</span>
            <span className="font-mono font-black text-brand-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      {notes && (
        <div>
          <label className="mb-1 block text-sm font-medium">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            className="w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" placeholder="Payment terms, bank details…" />
        </div>
      )}
      {!notes && <button onClick={() => setNotes(" ")} className="text-sm text-brand-600 hover:underline">+ Add notes</button>}
      <button onClick={print} className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
        🖨️ Print / Save as PDF
      </button>
    </div>
  );
}

/* ─── 6. Salary to Hourly / Rate Converter ───────────────────────────── */
export function SalaryConverter() {
  const [salary, setSalary] = useState("60000");
  const [period, setPeriod] = useState<"annual"|"monthly"|"weekly"|"daily"|"hourly">("annual");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("52");

  const hpw = parseFloat(hoursPerWeek) || 40;
  const wpy = parseFloat(weeksPerYear) || 52;
  const sal = parseFloat(salary) || 0;

  let annualUSD = sal;
  if (period === "monthly") annualUSD = sal * 12;
  else if (period === "weekly") annualUSD = sal * wpy;
  else if (period === "daily") annualUSD = sal * 5 * wpy;
  else if (period === "hourly") annualUSD = sal * hpw * wpy;

  const results = [
    { label: "Annual",  value: annualUSD },
    { label: "Monthly", value: annualUSD / 12 },
    { label: "Weekly",  value: annualUSD / wpy },
    { label: "Daily",   value: annualUSD / (wpy * 5) },
    { label: "Hourly",  value: annualUSD / (wpy * hpw) },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Amount</label>
          <input type="number" min={0} step="any" value={salary} onChange={(e) => setSalary(e.target.value)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Per</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2.5 text-sm">
            {["annual","monthly","weekly","daily","hourly"].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Hours/week</label>
          <input type="number" min={1} max={168} value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Weeks/year</label>
          <input type="number" min={1} max={52} value={weeksPerYear} onChange={(e) => setWeeksPerYear(e.target.value)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-5">
        {results.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-app bg-[var(--surface-2)] p-3 text-center">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 font-bold">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 7. Budget Tracker ──────────────────────────────────────────────── */
type BudgetItem = { id: number; name: string; budgeted: string; actual: string; category: string };
const BUDGET_CATEGORIES = ["Housing","Food","Transport","Entertainment","Health","Savings","Utilities","Other"];

export function BudgetTracker() {
  const [items, setItems] = useState<BudgetItem[]>([
    { id: 1, name: "Rent", budgeted: "1200", actual: "1200", category: "Housing" },
    { id: 2, name: "Groceries", budgeted: "400", actual: "350", category: "Food" },
    { id: 3, name: "Car payment", budgeted: "300", actual: "300", category: "Transport" },
  ]);
  const [income, setIncome] = useState("4000");

  function add() {
    setItems((p) => [...p, { id: Date.now(), name: "", budgeted: "", actual: "", category: "Other" }]);
  }
  function remove(id: number) { setItems((p) => p.filter((i) => i.id !== id)); }
  function update(id: number, key: keyof BudgetItem, val: string) {
    setItems((p) => p.map((i) => i.id === id ? { ...i, [key]: val } : i));
  }

  const totalBudgeted = items.reduce((s, i) => s + (parseFloat(i.budgeted) || 0), 0);
  const totalActual   = items.reduce((s, i) => s + (parseFloat(i.actual) || 0), 0);
  const inc = parseFloat(income) || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Monthly income ($)</label>
        <input type="number" min={0} value={income} onChange={(e) => setIncome(e.target.value)}
          className="w-32 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-app">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)]">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted">Name</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted">Category</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted">Budgeted</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted">Actual</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted">Diff</th>
              <th className="px-1 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const diff = (parseFloat(item.budgeted)||0) - (parseFloat(item.actual)||0);
              return (
                <tr key={item.id} className="border-t border-app">
                  <td className="px-4 py-1.5">
                    <input value={item.name} onChange={(e) => update(item.id, "name", e.target.value)}
                      className="w-full rounded border border-app bg-transparent px-2 py-1 text-sm" placeholder="Expense name" />
                  </td>
                  <td className="px-4 py-1.5">
                    <select value={item.category} onChange={(e) => update(item.id, "category", e.target.value)}
                      className="rounded border border-app bg-[var(--surface-2)] px-2 py-1 text-xs">
                      {BUDGET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-1.5">
                    <input type="number" value={item.budgeted} onChange={(e) => update(item.id, "budgeted", e.target.value)}
                      className="w-20 rounded border border-app bg-transparent px-2 py-1 text-sm" />
                  </td>
                  <td className="px-4 py-1.5">
                    <input type="number" value={item.actual} onChange={(e) => update(item.id, "actual", e.target.value)}
                      className="w-20 rounded border border-app bg-transparent px-2 py-1 text-sm" />
                  </td>
                  <td className={`px-4 py-1.5 font-mono text-sm font-semibold ${diff >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {diff >= 0 ? "+" : ""}{diff.toFixed(0)}
                  </td>
                  <td className="px-2 py-1.5">
                    <button onClick={() => remove(item.id)} className="text-red-500 hover:text-red-700 text-xs">✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button onClick={add} className="text-sm text-brand-600 hover:underline">+ Add expense</button>
      <div className="grid gap-4 sm:grid-cols-4">
        {[["Income", inc, "text-[var(--text)]"],
          ["Budgeted", totalBudgeted, "text-blue-600"],
          ["Actual spent", totalActual, totalActual > inc ? "text-red-500" : "text-orange-500"],
          ["Remaining", inc - totalActual, inc - totalActual >= 0 ? "text-green-600" : "text-red-500"]].map(([l,v,cls]) => (
          <div key={l as string} className="rounded-xl border border-app bg-[var(--surface-2)] p-4 text-center">
            <p className="text-xs text-muted">{l as string}</p>
            <p className={`text-xl font-black ${cls as string}`}>${(v as number).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
