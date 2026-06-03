/* ═══════════════════════════════════════════════════════════════════
   SHARED FORMULA ENGINE
   Pure-JS implementation of 300+ Excel-compatible functions.
   Used by both the Formula Manager and the Workbook.
═══════════════════════════════════════════════════════════════════ */

import type { CellValue, Grid } from "./types";
import { EXTRA_FUNCS } from "./extra-funcs";
import { EXTRA_FUNCS2 } from "./extra-funcs2";

export type { CellValue, Grid };

/* ── Address helpers ─────────────────────────────────────────────── */
export function colToIndex(col: string): number {
  return col.toUpperCase().split("").reduce((acc, c) => acc * 26 + c.charCodeAt(0) - 64, 0) - 1;
}
export function indexToCol(idx: number): string {
  let s = "";
  idx += 1;
  while (idx > 0) { const m = (idx - 1) % 26; s = String.fromCharCode(65 + m) + s; idx = Math.floor((idx - 1) / 26); }
  return s;
}
export function cellAddr(row: number, col: number): string {
  return `${indexToCol(col)}${row + 1}`;
}

/* ── Value coercion ──────────────────────────────────────────────── */
export const toNum = (v: CellValue): number =>
  typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) || 0 : typeof v === "boolean" ? +v : 0;
export const toBool = (v: CellValue): boolean =>
  v !== null && v !== false && v !== "FALSE" && v !== 0;
export const toStr = (v: CellValue): string =>
  v === null || v === undefined ? "" : typeof v === "boolean" ? (v ? "TRUE" : "FALSE") : String(v);
const nums = (vals: CellValue[]) => vals.map(Number).filter(v => !isNaN(v) && isFinite(v));

/* ── Reference parsing ───────────────────────────────────────────── */
export function parseCellRef(ref: string, grid: Grid): CellValue | null {
  const m = ref.toUpperCase().replace(/\$/g, "").match(/^([A-Z]+)(\d+)$/);
  if (!m) return null;
  const col = colToIndex(m[1]);
  const row = parseInt(m[2]) - 1;
  if (row < 0 || row >= grid.length || col < 0 || col >= (grid[row]?.length ?? 0)) return null;
  return grid[row][col];
}
function parseRange(range: string, grid: Grid): CellValue[] {
  const m = range.toUpperCase().replace(/\$/g, "").match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!m) return [];
  const c1 = colToIndex(m[1]), r1 = parseInt(m[2]) - 1, c2 = colToIndex(m[3]), r2 = parseInt(m[4]) - 1;
  const vals: CellValue[] = [];
  for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++)
    for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) vals.push(grid[r]?.[c] ?? null);
  return vals;
}
function parseRange2D(range: string, grid: Grid): CellValue[][] {
  const m = range.toUpperCase().replace(/\$/g, "").match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!m) return [];
  const c1 = colToIndex(m[1]), r1 = parseInt(m[2]) - 1, c2 = colToIndex(m[3]), r2 = parseInt(m[4]) - 1;
  const rows: CellValue[][] = [];
  for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
    const row: CellValue[] = [];
    for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) row.push(grid[r]?.[c] ?? null);
    rows.push(row);
  }
  return rows;
}

/* ── Core function library ───────────────────────────────────────── */
type FuncFn = (args: CellValue[][], grid: Grid, rawArgs: string[]) => CellValue;

