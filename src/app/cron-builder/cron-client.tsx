"use client";

import { useMemo, useState } from "react";

// ── Cron logic ────────────────────────────────────────────────────────────────

function matchesCron(date: Date, min: string, hour: string, day: string, month: string, weekday: string): boolean {
  const matchField = (val: number, expr: string, min_: number, max_: number): boolean => {
    if (expr === "*") return true;
    for (const part of expr.split(",")) {
      if (part.includes("/")) {
        const [, step] = part.split("/");
        const s = parseInt(step);
        if (!isNaN(s) && val % s === 0) return true;
      } else if (part.includes("-")) {
        const [lo, hi] = part.split("-").map(Number);
        if (val >= lo && val <= hi) return true;
      } else {
        if (parseInt(part) === val) return true;
      }
    }
    return false;
  };
  return (
    matchField(date.getMinutes(),    min,     0, 59) &&
    matchField(date.getHours(),      hour,    0, 23) &&
    matchField(date.getDate(),       day,     1, 31) &&
    matchField(date.getMonth() + 1,  month,   1, 12) &&
    matchField(date.getDay(),        weekday, 0, 6)
  );
}

function nextRuns(cron: string, count = 10): Date[] {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return [];
  const [min, hour, day, month, weekday] = parts;
  const results: Date[] = [];
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);
  for (let i = 0; i < 526000 && results.length < count; i++) {
    if (matchesCron(d, min, hour, day, month, weekday)) results.push(new Date(d));
    d.setMinutes(d.getMinutes() + 1);
  }
  return results;
}

function describe(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid cron expression";
  const [min, hour, day, month, weekday] = parts;
  const all = (v: string) => v === "*";
  const everyN = (v: string) => v.startsWith("*/");
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const fmtTime = (h: string, m: string) => {
    if (all(h) && all(m)) return "every minute";
    if (all(h) && everyN(m)) return `every ${m.slice(2)} minutes`;
    if (everyN(h) && all(m)) return `every ${h.slice(2)} hours`;
    if (all(h)) return `at minute ${m}`;
    const hh = all(h) ? "every hour" : `${String(parseInt(h)).padStart(2, "0")}:${String(parseInt(all(m) ? "0" : m)).padStart(2, "0")}`;
    return hh;
  };

  if (all(min) && all(hour) && all(day) && all(month) && all(weekday)) return "Every minute";
  if (all(min) && everyN(hour) && all(day) && all(month) && all(weekday)) return `Every ${hour.slice(2)} hours`;
  if (everyN(min) && all(hour) && all(day) && all(month) && all(weekday)) return `Every ${min.slice(2)} minutes`;

  const time = !all(hour) && !all(min) ? `at ${String(parseInt(hour)).padStart(2, "0")}:${String(parseInt(min)).padStart(2, "0")}` : fmtTime(hour, min);

  if (!all(weekday)) {
    const days = weekday.split(",").map((d) => weekdays[parseInt(d)] ?? d).join(", ");
    return `Every ${days} ${time}`;
  }
  if (all(day) && all(month)) return `Every day ${time}`;
  if (!all(month)) {
    const m = months[parseInt(month) - 1] ?? month;
    return `Every year in ${m} on day ${day} ${time}`;
  }
  if (everyN(day)) return `Every ${day.slice(2)} days ${time}`;
  return `On day ${day} of every month ${time}`;
}

