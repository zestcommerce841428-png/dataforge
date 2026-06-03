"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── Prime Factorization ── */
export function PrimeFactorization() {
  const [n, setN] = useState("360");
  const factorize = (num: number): number[] => {
    if (num <= 1) return [];
    const factors: number[] = [];
    let d = 2;
    while (d * d <= num) {
      while (num % d === 0) { factors.push(d); num = Math.floor(num / d); }
      d++;
    }
    if (num > 1) factors.push(num);
    return factors;
  };
  const num = parseInt(n);
  const factors = !isNaN(num) && num > 1 ? factorize(num) : [];
  const unique = [...new Set(factors)].map(p => ({ prime: p, exp: factors.filter(f => f === p).length }));
  const notation = unique.map(({prime,exp}) => exp > 1 ? `${prime}^${exp}` : String(prime)).join(" × ");
  const isPrime = factors.length === 1 && factors[0] === num;
  return (
    <ToolWrap>
      <input className="input-field w-full font-mono text-lg mb-3" type="number" min={2} max={999999999} value={n} onChange={e=>setN(e.target.value)} placeholder="Enter a number…" />
      {factors.length > 0 ? (
        <div className="space-y-3">
          {isPrime && <p className="text-sm font-semibold text-green-600">✓ {num} is a prime number</p>}
          <div className="surface rounded-xl border p-4">
            <p className="text-xs text-muted mb-2">Prime factors</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {unique.map(({prime,exp})=>(
                <span key={prime} className="rounded-lg bg-brand-100 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700 px-3 py-1.5 font-mono text-sm font-semibold text-brand-700 dark:text-brand-400">
                  {prime}{exp>1&&<sup>{exp}</sup>}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base">{num} = {notation}</span>
              <CopyBtn text={`${num} = ${notation}`} />
            </div>
          </div>
        </div>
      ) : n && <p className="text-sm text-muted">{parseInt(n) <= 1 ? "Enter a number > 1" : "Invalid input"}</p>}
    </ToolWrap>
  );
}

/* ── Fibonacci Sequence ── */
export function FibonacciSequence() {
  const [count, setCount] = useState(15);
  const [showSums, setShowSums] = useState(false);
  const fibs: bigint[] = [];
  let a = 0n, b = 1n;
  for (let i = 0; i < Math.min(count, 78); i++) { fibs.push(a); [a, b] = [b, a + b]; }
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3 flex-wrap items-center">
        <label className="text-sm flex items-center gap-2">Count: <input type="number" className="input-field w-20" min={1} max={78} value={count} onChange={e=>setCount(Math.min(78,+e.target.value))} /></label>
        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={showSums} onChange={e=>setShowSums(e.target.checked)} /> Show running sum</label>
      </div>
      <div className="max-h-64 overflow-auto space-y-1">
        {fibs.map((f, i) => (
          <div key={i} className="surface flex items-center gap-3 rounded-lg border px-3 py-1.5 text-sm">
            <span className="text-xs text-muted w-8 shrink-0">F({i})</span>
            <span className="font-mono flex-1 tabular-nums">{f.toString()}</span>
            {showSums && i > 0 && <span className="text-xs text-muted">Sum: {fibs.slice(0,i+1).reduce((s,v)=>s+v,0n).toString()}</span>}
          </div>
        ))}
      </div>
      <CopyBtn text={fibs.map(f=>f.toString()).join(", ")} />
    </ToolWrap>
  );
}

/* ── Matrix Calculator ── */
export function MatrixCalculator() {
  const [size, setSize] = useState<2|3>(2);
  const emptyMatrix = (n: number): number[][] => Array.from({length:n},()=>Array(n).fill(0));
  const [a, setA] = useState<number[][]>(emptyMatrix(2));
  const [b, setB] = useState<number[][]>(emptyMatrix(2));
  const [op, setOp] = useState<"add"|"sub"|"mul"|"det"|"trans">("mul");
  const setCell = (mat: "a"|"b", r: number, c: number, v: number) => {
    if (mat==="a") setA(m=>m.map((row,ri)=>ri===r?row.map((cell,ci)=>ci===c?v:cell):row));
    else setB(m=>m.map((row,ri)=>ri===r?row.map((cell,ci)=>ci===c?v:cell):row));
  };
  const resize = (n: 2|3) => { setSize(n); setA(emptyMatrix(n)); setB(emptyMatrix(n)); };
  const result = (() => {
    const n = size;
    if (op==="add") return a.map((row,i)=>row.map((v,j)=>v+b[i][j]));
    if (op==="sub") return a.map((row,i)=>row.map((v,j)=>v-b[i][j]));
    if (op==="mul") return Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>a[i].reduce((s,_,k)=>s+a[i][k]*b[k][j],0)));
    if (op==="trans") return Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>a[j][i]));
    if (op==="det") {
      if (n===2) return [[a[0][0]*a[1][1]-a[0][1]*a[1][0]]];
      const det3 = (m:number[][]) => m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1]) - m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0]) + m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
      return [[det3(a)]];
    }
    return [];
  })();
  const MatrixInput = ({mat,data}:{mat:"a"|"b";data:number[][]}) => (
    <table className="border-collapse text-xs mx-auto">
      {Array.from({length:size},(_,r)=>(
        <tr key={r}>
          {Array.from({length:size},(_,c)=>(
            <td key={c} className="p-0.5">
              <input type="number" className="input-field w-16 text-center font-mono text-sm" value={data[r]?.[c]??0} onChange={e=>setCell(mat,r,c,+e.target.value)} />
            </td>
          ))}
        </tr>
      ))}
    </table>
  );
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-4 flex-wrap">
        {([2,3] as const).map(n=><button key={n} onClick={()=>resize(n)} className={`rounded-lg border px-3 py-1.5 text-sm ${size===n?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{n}×{n}</button>)}
        {[["add","A+B"],["sub","A−B"],["mul","A×B"],["trans","Aᵀ"],["det","det(A)"]].map(([v,l])=>
          <button key={v} onClick={()=>setOp(v as typeof op)} className={`rounded-lg border px-3 py-1.5 text-sm font-mono ${op===v?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{l}</button>
        )}
      </div>
      <div className={`flex items-center justify-center gap-6 mb-4 ${op==="trans"||op==="det"?"":"grid grid-cols-2 sm:flex"}`}>
        <div className="text-center"><p className="text-xs text-muted mb-2 font-bold">Matrix A</p><MatrixInput mat="a" data={a} /></div>
        {op!=="trans"&&op!=="det"&&<div className="text-center"><p className="text-xs text-muted mb-2 font-bold">Matrix B</p><MatrixInput mat="b" data={b} /></div>}
      </div>
      {result.length>0&&(
        <div className="surface rounded-xl border p-4 text-center">
          <p className="text-xs text-muted mb-2 font-bold">Result</p>
          <table className="border-collapse mx-auto">
            {result.map((row,i)=>(
              <tr key={i}>{row.map((v,j)=><td key={j} className="border border-[var(--border)] px-4 py-2 font-mono text-sm">{Number.isInteger(v)?v:v.toFixed(4)}</td>)}</tr>
            ))}
          </table>
        </div>
      )}
    </ToolWrap>
  );
}