const BASE_FUNCS: Record<string, FuncFn> = {
  // ─ Math ─
  SUM: (a,g,r)=>nums(r.flatMap(arg=>arg.includes(":")?parseRange(arg,g):[parseCellRef(arg,g)??toNum(a[0]?.[0]??0)])).reduce((s,v)=>s+v,0),
  AVERAGE: (a,g,r)=>{const n=nums(r.flatMap(arg=>arg.includes(":")?parseRange(arg,g):[parseCellRef(arg,g)??a[0]?.[0]??0]));return n.length?n.reduce((s,v)=>s+v,0)/n.length:"#DIV/0!"},
  COUNT: (a,g,r)=>r.flatMap(arg=>arg.includes(":")?parseRange(arg,g):[parseCellRef(arg,g)??a[0]?.[0]]).filter(v=>typeof v==="number"||(!isNaN(parseFloat(String(v))))).length,
  COUNTA: (a,g,r)=>r.flatMap(arg=>arg.includes(":")?parseRange(arg,g):[parseCellRef(arg,g)??a[0]?.[0]]).filter(v=>v!==null&&v!=="").length,
  MIN: (a,g,r)=>{const n=nums(r.flatMap(arg=>arg.includes(":")?parseRange(arg,g):[parseCellRef(arg,g)??a[0]?.[0]]));return n.length?Math.min(...n):"#VALUE!"},
  MAX: (a,g,r)=>{const n=nums(r.flatMap(arg=>arg.includes(":")?parseRange(arg,g):[parseCellRef(arg,g)??a[0]?.[0]]));return n.length?Math.max(...n):"#VALUE!"},
  ABS: (a)=>Math.abs(toNum(a[0]?.[0]??0)),
  ROUND: (a)=>parseFloat(toNum(a[0]?.[0]??0).toFixed(Math.max(0,toNum(a[1]?.[0]??0)))),
  ROUNDUP: (a)=>{const d=toNum(a[1]?.[0]??0);const f=Math.pow(10,d);return Math.ceil(toNum(a[0]?.[0]??0)*f)/f;},
  ROUNDDOWN: (a)=>{const d=toNum(a[1]?.[0]??0);const f=Math.pow(10,d);return Math.floor(toNum(a[0]?.[0]??0)*f)/f;},
  CEILING: (a)=>{const n=toNum(a[0]?.[0]??0),sig=toNum(a[1]?.[0]??1);return Math.ceil(n/sig)*sig;},
  FLOOR: (a)=>{const n=toNum(a[0]?.[0]??0),sig=toNum(a[1]?.[0]??1);return Math.floor(n/sig)*sig;},
  MOD: (a)=>{const n=toNum(a[0]?.[0]??0),d=toNum(a[1]?.[0]??1);return d===0?"#DIV/0!":n%d;},
  SQRT: (a)=>{const n=toNum(a[0]?.[0]??0);return n<0?"#NUM!":Math.sqrt(n);},
  POWER: (a)=>Math.pow(toNum(a[0]?.[0]??0),toNum(a[1]?.[0]??1)),
  EXP: (a)=>Math.exp(toNum(a[0]?.[0]??0)),
  LN: (a)=>{const n=toNum(a[0]?.[0]??0);return n<=0?"#NUM!":Math.log(n);},
  LOG: (a)=>{const n=toNum(a[0]?.[0]??0),base=toNum(a[1]?.[0]??10);return n<=0?"#NUM!":Math.log(n)/Math.log(base);},
  LOG10: (a)=>{const n=toNum(a[0]?.[0]??0);return n<=0?"#NUM!":Math.log10(n);},
  INT: (a)=>Math.floor(toNum(a[0]?.[0]??0)),
  FACT: (a)=>{const n=Math.abs(Math.floor(toNum(a[0]?.[0]??0)));if(n>170)return"#NUM!";let f=1;for(let i=2;i<=n;i++)f*=i;return f;},
  PI: ()=>Math.PI,
  RAND: ()=>Math.random(),
  RANDBETWEEN: (a)=>{const lo=toNum(a[0]?.[0]??0),hi=toNum(a[1]?.[0]??100);return Math.floor(Math.random()*(hi-lo+1))+lo;},
  SIN: (a)=>Math.sin(toNum(a[0]?.[0]??0)*Math.PI/180),
  COS: (a)=>Math.cos(toNum(a[0]?.[0]??0)*Math.PI/180),
  TAN: (a)=>Math.tan(toNum(a[0]?.[0]??0)*Math.PI/180),
  ASIN: (a)=>Math.asin(toNum(a[0]?.[0]??0))*180/Math.PI,
  ACOS: (a)=>Math.acos(toNum(a[0]?.[0]??0))*180/Math.PI,
  ATAN: (a)=>Math.atan(toNum(a[0]?.[0]??0))*180/Math.PI,
  ATAN2: (a)=>Math.atan2(toNum(a[0]?.[0]??0),toNum(a[1]?.[0]??0))*180/Math.PI,
  COMBIN: (a)=>{const n=toNum(a[0]?.[0]??0),k=toNum(a[1]?.[0]??0);if(k>n)return 0;let r=1;for(let i=0;i<k;i++)r=r*(n-i)/(i+1);return Math.round(r);},
  GCD: (a)=>{const g=(x:number,y:number):number=>y===0?x:g(y,x%y);return a.map(ar=>toNum(ar[0]??0)).filter(Boolean).reduce((acc,n)=>g(Math.abs(acc),Math.abs(n)),0);},
  LCM: (a)=>{const g=(x:number,y:number):number=>y===0?x:g(y,x%y);return a.map(ar=>toNum(ar[0]??0)).reduce((acc,n)=>Math.abs(acc*n)/g(Math.abs(acc),Math.abs(n)),1);},
  SUMPRODUCT: (a,g,r)=>{const arrays=r.map(arg=>arg.includes(":")?nums(parseRange(arg,g)):[toNum(parseCellRef(arg,g)??a[0]?.[0]??0)]);if(!arrays.length)return 0;return (arrays[0] as number[]).reduce((s:number,v:number,i:number)=>s+arrays.reduce((prod:number,arr:number[])=>prod*(arr[i]??0),1),0);},
  SUMIF: (a,g,r)=>{const rng=parseRange(r[0],g),crit=toStr(a[1]?.[0]??""),sumRng=r[2]?parseRange(r[2],g):rng;const m=crit.match(/^([<>=!]+)(.*)/);return rng.reduce((s:number,v,i)=>{const n=toNum(sumRng[i]??0);const c=m&&m[1]&&m[2]!=null?((op:string,val:string)=>{const nv=parseFloat(val);return op===">"?toNum(v)>nv:op==="<"?toNum(v)<nv:op===">="?toNum(v)>=nv:op==="<="?toNum(v)<=nv:op==="<>"?String(v)!==val:false;})(m[1],m[2]):String(v).toLowerCase()===crit.toLowerCase();return s+(c?n:0);},0);},
  COUNTIF: (a,g,r)=>{const rng=parseRange(r[0],g),crit=toStr(a[1]?.[0]??"");const m=crit.match(/^([<>=!]+)(.*)/);return rng.filter(v=>{if(m){const nv=parseFloat(m[2]);const op=m[1];return op===">"?toNum(v)>nv:op==="<"?toNum(v)<nv:op===">="?toNum(v)>=nv:op==="<="?toNum(v)<=nv:op==="<>"?String(v)!==m[2]:false;}return String(v).toLowerCase()===crit.toLowerCase();}).length;},
  AVERAGEIF: (a,g,r)=>{const rng=parseRange(r[0],g),crit=toStr(a[1]?.[0]??""),avgRng=r[2]?parseRange(r[2],g):rng;const matched=rng.map((v,i)=>({v,i})).filter(({v})=>String(v).toLowerCase()===crit.toLowerCase()).map(({i})=>toNum(avgRng[i]??0));return matched.length?matched.reduce((s,v)=>s+v,0)/matched.length:"#DIV/0!";},

  // ─ Text ─
  LEN: (a)=>toStr(a[0]?.[0]).length,
  LEFT: (a)=>toStr(a[0]?.[0]).slice(0,toNum(a[1]?.[0]??1)),
  RIGHT: (a)=>{const s=toStr(a[0]?.[0]),n=toNum(a[1]?.[0]??1);return s.slice(Math.max(0,s.length-n));},
  MID: (a)=>{const s=toStr(a[0]?.[0]),start=toNum(a[1]?.[0]??1)-1,num=toNum(a[2]?.[0]??1);return s.slice(start,start+num);},
  UPPER: (a)=>toStr(a[0]?.[0]).toUpperCase(),
  LOWER: (a)=>toStr(a[0]?.[0]).toLowerCase(),
  PROPER: (a)=>toStr(a[0]?.[0]).replace(/\b\w/g,c=>c.toUpperCase()),
  TRIM: (a)=>toStr(a[0]?.[0]).replace(/\s+/g," ").trim(),
  CLEAN: (a)=>toStr(a[0]?.[0]).replace(/[\x00-\x1F]/g,""),
  CONCATENATE: (a)=>a.map(ar=>toStr(ar[0])).join(""),
  CONCAT: (a,g,r)=>r.map(arg=>arg.includes(":")?parseRange(arg,g).map(toStr).join(""):toStr(a[r.indexOf(arg)]?.[0])).join(""),
  TEXTJOIN: (a,g,r)=>{const delim=toStr(a[0]?.[0]);const ignEmpty=toBool(a[1]?.[0]);const vals=r.slice(2).flatMap(arg=>arg.includes(":")?parseRange(arg,g):[a[r.indexOf(arg)]?.[0]]).map(toStr).filter(v=>!ignEmpty||v!=="");return vals.join(delim);},
  SUBSTITUTE: (a)=>toStr(a[0]?.[0]).split(toStr(a[1]?.[0])).join(toStr(a[2]?.[0])),
  REPLACE: (a)=>{const s=toStr(a[0]?.[0]);const start=toNum(a[1]?.[0]??1)-1;const num=toNum(a[2]?.[0]??0);const rep=toStr(a[3]?.[0]);return s.slice(0,start)+rep+s.slice(start+num);},
  FIND: (a)=>{const idx=toStr(a[1]?.[0]).indexOf(toStr(a[0]?.[0]),toNum(a[2]?.[0]??1)-1);return idx===-1?"#VALUE!":idx+1;},
  SEARCH: (a)=>{const idx=toStr(a[1]?.[0]).toLowerCase().indexOf(toStr(a[0]?.[0]).toLowerCase(),toNum(a[2]?.[0]??1)-1);return idx===-1?"#VALUE!":idx+1;},
  VALUE: (a)=>{const n=parseFloat(toStr(a[0]?.[0]));return isNaN(n)?"#VALUE!":n;},
  TEXT: (a)=>{const v=toNum(a[0]?.[0]??0);const fmt=toStr(a[1]?.[0]);if(fmt.includes("0.00"))return v.toFixed(2);if(fmt.includes("0%"))return Math.round(v*100)+"%";if(fmt.includes("#,##0"))return v.toLocaleString("en-US");return String(v);},
  REPT: (a)=>toStr(a[0]?.[0]).repeat(Math.max(0,toNum(a[1]?.[0]??0))),
  EXACT: (a)=>toStr(a[0]?.[0])===toStr(a[1]?.[0]),
  CHAR: (a)=>String.fromCharCode(toNum(a[0]?.[0]??0)),
  CODE: (a)=>{const s=toStr(a[0]?.[0]);return s?s.charCodeAt(0):"#VALUE!";},
  T: (a)=>typeof a[0]?.[0]==="string"?a[0][0]:"",
  FIXED: (a)=>{const n=toNum(a[0]?.[0]??0),d=toNum(a[1]?.[0]??2),noComma=toBool(a[2]?.[0]);const s=n.toFixed(d);return noComma?s:parseFloat(s).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});},

  // ─ Date & Time ─
  TODAY: ()=>new Date().toLocaleDateString("en-US"),
  NOW: ()=>new Date().toLocaleString("en-US"),
  DATE: (a)=>new Date(toNum(a[0]?.[0]),toNum(a[1]?.[0])-1,toNum(a[2]?.[0])).toLocaleDateString("en-US"),
  YEAR: (a)=>{const d=new Date(toStr(a[0]?.[0]));return isNaN(d.getTime())?"#VALUE!":d.getFullYear();},
  MONTH: (a)=>{const d=new Date(toStr(a[0]?.[0]));return isNaN(d.getTime())?"#VALUE!":d.getMonth()+1;},
  DAY: (a)=>{const d=new Date(toStr(a[0]?.[0]));return isNaN(d.getTime())?"#VALUE!":d.getDate();},
  WEEKDAY: (a)=>{const d=new Date(toStr(a[0]?.[0]));return isNaN(d.getTime())?"#VALUE!":d.getDay()+1;},
  DAYS: (a)=>{const d1=new Date(toStr(a[0]?.[0])),d2=new Date(toStr(a[1]?.[0]));return Math.round((d1.getTime()-d2.getTime())/86400000);},
  DATEDIF: (a)=>{const d1=new Date(toStr(a[0]?.[0])),d2=new Date(toStr(a[1]?.[0])),unit=toStr(a[2]?.[0]).toUpperCase();const ms=d2.getTime()-d1.getTime();if(unit==="D")return Math.floor(ms/86400000);if(unit==="M")return(d2.getFullYear()-d1.getFullYear())*12+(d2.getMonth()-d1.getMonth());if(unit==="Y")return d2.getFullYear()-d1.getFullYear();return "#VALUE!";},
  EDATE: (a)=>{const d=new Date(toStr(a[0]?.[0]));d.setMonth(d.getMonth()+toNum(a[1]?.[0]??0));return d.toLocaleDateString("en-US");},
  EOMONTH: (a)=>{const d=new Date(toStr(a[0]?.[0]));d.setMonth(d.getMonth()+toNum(a[1]?.[0]??0)+1);d.setDate(0);return d.toLocaleDateString("en-US");},

  // ─ Logical ─
  IF: (a)=>toBool(a[0]?.[0])?(a[1]?.[0]??true):(a[2]?.[0]??false),
  AND: (a)=>a.every(ar=>toBool(ar[0])),
  OR: (a)=>a.some(ar=>toBool(ar[0])),
  NOT: (a)=>!toBool(a[0]?.[0]),
  XOR: (a)=>a.filter(ar=>toBool(ar[0])).length%2===1,
  IFERROR: (a)=>{const v=a[0]?.[0];return(v===null||String(v).startsWith("#"))?a[1]?.[0]??null:v;},
  IFNA: (a)=>{const v=a[0]?.[0];return v==="#N/A"?a[1]?.[0]??null:v;},
  IFS: (a)=>{for(let i=0;i<a.length-1;i+=2){if(toBool(a[i]?.[0]))return a[i+1]?.[0];}return "#N/A";},
  SWITCH: (a)=>{const expr=a[0]?.[0];for(let i=1;i<a.length-1;i+=2){if(a[i]?.[0]===expr)return a[i+1]?.[0];}return a.length%2===0?a[a.length-1]?.[0]:"#N/A";},
  TRUE: ()=>true,
  FALSE: ()=>false,

  // ─ Lookup & Reference ─
  VLOOKUP: (a,g,r)=>{const val=a[0]?.[0],tbl=parseRange2D(r[1],g),col=toNum(a[2]?.[0]??1)-1,approx=a[3]?.[0]!==false&&a[3]?.[0]!=="FALSE"&&a[3]?.[0]!==0;for(const row of tbl){if(approx?(toNum(row[0])<=toNum(val)):(String(row[0]).toLowerCase()===String(val).toLowerCase())){if(!approx||tbl.indexOf(row)===tbl.length-1||toNum(tbl[tbl.indexOf(row)+1]?.[0])>toNum(val))return row[col]??null;}}return"#N/A";},
  HLOOKUP: (a,g,r)=>{const val=a[0]?.[0],tbl=parseRange2D(r[1],g),row=toNum(a[2]?.[0]??1)-1;const firstRow=tbl[0]||[];const col=firstRow.findIndex(c=>String(c).toLowerCase()===String(val).toLowerCase());return col===-1?"#N/A":tbl[row]?.[col]??null;},
  INDEX: (a,g,r)=>{const tbl=r[0]?.includes(":")?parseRange2D(r[0],g):[[a[0]?.[0]]];const row=toNum(a[1]?.[0]??1)-1;const col=toNum(a[2]?.[0]??1)-1;return tbl[row]?.[col]??null;},
  MATCH: (a,g,r)=>{const val=a[0]?.[0],arr=r[1]?.includes(":")?parseRange(r[1],g):[a[1]?.[0]];const idx=arr.findIndex(v=>String(v).toLowerCase()===String(val).toLowerCase());return idx===-1?"#N/A":idx+1;},
  CHOOSE: (a)=>{const idx=toNum(a[0]?.[0]??1)-1;return idx>=0&&idx<a.length-1?a[idx+1]?.[0]:"#VALUE!";},
  ROW: (a,g,r)=>{if(!r[0])return 1;const m=r[0].toUpperCase().match(/([A-Z]+)(\d+)/);return m?parseInt(m[2]):1;},
  COLUMN: (a,g,r)=>{if(!r[0])return 1;const m=r[0].toUpperCase().match(/([A-Z]+)/);return m?colToIndex(m[1])+1:1;},
  XLOOKUP: (a,g,r)=>{const val=a[0]?.[0],lookArr=r[1]?.includes(":")?parseRange(r[1],g):[a[1]?.[0]],retArr=r[2]?.includes(":")?parseRange(r[2],g):[a[2]?.[0]],notFound=a[3]?.[0]??"#N/A";const idx=lookArr.findIndex(v=>String(v).toLowerCase()===String(val).toLowerCase());return idx===-1?notFound:retArr[idx]??notFound;},

  // ─ Statistical ─
  MEDIAN: (a,g,r)=>{const n=nums(r.flatMap(arg=>arg.includes(":")?parseRange(arg,g):[a[r.indexOf(arg)]?.[0]])).sort((a,b)=>a-b);if(!n.length)return"#NUM!";const m=Math.floor(n.length/2);return n.length%2?n[m]:(n[m-1]+n[m])/2;},
  MODE: (a,g,r)=>{const n=nums(r.flatMap(arg=>arg.includes(":")?parseRange(arg,g):[a[r.indexOf(arg)]?.[0]]));if(!n.length)return"#N/A";const f=n.reduce((acc,v)=>({...acc,[v]:(acc[v]||0)+1}),{} as Record<number,number>);const max=Math.max(...Object.values(f));const mode=Object.entries(f).find(([,c])=>c===max)?.[0];return mode?parseFloat(mode):"#N/A";},
  STDEV: (a,g,r)=>{const n=nums(r.flatMap(arg=>arg.includes(":")?parseRange(arg,g):[a[r.indexOf(arg)]?.[0]]));if(n.length<2)return"#DIV/0!";const mean=n.reduce((s,v)=>s+v,0)/n.length;return Math.sqrt(n.reduce((s,v)=>s+(v-mean)**2,0)/(n.length-1));},
  STDEVP: (a,g,r)=>{const n=nums(r.flatMap(arg=>arg.includes(":")?parseRange(arg,g):[a[r.indexOf(arg)]?.[0]]));if(!n.length)return"#DIV/0!";const mean=n.reduce((s,v)=>s+v,0)/n.length;return Math.sqrt(n.reduce((s,v)=>s+(v-mean)**2,0)/n.length);},
  VAR: (a,g,r)=>{const n=nums(r.flatMap(arg=>arg.includes(":")?parseRange(arg,g):[a[r.indexOf(arg)]?.[0]]));if(n.length<2)return"#DIV/0!";const mean=n.reduce((s,v)=>s+v,0)/n.length;return n.reduce((s,v)=>s+(v-mean)**2,0)/(n.length-1);},
  PERCENTILE: (a,g,r)=>{const n=nums(parseRange(r[0],g)).sort((a,b)=>a-b);const k=toNum(a[1]?.[0]??0);const idx=k*(n.length-1);const lo=Math.floor(idx);return lo>=n.length-1?n[n.length-1]:n[lo]+(n[lo+1]-n[lo])*(idx-lo);},
  QUARTILE: (a,g,r)=>{const n=nums(parseRange(r[0],g)).sort((a,b)=>a-b);const q=toNum(a[1]?.[0]??0);if(q===0)return n[0];if(q===4)return n[n.length-1];const idx=(q/4)*(n.length-1);const lo=Math.floor(idx);return n[lo]+(n[lo+1]-n[lo])*(idx-lo);},
  RANK: (a,g,r)=>{const v=toNum(a[0]?.[0]??0),arr=nums(parseRange(r[1],g)),order=toNum(a[2]?.[0]??0);const sorted=order===0?[...arr].sort((a,b)=>b-a):[...arr].sort((a,b)=>a-b);const idx=sorted.indexOf(v);return idx===-1?"#N/A":idx+1;},
  LARGE: (a,g,r)=>{const arr=nums(parseRange(r[0],g)).sort((a,b)=>b-a);const k=toNum(a[1]?.[0]??1)-1;return k<arr.length?arr[k]:"#NUM!";},
  SMALL: (a,g,r)=>{const arr=nums(parseRange(r[0],g)).sort((a,b)=>a-b);const k=toNum(a[1]?.[0]??1)-1;return k<arr.length?arr[k]:"#NUM!";},

  // ─ Financial ─
  PMT: (a)=>{const rate=toNum(a[0]?.[0]??0),nper=toNum(a[1]?.[0]??1),pv=toNum(a[2]?.[0]??0),fv=toNum(a[3]?.[0]??0),type=toNum(a[4]?.[0]??0);if(rate===0)return-(pv+fv)/nper;const r=Math.pow(1+rate,nper);return -(rate*(pv*r+fv))/((r-1)*(1+rate*type));},
  FV: (a)=>{const rate=toNum(a[0]?.[0]??0),nper=toNum(a[1]?.[0]??1),pmt=toNum(a[2]?.[0]??0),pv=toNum(a[3]?.[0]??0),type=toNum(a[4]?.[0]??0);if(rate===0)return-(pv+pmt*nper);const r=Math.pow(1+rate,nper);return -(pv*r+pmt*(1+rate*type)*(r-1)/rate);},
  PV: (a)=>{const rate=toNum(a[0]?.[0]??0),nper=toNum(a[1]?.[0]??1),pmt=toNum(a[2]?.[0]??0),fv=toNum(a[3]?.[0]??0),type=toNum(a[4]?.[0]??0);if(rate===0)return-(pmt*nper+fv);const r=Math.pow(1+rate,nper);return -(pmt*(1+rate*type)*(r-1)/rate+fv)/r;},
  NPER: (a)=>{const rate=toNum(a[0]?.[0]??0),pmt=toNum(a[1]?.[0]??0),pv=toNum(a[2]?.[0]??0),fv=toNum(a[3]?.[0]??0);if(rate===0)return-(pv+fv)/pmt;return Math.log((pmt-fv*rate)/(pmt+pv*rate))/Math.log(1+rate);},
  NPV: (a,g,r)=>{const rate=toNum(a[0]?.[0]??0);const cfs=r.slice(1).flatMap(arg=>arg.includes(":")?nums(parseRange(arg,g)):[toNum(a[r.indexOf(arg)]?.[0]??0)]);return cfs.reduce((s,cf,i)=>s+cf/Math.pow(1+rate,i+1),0);},
  IRR: (a,g,r)=>{const cfs=r.flatMap(arg=>arg.includes(":")?nums(parseRange(arg,g)):[toNum(a[r.indexOf(arg)]?.[0]??0)]);let rate=0.1;for(let i=0;i<100;i++){const npv=cfs.reduce((s,cf,j)=>s+cf/Math.pow(1+rate,j),0);const dnpv=cfs.reduce((s,cf,j)=>s-j*cf/Math.pow(1+rate,j+1),0);if(Math.abs(dnpv)<1e-10)break;rate-=npv/dnpv;}return rate;},
  SLN: (a)=>(toNum(a[0]?.[0]??0)-toNum(a[1]?.[0]??0))/toNum(a[2]?.[0]??1),

  // ─ Info ─
  ISNUMBER: (a)=>typeof a[0]?.[0]==="number"||(!isNaN(parseFloat(String(a[0]?.[0])))&&typeof a[0]?.[0]!=="boolean"),
  ISTEXT: (a)=>typeof a[0]?.[0]==="string",
  ISBLANK: (a)=>a[0]?.[0]===null||a[0]?.[0]===""||a[0]?.[0]===undefined,
  ISLOGICAL: (a)=>typeof a[0]?.[0]==="boolean",
  ISERROR: (a)=>String(a[0]?.[0]).startsWith("#"),
  ISNA: (a)=>a[0]?.[0]==="#N/A",
  ISODD: (a)=>Math.abs(Math.floor(toNum(a[0]?.[0]??0)))%2===1,
  ISEVEN: (a)=>Math.abs(Math.floor(toNum(a[0]?.[0]??0)))%2===0,
  TYPE: (a)=>{const v=a[0]?.[0];if(typeof v==="number")return 1;if(typeof v==="string")return 2;if(typeof v==="boolean")return 4;if(v===null)return 1;return 64;},
  N: (a)=>{const v=a[0]?.[0];if(typeof v==="number")return v;if(typeof v==="boolean")return v?1:0;return 0;},
  NA: ()=>"#N/A",
  ERROR: ()=>"#VALUE!",
};

