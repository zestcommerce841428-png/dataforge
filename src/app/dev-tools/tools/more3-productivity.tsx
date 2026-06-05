"use client";
import { useEffect, useRef, useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── Pomodoro Timer ── */
export function PomodoroTimer() {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const durations = { focus: 25 * 60, break: 5 * 60 };
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => { if (secs === 0) { setRunning(false); } }, [secs]);
  const switchMode = (m: "focus" | "break") => { setMode(m); setSecs(durations[m]); setRunning(false); };
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return (
    <ToolWrap>
      <div className="mb-4 flex justify-center gap-2">
        {(["focus", "break"] as const).map((m) => (
          <button key={m} onClick={() => switchMode(m)} className={`rounded-lg border px-4 py-1.5 text-sm capitalize ${mode === m ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{m}</button>
        ))}
      </div>
      <div className="text-center">
        <div className="font-mono text-6xl font-black tabular-nums">{mm}:{ss}</div>
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={() => setRunning((r) => !r)} className="rounded-xl bg-brand-600 px-6 py-2 font-semibold text-white">{running ? "Pause" : "Start"}</button>
          <button onClick={() => { setSecs(durations[mode]); setRunning(false); }} className="rounded-xl border surface px-4 py-2">Reset</button>
        </div>
      </div>
    </ToolWrap>
  );
}

/* ── To-Do List ── */
export function TodoList() {
  const [items, setItems] = useState<{ text: string; done: boolean }[]>([]);
  const [val, setVal] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem("df-todo") || "[]")); } catch {} setMounted(true); }, []);
  useEffect(() => { if (mounted) localStorage.setItem("df-todo", JSON.stringify(items)); }, [items, mounted]);
  const add = () => { if (val.trim()) { setItems((i) => [...i, { text: val.trim(), done: false }]); setVal(""); } };
  return (
    <ToolWrap>
      <div className="mb-3 flex gap-2">
        <input className="input-field flex-1" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add a task…" />
        <button onClick={add} className="rounded-lg bg-brand-600 px-4 text-white">Add</button>
      </div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="surface flex items-center gap-2 rounded-lg border px-3 py-2">
            <input type="checkbox" checked={it.done} onChange={() => setItems((arr) => arr.map((x, j) => j === i ? { ...x, done: !x.done } : x))} />
            <span className={`flex-1 text-sm ${it.done ? "text-muted line-through" : ""}`}>{it.text}</span>
            <button onClick={() => setItems((arr) => arr.filter((_, j) => j !== i))} className="text-muted hover:text-red-500">✕</button>
          </li>
        ))}
        {items.length === 0 && <p className="py-4 text-center text-sm text-muted">No tasks yet — saved to this device.</p>}
      </ul>
    </ToolWrap>
  );
}

/* ── Scratchpad ── */
export function Scratchpad() {
  const [text, setText] = useState("");
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setText(localStorage.getItem("df-notes") || ""); setMounted(true); }, []);
  useEffect(() => { if (!mounted) return; localStorage.setItem("df-notes", text); setSaved(true); const t = setTimeout(() => setSaved(false), 1000); return () => clearTimeout(t); }, [text, mounted]);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <ToolWrap>
      <textarea className="input-area w-full" rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Jot anything — auto-saved to this device…" />
      <p className="mt-1 text-xs text-muted">{words} words · {text.length} chars · {saved ? "✓ saved" : "auto-saves"}</p>
    </ToolWrap>
  );
}

const rand = (n: number) => Math.floor(Math.random() * n);

/* ── Coin Flip ── */
export function CoinFlip() {
  const [result, setResult] = useState("");
  const [stats, setStats] = useState({ h: 0, t: 0 });
  const flip = () => { const r = Math.random() < 0.5 ? "Heads" : "Tails"; setResult(r); setStats((s) => ({ h: s.h + (r === "Heads" ? 1 : 0), t: s.t + (r === "Tails" ? 1 : 0) })); };
  return (
    <ToolWrap>
      <div className="text-center">
        <div className="text-7xl">{result === "Heads" ? "🪙" : result === "Tails" ? "🪙" : "❓"}</div>
        <div className="mt-2 text-2xl font-black">{result || "Flip the coin"}</div>
        <button onClick={flip} className="mt-4 rounded-xl bg-brand-600 px-6 py-2 font-semibold text-white">Flip</button>
        <p className="mt-3 text-sm text-muted">Heads: {stats.h} · Tails: {stats.t}</p>
      </div>
    </ToolWrap>
  );
}

/* ── Dice Roller ── */
export function DiceRoller() {
  const [count, setCount] = useState(2);
  const [sides, setSides] = useState(6);
  const [rolls, setRolls] = useState<number[]>([]);
  const roll = () => setRolls(Array.from({ length: count }, () => 1 + rand(sides)));
  const FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  return (
    <ToolWrap>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <label className="text-sm">Dice<input type="number" min={1} max={12} className="input-field ml-1 w-16" value={count} onChange={(e) => setCount(+e.target.value)} /></label>
        <label className="text-sm">Sides<input type="number" min={2} max={100} className="input-field ml-1 w-20" value={sides} onChange={(e) => setSides(+e.target.value)} /></label>
        <button onClick={roll} className="rounded-lg bg-brand-600 px-4 py-1.5 font-semibold text-white">Roll</button>
      </div>
      {rolls.length > 0 && (
        <div className="surface rounded-xl border p-4 text-center">
          <div className="flex flex-wrap justify-center gap-2 text-4xl">{rolls.map((r, i) => <span key={i}>{sides === 6 ? FACES[r] : <span className="font-mono text-2xl">{r}</span>}</span>)}</div>
          <p className="mt-2 text-sm text-muted">Total: <strong className="text-brand-600">{rolls.reduce((a, b) => a + b, 0)}</strong></p>
        </div>
      )}
    </ToolWrap>
  );
}

/* ── Decision Maker ── */
export function DecisionMaker() {
  const [options, setOptions] = useState("Pizza\nBurger\nSushi\nTacos");
  const [pick, setPick] = useState("");
  const decide = () => { const opts = options.split("\n").map((o) => o.trim()).filter(Boolean); if (opts.length) setPick(opts[rand(opts.length)]); };
  return (
    <ToolWrap>
      <textarea className="input-area w-full mb-3" rows={5} value={options} onChange={(e) => setOptions(e.target.value)} placeholder="One option per line…" />
      <button onClick={decide} className="w-full rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">Decide for me</button>
      {pick && <div className="surface mt-3 rounded-xl border p-5 text-center"><div className="text-xs text-muted">The answer is</div><div className="text-2xl font-black text-brand-600">{pick}</div></div>}
    </ToolWrap>
  );
}

/* ── Random Picker / Raffle ── */
export function RandomPicker() {
  const [names, setNames] = useState("Alice\nBob\nCarol\nDave");
  const [count, setCount] = useState(1);
  const [winners, setWinners] = useState<string[]>([]);
  const draw = () => {
    const pool = names.split("\n").map((n) => n.trim()).filter(Boolean);
    const out: string[] = [];
    const copy = [...pool];
    for (let i = 0; i < Math.min(count, copy.length); i++) out.push(copy.splice(rand(copy.length), 1)[0]);
    setWinners(out);
  };
  return (
    <ToolWrap>
      <textarea className="input-area w-full mb-2" rows={5} value={names} onChange={(e) => setNames(e.target.value)} placeholder="One name per line…" />
      <div className="mb-3 flex items-center gap-2">
        <label className="text-sm">Pick<input type="number" min={1} className="input-field mx-1 w-16" value={count} onChange={(e) => setCount(+e.target.value)} /></label>
        <button onClick={draw} className="rounded-lg bg-brand-600 px-4 py-1.5 font-semibold text-white">Draw winners</button>
      </div>
      {winners.length > 0 && <div className="surface rounded-xl border p-4"><p className="text-xs text-muted mb-1">🎉 Winner(s)</p>{winners.map((w, i) => <div key={i} className="text-lg font-bold text-brand-600">{w}</div>)}</div>}
    </ToolWrap>
  );
}

/* ── Event Countdown ── */
export function EventCountdown() {
  const [target, setTarget] = useState("2026-12-31T00:00");
  const [label, setLabel] = useState("New Year");
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = new Date(target).getTime() - now;
  const d = Math.max(0, Math.floor(diff / 86400000));
  const h = Math.max(0, Math.floor(diff / 3600000) % 24);
  const m = Math.max(0, Math.floor(diff / 60000) % 60);
  const s = Math.max(0, Math.floor(diff / 1000) % 60);
  return (
    <ToolWrap>
      <div className="mb-3 flex flex-wrap gap-2">
        <input className="input-field flex-1" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Event name" />
        <input type="datetime-local" className="input-field" value={target} onChange={(e) => setTarget(e.target.value)} />
      </div>
      <div className="surface rounded-xl border p-5 text-center">
        <p className="text-sm text-muted">{label || "Event"}</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {[["Days", d], ["Hrs", h], ["Min", m], ["Sec", s]].map(([l, v]) => <div key={l}><div className="text-3xl font-black text-brand-600 tabular-nums">{v}</div><div className="text-xs text-muted">{l}</div></div>)}
        </div>
      </div>
    </ToolWrap>
  );
}

/* ── Timer with Alarm ── */
export function TimerAlarm() {
  const [input, setInput] = useState(5);
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs((s) => {
      if (s <= 1) { beep(); setRunning(false); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [running]);
  const beep = () => {
    try {
      const ctx = audioRef.current ?? new AudioContext(); audioRef.current = ctx;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.frequency.value = 880; o.start();
      g.gain.setValueAtTime(0.3, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      o.stop(ctx.currentTime + 1.2);
    } catch {}
  };
  const start = () => { setSecs(input * 60); setRunning(true); };
  return (
    <ToolWrap>
      <div className="mb-3 flex items-center gap-2">
        <label className="text-sm">Minutes<input type="number" min={1} className="input-field mx-1 w-20" value={input} onChange={(e) => setInput(+e.target.value)} /></label>
        <button onClick={start} className="rounded-lg bg-brand-600 px-4 py-1.5 font-semibold text-white">Start</button>
        <button onClick={() => setRunning(false)} className="rounded-lg border surface px-4 py-1.5">Stop</button>
      </div>
      <div className="text-center font-mono text-5xl font-black tabular-nums">{String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}</div>
      <p className="mt-2 text-center text-xs text-muted">Plays a sound when it reaches zero.</p>
    </ToolWrap>
  );
}
