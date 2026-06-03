"use client";
import { useState, useMemo, useCallback, useRef } from "react";
import { EXTRA_FUNCS } from "./extra-funcs";
import { EXTRA_FUNCS2 } from "./extra-funcs2";

/* ═══════════════════════════════════════════════════════════════════
   FORMULA ENGINE — pure JavaScript implementations of 100+ Excel formulas
═══════════════════════════════════════════════════════════════════ */

type CellValue = number | string | boolean | null;
type Grid = CellValue[][];

// Cell reference parser: "A1" → [row, col] (0-indexed)
function parseCellRef(ref: string, grid: Grid): CellValue | null {
  const m = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!m) return null;
  const col = m[1].split("").reduce((acc, c) => acc * 26 + c.charCodeAt(0) - 64, 0) - 1;
  const row = parseInt(m[2]) - 1;
  if (row < 0 || row >= grid.length || col < 0 || col >= (grid[row]?.length ?? 0)) return null;
  return grid[row][col];
}

// Range parser: "A1:B3" → flat array of values
function parseRange(range: string, grid: Grid): CellValue[] {
  const m = range.toUpperCase().match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!m) return [];
  const c1 = m[1].split("").reduce((a,c)=>a*26+c.charCodeAt(0)-64,0)-1;
  const r1 = parseInt(m[2])-1;
  const c2 = m[3].split("").reduce((a,c)=>a*26+c.charCodeAt(0)-64,0)-1;
  const r2 = parseInt(m[4])-1;
  const vals: CellValue[] = [];
  for (let r=r1;r<=r2;r++) for (let c=c1;c<=c2;c++) vals.push(grid[r]?.[c]??null);
  return vals;
}

// Parse range to 2D array
function parseRange2D(range: string, grid: Grid): CellValue[][] {
  const m = range.toUpperCase().match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!m) return [];
  const c1=m[1].split("").reduce((a,c)=>a*26+c.charCodeAt(0)-64,0)-1;
  const r1=parseInt(m[2])-1;
  const c2=m[3].split("").reduce((a,c)=>a*26+c.charCodeAt(0)-64,0)-1;
  const r2=parseInt(m[4])-1;
  const rows:CellValue[][]=[];
  for (let r=r1;r<=r2;r++){const row:CellValue[]=[];for(let c=c1;c<=c2;c++)row.push(grid[r]?.[c]??null);rows.push(row);}
  return rows;
}

const nums = (vals: CellValue[]) => vals.map(Number).filter(v=>!isNaN(v)&&isFinite(v));
const toNum = (v: CellValue): number => typeof v==="number"?v:typeof v==="string"?parseFloat(v)||0:typeof v==="boolean"?+v:0;
const toBool = (v: CellValue): boolean => v!==null&&v!==false&&v!=="FALSE"&&v!==0;
const toStr = (v: CellValue): string => v===null||v===undefined?"":typeof v==="boolean"?v?"TRUE":"FALSE":String(v);

/* ── All formula implementations ── */
const FUNCS: Record<string, (args: CellValue[][], grid: Grid, rawArgs: string[]) => CellValue> = {
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
  FACT: (a)=>{let n=Math.abs(Math.floor(toNum(a[0]?.[0]??0)));if(n>170)return"#NUM!";let f=1;for(let i=2;i<=n;i++)f*=i;return f;},
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
  NUMBERVALUE: (a)=>parseFloat(toStr(a[0]?.[0]).replace(/,/g,"")),

  // ─ Date & Time ─
  TODAY: ()=>new Date().toLocaleDateString("en-US"),
  NOW: ()=>new Date().toLocaleString("en-US"),
  DATE: (a)=>new Date(toNum(a[0]?.[0]),toNum(a[1]?.[0])-1,toNum(a[2]?.[0])).toLocaleDateString("en-US"),
  YEAR: (a)=>{const d=new Date(toStr(a[0]?.[0]));return isNaN(d.getTime())?"#VALUE!":d.getFullYear();},
  MONTH: (a)=>{const d=new Date(toStr(a[0]?.[0]));return isNaN(d.getTime())?"#VALUE!":d.getMonth()+1;},
  DAY: (a)=>{const d=new Date(toStr(a[0]?.[0]));return isNaN(d.getTime())?"#VALUE!":d.getDate();},
  WEEKDAY: (a)=>{const d=new Date(toStr(a[0]?.[0]));return isNaN(d.getTime())?"#VALUE!":d.getDay()+1;},
  HOUR: (a)=>{const d=new Date(toStr(a[0]?.[0]));return isNaN(d.getTime())?"#VALUE!":d.getHours();},
  MINUTE: (a)=>{const d=new Date(toStr(a[0]?.[0]));return isNaN(d.getTime())?"#VALUE!":d.getMinutes();},
  SECOND: (a)=>{const d=new Date(toStr(a[0]?.[0]));return isNaN(d.getTime())?"#VALUE!":d.getSeconds();},
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
  COLUMN: (a,g,r)=>{if(!r[0])return 1;const m=r[0].toUpperCase().match(/([A-Z]+)/);return m?m[1].split("").reduce((acc,c)=>acc*26+c.charCodeAt(0)-64,0):1;},
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

// Merge the extended Excel-365 libraries (250+ extra functions) on top.
Object.assign(FUNCS, EXTRA_FUNCS, EXTRA_FUNCS2);

/* ── Formula parser ── */
function parseAndEval(formula: string, grid: Grid): { result: CellValue; error?: string } {
  const f = formula.trim();
  if (!f.startsWith("=")) return { result: f };
  const expr = f.slice(1).trim();
  try {
    const result = evalExpr(expr, grid);
    return { result };
  } catch(e) {
    return { result: "#ERROR!", error: (e as Error).message };
  }
}

function evalExpr(expr: string, grid: Grid): CellValue {
  const s = expr.trim();
  // String literal
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1,-1);
  // Boolean
  if (s.toUpperCase()==="TRUE") return true;
  if (s.toUpperCase()==="FALSE") return false;
  // Function call
  const funcMatch = s.match(/^([A-Z][A-Z0-9_.]*)[ ]*\(([\s\S]*)\)$/i);
  if (funcMatch) {
    const name = funcMatch[1].toUpperCase();
    const argsStr = funcMatch[2];
    const rawArgs = splitArgs(argsStr);
    const evaledArgs: CellValue[][] = rawArgs.map(arg => {
      if (arg.includes(":")) return []; // range — handled by func
      return [evalExpr(arg, grid)];
    });
    const fn = FUNCS[name];
    if (!fn) return `#NAME? (${name} not supported)`;
    return fn(evaledArgs, grid, rawArgs);
  }
  // Arithmetic with operators
  const arithResult = evalArithmetic(s, grid);
  if (arithResult !== null) return arithResult;
  // Cell reference
  const cellVal = parseCellRef(s, grid);
  if (cellVal !== null) return cellVal;
  // Number
  const n = parseFloat(s);
  if (!isNaN(n)) return n;
  return `#VALUE?`;
}

