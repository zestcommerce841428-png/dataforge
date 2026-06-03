/**
 * Extra Excel-365 formula implementations — Part 2.
 * Completes coverage of the full Excel 365 master function list:
 * Database (D*), Complex (IM*), Bessel, statistical distributions,
 * bond/securities financials, precise rounding, regression and more.
 */

import type { CellValue, Grid } from "./types";

/* ── Coercion ─────────────────────────────────────────────────────── */
const toNum = (v: CellValue): number =>
  typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) || 0 : typeof v === "boolean" ? +v : 0;
const toStr = (v: CellValue): string =>
  v === null || v === undefined ? "" : typeof v === "boolean" ? (v ? "TRUE" : "FALSE") : String(v);

/* ── Range parsing (mirrors engine) ───────────────────────────────── */
function colIdx(col: string): number {
  return col.toUpperCase().split("").reduce((a, c) => a * 26 + c.charCodeAt(0) - 64, 0) - 1;
}
function parseRange(range: string, grid: Grid): CellValue[] {
  const m = range.toUpperCase().replace(/\$/g, "").match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!m) return [];
  const c1 = colIdx(m[1]), r1 = +m[2] - 1, c2 = colIdx(m[3]), r2 = +m[4] - 1;
  const out: CellValue[] = [];
  for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++)
    for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) out.push(grid[r]?.[c] ?? null);
  return out;
}
function parseRange2D(range: string, grid: Grid): CellValue[][] {
  const m = range.toUpperCase().replace(/\$/g, "").match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!m) return [];
  const c1 = colIdx(m[1]), r1 = +m[2] - 1, c2 = colIdx(m[3]), r2 = +m[4] - 1;
  const rows: CellValue[][] = [];
  for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
    const row: CellValue[] = [];
    for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) row.push(grid[r]?.[c] ?? null);
    rows.push(row);
  }
  return rows;
}
const nums = (vals: CellValue[]) => vals.map(Number).filter(v => !isNaN(v) && isFinite(v));