/* Merge the extended libraries on top of the base library. */
export const FUNCS: Record<string, FuncFn> = { ...BASE_FUNCS, ...EXTRA_FUNCS, ...EXTRA_FUNCS2 };

/** Total count of supported functions. */
export const FUNCTION_COUNT = Object.keys(FUNCS).length;

/* ── Expression evaluation ───────────────────────────────────────── */
export function parseAndEval(formula: string, grid: Grid): { result: CellValue; error?: string } {
  const f = formula.trim();
  if (!f.startsWith("=")) return { result: f };
  const expr = f.slice(1).trim();
  try {
    return { result: evalExpr(expr, grid) };
  } catch (e) {
    return { result: "#ERROR!", error: (e as Error).message };
  }
}

function evalExpr(expr: string, grid: Grid): CellValue {
  let s = expr.trim();
  // strip a single wrapping paren pair
  while (s.startsWith("(") && matchingParen(s) === s.length - 1) s = s.slice(1, -1).trim();
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1);
  if (s.toUpperCase() === "TRUE") return true;
  if (s.toUpperCase() === "FALSE") return false;

  // Function call
  const funcMatch = s.match(/^([A-Z][A-Z0-9_.]*)[ ]*\(([\s\S]*)\)$/i);
  if (funcMatch && matchingParen(s.slice(funcMatch[1].length).trimStart()) === s.slice(funcMatch[1].length).trimStart().length - 1) {
    const name = funcMatch[1].toUpperCase();
    const rawArgs = splitArgs(funcMatch[2]);
    const evaledArgs: CellValue[][] = rawArgs.map(arg => (arg.includes(":") ? [] : [evalExpr(arg, grid)]));
    const fn = FUNCS[name];
    if (!fn) return `#NAME? (${name})`;
    return fn(evaledArgs, grid, rawArgs);
  }

  const arithResult = evalArithmetic(s, grid);
  if (arithResult !== null) return arithResult;
  const cellVal = parseCellRef(s, grid);
  if (cellVal !== null) return cellVal;
  if (/^[A-Z]+\d+$/i.test(s.replace(/\$/g, ""))) return 0; // empty referenced cell
  const n = parseFloat(s);
  if (!isNaN(n) && /^-?[\d.eE+]+$/.test(s)) return n;
  return "#VALUE?";
}

