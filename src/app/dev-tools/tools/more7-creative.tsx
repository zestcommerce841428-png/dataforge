"use client";

import { useState, useMemo } from "react";

/* ─── 1. ASCII Art Generator ─────────────────────────────────────────── */
const ASCII_FONTS: Record<string, Record<string, string[]>> = {
  block: {
    A: ["  ██  ","  ██  "," ████ ","██  ██","██████","██  ██"],
    B: ["███   ","██ █  ","████  ","██ ██ ","██  ██","████  "],
    C: [" ████ ","██    ","██    ","██    ","██    "," ████ "],
    D: ["████  ","██ ██ ","██  ██","██  ██","██ ██ ","████  "],
    E: ["██████","██    ","████  ","██    ","██    ","██████"],
    F: ["██████","██    ","████  ","██    ","██    ","██    "],
    G: [" ████ ","██    ","██ ███","██  ██","██  ██"," █████"],
    H: ["██  ██","██  ██","██████","██  ██","██  ██","██  ██"],
    I: ["██████","  ██  ","  ██  ","  ██  ","  ██  ","██████"],
    default: ["██████","  ██  ","  ██  ","  ██  ","  ██  ","  ██  "],
  }
};

function charToAscii(c: string, lines: number = 6): string[] {
  const font = ASCII_FONTS.block;
  const upper = c.toUpperCase();
  const result = font[upper] ?? font.default;
  return result.slice(0, lines);
}