/* ── Special functions ────────────────────────────────────────────── */
function lgamma(z: number): number {
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
function gammaFn(z: number): number { return Math.exp(lgamma(z)); }

// Regularised lower incomplete gamma P(a,x)
function gammaP(a: number, x: number): number {
  if (x <= 0) return 0;
  if (x < a + 1) {
    let sum = 1 / a, term = sum, n = a;
    for (let i = 0; i < 200; i++) { n += 1; term *= x / n; sum += term; if (Math.abs(term) < Math.abs(sum) * 1e-12) break; }
    return sum * Math.exp(-x + a * Math.log(x) - lgamma(a));
  }
  // continued fraction for Q, then P = 1-Q
  let b = x + 1 - a, c = 1e30, d = 1 / b, h = d;
  for (let i = 1; i <= 200; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  const Q = Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
  return 1 - Q;
}
function gammaInv(p: number, a: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return a * 5 + 20;
  let x = a;        // initial guess
  for (let i = 0; i < 60; i++) {
    const f = gammaP(a, x) - p;
    const pdf = Math.exp((a - 1) * Math.log(Math.max(x, 1e-12)) - x - lgamma(a));
    if (pdf < 1e-14) break;
    let dx = f / pdf;
    if (x - dx <= 0) dx = x / 2;
    x -= dx;
    if (Math.abs(dx) < 1e-10) break;
  }
  return x;
}
// Regularised incomplete beta I_x(a,b)
function betaI(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = lgamma(a) + lgamma(b) - lgamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta);
  let d = 1 - (a + b) * x / (a + 1); if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d;
  let C = 1, result = d;
  for (let m = 1; m <= 300; m++) {
    let aa = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
    C = 1 + aa / C; if (Math.abs(C) < 1e-30) C = 1e-30;
    d = 1 / d; result *= d * C;
    aa = -(a + m) * (a + b + m) * x / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
    C = 1 + aa / C; if (Math.abs(C) < 1e-30) C = 1e-30;
    d = 1 / d; const del = d * C; result *= del;
    if (Math.abs(del - 1) < 1e-10) break;
  }
  return front * result / a;
}
function betaInv(p: number, a: number, b: number): number {
  let lo = 0, hi = 1;
  for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (betaI(mid, a, b) < p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

/* ── Complex number helpers ───────────────────────────────────────── */
interface Cx { re: number; im: number; suf: string; }
function parseComplex(s: string): Cx {
  s = String(s).trim();
  const suf = /j$/i.test(s) ? "j" : "i";
  if (!/[ij]$/i.test(s)) return { re: parseFloat(s) || 0, im: 0, suf: "i" };
  const body = s.slice(0, -1);
  let splitIdx = -1;
  for (let i = body.length - 1; i > 0; i--) {
    if ((body[i] === "+" || body[i] === "-") && body[i - 1].toLowerCase() !== "e") { splitIdx = i; break; }
  }
  if (splitIdx > 0) {
    const re = parseFloat(body.slice(0, splitIdx)) || 0;
    const imStr = body.slice(splitIdx);
    const im = imStr === "+" ? 1 : imStr === "-" ? -1 : parseFloat(imStr) || 0;
    return { re, im, suf };
  }
  const im = body === "" || body === "+" ? 1 : body === "-" ? -1 : parseFloat(body) || 0;
  return { re: 0, im, suf };
}
function fmtComplex(re: number, im: number, suf = "i"): string {
  const rnd = (n: number) => Math.abs(n) < 1e-12 ? 0 : Math.round(n * 1e12) / 1e12;
  re = rnd(re); im = rnd(im);
  if (im === 0) return String(re);
  const imPart = (im === 1 ? "+" : im === -1 ? "-" : im > 0 ? "+" + im : String(im)) + suf;
  return re === 0 ? (im === 1 ? "" : im === -1 ? "-" : String(im)) + suf : String(re) + imPart;
}

/* ── Database function runner ─────────────────────────────────────── */
function dbRun(g: Grid, r: string[], a: CellValue[][], agg: (vals: number[]) => CellValue): CellValue {
  const db = parseRange2D(r[0], g);
  if (db.length < 2) return "#VALUE!";
  const headers = db[0].map(toStr);
  const data = db.slice(1);
  const fieldArg = a[1]?.[0];
  let fieldCol: number;
  if (typeof fieldArg === "number") fieldCol = fieldArg - 1;
  else fieldCol = headers.findIndex(h => h.toLowerCase() === toStr(fieldArg).toLowerCase());
  if (fieldCol < 0) return "#VALUE!";
  const crit = parseRange2D(r[2], g);
  const critHeaders = crit[0]?.map(toStr) ?? [];
  const critRows = crit.slice(1);
  const matchCond = (cell: CellValue, cond: string): boolean => {
    if (cond === "") return true;
    const m = cond.match(/^(>=|<=|<>|=|>|<)(.*)$/);
    if (m) {
      const nv = parseFloat(m[2]);
      switch (m[1]) {
        case ">": return toNum(cell) > nv;
        case "<": return toNum(cell) < nv;
        case ">=": return toNum(cell) >= nv;
        case "<=": return toNum(cell) <= nv;
        case "<>": return toStr(cell) !== m[2];
        case "=": return toStr(cell).toLowerCase() === m[2].toLowerCase();
      }
    }
    return toStr(cell).toLowerCase() === cond.toLowerCase();
  };
  const matched = data.filter(row =>
    critRows.some(cr =>
      critHeaders.every((ch, ci) => {
        const cond = toStr(cr[ci]);
        if (cond === "") return true;
        const dataCol = headers.findIndex(h => h.toLowerCase() === ch.toLowerCase());
        if (dataCol < 0) return true;
        return matchCond(row[dataCol], cond);
      })
    )
  );
  const vals = nums(matched.map(row => row[fieldCol]));
  return agg(vals);
}
const mean = (x: number[]) => x.reduce((s, v) => s + v, 0) / x.length;
const variance = (x: number[], sample: boolean) => { const m = mean(x); return x.reduce((s, v) => s + (v - m) ** 2, 0) / (x.length - (sample ? 1 : 0)); };

/* ── Bond day-count (simplified Actual/365 & 30/360) ──────────────── */
function days360(d1: Date, d2: Date): number {
  const y1 = d1.getFullYear(), y2 = d2.getFullYear();
  const m1 = d1.getMonth(), m2 = d2.getMonth();
  const day1 = Math.min(d1.getDate(), 30), day2 = Math.min(d2.getDate(), 30);
  return (y2 - y1) * 360 + (m2 - m1) * 30 + (day2 - day1);
}
function yearFrac(d1: Date, d2: Date, basis = 0): number {
  const ms = d2.getTime() - d1.getTime();
  if (basis === 1 || basis === 3) return ms / 86400000 / (basis === 3 ? 365 : 365.25);
  if (basis === 2) return ms / 86400000 / 360;
  return days360(d1, d2) / 360;
}

/* ── ASC full-width → half-width ──────────────────────────────────── */
function ascConv(s: string): string {
  return s.replace(/[！-～]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)).replace(/　/g, " ");
}

/* ── Bessel (series / approximations) ─────────────────────────────── */
function besselJ(x: number, n: number): number {
  n = Math.abs(Math.floor(n));
  let sum = 0;
  for (let k = 0; k < 40; k++) {
    sum += ((-1) ** k / (gammaFn(k + 1) * gammaFn(k + n + 1))) * Math.pow(x / 2, 2 * k + n);
  }
  return sum;
}
function besselI(x: number, n: number): number {
  n = Math.abs(Math.floor(n));
  let sum = 0;
  for (let k = 0; k < 40; k++) {
    sum += (1 / (gammaFn(k + 1) * gammaFn(k + n + 1))) * Math.pow(x / 2, 2 * k + n);
  }
  return sum;
}
function besselY(x: number, n: number): number {
  const eps = 1e-6;
  return (besselJ(x, n) * Math.cos(n * Math.PI) - besselJ(x, -n + eps)) / Math.sin((n + eps) * Math.PI);
}
function besselK(x: number, n: number): number {
  const eps = 1e-6;
  return (Math.PI / 2) * (besselI(x, -n + eps) - besselI(x, n)) / Math.sin((n + eps) * Math.PI);
}

/* ══════════════════════════════════════════════════════════════════
   FUNCTION MAP
══════════════════════════════════════════════════════════════════ */
type FuncFn = (args: CellValue[][], grid: Grid, rawArgs: string[]) => CellValue;

export const EXTRA_FUNCS2: Record<string, FuncFn> = {
  // ── Precise rounding ──────────────────────────────────────────────
  "CEILING.MATH": (a) => { const n = toNum(a[0]?.[0] ?? 0), sig = a[1] ? toNum(a[1][0]) : 1, mode = toNum(a[2]?.[0] ?? 0); if (sig === 0) return 0; if (n < 0 && mode !== 0) return -Math.ceil(Math.abs(n) / Math.abs(sig)) * Math.abs(sig); return Math.ceil(n / Math.abs(sig)) * Math.abs(sig); },
  "CEILING.PRECISE": (a) => { const n = toNum(a[0]?.[0] ?? 0), sig = a[1] ? Math.abs(toNum(a[1][0])) : 1; return sig === 0 ? 0 : Math.ceil(n / sig) * sig; },
  "FLOOR.MATH": (a) => { const n = toNum(a[0]?.[0] ?? 0), sig = a[1] ? toNum(a[1][0]) : 1, mode = toNum(a[2]?.[0] ?? 0); if (sig === 0) return 0; if (n < 0 && mode !== 0) return -Math.floor(Math.abs(n) / Math.abs(sig)) * Math.abs(sig); return Math.floor(n / Math.abs(sig)) * Math.abs(sig); },
  "FLOOR.PRECISE": (a) => { const n = toNum(a[0]?.[0] ?? 0), sig = a[1] ? Math.abs(toNum(a[1][0])) : 1; return sig === 0 ? 0 : Math.floor(n / sig) * sig; },

  // ── Text ──────────────────────────────────────────────────────────
  "ASC": (a) => ascConv(toStr(a[0]?.[0])),

  // ── Aggregate ─────────────────────────────────────────────────────
  "AGGREGATE": (a, g, r) => {
    const fn = Math.floor(toNum(a[0]?.[0] ?? 1));
    const vals = nums(r.slice(2).flatMap(arg => arg.includes(":") ? parseRange(arg, g) : [a[r.indexOf(arg)]?.[0]]));
    const sorted = [...vals].sort((x, y) => x - y);
    switch (fn) {
      case 1: return mean(vals);
      case 2: case 3: return vals.length;
      case 4: return vals.length ? Math.max(...vals) : "#NUM!";
      case 5: return vals.length ? Math.min(...vals) : "#NUM!";
      case 6: return vals.reduce((p, v) => p * v, 1);
      case 7: return Math.sqrt(variance(vals, true));
      case 8: return Math.sqrt(variance(vals, false));
      case 9: return vals.reduce((s, v) => s + v, 0);
      case 10: return variance(vals, true);
      case 11: return variance(vals, false);
      case 12: { const n = sorted.length; const m = Math.floor(n / 2); return n % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2; }
      case 13: { const f = vals.reduce((ac, v) => ({ ...ac, [v]: (ac[v] || 0) + 1 }), {} as Record<number, number>); const mx = Math.max(...Object.values(f)); return parseFloat(Object.entries(f).find(([, c]) => c === mx)?.[0] ?? "0"); }
      case 14: return sorted[sorted.length - Math.floor(toNum(a[2]?.[0] ?? 1))]; // LARGE
      case 15: return sorted[Math.floor(toNum(a[2]?.[0] ?? 1)) - 1]; // SMALL
      default: return vals.reduce((s, v) => s + v, 0);
    }
  },

  // ── Database functions ────────────────────────────────────────────
  "DSUM": (a, g, r) => dbRun(g, r, a, v => v.reduce((s, x) => s + x, 0)),
  "DAVERAGE": (a, g, r) => dbRun(g, r, a, v => v.length ? mean(v) : "#DIV/0!"),
  "DCOUNT": (a, g, r) => dbRun(g, r, a, v => v.length),
  "DCOUNTA": (a, g, r) => dbRun(g, r, a, v => v.length),
  "DMAX": (a, g, r) => dbRun(g, r, a, v => v.length ? Math.max(...v) : "#NUM!"),
  "DMIN": (a, g, r) => dbRun(g, r, a, v => v.length ? Math.min(...v) : "#NUM!"),
  "DPRODUCT": (a, g, r) => dbRun(g, r, a, v => v.reduce((p, x) => p * x, 1)),
  "DGET": (a, g, r) => dbRun(g, r, a, v => v.length === 1 ? v[0] : v.length === 0 ? "#VALUE!" : "#NUM!"),
  "DSTDEV": (a, g, r) => dbRun(g, r, a, v => v.length > 1 ? Math.sqrt(variance(v, true)) : "#DIV/0!"),
  "DSTDEVP": (a, g, r) => dbRun(g, r, a, v => v.length ? Math.sqrt(variance(v, false)) : "#DIV/0!"),
  "DVAR": (a, g, r) => dbRun(g, r, a, v => v.length > 1 ? variance(v, true) : "#DIV/0!"),
  "DVARP": (a, g, r) => dbRun(g, r, a, v => v.length ? variance(v, false) : "#DIV/0!"),

  // ── Statistical distributions ─────────────────────────────────────
  "GAMMA.DIST": (a) => { const x = toNum(a[0]?.[0] ?? 0), al = toNum(a[1]?.[0] ?? 1), be = toNum(a[2]?.[0] ?? 1), cum = a[3]?.[0] !== false; if (x < 0 || al <= 0 || be <= 0) return "#NUM!"; return cum ? gammaP(al, x / be) : Math.pow(x, al - 1) * Math.exp(-x / be) / (Math.pow(be, al) * gammaFn(al)); },
  "GAMMA.INV": (a) => { const p = toNum(a[0]?.[0] ?? 0), al = toNum(a[1]?.[0] ?? 1), be = toNum(a[2]?.[0] ?? 1); return gammaInv(p, al) * be; },
  "BETA.DIST": (a) => { const x = toNum(a[0]?.[0] ?? 0), al = toNum(a[1]?.[0] ?? 1), be = toNum(a[2]?.[0] ?? 1), cum = a[3]?.[0] !== false, A = toNum(a[4]?.[0] ?? 0), B = toNum(a[5]?.[0] ?? 1); const xs = (x - A) / (B - A); if (xs < 0 || xs > 1) return "#NUM!"; return cum ? betaI(xs, al, be) : Math.pow(xs, al - 1) * Math.pow(1 - xs, be - 1) / Math.exp(lgamma(al) + lgamma(be) - lgamma(al + be)) / (B - A); },
  "BETA.INV": (a) => { const p = toNum(a[0]?.[0] ?? 0), al = toNum(a[1]?.[0] ?? 1), be = toNum(a[2]?.[0] ?? 1), A = toNum(a[3]?.[0] ?? 0), B = toNum(a[4]?.[0] ?? 1); return A + betaInv(p, al, be) * (B - A); },
  "CHISQ.DIST": (a) => { const x = toNum(a[0]?.[0] ?? 0), df = toNum(a[1]?.[0] ?? 1), cum = a[2]?.[0] !== false; if (x < 0) return "#NUM!"; return cum ? gammaP(df / 2, x / 2) : Math.pow(x, df / 2 - 1) * Math.exp(-x / 2) / (Math.pow(2, df / 2) * gammaFn(df / 2)); },
  "CHISQ.INV": (a) => { const p = toNum(a[0]?.[0] ?? 0), df = toNum(a[1]?.[0] ?? 1); return gammaInv(p, df / 2) * 2; },
  "F.DIST": (a) => { const x = toNum(a[0]?.[0] ?? 0), d1 = toNum(a[1]?.[0] ?? 1), d2 = toNum(a[2]?.[0] ?? 1), cum = a[3]?.[0] !== false; if (x < 0) return "#NUM!"; const y = d1 * x / (d1 * x + d2); return cum ? betaI(y, d1 / 2, d2 / 2) : (gammaFn((d1 + d2) / 2) / (gammaFn(d1 / 2) * gammaFn(d2 / 2))) * Math.pow(d1 / d2, d1 / 2) * Math.pow(x, d1 / 2 - 1) * Math.pow(1 + d1 * x / d2, -(d1 + d2) / 2); },
  "F.INV": (a) => { const p = toNum(a[0]?.[0] ?? 0), d1 = toNum(a[1]?.[0] ?? 1), d2 = toNum(a[2]?.[0] ?? 1); const y = betaInv(p, d1 / 2, d2 / 2); return (d2 * y) / (d1 * (1 - y)); },
  "BINOM.INV": (a) => { const n = Math.floor(toNum(a[0]?.[0] ?? 0)), p = toNum(a[1]?.[0] ?? 0), alpha = toNum(a[2]?.[0] ?? 0); const comb = (N: number, k: number) => { let r = 1; for (let i = 0; i < k; i++) r = r * (N - i) / (i + 1); return r; }; let cum = 0; for (let k = 0; k <= n; k++) { cum += comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k); if (cum >= alpha) return k; } return n; },
  "FISHER": (a) => { const x = toNum(a[0]?.[0] ?? 0); return 0.5 * Math.log((1 + x) / (1 - x)); },
  "FISHERINV": (a) => { const y = toNum(a[0]?.[0] ?? 0); return (Math.exp(2 * y) - 1) / (Math.exp(2 * y) + 1); },

  // ── Regression ────────────────────────────────────────────────────
  "GROWTH": (a, g, r) => {
    const y = nums(parseRange(r[0], g)).map(v => v <= 0 ? 1e-9 : v);
    const x = r[1] ? nums(parseRange(r[1], g)) : y.map((_, i) => i + 1);
    const ly = y.map(Math.log);
    const mx = mean(x), my = mean(ly);
    const slope = x.reduce((s, xi, i) => s + (xi - mx) * (ly[i] - my), 0) / x.reduce((s, xi) => s + (xi - mx) ** 2, 0);
    const intercept = my - slope * mx;
    const newX = r[2] ? nums(parseRange(r[2], g)) : x;
    return newX.map(xi => Math.exp(slope * xi + intercept).toPrecision(6)).join(", ");
  },
  "LINEST": (a, g, r) => {
    const y = nums(parseRange(r[0], g));
    const x = r[1] ? nums(parseRange(r[1], g)) : y.map((_, i) => i + 1);
    const mx = mean(x), my = mean(y);
    const slope = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0) / x.reduce((s, xi) => s + (xi - mx) ** 2, 0);
    const intercept = my - slope * mx;
    return `slope=${slope.toPrecision(6)}, intercept=${intercept.toPrecision(6)}`;
  },
  "LOGEST": (a, g, r) => {
    const y = nums(parseRange(r[0], g)).map(v => v <= 0 ? 1e-9 : v);
    const x = r[1] ? nums(parseRange(r[1], g)) : y.map((_, i) => i + 1);
    const ly = y.map(Math.log);
    const mx = mean(x), my = mean(ly);
    const slope = x.reduce((s, xi, i) => s + (xi - mx) * (ly[i] - my), 0) / x.reduce((s, xi) => s + (xi - mx) ** 2, 0);
    const intercept = my - slope * mx;
    return `m=${Math.exp(slope).toPrecision(6)}, b=${Math.exp(intercept).toPrecision(6)}`;
  },
  "FORECAST.ETS": (a, g, r) => {
    // Simplified: linear forecast of the target date over the known series.
    const target = toNum(a[0]?.[0] ?? 0);
    const y = nums(parseRange(r[1], g));
    const x = nums(parseRange(r[2], g));
    if (x.length < 2) return y[y.length - 1] ?? "#N/A";
    const mx = mean(x), my = mean(y);
    const slope = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0) / x.reduce((s, xi) => s + (xi - mx) ** 2, 0);
    return my + slope * (target - mx);
  },

  // ── Complex numbers ───────────────────────────────────────────────
  "COMPLEX": (a) => { const re = toNum(a[0]?.[0] ?? 0), im = toNum(a[1]?.[0] ?? 0), suf = toStr(a[2]?.[0] || "i"); return fmtComplex(re, im, suf); },
  "IMREAL": (a) => parseComplex(toStr(a[0]?.[0])).re,
  "IMAGINARY": (a) => parseComplex(toStr(a[0]?.[0])).im,
  "IMABS": (a) => { const z = parseComplex(toStr(a[0]?.[0])); return Math.hypot(z.re, z.im); },
  "IMARGUMENT": (a) => { const z = parseComplex(toStr(a[0]?.[0])); return Math.atan2(z.im, z.re); },
  "IMCONJUGATE": (a) => { const z = parseComplex(toStr(a[0]?.[0])); return fmtComplex(z.re, -z.im, z.suf); },
  "IMSUM": (a) => { let re = 0, im = 0, suf = "i"; a.forEach(ar => { const z = parseComplex(toStr(ar[0])); re += z.re; im += z.im; suf = z.suf; }); return fmtComplex(re, im, suf); },
  "IMSUB": (a) => { const z1 = parseComplex(toStr(a[0]?.[0])), z2 = parseComplex(toStr(a[1]?.[0])); return fmtComplex(z1.re - z2.re, z1.im - z2.im, z1.suf); },
  "IMPRODUCT": (a) => { let re = 1, im = 0, suf = "i"; a.forEach(ar => { const z = parseComplex(toStr(ar[0])); const nr = re * z.re - im * z.im, ni = re * z.im + im * z.re; re = nr; im = ni; suf = z.suf; }); return fmtComplex(re, im, suf); },
  "IMDIV": (a) => { const z1 = parseComplex(toStr(a[0]?.[0])), z2 = parseComplex(toStr(a[1]?.[0])); const d = z2.re ** 2 + z2.im ** 2; return fmtComplex((z1.re * z2.re + z1.im * z2.im) / d, (z1.im * z2.re - z1.re * z2.im) / d, z1.suf); },
  "IMPOWER": (a) => { const z = parseComplex(toStr(a[0]?.[0])), n = toNum(a[1]?.[0] ?? 1); const r = Math.hypot(z.re, z.im), th = Math.atan2(z.im, z.re); const rn = Math.pow(r, n); return fmtComplex(rn * Math.cos(n * th), rn * Math.sin(n * th), z.suf); },
  "IMSQRT": (a) => { const z = parseComplex(toStr(a[0]?.[0])); const r = Math.hypot(z.re, z.im), th = Math.atan2(z.im, z.re); const sr = Math.sqrt(r); return fmtComplex(sr * Math.cos(th / 2), sr * Math.sin(th / 2), z.suf); },
  "IMEXP": (a) => { const z = parseComplex(toStr(a[0]?.[0])); const e = Math.exp(z.re); return fmtComplex(e * Math.cos(z.im), e * Math.sin(z.im), z.suf); },
  "IMLN": (a) => { const z = parseComplex(toStr(a[0]?.[0])); return fmtComplex(Math.log(Math.hypot(z.re, z.im)), Math.atan2(z.im, z.re), z.suf); },
  "IMLOG10": (a) => { const z = parseComplex(toStr(a[0]?.[0])); return fmtComplex(Math.log(Math.hypot(z.re, z.im)) / Math.LN10, Math.atan2(z.im, z.re) / Math.LN10, z.suf); },
  "IMLOG2": (a) => { const z = parseComplex(toStr(a[0]?.[0])); return fmtComplex(Math.log(Math.hypot(z.re, z.im)) / Math.LN2, Math.atan2(z.im, z.re) / Math.LN2, z.suf); },
  "IMSIN": (a) => { const z = parseComplex(toStr(a[0]?.[0])); return fmtComplex(Math.sin(z.re) * Math.cosh(z.im), Math.cos(z.re) * Math.sinh(z.im), z.suf); },
  "IMCOS": (a) => { const z = parseComplex(toStr(a[0]?.[0])); return fmtComplex(Math.cos(z.re) * Math.cosh(z.im), -Math.sin(z.re) * Math.sinh(z.im), z.suf); },

  // ── Bessel ────────────────────────────────────────────────────────
  "BESSELJ": (a) => besselJ(toNum(a[0]?.[0] ?? 0), toNum(a[1]?.[0] ?? 0)),
  "BESSELI": (a) => besselI(toNum(a[0]?.[0] ?? 0), toNum(a[1]?.[0] ?? 0)),
  "BESSELY": (a) => besselY(toNum(a[0]?.[0] ?? 0), toNum(a[1]?.[0] ?? 0)),
  "BESSELK": (a) => besselK(toNum(a[0]?.[0] ?? 0), toNum(a[1]?.[0] ?? 0)),

  // ── Financial: dollar fractions ───────────────────────────────────
  "DOLLARDE": (a) => { const fd = toNum(a[0]?.[0] ?? 0), frac = Math.floor(toNum(a[1]?.[0] ?? 1)); if (frac <= 0) return "#NUM!"; const intPart = Math.trunc(fd); const decPart = fd - intPart; return intPart + (decPart * 100) / frac; },
  "DOLLARFR": (a) => { const dd = toNum(a[0]?.[0] ?? 0), frac = Math.floor(toNum(a[1]?.[0] ?? 1)); if (frac <= 0) return "#NUM!"; const intPart = Math.trunc(dd); const decPart = dd - intPart; return intPart + (decPart * frac) / 100; },

  // ── Financial: bonds & securities (simplified day-count) ──────────
  "INTRATE": (a) => { const sd = new Date(toStr(a[0]?.[0])), md = new Date(toStr(a[1]?.[0])), inv = toNum(a[2]?.[0] ?? 0), red = toNum(a[3]?.[0] ?? 0), basis = toNum(a[4]?.[0] ?? 0); const yf = yearFrac(sd, md, basis); return yf <= 0 ? "#NUM!" : ((red - inv) / inv) / yf; },
  "DISC": (a) => { const sd = new Date(toStr(a[0]?.[0])), md = new Date(toStr(a[1]?.[0])), pr = toNum(a[2]?.[0] ?? 0), red = toNum(a[3]?.[0] ?? 100), basis = toNum(a[4]?.[0] ?? 0); const yf = yearFrac(sd, md, basis); return yf <= 0 ? "#NUM!" : ((red - pr) / red) / yf; },
  "ACCRINTM": (a) => { const iss = new Date(toStr(a[0]?.[0])), set = new Date(toStr(a[1]?.[0])), rate = toNum(a[2]?.[0] ?? 0), par = toNum(a[3]?.[0] ?? 1000), basis = toNum(a[4]?.[0] ?? 0); return par * rate * yearFrac(iss, set, basis); },
  "ACCRINT": (a) => { const iss = new Date(toStr(a[0]?.[0])), set = new Date(toStr(a[2]?.[0])), rate = toNum(a[3]?.[0] ?? 0), par = toNum(a[4]?.[0] ?? 1000), basis = toNum(a[6]?.[0] ?? 0); return par * rate * yearFrac(iss, set, basis); },
  "DURATION": (a) => { const set = new Date(toStr(a[0]?.[0])), mat = new Date(toStr(a[1]?.[0])), coupon = toNum(a[2]?.[0] ?? 0), yld = toNum(a[3]?.[0] ?? 0), freq = toNum(a[4]?.[0] ?? 2); const yrs = yearFrac(set, mat, toNum(a[5]?.[0] ?? 0)); const n = Math.max(1, Math.round(yrs * freq)); const c = coupon / freq, y = yld / freq; let pv = 0, wsum = 0; for (let t = 1; t <= n; t++) { const cf = (t === n ? 100 : 0) + 100 * c; const d = cf / Math.pow(1 + y, t); pv += d; wsum += (t / freq) * d; } return pv === 0 ? "#NUM!" : wsum / pv; },
  "PRICE": (a) => { const set = new Date(toStr(a[0]?.[0])), mat = new Date(toStr(a[1]?.[0])), rate = toNum(a[2]?.[0] ?? 0), yld = toNum(a[3]?.[0] ?? 0), red = toNum(a[4]?.[0] ?? 100), freq = toNum(a[5]?.[0] ?? 2); const yrs = yearFrac(set, mat, toNum(a[6]?.[0] ?? 0)); const n = Math.max(1, Math.round(yrs * freq)); const c = 100 * rate / freq, y = yld / freq; let price = 0; for (let t = 1; t <= n; t++) price += c / Math.pow(1 + y, t); price += red / Math.pow(1 + y, n); return price; },
  "YIELD": (a) => { const set = new Date(toStr(a[0]?.[0])), mat = new Date(toStr(a[1]?.[0])), rate = toNum(a[2]?.[0] ?? 0), pr = toNum(a[3]?.[0] ?? 0), red = toNum(a[4]?.[0] ?? 100), freq = toNum(a[5]?.[0] ?? 2); const yrs = yearFrac(set, mat, toNum(a[6]?.[0] ?? 0)); const n = Math.max(1, Math.round(yrs * freq)); const c = 100 * rate / freq; const priceAt = (y: number) => { let p = 0; for (let t = 1; t <= n; t++) p += c / Math.pow(1 + y / freq, t); return p + red / Math.pow(1 + y / freq, n); }; let lo = -0.99, hi = 1; for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (priceAt(mid) > pr) lo = mid; else hi = mid; } return (lo + hi) / 2; },

  // ── Financial: French depreciation ────────────────────────────────
  "AMORLINC": (a) => { const cost = toNum(a[0]?.[0] ?? 0), salvage = toNum(a[3]?.[0] ?? 0), period = Math.floor(toNum(a[4]?.[0] ?? 0)), rate = toNum(a[5]?.[0] ?? 0); const annual = cost * rate; const fullPeriods = Math.floor((cost - salvage) / annual); if (period === 0) return annual * 0.5; if (period <= fullPeriods) return annual; if (period === fullPeriods + 1) return Math.max(0, cost - salvage - annual * fullPeriods - annual * 0.5); return 0; },
  "AMORDEGRC": (a) => { const cost = toNum(a[0]?.[0] ?? 0), salvage = toNum(a[3]?.[0] ?? 0), period = Math.floor(toNum(a[4]?.[0] ?? 0)), rate = toNum(a[5]?.[0] ?? 0); const life = 1 / rate; const coef = life < 3 ? 1 : life <= 4 ? 1.5 : life <= 6 ? 2 : 2.5; const dRate = rate * coef; let bv = cost; for (let p = 0; p < period; p++) { const dep = Math.min(bv * dRate, bv - salvage); bv -= dep; } return Math.max(0, Math.min(bv * dRate, bv - salvage)); },

  // ── Date ──────────────────────────────────────────────────────────
  "WORKDAY.INTL": (a) => { const d = new Date(toStr(a[0]?.[0])); let days = Math.floor(toNum(a[1]?.[0] ?? 0)); const wkndCode = toStr(a[2]?.[0] || "1"); const weekendDays = wkndCode === "11" ? [0] : wkndCode === "17" ? [6] : wkndCode === "7" ? [5, 6] : [0, 6]; const step = days > 0 ? 1 : -1; let count = 0; while (count !== Math.abs(days)) { d.setDate(d.getDate() + step); if (!weekendDays.includes(d.getDay())) count++; } return d.toLocaleDateString("en-US"); },
};