function splitArgs(argsStr: string): string[] {
  const args: string[] = [];
  let depth = 0, cur = "", inStr = false;
  for (let i = 0; i < argsStr.length; i++) {
    const c = argsStr[i];
    if (c === '"') { inStr = !inStr; cur += c; continue; }
    if (inStr) { cur += c; continue; }
    if (c === '(') { depth++; cur += c; continue; }
    if (c === ')') { depth--; cur += c; continue; }
    if (c === ',' && depth === 0) { args.push(cur.trim()); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim()) args.push(cur.trim());
  return args;
}

function evalArithmetic(s: string, grid: Grid): CellValue | null {
  // Handle comparison operators
  for (const op of [">=","<=","<>","=",">","<"]) {
    const idx = findOperator(s, op);
    if (idx > 0) {
      const left = evalExpr(s.slice(0, idx), grid);
      const right = evalExpr(s.slice(idx + op.length), grid);
      const lv = toNum(left), rv = toNum(right);
      const ls = toStr(left), rs = toStr(right);
      switch(op) {
        case ">=": return typeof left==="number"?lv>=rv:ls.toLowerCase()>=rs.toLowerCase();
        case "<=": return typeof left==="number"?lv<=rv:ls.toLowerCase()<=rs.toLowerCase();
        case "<>": return ls!==rs;
        case "=": return ls.toLowerCase()===rs.toLowerCase();
        case ">": return typeof left==="number"?lv>rv:ls.toLowerCase()>rs.toLowerCase();
        case "<": return typeof left==="number"?lv<rv:ls.toLowerCase()<rs.toLowerCase();
      }
    }
  }
  // String concat
  const ampIdx = findOperator(s, "&");
  if (ampIdx > 0) return toStr(evalExpr(s.slice(0,ampIdx),grid))+toStr(evalExpr(s.slice(ampIdx+1),grid));
  // Addition/subtraction
  for (const op of ["+","-"]) {
    const idx = findOperatorRTL(s, op);
    if (idx > 0) {
      const l = evalExpr(s.slice(0,idx),grid), r = evalExpr(s.slice(idx+1),grid);
      return op==="+"?toNum(l)+toNum(r):toNum(l)-toNum(r);
    }
  }
  // Multiply/divide
  for (const op of ["*","/"]) {
    const idx = findOperatorRTL(s, op);
    if (idx > 0) {
      const l=evalExpr(s.slice(0,idx),grid),r=evalExpr(s.slice(idx+1),grid);
      return op==="*"?toNum(l)*toNum(r):toNum(r)===0?"#DIV/0!":toNum(l)/toNum(r);
    }
  }
  // Power
  const powIdx = findOperator(s,"^");
  if (powIdx > 0) return Math.pow(toNum(evalExpr(s.slice(0,powIdx),grid)),toNum(evalExpr(s.slice(powIdx+1),grid)));
  return null;
}

function findOperator(s: string, op: string): number {
  let depth=0, inStr=false;
  for (let i=0;i<s.length;i++){
    if(s[i]==='"')inStr=!inStr;
    if(inStr)continue;
    if(s[i]==='(')depth++;
    if(s[i]===')')depth--;
    if(depth===0&&s.slice(i,i+op.length)===op)return i;
  }
  return -1;
}

function findOperatorRTL(s: string, op: string): number {
  let depth=0,inStr=false;
  for(let i=s.length-1;i>=0;i--){
    if(s[i]==='"')inStr=!inStr;
    if(inStr)continue;
    if(s[i]===')')depth++;
    if(s[i]==='(')depth--;
    if(depth===0&&s[i]===op&&i>0)return i;
  }
  return -1;
}

/* ═══════════════════════════════════════════════════════════════════
   FORMULA REGISTRY — metadata for every formula
═══════════════════════════════════════════════════════════════════ */

type FormulaInfo = {
  name: string;
  category: string;
  syntax: string;
  description: string;
  args: { name: string; desc: string; optional?: boolean }[];
  examples: { formula: string; note: string }[];
};

const FORMULA_REGISTRY: FormulaInfo[] = [
  // ─ Math ─
  { name:"SUM", category:"Math", syntax:"SUM(number1, [number2], ...)", description:"Adds all numbers in a range.", args:[{name:"number1",desc:"First number or range"},{name:"number2",desc:"Additional numbers (optional)",optional:true}], examples:[{formula:"=SUM(A1:A5)",note:"Sum of cells A1 through A5"},{formula:"=SUM(10, 20, 30)",note:"Returns 60"},{formula:"=SUM(A1:A3, B1)",note:"Sum a range plus one cell"}] },
  { name:"AVERAGE", category:"Math", syntax:"AVERAGE(number1, [number2], ...)", description:"Returns the arithmetic mean of its arguments.", args:[{name:"number1",desc:"First number or range"},{name:"number2",desc:"Additional values",optional:true}], examples:[{formula:"=AVERAGE(A1:A5)",note:"Average of 5 cells"},{formula:"=AVERAGE(1,2,3,4,5)",note:"Returns 3"}] },
  { name:"MIN", category:"Math", syntax:"MIN(number1, [number2], ...)", description:"Returns the smallest value in a set of values.", args:[{name:"number1",desc:"Range or values"}], examples:[{formula:"=MIN(A1:A10)",note:"Smallest value in range"},{formula:"=MIN(5,3,8,1)",note:"Returns 1"}] },
  { name:"MAX", category:"Math", syntax:"MAX(number1, [number2], ...)", description:"Returns the largest value in a set of values.", args:[{name:"number1",desc:"Range or values"}], examples:[{formula:"=MAX(A1:A10)",note:"Largest value in range"},{formula:"=MAX(5,3,8,1)",note:"Returns 8"}] },
  { name:"COUNT", category:"Math", syntax:"COUNT(value1, [value2], ...)", description:"Counts the number of cells that contain numbers.", args:[{name:"value1",desc:"Range or values"}], examples:[{formula:"=COUNT(A1:A10)",note:"Count numeric cells"},{formula:"=COUNT(1,'text',3)",note:"Returns 2"}] },
  { name:"COUNTA", category:"Math", syntax:"COUNTA(value1, [value2], ...)", description:"Counts the number of cells that are not empty.", args:[{name:"value1",desc:"Range or values"}], examples:[{formula:"=COUNTA(A1:A10)",note:"Count non-empty cells"}] },
  { name:"COUNTIF", category:"Math", syntax:"COUNTIF(range, criteria)", description:"Counts cells that meet a given condition.", args:[{name:"range",desc:"Range to evaluate"},{name:"criteria",desc:"Condition to match"}], examples:[{formula:'=COUNTIF(A1:A5,">10")',note:"Count cells greater than 10"},{formula:'=COUNTIF(A1:A5,"apple")',note:"Count cells equal to 'apple'"}] },
  { name:"SUMIF", category:"Math", syntax:"SUMIF(range, criteria, [sum_range])", description:"Sums values that meet a condition.", args:[{name:"range",desc:"Range to evaluate"},{name:"criteria",desc:"Condition"},{name:"sum_range",desc:"Range to sum (optional)",optional:true}], examples:[{formula:'=SUMIF(A1:A5,">0")',note:"Sum positive values"},{formula:'=SUMIF(A1:A5,"apple",B1:B5)',note:"Sum B where A is 'apple'"}] },
  { name:"ROUND", category:"Math", syntax:"ROUND(number, num_digits)", description:"Rounds a number to a specified number of digits.", args:[{name:"number",desc:"Number to round"},{name:"num_digits",desc:"Number of decimal places"}], examples:[{formula:"=ROUND(3.14159, 2)",note:"Returns 3.14"},{formula:"=ROUND(1234.5, -2)",note:"Returns 1200"}] },
  { name:"ABS", category:"Math", syntax:"ABS(number)", description:"Returns the absolute value (magnitude without sign).", args:[{name:"number",desc:"The number"}], examples:[{formula:"=ABS(-42)",note:"Returns 42"},{formula:"=ABS(A1-B1)",note:"Distance between two values"}] },
  { name:"SQRT", category:"Math", syntax:"SQRT(number)", description:"Returns the square root of a number.", args:[{name:"number",desc:"A positive number"}], examples:[{formula:"=SQRT(16)",note:"Returns 4"},{formula:"=SQRT(A1)",note:"Square root of A1"}] },
  { name:"POWER", category:"Math", syntax:"POWER(number, power)", description:"Returns a number raised to a power.", args:[{name:"number",desc:"Base number"},{name:"power",desc:"Exponent"}], examples:[{formula:"=POWER(2,10)",note:"Returns 1024"},{formula:"=POWER(A1, 0.5)",note:"Same as SQRT(A1)"}] },
  { name:"MOD", category:"Math", syntax:"MOD(number, divisor)", description:"Returns the remainder from division.", args:[{name:"number",desc:"Dividend"},{name:"divisor",desc:"Divisor"}], examples:[{formula:"=MOD(10, 3)",note:"Returns 1"},{formula:"=MOD(A1, 2)",note:"0=even, 1=odd"}] },
  { name:"INT", category:"Math", syntax:"INT(number)", description:"Rounds a number down to the nearest integer.", args:[{name:"number",desc:"The number to round"}], examples:[{formula:"=INT(3.9)",note:"Returns 3"},{formula:"=INT(-3.1)",note:"Returns -4"}] },
  { name:"CEILING", category:"Math", syntax:"CEILING(number, significance)", description:"Rounds a number up to the nearest multiple of significance.", args:[{name:"number",desc:"Value to round"},{name:"significance",desc:"Multiple to round to"}], examples:[{formula:"=CEILING(2.3, 1)",note:"Returns 3"},{formula:"=CEILING(15, 10)",note:"Returns 20"}] },
  { name:"FLOOR", category:"Math", syntax:"FLOOR(number, significance)", description:"Rounds a number down to the nearest multiple of significance.", args:[{name:"number",desc:"Value to round"},{name:"significance",desc:"Multiple to round to"}], examples:[{formula:"=FLOOR(2.9, 1)",note:"Returns 2"},{formula:"=FLOOR(17, 5)",note:"Returns 15"}] },
  { name:"RAND", category:"Math", syntax:"RAND()", description:"Returns a random number between 0 and 1 (exclusive).", args:[], examples:[{formula:"=RAND()",note:"Random decimal e.g. 0.472"},{formula:"=INT(RAND()*100)",note:"Random integer 0-99"}] },
  { name:"RANDBETWEEN", category:"Math", syntax:"RANDBETWEEN(bottom, top)", description:"Returns a random integer between two values.", args:[{name:"bottom",desc:"Minimum value"},{name:"top",desc:"Maximum value"}], examples:[{formula:"=RANDBETWEEN(1, 6)",note:"Simulate a dice roll"},{formula:"=RANDBETWEEN(1000, 9999)",note:"Random 4-digit number"}] },
  { name:"SUMPRODUCT", category:"Math", syntax:"SUMPRODUCT(array1, [array2], ...)", description:"Multiplies corresponding elements and returns their sum.", args:[{name:"array1",desc:"First range"},{name:"array2",desc:"Second range",optional:true}], examples:[{formula:"=SUMPRODUCT(A1:A3, B1:B3)",note:"Sum of A×B for each row"}] },
  { name:"FACT", category:"Math", syntax:"FACT(number)", description:"Returns the factorial of a number.", args:[{name:"number",desc:"Non-negative integer"}], examples:[{formula:"=FACT(5)",note:"Returns 120 (5×4×3×2×1)"},{formula:"=FACT(10)",note:"Returns 3628800"}] },
  { name:"COMBIN", category:"Math", syntax:"COMBIN(number, number_chosen)", description:"Returns the number of combinations for given items.", args:[{name:"number",desc:"Total items"},{name:"number_chosen",desc:"Items per group"}], examples:[{formula:"=COMBIN(10, 3)",note:"Returns 120 (10 choose 3)"}] },
  { name:"PI", category:"Math", syntax:"PI()", description:"Returns the value of π (pi) to 15 digits.", args:[], examples:[{formula:"=PI()",note:"Returns 3.14159265358979"},{formula:"=2*PI()*A1",note:"Circumference of circle with radius A1"}] },
  { name:"EXP", category:"Math", syntax:"EXP(number)", description:"Returns e raised to the power of a number.", args:[{name:"number",desc:"Exponent"}], examples:[{formula:"=EXP(1)",note:"Returns 2.71828 (e)"},{formula:"=EXP(LN(A1))",note:"Returns A1"}] },
  { name:"LN", category:"Math", syntax:"LN(number)", description:"Returns the natural logarithm of a number.", args:[{name:"number",desc:"Positive number"}], examples:[{formula:"=LN(EXP(1))",note:"Returns 1"},{formula:"=LN(100)",note:"Returns 4.60517"}] },
  { name:"LOG", category:"Math", syntax:"LOG(number, [base])", description:"Returns the logarithm of a number to a specified base.", args:[{name:"number",desc:"Positive number"},{name:"base",desc:"Base (default 10)",optional:true}], examples:[{formula:"=LOG(100)",note:"Returns 2 (log base 10)"},{formula:"=LOG(8, 2)",note:"Returns 3 (log base 2)"}] },
  { name:"GCD", category:"Math", syntax:"GCD(number1, number2)", description:"Returns the greatest common divisor.", args:[{name:"number1",desc:"First number"},{name:"number2",desc:"Second number"}], examples:[{formula:"=GCD(24, 36)",note:"Returns 12"},{formula:"=GCD(48, 18)",note:"Returns 6"}] },
  { name:"LCM", category:"Math", syntax:"LCM(number1, number2)", description:"Returns the least common multiple.", args:[{name:"number1",desc:"First number"},{name:"number2",desc:"Second number"}], examples:[{formula:"=LCM(4, 6)",note:"Returns 12"},{formula:"=LCM(12, 18)",note:"Returns 36"}] },

  // ─ Text ─
  { name:"LEN", category:"Text", syntax:"LEN(text)", description:"Returns the number of characters in a text string.", args:[{name:"text",desc:"The text string"}], examples:[{formula:'=LEN("Hello")',note:"Returns 5"},{formula:"=LEN(A1)",note:"Character count of A1"}] },
  { name:"LEFT", category:"Text", syntax:"LEFT(text, [num_chars])", description:"Returns the leftmost characters from a text string.", args:[{name:"text",desc:"Text string"},{name:"num_chars",desc:"Number of chars (default 1)",optional:true}], examples:[{formula:'=LEFT("Hello",3)',note:'Returns "Hel"'},{formula:"=LEFT(A1, 4)",note:"First 4 characters"}] },
  { name:"RIGHT", category:"Text", syntax:"RIGHT(text, [num_chars])", description:"Returns the rightmost characters from a text string.", args:[{name:"text",desc:"Text string"},{name:"num_chars",desc:"Number of chars",optional:true}], examples:[{formula:'=RIGHT("Hello World",5)',note:'Returns "World"'}] },
  { name:"MID", category:"Text", syntax:"MID(text, start_num, num_chars)", description:"Returns characters from the middle of a text string.", args:[{name:"text",desc:"Text string"},{name:"start_num",desc:"Starting position"},{name:"num_chars",desc:"Number of chars"}], examples:[{formula:'=MID("Hello World",7,5)',note:'Returns "World"'},{formula:'=MID("2024-01-15",1,4)',note:"Extract year"}] },
  { name:"UPPER", category:"Text", syntax:"UPPER(text)", description:"Converts text to uppercase.", args:[{name:"text",desc:"Text to convert"}], examples:[{formula:'=UPPER("hello")',note:'Returns "HELLO"'}] },
  { name:"LOWER", category:"Text", syntax:"LOWER(text)", description:"Converts text to lowercase.", args:[{name:"text",desc:"Text to convert"}], examples:[{formula:'=LOWER("HELLO WORLD")',note:'Returns "hello world"'}] },
  { name:"PROPER", category:"Text", syntax:"PROPER(text)", description:"Capitalizes the first letter in each word.", args:[{name:"text",desc:"Text string"}], examples:[{formula:'=PROPER("john doe")',note:'Returns "John Doe"'}] },
  { name:"TRIM", category:"Text", syntax:"TRIM(text)", description:"Removes extra spaces from text, leaving single spaces between words.", args:[{name:"text",desc:"Text to trim"}], examples:[{formula:'=TRIM("  Hello   World  ")',note:'Returns "Hello World"'}] },
  { name:"CONCATENATE", category:"Text", syntax:"CONCATENATE(text1, [text2], ...)", description:"Joins text strings together.", args:[{name:"text1",desc:"First text"},{name:"text2",desc:"More text",optional:true}], examples:[{formula:'=CONCATENATE("Hello", " ", "World")',note:'Returns "Hello World"'},{formula:'=CONCATENATE(A1," ",B1)',note:"Join first and last name"}] },
  { name:"SUBSTITUTE", category:"Text", syntax:"SUBSTITUTE(text, old_text, new_text, [instance_num])", description:"Replaces occurrences of a string within text.", args:[{name:"text",desc:"Original text"},{name:"old_text",desc:"Text to replace"},{name:"new_text",desc:"Replacement text"},{name:"instance_num",desc:"Which occurrence (optional)",optional:true}], examples:[{formula:'=SUBSTITUTE("Hello World","World","Excel")',note:'Returns "Hello Excel"'}] },
  { name:"REPLACE", category:"Text", syntax:"REPLACE(old_text, start_num, num_chars, new_text)", description:"Replaces part of a text string with different text.", args:[{name:"old_text",desc:"Original text"},{name:"start_num",desc:"Start position"},{name:"num_chars",desc:"Chars to replace"},{name:"new_text",desc:"Replacement"}], examples:[{formula:'=REPLACE("Hello",1,5,"World")',note:'Returns "World"'}] },
  { name:"FIND", category:"Text", syntax:"FIND(find_text, within_text, [start_num])", description:"Finds one text string within another (case-sensitive).", args:[{name:"find_text",desc:"Text to find"},{name:"within_text",desc:"Where to search"},{name:"start_num",desc:"Start position",optional:true}], examples:[{formula:'=FIND("o","Hello World")',note:"Returns 5"},{formula:'=FIND("@","user@example.com")',note:"Position of @ symbol"}] },
  { name:"SEARCH", category:"Text", syntax:"SEARCH(find_text, within_text, [start_num])", description:"Finds text within text (case-insensitive, allows wildcards).", args:[{name:"find_text",desc:"Text to find"},{name:"within_text",desc:"Where to search"},{name:"start_num",desc:"Start position",optional:true}], examples:[{formula:'=SEARCH("hello","Hello World")',note:"Returns 1 (case-insensitive)"}] },
  { name:"TEXT", category:"Text", syntax:'TEXT(value, format_text)', description:"Converts a number to text in a specified format.", args:[{name:"value",desc:"Number to format"},{name:"format_text",desc:"Format code"}], examples:[{formula:'=TEXT(1234.5,"#,##0.00")',note:'Returns "1,234.50"'},{formula:'=TEXT(0.15,"0%")',note:'Returns "15%"'}] },
  { name:"VALUE", category:"Text", syntax:"VALUE(text)", description:"Converts a text string to a number.", args:[{name:"text",desc:"Text representing a number"}], examples:[{formula:'=VALUE("123")',note:"Returns 123 (number)"},{formula:'=VALUE("$1,234")',note:"Returns 1234"}] },
  { name:"REPT", category:"Text", syntax:"REPT(text, number_times)", description:"Repeats text a specified number of times.", args:[{name:"text",desc:"Text to repeat"},{name:"number_times",desc:"Times to repeat"}], examples:[{formula:'=REPT("*",5)',note:'Returns "*****"'},{formula:'=REPT("-",20)',note:"Divider line"}] },
  { name:"EXACT", category:"Text", syntax:"EXACT(text1, text2)", description:"Checks if two text strings are exactly equal (case-sensitive).", args:[{name:"text1",desc:"First string"},{name:"text2",desc:"Second string"}], examples:[{formula:'=EXACT("Hello","Hello")',note:"Returns TRUE"},{formula:'=EXACT("Hello","hello")',note:"Returns FALSE (case matters)"}] },
  { name:"CHAR", category:"Text", syntax:"CHAR(number)", description:"Returns the character specified by the ASCII/Unicode code.", args:[{name:"number",desc:"Code number (1–255)"}], examples:[{formula:"=CHAR(65)",note:'Returns "A"'},{formula:"=CHAR(10)",note:"Line feed character"}] },
  { name:"CODE", category:"Text", syntax:"CODE(text)", description:"Returns the numeric code of the first character in text.", args:[{name:"text",desc:"Text string"}], examples:[{formula:'=CODE("A")',note:"Returns 65"},{formula:'=CODE("a")',note:"Returns 97"}] },
  { name:"TEXTJOIN", category:"Text", syntax:"TEXTJOIN(delimiter, ignore_empty, text1, ...)", description:"Joins text with a delimiter, optionally ignoring empty cells.", args:[{name:"delimiter",desc:"Separator"},{name:"ignore_empty",desc:"TRUE to skip blanks"},{name:"text1",desc:"Text or range"}], examples:[{formula:'=TEXTJOIN(", ",TRUE,A1:A5)',note:"Comma-separated list, skip blanks"}] },
  { name:"FIXED", category:"Text", syntax:"FIXED(number, [decimals], [no_commas])", description:"Formats a number as text with fixed decimals.", args:[{name:"number",desc:"Number"},{name:"decimals",desc:"Decimal places",optional:true},{name:"no_commas",desc:"Omit commas",optional:true}], examples:[{formula:"=FIXED(1234.567, 2)",note:'Returns "1,234.57"'},{formula:"=FIXED(1234.5, 0, TRUE)",note:'Returns "1235"'}] },

  // ─ Date ─
  { name:"TODAY", category:"Date", syntax:"TODAY()", description:"Returns today's date.", args:[], examples:[{formula:"=TODAY()",note:"Current date"},{formula:"=TODAY()-A1",note:"Days since date in A1"}] },
  { name:"NOW", category:"Date", syntax:"NOW()", description:"Returns the current date and time.", args:[], examples:[{formula:"=NOW()",note:"Current date & time"},{formula:"=NOW()-TODAY()",note:"Fraction of day elapsed"}] },
  { name:"DATE", category:"Date", syntax:"DATE(year, month, day)", description:"Creates a date from year, month, and day values.", args:[{name:"year",desc:"Four-digit year"},{name:"month",desc:"Month 1-12"},{name:"day",desc:"Day 1-31"}], examples:[{formula:"=DATE(2024,12,25)",note:"Christmas 2024"},{formula:"=DATE(YEAR(A1),MONTH(A1)+1,1)-1",note:"Last day of month"}] },
  { name:"YEAR", category:"Date", syntax:"YEAR(serial_number)", description:"Returns the year of a date.", args:[{name:"serial_number",desc:"Date value"}], examples:[{formula:"=YEAR(TODAY())",note:"Current year"},{formula:"=YEAR(A1)",note:"Year from date in A1"}] },
  { name:"MONTH", category:"Date", syntax:"MONTH(serial_number)", description:"Returns the month (1-12) of a date.", args:[{name:"serial_number",desc:"Date value"}], examples:[{formula:"=MONTH(TODAY())",note:"Current month number"},{formula:"=MONTH(A1)",note:"Month from date in A1"}] },
  { name:"DAY", category:"Date", syntax:"DAY(serial_number)", description:"Returns the day (1-31) of a date.", args:[{name:"serial_number",desc:"Date value"}], examples:[{formula:"=DAY(TODAY())",note:"Current day of month"}] },
  { name:"WEEKDAY", category:"Date", syntax:"WEEKDAY(serial_number, [return_type])", description:"Returns the day of the week (1=Sunday by default).", args:[{name:"serial_number",desc:"Date"},{name:"return_type",desc:"1=Sun-Sat, 2=Mon-Sun",optional:true}], examples:[{formula:"=WEEKDAY(TODAY())",note:"1=Sunday, 7=Saturday"}] },
  { name:"DAYS", category:"Date", syntax:"DAYS(end_date, start_date)", description:"Returns the number of days between two dates.", args:[{name:"end_date",desc:"End date"},{name:"start_date",desc:"Start date"}], examples:[{formula:'=DAYS("2024-12-31","2024-01-01")',note:"Days in 2024 (365)"},{formula:"=DAYS(TODAY(),A1)",note:"Days since A1"}] },
  { name:"DATEDIF", category:"Date", syntax:'DATEDIF(start_date, end_date, unit)', description:"Calculates difference between dates in specified units.", args:[{name:"start_date",desc:"Earlier date"},{name:"end_date",desc:"Later date"},{name:"unit",desc:'"Y","M","D" for years/months/days'}], examples:[{formula:'=DATEDIF("1990-01-01",TODAY(),"Y")',note:"Age in years"},{formula:'=DATEDIF(A1,B1,"M")',note:"Months between dates"}] },
  { name:"EDATE", category:"Date", syntax:"EDATE(start_date, months)", description:"Returns the date N months before or after a start date.", args:[{name:"start_date",desc:"Start date"},{name:"months",desc:"Positive (future) or negative (past)"}], examples:[{formula:"=EDATE(TODAY(), 3)",note:"3 months from today"},{formula:"=EDATE(A1, -6)",note:"6 months before A1"}] },
  { name:"EOMONTH", category:"Date", syntax:"EOMONTH(start_date, months)", description:"Returns the last day of a month N months away.", args:[{name:"start_date",desc:"Start date"},{name:"months",desc:"Months offset"}], examples:[{formula:"=EOMONTH(TODAY(), 0)",note:"Last day of current month"},{formula:"=EOMONTH(A1, 1)",note:"Last day of next month"}] },

  // ─ Logical ─
  { name:"IF", category:"Logical", syntax:"IF(logical_test, [value_if_true], [value_if_false])", description:"Tests a condition and returns one value if true, another if false.", args:[{name:"logical_test",desc:"Condition to evaluate"},{name:"value_if_true",desc:"Value when true"},{name:"value_if_false",desc:"Value when false",optional:true}], examples:[{formula:'=IF(A1>10,"High","Low")',note:"Classify as High or Low"},{formula:"=IF(A1=\"\",\"Empty\",A1)",note:"Show 'Empty' for blank cells"},{formula:"=IF(AND(A1>0,B1>0),A1+B1,0)",note:"Sum only if both positive"}] },
  { name:"AND", category:"Logical", syntax:"AND(logical1, [logical2], ...)", description:"Returns TRUE if all arguments are true.", args:[{name:"logical1",desc:"First condition"},{name:"logical2",desc:"Additional conditions",optional:true}], examples:[{formula:"=AND(A1>0, A1<100)",note:"Check if A1 is between 0 and 100"},{formula:'=IF(AND(A1="Yes",B1>50),"Pass","Fail")',note:"Combined condition"}] },
  { name:"OR", category:"Logical", syntax:"OR(logical1, [logical2], ...)", description:"Returns TRUE if any argument is true.", args:[{name:"logical1",desc:"First condition"},{name:"logical2",desc:"Additional conditions",optional:true}], examples:[{formula:'=OR(A1="Yes",A1="OK")',note:"Match either value"},{formula:"=IF(OR(A1<0,A1>100),\"Out of range\",\"OK\")",note:"Range check"}] },
  { name:"NOT", category:"Logical", syntax:"NOT(logical)", description:"Returns the opposite of a logical value.", args:[{name:"logical",desc:"Condition"}], examples:[{formula:"=NOT(A1>10)",note:"TRUE when A1 is NOT greater than 10"},{formula:'=NOT(ISBLANK(A1))',note:"TRUE when A1 is not empty"}] },
  { name:"IFERROR", category:"Logical", syntax:"IFERROR(value, value_if_error)", description:"Returns a custom value if a formula results in an error.", args:[{name:"value",desc:"Formula to evaluate"},{name:"value_if_error",desc:"Value if error occurs"}], examples:[{formula:'=IFERROR(A1/B1, "N/A")',note:'Return "N/A" instead of #DIV/0!'},{formula:"=IFERROR(VLOOKUP(A1,B:C,2,0),0)",note:"Return 0 if VLOOKUP fails"}] },
  { name:"IFS", category:"Logical", syntax:"IFS(logical1, value1, [logical2, value2], ...)", description:"Checks multiple conditions and returns the first true result.", args:[{name:"logical1",desc:"First condition"},{name:"value1",desc:"Value if first is true"},{name:"logical2/value2",desc:"More pairs",optional:true}], examples:[{formula:'=IFS(A1>=90,"A",A1>=80,"B",A1>=70,"C",TRUE,"F")',note:"Grade classification"}] },
  { name:"SWITCH", category:"Logical", syntax:"SWITCH(expression, val1, result1, [val2, result2], ..., [default])", description:"Matches an expression against a list of values.", args:[{name:"expression",desc:"Value to compare"},{name:"val1/result1",desc:"Match/return pairs"}], examples:[{formula:'=SWITCH(WEEKDAY(TODAY()),1,"Sun",2,"Mon",3,"Tue",4,"Wed",5,"Thu",6,"Fri",7,"Sat")',note:"Day name from number"}] },
  { name:"XOR", category:"Logical", syntax:"XOR(logical1, [logical2], ...)", description:"Returns TRUE if an odd number of arguments are TRUE.", args:[{name:"logical1",desc:"First condition"}], examples:[{formula:"=XOR(A1>5, B1>5)",note:"True if exactly one is greater than 5"}] },

  // ─ Lookup ─
  { name:"VLOOKUP", category:"Lookup", syntax:"VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])", description:"Searches the first column of a table and returns a value from another column.", args:[{name:"lookup_value",desc:"Value to search"},{name:"table_array",desc:"Table range (first col is searched)"},{name:"col_index_num",desc:"Column number to return"},{name:"range_lookup",desc:"FALSE=exact, TRUE=approximate",optional:true}], examples:[{formula:"=VLOOKUP(A1,B1:D10,3,FALSE)",note:"Exact match — return col 3 of table"},{formula:'=VLOOKUP("Alice",A1:C5,2,FALSE)',note:"Find Alice and return column 2"}] },
  { name:"HLOOKUP", category:"Lookup", syntax:"HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])", description:"Searches the first row of a table and returns a value from a specified row.", args:[{name:"lookup_value",desc:"Value to find"},{name:"table_array",desc:"Horizontal table"},{name:"row_index_num",desc:"Row number to return"}], examples:[{formula:"=HLOOKUP(\"Q2\",A1:D4,3,FALSE)",note:"Find Q2 and return row 3"}] },
  { name:"INDEX", category:"Lookup", syntax:"INDEX(array, row_num, [col_num])", description:"Returns the value at a given row and column in a range.", args:[{name:"array",desc:"Range or array"},{name:"row_num",desc:"Row number"},{name:"col_num",desc:"Column number",optional:true}], examples:[{formula:"=INDEX(A1:C5,2,3)",note:"Value in row 2, col 3"},{formula:"=INDEX(A1:A10,3)",note:"3rd item in list"}] },
  { name:"MATCH", category:"Lookup", syntax:"MATCH(lookup_value, lookup_array, [match_type])", description:"Returns the position of a value in a range.", args:[{name:"lookup_value",desc:"Value to find"},{name:"lookup_array",desc:"Range to search"},{name:"match_type",desc:"0=exact, 1=less than, -1=greater than",optional:true}], examples:[{formula:'=MATCH("Alice",A1:A10,0)',note:"Position of Alice in list"},{formula:"=MATCH(MAX(A1:A10),A1:A10,0)",note:"Position of maximum value"}] },
  { name:"XLOOKUP", category:"Lookup", syntax:"XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])", description:"Searches a range and returns a result from another range. More powerful than VLOOKUP.", args:[{name:"lookup_value",desc:"Value to find"},{name:"lookup_array",desc:"Where to look"},{name:"return_array",desc:"What to return"},{name:"if_not_found",desc:"Default if not found",optional:true}], examples:[{formula:'=XLOOKUP(A1,B1:B10,C1:C10,"Not found")',note:"Flexible lookup with default"},{formula:"=XLOOKUP(MAX(A1:A5),A1:A5,B1:B5)",note:"Return name of max value"}] },
  { name:"CHOOSE", category:"Lookup", syntax:"CHOOSE(index_num, value1, [value2], ...)", description:"Returns a value from a list based on an index number.", args:[{name:"index_num",desc:"Which value to return (1–254)"},{name:"value1",desc:"First option"},{name:"value2",desc:"More options",optional:true}], examples:[{formula:'=CHOOSE(2,"Mon","Tue","Wed","Thu","Fri")',note:'Returns "Tue"'},{formula:"=CHOOSE(WEEKDAY(TODAY(),2),\"Mon\",\"Tue\",\"Wed\",\"Thu\",\"Fri\",\"Sat\",\"Sun\")",note:"Day name from date"}] },

  // ─ Statistical ─
  { name:"MEDIAN", category:"Statistical", syntax:"MEDIAN(number1, [number2], ...)", description:"Returns the median value (middle value when sorted).", args:[{name:"number1",desc:"First number or range"}], examples:[{formula:"=MEDIAN(A1:A10)",note:"Middle value of range"},{formula:"=MEDIAN(1,2,3,4,5)",note:"Returns 3"}] },
  { name:"MODE", category:"Statistical", syntax:"MODE(number1, [number2], ...)", description:"Returns the most frequently occurring value.", args:[{name:"number1",desc:"Numbers or range"}], examples:[{formula:"=MODE(A1:A10)",note:"Most common value"},{formula:"=MODE(1,2,2,3,3,3)",note:"Returns 3"}] },
  { name:"STDEV", category:"Statistical", syntax:"STDEV(number1, [number2], ...)", description:"Estimates standard deviation based on a sample.", args:[{name:"number1",desc:"Sample values"}], examples:[{formula:"=STDEV(A1:A10)",note:"Standard deviation of sample"},{formula:"=STDEV(B1:B5)",note:"Spread of values"}] },
  { name:"VAR", category:"Statistical", syntax:"VAR(number1, [number2], ...)", description:"Estimates variance based on a sample.", args:[{name:"number1",desc:"Sample values"}], examples:[{formula:"=VAR(A1:A10)",note:"Sample variance"}] },
  { name:"PERCENTILE", category:"Statistical", syntax:"PERCENTILE(array, k)", description:"Returns the k-th percentile of values (0 to 1).", args:[{name:"array",desc:"Range of values"},{name:"k",desc:"Percentile (0–1)"}], examples:[{formula:"=PERCENTILE(A1:A10,0.9)",note:"90th percentile"},{formula:"=PERCENTILE(A1:A100,0.5)",note:"Same as MEDIAN"}] },
  { name:"QUARTILE", category:"Statistical", syntax:"QUARTILE(array, quart)", description:"Returns the quartile of a dataset.", args:[{name:"array",desc:"Range of values"},{name:"quart",desc:"0=min, 1=Q1, 2=median, 3=Q3, 4=max"}], examples:[{formula:"=QUARTILE(A1:A20,1)",note:"First quartile (25th percentile)"},{formula:"=QUARTILE(A1:A20,3)-QUARTILE(A1:A20,1)",note:"Interquartile range (IQR)"}] },
  { name:"RANK", category:"Statistical", syntax:"RANK(number, ref, [order])", description:"Returns the rank of a number within a list.", args:[{name:"number",desc:"Value to rank"},{name:"ref",desc:"Range of values"},{name:"order",desc:"0=descending, 1=ascending",optional:true}], examples:[{formula:"=RANK(A1,A1:A10)",note:"Rank of A1 (1=highest)"},{formula:"=RANK(A1,A1:A10,1)",note:"Rank ascending (1=lowest)"}] },
  { name:"LARGE", category:"Statistical", syntax:"LARGE(array, k)", description:"Returns the k-th largest value.", args:[{name:"array",desc:"Range"},{name:"k",desc:"Rank (1=largest)"}], examples:[{formula:"=LARGE(A1:A10,1)",note:"Largest value (same as MAX)"},{formula:"=LARGE(A1:A10,2)",note:"Second largest value"}] },
  { name:"SMALL", category:"Statistical", syntax:"SMALL(array, k)", description:"Returns the k-th smallest value.", args:[{name:"array",desc:"Range"},{name:"k",desc:"Rank (1=smallest)"}], examples:[{formula:"=SMALL(A1:A10,1)",note:"Smallest value (same as MIN)"},{formula:"=SMALL(A1:A10,3)",note:"Third smallest value"}] },

  // ─ Financial ─
  { name:"PMT", category:"Financial", syntax:"PMT(rate, nper, pv, [fv], [type])", description:"Calculates the payment for a loan based on constant payments and a constant interest rate.", args:[{name:"rate",desc:"Interest rate per period"},{name:"nper",desc:"Total number of payments"},{name:"pv",desc:"Present value (loan amount)"},{name:"fv",desc:"Future value",optional:true},{name:"type",desc:"0=end, 1=beginning",optional:true}], examples:[{formula:"=PMT(5%/12, 360, -200000)",note:"Monthly payment on $200k mortgage at 5% for 30 years"},{formula:"=PMT(0.06/12, 48, -15000)",note:"Car loan payments"}] },
  { name:"FV", category:"Financial", syntax:"FV(rate, nper, pmt, [pv], [type])", description:"Returns the future value of an investment.", args:[{name:"rate",desc:"Interest rate per period"},{name:"nper",desc:"Number of periods"},{name:"pmt",desc:"Payment each period"},{name:"pv",desc:"Present value",optional:true}], examples:[{formula:"=FV(6%/12, 120, -500)",note:"Savings after 10 years at $500/month"},{formula:"=FV(0.08, 20, 0, -10000)",note:"Value of $10k in 20 years at 8%"}] },
  { name:"PV", category:"Financial", syntax:"PV(rate, nper, pmt, [fv], [type])", description:"Returns the present value of an investment.", args:[{name:"rate",desc:"Interest rate"},{name:"nper",desc:"Number of periods"},{name:"pmt",desc:"Payment amount"},{name:"fv",desc:"Future value",optional:true}], examples:[{formula:"=PV(8%/12, 60, -500)",note:"Loan amount for $500/month at 8% for 5 years"}] },
  { name:"NPV", category:"Financial", syntax:"NPV(rate, value1, [value2], ...)", description:"Returns the net present value of an investment using a series of cash flows.", args:[{name:"rate",desc:"Discount rate"},{name:"value1",desc:"First period cash flow"},{name:"value2",desc:"More cash flows",optional:true}], examples:[{formula:"=NPV(10%, -10000, 3000, 4000, 4000, 3000)",note:"NPV of project with 10% discount rate"}] },
  { name:"IRR", category:"Financial", syntax:"IRR(values, [guess])", description:"Returns the internal rate of return for a series of cash flows.", args:[{name:"values",desc:"Cash flows (must include negative value)"},{name:"guess",desc:"Estimated rate",optional:true}], examples:[{formula:"=IRR(A1:A6)",note:"IRR of cash flows in A1:A6 (first value = initial investment)"}] },
  { name:"SLN", category:"Financial", syntax:"SLN(cost, salvage, life)", description:"Returns the straight-line depreciation per period.", args:[{name:"cost",desc:"Initial cost"},{name:"salvage",desc:"Salvage value"},{name:"life",desc:"Useful life in periods"}], examples:[{formula:"=SLN(50000, 5000, 10)",note:"Annual depreciation of $50k asset over 10 years"}] },
  { name:"NPER", category:"Financial", syntax:"NPER(rate, pmt, pv, [fv], [type])", description:"Returns the number of periods for an investment.", args:[{name:"rate",desc:"Interest rate"},{name:"pmt",desc:"Payment amount"},{name:"pv",desc:"Present value"}], examples:[{formula:"=NPER(5%/12, -500, 50000)",note:"Months to pay off $50k at $500/month"}] },

  // ─ Info ─
  { name:"ISNUMBER", category:"Info", syntax:"ISNUMBER(value)", description:"Returns TRUE if the value is a number.", args:[{name:"value",desc:"Value to test"}], examples:[{formula:"=ISNUMBER(42)",note:"Returns TRUE"},{formula:'=ISNUMBER("hello")',note:"Returns FALSE"},{formula:"=ISNUMBER(A1)",note:"Check if A1 contains a number"}] },
  { name:"ISTEXT", category:"Info", syntax:"ISTEXT(value)", description:"Returns TRUE if the value is text.", args:[{name:"value",desc:"Value to test"}], examples:[{formula:'=ISTEXT("hello")',note:"Returns TRUE"},{formula:"=ISTEXT(42)",note:"Returns FALSE"}] },
  { name:"ISBLANK", category:"Info", syntax:"ISBLANK(value)", description:"Returns TRUE if the value is an empty cell.", args:[{name:"value",desc:"Cell reference"}], examples:[{formula:"=ISBLANK(A1)",note:"TRUE if A1 is empty"},{formula:'=IF(ISBLANK(A1),"Empty","Has data")',note:"Common pattern"}] },
  { name:"ISERROR", category:"Info", syntax:"ISERROR(value)", description:"Returns TRUE if the value is any error value.", args:[{name:"value",desc:"Value or formula"}], examples:[{formula:"=ISERROR(A1/B1)",note:"TRUE if division results in error"},{formula:"=ISERROR(VLOOKUP(A1,B:C,2,0))",note:"Detect lookup failure"}] },
  { name:"ISNA", category:"Info", syntax:"ISNA(value)", description:"Returns TRUE if the value is the #N/A error.", args:[{name:"value",desc:"Value to check"}], examples:[{formula:"=ISNA(MATCH(A1,B:B,0))",note:"TRUE if item not found"}] },
  { name:"TYPE", category:"Info", syntax:"TYPE(value)", description:"Returns a number representing the data type (1=number, 2=text, 4=boolean).", args:[{name:"value",desc:"Value to check"}], examples:[{formula:"=TYPE(42)",note:"Returns 1 (number)"},{formula:'=TYPE("text")',note:"Returns 2 (text)"},{formula:"=TYPE(TRUE)",note:"Returns 4 (boolean)"}] },
  { name:"ISODD", category:"Info", syntax:"ISODD(number)", description:"Returns TRUE if the number is odd.", args:[{name:"number",desc:"Integer to test"}], examples:[{formula:"=ISODD(3)",note:"Returns TRUE"},{formula:"=ISODD(A1)",note:"Check if A1 is odd"}] },
  { name:"ISEVEN", category:"Info", syntax:"ISEVEN(number)", description:"Returns TRUE if the number is even.", args:[{name:"number",desc:"Integer to test"}], examples:[{formula:"=ISEVEN(4)",note:"Returns TRUE"},{formula:"=ISEVEN(A1)",note:"Check if A1 is even"}] },
  { name:"N", category:"Info", syntax:"N(value)", description:"Returns a value converted to a number.", args:[{name:"value",desc:"Value to convert"}], examples:[{formula:"=N(TRUE)",note:"Returns 1"},{formula:"=N(FALSE)",note:"Returns 0"}] },
];

const CATEGORIES = ["All","Math","Text","Date","Logical","Lookup","Statistical","Financial","Info"];

/* ═══════════════════════════════════════════════════════════════════
   DEFAULT GRID DATA
═══════════════════════════════════════════════════════════════════ */

const DEFAULT_GRID: Grid = [
  ["Name","Score","Grade","Department","Salary"],
  ["Alice",95,"A","Engineering",85000],
  ["Bob",72,"C","Marketing",62000],
  ["Charlie",88,"B","Engineering",78000],
  ["Diana",91,"A","HR",71000],
  ["Eve",65,"D","Marketing",55000],
  ["Frank",80,"B","Engineering",82000],
  ["Grace",77,"C","HR",68000],
  ["Henry",93,"A","Engineering",90000],
  ["Iris",60,"D","Marketing",52000],
  ["Jack",84,"B","HR",73000],
];

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════════════════════════════════ */

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={async()=>{await navigator.clipboard.writeText(text);setDone(true);setTimeout(()=>setDone(false),1500);}} className="rounded-md border bg-[var(--bg-base)] px-2 py-0.5 text-xs text-muted hover:text-[var(--text)] transition-colors">
      {done?"✓":"Copy"}
    </button>
  );
}

