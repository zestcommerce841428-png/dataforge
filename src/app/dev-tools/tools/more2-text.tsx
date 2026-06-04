"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── Reverse Text ── */
export function ReverseText() {
  const [text, setText] = useState("Hello World");
  const [mode, setMode] = useState<"chars" | "words" | "lines">("chars");
  const out =
    mode === "chars" ? [...text].reverse().join("")
    : mode === "words" ? text.split(/\s+/).reverse().join(" ")
    : text.split("\n").reverse().join("\n");
  return (
    <ToolWrap>
      <div className="flex gap-2 mb-3">
        {(["chars", "words", "lines"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${mode === m ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{m}</button>
        ))}
      </div>
      <textarea className="input-area w-full mb-3" rows={3} value={text} onChange={e => setText(e.target.value)} />
      <div className="relative surface rounded-xl border p-3 font-mono text-sm break-all whitespace-pre-wrap">{out || <span className="text-muted">Result…</span>}<CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── NATO Phonetic Alphabet ── */
const NATO: Record<string, string> = { a:"Alfa",b:"Bravo",c:"Charlie",d:"Delta",e:"Echo",f:"Foxtrot",g:"Golf",h:"Hotel",i:"India",j:"Juliett",k:"Kilo",l:"Lima",m:"Mike",n:"November",o:"Oscar",p:"Papa",q:"Quebec",r:"Romeo",s:"Sierra",t:"Tango",u:"Uniform",v:"Victor",w:"Whiskey",x:"X-ray",y:"Yankee",z:"Zulu","0":"Zero","1":"One","2":"Two","3":"Three","4":"Four","5":"Five","6":"Six","7":"Seven","8":"Eight","9":"Nine" };
export function NatoPhonetic() {
  const [text, setText] = useState("SOS 2024");
  const out = [...text.toLowerCase()].map(c => NATO[c] ?? (c === " " ? "(space)" : c === "" ? "" : c)).filter(Boolean).join(" ");
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3" value={text} onChange={e => setText(e.target.value)} placeholder="Type letters or numbers…" />
      <div className="relative surface rounded-xl border p-4 text-sm">{out || <span className="text-muted">Result…</span>}<CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── Upside Down Text ── */
const FLIP: Record<string, string> = { a:"ɐ",b:"q",c:"ɔ",d:"p",e:"ǝ",f:"ɟ",g:"ƃ",h:"ɥ",i:"ᴉ",j:"ɾ",k:"ʞ",l:"l",m:"ɯ",n:"u",o:"o",p:"d",q:"b",r:"ɹ",s:"s",t:"ʇ",u:"n",v:"ʌ",w:"ʍ",x:"x",y:"ʎ",z:"z","1":"Ɩ","2":"ᄅ","3":"Ɛ","4":"ㄣ","5":"ϛ","6":"9","7":"ㄥ","8":"8","9":"6","0":"0",".":"˙",",":"'","?":"¿","!":"¡","(":")",")":"(","[":"]","]":"[","{":"}","}":"{","<":">",">":"<","_":"‾","&":"⅋" };
export function UpsideDownText() {
  const [text, setText] = useState("Hello World");
  const out = [...text.toLowerCase()].reverse().map(c => FLIP[c] ?? c).join("");
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3" value={text} onChange={e => setText(e.target.value)} />
      <div className="relative surface rounded-xl border p-4 text-lg">{out || <span className="text-muted">Result…</span>}<CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── Fancy Unicode Text ── */
function mapRange(text: string, upper: number, lower: number, digit?: number) {
  return [...text].map(ch => {
    const c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90) return String.fromCodePoint(upper + (c - 65));
    if (c >= 97 && c <= 122) return String.fromCodePoint(lower + (c - 97));
    if (digit && c >= 48 && c <= 57) return String.fromCodePoint(digit + (c - 48));
    return ch;
  }).join("");
}
export function FancyUnicodeText() {
  const [text, setText] = useState("DataForge");
  const styles: [string, string][] = [
    ["Bold", mapRange(text, 0x1d400, 0x1d41a, 0x1d7ce)],
    ["Italic", mapRange(text, 0x1d434, 0x1d44e)],
    ["Bold Italic", mapRange(text, 0x1d468, 0x1d482)],
    ["Script", mapRange(text, 0x1d49c, 0x1d4b6)],
    ["Double-struck", mapRange(text, 0x1d538, 0x1d552, 0x1d7d8)],
    ["Monospace", mapRange(text, 0x1d670, 0x1d68a, 0x1d7f6)],
    ["Sans-serif", mapRange(text, 0x1d5a0, 0x1d5ba, 0x1d7e2)],
    ["Fullwidth", [...text].map(ch => { const c = ch.charCodeAt(0); return c >= 33 && c <= 126 ? String.fromCodePoint(0xff00 + (c - 32)) : ch; }).join("")],
  ];
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3" value={text} onChange={e => setText(e.target.value)} />
      <div className="space-y-2">
        {styles.map(([name, val]) => (
          <div key={name} className="relative surface flex items-center gap-3 rounded-xl border p-3">
            <span className="text-xs text-muted w-28 shrink-0">{name}</span>
            <span className="flex-1 text-lg break-all">{val}</span>
            <CopyBtn text={val} />
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Zalgo Glitch Text ── */
export function ZalgoText() {
  const [text, setText] = useState("chaos");
  const [intensity, setIntensity] = useState(5);
  const marks = Array.from({ length: 50 }, (_, i) => String.fromCharCode(0x300 + i));
  const out = [...text].map(ch => {
    if (ch === " ") return ch;
    let s = ch;
    for (let i = 0; i < intensity; i++) s += marks[Math.floor(Math.random() * marks.length)];
    return s;
  }).join("");
  const [, force] = useState(0);
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3" value={text} onChange={e => setText(e.target.value)} />
      <label className="text-sm flex items-center gap-2 mb-3">Intensity: <input type="range" min={1} max={20} value={intensity} onChange={e => setIntensity(+e.target.value)} /> {intensity}
        <button onClick={() => force(n => n + 1)} className="ml-2 rounded-lg border surface px-3 py-1 text-xs">↻ Re-roll</button>
      </label>
      <div className="relative surface rounded-xl border p-4 text-2xl leading-loose break-all">{out}<CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── Acronym Extractor ── */
export function AcronymExtractor() {
  const [text, setText] = useState("As Soon As Possible");
  const words = text.trim().split(/\s+/).filter(Boolean);
  const acronym = words.map(w => w[0]?.toUpperCase() ?? "").join("");
  const dotted = words.map(w => w[0]?.toUpperCase() ?? "").join(".") + (words.length ? "." : "");
  return (
    <ToolWrap>
      <textarea className="input-area w-full mb-3" rows={2} value={text} onChange={e => setText(e.target.value)} placeholder="Type a phrase…" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative surface rounded-xl border p-4 text-center"><div className="text-2xl font-black text-brand-600 break-all">{acronym || "—"}</div><div className="text-xs text-muted mt-1">Acronym</div><CopyBtn text={acronym} absolute /></div>
        <div className="relative surface rounded-xl border p-4 text-center"><div className="text-2xl font-black break-all">{dotted}</div><div className="text-xs text-muted mt-1">Dotted</div><CopyBtn text={dotted} absolute /></div>
      </div>
    </ToolWrap>
  );
}

/* ── Advanced Text Sorter ── */
export function AdvancedTextSorter() {
  const [text, setText] = useState("banana\napple\nCherry\n10\n2\nMango");
  const [mode, setMode] = useState("alpha");
  const [desc, setDesc] = useState(false);
  const [ci, setCi] = useState(true);
  let lines = text.split("\n");
  const cmp: Record<string, (a: string, b: string) => number> = {
    alpha: (a, b) => (ci ? a.toLowerCase() : a).localeCompare(ci ? b.toLowerCase() : b),
    length: (a, b) => a.length - b.length,
    numeric: (a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0),
    natural: (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
  };
  if (mode === "shuffle") { lines = [...lines].sort(() => Math.random() - 0.5); }
  else { lines = [...lines].sort(cmp[mode]); if (desc) lines.reverse(); }
  const out = lines.join("\n");
  return (
    <ToolWrap>
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        {["alpha", "numeric", "length", "natural", "shuffle"].map(m => (
          <button key={m} onClick={() => setMode(m)} className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${mode === m ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{m}</button>
        ))}
        <label className="text-sm flex items-center gap-1 ml-2"><input type="checkbox" checked={desc} onChange={e => setDesc(e.target.checked)} /> Desc</label>
        <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={ci} onChange={e => setCi(e.target.checked)} /> Ignore case</label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <textarea className="input-area w-full font-mono text-sm" rows={8} value={text} onChange={e => setText(e.target.value)} />
        <div className="relative"><textarea readOnly className="input-area w-full font-mono text-sm" rows={8} value={out} /><CopyBtn text={out} absolute /></div>
      </div>
    </ToolWrap>
  );
}

/* ── Column Extractor ── */
export function ColumnExtractor() {
  const [text, setText] = useState("name,age,city\nAlice,30,NYC\nBob,25,LA");
  const [delim, setDelim] = useState(",");
  const [col, setCol] = useState(1);
  const realDelim = delim === "\\t" ? "\t" : delim;
  const out = text.split("\n").map(line => line.split(realDelim)[col - 1] ?? "").join("\n");
  return (
    <ToolWrap>
      <div className="flex flex-wrap gap-3 mb-3 items-end">
        <label className="text-sm"><span className="text-xs text-muted block mb-1">Delimiter</span><input className="input-field w-24 font-mono" value={delim} onChange={e => setDelim(e.target.value)} placeholder=", or \t" /></label>
        <label className="text-sm"><span className="text-xs text-muted block mb-1">Column #</span><input type="number" min={1} className="input-field w-24" value={col} onChange={e => setCol(Math.max(1, +e.target.value))} /></label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <textarea className="input-area w-full font-mono text-xs" rows={6} value={text} onChange={e => setText(e.target.value)} />
        <div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={6} value={out} /><CopyBtn text={out} absolute /></div>
      </div>
    </ToolWrap>
  );
}

/* ── Text Cleaner ── */
export function TextCleaner() {
  const [text, setText] = useState("  Hello   World  \n\n\n  extra   spaces \n");
  const [opts, setOpts] = useState({ trim: true, collapse: true, blank: true, tabs: false, lower: false });
  let out = text;
  if (opts.tabs) out = out.replace(/\t/g, " ");
  if (opts.collapse) out = out.replace(/[ ]{2,}/g, " ");
  if (opts.trim) out = out.split("\n").map(l => l.trim()).join("\n");
  if (opts.blank) out = out.replace(/\n{2,}/g, "\n").replace(/^\n+|\n+$/g, "");
  if (opts.lower) out = out.toLowerCase();
  const toggles: [keyof typeof opts, string][] = [["trim", "Trim lines"], ["collapse", "Collapse spaces"], ["blank", "Remove blank lines"], ["tabs", "Tabs → spaces"], ["lower", "Lowercase"]];
  return (
    <ToolWrap>
      <div className="flex flex-wrap gap-3 mb-3">
        {toggles.map(([k, l]) => (
          <label key={k} className="text-sm flex items-center gap-1"><input type="checkbox" checked={opts[k]} onChange={e => setOpts(o => ({ ...o, [k]: e.target.checked }))} /> {l}</label>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <textarea className="input-area w-full font-mono text-sm" rows={7} value={text} onChange={e => setText(e.target.value)} />
        <div className="relative"><textarea readOnly className="input-area w-full font-mono text-sm" rows={7} value={out} /><CopyBtn text={out} absolute /></div>
      </div>
    </ToolWrap>
  );
}