const PRESETS = [
  { label: "Every minute",    cron: "* * * * *" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Hourly",          cron: "0 * * * *" },
  { label: "Daily midnight",  cron: "0 0 * * *" },
  { label: "Daily 9 AM",      cron: "0 9 * * *" },
  { label: "Weekdays 9 AM",   cron: "0 9 * * 1-5" },
  { label: "Every Sunday",    cron: "0 0 * * 0" },
  { label: "Monthly (1st)",   cron: "0 0 1 * *" },
  { label: "Yearly (Jan 1)",  cron: "0 0 1 1 *" },
  { label: "Every 15 min",    cron: "*/15 * * * *" },
  { label: "Twice daily",     cron: "0 8,20 * * *" },
  { label: "Weekends only",   cron: "0 10 * * 0,6" },
];

function FieldEditor({
  label, value, onChange, options, max, min: minV = 0,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options?: { value: string; label: string }[];
  max: number; min?: number;
}) {
  return (
    <div className="surface rounded-xl border p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="surface-2 rounded-lg border border-app px-2 py-1 text-xs outline-none">
          <option value="*">Every (★)</option>
          {Array.from({ length: max - minV + 1 }, (_, i) => i + minV).map((n) => (
            <option key={n} value={String(n)}>{options?.find((o) => o.value === String(n))?.label ?? n}</option>
          ))}
          {[2, 3, 4, 5, 6, 10, 12, 15, 30].filter((s) => s <= max).map((s) => (
            <option key={`s${s}`} value={`*/${s}`}>Every {s}</option>
          ))}
        </select>
      </div>
      <div className="rounded-lg bg-[var(--surface-2)] px-3 py-1.5 font-mono text-xs text-brand-600">{value}</div>
    </div>
  );
}

export function CronBuilder() {
  const [minute,  setMinute]  = useState("*");
  const [hour,    setHour]    = useState("*");
  const [day,     setDay]     = useState("*");
  const [month,   setMonth]   = useState("*");
  const [weekday, setWeekday] = useState("*");
  const [rawMode, setRawMode] = useState(false);
  const [raw, setRaw]         = useState("");
  const [copied, setCopied]   = useState(false);

  const cron = rawMode ? raw : `${minute} ${hour} ${day} ${month} ${weekday}`;
  const description = useMemo(() => describe(cron), [cron]);
  const runs = useMemo(() => nextRuns(cron), [cron]);

  const loadPreset = (c: string) => {
    if (rawMode) { setRaw(c); return; }
    const [m, h, d, mo, wd] = c.split(" ");
    setMinute(m); setHour(h); setDay(d); setMonth(mo); setWeekday(wd);
  };

  return (
    <div className="space-y-5">
      {/* Presets */}
      <div className="surface rounded-2xl border p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.cron} type="button" onClick={() => loadPreset(p.cron)}
              className="surface-2 rounded-full border border-app px-3 py-1.5 text-xs font-medium text-muted transition hover:border-brand-400 hover:text-brand-600">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <div className="flex overflow-hidden rounded-xl border border-app surface">
          <button type="button" onClick={() => setRawMode(false)}
            className={`px-4 py-2 text-sm font-medium transition ${!rawMode ? "bg-brand-600 text-white" : "text-muted hover:text-[var(--text)]"}`}>
            Visual builder
          </button>
          <button type="button" onClick={() => { setRawMode(true); setRaw(cron); }}
            className={`px-4 py-2 text-sm font-medium transition ${rawMode ? "bg-brand-600 text-white" : "text-muted hover:text-[var(--text)]"}`}>
            Raw expression
          </button>
        </div>
      </div>

      {rawMode ? (
        <div className="surface rounded-2xl border p-5 shadow-sm">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">Cron Expression</label>
          <input type="text" value={raw} onChange={(e) => setRaw(e.target.value)}
            className="surface-2 w-full rounded-xl border border-app px-4 py-3 font-mono text-sm outline-none"
            placeholder="* * * * *" aria-label="Raw cron expression" />
          <p className="mt-2 text-[10px] text-muted">Format: minute hour day-of-month month day-of-week</p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <FieldEditor label="Minute"  value={minute}  onChange={setMinute}  max={59} />
          <FieldEditor label="Hour"    value={hour}    onChange={setHour}    max={23} />
          <FieldEditor label="Day"     value={day}     onChange={setDay}     max={31} min={1} />
          <FieldEditor label="Month"   value={month}   onChange={setMonth}   max={12} min={1}
            options={["January","February","March","April","May","June","July","August","September","October","November","December"].map((n, i) => ({ value: String(i+1), label: n }))} />
          <FieldEditor label="Weekday" value={weekday} onChange={setWeekday} max={6}
            options={["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((n, i) => ({ value: String(i), label: n }))} />
        </div>
      )}

      {/* Result */}
      <div className="surface rounded-2xl border p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Expression</p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-wide">{cron}</p>
          </div>
          <button type="button"
            onClick={async () => { await navigator.clipboard.writeText(cron); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${copied ? "border-green-500 text-green-600" : "surface-2 border-app text-muted hover:text-[var(--text)]"}`}>
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <div className="surface-2 rounded-xl border border-app px-4 py-3">
          <p className="text-sm font-medium">{description}</p>
        </div>
      </div>

      {/* Next runs */}
      {runs.length > 0 && (
        <section className="surface rounded-2xl border p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Next {runs.length} Scheduled Runs</h2>
          <ol className="space-y-1.5">
            {runs.map((d, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-[var(--surface-2)]">
                <span className="text-[10px] font-bold text-muted tabular-nums w-4">{i + 1}.</span>
                <span className="font-mono text-sm">{d.toLocaleString()}</span>
                <span className="ml-auto text-xs text-muted tabular-nums">
                  {Math.round((d.getTime() - Date.now()) / 60000)} min
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
      {runs.length === 0 && cron.trim() && (
        <p className="text-sm text-muted">No upcoming runs found — check your expression.</p>
      )}
    </div>
  );
}
