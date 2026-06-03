/**
 * Extra Excel 365 formula implementations.
 * Merged into FUNCS in client.tsx.
 */

import type { CellValue, Grid } from "./types";

// ── Math helpers ────────────────────────────────────────────────────────────
const toNum = (v: CellValue): number =>
  typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) || 0 : typeof v === "boolean" ? +v : 0;
const toStr = (v: CellValue): string =>
  v === null || v === undefined ? "" : typeof v === "boolean" ? (v ? "TRUE" : "FALSE") : String(v);
const nums = (vals: CellValue[]) => vals.map(Number).filter(v => !isNaN(v) && isFinite(v));

function parseRange(range: string, grid: Grid): CellValue[] {
  const m = range.toUpperCase().match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!m) return [];
  const c1 = m[1].split("").reduce((a, c) => a * 26 + c.charCodeAt(0) - 64, 0) - 1;
  const r1 = parseInt(m[2]) - 1;
  const c2 = m[3].split("").reduce((a, c) => a * 26 + c.charCodeAt(0) - 64, 0) - 1;
  const r2 = parseInt(m[4]) - 1;
  const vals: CellValue[] = [];
  for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) vals.push(grid[r]?.[c] ?? null);
  return vals;
}

function parseRange2D(range: string, grid: Grid): CellValue[][] {
  const m = range.toUpperCase().match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!m) return [];
  const c1 = m[1].split("").reduce((a, c) => a * 26 + c.charCodeAt(0) - 64, 0) - 1;
  const r1 = parseInt(m[2]) - 1;
  const c2 = m[3].split("").reduce((a, c) => a * 26 + c.charCodeAt(0) - 64, 0) - 1;
  const r2 = parseInt(m[4]) - 1;
  const rows: CellValue[][] = [];
  for (let r = r1; r <= r2; r++) {
    const row: CellValue[] = [];
    for (let c = c1; c <= c2; c++) row.push(grid[r]?.[c] ?? null);
    rows.push(row);
  }
  return rows;
}

// ── Statistical helpers ──────────────────────────────────────────────────────
function mean(arr: number[]): number { return arr.reduce((s, v) => s + v, 0) / arr.length; }
function variance(arr: number[], sample = true): number {
  const m = mean(arr);
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - (sample ? 1 : 0));
}
function stdev(arr: number[], sample = true): number { return Math.sqrt(variance(arr, sample)); }

// Error function (Abramowitz & Stegun 7.1.26)
function erfImpl(x: number): number {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return sign * y;
}
function normCdf(x: number): number { return 0.5 * (1 + erfImpl(x / Math.SQRT2)); }
function normPdf(x: number): number { return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI); }
// Rational approximation for inverse normal CDF
function normInv(p: number): number {
  if (p <= 0 || p >= 1) return NaN;
  if (p === 0.5) return 0;
  const c0 = 2.515517, c1 = 0.802853, c2 = 0.010328;
  const d1 = 1.432788, d2 = 0.189269, d3 = 0.001308;
  const t = p < 0.5 ? Math.sqrt(-2 * Math.log(p)) : Math.sqrt(-2 * Math.log(1 - p));
  const num = c0 + t * (c1 + t * c2);
  const den = 1 + t * (d1 + t * (d2 + t * d3));
  return (p < 0.5 ? -1 : 1) * (t - num / den);
}

// Log-gamma (Lanczos)
function lgamma(z: number): number {
  const g = 7, c = [0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

// Regularised incomplete beta (for t-dist CDF)
function betaI(x: number, a: number, b: number): number {
  if (x < 0 || x > 1) return NaN;
  if (x === 0) return 0;
  if (x === 1) return 1;
  const lbeta = lgamma(a) + lgamma(b) - lgamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta);
  // Continued fraction (Lentz algorithm, simplified)
  let d = 1 - (a + b) * x / (a + 1);
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let C = 1, result = d;
  for (let m = 1; m <= 200; m++) {
    let aa = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
    C = 1 + aa / C; if (Math.abs(C) < 1e-30) C = 1e-30;
    d = 1 / d; result *= d * C;
    aa = -(a + m) * (a + b + m) * x / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
    C = 1 + aa / C; if (Math.abs(C) < 1e-30) C = 1e-30;
    d = 1 / d; const delta = d * C; result *= delta;
    if (Math.abs(delta - 1) < 1e-8) break;
  }
  return front * result / a;
}
function tCdf(t: number, df: number): number {
  const x = df / (df + t * t);
  const p = 0.5 * betaI(x, df / 2, 0.5);
  return t < 0 ? p : 1 - p;
}

// Simple t inverse (Newton-Raphson)
function tInv(p: number, df: number): number {
  let t = normInv(p);
  for (let i = 0; i < 20; i++) {
    const ft = tCdf(t, df) - p;
    const dft = Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2)) / (Math.sqrt(df * Math.PI) * Math.pow(1 + t * t / df, (df + 1) / 2));
    t -= ft / dft;
    if (Math.abs(ft) < 1e-10) break;
  }
  return t;
}

// Roman numeral
function toRoman(n: number): string {
  if (n <= 0 || n > 3999) return "#NUM!";
  const map: [number, string][] = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  let r = "";
  map.forEach(([v, s]) => { while (n >= v) { r += s; n -= v; } });
  return r;
}

function fromRoman(s: string): number {
  const m: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  return s.toUpperCase().split("").reduce((acc, c, i, a) => acc + (m[c] < (m[a[i + 1]] || 0) ? -m[c] : m[c]), 0);
}

// ── Extra functions ──────────────────────────────────────────────────────────
type FuncMap = Record<string, (args: CellValue[][], grid: Grid, rawArgs: string[]) => CellValue>;

