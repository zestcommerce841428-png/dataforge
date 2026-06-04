"use client";
import { useState, useEffect } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── Duration Calculator ── */
export function DurationCalculator() {
  const [d, setD] = useState(0), [h, setH] = useState(1), [m, setM] = useState(30), [s, setS] = useState(0);
  const total = ((d * 24 + h) * 60 + m) * 60 + s;
  const rows: [string, string][] = [["Total seconds", total.toLocaleString()], ["Total minutes", (total / 60).toFixed(2)], ["Total hours", (total / 3600).toFixed(4)], ["Total days", (total / 86400).toFixed(5)], ["HH:MM:SS", `${Math.floor(total / 3600)}:${String(Math.floor(total / 60) % 60).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`]];
  return (
    <ToolWrap>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[["Days", d, setD], ["Hours", h, setH], ["Min", m, setM], ["Sec", s, setS]].map(([l, v, set]) => (
          <label key={l as string} className="text-sm">{l as string}<input type="number" min={0} className="input-field w-full mt-1" value={v as number} onChange={e => (set as (n: number) => void)(+e.target.value)} /></label>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {rows.map(([l, v]) => <div key={l} className="relative surface rounded-xl border p-3 text-center"><div className="text-base font-bold tabular-nums text-brand-600">{v}</div><div className="text-xs text-muted">{l}</div><CopyBtn text={v} absolute /></div>)}
      </div>
    </ToolWrap>
  );
}

/* ── Week Number Calculator ── */
function isoWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
export function WeekNumber() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const d = new Date(date);
  const week = isoWeek(d);
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  return (
    <ToolWrap>
      <input type="date" className="input-field w-full mb-4" value={date} onChange={e => setDate(e.target.value)} />
      <div className="grid grid-cols-3 gap-3">
        <div className="surface rounded-xl border p-4 text-center"><div className="text-2xl font-black text-brand-600">{week}</div><div className="text-xs text-muted">ISO week</div></div>
        <div className="surface rounded-xl border p-4 text-center"><div className="text-2xl font-black">{dayOfYear}</div><div className="text-xs text-muted">day of year</div></div>
        <div className="surface rounded-xl border p-4 text-center"><div className="text-2xl font-black">{d.toLocaleDateString("en-US", { weekday: "short" })}</div><div className="text-xs text-muted">weekday</div></div>
      </div>
    </ToolWrap>
  );
}

/* ── Date Format Tokens ── */
export function DateFormatTokens() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const d = new Date(date);
  const p2 = (n: number) => String(n).padStart(2, "0");
  const tokens: [string, string][] = [
    ["YYYY-MM-DD", `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`],
    ["DD/MM/YYYY", `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()}`],
    ["MM/DD/YYYY", `${p2(d.getMonth() + 1)}/${p2(d.getDate())}/${d.getFullYear()}`],
    ["HH:mm:ss", `${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`],
    ["ISO 8601", d.toISOString()],
    ["RFC 2822", d.toUTCString()],
    ["Unix (s)", String(Math.floor(d.getTime() / 1000))],
    ["Long", d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })],
    ["Relative", d.toLocaleString()],
  ];
  return (
    <ToolWrap>
      <input type="datetime-local" className="input-field w-full mb-3" value={date} onChange={e => setDate(e.target.value)} />
      <div className="space-y-2">
        {tokens.map(([l, v]) => <div key={l} className="relative surface flex items-center gap-3 rounded-xl border p-3"><span className="text-xs text-muted w-28 shrink-0 font-mono">{l}</span><span className="flex-1 font-mono text-sm break-all">{v}</span><CopyBtn text={v} /></div>)}
      </div>
    </ToolWrap>
  );
}

/* ── Time Until / Countdown ── */
export function TimeUntil() {
  const [target, setTarget] = useState("2026-12-31T00:00");
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = new Date(target).getTime() - now;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86400000), hrs = Math.floor(abs / 3600000) % 24, mins = Math.floor(abs / 60000) % 60, secs = Math.floor(abs / 1000) % 60;
  return (
    <ToolWrap>
      <input type="datetime-local" className="input-field w-full mb-4" value={target} onChange={e => setTarget(e.target.value)} />
      <div className="grid grid-cols-4 gap-3 mb-2">
        {[["Days", days], ["Hours", hrs], ["Min", mins], ["Sec", secs]].map(([l, v]) => (
          <div key={l} className="surface rounded-xl border p-4 text-center"><div className="text-3xl font-black text-brand-600 tabular-nums">{v}</div><div className="text-xs text-muted">{l}</div></div>
        ))}
      </div>
      <p className="text-center text-sm text-muted">{diff >= 0 ? "remaining until" : "elapsed since"} target</p>
    </ToolWrap>
  );
}

