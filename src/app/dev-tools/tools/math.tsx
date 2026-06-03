"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── Scientific Calculator ── */
export function ScientificCalc() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const calc = () => {
    try {
      const safe = expr.replace(/[^0-9+\-*/().%^ eMathsqrtlognpisinfloorceilroundabsmaxminpow]/g,"");
      // Replace common math functions
      const sanitized = expr
        .replace(/\^/g,"**")
        .replace(/√/g,"Math.sqrt")
        .replace(/\bsqrt\b/g,"Math.sqrt")
        .replace(/\blog\b/g,"Math.log10")
        .replace(/\bln\b/g,"Math.log")
        .replace(/\bsin\b/g,"Math.sin")
        .replace(/\bcos\b/g,"Math.cos")
        .replace(/\btan\b/g,"Math.tan")
        .replace(/\bpi\b/gi,"Math.PI")
        .replace(/\be\b/g,"Math.E")
        .replace(/\babs\b/g,"Math.abs")
        .replace(/\bfloor\b/g,"Math.floor")
        .replace(/\bceil\b/g,"Math.ceil")
        .replace(/\bround\b/g,"Math.round");
      // eslint-disable-next-line no-new-func
      const r = new Function(`"use strict"; return (${sanitized})`)();
      const res = typeof r==="number"&&!isNaN(r)?r.toPrecision(10).replace(/\.?0+$/,""):"⚠ Error";
      setResult(res);
      setHistory(h=>[`${expr} = ${res}`,...h.slice(0,9)]);
    } catch { setResult("⚠ Syntax error"); }
  };
  const BTNS = ["7","8","9","÷","4","5","6","×","1","2","3","-","0",".","=","+","(",")","^","√","sin","cos","tan","log","ln","π","e","C","⌫"];
  const press = (b:string) => {
    if(b==="C"){setExpr("");setResult("");return;}
    if(b==="⌫"){setExpr(e=>e.slice(0,-1));return;}
    if(b==="="){calc();return;}
    const map: Record<string,string> = {"÷":"/","×":"*","π":"pi","√":"sqrt(","sin":"sin(","cos":"cos(","tan":"tan(","log":"log(","ln":"ln("};
    setExpr(e=>e+(map[b]||b));
  };
  return (
    <ToolWrap>
      <div className="surface rounded-2xl border p-4 mb-3">
        <input className="input-field w-full font-mono text-right text-lg mb-1" value={expr} onChange={e=>setExpr(e.target.value)} onKeyDown={e=>e.key==="Enter"&&calc()} placeholder="Expression…" />
        <div className="text-right font-mono text-2xl font-bold text-brand-600">{result}</div>
      </div>
      <div className="grid grid-cols-7 gap-1.5 mb-3">
        {BTNS.map(b=>(
          <button key={b} onClick={()=>press(b)} className={`rounded-xl border py-2 text-sm font-medium transition-colors ${b==="="?"bg-brand-600 text-white border-brand-600 hover:bg-brand-700":b==="C"?"bg-red-100 text-red-700 dark:bg-red-900/30 hover:bg-red-200":"surface hover:border-brand-400"}`}>{b}</button>
        ))}
      </div>
      {history.length>0&&(
        <div className="space-y-1 max-h-28 overflow-auto">
          {history.map((h,i)=><div key={i} className="text-xs text-muted font-mono cursor-pointer hover:text-[var(--text)]" onClick={()=>setExpr(h.split("=")[0].trim())}>{h}</div>)}
        </div>
      )}
    </ToolWrap>
  );
}

/* ── Number Base Converter ── */
export function BaseConverter() {
  const [value, setValue] = useState("255");
  const [fromBase, setFromBase] = useState(10);
  const n = parseInt(value, fromBase);
  const valid = !isNaN(n) && isFinite(n);
  const BASES = [{b:2,l:"Binary"},{b:8,l:"Octal"},{b:10,l:"Decimal"},{b:16,l:"Hex"},{b:32,l:"Base32"},{b:36,l:"Base36"}];
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-4">
        <input className="input-field flex-1 font-mono" value={value} onChange={e=>setValue(e.target.value)} placeholder="Enter number…" />
        <select className="input-field w-36" value={fromBase} onChange={e=>setFromBase(+e.target.value)}>
          {BASES.map(b=><option key={b.b} value={b.b}>From {b.l} ({b.b})</option>)}
        </select>
      </div>
      {valid ? (
        <div className="space-y-2">
          {BASES.map(({b,l})=>(
            <div key={b} className="surface flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer hover:border-brand-400" onClick={()=>{setValue(n.toString(b).toUpperCase());setFromBase(b);}}>
              <span className="text-xs text-muted w-20 shrink-0">{l} ({b})</span>
              <span className="font-mono flex-1 text-sm">{n.toString(b).toUpperCase()}</span>
              <CopyBtn text={n.toString(b).toUpperCase()} />
            </div>
          ))}
        </div>
      ) : value&&<p className="text-sm text-red-500">⚠ Invalid number for base {fromBase}</p>}
    </ToolWrap>
  );
}