function MiniSpreadsheet({ grid, setGrid }: { grid: Grid; setGrid: (g: Grid) => void }) {
  const cols = ["A","B","C","D","E"];
  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse">
        <thead>
          <tr>
            <th className="w-8 border border-[var(--border)] bg-[var(--surface-2)] px-1 py-1 text-center text-muted">#</th>
            {cols.map(c=><th key={c} className="w-28 border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 font-semibold text-center">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, ri) => (
            <tr key={ri}>
              <td className="border border-[var(--border)] bg-[var(--surface-2)] px-1 py-0.5 text-center text-muted font-semibold">{ri+1}</td>
              {cols.map((_, ci) => (
                <td key={ci} className="border border-[var(--border)] p-0">
                  <input
                    className="w-full px-1.5 py-0.5 font-mono text-xs bg-transparent outline-none focus:bg-brand-50 dark:focus:bg-brand-950/20"
                    value={String(row[ci]??"")}
                    onChange={e=>{
                      const newGrid = grid.map((r,rj)=>rj===ri?r.map((v,cj)=>cj===ci?e.target.value:v):r);
                      setGrid(newGrid);
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormulaCard({ formula, grid }: { formula: FormulaInfo; grid: Grid }) {
  const [expanded, setExpanded] = useState(false);
  const [customFormula, setCustomFormula] = useState(formula.examples[0]?.formula || "");
  const [result, setResult] = useState<{ val: CellValue; err?: string } | null>(null);

  const execute = useCallback(() => {
    const { result: val, error } = parseAndEval(customFormula, grid);
    setResult({ val, err: error });
  }, [customFormula, grid]);

  const catColors: Record<string, string> = {
    Math:"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Text:"bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Date:"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Logical:"bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Lookup:"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Statistical:"bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    Financial:"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    Info:"bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  };

  return (
    <div className={`surface rounded-2xl border transition-all ${expanded?"border-brand-400":""}`}>
      <button onClick={()=>setExpanded(!expanded)} className="flex w-full items-start gap-3 p-4 text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{formula.name}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${catColors[formula.category]||""}`}>{formula.category}</span>
          </div>
          <div className="text-xs text-muted mt-0.5 truncate">{formula.description}</div>
          {!expanded&&<div className="mt-1 font-mono text-xs text-[var(--text-muted)] truncate opacity-70">{formula.syntax}</div>}
        </div>
        <span className={`text-muted text-lg shrink-0 mt-0.5 transition-transform ${expanded?"rotate-180":""}`}>↓</span>
      </button>

      {expanded && (
        <div className="border-t border-[var(--border)] p-4 space-y-4">
          {/* Syntax */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Syntax</p>
            <code className="block rounded-lg bg-[var(--surface-2)] border px-3 py-2 font-mono text-sm">{formula.syntax}</code>
          </div>

          {/* Arguments */}
          {formula.args.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Arguments</p>
              <div className="space-y-1.5">
                {formula.args.map(arg=>(
                  <div key={arg.name} className="flex items-start gap-2 text-sm">
                    <code className={`rounded px-1.5 py-0.5 font-mono text-xs shrink-0 ${arg.optional?"bg-gray-100 dark:bg-gray-800 text-muted":"bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400"}`}>{arg.name}{arg.optional?" *":""}</code>
                    <span className="text-xs text-muted">{arg.desc}</span>
                  </div>
                ))}
                {formula.args.some(a=>a.optional)&&<p className="text-[10px] text-muted">* optional</p>}
              </div>
            </div>
          )}

          {/* Examples */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Examples</p>
            <div className="space-y-2">
              {formula.examples.map((ex,i)=>(
                <div key={i} className="surface rounded-xl border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="font-mono text-sm text-brand-600 dark:text-brand-400 flex-1">{ex.formula}</code>
                    <CopyBtn text={ex.formula} />
                    <button onClick={()=>setCustomFormula(ex.formula)} className="rounded-md border px-2 py-0.5 text-xs text-muted hover:text-brand-600 hover:border-brand-400 transition-colors">Use</button>
                  </div>
                  <p className="text-xs text-muted">{ex.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live executor */}
          <div className="bg-brand-50 dark:bg-brand-950/20 rounded-2xl border border-brand-200 dark:border-brand-800 p-4">
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-2">▶ Live Executor</p>
            <div className="flex gap-2 mb-3">
              <input
                className="input-field flex-1 font-mono text-sm"
                value={customFormula}
                onChange={e=>setCustomFormula(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&execute()}
                placeholder={`=SUM(A1:A5)`}
              />
              <button onClick={execute} className="btn-primary">Run</button>
            </div>
            {result && (
              <div className={`rounded-xl border p-3 ${result.err?"border-red-300 bg-red-50 dark:bg-red-950/20":"border-green-300 bg-green-50 dark:bg-green-950/20"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted mb-0.5">Result</p>
                    <p className={`font-mono text-lg font-bold ${result.err?"text-red-600":"text-green-700 dark:text-green-400"}`}>
                      {result.err ? result.val : typeof result.val === "boolean" ? (result.val ? "TRUE" : "FALSE") : String(result.val)}
                    </p>
                    {result.err && <p className="text-xs text-red-500 mt-1">{result.err}</p>}
                  </div>
                  {!result.err && <CopyBtn text={String(result.val)} />}
                </div>
              </div>
            )}
            <p className="text-[10px] text-muted mt-2">Uses the spreadsheet data below. Reference cells like A1, ranges like A1:A5.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPLETE EXCEL 365 FUNCTION MASTER LIST (for coverage display)
═══════════════════════════════════════════════════════════════════ */
const MASTER_LIST: string[] = [
  "ABS","ACCRINT","ACCRINTM","ACOS","ACOSH","ACOT","ACOTH","ADDRESS","AGGREGATE","AMORDEGRC","AMORLINC","AND","ARABIC","AREAS","ASC","ASIN","ASINH","ATAN","ATAN2","ATANH","AVEDEV","AVERAGE","AVERAGEA","AVERAGEIF","AVERAGEIFS","BAHTTEXT","BASE","BESSELI","BESSELJ","BESSELK","BESSELY","BETA.DIST","BETA.INV","BIN2DEC","BIN2HEX","BIN2OCT","BINOM.DIST","BINOM.INV","BITAND","BITLSHIFT","BITOR","BITRSHIFT","BITXOR","BYCOL","BYROW","CEILING","CEILING.MATH","CEILING.PRECISE","CELL","CHAR","CHISQ.DIST","CHISQ.INV","CHOOSE","CHOOSECOLS","CHOOSEROWS","CLEAN","CODE","COLUMN","COLUMNS","COMBIN","COMBINA","COMPLEX","CONCAT","CONCATENATE","CONFIDENCE.NORM","CONFIDENCE.T","CONVERT","CORREL","COS","COSH","COUNT","COUNTA","COUNTBLANK","COUNTIF","COUNTIFS","COVARIANCE.P","COVARIANCE.S","CSC","CSCH","CUMIPMT","CUMPRINC","DATE","DATEDIF","DATEVALUE","DAVERAGE","DAY","DAYS","DAYS360","DCOUNT","DCOUNTA","DDB","DEC2BIN","DEC2HEX","DEC2OCT","DECIMAL","DEGREES","DELTA","DEVSQ","DGET","DISC","DMAX","DMIN","DOLLAR","DOLLARDE","DOLLARFR","DPRODUCT","DROP","DSTDEV","DSTDEVP","DSUM","DURATION","DVAR","DVARP","EDATE","EFFECT","EOMONTH","ERF","ERFC","ERROR.TYPE","EVEN","EXACT","EXP","EXPAND","EXPON.DIST","F.DIST","F.INV","FACT","FACTDOUBLE","FALSE","FILTER","FILTERXML","FIND","FISHER","FISHERINV","FIXED","FLOOR","FLOOR.MATH","FLOOR.PRECISE","FORECAST.ETS","FORECAST.LINEAR","FORMULATEXT","FV","FVSCHEDULE","GAMMA","GAMMA.DIST","GAMMA.INV","GAMMALN","GAUSS","GCD","GEOMEAN","GESTEP","GETPIVOTDATA","GROWTH","HARMEAN","HEX2BIN","HEX2DEC","HEX2OCT","HLOOKUP","HOUR","HSTACK","HYPERLINK","IF","IFERROR","IFNA","IFS","IMABS","IMAGINARY","IMARGUMENT","IMCONJUGATE","IMCOS","IMDIV","IMEXP","IMLN","IMLOG10","IMLOG2","IMPOWER","IMPRODUCT","IMREAL","IMSIN","IMSQRT","IMSUB","IMSUM","INDEX","INDIRECT","INFO","INT","INTERCEPT","INTRATE","IPMT","IRR","ISBLANK","ISERR","ISERROR","ISEVEN","ISFORMULA","ISLOGICAL","ISNA","ISNONTEXT","ISNUMBER","ISODD","ISOMITTED","ISOWEEKNUM","ISREF","ISTEXT","LAMBDA","LARGE","LCM","LEFT","LEN","LET","LINEST","LN","LOG","LOG10","LOGEST","LOOKUP","LOWER","MAKEARRAY","MAP","MATCH","MAX","MAXA","MEDIAN","MID","MIN","MINA","MINUTE","MIRR","MOD","MODE.MULT","MODE.SNGL","MONTH","MROUND","MULTINOMIAL","N","NA","NETWORKDAYS","NOMINAL","NORM.DIST","NORM.INV","NOT","NOW","NPER","NPV","NUMBERVALUE","OCT2BIN","OCT2DEC","OCT2HEX","ODD","OFFSET","OR","PDURATION","PEARSON","PERCENTILE","PERCENTRANK","PERMUT","PHI","PI","PMT","POISSON.DIST","POWER","PPMT","PRICE","PRODUCT","PROPER","PV","QUARTILE","QUOTIENT","RADIANS","RAND","RANDARRAY","RANK.EQ","RATE","REDUCE","REPLACE","REPT","RIGHT","ROMAN","ROUND","ROUNDDOWN","ROUNDUP","ROW","ROWS","RSQ","SCAN","SEARCH","SEC","SECH","SECOND","SEQUENCE","SERIESSUM","SHEET","SHEETS","SIGN","SIN","SINH","SKEW","SLOPE","SMALL","SORT","SORTBY","SQRT","SQRTPI","STANDARDIZE","STDEV.P","STDEV.S","SUBSTITUTE","SUBTOTAL","SUM","SUMIF","SUMIFS","SUMPRODUCT","SUMSQ","SWITCH","T","T.DIST","T.INV","TAKE","TAN","TANH","TEXT","TEXTAFTER","TEXTBEFORE","TEXTJOIN","TEXTSPLIT","TIME","TIMEVALUE","TODAY","TOCOL","TOROW","TRANSPOSE","TREND","TRIM","TRUE","TRUNC","TYPE","UNICHAR","UNICODE","UNIQUE","UPPER","VALUE","VALUETOTEXT","VAR.P","VAR.S","VLOOKUP","VSTACK","WEEKDAY","WEEKNUM","WEBSERVICE","WORKDAY","WORKDAY.INTL","WRAPCOLS","WRAPROWS","XIRR","XLOOKUP","XMATCH","XNPV","XOR","YEAR","YEARFRAC","YIELD","Z.TEST",
];
const SUPPORTED_SET = new Set(Object.keys(FUNCS));
const SUPPORTED_COUNT = MASTER_LIST.filter(n => SUPPORTED_SET.has(n)).length;

/* ═══════════════════════════════════════════════════════════════════
   MAIN CLIENT COMPONENT
═══════════════════════════════════════════════════════════════════ */

export function FormulaManagerClient() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [grid, setGrid] = useState<Grid>(DEFAULT_GRID);
  const [showGrid, setShowGrid] = useState(false);
  const [globalFormula, setGlobalFormula] = useState("=SUM(B2:B11)");
  const [globalResult, setGlobalResult] = useState<CellValue | null>(null);
  const [allQuery, setAllQuery] = useState("");
  const formulaBarRef = useRef<HTMLInputElement>(null);

  const loadFn = useCallback((name: string) => {
    setGlobalFormula(`=${name}(`);
    setGlobalResult(null);
    formulaBarRef.current?.focus();
  }, []);

  const masterFiltered = useMemo(
    () => MASTER_LIST.filter(n => !allQuery || n.toLowerCase().includes(allQuery.toLowerCase())),
    [allQuery]
  );

  const filtered = useMemo(()=>FORMULA_REGISTRY.filter(f=>
    (cat==="All"||f.category===cat)&&
    (!query||f.name.toLowerCase().includes(query.toLowerCase())||f.description.toLowerCase().includes(query.toLowerCase()))
  ),[cat,query]);

  const runGlobal = useCallback(() => {
    const { result } = parseAndEval(globalFormula, grid);
    setGlobalResult(result);
  }, [globalFormula, grid]);

  const exportCsv = () => {
    const csv = grid.map(r=>r.map(c=>String(c??""==="")?`"${String(c??"")}"`:"").join(",")).join("\n");
    const a = document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="formula-data.csv"; a.click();
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
      {/* Main formula browser */}
      <div>
        {/* Search + filters */}
        <div className="mb-6 space-y-3">
          <input className="input-field w-full text-base py-3" placeholder={`Search ${FORMULA_REGISTRY.length} Excel formulas…`} value={query} onChange={e=>{setQuery(e.target.value);setCat("All");}} />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>{setCat(c);setQuery("");}} className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${cat===c?"border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400":"surface hover:border-brand-400"}`}>{c}</button>
            ))}
          </div>
          <p className="text-sm text-muted">Showing {filtered.length} of {FORMULA_REGISTRY.length} formulas</p>
        </div>

        {/* Formula cards */}
        <div className="space-y-3">
          {filtered.map(f=>(
            <FormulaCard key={f.name} formula={f} grid={grid} />
          ))}
        </div>

        {/* Complete Excel 365 coverage */}
        <div className="surface mt-8 rounded-2xl border p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Complete Excel 365 function list</h2>
              <p className="text-sm text-muted">
                <b className="text-green-600 dark:text-green-400">{SUPPORTED_COUNT}</b> of {MASTER_LIST.length} functions
                from the official A–Z master list are supported and executable below.
              </p>
            </div>
            <input
              className="input-field w-44"
              placeholder="Filter functions…"
              value={allQuery}
              onChange={e => setAllQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-72 overflow-auto">
            {masterFiltered.map(name => {
              const ok = SUPPORTED_SET.has(name);
              return (
                <button
                  key={name}
                  disabled={!ok}
                  onClick={() => loadFn(name)}
                  title={ok ? `Insert ${name}( into the formula bar` : `${name} is not available`}
                  className={`rounded-md border px-2 py-1 font-mono text-[11px] transition-colors ${
                    ok
                      ? "border-app surface hover:border-brand-400 hover:text-brand-600"
                      : "cursor-not-allowed border-dashed border-app text-muted/40 line-through"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted">
            Click any function to load it into the Formula Bar, then complete the arguments and run it
            against the sample data. {MASTER_LIST.length - SUPPORTED_COUNT > 0
              ? `${MASTER_LIST.length - SUPPORTED_COUNT} require a live Excel host (e.g. LAMBDA definitions, PivotTables) and are shown for reference.`
              : "Every function in the list is available."}
          </p>
        </div>
      </div>

      {/* Sidebar: Formula bar + Spreadsheet */}
      <div className="space-y-4">
        {/* Global formula bar */}
        <div className="surface rounded-2xl border p-4 sticky top-4">
          <p className="text-sm font-bold mb-2">Formula Bar</p>
          <p className="text-xs text-muted mb-2">Type any formula and execute it against the spreadsheet data:</p>
          <div className="flex gap-2 mb-2">
            <input
              ref={formulaBarRef}
              className="input-field flex-1 font-mono"
              placeholder="=SUM(B2:B11)"
              value={globalFormula}
              onChange={e=>setGlobalFormula(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&runGlobal()}
            />
            <button className="btn-primary" onClick={runGlobal}>▶</button>
          </div>
          {globalResult !== null && (
            <div className="rounded-xl bg-[var(--surface-2)] border px-3 py-2 flex items-center justify-between">
              <span className="font-mono text-lg font-bold text-brand-600">{typeof globalResult==="boolean"?(globalResult?"TRUE":"FALSE"):String(globalResult)}</span>
              <CopyBtn text={String(globalResult)} />
            </div>
          )}

          {/* Quick formulas */}
          <div className="mt-3">
            <p className="text-xs text-muted mb-1.5">Quick examples (click to try):</p>
            <div className="flex flex-wrap gap-1.5">
              {["=SUM(B2:B11)","=AVERAGE(B2:B11)","=MAX(B2:B11)","=COUNTIF(C2:C11,\"A\")","=VLOOKUP(\"Alice\",A2:E11,5,FALSE)","=IF(B2>80,\"Pass\",\"Fail\")","=TEXTJOIN(\", \",TRUE,A2:A11)","=RANK(B2,B2:B11)","=STDEV(B2:B11)","=PMT(5%/12,360,-200000)"].map(f=>(
                <button key={f} onClick={()=>{setGlobalFormula(f);setGlobalResult(null);formulaBarRef.current?.focus();}} className="rounded-lg border px-2 py-0.5 font-mono text-[10px] text-muted hover:border-brand-400 hover:text-brand-600 surface transition-colors">{f}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Spreadsheet data */}
        <div className="surface rounded-2xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold">Spreadsheet Data</p>
            <div className="flex gap-2">
              <button className="text-xs text-muted hover:text-brand-600" onClick={()=>setGrid(DEFAULT_GRID)}>Reset</button>
              <button className="text-xs text-muted hover:text-brand-600" onClick={exportCsv}>Export CSV</button>
              <button className="text-xs text-brand-600 hover:underline" onClick={()=>setShowGrid(!showGrid)}>{showGrid?"Hide":"Edit"}</button>
            </div>
          </div>
          <p className="text-[10px] text-muted mb-2">Use A1–E11 cell references in formulas. Click Edit to modify values.</p>
          {showGrid ? (
            <MiniSpreadsheet grid={grid} setGrid={setGrid} />
          ) : (
            <div className="overflow-x-auto">
              <table className="text-xs border-collapse w-full">
                <thead>
                  <tr>
                    <th className="border border-[var(--border)] bg-[var(--surface-2)] px-1 py-0.5 text-muted">#</th>
                    {["A","B","C","D","E"].map(c=><th key={c} className="border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 font-semibold">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {grid.slice(0,11).map((row,ri)=>(
                    <tr key={ri} className={ri===0?"font-semibold bg-[var(--surface-2)]":""}>
                      <td className="border border-[var(--border)] px-1 py-0.5 text-center text-muted bg-[var(--surface-2)]">{ri+1}</td>
                      {row.slice(0,5).map((cell,ci)=>(
                        <td key={ci} className={`border border-[var(--border)] px-2 py-0.5 font-mono truncate max-w-[80px] ${typeof cell==="number"?"text-right":""}`}>{String(cell??"")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