/* ── Tip Calculator ── */
export function TipCalculator() {
  const [bill, setBill] = useState(45.5);
  const [tip, setTip] = useState(18);
  const [split, setSplit] = useState(2);
  const TIPS = [10,15,18,20,25];
  const tipAmt = bill * tip / 100;
  const total = bill + tipAmt;
  const perPerson = total / split;
  const fmtUSD = (v:number)=>v.toLocaleString("en-US",{style:"currency",currency:"USD"});
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <label className="text-sm"><span className="text-xs text-muted block mb-1">Bill Amount ($)</span><input type="number" className="input-field w-full" value={bill} min={0} step={0.01} onChange={e=>setBill(+e.target.value)} /></label>
        <label className="text-sm"><span className="text-xs text-muted block mb-1">Split between</span><input type="number" className="input-field w-full" value={split} min={1} max={20} onChange={e=>setSplit(+e.target.value)} /></label>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {TIPS.map(t=><button key={t} onClick={()=>setTip(t)} className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${tip===t?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{t}%</button>)}
        <input type="number" className="input-field w-20" value={tip} min={0} max={100} onChange={e=>setTip(+e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[["Tip Amount",fmtUSD(tipAmt),""],["Total Bill",fmtUSD(total),"text-brand-600 font-black"],["Per Person",fmtUSD(perPerson),"text-green-600 font-black"]].map(([l,v,c])=>(
          <div key={String(l)} className="surface rounded-xl border p-4 text-center">
            <div className={`text-xl font-bold tabular-nums ${c}`}>{v}</div>
            <div className="text-xs text-muted mt-1">{l}</div>
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Business Days Calculator ── */
export function BusinessDaysCalc() {
  const [start, setStart] = useState(new Date().toISOString().split("T")[0]);
  const [days, setDays] = useState(10);
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
  const addBizDays = (dateStr: string, n: number) => {
    const d = new Date(dateStr);
    let count = 0;
    while (count < n) { d.setDate(d.getDate()+1); if (!isWeekend(d)) count++; }
    return d;
  };
  const countBizDays = (d1: Date, d2: Date) => {
    let count = 0;
    const cur = new Date(d1);
    while (cur <= d2) { if (!isWeekend(cur)) count++; cur.setDate(cur.getDate()+1); }
    return count;
  };
  const result = addBizDays(start, days);
  const [end, setEnd] = useState(new Date(Date.now()+30*864e5).toISOString().split("T")[0]);
  const biz = countBizDays(new Date(start), new Date(end));
  return (
    <ToolWrap>
      <div className="space-y-5">
        <div className="surface rounded-xl border p-4">
          <p className="text-sm font-semibold mb-3">Add business days to a date</p>
          <div className="flex gap-3 mb-3 flex-wrap">
            <input type="date" className="input-field flex-1" value={start} onChange={e=>setStart(e.target.value)} />
            <input type="number" className="input-field w-24" value={days} onChange={e=>setDays(+e.target.value)} min={1} />
            <span className="text-muted mt-2">business days</span>
          </div>
          <div className="surface-2 rounded-lg p-3">
            <p className="text-xs text-muted">Result</p>
            <p className="font-bold text-brand-600">{result.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
          </div>
        </div>
        <div className="surface rounded-xl border p-4">
          <p className="text-sm font-semibold mb-3">Count business days between dates</p>
          <div className="flex gap-3 flex-wrap">
            <input type="date" className="input-field flex-1" value={start} onChange={e=>setStart(e.target.value)} />
            <span className="text-muted mt-2">→</span>
            <input type="date" className="input-field flex-1" value={end} onChange={e=>setEnd(e.target.value)} />
          </div>
          <div className="mt-3 text-2xl font-black text-brand-600 text-center">{biz} business days</div>
        </div>
      </div>
    </ToolWrap>
  );
}

/* ── Discount / Markup Calculator ── */
export function DiscountCalculator() {
  const [original, setOriginal] = useState(100);
  const [discount, setDiscount] = useState(20);
  const [mode, setMode] = useState<"discount"|"markup">("discount");
  const result = mode==="discount" ? original * (1-discount/100) : original * (1+discount/100);
  const diff = Math.abs(result-original);
  const fmtUSD = (v:number)=>v.toLocaleString("en-US",{style:"currency",currency:"USD"});
  return (
    <ToolWrap>
      <div className="flex gap-2 mb-4">
        {(["discount","markup"] as const).map(m=><button key={m} onClick={()=>setMode(m)} className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${mode===m?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{m}</button>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <label className="text-sm"><span className="text-xs text-muted block mb-1">Original Price ($)</span><input type="number" className="input-field w-full" value={original} min={0} step={0.01} onChange={e=>setOriginal(+e.target.value)} /></label>
        <label className="text-sm"><span className="text-xs text-muted block mb-1">{mode==="discount"?"Discount":"Markup"} %</span><input type="number" className="input-field w-full" value={discount} min={0} max={mode==="discount"?100:999} onChange={e=>setDiscount(+e.target.value)} /></label>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[["Original",fmtUSD(original),""],["Final Price",fmtUSD(result),mode==="discount"?"text-green-600":"text-red-500"],["Difference",fmtUSD(diff),mode==="discount"?"text-red-500":"text-green-600"]].map(([l,v,c])=>(
          <div key={String(l)} className="surface rounded-xl border p-4 text-center">
            <div className={`text-xl font-bold tabular-nums ${c}`}>{v}</div>
            <div className="text-xs text-muted mt-1">{l}</div>
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}