/* ── Unit Converters ── */
const UNIT_SYSTEMS = {
  length: {
    base: "meters", units: [
      {n:"Millimeter",s:"mm",f:0.001},{n:"Centimeter",s:"cm",f:0.01},{n:"Meter",s:"m",f:1},
      {n:"Kilometer",s:"km",f:1000},{n:"Inch",s:"in",f:0.0254},{n:"Foot",s:"ft",f:0.3048},
      {n:"Yard",s:"yd",f:0.9144},{n:"Mile",s:"mi",f:1609.344},{n:"Nautical Mile",s:"nmi",f:1852},
      {n:"Light Year",s:"ly",f:9.461e15},
    ]
  },
  weight: {
    base: "kg", units: [
      {n:"Milligram",s:"mg",f:1e-6},{n:"Gram",s:"g",f:0.001},{n:"Kilogram",s:"kg",f:1},
      {n:"Metric Ton",s:"t",f:1000},{n:"Ounce",s:"oz",f:0.028350},{n:"Pound",s:"lb",f:0.453592},
      {n:"Stone",s:"st",f:6.35029},{n:"US Ton",s:"ton",f:907.185},{n:"UK Ton",s:"ukt",f:1016.05},
    ]
  },
  temperature: {
    base: "celsius", units: [
      {n:"Celsius",s:"°C",toBase:(v:number)=>v,fromBase:(v:number)=>v},
      {n:"Fahrenheit",s:"°F",toBase:(v:number)=>(v-32)*5/9,fromBase:(v:number)=>v*9/5+32},
      {n:"Kelvin",s:"K",toBase:(v:number)=>v-273.15,fromBase:(v:number)=>v+273.15},
      {n:"Rankine",s:"°R",toBase:(v:number)=>(v-491.67)*5/9,fromBase:(v:number)=>v*9/5+491.67},
    ]
  },
  data: {
    base: "bytes", units: [
      {n:"Bit",s:"bit",f:0.125},{n:"Byte",s:"B",f:1},{n:"Kilobyte",s:"KB",f:1024},
      {n:"Megabyte",s:"MB",f:1048576},{n:"Gigabyte",s:"GB",f:1073741824},{n:"Terabyte",s:"TB",f:1.099511628e12},
      {n:"Petabyte",s:"PB",f:1.125899907e15},{n:"Exabyte",s:"EB",f:1.152921505e18},
    ]
  },
  speed: {
    base: "m/s", units: [
      {n:"m/s",s:"m/s",f:1},{n:"km/h",s:"km/h",f:1/3.6},{n:"mph",s:"mph",f:0.44704},
      {n:"knot",s:"kn",f:0.514444},{n:"ft/s",s:"ft/s",f:0.3048},{n:"Mach",s:"Ma",f:340.29},
      {n:"Speed of Light",s:"c",f:299792458},
    ]
  },
} as const;

type UnitSystemKey = keyof typeof UNIT_SYSTEMS;

function hasF(u: {n:string;s:string;f?:number;toBase?:(v:number)=>number;fromBase?:(v:number)=>number}): u is {n:string;s:string;f:number} { return "f" in u && u.f !== undefined; }
function hasTemp(u: {n:string;s:string;f?:number;toBase?:(v:number)=>number;fromBase?:(v:number)=>number}): u is {n:string;s:string;toBase:(v:number)=>number;fromBase:(v:number)=>number} { return "toBase" in u; }