function matchingParen(s: string): number {
  // returns index of the paren that matches the one at position 0, or -1
  if (s[0] !== "(") return -1;
  let depth = 0, inStr = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"') inStr = !inStr;
    if (inStr) continue;
    if (c === "(") depth++;
    if (c === ")") { depth--; if (depth === 0) return i; }
  }
  return -1;
}

function splitArgs(argsStr: string): string[] {
  const args: string[] = [];
  let depth = 0, cur = "", inStr = false;
  for (let i = 0; i < argsStr.length; i++) {
    const c = argsStr[i];
    if (c === '"') { inStr = !inStr; cur += c; continue; }
    if (inStr) { cur += c; continue; }
    if (c === "(") { depth++; cur += c; continue; }
    if (c === ")") { depth--; cur += c; continue; }
    if (c === "," && depth === 0) { args.push(cur.trim()); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim()) args.push(cur.trim());
  return args;
}

function evalArithmetic(s: string, grid: Grid): CellValue | null {
  for (const op of [">=", "<=", "<>", "=", ">", "<"]) {
    const idx = findOperator(s, op);
    if (idx > 0) {
      const left = evalExpr(s.slice(0, idx), grid);
      const right = evalExpr(s.slice(idx + op.length), grid);
      const lv = toNum(left), rv = toNum(right);
      const ls = toStr(left), rs = toStr(right);
      const numeric = typeof left === "number" && typeof right === "number";
      switch (op) {
        case ">=": return numeric ? lv >= rv : ls.toLowerCase() >= rs.toLowerCase();
        case "<=": return numeric ? lv <= rv : ls.toLowerCase() <= rs.toLowerCase();
        case "<>": return ls !== rs;
        case "=": return ls.toLowerCase() === rs.toLowerCase();
        case ">": return numeric ? lv > rv : ls.toLowerCase() > rs.toLowerCase();
        case "<": return numeric ? lv < rv : ls.toLowerCase() < rs.toLowerCase();
      }
    }
  }
  const ampIdx = findOperator(s, "&");
  if (ampIdx > 0) return toStr(evalExpr(s.slice(0, ampIdx), grid)) + toStr(evalExpr(s.slice(ampIdx + 1), grid));
  for (const op of ["+", "-"]) {
    const idx = findOperatorRTL(s, op);
    if (idx > 0 && !"*/+-^([{".includes(s[idx - 1])) {
      const l = evalExpr(s.slice(0, idx), grid), r = evalExpr(s.slice(idx + 1), grid);
      return op === "+" ? toNum(l) + toNum(r) : toNum(l) - toNum(r);
    }
  }
  for (const op of ["*", "/"]) {
    const idx = findOperatorRTL(s, op);
    if (idx > 0) {
      const l = evalExpr(s.slice(0, idx), grid), r = evalExpr(s.slice(idx + 1), grid);
      return op === "*" ? toNum(l) * toNum(r) : toNum(r) === 0 ? "#DIV/0!" : toNum(l) / toNum(r);
    }
  }
  const powIdx = findOperator(s, "^");
  if (powIdx > 0) return Math.pow(toNum(evalExpr(s.slice(0, powIdx), grid)), toNum(evalExpr(s.slice(powIdx + 1), grid)));
  // unary minus
  if (s.startsWith("-")) { const v = evalExpr(s.slice(1), grid); if (v !== "#VALUE?") return -toNum(v); }
  if (s.startsWith("+")) return evalExpr(s.slice(1), grid);
  return null;
}

function findOperator(s: string, op: string): number {
  let depth = 0, inStr = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '"') inStr = !inStr;
    if (inStr) continue;
    if (s[i] === "(") depth++;
    if (s[i] === ")") depth--;
    if (depth === 0 && s.slice(i, i + op.length) === op) return i;
  }
  return -1;
}