export function AsciiArtGenerator() {
  const [text, setText] = useState("HELLO");
  const [char, setChar] = useState("█");

  const art = useMemo(() => {
    if (!text) return "";
    const chars = text.toUpperCase().slice(0, 12).split("");
    const lineCount = 6;
    const rows: string[] = [];
    for (let row = 0; row < lineCount; row++) {
      rows.push(chars.map((c) => {
        if (c === " ") return "      ";
        const lines = charToAscii(c);
        return (lines[row] ?? "      ").replace(/█/g, char);
      }).join("  "));
    }
    return rows.join("\n");
  }, [text, char]);

  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(art);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Block-style ASCII art generator (A-Z, up to 12 characters)</p>
      <div className="flex gap-3">
        <input value={text} onChange={(e) => setText(e.target.value.slice(0,12))} maxLength={12}
          className="flex-1 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm"
          placeholder="Type text (A-Z)…" />
        <div>
          <label className="sr-only">Fill character</label>
          <input value={char} onChange={(e) => setChar(e.target.value.slice(-1) || "█")} maxLength={1}
            className="w-16 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2.5 text-center text-sm" title="Fill character" />
        </div>
      </div>
      {art && (
        <div className="relative">
          <pre className="overflow-x-auto rounded-xl border border-app bg-[var(--surface-2)] p-4 font-mono text-xs leading-tight">
            {art}
          </pre>
          <button onClick={copy} className="absolute right-3 top-3 rounded-lg border border-app bg-[var(--bg-base)] px-3 py-1.5 text-xs">
            {copied ? "✓" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── 2. Emoji Finder / Search ───────────────────────────────────────── */
const EMOJI_DATA: { emoji: string; name: string; category: string }[] = [
  {emoji:"😀",name:"grinning face",category:"smileys"},{emoji:"😂",name:"face with tears of joy",category:"smileys"},
  {emoji:"🥰",name:"smiling face with hearts",category:"smileys"},{emoji:"😎",name:"smiling face with sunglasses",category:"smileys"},
  {emoji:"🤔",name:"thinking face",category:"smileys"},{emoji:"😴",name:"sleeping face",category:"smileys"},
  {emoji:"🥳",name:"partying face",category:"smileys"},{emoji:"😱",name:"face screaming in fear",category:"smileys"},
  {emoji:"❤️",name:"red heart",category:"symbols"},{emoji:"🔥",name:"fire",category:"symbols"},
  {emoji:"⭐",name:"star",category:"symbols"},{emoji:"💯",name:"hundred points",category:"symbols"},
  {emoji:"✅",name:"check mark button",category:"symbols"},{emoji:"❌",name:"cross mark",category:"symbols"},
  {emoji:"🎉",name:"party popper",category:"activity"},{emoji:"🎊",name:"confetti ball",category:"activity"},
  {emoji:"🏆",name:"trophy",category:"activity"},{emoji:"🎯",name:"bullseye",category:"activity"},
  {emoji:"🚀",name:"rocket",category:"travel"},{emoji:"🌍",name:"globe europe-africa",category:"travel"},
  {emoji:"✈️",name:"airplane",category:"travel"},{emoji:"🏖️",name:"beach with umbrella",category:"travel"},
  {emoji:"🍕",name:"pizza",category:"food"},{emoji:"🍔",name:"hamburger",category:"food"},
  {emoji:"🍣",name:"sushi",category:"food"},{emoji:"☕",name:"hot beverage",category:"food"},
  {emoji:"🍺",name:"beer mug",category:"food"},{emoji:"🎂",name:"birthday cake",category:"food"},
  {emoji:"💻",name:"laptop",category:"tech"},{emoji:"📱",name:"mobile phone",category:"tech"},
  {emoji:"🔑",name:"key",category:"tech"},{emoji:"💡",name:"light bulb",category:"tech"},
  {emoji:"🖥️",name:"desktop computer",category:"tech"},{emoji:"⌨️",name:"keyboard",category:"tech"},
  {emoji:"🐶",name:"dog face",category:"animals"},{emoji:"🐱",name:"cat face",category:"animals"},
  {emoji:"🦊",name:"fox",category:"animals"},{emoji:"🦁",name:"lion",category:"animals"},
  {emoji:"🌸",name:"cherry blossom",category:"nature"},{emoji:"🌊",name:"water wave",category:"nature"},
  {emoji:"⚡",name:"high voltage",category:"nature"},{emoji:"🌈",name:"rainbow",category:"nature"},
  {emoji:"💎",name:"gem stone",category:"objects"},{emoji:"🎸",name:"guitar",category:"objects"},
  {emoji:"📚",name:"books",category:"objects"},{emoji:"🔭",name:"telescope",category:"objects"},
  {emoji:"🎭",name:"performing arts",category:"objects"},{emoji:"🎨",name:"artist palette",category:"objects"},
  {emoji:"💪",name:"flexed biceps",category:"body"},{emoji:"👏",name:"clapping hands",category:"body"},
  {emoji:"🤝",name:"handshake",category:"body"},{emoji:"👍",name:"thumbs up",category:"body"},
];

const EMOJI_CATEGORIES = ["all", ...Array.from(new Set(EMOJI_DATA.map((e) => e.category)))];

export function EmojiSearch() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [copied, setCopied] = useState<string|null>(null);

  const filtered = useMemo(() => EMOJI_DATA.filter(
    (e) => (cat === "all" || e.category === cat) &&
    (e.name.includes(q.toLowerCase()) || e.emoji.includes(q))
  ), [q, cat]);

  async function copy(emoji: string) {
    await navigator.clipboard.writeText(emoji);
    setCopied(emoji); setTimeout(() => setCopied(null), 1000);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search emoji…"
          className="flex-1 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
        <select value={cat} onChange={(e) => setCat(e.target.value)}
          className="rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2.5 text-sm capitalize">
          {EMOJI_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-6 gap-1 sm:grid-cols-8">
        {filtered.map((e) => (
          <button key={e.emoji} onClick={() => copy(e.emoji)} title={e.name}
            className={`flex flex-col items-center rounded-xl p-2 text-2xl transition-transform hover:scale-110 hover:bg-[var(--surface-2)] ${copied === e.emoji ? "bg-brand-50 dark:bg-brand-950/20" : ""}`}>
            {e.emoji}
            {copied === e.emoji && <span className="text-[10px] text-brand-600">✓</span>}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted">{filtered.length} emoji · click to copy</p>
    </div>
  );
}

/* ─── 3. Domain Name Idea Generator ─────────────────────────────────── */
const DOMAIN_PREFIXES = ["get","use","try","go","my","the","super","ultra","hyper","smart","fast","cool","best","top","pro","easy","quick","new","open","app"];
const DOMAIN_SUFFIXES = ["hub","lab","hq","io","app","co","ai","tech","dev","pro","now","plus","zone","base","cloud","spot","link","box","kit","ly"];
const TLDS = [".com",".io",".app",".co",".dev",".net",".ai",".tech",".xyz",".online"];

export function DomainNameGenerator() {
  const [keyword, setKeyword] = useState("tools");
  const [ideas, setIdeas] = useState<{ domain: string; available: boolean | null }[]>([]);

  function generate() {
    const results = new Set<string>();
    const kw = keyword.toLowerCase().replace(/\s+/g, "");
    // prefix + keyword
    DOMAIN_PREFIXES.slice(0, 8).forEach((p) => TLDS.slice(0, 4).forEach((t) => results.add(`${p}${kw}${t}`)));
    // keyword + suffix
    DOMAIN_SUFFIXES.slice(0, 8).forEach((s) => TLDS.slice(0, 4).forEach((t) => results.add(`${kw}${s}${t}`)));
    // just keyword + tld
    TLDS.forEach((t) => results.add(`${kw}${t}`));
    setIdeas(Array.from(results).slice(0, 30).map((d) => ({ domain: d, available: null })));
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Enter a keyword…"
          className="flex-1 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          onKeyDown={(e) => e.key === "Enter" && generate()} />
        <button onClick={generate} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Generate
        </button>
      </div>
      {ideas.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {ideas.map(({ domain }) => (
            <div key={domain} className="flex items-center justify-between rounded-xl border border-app px-4 py-2.5 text-sm">
              <code className="font-mono">{domain}</code>
              <a href={`https://www.namecheap.com/domains/registration/results/?domain=${domain}`} target="_blank" rel="noopener noreferrer"
                className="text-xs text-brand-600 hover:underline">Check →</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── 4. Business Name Generator ─────────────────────────────────────── */
const BIZ_WORDS1 = ["Alpha","Beta","Nova","Apex","Pinnacle","Summit","Prime","Elite","Core","Nexus","Horizon","Vertex","Spark","Swift","Bold","Bright","Clear","Pure","True","Rise"];
const BIZ_WORDS2 = ["Solutions","Systems","Labs","Studio","Works","Forge","Hub","Group","Partners","Agency","Ventures","Digital","Creative","Technologies","Dynamics"];

export function BusinessNameGenerator() {
  const [keyword, setKeyword] = useState("");
  const [industry, setIndustry] = useState("tech");
  const [names, setNames] = useState<string[]>([]);
  const [copied, setCopied] = useState<string|null>(null);

  function generate() {
    const kw = keyword.trim();
    const results = new Set<string>();
    if (kw) {
      BIZ_WORDS2.forEach((s) => results.add(`${kw.charAt(0).toUpperCase()+kw.slice(1)} ${s}`));
      BIZ_WORDS1.forEach((p) => results.add(`${p} ${kw.charAt(0).toUpperCase()+kw.slice(1)}`));
    }
    for (let i = 0; i < 10; i++) {
      results.add(`${BIZ_WORDS1[Math.floor(Math.random()*BIZ_WORDS1.length)]} ${BIZ_WORDS2[Math.floor(Math.random()*BIZ_WORDS2.length)]}`);
    }
    setNames(Array.from(results).slice(0, 20));
  }

  async function copy(name: string) {
    await navigator.clipboard.writeText(name);
    setCopied(name); setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Optional keyword…"
          className="flex-1 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
        <select value={industry} onChange={(e) => setIndustry(e.target.value)}
          className="rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2.5 text-sm">
          {["tech","marketing","design","finance","health","education"].map((i) => <option key={i}>{i}</option>)}
        </select>
        <button onClick={generate} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Generate
        </button>
      </div>
      {names.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {names.map((n) => (
            <div key={n} className="flex items-center justify-between rounded-xl border border-app px-4 py-3 text-sm">
              <span className="font-semibold">{n}</span>
              <button onClick={() => copy(n)} className="text-xs text-muted hover:text-brand-600">
                {copied === n ? "✓" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── 5. Meeting Cost Calculator ─────────────────────────────────────── */
export function MeetingCostCalculator() {
  const [attendees, setAttendees] = useState("5");
  const [avgSalary, setAvgSalary] = useState("80000");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number|null>(null);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval>|null>(null);

  const n = parseInt(attendees) || 1;
  const annual = parseFloat(avgSalary) || 0;
  const hourlyRate = annual / (52 * 40);
  const totalHourly = hourlyRate * n;
  const elapsedHours = elapsed / 3600;
  const costSoFar = totalHourly * elapsedHours;

  function start() {
    const t = Date.now() - elapsed * 1000;
    setStartTime(t);
    setRunning(true);
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - t) / 1000)), 1000);
    setIntervalId(id);
  }

  function pause() {
    if (intervalId) clearInterval(intervalId);
    setRunning(false);
  }

  function reset() {
    if (intervalId) clearInterval(intervalId);
    setRunning(false); setElapsed(0); setStartTime(null);
  }

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Attendees</label>
          <input type="number" min={1} value={attendees} onChange={(e) => setAttendees(e.target.value)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Average annual salary ($)</label>
          <input type="number" min={0} value={avgSalary} onChange={(e) => setAvgSalary(e.target.value)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" />
        </div>
      </div>
      <div className="rounded-xl border border-app bg-[var(--surface-2)] p-6 text-center">
        <p className="text-xs text-muted">Meeting elapsed</p>
        <p className="mt-1 font-mono text-5xl font-black tabular-nums">
          {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
        </p>
        <p className="mt-4 text-4xl font-black text-red-500">${costSoFar.toFixed(2)}</p>
        <p className="text-xs text-muted">at ${totalHourly.toFixed(2)}/hr combined</p>
      </div>
      <div className="flex gap-3">
        {!running ? (
          <button onClick={start} className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
            ▶ {elapsed > 0 ? "Resume" : "Start"}
          </button>
        ) : (
          <button onClick={pause} className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
            ⏸ Pause
          </button>
        )}
        <button onClick={reset} className="rounded-xl border border-app px-6 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]">
          Reset
        </button>
      </div>
    </div>
  );
}

/* ─── 6. Random Quote Generator ─────────────────────────────────────── */
const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
];

export function RandomQuoteGenerator() {
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [category, setCategory] = useState<"all"|"motivational"|"programming">("all");

  const filtered = useMemo(() => {
    if (category === "programming") return QUOTES.filter((q) => ["John Johnson","Martin Fowler","Linus Torvalds","Harold Abelson"].some((a) => q.author === a));
    return QUOTES;
  }, [category]);

  function next() {
    setIdx((i) => (i + 1) % filtered.length);
    setCopied(false);
  }

  function random() {
    setIdx(Math.floor(Math.random() * filtered.length));
    setCopied(false);
  }

  const quote = filtered[idx % filtered.length] ?? QUOTES[0];

  async function copy() {
    await navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["all","motivational","programming"] as const).map((c) => (
          <button key={c} type="button" onClick={() => { setCategory(c); setIdx(0); }}
            className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${category === c ? "border-brand-500 bg-brand-500/10 text-brand-600" : "border-app text-muted hover:bg-[var(--surface-2)]"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-app bg-[var(--surface-2)] p-6">
        <p className="text-xl font-medium leading-relaxed text-[var(--text)]">&ldquo;{quote.text}&rdquo;</p>
        <p className="mt-4 text-sm font-semibold text-brand-600">— {quote.author}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={random} className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          🎲 Random
        </button>
        <button onClick={next} className="flex-1 rounded-xl border border-app py-2.5 text-sm hover:bg-[var(--surface-2)]">
          Next →
        </button>
        <button onClick={copy} className="rounded-xl border border-app px-5 py-2.5 text-sm hover:bg-[var(--surface-2)]">
          {copied ? "✓" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/* ─── 7. Habit Tracker ───────────────────────────────────────────────── */
const HABIT_KEY = "df-habits";

interface Habit { id: number; name: string; emoji: string; streak: number; lastChecked: string | null; completedToday: boolean }

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const stored = localStorage.getItem(HABIT_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 1, name: "Exercise", emoji: "💪", streak: 0, lastChecked: null, completedToday: false },
      { id: 2, name: "Read", emoji: "📚", streak: 0, lastChecked: null, completedToday: false },
    ];
  });
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("⭐");

  const today = new Date().toISOString().slice(0, 10);

  function save(updated: Habit[]) {
    setHabits(updated);
    try { localStorage.setItem(HABIT_KEY, JSON.stringify(updated)); } catch {}
  }

  function toggle(id: number) {
    save(habits.map((h) => {
      if (h.id !== id) return h;
      const wasChecked = h.lastChecked === today;
      const newStreak = wasChecked ? Math.max(0, h.streak - 1) : h.streak + 1;
      return { ...h, completedToday: !wasChecked, lastChecked: wasChecked ? null : today, streak: newStreak };
    }));
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    save([...habits, { id: Date.now(), name: newName.trim(), emoji: newEmoji, streak: 0, lastChecked: null, completedToday: false }]);
    setNewName("");
  }

  function remove(id: number) { save(habits.filter((h) => h.id !== id)); }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">Today: {new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
      <div className="space-y-2">
        {habits.map((h) => {
          const done = h.lastChecked === today;
          return (
            <div key={h.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${done ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-950/20" : "border-app"}`}>
              <button onClick={() => toggle(h.id)}
                className={`h-6 w-6 shrink-0 rounded-full border-2 transition-colors ${done ? "border-green-500 bg-green-500 text-white" : "border-app"}`}
                aria-label={done ? "Uncheck" : "Check"}>
                {done && "✓"}
              </button>
              <span className="text-xl">{h.emoji}</span>
              <span className={`flex-1 text-sm font-medium ${done ? "line-through text-muted" : ""}`}>{h.name}</span>
              <div className="text-right">
                <span className="text-xs font-bold text-orange-500">🔥 {h.streak}</span>
                <span className="ml-1 text-xs text-muted">day streak</span>
              </div>
              <button onClick={() => remove(h.id)} className="text-xs text-muted hover:text-red-500" aria-label="Remove habit">✕</button>
            </div>
          );
        })}
      </div>
      <form onSubmit={add} className="flex gap-2">
        <input value={newEmoji} onChange={(e) => setNewEmoji(e.target.value.slice(-2))} maxLength={2}
          className="w-14 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-center text-sm" placeholder="🌟" />
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New habit name…"
          className="flex-1 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
        <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Add</button>
      </form>
    </div>
  );
}

/* ─── 8. Color Palette Generator ────────────────────────────────────── */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0, l = (max+min)/2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    h = max===r ? (g-b)/d+(g<b?6:0) : max===g ? (b-r)/d+2 : (r-g)/d+4;
    h /= 6;
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1-l);
  const f = (n: number) => { const k=(n+h/30)%12; const color=l-a*Math.max(Math.min(k-3,9-k,1),-1); return Math.round(255*color).toString(16).padStart(2,"0"); };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function ColorPaletteGenerator() {
  const [base, setBase] = useState("#6366f1");
  const [mode, setMode] = useState<"analogous"|"complementary"|"triadic"|"shades">("shades");

  const palette = useMemo(() => {
    const [h, s, l] = hexToHsl(base);
    switch (mode) {
      case "analogous":      return [hslToHex((h-30+360)%360,s,l), hslToHex((h-15+360)%360,s,l), base, hslToHex((h+15)%360,s,l), hslToHex((h+30)%360,s,l)];
      case "complementary":  return [base, hslToHex((h+180)%360,s,l), hslToHex(h,s,Math.max(10,l-20)), hslToHex((h+180)%360,s,Math.min(90,l+20)), hslToHex(h,s,Math.min(90,l+20))];
      case "triadic":        return [base, hslToHex((h+120)%360,s,l), hslToHex((h+240)%360,s,l), hslToHex((h+60)%360,s,Math.max(10,l-15)), hslToHex((h+180)%360,s,Math.min(90,l+15))];
      case "shades":         return [hslToHex(h,s,10),hslToHex(h,s,25),hslToHex(h,s,40),hslToHex(h,s,55),hslToHex(h,s,70),hslToHex(h,s,85),hslToHex(h,s,95)];
      default: return [base];
    }
  }, [base, mode]);

  const [copied, setCopied] = useState<string|null>(null);
  async function copy(hex: string) {
    await navigator.clipboard.writeText(hex);
    setCopied(hex); setTimeout(() => setCopied(null), 1200);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Base color</label>
        <input type="color" value={base} onChange={(e) => setBase(e.target.value)} className="h-10 w-16 cursor-pointer rounded-xl border border-app" />
        <input value={base} onChange={(e) => setBase(e.target.value)} maxLength={7}
          className="w-28 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 font-mono text-sm" />
      </div>
      <div className="flex flex-wrap gap-2">
        {(["shades","analogous","complementary","triadic"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${mode === m ? "border-brand-500 bg-brand-500/10 text-brand-600" : "border-app text-muted hover:bg-[var(--surface-2)]"}`}>
            {m}
          </button>
        ))}
      </div>
      <div className={`grid gap-3 ${palette.length > 5 ? "grid-cols-7" : "grid-cols-5"}`}>
        {palette.map((hex) => (
          <button key={hex} onClick={() => copy(hex)} title={hex}
            className="group relative flex flex-col items-center gap-1">
            <div className="h-16 w-full rounded-xl border border-black/10 transition-transform group-hover:scale-105 shadow-sm"
              style={{ backgroundColor: hex }} />
            <code className="text-[10px] font-mono text-muted">{hex}</code>
            {copied === hex && <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20 text-sm text-white">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