/* ── Leap Year Checker ── */
export function LeapYearChecker() {
  const [year, setYear] = useState(new Date().getFullYear());
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const next = (() => { let y = year + 1; while (!((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0)) y++; return y; })();
  return (
    <ToolWrap>
      <input type="number" className="input-field w-full mb-4 text-center text-lg" value={year} onChange={e => setYear(+e.target.value)} />
      <div className={`rounded-xl border p-6 text-center ${isLeap ? "bg-green-500/10 border-green-400" : "surface"}`}>
        <div className="text-2xl font-black">{isLeap ? "✓ Leap year" : "✗ Not a leap year"}</div>
        <div className="text-sm text-muted mt-2">{isLeap ? "366 days · February has 29 days" : "365 days · February has 28 days"}</div>
        <div className="text-xs text-muted mt-1">Next leap year: {next}</div>
      </div>
    </ToolWrap>
  );
}

/* ── Day of Week Finder ── */
export function DayOfWeekFinder() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const d = new Date(date);
  const valid = !isNaN(d.getTime());
  return (
    <ToolWrap>
      <input type="date" className="input-field w-full mb-4" value={date} onChange={e => setDate(e.target.value)} />
      {valid && (
        <div className="surface rounded-xl border p-6 text-center">
          <div className="text-3xl font-black text-brand-600">{d.toLocaleDateString("en-US", { weekday: "long" })}</div>
          <div className="text-sm text-muted mt-2">{d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
          <div className="text-xs text-muted mt-1">Day {d.getDay()} (0=Sun) · {["Weekend", "Weekday", "Weekday", "Weekday", "Weekday", "Weekday", "Weekend"][d.getDay()]}</div>
        </div>
      )}
    </ToolWrap>
  );
}

/* ── Cron Next Runs ── */
function cronMatch(field: string, value: number, min: number, max: number): boolean {
  if (field === "*") return true;
  for (const part of field.split(",")) {
    const stepM = part.match(/^(\*|\d+(?:-\d+)?)\/(\d+)$/);
    if (stepM) {
      const step = +stepM[2];
      let lo = min, hi = max;
      if (stepM[1] !== "*") { const r = stepM[1].split("-").map(Number); lo = r[0]; hi = r[1] ?? max; }
      for (let v = lo; v <= hi; v += step) if (v === value) return true;
      continue;
    }
    const range = part.match(/^(\d+)-(\d+)$/);
    if (range) { if (value >= +range[1] && value <= +range[2]) return true; continue; }
    if (+part === value) return true;
  }
  return false;
}
export function CronNextRuns() {
  const [expr, setExpr] = useState("*/15 * * * *");
  const compute = () => {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return { err: "Cron must have 5 fields: min hour day month weekday", runs: [] as string[] };
    const [mi, ho, da, mo, we] = parts;
    const runs: string[] = [];
    const t = new Date();
    t.setSeconds(0, 0); t.setMinutes(t.getMinutes() + 1);
    let guard = 0;
    while (runs.length < 8 && guard++ < 366 * 24 * 60) {
      if (cronMatch(mi, t.getMinutes(), 0, 59) && cronMatch(ho, t.getHours(), 0, 23) && cronMatch(da, t.getDate(), 1, 31) && cronMatch(mo, t.getMonth() + 1, 1, 12) && cronMatch(we, t.getDay(), 0, 6)) {
        runs.push(new Date(t).toLocaleString());
      }
      t.setMinutes(t.getMinutes() + 1);
    }
    return { err: "", runs };
  };
  const { err, runs } = compute();
  return (
    <ToolWrap>
      <input className="input-field w-full font-mono mb-3" value={expr} onChange={e => setExpr(e.target.value)} placeholder="*/15 * * * *" />
      {err ? <p className="text-sm text-red-500">{err}</p> : (
        <div className="space-y-1">
          <p className="text-xs text-muted mb-1">Next 8 runs (local time):</p>
          {runs.map((r, i) => <div key={i} className="surface rounded-lg border px-3 py-1.5 font-mono text-sm">{r}</div>)}
        </div>
      )}
    </ToolWrap>
  );
}

/* ── Epoch Batch Converter ── */
export function EpochBatchConverter() {
  const [text, setText] = useState("1700000000\n1735689600\n1609459200");
  const out = text.split("\n").map(line => {
    const n = parseInt(line.trim());
    if (isNaN(n)) return line.trim() ? `${line.trim()} → invalid` : "";
    const ms = String(Math.abs(n)).length > 10 ? n : n * 1000;
    return `${line.trim()} → ${new Date(ms).toISOString()}`;
  }).filter(Boolean).join("\n");
  return (
    <ToolWrap>
      <p className="text-xs text-muted mb-2">One Unix timestamp per line (seconds or milliseconds auto-detected).</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <textarea className="input-area w-full font-mono text-sm" rows={7} value={text} onChange={e => setText(e.target.value)} />
        <div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={7} value={out} /><CopyBtn text={out} absolute /></div>
      </div>
    </ToolWrap>
  );
}

/* ── Work Hours Calculator ── */
export function WorkHoursCalculator() {
  const [start, setStart] = useState("09:00"), [end, setEnd] = useState("17:30"), [brk, setBrk] = useState(60);
  const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  let worked = toMin(end) - toMin(start) - brk;
  if (worked < 0) worked += 24 * 60;
  const h = Math.floor(worked / 60), m = worked % 60;
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        <label className="text-sm">Clock in<input type="time" className="input-field w-full mt-1" value={start} onChange={e => setStart(e.target.value)} /></label>
        <label className="text-sm">Clock out<input type="time" className="input-field w-full mt-1" value={end} onChange={e => setEnd(e.target.value)} /></label>
        <label className="text-sm">Break (min)<input type="number" className="input-field w-full mt-1" value={brk} onChange={e => setBrk(+e.target.value)} /></label>
      </div>
      <div className="surface rounded-xl border p-6 text-center">
        <div className="text-3xl font-black text-brand-600">{h}h {m}m</div>
        <div className="text-sm text-muted mt-2">{(worked / 60).toFixed(2)} decimal hours worked</div>
      </div>
    </ToolWrap>
  );
}
