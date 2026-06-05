"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/* ── Magic 8 Ball ── */
const EIGHT = ["It is certain", "Without a doubt", "Yes definitely", "Most likely", "Outlook good", "Signs point to yes", "Reply hazy, try again", "Ask again later", "Cannot predict now", "Don't count on it", "My reply is no", "Very doubtful", "Outlook not so good"];
export function Magic8Ball() {
  const [answer, setAnswer] = useState(""), [q, setQ] = useState("");
  return (
    <ToolWrap>
      <input className="input-field mb-3 w-full" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask a yes/no question…" />
      <div className="text-center">
        <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-slate-800 to-black text-center"><span className="px-3 text-sm font-semibold text-white">{answer || "8"}</span></div>
        <button onClick={() => setAnswer(pick(EIGHT))} className="mt-4 rounded-xl bg-brand-600 px-6 py-2 font-semibold text-white">Shake</button>
      </div>
    </ToolWrap>
  );
}

/* ── Random Quote ── */
const QUOTES: [string, string][] = [
  ["The only way to do great work is to love what you do.", "Steve Jobs"],
  ["Success is not final, failure is not fatal.", "Winston Churchill"],
  ["Whether you think you can or you can't, you're right.", "Henry Ford"],
  ["The best time to plant a tree was 20 years ago. The second best is now.", "Proverb"],
  ["Simplicity is the ultimate sophistication.", "Leonardo da Vinci"],
  ["Do what you can, with what you have, where you are.", "Theodore Roosevelt"],
  ["It always seems impossible until it's done.", "Nelson Mandela"],
  ["Stay hungry, stay foolish.", "Stewart Brand"],
];
export function RandomQuote() {
  const [q, setQ] = useState(QUOTES[0]);
  return <ToolWrap><div className="relative surface rounded-2xl border p-6 text-center"><p className="text-lg font-medium">&ldquo;{q[0]}&rdquo;</p><p className="mt-2 text-sm text-muted">— {q[1]}</p><CopyBtn text={`"${q[0]}" — ${q[1]}`} absolute /></div><button onClick={() => setQ(pick(QUOTES))} className="mt-3 w-full rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">New quote</button></ToolWrap>;
}

/* ── Would You Rather ── */
const WYR = ["have the ability to fly or be invisible?", "be able to talk to animals or speak every language?", "live without music or without movies?", "always be 10 minutes late or 20 minutes early?", "have unlimited money or unlimited time?", "explore space or the deep ocean?", "know when you'll die or how you'll die?"];
export function WouldYouRather() {
  const [q, setQ] = useState(WYR[0]);
  return <ToolWrap><div className="surface rounded-2xl border p-6 text-center"><div className="text-3xl">🤔</div><p className="mt-2 text-lg font-semibold">Would you rather…</p><p className="mt-1 text-muted">{q}</p></div><button onClick={() => setQ(pick(WYR))} className="mt-3 w-full rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">Next</button></ToolWrap>;
}

/* ── Truth or Dare ── */
const TRUTHS = ["What's your biggest fear?", "What's the most embarrassing thing you've done?", "Who was your first crush?", "What's a secret talent you have?", "What's the last lie you told?"];
const DARES = ["Do 10 push-ups right now.", "Speak in an accent for the next 5 minutes.", "Text the 5th person in your contacts 'hi'.", "Sing the chorus of your favorite song.", "Do your best dance move."];
export function TruthOrDare() {
  const [result, setResult] = useState("");
  return <ToolWrap><div className="mb-3 flex gap-2"><button onClick={() => setResult("Truth: " + pick(TRUTHS))} className="flex-1 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">Truth</button><button onClick={() => setResult("Dare: " + pick(DARES))} className="flex-1 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white">Dare</button></div>{result && <div className="surface rounded-xl border p-5 text-center text-lg font-medium">{result}</div>}</ToolWrap>;
}

/* ── Random Color ── */
export function RandomColorGenerator() {
  const [color, setColor] = useState("#3478f6");
  const gen = () => setColor("#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"));
  return <ToolWrap><div className="rounded-2xl border border-[var(--border)] p-10 text-center" style={{ background: color }}><span className="rounded-lg bg-black/40 px-3 py-1 font-mono text-lg font-bold text-white">{color}</span></div><div className="mt-3 flex gap-2"><button onClick={gen} className="flex-1 rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">Random color</button><CopyBtn text={color} /></div></ToolWrap>;
}