export function UnitConverter({ type }: { type: UnitSystemKey }) {
  const sys = UNIT_SYSTEMS[type];
  const units = sys.units as readonly {n:string;s:string;f?:number;toBase?:(v:number)=>number;fromBase?:(v:number)=>number}[];
  const [value, setValue] = useState("1");
  const [fromUnit, setFromUnit] = useState(units[0].s);
  const n = parseFloat(value);
  const fromU = units.find(u=>u.s===fromUnit)!;
  const toBase = isNaN(n) ? NaN : hasTemp(fromU) ? fromU.toBase(n) : hasF(fromU) ? n * fromU.f : NaN;
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-4">
        <input className="input-field flex-1 font-mono" type="number" value={value} onChange={e=>setValue(e.target.value)} placeholder="Value…" />
        <select className="input-field w-40" value={fromUnit} onChange={e=>setFromUnit(e.target.value)}>
          {units.map(u=><option key={u.s} value={u.s}>{u.n}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        {units.filter(u=>u.s!==fromUnit).map(u=>{
          const converted = isNaN(toBase) ? "—" : hasTemp(u) ? u.fromBase(toBase).toPrecision(7).replace(/\.?0+$/,"") : hasF(u) ? (toBase/u.f).toPrecision(7).replace(/\.?0+$/,"") : "—";
          return (
            <div key={u.s} className="surface flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer hover:border-brand-400" onClick={()=>{setValue(String(converted));setFromUnit(u.s);}}>
              <span className="text-xs text-muted w-32 shrink-0">{u.n} ({u.s})</span>
              <span className="font-mono text-sm flex-1 tabular-nums">{converted}</span>
              <CopyBtn text={String(converted)} />
            </div>
          );
        })}
      </div>
    </ToolWrap>
  );
}

/* ── Percentage Calculator ── */
export function PercentageCalc() {
  const calcs = [
    {label:"X% of Y",inputs:["X","Y"],calc:(v:number[])=>`${(v[0]/100*v[1]).toFixed(4)} (${v[0]}% of ${v[1]})`},
    {label:"X is what % of Y",inputs:["X","Y"],calc:(v:number[])=>`${(v[0]/v[1]*100).toFixed(4)}%`},
    {label:"% change from X to Y",inputs:["X (from)","Y (to)"],calc:(v:number[])=>{const c=(v[1]-v[0])/v[0]*100;return`${c>=0?"+":""}${c.toFixed(4)}%`;}},
    {label:"X% increase/decrease of Y",inputs:["X (%)","Y"],calc:(v:number[])=>`${(v[1]*(1+v[0]/100)).toFixed(4)} (+${v[0]}%)  /  ${(v[1]*(1-v[0]/100)).toFixed(4)} (-${v[0]}%)`},
    {label:"X after Y% discount",inputs:["X (original)","Y (%)"],calc:(v:number[])=>`${(v[0]*(1-v[1]/100)).toFixed(4)} (save ${(v[0]*v[1]/100).toFixed(4)})`},
  ];
  const [vals, setVals] = useState<number[][]>(calcs.map(()=>[0,0]));
  return (
    <ToolWrap>
      <div className="space-y-4">
        {calcs.map((c,ci)=>(
          <div key={c.label} className="surface rounded-xl border p-4">
            <p className="text-xs font-semibold text-muted mb-2">{c.label}</p>
            <div className="flex gap-2 flex-wrap">
              {c.inputs.map((l,i)=>(
                <label key={l} className="flex items-center gap-1.5 text-sm"><span className="text-muted">{l}</span><input type="number" className="input-field w-28" value={vals[ci][i]} onChange={e=>setVals(vals.map((v,j)=>j===ci?v.map((x,k)=>k===i?+e.target.value:x):v))} /></label>
              ))}
            </div>
            <p className="mt-2 font-mono text-sm font-bold text-brand-600">{c.calc(vals[ci])}</p>
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Statistics Calculator ── */
export function StatisticsCalc() {
  const [input, setInput] = useState("12, 7, 3, 14, 6, 11, 5, 8");
  const nums = input.split(/[,\s\n]+/).map(Number).filter(n=>!isNaN(n));
  const n = nums.length;
  if (n === 0) return <ToolWrap><textarea className="input-area h-16" placeholder="Enter numbers separated by commas or spaces…" value={input} onChange={e=>setInput(e.target.value)} /></ToolWrap>;
  const sorted = [...nums].sort((a,b)=>a-b);
  const mean = nums.reduce((a,b)=>a+b,0)/n;
  const median = n%2===0?(sorted[n/2-1]+sorted[n/2])/2:sorted[Math.floor(n/2)];
  const freq = nums.reduce((acc,v)=>({...acc,[v]:(acc[v]||0)+1}),{} as Record<number,number>);
  const maxFreq = Math.max(...Object.values(freq));
  const mode = Object.entries(freq).filter(([,f])=>f===maxFreq).map(([v])=>+v);
  const variance = nums.reduce((a,v)=>a+(v-mean)**2,0)/n;
  const std = Math.sqrt(variance);
  const range = sorted[n-1]-sorted[0];
  const q1 = sorted[Math.floor(n/4)];
  const q3 = sorted[Math.floor(3*n/4)];
  const stats = [["Count",n],["Sum",nums.reduce((a,b)=>a+b,0).toPrecision(8)],["Mean",mean.toPrecision(8)],["Median",median],["Mode",mode.join(", ")],["Std Dev",std.toPrecision(6)],["Variance",variance.toPrecision(6)],["Min",sorted[0]],["Max",sorted[n-1]],["Range",range],["Q1",q1],["Q3",q3],["IQR",q3-q1]];
  return (
    <ToolWrap>
      <textarea className="input-area h-16 mb-3" placeholder="Enter numbers separated by commas…" value={input} onChange={e=>setInput(e.target.value)} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(([l,v])=>(
          <div key={String(l)} className="surface rounded-xl border p-3 text-center">
            <div className="font-bold text-base tabular-nums">{String(v)}</div>
            <div className="text-xs text-muted">{l}</div>
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Loan Calculator ── */
export function LoanCalc() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(30);
  const r = rate/100/12, n = years*12;
  const monthly = principal*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
  const total = monthly*n;
  const interest = total-principal;
  const fmtUSD = (n:number)=>n.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2});
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        {([["Principal ($)",principal,setPrincipal,1000,10000000,1000],["Annual Rate (%)",rate,setRate,0.1,30,0.1],["Term (years)",years,setYears,1,50,1]] as [string,number,(n:number)=>void,number,number,number][]).map(([l,v,set,min,max,step])=>(
          <label key={String(l)} className="text-sm">
            <span className="text-xs text-muted block mb-1">{l}</span>
            <input type="number" className="input-field w-full" value={Number(v)} min={Number(min)} max={Number(max)} step={Number(step)} onChange={e=>(set as (n:number)=>void)(+e.target.value)} />
          </label>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[["Monthly Payment",fmtUSD(monthly),"text-brand-600"],["Total Payment",fmtUSD(total),""],["Total Interest",fmtUSD(interest),"text-red-500"]].map(([l,v,c])=>(
          <div key={String(l)} className="surface rounded-xl border p-4 text-center">
            <div className={`text-xl font-black tabular-nums ${c}`}>{v}</div>
            <div className="text-xs text-muted mt-1">{l}</div>
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── GCD / LCM ── */
export function GcdLcm() {
  const [a, setA] = useState(48);
  const [b, setB] = useState(18);
  const gcd = (x:number,y:number):number=>y===0?x:gcd(y,x%y);
  const g = gcd(Math.abs(a),Math.abs(b));
  const l = (Math.abs(a)*Math.abs(b))/g;
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-4">
        <input type="number" className="input-field flex-1" value={a} onChange={e=>setA(+e.target.value)} />
        <span className="text-muted mt-2">and</span>
        <input type="number" className="input-field flex-1" value={b} onChange={e=>setB(+e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[["GCD (HCF)",g,"Greatest Common Divisor"],["LCM",l,"Least Common Multiple"]].map(([l,v,d])=>(
          <div key={String(l)} className="surface rounded-xl border p-4 text-center">
            <div className="text-3xl font-black tabular-nums text-brand-600">{v}</div>
            <div className="text-xs font-semibold mt-1">{l}</div>
            <div className="text-[10px] text-muted">{d}</div>
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Compound Interest ── */
export function CompoundInterest() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(10);
  const [freq, setFreq] = useState(12);
  const A = principal * Math.pow(1 + rate/100/freq, freq*years);
  const gain = A - principal;
  const FREQS = [[1,"Annually"],[4,"Quarterly"],[12,"Monthly"],[365,"Daily"]];
  const fmtUSD = (n:number)=>n.toLocaleString("en-US",{style:"currency",currency:"USD"});
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        {([["Principal ($)",principal,setPrincipal],["Annual Rate (%)",rate,setRate],["Years",years,setYears]] as [string,number,(n:number)=>void][]).map(([l,v,set])=>(
          <label key={String(l)} className="text-sm"><span className="text-xs text-muted block mb-1">{l}</span><input type="number" className="input-field w-full" value={Number(v)} min={0} onChange={e=>(set as (n:number)=>void)(+e.target.value)} /></label>
        ))}
        <label className="text-sm"><span className="text-xs text-muted block mb-1">Compounding</span>
          <select className="input-field w-full" value={freq} onChange={e=>setFreq(+e.target.value)}>
            {FREQS.map(([v,l])=><option key={String(v)} value={Number(v)}>{l}</option>)}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[["Final Amount",fmtUSD(A),"text-green-600"],["Principal",fmtUSD(principal),""],["Gained",fmtUSD(gain),"text-brand-600"]].map(([l,v,c])=>(
          <div key={String(l)} className="surface rounded-xl border p-4 text-center">
            <div className={`text-lg font-black tabular-nums ${c}`}>{v}</div>
            <div className="text-xs text-muted mt-1">{l}</div>
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}