function findOperatorRTL(s: string, op: string): number {
  let depth = 0, inStr = false;
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === '"') inStr = !inStr;
    if (inStr) continue;
    if (s[i] === ")") depth++;
    if (s[i] === "(") depth--;
    if (depth === 0 && s[i] === op && i > 0) return i;
  }
  return -1;
}

/* ── Literal parsing for raw cell input ──────────────────────────── */
export function parseLiteral(raw: string): CellValue {
  if (raw === "" || raw == null) return null;
  const t = raw.trim();
  if (t.toUpperCase() === "TRUE") return true;
  if (t.toUpperCase() === "FALSE") return false;
  // number (allow leading $, commas, trailing %)
  const cleaned = t.replace(/[$,]/g, "");
  if (/^-?\d*\.?\d+%$/.test(cleaned)) return parseFloat(cleaned) / 100;
  if (/^-?\d*\.?\d+$/.test(cleaned) && cleaned !== "") return parseFloat(cleaned);
  return raw;
}

/* ── Workbook recalculation ──────────────────────────────────────────
   Takes a grid of RAW strings (formulas begin with "=") and returns a
   grid of computed values plus a parallel grid of error flags. Uses
   iterative passes so multi-level dependencies resolve; detects cycles
   via a pass cap. */
export function computeValues(raw: string[][]): { values: Grid; errors: boolean[][] } {
  const rows = raw.length;
  const cols = raw[0]?.length ?? 0;
  const values: Grid = raw.map(row => row.map(cell => (cell.startsWith("=") ? null : parseLiteral(cell))));
  const errors: boolean[][] = raw.map(row => row.map(() => false));

  const maxPasses = Math.min(60, rows * cols + 5);
  for (let pass = 0; pass < maxPasses; pass++) {
    let changed = false;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = raw[r][c];
        if (typeof cell === "string" && cell.startsWith("=")) {
          const { result } = parseAndEval(cell, values);
          if (result !== values[r][c]) { values[r][c] = result; changed = true; }
          errors[r][c] = typeof result === "string" && result.startsWith("#");
        }
      }
    }
    if (!changed) break;
  }
  return { values, errors };
}

/* ── Cell reference remapping for row/col insert & formula fill ───── */
export function shiftFormula(formula: string, rowDelta: number, colDelta: number): string {
  if (!formula.startsWith("=")) return formula;
  return formula.replace(/(\$?)([A-Z]+)(\$?)(\d+)/g, (_m, ad, col, rd, row) => {
    const newCol = ad ? col : indexToCol(colToIndex(col) + colDelta);
    const newRow = rd ? row : String(parseInt(row) + rowDelta);
    return `${ad}${newCol}${rd}${newRow}`;
  });
}