/* ── Fantasy Name Generator ── */
const FN = ["Aer", "Bran", "Cael", "Dorn", "El", "Fae", "Gar", "Kira", "Lyra", "Mor", "Nyx", "Oryn", "Syl", "Thal", "Vex", "Zara"];
const LN = ["wood", "stone", "fire", "shadow", "storm", "vale", "thorn", "wing", "blade", "moon", "frost", "dawn"];
export function FantasyNameGenerator() {
  const [out, setOut] = useState<string[]>([]);
  const gen = () => setOut(Array.from({ length: 8 }, () => `${pick(FN)}${pick(["", "a", "en", "is"])} ${pick(FN).toLowerCase()}${pick(LN)}`));
  return <ToolWrap><button onClick={gen} className="mb-3 w-full rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">Generate names</button><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{out.map((n, i) => <div key={i} className="relative surface rounded-lg border px-2 py-2 text-center text-sm capitalize">{n}<CopyBtn text={n} absolute /></div>)}</div></ToolWrap>;
}

/* ── Rock Paper Scissors ── */
export function RockPaperScissors() {
  const [score, setScore] = useState({ w: 0, l: 0, d: 0 }), [msg, setMsg] = useState("");
  const play = (you: string) => {
    const opts = ["✊ Rock", "✋ Paper", "✌️ Scissors"];
    const cpu = pick(opts);
    const y = opts.indexOf(you);
    const c = opts.indexOf(cpu);
    let r = "Draw"; let key: "w" | "l" | "d" = "d";
    if (y !== c) { if ((y + 1) % 3 === c) { r = "You lose"; key = "l"; } else { r = "You win!"; key = "w"; } }
    setScore((s) => ({ ...s, [key]: s[key] + 1 }));
    setMsg(`You ${you} vs ${cpu} → ${r}`);
  };
  return <ToolWrap><div className="mb-3 flex justify-center gap-2">{["✊ Rock", "✋ Paper", "✌️ Scissors"].map((o) => <button key={o} onClick={() => play(o)} className="surface rounded-xl border px-4 py-3 text-lg hover:border-brand-400">{o}</button>)}</div>{msg && <div className="surface rounded-xl border p-4 text-center font-medium">{msg}</div>}<p className="mt-2 text-center text-sm text-muted">Wins {score.w} · Losses {score.l} · Draws {score.d}</p></ToolWrap>;
}

/* ── Number Guessing Game ── */
export function NumberGuessGame() {
  const [target, setTarget] = useState(() => 1 + Math.floor(Math.random() * 100));
  const [guess, setGuess] = useState(""), [msg, setMsg] = useState("Guess a number 1–100"), [tries, setTries] = useState(0);
  const check = () => {
    const g = parseInt(guess); if (isNaN(g)) return;
    setTries((t) => t + 1);
    if (g === target) setMsg(`🎉 Correct! ${target} in ${tries + 1} tries.`);
    else setMsg(g < target ? "📈 Higher!" : "📉 Lower!");
  };
  const reset = () => { setTarget(1 + Math.floor(Math.random() * 100)); setMsg("Guess a number 1–100"); setTries(0); setGuess(""); };
  return <ToolWrap><div className="mb-3 flex gap-2"><input type="number" className="input-field flex-1" value={guess} onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check()} /><button onClick={check} className="rounded-lg bg-brand-600 px-4 font-semibold text-white">Guess</button><button onClick={reset} className="rounded-lg border surface px-3">↻</button></div><div className="surface rounded-xl border p-4 text-center font-medium">{msg}</div></ToolWrap>;
}

/* ── Random Emoji ── */
const EMO = "😀😎🤩🥳😍🤓🧐🤔😴🤯👻🤖👽🎃🐶🐱🦊🐼🐨🦁🐯🦄🐝🦋🌸🌈⭐🔥💧🍕🍔🍩🍦🎮🎧🎲🚀⚽🏀🎯🎁".split("");
export function RandomEmoji() {
  const [out, setOut] = useState<string[]>([]);
  const gen = () => setOut(Array.from({ length: 12 }, () => pick(EMO)));
  return <ToolWrap><button onClick={gen} className="mb-3 w-full rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">Random emojis</button>{out.length > 0 && <div className="relative surface rounded-xl border p-4 text-center text-3xl">{out.join(" ")}<CopyBtn text={out.join("")} absolute /></div>}</ToolWrap>;
}