export const EXTRA_FUNCS: FuncMap = {
  // ── Trig / Math additions ──────────────────────────────────────────────────
  "COSH":    (a) => Math.cosh(toNum(a[0]?.[0] ?? 0)),
  "SINH":    (a) => Math.sinh(toNum(a[0]?.[0] ?? 0)),
  "TANH":    (a) => Math.tanh(toNum(a[0]?.[0] ?? 0)),
  "ACOSH":   (a) => { const n = toNum(a[0]?.[0] ?? 0); return n < 1 ? "#NUM!" : Math.acosh(n); },
  "ASINH":   (a) => Math.asinh(toNum(a[0]?.[0] ?? 0)),
  "ATANH":   (a) => { const n = toNum(a[0]?.[0] ?? 0); return Math.abs(n) >= 1 ? "#NUM!" : Math.atanh(n); },
  "ACOT":    (a) => Math.PI / 2 - Math.atan(toNum(a[0]?.[0] ?? 0)),
  "ACOTH":   (a) => { const n = toNum(a[0]?.[0] ?? 0); return Math.abs(n) <= 1 ? "#NUM!" : 0.5 * Math.log((n + 1) / (n - 1)); },
  "COS":     (a) => Math.cos(toNum(a[0]?.[0] ?? 0) * Math.PI / 180),
  "SEC":     (a) => { const c = Math.cos(toNum(a[0]?.[0] ?? 0) * Math.PI / 180); return c === 0 ? "#DIV/0!" : 1 / c; },
  "SECH":    (a) => 1 / Math.cosh(toNum(a[0]?.[0] ?? 0)),
  "CSC":     (a) => { const s = Math.sin(toNum(a[0]?.[0] ?? 0) * Math.PI / 180); return s === 0 ? "#DIV/0!" : 1 / s; },
  "CSCH":    (a) => { const s = Math.sinh(toNum(a[0]?.[0] ?? 0)); return s === 0 ? "#DIV/0!" : 1 / s; },
  "COT":     (a) => { const t = Math.tan(toNum(a[0]?.[0] ?? 0) * Math.PI / 180); return t === 0 ? "#DIV/0!" : 1 / t; },
  "COTH":    (a) => { const n = toNum(a[0]?.[0] ?? 0); return n === 0 ? "#DIV/0!" : Math.cosh(n) / Math.sinh(n); },
  "DEGREES": (a) => toNum(a[0]?.[0] ?? 0) * 180 / Math.PI,
  "RADIANS": (a) => toNum(a[0]?.[0] ?? 0) * Math.PI / 180,
  "SQRTPI":  (a) => { const n = toNum(a[0]?.[0] ?? 0); return n < 0 ? "#NUM!" : Math.sqrt(n * Math.PI); },
  "SIGN":    (a) => Math.sign(toNum(a[0]?.[0] ?? 0)),
  "EVEN":    (a) => { const n = Math.ceil(Math.abs(toNum(a[0]?.[0] ?? 0)) / 2) * 2; return toNum(a[0]?.[0] ?? 0) < 0 ? -n : n; },
  "ODD":     (a) => { const v = toNum(a[0]?.[0] ?? 0); const n = Math.ceil(Math.abs(v)); const o = n % 2 === 0 ? n + 1 : n; return v < 0 ? -o : o; },
  "TRUNC":   (a) => Math.trunc(toNum(a[0]?.[0] ?? 0)),
  "MROUND":  (a) => { const n = toNum(a[0]?.[0] ?? 0), m = toNum(a[1]?.[0] ?? 1); return m === 0 ? "#DIV/0!" : Math.round(n / m) * m; },
  "QUOTIENT":(a) => Math.trunc(toNum(a[0]?.[0] ?? 0) / toNum(a[1]?.[0] ?? 1)),
  "PRODUCT": (a, g, r) => r.flatMap(arg => arg.includes(":") ? nums(parseRange(arg, g)) : [toNum(a[r.indexOf(arg)]?.[0] ?? 1)]).reduce((p, v) => p * v, 1),
  "SUMSQ":   (a, g, r) => r.flatMap(arg => arg.includes(":") ? nums(parseRange(arg, g)) : [toNum(a[r.indexOf(arg)]?.[0] ?? 0)]).reduce((s, v) => s + v * v, 0),
  "DEVSQ":   (a, g, r) => { const n = nums(r.flatMap(arg => arg.includes(":") ? parseRange(arg, g) : [a[r.indexOf(arg)]?.[0]])); const m = mean(n); return n.reduce((s, v) => s + (v - m) ** 2, 0); },
  "SUMIFS":  (a, g, r) => {
    const sumRng = parseRange(r[0], g);
    let result = 0;
    for (let i = 1; i < r.length - 1; i += 2) {
      const critRng = parseRange(r[i], g);
      const crit = toStr(a[i]?.[0] ?? "");
      const m = crit.match(/^([<>=!]+)(.*)/);
      sumRng.forEach((sv, idx) => {
        const v = critRng[idx];
        const match = m && m[2] != null
          ? ((op: string, val: string) => { const nv = parseFloat(val); return op === ">" ? toNum(v) > nv : op === "<" ? toNum(v) < nv : op === ">=" ? toNum(v) >= nv : op === "<=" ? toNum(v) <= nv : op === "<>" ? String(v) !== val : false; })(m[1], m[2])
          : String(v).toLowerCase() === crit.toLowerCase();
        if (match) result += toNum(sv ?? 0);
      });
    }
    return result;
  },
  "COUNTIFS": (a, g, r) => {
    if (r.length < 2) return 0;
    const firstRng = parseRange(r[0], g);
    return firstRng.filter((_, idx) => {
      for (let i = 0; i < r.length - 1; i += 2) {
        const critRng = parseRange(r[i], g);
        const crit = toStr(a[i]?.[0] ?? "");
        const v = critRng[idx];
        const m = crit.match(/^([<>=!]+)(.*)/);
        const match = m && m[2] != null
          ? ((op: string, val: string) => { const nv = parseFloat(val); return op === ">" ? toNum(v) > nv : op === "<" ? toNum(v) < nv : op === ">=" ? toNum(v) >= nv : op === "<=" ? toNum(v) <= nv : op === "<>" ? String(v) !== val : false; })(m[1], m[2])
          : String(v).toLowerCase() === crit.toLowerCase();
        if (!match) return false;
      }
      return true;
    }).length;
  },
  "COUNTBLANK": (a, g, r) => parseRange(r[0], g).filter(v => v === null || v === "").length,
  "FACTDOUBLE": (a) => { let n = Math.abs(Math.floor(toNum(a[0]?.[0] ?? 0))), r = 1; while (n > 0) { r *= n; n -= 2; } return r; },
  "COMBINA": (a) => {
    const n = toNum(a[0]?.[0] ?? 0), k = toNum(a[1]?.[0] ?? 0);
    if (n === 0 && k === 0) return 1;
    const N = n + k - 1;
    let r = 1;
    for (let i = 0; i < k; i++) r = r * (N - i) / (i + 1);
    return Math.round(r);
  },
  "PERMUT":  (a) => { const n = toNum(a[0]?.[0] ?? 0), k = toNum(a[1]?.[0] ?? 0); if (k > n) return "#NUM!"; let r = 1; for (let i = 0; i < k; i++) r *= n - i; return r; },
  "MULTINOMIAL": (a) => {
    const ns = a.map(ar => Math.floor(toNum(ar[0] ?? 0)));
    const total = ns.reduce((s, v) => s + v, 0);
    let num = 1; for (let i = 2; i <= total; i++) num *= i;
    let den = 1; for (const n of ns) { for (let i = 2; i <= n; i++) den *= i; }
    return num / den;
  },
  "SERIESSUM": (a) => {
    const x = toNum(a[0]?.[0] ?? 0), n0 = toNum(a[1]?.[0] ?? 0), m = toNum(a[2]?.[0] ?? 1);
    const coefs = a.slice(3).map(ar => toNum(ar[0] ?? 0));
    return coefs.reduce((s, c, i) => s + c * Math.pow(x, n0 + i * m), 0);
  },
  "BASE":    (a) => { const n = Math.floor(toNum(a[0]?.[0] ?? 0)), b = Math.floor(toNum(a[1]?.[0] ?? 2)), minLen = toNum(a[2]?.[0] ?? 0); if (b < 2 || b > 36) return "#NUM!"; return n.toString(b).toUpperCase().padStart(minLen, "0"); },
  "DECIMAL": (a) => { const s = toStr(a[0]?.[0]), b = Math.floor(toNum(a[1]?.[0] ?? 10)); return parseInt(s, b); },
  "ARABIC":  (a) => fromRoman(toStr(a[0]?.[0])),
  "ROMAN":   (a) => toRoman(Math.floor(toNum(a[0]?.[0] ?? 0))),
  "SUBTOTAL": (a, g, r) => {
    const funcNum = Math.floor(toNum(a[0]?.[0] ?? 1)) % 100;
    const vals = r.slice(1).flatMap(arg => arg.includes(":") ? nums(parseRange(arg, g)) : [toNum(a[r.indexOf(arg)]?.[0] ?? 0)]);
    switch (funcNum) {
      case 1: return vals.reduce((s, v) => s + v, 0) / (vals.length || 1);
      case 2: return vals.length;
      case 3: return vals.length;
      case 4: return vals.length ? Math.max(...vals) : "#NUM!";
      case 5: return vals.length ? Math.min(...vals) : "#NUM!";
      case 6: return vals.reduce((p, v) => p * v, 1);
      case 7: return stdev(vals, true);
      case 8: return stdev(vals, false);
      case 9: return vals.reduce((s, v) => s + v, 0);
      case 10: return variance(vals, true);
      case 11: return variance(vals, false);
      default: return "#VALUE!";
    }
  },

  // ── Text additions ─────────────────────────────────────────────────────────
  "DOLLAR": (a) => {
    const n = toNum(a[0]?.[0] ?? 0), d = toNum(a[1]?.[0] ?? 2);
    const s = Math.abs(n).toFixed(Math.max(0, d));
    const parts = s.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formatted = d > 0 ? parts.join(".") : parts[0];
    return (n < 0 ? "($" : "$") + formatted + (n < 0 ? ")" : "");
  },
  "UNICHAR": (a) => String.fromCodePoint(Math.floor(toNum(a[0]?.[0] ?? 0))),
  "UNICODE": (a) => { const s = toStr(a[0]?.[0]); return s ? s.codePointAt(0) ?? "#VALUE!" : "#VALUE!"; },
  "VALUETOTEXT": (a) => toStr(a[0]?.[0]),
  "NUMBERVALUE": (a) => parseFloat(toStr(a[0]?.[0]).replace(/,/g, "")),
  "TEXTAFTER": (a) => {
    const text = toStr(a[0]?.[0]), delim = toStr(a[1]?.[0]);
    const idx = text.indexOf(delim);
    return idx === -1 ? "#N/A" : text.slice(idx + delim.length);
  },
  "TEXTBEFORE": (a) => {
    const text = toStr(a[0]?.[0]), delim = toStr(a[1]?.[0]);
    const idx = text.indexOf(delim);
    return idx === -1 ? "#N/A" : text.slice(0, idx);
  },
  "TEXTSPLIT": (a) => {
    const text = toStr(a[0]?.[0]), colDelim = toStr(a[1]?.[0]), rowDelim = toStr(a[2]?.[0] ?? "");
    if (!rowDelim) return text.split(colDelim).join(" | ");
    return text.split(rowDelim).map(r => r.split(colDelim).join(" | ")).join("\n");
  },
  "TRIM":    (a) => toStr(a[0]?.[0]).replace(/\s+/g, " ").trim(),
  "BAHTTEXT":(a) => `฿${toNum(a[0]?.[0] ?? 0).toFixed(2)} (Thai Baht text not supported)`,

  // ── Date additions ─────────────────────────────────────────────────────────
  "TIME": (a) => {
    const h = toNum(a[0]?.[0] ?? 0), m2 = toNum(a[1]?.[0] ?? 0), s = toNum(a[2]?.[0] ?? 0);
    const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
    return `${pad(h)}:${pad(m2)}:${pad(s)}`;
  },
  "TIMEVALUE": (a) => {
    const s = toStr(a[0]?.[0]);
    const [h, m2, sec] = s.split(":").map(Number);
    return ((h || 0) * 3600 + (m2 || 0) * 60 + (sec || 0)) / 86400;
  },
  "DATEVALUE": (a) => { const d = new Date(toStr(a[0]?.[0])); return isNaN(d.getTime()) ? "#VALUE!" : d.toLocaleDateString("en-US"); },
  "WEEKNUM": (a) => {
    const d = new Date(toStr(a[0]?.[0]));
    const jan1 = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  },
  "ISOWEEKNUM": (a) => {
    const d = new Date(toStr(a[0]?.[0]));
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  },
  "DAYS360": (a) => {
    const d1 = new Date(toStr(a[0]?.[0])), d2 = new Date(toStr(a[1]?.[0]));
    const y1 = d1.getFullYear(), m1 = d1.getMonth(), day1 = Math.min(d1.getDate(), 30);
    const y2 = d2.getFullYear(), m2 = d2.getMonth(), day2 = Math.min(d2.getDate(), 30);
    return (y2 - y1) * 360 + (m2 - m1) * 30 + (day2 - day1);
  },
  "YEARFRAC": (a) => {
    const d1 = new Date(toStr(a[0]?.[0])), d2 = new Date(toStr(a[1]?.[0]));
    const days = (d2.getTime() - d1.getTime()) / 86400000;
    const basis = toNum(a[2]?.[0] ?? 0);
    return basis === 1 ? days / (d1.getFullYear() % 4 === 0 ? 366 : 365) : days / 360;
  },
  "NETWORKDAYS": (a) => {
    const d1 = new Date(toStr(a[0]?.[0])), d2 = new Date(toStr(a[1]?.[0]));
    let count = 0;
    const cur = new Date(d1);
    while (cur <= d2) { const wd = cur.getDay(); if (wd !== 0 && wd !== 6) count++; cur.setDate(cur.getDate() + 1); }
    return count;
  },
  "WORKDAY": (a) => {
    const d = new Date(toStr(a[0]?.[0])), days = Math.floor(toNum(a[1]?.[0] ?? 0));
    let count = 0, step = days > 0 ? 1 : -1;
    while (count !== Math.abs(days)) { d.setDate(d.getDate() + step); const wd = d.getDay(); if (wd !== 0 && wd !== 6) count++; }
    return d.toLocaleDateString("en-US");
  },
  "HOUR":    (a) => { const d = new Date(toStr(a[0]?.[0])); return isNaN(d.getTime()) ? "#VALUE!" : d.getHours(); },
  "MINUTE":  (a) => { const d = new Date(toStr(a[0]?.[0])); return isNaN(d.getTime()) ? "#VALUE!" : d.getMinutes(); },
  "SECOND":  (a) => { const d = new Date(toStr(a[0]?.[0])); return isNaN(d.getTime()) ? "#VALUE!" : d.getSeconds(); },

  // ── Statistical additions ───────────────────────────────────────────────────
  "AVEDEV": (a, g, r) => {
    const n = nums(r.flatMap(arg => arg.includes(":") ? parseRange(arg, g) : [a[r.indexOf(arg)]?.[0]]));
    const m = mean(n);
    return n.reduce((s, v) => s + Math.abs(v - m), 0) / n.length;
  },
  "AVERAGEA": (a, g, r) => {
    const vals = r.flatMap(arg => arg.includes(":") ? parseRange(arg, g) : [a[r.indexOf(arg)]?.[0]])
      .filter(v => v !== null).map(v => typeof v === "boolean" ? +v : typeof v === "string" ? 0 : toNum(v));
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : "#DIV/0!";
  },
  "AVERAGEIFS": (a, g, r) => {
    const avgRng = parseRange(r[0], g);
    const matched: number[] = [];
    avgRng.forEach((sv, idx) => {
      let ok = true;
      for (let i = 1; i < r.length - 1; i += 2) {
        const critRng = parseRange(r[i], g);
        const crit = toStr(a[i]?.[0] ?? "");
        const v = critRng[idx];
        const m = crit.match(/^([<>=!]+)(.*)/);
        const match = m && m[2] != null
          ? ((op: string, val: string) => { const nv = parseFloat(val); return op === ">" ? toNum(v) > nv : op === "<" ? toNum(v) < nv : op === ">=" ? toNum(v) >= nv : op === "<=" ? toNum(v) <= nv : op === "<>" ? String(v) !== val : false; })(m[1], m[2])
          : String(v).toLowerCase() === crit.toLowerCase();
        if (!match) { ok = false; break; }
      }
      if (ok) matched.push(toNum(sv ?? 0));
    });
    return matched.length ? matched.reduce((s, v) => s + v, 0) / matched.length : "#DIV/0!";
  },
  "MAXA": (a, g, r) => {
    const vals = r.flatMap(arg => arg.includes(":") ? parseRange(arg, g) : [a[r.indexOf(arg)]?.[0]])
      .filter(v => v !== null).map(v => typeof v === "boolean" ? +v : toNum(v));
    return vals.length ? Math.max(...vals) : "#NUM!";
  },
  "MINA": (a, g, r) => {
    const vals = r.flatMap(arg => arg.includes(":") ? parseRange(arg, g) : [a[r.indexOf(arg)]?.[0]])
      .filter(v => v !== null).map(v => typeof v === "boolean" ? +v : toNum(v));
    return vals.length ? Math.min(...vals) : "#NUM!";
  },
  "MODE.SNGL": (a, g, r) => {
    const n = nums(r.flatMap(arg => arg.includes(":") ? parseRange(arg, g) : [a[r.indexOf(arg)]?.[0]]));
    if (!n.length) return "#N/A";
    const f = n.reduce((acc, v) => ({ ...acc, [v]: (acc[v] || 0) + 1 }), {} as Record<number, number>);
    const max = Math.max(...Object.values(f));
    const mode = Object.entries(f).find(([, c]) => c === max)?.[0];
    return mode ? parseFloat(mode) : "#N/A";
  },
  "MODE.MULT": (a, g, r) => {
    const n = nums(r.flatMap(arg => arg.includes(":") ? parseRange(arg, g) : [a[r.indexOf(arg)]?.[0]]));
    const f = n.reduce((acc, v) => ({ ...acc, [v]: (acc[v] || 0) + 1 }), {} as Record<number, number>);
    const max = Math.max(...Object.values(f));
    return Object.entries(f).filter(([, c]) => c === max).map(([v]) => parseFloat(v)).join(", ");
  },
  "STDEV.S": (a, g, r) => { const n = nums(r.flatMap(arg => arg.includes(":") ? parseRange(arg, g) : [a[r.indexOf(arg)]?.[0]])); return n.length < 2 ? "#DIV/0!" : stdev(n, true); },
  "STDEV.P": (a, g, r) => { const n = nums(r.flatMap(arg => arg.includes(":") ? parseRange(arg, g) : [a[r.indexOf(arg)]?.[0]])); return n.length < 1 ? "#DIV/0!" : stdev(n, false); },
  "VAR.S": (a, g, r) => { const n = nums(r.flatMap(arg => arg.includes(":") ? parseRange(arg, g) : [a[r.indexOf(arg)]?.[0]])); return n.length < 2 ? "#DIV/0!" : variance(n, true); },
  "VAR.P": (a, g, r) => { const n = nums(r.flatMap(arg => arg.includes(":") ? parseRange(arg, g) : [a[r.indexOf(arg)]?.[0]])); return n.length < 1 ? "#DIV/0!" : variance(n, false); },
  "CORREL": (a, g, r) => {
    const x = nums(parseRange(r[0], g)), y = nums(parseRange(r[1], g));
    if (x.length !== y.length || x.length < 2) return "#N/A";
    const mx = mean(x), my = mean(y);
    const num = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
    const den = Math.sqrt(x.reduce((s, xi) => s + (xi - mx) ** 2, 0) * y.reduce((s, yi) => s + (yi - my) ** 2, 0));
    return den === 0 ? "#DIV/0!" : num / den;
  },
  "PEARSON": (a, g, r) => {
    const x = nums(parseRange(r[0], g)), y = nums(parseRange(r[1], g));
    const mx = mean(x), my = mean(y);
    const num = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
    const den = Math.sqrt(x.reduce((s, xi) => s + (xi - mx) ** 2, 0) * y.reduce((s, yi) => s + (yi - my) ** 2, 0));
    return den === 0 ? "#DIV/0!" : num / den;
  },
  "RSQ": (a, g, r) => {
    const x = nums(parseRange(r[0], g)), y = nums(parseRange(r[1], g));
    const mx = mean(x), my = mean(y);
    const num = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
    const den = Math.sqrt(x.reduce((s, xi) => s + (xi - mx) ** 2, 0) * y.reduce((s, yi) => s + (yi - my) ** 2, 0));
    const r2 = den === 0 ? 0 : num / den;
    return r2 * r2;
  },
  "SLOPE": (a, g, r) => {
    const y = nums(parseRange(r[0], g)), x = nums(parseRange(r[1], g));
    const mx = mean(x), my = mean(y);
    const num = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
    const den = x.reduce((s, xi) => s + (xi - mx) ** 2, 0);
    return den === 0 ? "#DIV/0!" : num / den;
  },
  "INTERCEPT": (a, g, r) => {
    const y = nums(parseRange(r[0], g)), x = nums(parseRange(r[1], g));
    const mx = mean(x), my = mean(y);
    const num = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
    const den = x.reduce((s, xi) => s + (xi - mx) ** 2, 0);
    const slope = den === 0 ? 0 : num / den;
    return my - slope * mx;
  },
  "FORECAST.LINEAR": (a, g, r) => {
    const xv = toNum(a[0]?.[0] ?? 0);
    const y = nums(parseRange(r[1], g)), x = nums(parseRange(r[2], g));
    const mx = mean(x), my = mean(y);
    const num = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
    const den = x.reduce((s, xi) => s + (xi - mx) ** 2, 0);
    const slope = den === 0 ? 0 : num / den;
    return my + slope * (xv - mx);
  },
  "GEOMEAN": (a, g, r) => {
    const n = nums(r.flatMap(arg => arg.includes(":") ? parseRange(arg, g) : [a[r.indexOf(arg)]?.[0]]));
    if (n.some(v => v <= 0)) return "#NUM!";
    return Math.pow(n.reduce((p, v) => p * v, 1), 1 / n.length);
  },
  "HARMEAN": (a, g, r) => {
    const n = nums(r.flatMap(arg => arg.includes(":") ? parseRange(arg, g) : [a[r.indexOf(arg)]?.[0]]));
    if (n.some(v => v <= 0)) return "#NUM!";
    return n.length / n.reduce((s, v) => s + 1 / v, 0);
  },
  "SKEW": (a, g, r) => {
    const n = nums(r.flatMap(arg => arg.includes(":") ? parseRange(arg, g) : [a[r.indexOf(arg)]?.[0]]));
    if (n.length < 3) return "#DIV/0!";
    const m = mean(n), s = stdev(n);
    if (s === 0) return "#DIV/0!";
    const len = n.length;
    return (len / ((len - 1) * (len - 2))) * n.reduce((sum, v) => sum + ((v - m) / s) ** 3, 0);
  },
  "NORM.DIST": (a) => {
    const x = toNum(a[0]?.[0] ?? 0), mu = toNum(a[1]?.[0] ?? 0), sigma = toNum(a[2]?.[0] ?? 1), cumul = a[3]?.[0] !== false && a[3]?.[0] !== 0 && a[3]?.[0] !== "FALSE";
    if (sigma <= 0) return "#NUM!";
    const z = (x - mu) / sigma;
    return cumul ? normCdf(z) : normPdf(z) / sigma;
  },
  "NORM.INV": (a) => {
    const p = toNum(a[0]?.[0] ?? 0), mu = toNum(a[1]?.[0] ?? 0), sigma = toNum(a[2]?.[0] ?? 1);
    return mu + sigma * normInv(p);
  },
  "NORM.S.DIST": (a) => {
    const z = toNum(a[0]?.[0] ?? 0), cumul = a[1]?.[0] !== false;
    return cumul ? normCdf(z) : normPdf(z);
  },
  "NORM.S.INV": (a) => normInv(toNum(a[0]?.[0] ?? 0)),
  "STANDARDIZE": (a) => (toNum(a[0]?.[0] ?? 0) - toNum(a[1]?.[0] ?? 0)) / toNum(a[2]?.[0] ?? 1),
  "GAUSS": (a) => normCdf(toNum(a[0]?.[0] ?? 0)) - 0.5,
  "PHI": (a) => normPdf(toNum(a[0]?.[0] ?? 0)),
  "T.DIST": (a) => {
    const t = toNum(a[0]?.[0] ?? 0), df = toNum(a[1]?.[0] ?? 1), tails = toNum(a[2]?.[0] ?? 2);
    const p = tCdf(t, df);
    return tails === 2 ? 2 * Math.min(p, 1 - p) : p;
  },
  "T.DIST.2T": (a) => { const t = toNum(a[0]?.[0] ?? 0), df = toNum(a[1]?.[0] ?? 1); return 2 * Math.min(tCdf(t, df), 1 - tCdf(t, df)); },
  "T.DIST.RT": (a) => { const t = toNum(a[0]?.[0] ?? 0), df = toNum(a[1]?.[0] ?? 1); return 1 - tCdf(t, df); },
  "T.INV": (a) => tInv(toNum(a[0]?.[0] ?? 0.05), toNum(a[1]?.[0] ?? 1)),
  "T.INV.2T": (a) => tInv(1 - toNum(a[0]?.[0] ?? 0.05) / 2, toNum(a[1]?.[0] ?? 1)),
  "CONFIDENCE.NORM": (a) => {
    const alpha = toNum(a[0]?.[0] ?? 0.05), sigma = toNum(a[1]?.[0] ?? 1), n = toNum(a[2]?.[0] ?? 1);
    return normInv(1 - alpha / 2) * sigma / Math.sqrt(n);
  },
  "CONFIDENCE.T": (a) => {
    const alpha = toNum(a[0]?.[0] ?? 0.05), sigma = toNum(a[1]?.[0] ?? 1), n = toNum(a[2]?.[0] ?? 2);
    return tInv(1 - alpha / 2, n - 1) * sigma / Math.sqrt(n);
  },
  "Z.TEST": (a, g, r) => {
    const arr = nums(parseRange(r[1], g));
    const x = toNum(a[0]?.[0] ?? 0), mu = toNum(a[1]?.[0] ?? 0);
    const sigma = a[2] ? toNum(a[2]?.[0] ?? 1) : stdev(arr);
    const z = (mean(arr) - mu) / (sigma / Math.sqrt(arr.length));
    return 1 - normCdf(z);
  },
  "EXPON.DIST": (a) => {
    const x = toNum(a[0]?.[0] ?? 0), lambda = toNum(a[1]?.[0] ?? 1), cumul = a[2]?.[0] !== false;
    if (x < 0 || lambda <= 0) return "#NUM!";
    return cumul ? 1 - Math.exp(-lambda * x) : lambda * Math.exp(-lambda * x);
  },
  "PERCENTRANK": (a, g, r) => {
    const arr = nums(parseRange(r[0], g)).sort((a, b) => a - b);
    const x = toNum(a[0]?.[0] ?? 0);
    const idx = arr.indexOf(x);
    if (idx === -1) return "#N/A";
    return idx / (arr.length - 1);
  },
  "RANK.EQ": (a, g, r) => {
    const v = toNum(a[0]?.[0] ?? 0), arr = nums(parseRange(r[1], g)), order = toNum(a[2]?.[0] ?? 0);
    const sorted = order === 0 ? [...arr].sort((a, b) => b - a) : [...arr].sort((a, b) => a - b);
    const idx = sorted.indexOf(v);
    return idx === -1 ? "#N/A" : idx + 1;
  },
  "TREND": (a, g, r) => {
    const y = nums(parseRange(r[0], g)), x = nums(r[1] ? parseRange(r[1], g) : Array.from({ length: y.length }, (_, i) => i + 1));
    const mx = mean(x), my = mean(y);
    const num = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
    const den = x.reduce((s, xi) => s + (xi - mx) ** 2, 0);
    const slope = den === 0 ? 0 : num / den;
    const intercept = my - slope * mx;
    const newX = r[2] ? nums(parseRange(r[2], g)) : x;
    return newX.map(xi => slope * xi + intercept).join(", ");
  },
  "BINOM.DIST": (a) => {
    const k = Math.floor(toNum(a[0]?.[0] ?? 0)), n = Math.floor(toNum(a[1]?.[0] ?? 0)), p = toNum(a[2]?.[0] ?? 0), cumul = a[3]?.[0] !== false;
    const comb = (n: number, k: number) => { let r = 1; for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1); return r; };
    const pmf = (ki: number) => comb(n, ki) * Math.pow(p, ki) * Math.pow(1 - p, n - ki);
    if (cumul) { let s = 0; for (let i = 0; i <= k; i++) s += pmf(i); return s; }
    return pmf(k);
  },
  "POISSON.DIST": (a) => {
    const k = Math.floor(toNum(a[0]?.[0] ?? 0)), lambda = toNum(a[1]?.[0] ?? 1), cumul = a[2]?.[0] !== false;
    const pmf = (ki: number) => Math.pow(lambda, ki) * Math.exp(-lambda) / (() => { let f = 1; for (let i = 2; i <= ki; i++) f *= i; return f; })();
    if (cumul) { let s = 0; for (let i = 0; i <= k; i++) s += pmf(i); return s; }
    return pmf(k);
  },
  "COVARIANCE.P": (a, g, r) => {
    const x = nums(parseRange(r[0], g)), y = nums(parseRange(r[1], g));
    const mx = mean(x), my = mean(y);
    return x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0) / x.length;
  },
  "COVARIANCE.S": (a, g, r) => {
    const x = nums(parseRange(r[0], g)), y = nums(parseRange(r[1], g));
    const mx = mean(x), my = mean(y);
    return x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0) / (x.length - 1);
  },
  "GAMMA": (a) => Math.exp(lgamma(toNum(a[0]?.[0] ?? 1))),
  "GAMMALN": (a) => lgamma(toNum(a[0]?.[0] ?? 1)),
  "ERF": (a) => erfImpl(toNum(a[0]?.[0] ?? 0)),
  "ERFC": (a) => 1 - erfImpl(toNum(a[0]?.[0] ?? 0)),

  // ── Financial additions ─────────────────────────────────────────────────────
  "EFFECT": (a) => { const nom = toNum(a[0]?.[0] ?? 0), nper = toNum(a[1]?.[0] ?? 1); return Math.pow(1 + nom / nper, nper) - 1; },
  "NOMINAL": (a) => { const eff = toNum(a[0]?.[0] ?? 0), nper = toNum(a[1]?.[0] ?? 1); return (Math.pow(1 + eff, 1 / nper) - 1) * nper; },
  "PDURATION": (a) => { const rate = toNum(a[0]?.[0] ?? 0), pv = toNum(a[1]?.[0] ?? 0), fv = toNum(a[2]?.[0] ?? 0); return (Math.log(fv) - Math.log(pv)) / Math.log(1 + rate); },
  "RATE": (a) => {
    const nper = toNum(a[0]?.[0] ?? 1), pmt = toNum(a[1]?.[0] ?? 0), pv = toNum(a[2]?.[0] ?? 0), fv = toNum(a[3]?.[0] ?? 0);
    let rate = 0.1;
    for (let i = 0; i < 100; i++) {
      const r = Math.pow(1 + rate, nper);
      const f = pv * r + pmt * (r - 1) / rate + fv;
      const df = nper * pv * Math.pow(1 + rate, nper - 1) + pmt * ((r - 1) / (rate * rate) - nper * r / rate);
      const newRate = rate - f / df;
      if (Math.abs(newRate - rate) < 1e-10) { rate = newRate; break; }
      rate = newRate;
    }
    return rate;
  },
  "IPMT": (a) => {
    const rate = toNum(a[0]?.[0] ?? 0), per = toNum(a[1]?.[0] ?? 1), nper = toNum(a[2]?.[0] ?? 1), pv = toNum(a[3]?.[0] ?? 0), fv = toNum(a[4]?.[0] ?? 0);
    const pmt = -(rate * (pv * Math.pow(1 + rate, nper) + fv)) / ((Math.pow(1 + rate, nper) - 1));
    const bal = pv * Math.pow(1 + rate, per - 1) + pmt * (Math.pow(1 + rate, per - 1) - 1) / rate;
    return -bal * rate;
  },
  "PPMT": (a) => {
    const rate = toNum(a[0]?.[0] ?? 0), per = toNum(a[1]?.[0] ?? 1), nper = toNum(a[2]?.[0] ?? 1), pv = toNum(a[3]?.[0] ?? 0), fv = toNum(a[4]?.[0] ?? 0);
    const pmt = -(rate * (pv * Math.pow(1 + rate, nper) + fv)) / ((Math.pow(1 + rate, nper) - 1));
    const ipmt_calc = -(pv * Math.pow(1 + rate, per - 1) + pmt * (Math.pow(1 + rate, per - 1) - 1) / rate) * rate;
    return pmt - ipmt_calc;
  },
  "CUMIPMT": (a) => {
    const rate = toNum(a[0]?.[0] ?? 0), nper = toNum(a[1]?.[0] ?? 1), pv = toNum(a[2]?.[0] ?? 0), start = toNum(a[3]?.[0] ?? 1), end = toNum(a[4]?.[0] ?? 1);
    const pmt = -(rate * (pv * Math.pow(1 + rate, nper))) / ((Math.pow(1 + rate, nper) - 1));
    let total = 0;
    for (let per = start; per <= end; per++) {
      const bal = pv * Math.pow(1 + rate, per - 1) + pmt * (Math.pow(1 + rate, per - 1) - 1) / rate;
      total += -bal * rate;
    }
    return total;
  },
  "CUMPRINC": (a) => {
    const rate = toNum(a[0]?.[0] ?? 0), nper = toNum(a[1]?.[0] ?? 1), pv = toNum(a[2]?.[0] ?? 0), start = toNum(a[3]?.[0] ?? 1), end = toNum(a[4]?.[0] ?? 1);
    const pmt = -(rate * (pv * Math.pow(1 + rate, nper))) / ((Math.pow(1 + rate, nper) - 1));
    let total = 0;
    for (let per = start; per <= end; per++) {
      const bal = pv * Math.pow(1 + rate, per - 1) + pmt * (Math.pow(1 + rate, per - 1) - 1) / rate;
      const ipmt_v = -bal * rate;
      total += pmt - ipmt_v;
    }
    return total;
  },
  "DDB": (a) => {
    const cost = toNum(a[0]?.[0] ?? 0), salvage = toNum(a[1]?.[0] ?? 0), life = toNum(a[2]?.[0] ?? 1), period = toNum(a[3]?.[0] ?? 1), factor = toNum(a[4]?.[0] ?? 2);
    const rate = factor / life;
    let bv = cost;
    for (let i = 1; i < period; i++) bv -= Math.min(bv * rate, bv - salvage);
    return Math.min(bv * rate, bv - salvage);
  },
  "FVSCHEDULE": (a) => {
    const pv = toNum(a[0]?.[0] ?? 0);
    const rates = a.slice(1).map(ar => toNum(ar[0] ?? 0));
    return rates.reduce((v, r) => v * (1 + r), pv);
  },
  "MIRR": (a, g, r) => {
    const cfs = nums(parseRange(r[0], g));
    const finRate = toNum(a[1]?.[0] ?? 0), reinvRate = toNum(a[2]?.[0] ?? 0);
    const n = cfs.length;
    const negNPV = cfs.reduce((s, v, i) => s + (v < 0 ? v / Math.pow(1 + finRate, i) : 0), 0);
    const posFV = cfs.reduce((s, v, i) => s + (v > 0 ? v * Math.pow(1 + reinvRate, n - 1 - i) : 0), 0);
    return Math.pow(posFV / -negNPV, 1 / (n - 1)) - 1;
  },
  "XNPV": (a, g, r) => {
    const rate = toNum(a[0]?.[0] ?? 0);
    const cfs = nums(parseRange(r[1], g));
    const dates = parseRange(r[2], g).map(v => new Date(toStr(v)));
    const d0 = dates[0];
    return cfs.reduce((s, cf, i) => s + cf / Math.pow(1 + rate, (dates[i].getTime() - d0.getTime()) / 86400000 / 365), 0);
  },
  "XIRR": (a, g, r) => {
    const cfs = nums(parseRange(r[0], g));
    const dates = parseRange(r[1], g).map(v => new Date(toStr(v)));
    const d0 = dates[0];
    let rate = 0.1;
    for (let i = 0; i < 100; i++) {
      const npv = cfs.reduce((s, cf, j) => s + cf / Math.pow(1 + rate, (dates[j].getTime() - d0.getTime()) / 86400000 / 365), 0);
      const dnpv = cfs.reduce((s, cf, j) => { const t = (dates[j].getTime() - d0.getTime()) / 86400000 / 365; return s - t * cf / Math.pow(1 + rate, t + 1); }, 0);
      if (Math.abs(dnpv) < 1e-10) break;
      const newRate = rate - npv / dnpv;
      if (Math.abs(newRate - rate) < 1e-10) { rate = newRate; break; }
      rate = newRate;
    }
    return rate;
  },

  // ── Engineering (base conversions) ─────────────────────────────────────────
  "BIN2DEC":  (a) => parseInt(toStr(a[0]?.[0]).replace(/\s/g, ""), 2),
  "BIN2HEX":  (a) => parseInt(toStr(a[0]?.[0]), 2).toString(16).toUpperCase(),
  "BIN2OCT":  (a) => parseInt(toStr(a[0]?.[0]), 2).toString(8),
  "DEC2BIN":  (a) => Math.floor(toNum(a[0]?.[0] ?? 0)).toString(2),
  "DEC2HEX":  (a) => Math.floor(toNum(a[0]?.[0] ?? 0)).toString(16).toUpperCase(),
  "DEC2OCT":  (a) => Math.floor(toNum(a[0]?.[0] ?? 0)).toString(8),
  "HEX2BIN":  (a) => parseInt(toStr(a[0]?.[0]), 16).toString(2),
  "HEX2DEC":  (a) => parseInt(toStr(a[0]?.[0]), 16),
  "HEX2OCT":  (a) => parseInt(toStr(a[0]?.[0]), 16).toString(8),
  "OCT2BIN":  (a) => parseInt(toStr(a[0]?.[0]), 8).toString(2),
  "OCT2DEC":  (a) => parseInt(toStr(a[0]?.[0]), 8),
  "OCT2HEX":  (a) => parseInt(toStr(a[0]?.[0]), 8).toString(16).toUpperCase(),
  "BITAND":   (a) => Math.floor(toNum(a[0]?.[0] ?? 0)) & Math.floor(toNum(a[1]?.[0] ?? 0)),
  "BITOR":    (a) => Math.floor(toNum(a[0]?.[0] ?? 0)) | Math.floor(toNum(a[1]?.[0] ?? 0)),
  "BITXOR":   (a) => Math.floor(toNum(a[0]?.[0] ?? 0)) ^ Math.floor(toNum(a[1]?.[0] ?? 0)),
  "BITRSHIFT":(a) => Math.floor(toNum(a[0]?.[0] ?? 0)) >> Math.floor(toNum(a[1]?.[0] ?? 0)),
  "BITLSHIFT":(a) => Math.floor(toNum(a[0]?.[0] ?? 0)) << Math.floor(toNum(a[1]?.[0] ?? 0)),
  "DELTA":    (a) => toNum(a[0]?.[0] ?? 0) === toNum(a[1]?.[0] ?? 0) ? 1 : 0,
  "GESTEP":   (a) => toNum(a[0]?.[0] ?? 0) >= toNum(a[1]?.[0] ?? 0) ? 1 : 0,
  "CONVERT":  (a) => {
    const n = toNum(a[0]?.[0] ?? 0), from = toStr(a[1]?.[0]), to = toStr(a[2]?.[0]);
    // Length conversions to meters
    const LEN: Record<string, number> = { m:1, km:1000, mi:1609.344, yd:0.9144, ft:0.3048, "in":0.0254, cm:0.01, mm:0.001, nmi:1852 };
    // Weight to kg
    const WGT: Record<string, number> = { kg:1, g:0.001, mg:1e-6, lbm:0.453592, ozm:0.028350, stone:6.35029 };
    // Temp handled separately
    if (from === "C" && to === "F") return n * 9/5 + 32;
    if (from === "F" && to === "C") return (n - 32) * 5/9;
    if (from === "C" && to === "K") return n + 273.15;
    if (from === "K" && to === "C") return n - 273.15;
    if (LEN[from] && LEN[to]) return n * LEN[from] / LEN[to];
    if (WGT[from] && WGT[to]) return n * WGT[from] / WGT[to];
    return "#N/A";
  },

  // ── Lookup additions ────────────────────────────────────────────────────────
  "COLUMNS": (a, g, r) => {
    const m = r[0]?.toUpperCase().match(/^([A-Z]+)\d+:([A-Z]+)\d+$/);
    if (!m) return 1;
    const c1 = m[1].split("").reduce((a, c) => a * 26 + c.charCodeAt(0) - 64, 0);
    const c2 = m[2].split("").reduce((a, c) => a * 26 + c.charCodeAt(0) - 64, 0);
    return Math.abs(c2 - c1) + 1;
  },
  "ROWS": (a, g, r) => {
    const m = r[0]?.toUpperCase().match(/^[A-Z]+(\d+):[A-Z]+(\d+)$/);
    return m ? Math.abs(parseInt(m[2]) - parseInt(m[1])) + 1 : 1;
  },
  "ADDRESS": (a) => {
    const row = Math.floor(toNum(a[0]?.[0] ?? 1)), col = Math.floor(toNum(a[1]?.[0] ?? 1));
    const colLetter = String.fromCharCode(64 + col);
    return `$${colLetter}$${row}`;
  },
  "LOOKUP": (a, g, r) => {
    const val = a[0]?.[0];
    const lookArr = r[1]?.includes(":") ? parseRange(r[1], g) : [a[1]?.[0]];
    const retArr = r[2]?.includes(":") ? parseRange(r[2], g) : lookArr;
    let lastMatch = -1;
    for (let i = 0; i < lookArr.length; i++) {
      if (toNum(lookArr[i]) <= toNum(val)) lastMatch = i;
      else break;
    }
    return lastMatch >= 0 ? retArr[lastMatch] ?? "#N/A" : "#N/A";
  },
  "XMATCH": (a, g, r) => {
    const val = a[0]?.[0];
    const arr = r[1]?.includes(":") ? parseRange(r[1], g) : [a[1]?.[0]];
    const idx = arr.findIndex(v => String(v).toLowerCase() === String(val).toLowerCase());
    return idx === -1 ? "#N/A" : idx + 1;
  },
  "OFFSET": (a, g, r) => {
    const m = r[0]?.toUpperCase().match(/([A-Z]+)(\d+)/);
    if (!m) return "#REF!";
    const baseCol = m[1].split("").reduce((acc, c) => acc * 26 + c.charCodeAt(0) - 64, 0) - 1;
    const baseRow = parseInt(m[2]) - 1;
    const ro = Math.floor(toNum(a[1]?.[0] ?? 0));
    const co = Math.floor(toNum(a[2]?.[0] ?? 0));
    const newRow = baseRow + ro, newCol = baseCol + co;
    if (newRow < 0 || newCol < 0) return "#REF!";
    return g[newRow]?.[newCol] ?? null;
  },
  "INDIRECT": (a) => `[INDIRECT: ${toStr(a[0]?.[0])}]`,
  "AREAS": () => 1,
  "HSTACK": (a, g, r) => r.map(arg => arg.includes(":") ? parseRange2D(arg, g).map(row => row.join(", ")).join(" | ") : toStr(a[r.indexOf(arg)]?.[0])).join(" | "),
  "VSTACK": (a, g, r) => r.map(arg => arg.includes(":") ? parseRange2D(arg, g).map(row => row.join(", ")).join("\n") : toStr(a[r.indexOf(arg)]?.[0])).join("\n"),

  // ── Dynamic Arrays (Excel 365) ──────────────────────────────────────────────
  "SEQUENCE": (a) => {
    const rows = Math.floor(toNum(a[0]?.[0] ?? 1)), cols = Math.floor(toNum(a[1]?.[0] ?? 1)), start = toNum(a[2]?.[0] ?? 1), step = toNum(a[3]?.[0] ?? 1);
    const result: number[] = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) result.push(start + (r * cols + c) * step);
    return cols === 1 ? result.join(", ") : Array.from({ length: rows }, (_, i) => result.slice(i * cols, (i + 1) * cols).join(", ")).join(" | ");
  },
  "RANDARRAY": (a) => {
    const rows = Math.floor(toNum(a[0]?.[0] ?? 1)), cols = Math.floor(toNum(a[1]?.[0] ?? 1));
    const min = toNum(a[2]?.[0] ?? 0), max = toNum(a[3]?.[0] ?? 1);
    const isInt = a[4]?.[0] === true || a[4]?.[0] === 1;
    const result: number[] = [];
    for (let i = 0; i < rows * cols; i++) {
      const v = min + Math.random() * (max - min);
      result.push(isInt ? Math.floor(v) : Math.round(v * 1000) / 1000);
    }
    return cols === 1 ? result.join(", ") : Array.from({ length: rows }, (_, i) => result.slice(i * cols, (i + 1) * cols).join(", ")).join(" | ");
  },
  "UNIQUE": (a, g, r) => {
    const vals = r[0]?.includes(":") ? parseRange(r[0], g).map(toStr) : [toStr(a[0]?.[0])];
    return [...new Set(vals)].join(", ");
  },
  "SORT": (a, g, r) => {
    const vals = r[0]?.includes(":") ? parseRange(r[0], g) : [a[0]?.[0]];
    const order = toNum(a[1]?.[0] ?? 1);
    return [...vals].sort((x, y) => {
      const nx = typeof x === "number" ? x : toStr(x);
      const ny = typeof y === "number" ? y : toStr(y);
      return order === 1 ? (nx < ny ? -1 : nx > ny ? 1 : 0) : (nx > ny ? -1 : nx < ny ? 1 : 0);
    }).map(toStr).join(", ");
  },
  "SORTBY": (a, g, r) => {
    const arr = r[0]?.includes(":") ? parseRange(r[0], g) : [a[0]?.[0]];
    const by = r[1]?.includes(":") ? parseRange(r[1], g) : [a[1]?.[0]];
    const order = toNum(a[2]?.[0] ?? 1);
    return arr
      .map((v, i) => ({ v, k: by[i] }))
      .sort((a, b) => { const ak = toNum(a.k ?? 0), bk = toNum(b.k ?? 0); return order === 1 ? ak - bk : bk - ak; })
      .map(item => toStr(item.v)).join(", ");
  },
  "FILTER": (a, g, r) => {
    const arr = r[0]?.includes(":") ? parseRange(r[0], g) : [a[0]?.[0]];
    const cond = r[1]?.includes(":") ? parseRange(r[1], g) : [a[1]?.[0]];
    const filtered = arr.filter((_, i) => {
      const v = cond[i];
      return v !== null && v !== false && v !== 0 && v !== "";
    });
    return filtered.length ? filtered.map(toStr).join(", ") : (toStr(a[2]?.[0]) || "#CALC!");
  },
  "TAKE": (a, g, r) => {
    const arr = r[0]?.includes(":") ? parseRange(r[0], g) : [a[0]?.[0]];
    const n = Math.floor(toNum(a[1]?.[0] ?? 1));
    return (n >= 0 ? arr.slice(0, n) : arr.slice(n)).map(toStr).join(", ");
  },
  "DROP": (a, g, r) => {
    const arr = r[0]?.includes(":") ? parseRange(r[0], g) : [a[0]?.[0]];
    const n = Math.floor(toNum(a[1]?.[0] ?? 1));
    return (n >= 0 ? arr.slice(n) : arr.slice(0, arr.length + n)).map(toStr).join(", ");
  },
  "TRANSPOSE": (a, g, r) => {
    const tbl = r[0]?.includes(":") ? parseRange2D(r[0], g) : [[a[0]?.[0]]];
    const rows = tbl.length, cols = tbl[0]?.length ?? 0;
    return Array.from({ length: cols }, (_, c) => Array.from({ length: rows }, (_, r) => toStr(tbl[r]?.[c])).join(", ")).join(" | ");
  },
  "TOCOL": (a, g, r) => { const arr = r[0]?.includes(":") ? parseRange(r[0], g) : [a[0]?.[0]]; return arr.map(toStr).join(", "); },
  "TOROW": (a, g, r) => { const arr = r[0]?.includes(":") ? parseRange(r[0], g) : [a[0]?.[0]]; return arr.map(toStr).join(" | "); },
  "WRAPCOLS": (a, g, r) => {
    const arr = r[0]?.includes(":") ? parseRange(r[0], g) : [a[0]?.[0]];
    const n = Math.floor(toNum(a[1]?.[0] ?? arr.length));
    const rows = Math.ceil(arr.length / n);
    return Array.from({ length: rows }, (_, i) => arr.slice(i * n, (i + 1) * n).map(toStr).join(", ")).join(" | ");
  },
  "WRAPROWS": (a, g, r) => {
    const arr = r[0]?.includes(":") ? parseRange(r[0], g) : [a[0]?.[0]];
    const n = Math.floor(toNum(a[1]?.[0] ?? arr.length));
    return Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, (i + 1) * n).map(toStr).join(", ")).join(" | ");
  },
  "CHOOSECOLS": (a, g, r) => {
    const tbl = r[0]?.includes(":") ? parseRange2D(r[0], g) : [[a[0]?.[0]]];
    const colIdxs = a.slice(1).map(ar => Math.floor(toNum(ar[0] ?? 1)) - 1);
    return tbl.map(row => colIdxs.map(ci => toStr(row[ci])).join(", ")).join(" | ");
  },
  "CHOOSEROWS": (a, g, r) => {
    const tbl = r[0]?.includes(":") ? parseRange2D(r[0], g) : [[a[0]?.[0]]];
    const rowIdxs = a.slice(1).map(ar => Math.floor(toNum(ar[0] ?? 1)) - 1);
    return rowIdxs.map(ri => (tbl[ri] || []).map(toStr).join(", ")).join(" | ");
  },
  "EXPAND": (a, g, r) => {
    const arr = r[0]?.includes(":") ? parseRange(r[0], g) : [a[0]?.[0]];
    const toRows = Math.floor(toNum(a[1]?.[0] ?? arr.length));
    const pad = toStr(a[3]?.[0] ?? "0");
    return Array.from({ length: toRows }, (_, i) => toStr(arr[i] ?? pad)).join(", ");
  },
  "MAKEARRAY": (a) => {
    const rows = Math.floor(toNum(a[0]?.[0] ?? 1)), cols = Math.floor(toNum(a[1]?.[0] ?? 1));
    return Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => `(${r + 1},${c + 1})`).join(", ")).join(" | ");
  },
  "MAP": (a, g, r) => { const arr = r[0]?.includes(":") ? parseRange(r[0], g) : [a[0]?.[0]]; return arr.map((v, i) => `f(${toStr(v)})`).join(", "); },
  "REDUCE": (a, g, r) => { const arr = r[1]?.includes(":") ? parseRange(r[1], g) : [a[1]?.[0]]; return `reduce([${arr.map(toStr).join(",")}], init=${toStr(a[0]?.[0])})`; },
  "SCAN": (a, g, r) => { const arr = r[1]?.includes(":") ? parseRange(r[1], g) : [a[1]?.[0]]; return arr.reduce((acc: number[], v, i) => [...acc, (acc[i - 1] ?? toNum(a[0]?.[0] ?? 0)) + toNum(v)], []).join(", "); },
  "BYCOL": (a, g, r) => { const tbl = r[0]?.includes(":") ? parseRange2D(r[0], g) : [[a[0]?.[0]]]; const cols = tbl[0]?.length ?? 0; return Array.from({ length: cols }, (_, c) => nums(tbl.map(row => row[c])).reduce((s, v) => s + v, 0)).join(", "); },
  "BYROW": (a, g, r) => { const tbl = r[0]?.includes(":") ? parseRange2D(r[0], g) : [[a[0]?.[0]]]; return tbl.map(row => nums(row).reduce((s, v) => s + v, 0)).join(", "); },

  // ── Info additions ──────────────────────────────────────────────────────────
  "ISERR":      (a) => { const v = String(a[0]?.[0]); return v.startsWith("#") && !v.includes("N/A"); },
  "ISNONTEXT":  (a) => typeof a[0]?.[0] !== "string",
  "ISLOGICAL":  (a) => typeof a[0]?.[0] === "boolean",
  "ISFORMULA":  () => false,
  "ISOMITTED":  () => false,
  "ISREF":      () => false,
  "ERROR.TYPE": (a) => {
    const v = String(a[0]?.[0]);
    const types: Record<string, number> = { "#NULL!":1,"#DIV/0!":2,"#VALUE!":3,"#REF!":4,"#NAME?":5,"#NUM!":6,"#N/A":7,"#GETTING_DATA":8 };
    return types[v] ?? "#N/A";
  },
  "CELL": () => "[CELL info not available in browser]",
  "INFO": () => "[System info not available in browser]",
  "FORMULATEXT": () => "[Formula text not available in browser]",
  "SHEET": () => 1,
  "SHEETS": () => 1,

  // ── LET / LAMBDA (simplified) ──────────────────────────────────────────────
  "LET": (a) => a[a.length - 1]?.[0] ?? null,
  "LAMBDA": () => "[LAMBDA: define custom functions in Excel 365]",

  // ── Misc ───────────────────────────────────────────────────────────────────
  "HYPERLINK": (a) => toStr(a[1]?.[0] ?? a[0]?.[0]),
  "WEBSERVICE": () => "[WEBSERVICE requires network access from Excel]",
  "FILTERXML": () => "[FILTERXML requires an XML string and XPath]",
  "GETPIVOTDATA": () => "[GETPIVOTDATA requires a PivotTable]",
};
