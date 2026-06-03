"use client";
import { useState, useCallback } from "react";
import { TwoPane, CopyBtn, ToolWrap } from "../ui";

/* ── helpers ── */
const MORSE: Record<string, string> = {
  A:".-",B:"-...",C:"-.-.",D:"-..","E":".","F":"..-.","G":"--.","H":"....","I":"..","J":".---","K":"-.-","L":".-..","M":"--","N":"-.","O":"---","P":".--.","Q":"--.-","R":".-.","S":"...","T":"-","U":"..-","V":"...-","W":".--","X":"-..-","Y":"-.--","Z":"--..",
  "0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....","6":"-....","7":"--...","8":"---..","9":"----.",".":" .-.-.-",",":" --..--","?":" ..--..","!":" -.-.--","/":" -..-.","@":" .--.-.","&":" .-..."
};
const RMORSE = Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v.trim(),k]));

function toMorse(t: string) {
  return t.toUpperCase().split("").map(c=>c===" "?"/":(MORSE[c]??("?"))).join(" ");
}
function fromMorse(t: string) {
  return t.split(" / ").map(w=>w.trim().split(" ").map(c=>RMORSE[c]??"?").join("")).join(" ");
}

function readabilityScore(text: string) {
  const sents = (text.match(/[.!?]+/g)||[]).length || 1;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wc = words.length || 1;
  const syllables = words.reduce((n,w)=>n+Math.max(1,(w.match(/[aeiouy]/gi)||[]).length),0);
  const fk = 206.835 - 1.015*(wc/sents) - 84.6*(syllables/wc);
  const grade = 0.39*(wc/sents) + 11.8*(syllables/wc) - 15.59;
  return { fk: fk.toFixed(1), grade: grade.toFixed(1), words: wc, sentences: sents, syllables };
}

