"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TEXTS: Record<string, string[]> = {
  common: [
    "the quick brown fox jumps over the lazy dog while the sun sets behind the quiet hills",
    "practice makes perfect so keep your fingers on the home row and let your hands learn the keys",
    "a good typist looks at the screen and not the keyboard trusting muscle memory to find each letter",
  ],
  quotes: [
    "the only way to do great work is to love what you do and never settle for less than your best",
    "success is not final and failure is not fatal it is the courage to continue that really counts",
    "simplicity is the ultimate sophistication and clear thinking leads to clear and simple writing",
  ],
  code: [
    "const sum = (a, b) => a + b; export default function App() { return sum(2, 3); }",
    "for (let i = 0; i < items.length; i++) { console.log(items[i].name, items[i].value); }",
    "if (user && user.isActive) { return fetch('/api/data').then(r => r.json()); }",
  ],
  numbers: [
    "8472 9301 5560 1284 7793 3025 6618 4471 9902 1337 8080 2048 4096 1024 512 256",
    "invoice 4821 total 19.99 tax 1.60 qty 12 sku 77310 zip 90210 phone 555 0134",
  ],
};

type Mode = "time" | "words";

export function TypingClient() {
  const [category, setCategory] = useState<keyof typeof TEXTS>("common");
  const [mode, setMode] = useState<Mode>("time");
  const [duration, setDuration] = useState(30);
  const [wordTarget, setWordTarget] = useState(25);

  const [target, setTarget] = useState("");
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const pickText = useCallback(() => {
    const pool = TEXTS[category];
    let t = pool[Math.floor(Math.random() * pool.length)];
    if (mode === "words") {
      const words = t.split(" ");
      while (words.length < wordTarget) words.push(...pool[Math.floor(Math.random() * pool.length)].split(" "));
      t = words.slice(0, wordTarget).join(" ");
    }
    return t;
  }, [category, mode, wordTarget]);

  const reset = useCallback(() => {
    setTarget(pickText());
    setTyped("");
    setStartedAt(null);
    setNow(0);
    setDone(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [pickText]);

  useEffect(() => { reset(); }, [reset]);

  // Ticker
  useEffect(() => {
    if (startedAt === null || done) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [startedAt, done]);

  // End conditions
  const elapsed = startedAt ? (now - startedAt) / 1000 : 0;
  useEffect(() => {
    if (startedAt === null || done) return;
    if (mode === "time" && elapsed >= duration) finish();
    if (mode === "words" && typed.length >= target.length) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, typed, startedAt, done]);

  function finish() { setDone(true); }

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (done) return;
    const v = e.target.value;
    if (startedAt === null && v.length > 0) { setStartedAt(Date.now()); setNow(Date.now()); }
    // In time mode allow looping past the text; in words mode cap at target length
    setTyped(mode === "words" ? v.slice(0, target.length) : v);
  };

  // Stats
  const stats = useMemo(() => {
    let correct = 0, errors = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === target[i]) correct++; else errors++;
    }
    const mins = Math.max(elapsed, 0.0001) / 60;
    const grossWpm = (typed.length / 5) / mins;
    const netWpm = Math.max(0, (correct / 5) / mins);
    const accuracy = typed.length ? (correct / typed.length) * 100 : 100;
    return { correct, errors, grossWpm, netWpm, accuracy };
  }, [typed, target, elapsed]);

  const timeLeft = mode === "time" ? Math.max(0, duration - elapsed) : null;

  return (
    <div>
      {/* Config */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl border border-app p-1">
          {(["time", "words"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`rounded-lg px-3 py-1 text-sm capitalize ${mode === m ? "bg-brand-500/15 text-brand-600 font-semibold" : "text-muted"}`}>{m}</button>
          ))}
        </div>
        {mode === "time" ? (
          <div className="flex gap-1">
            {[15, 30, 60, 120].map((d) => (
              <button key={d} onClick={() => setDuration(d)} className={`rounded-lg border px-3 py-1 text-sm ${duration === d ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{d}s</button>
            ))}
          </div>
        ) : (
          <div className="flex gap-1">
            {[10, 25, 50].map((w) => (
              <button key={w} onClick={() => setWordTarget(w)} className={`rounded-lg border px-3 py-1 text-sm ${wordTarget === w ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{w} words</button>
            ))}
          </div>
        )}
        <div className="flex gap-1">
          {(Object.keys(TEXTS) as (keyof typeof TEXTS)[]).map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`rounded-lg border px-3 py-1 text-sm capitalize ${category === c ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{c}</button>
          ))}
        </div>
        <button onClick={reset} className="ml-auto rounded-lg border surface px-3 py-1.5 text-sm">↻ Restart</button>
      </div>

      {/* Live stats */}
      <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        <Stat label="WPM" value={Math.round(stats.netWpm)} accent />
        <Stat label="Accuracy" value={`${stats.accuracy.toFixed(0)}%`} />
        <Stat label="Errors" value={stats.errors} />
        <Stat label={mode === "time" ? "Time left" : "Elapsed"} value={mode === "time" ? `${Math.ceil(timeLeft!)}s` : `${elapsed.toFixed(0)}s`} />
      </div>

      {/* Text display */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="surface relative mb-3 cursor-text rounded-2xl border p-5 text-xl leading-relaxed tracking-wide"
        style={{ fontFamily: category === "code" || category === "numbers" ? "var(--font-geist-mono, monospace)" : undefined }}
      >
        {target.split("").map((ch, i) => {
          let cls = "text-muted";
          if (i < typed.length) cls = typed[i] === ch ? "text-green-600" : "text-red-500 underline decoration-red-500";
          const caret = i === typed.length && !done ? "border-l-2 border-brand-500 animate-pulse" : "";
          return <span key={i} className={`${cls} ${caret}`}>{ch === " " ? " " : ch}</span>;
        })}
        {typed.length >= target.length && !done && <span className="border-l-2 border-brand-500 animate-pulse">&nbsp;</span>}
      </div>

      <textarea
        ref={inputRef}
        value={typed}
        onChange={onChange}
        disabled={done}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        className="input-area w-full font-mono text-sm"
        rows={2}
        placeholder="Click the text above or here, then start typing…"
        aria-label="Typing input"
      />

      {/* Result */}
      {done && (
        <div className="surface mt-4 rounded-2xl border p-5 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-muted">Result</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-8">
            <div><div className="text-4xl font-black text-brand-600">{Math.round(stats.netWpm)}</div><div className="text-xs text-muted">net WPM</div></div>
            <div><div className="text-4xl font-black">{stats.accuracy.toFixed(0)}%</div><div className="text-xs text-muted">accuracy</div></div>
            <div><div className="text-4xl font-black">{Math.round(stats.grossWpm)}</div><div className="text-xs text-muted">gross WPM</div></div>
            <div><div className="text-4xl font-black text-red-500">{stats.errors}</div><div className="text-xs text-muted">errors</div></div>
          </div>
          <button onClick={reset} className="mt-4 rounded-xl border border-brand-500 bg-brand-500/10 px-5 py-2 text-sm font-semibold text-brand-600">Try again →</button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="surface rounded-xl border p-3 text-center">
      <div className={`text-2xl font-black tabular-nums ${accent ? "text-brand-600" : ""}`}>{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