/* ── Case Converter ── */
export function CaseConverter() {
  const [input, setInput] = useState("");
  const camel = (s:string)=>s.replace(/[-_\s]+(.)/g,(_,c)=>c.toUpperCase()).replace(/^./,c=>c.toLowerCase());
  const pascal = (s:string)=>s.replace(/[-_\s]+(.)/g,(_,c)=>c.toUpperCase()).replace(/^./,c=>c.toUpperCase());
  const snake = (s:string)=>s.replace(/([A-Z])/g,"_$1").replace(/[-\s]+/g,"_").replace(/^_/,"").toLowerCase();
  const kebab = (s:string)=>snake(s).replace(/_/g,"-");
  const constant = (s:string)=>snake(s).toUpperCase();
  const dot = (s:string)=>snake(s).replace(/_/g,".");
  const title = (s:string)=>s.replace(/\b\w/g,c=>c.toUpperCase());
  const sentence = (s:string)=>s.charAt(0).toUpperCase()+s.slice(1).toLowerCase();
  const cases = [
    ["lowercase", input.toLowerCase()],
    ["UPPERCASE", input.toUpperCase()],
    ["Title Case", title(input)],
    ["Sentence case", sentence(input)],
    ["camelCase", camel(input)],
    ["PascalCase", pascal(input)],
    ["snake_case", snake(input)],
    ["kebab-case", kebab(input)],
    ["SCREAMING_SNAKE", constant(input)],
    ["dot.case", dot(input)],
    ["Reverse", input.split("").reverse().join("")],
  ];
  return (
    <ToolWrap>
      <textarea className="input-area h-24" placeholder="Enter text…" value={input} onChange={e=>setInput(e.target.value)} />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {cases.map(([label, val]) => (
          <div key={label} className="surface flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
            <span className="text-xs text-muted w-32 shrink-0">{label}</span>
            <span className="flex-1 font-mono text-xs truncate">{val}</span>
            <CopyBtn text={val} />
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Word/Char/Line Counter ── */
export function TextCounter() {
  const [text, setText] = useState("");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g,"").length;
  const lines = text ? text.split(/\n/).length : 0;
  const sentences = (text.match(/[.!?]+/g)||[]).length;
  const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).length : 0;
  const readTime = Math.ceil(words/200);
  const stats = [
    ["Words", words],["Characters", chars],["Chars (no space)", charsNoSpace],
    ["Lines", lines],["Sentences", sentences],["Paragraphs", paragraphs],
    ["Read time", `~${readTime} min`],
  ];
  return (
    <ToolWrap>
      <textarea className="input-area h-40" placeholder="Paste text to count…" value={text} onChange={e=>setText(e.target.value)} />
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(([l,v])=>(
          <div key={String(l)} className="surface rounded-xl border p-3 text-center">
            <div className="text-xl font-bold tabular-nums">{v}</div>
            <div className="text-xs text-muted">{l}</div>
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Text Diff ── */
export function TextDiff() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  function diff(s1: string, s2: string) {
    const l1 = s1.split("\n"), l2 = s2.split("\n");
    const result: { type: "same"|"add"|"del"; line: string }[] = [];
    const max = Math.max(l1.length, l2.length);
    for (let i = 0; i < max; i++) {
      const v1 = l1[i], v2 = l2[i];
      if (v1 === undefined) result.push({ type: "add", line: v2 });
      else if (v2 === undefined) result.push({ type: "del", line: v1 });
      else if (v1 === v2) result.push({ type: "same", line: v1 });
      else { result.push({ type: "del", line: v1 }); result.push({ type: "add", line: v2 }); }
    }
    return result;
  }
  const d = diff(a, b);
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2">
        <textarea className="input-area h-32" placeholder="Original text…" value={a} onChange={e=>setA(e.target.value)} />
        <textarea className="input-area h-32" placeholder="Modified text…" value={b} onChange={e=>setB(e.target.value)} />
      </div>
      <div className="mt-3 rounded-xl border bg-[var(--surface-2)] p-3 font-mono text-xs leading-relaxed max-h-64 overflow-auto">
        {d.map((row, i) => (
          <div key={i} className={`px-2 rounded ${row.type==="add"?"bg-green-500/15 text-green-700 dark:text-green-400":row.type==="del"?"bg-red-500/15 text-red-700 dark:text-red-400":"text-muted"}`}>
            {row.type==="add"?"+ ":row.type==="del"?"- ":"  "}{row.line}
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Line Tools ── */
export function LineTools() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"dedup"|"sort-az"|"sort-za"|"sort-len"|"reverse"|"shuffle"|"number"|"trim"|"remove-empty">("dedup");
  const process = (txt: string) => {
    let lines = txt.split("\n");
    switch(mode) {
      case "dedup": return [...new Set(lines)].join("\n");
      case "sort-az": return [...lines].sort((a,b)=>a.localeCompare(b)).join("\n");
      case "sort-za": return [...lines].sort((a,b)=>b.localeCompare(a)).join("\n");
      case "sort-len": return [...lines].sort((a,b)=>a.length-b.length).join("\n");
      case "reverse": return [...lines].reverse().join("\n");
      case "shuffle": return [...lines].sort(()=>Math.random()-0.5).join("\n");
      case "number": return lines.map((l,i)=>`${i+1}. ${l}`).join("\n");
      case "trim": return lines.map(l=>l.trim()).join("\n");
      case "remove-empty": return lines.filter(l=>l.trim()).join("\n");
    }
  };
  const output = process(input);
  const modes = [
    ["dedup","Remove Duplicates"],["sort-az","Sort A→Z"],["sort-za","Sort Z→A"],
    ["sort-len","Sort by Length"],["reverse","Reverse Lines"],["shuffle","Shuffle"],
    ["number","Number Lines"],["trim","Trim Whitespace"],["remove-empty","Remove Empty Lines"],
  ];
  return (
    <ToolWrap>
      <div className="flex flex-wrap gap-2 mb-3">
        {modes.map(([v,l])=>(
          <button key={v} onClick={()=>setMode(v as typeof mode)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${mode===v?"border-brand-500 bg-brand-500/10 text-brand-600":"surface hover:border-brand-400"}`}>{l}</button>
        ))}
      </div>
      <TwoPane left={<textarea className="input-area h-48" placeholder="Paste lines…" value={input} onChange={e=>setInput(e.target.value)} />} right={<div className="relative"><textarea className="input-area h-48 pr-10" readOnly value={output} /><CopyBtn text={output} absolute /></div>} />
    </ToolWrap>
  );
}

/* ── Find & Replace ── */
export function FindReplace() {
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [regex, setRegex] = useState(false);
  const [caseSensitive, setCase] = useState(true);
  const [count, setCount] = useState(0);
  const output = (() => {
    if (!find) return text;
    try {
      const flags = caseSensitive ? "g" : "gi";
      const pattern = regex ? new RegExp(find, flags) : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"), flags);
      let c = 0;
      const r = text.replace(pattern, m => { c++; return replace || ""; });
      setCount(c);
      return r;
    } catch { return text; }
  })();
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3 flex-wrap">
        <input className="input-field flex-1 min-w-40" placeholder="Find…" value={find} onChange={e=>setFind(e.target.value)} />
        <input className="input-field flex-1 min-w-40" placeholder="Replace with…" value={replace} onChange={e=>setReplace(e.target.value)} />
        <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="checkbox" checked={regex} onChange={e=>setRegex(e.target.checked)} /> Regex</label>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="checkbox" checked={caseSensitive} onChange={e=>setCase(e.target.checked)} /> Case sensitive</label>
      </div>
      <TwoPane
        left={<textarea className="input-area h-40" placeholder="Input text…" value={text} onChange={e=>setText(e.target.value)} />}
        right={<div className="relative"><textarea className="input-area h-40 pr-10" readOnly value={output} /><CopyBtn text={output} absolute /></div>}
      />
      {find && <p className="text-xs text-muted mt-2">{count} replacement{count!==1?"s":""} made</p>}
    </ToolWrap>
  );
}

/* ── Regex Tester ── */
export function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("");
  const matches: RegExpMatchArray[] = [];
  let error = "";
  let highlighted = text;
  try {
    if (pattern) {
      const re = new RegExp(pattern, flags.includes("g")?flags:flags+"g");
      let m: RegExpExecArray | null;
      const re2 = new RegExp(pattern, flags.includes("g")?flags:flags+"g");
      while ((m = re2.exec(text)) !== null) {
        matches.push(m);
        if (!flags.includes("g")) break;
      }
      highlighted = text.replace(new RegExp(pattern, flags.includes("g")?flags:flags+"g"), s=>`\x01${s}\x02`).replace(/\x01/g,'<mark class="bg-yellow-200 dark:bg-yellow-800 rounded">').replace(/\x02/g,"</mark>");
    }
  } catch(e) { error = (e as Error).message; }
  return (
    <ToolWrap>
      <div className="flex gap-2 mb-3">
        <span className="text-muted font-mono text-lg">/</span>
        <input className="input-field flex-1 font-mono" placeholder="pattern" value={pattern} onChange={e=>setPattern(e.target.value)} />
        <span className="text-muted font-mono text-lg">/</span>
        <input className="input-field w-16 font-mono" placeholder="flags" value={flags} onChange={e=>setFlags(e.target.value)} maxLength={6} />
      </div>
      {error && <p className="mb-2 text-xs text-red-500">⚠ {error}</p>}
      <textarea className="input-area h-32 mb-3" placeholder="Test string…" value={text} onChange={e=>setText(e.target.value)} />
      <div className="rounded-xl border bg-[var(--surface-2)] p-3 font-mono text-sm min-h-12 mb-2" dangerouslySetInnerHTML={{__html: highlighted || '<span class="text-muted">Highlighted matches appear here</span>'}} />
      <p className="text-sm text-muted">{matches.length} match{matches.length!==1?"es":""}{matches.length>0 && `: ${matches.map(m=>JSON.stringify(m[0])).join(", ")}`}</p>
    </ToolWrap>
  );
}

/* ── Text to Binary / Hex / Morse ── */
export function TextEncoder2() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"binary"|"hex"|"morse"|"octal"|"decimal">("binary");
  const encode = (t: string) => {
    switch(mode) {
      case "binary": return t.split("").map(c=>c.charCodeAt(0).toString(2).padStart(8,"0")).join(" ");
      case "hex": return t.split("").map(c=>c.charCodeAt(0).toString(16).padStart(2,"0")).join(" ");
      case "morse": return toMorse(t);
      case "octal": return t.split("").map(c=>c.charCodeAt(0).toString(8).padStart(3,"0")).join(" ");
      case "decimal": return t.split("").map(c=>c.charCodeAt(0)).join(" ");
    }
  };
  const decode = (t: string) => {
    try {
      switch(mode) {
        case "binary": return t.trim().split(/\s+/).map(b=>String.fromCharCode(parseInt(b,2))).join("");
        case "hex": return t.trim().split(/\s+/).map(h=>String.fromCharCode(parseInt(h,16))).join("");
        case "morse": return fromMorse(t);
        case "octal": return t.trim().split(/\s+/).map(o=>String.fromCharCode(parseInt(o,8))).join("");
        case "decimal": return t.trim().split(/\s+/).map(d=>String.fromCharCode(parseInt(d))).join("");
      }
    } catch { return "⚠ decode error"; }
  };
  const encoded = encode(input);
  const decoded = decode(input);
  return (
    <ToolWrap>
      <div className="flex gap-2 flex-wrap mb-3">
        {(["binary","hex","octal","decimal","morse"] as const).map(m=>(
          <button key={m} onClick={()=>setMode(m)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${mode===m?"border-brand-500 bg-brand-500/10 text-brand-600":"surface hover:border-brand-400"}`}>{m}</button>
        ))}
      </div>
      <textarea className="input-area h-24 mb-3" placeholder="Text to encode, or encoded value to decode…" value={input} onChange={e=>setInput(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        {[["Encoded →", encoded],["← Decoded", decoded]].map(([label, val])=>(
          <div key={label} className="relative">
            <p className="text-xs text-muted mb-1">{label}</p>
            <textarea className="input-area h-20 pr-10 font-mono text-xs" readOnly value={val} />
            <CopyBtn text={val} absolute />
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── ROT13 / Caesar ── */
export function CipherTool() {
  const [text, setText] = useState("");
  const [shift, setShift] = useState(13);
  const [mode, setMode] = useState<"rot13"|"caesar"|"atbash"|"vigenere">("rot13");
  const [key, setKey] = useState("");
  const caesar = (t: string, n: number) => t.replace(/[a-zA-Z]/g, c => {
    const base = c >= "a" ? 97 : 65;
    return String.fromCharCode(((c.charCodeAt(0)-base+n)%26+26)%26+base);
  });
  const atbash = (t: string) => t.replace(/[a-zA-Z]/g, c => {
    const base = c >= "a" ? 97 : 65;
    return String.fromCharCode(base + 25 - (c.charCodeAt(0)-base));
  });
  const vigenere = (t: string, k: string, enc=true) => {
    if (!k) return t;
    const kl = k.toLowerCase().replace(/[^a-z]/g,"");
    if (!kl) return t;
    let ki=0;
    return t.replace(/[a-zA-Z]/g, c => {
      const base = c >= "a" ? 97 : 65;
      const kn = kl[ki++%kl.length].charCodeAt(0)-97;
      const shift = enc ? kn : 26-kn;
      return String.fromCharCode(((c.charCodeAt(0)-base+shift)%26+26)%26+base);
    });
  };
  const output = mode==="rot13"?caesar(text,13):mode==="caesar"?caesar(text,shift):mode==="atbash"?atbash(text):vigenere(text,key);
  return (
    <ToolWrap>
      <div className="flex flex-wrap gap-2 mb-3">
        {(["rot13","caesar","atbash","vigenere"] as const).map(m=>(
          <button key={m} onClick={()=>setMode(m)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${mode===m?"border-brand-500 bg-brand-500/10 text-brand-600":"surface hover:border-brand-400"}`}>{m}</button>
        ))}
        {mode==="caesar"&&<input type="number" className="input-field w-20" min={1} max={25} value={shift} onChange={e=>setShift(+e.target.value)} />}
        {mode==="vigenere"&&<input className="input-field flex-1 min-w-32" placeholder="Key word…" value={key} onChange={e=>setKey(e.target.value)} />}
      </div>
      <TwoPane
        left={<textarea className="input-area h-36" placeholder="Input…" value={text} onChange={e=>setText(e.target.value)} />}
        right={<div className="relative"><textarea className="input-area h-36 pr-10" readOnly value={output} /><CopyBtn text={output} absolute /></div>}
      />
    </ToolWrap>
  );
}

/* ── Readability ── */
export function ReadabilityTool() {
  const [text, setText] = useState("");
  const r = readabilityScore(text);
  const gradeLabel = (g:number)=>g<=6?"Easy":g<=9?"Standard":g<=12?"Fairly Difficult":"Difficult";
  return (
    <ToolWrap>
      <textarea className="input-area h-40 mb-3" placeholder="Paste your text to analyse…" value={text} onChange={e=>setText(e.target.value)} />
      {text.trim() && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["Flesch Score", r.fk, "Higher = easier (0-100)"],["Grade Level", r.grade, gradeLabel(+r.grade)],["Words", r.words, "total words"],["Sentences", r.sentences, "total sentences"]].map(([l,v,s])=>(
            <div key={String(l)} className="surface rounded-xl border p-3 text-center">
              <div className="text-xl font-bold tabular-nums">{v}</div>
              <div className="text-xs font-medium">{l}</div>
              <div className="text-[10px] text-muted mt-0.5">{s}</div>
            </div>
          ))}
        </div>
      )}
    </ToolWrap>
  );
}

/* ── Palindrome & Anagram ── */
export function PalindromeAnagram() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const clean = (s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,"");
  const isPalin = clean(a)===clean(a).split("").reverse().join("");
  const isAnagram = a && b && clean(a).split("").sort().join("")===clean(b).split("").sort().join("");
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <input className="input-field w-full mb-2" placeholder="Check palindrome…" value={a} onChange={e=>setA(e.target.value)} />
          {a&&<p className={`text-sm font-semibold ${isPalin?"text-green-500":"text-red-500"}`}>{isPalin?"✓ Palindrome":"✗ Not a palindrome"}</p>}
        </div>
        <div>
          <div className="flex gap-2 mb-2">
            <input className="input-field flex-1" placeholder="Word 1…" value={a} onChange={e=>setA(e.target.value)} />
            <input className="input-field flex-1" placeholder="Word 2…" value={b} onChange={e=>setB(e.target.value)} />
          </div>
          {a&&b&&<p className={`text-sm font-semibold ${isAnagram?"text-green-500":"text-red-500"}`}>{isAnagram?"✓ Anagram":"✗ Not an anagram"}</p>}
        </div>
      </div>
    </ToolWrap>
  );
}

/* ── Text Repeater ── */
export function TextRepeater() {
  const [text, setText] = useState("");
  const [times, setTimes] = useState(3);
  const [sep, setSep] = useState("\n");
  const output = Array(Math.min(times,500)).fill(text).join(sep==="\\n"?"\n":sep==="\\t"?"\t":sep);
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3 flex-wrap">
        <input className="input-field flex-1 min-w-48" placeholder="Text to repeat…" value={text} onChange={e=>setText(e.target.value)} />
        <input type="number" className="input-field w-24" min={1} max={500} value={times} onChange={e=>setTimes(Math.max(1,Math.min(500,+e.target.value)))} />
        <input className="input-field w-28" placeholder='sep (\\n, \\t, , )' value={sep} onChange={e=>setSep(e.target.value)} />
      </div>
      <div className="relative">
        <textarea className="input-area h-32 pr-10 font-mono text-xs" readOnly value={output} />
        <CopyBtn text={output} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── Pig Latin ── */
export function PigLatin() {
  const [text, setText] = useState("");
  const convert = (t:string) => t.replace(/\b([aeiou]\w*)\b/gi, "$1ay").replace(/\b([^aeiou]*)([aeiou]\w*)\b/gi, (_,c,v)=>v+c+"ay");
  const output = convert(text);
  return (
    <ToolWrap>
      <TwoPane
        left={<textarea className="input-area h-32" placeholder="Enter text…" value={text} onChange={e=>setText(e.target.value)} />}
        right={<div className="relative"><textarea className="input-area h-32 pr-10" readOnly value={output} /><CopyBtn text={output} absolute /></div>}
      />
    </ToolWrap>
  );
}
