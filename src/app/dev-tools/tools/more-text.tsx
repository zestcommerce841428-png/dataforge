"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap, TwoPane } from "../ui";

/* ── Lorem Ipsum Generator ── */
const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident culpa qui officia deserunt mollit anim est laborum".split(" ");
export function LoremIpsum() {
  const [count, setCount] = useState(5);
  const [type, setType] = useState<"paragraphs"|"sentences"|"words">("paragraphs");
  const generate = () => {
    const sentence = () => {
      const wc = 8+Math.floor(Math.random()*12);
      const words = Array.from({length:wc},()=>LOREM_WORDS[Math.floor(Math.random()*LOREM_WORDS.length)]);
      words[0] = words[0].charAt(0).toUpperCase()+words[0].slice(1);
      return words.join(" ")+".";
    };
    const paragraph = () => Array.from({length:4+Math.floor(Math.random()*4)}, sentence).join(" ");
    switch(type) {
      case "words": return Array.from({length:count},()=>LOREM_WORDS[Math.floor(Math.random()*LOREM_WORDS.length)]).join(" ");
      case "sentences": return Array.from({length:count},sentence).join(" ");
      case "paragraphs": return Array.from({length:count},paragraph).join("\n\n");
    }
  };
  const [output, setOutput] = useState(() => generate());
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3 flex-wrap">
        <input type="number" className="input-field w-24" min={1} max={50} value={count} onChange={e=>setCount(+e.target.value)} />
        {(["words","sentences","paragraphs"] as const).map(t=>(
          <button key={t} onClick={()=>setType(t)} className={`rounded-lg border px-3 py-1.5 text-sm ${type===t?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{t}</button>
        ))}
        <button className="btn-primary" onClick={()=>setOutput(generate())}>Generate</button>
      </div>
      <div className="relative">
        <textarea className="input-area h-40 pr-10" readOnly value={output} />
        <CopyBtn text={output} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── Slug Generator ── */
export function SlugGenerator() {
  const [input, setInput] = useState("Hello World! This is a Test Post #1");
  const [sep, setSep] = useState<"-"|"_">("-");
  const toSlug = (s: string, d: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9\s]/g,"").trim().replace(/\s+/g,d === "-" ? "-" : "_");
  const slug = toSlug(input, sep);
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3" value={input} onChange={e=>setInput(e.target.value)} placeholder="Article title…" />
      <div className="flex gap-2 mb-3">
        {([["−","Hyphen (-)"],["_","Underscore (_)"]] as [string,string][]).map(([v,l])=>(
          <button key={v} onClick={()=>setSep(v==="-"||v==="−"?"-":"_")} className={`rounded-lg border px-3 py-1.5 text-sm ${(sep==="-"&&(v==="-"||v==="−"))||(sep==="_"&&v==="_")?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{l}</button>
        ))}
      </div>
      <div className="relative surface rounded-xl border p-3">
        <span className="font-mono text-sm break-all pr-10">{slug}</span>
        <CopyBtn text={slug} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── Word Frequency Counter ── */
export function WordFrequency() {
  const [text, setText] = useState("the quick brown fox jumps over the lazy dog the fox");
  const [stopWords, setStopWords] = useState(true);
  const STOP = new Set("a an the is are was were be been being have has had do does did will would could should may might shall can i me my myself we our you your he she it his her its they them their this that these those in on at to for of and or but with from by as not be".split(" "));
  const freq = text.trim().toLowerCase().replace(/[^a-z0-9\s]/g,"").split(/\s+/).filter(w=>w&&(!stopWords||!STOP.has(w))).reduce((acc,w)=>({...acc,[w]:(acc[w]||0)+1}),{} as Record<string,number>);
  const sorted = Object.entries(freq).sort(([,a],[,b])=>b-a).slice(0,30);
  const max = sorted[0]?.[1] || 1;
  return (
    <ToolWrap>
      <textarea className="input-area h-24 mb-2" value={text} onChange={e=>setText(e.target.value)} placeholder="Paste text…" />
      <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer"><input type="checkbox" checked={stopWords} onChange={e=>setStopWords(e.target.checked)} /> Exclude common stop words</label>
      <div className="max-h-64 overflow-auto space-y-1.5">
        {sorted.map(([word,count])=>(
          <div key={word} className="flex items-center gap-3">
            <span className="font-mono text-sm w-28 shrink-0">{word}</span>
            <div className="flex-1 h-2 rounded-full bg-[var(--surface-2)]">
              <div className="h-2 rounded-full bg-brand-500" style={{width:`${count/max*100}%`}} />
            </div>
            <span className="text-sm tabular-nums w-6 text-right text-muted">{count}</span>
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Hashtag Generator ── */
export function HashtagGenerator() {
  const [topic, setTopic] = useState("photography nature sunset");
  const [count, setCount] = useState(20);
  const generate = () => {
    const words = topic.toLowerCase().replace(/[^a-z0-9\s]/g,"").split(/\s+/).filter(Boolean);
    const base = words.map(w=>`#${w}`);
    const combos = words.length>1?words.flatMap((_,i)=>words.slice(i+1).map(w2=>`#${words[i]}${w2.charAt(0).toUpperCase()+w2.slice(1)}`)):[];
    const extras = words.flatMap(w=>[`#${w}photography`,`#best${w}`,`#${w}life`,`#${w}lover`,`#daily${w}`,`#${w}community`,`#${w}vibes`,`#my${w}`]);
    return [...new Set([...base,...combos,...extras])].slice(0,count).join(" ");
  };
  const [tags, setTags] = useState(()=>generate());
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3 flex-wrap">
        <input className="input-field flex-1 min-w-48" placeholder="Topic keywords…" value={topic} onChange={e=>setTopic(e.target.value)} />
        <input type="number" className="input-field w-20" min={5} max={50} value={count} onChange={e=>setCount(+e.target.value)} />
        <button className="btn-primary" onClick={()=>setTags(generate())}>Generate</button>
      </div>
      <div className="relative">
        <textarea className="input-area h-28 pr-10 text-sm" readOnly value={tags} />
        <CopyBtn text={tags} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── Markdown Table Generator ── */
export function MarkdownTableGen() {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [data, setData] = useState<string[][]>(()=>Array.from({length:4},(_,r)=>Array.from({length:3},(_,c)=>r===0?`Header ${c+1}`:`Cell ${r},${c+1}`)));
  const setCell = (r:number,c:number,v:string) => setData(d=>d.map((row,ri)=>ri===r?row.map((cell,ci)=>ci===c?v:cell):row));
  const setDims = (newCols:number,newRows:number) => {
    const totalRows = newRows+1;
    setData(d=>{
      const cur=d.slice(0,totalRows);
      while(cur.length<totalRows) cur.push(Array.from({length:newCols},(_,c)=>`Cell ${cur.length},${c+1}`));
      return cur.map(row=>{const r=row.slice(0,newCols);while(r.length<newCols)r.push("");return r;});
    });
    setCols(newCols); setRows(newRows);
  };
  const md = (() => {
    const allRows = data.slice(0,rows+1);
    const headers = allRows[0];
    const sep = headers.map(()=>"---");
    const bodyRows = allRows.slice(1);
    return [headers,sep,...bodyRows].map(r=>`| ${r.join(" | ")} |`).join("\n");
  })();
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3 flex-wrap items-center">
        <label className="text-sm flex items-center gap-2">Columns: <input type="number" className="input-field w-16" min={1} max={10} value={cols} onChange={e=>setDims(+e.target.value,rows)} /></label>
        <label className="text-sm flex items-center gap-2">Rows: <input type="number" className="input-field w-16" min={1} max={20} value={rows} onChange={e=>setDims(cols,+e.target.value)} /></label>
      </div>
      <div className="overflow-x-auto mb-3">
        <table className="text-xs border-collapse w-full">
          {data.slice(0,rows+1).map((row,ri)=>(
            <tr key={ri} className={ri===0?"bg-[var(--surface-2)]":""}>
              {row.slice(0,cols).map((cell,ci)=>(
                <td key={ci} className="border border-[var(--border)] p-0.5">
                  <input className="input-field text-xs rounded-none border-0 w-full min-w-20" value={cell} onChange={e=>setCell(ri,ci,e.target.value)} />
                </td>
              ))}
            </tr>
          ))}
        </table>
      </div>
      <div className="relative">
        <textarea className="input-area h-32 pr-10 font-mono text-xs" readOnly value={md} />
        <CopyBtn text={md} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── CSV to HTML Table ── */
export function CsvToHtmlTable() {
  const [csv, setCsv] = useState("Name,Age,City\nAlice,30,New York\nBob,25,London\nCharlie,35,Tokyo");
  const [hasHeader, setHeader] = useState(true);
  const [striped, setStriped] = useState(true);
  const [bordered, setBordered] = useState(true);
  const html = (() => {
    const rows = csv.split("\n").filter(Boolean).map(r=>r.split(",").map(c=>c.trim()));
    const headers = hasHeader ? rows[0] : null;
    const body = hasHeader ? rows.slice(1) : rows;
    const cls = ["border-collapse","width:100%",striped?"":"",bordered?"border:1px solid #ddd":""].filter(Boolean).join(";");
    const th = headers?`<thead><tr>${headers.map(h=>`<th style="border:1px solid #ddd;padding:8px;background:#f2f2f2">${h}</th>`).join("")}</tr></thead>`:"";
    const td = body.map((r,i)=>`<tr${striped&&i%2?"style=\"background:#f9f9f9\"":""}>` +r.map(c=>`<td style="border:1px solid #ddd;padding:8px">${c}</td>`).join("")+`</tr>`).join("\n");
    return `<table style="${cls}">\n${th}\n<tbody>\n${td}\n</tbody>\n</table>`;
  })();
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-2 flex-wrap">
        <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="checkbox" checked={hasHeader} onChange={e=>setHeader(e.target.checked)} /> First row is header</label>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="checkbox" checked={striped} onChange={e=>setStriped(e.target.checked)} /> Striped rows</label>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="checkbox" checked={bordered} onChange={e=>setBordered(e.target.checked)} /> Bordered</label>
      </div>
      <TwoPane
        left={<textarea className="input-area h-48 font-mono text-xs" value={csv} onChange={e=>setCsv(e.target.value)} placeholder="Name,Age,City&#10;Alice,30,NYC" />}
        right={<div className="relative"><textarea className="input-area h-48 pr-10 font-mono text-xs" readOnly value={html} /><CopyBtn text={html} absolute /></div>}
      />
    </ToolWrap>
  );
}

/* ── Remove HTML Tags ── */
export function RemoveHtmlTags() {
  const [input, setInput] = useState("<h1>Hello <b>World</b></h1><p>This is <a href='#'>a link</a>.</p>");
  const [keepLineBreaks, setKeep] = useState(true);
  const strip = (s:string)=>{
    let r=s.replace(/<br\s*\/?>/gi,keepLineBreaks?"\n":" ").replace(/<\/p>/gi,keepLineBreaks?"\n\n":" ").replace(/<[^>]+>/g,"");
    r=r.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g," ");
    return r.replace(/\n{3,}/g,"\n\n").trim();
  };
  const output = strip(input);
  return (
    <ToolWrap>
      <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer"><input type="checkbox" checked={keepLineBreaks} onChange={e=>setKeep(e.target.checked)} /> Preserve line breaks from p/br tags</label>
      <TwoPane
        left={<textarea className="input-area h-40" value={input} onChange={e=>setInput(e.target.value)} placeholder="HTML content…" />}
        right={<div className="relative"><textarea className="input-area h-40 pr-10" readOnly value={output} /><CopyBtn text={output} absolute /></div>}
      />
    </ToolWrap>
  );
}

/* ── Number to Words ── */
export function NumberToWords() {
  const [n, setN] = useState("1234567");
  const toWords = (num: number): string => {
    if (num === 0) return "zero";
    if (num < 0) return "negative " + toWords(-num);
    const ones = ["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
    const tens = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num/10)]+(num%10?" "+ones[num%10]:"");
    if (num < 1000) return ones[Math.floor(num/100)]+" hundred"+(num%100?" and "+toWords(num%100):"");
    if (num < 1e6) return toWords(Math.floor(num/1000))+" thousand"+(num%1000?" "+toWords(num%1000):"");
    if (num < 1e9) return toWords(Math.floor(num/1e6))+" million"+(num%1e6?" "+toWords(num%1e6):"");
    if (num < 1e12) return toWords(Math.floor(num/1e9))+" billion"+(num%1e9?" "+toWords(num%1e9):"");
    return toWords(Math.floor(num/1e12))+" trillion"+(num%1e12?" "+toWords(num%1e12):"");
  };
  const num = parseInt(n.replace(/,/g,""));
  const result = !isNaN(num) && isFinite(num) ? toWords(Math.abs(num)).replace(/\s+/g," ").trim() : "⚠ Invalid number";
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3 font-mono text-lg" value={n} onChange={e=>setN(e.target.value)} placeholder="Enter a number…" />
      <div className="relative surface rounded-xl border p-3">
        <p className="text-base capitalize pr-10">{result}</p>
        <CopyBtn text={result} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── Roman Numeral Converter ── */
export function RomanNumeralConverter() {
  const [arabic, setArabic] = useState("2024");
  const [roman, setRoman] = useState("");
  const toRoman = (n: number): string => {
    if (n<=0||n>3999) return "⚠ Out of range (1–3999)";
    const map: [number,string][] = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
    let r="";map.forEach(([v,s])=>{while(n>=v){r+=s;n-=v;}});return r;
  };
  const fromRoman = (s: string): number => {
    const m: Record<string,number> = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
    return s.toUpperCase().split("").reduce((acc,c,i,a)=>acc+(m[c]<(m[a[i+1]]||0)?-m[c]:m[c]),0);
  };
  const arabicResult = toRoman(parseInt(arabic)||0);
  const romanResult = fromRoman(roman)||"—";
  return (
    <ToolWrap>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted mb-2">Arabic → Roman</p>
          <input className="input-field w-full mb-2 font-mono" type="number" min={1} max={3999} value={arabic} onChange={e=>setArabic(e.target.value)} />
          <div className="relative surface rounded-xl border p-3">
            <span className="font-mono text-xl font-bold pr-10">{arabicResult}</span>
            <CopyBtn text={arabicResult} absolute />
          </div>
        </div>
        <div>
          <p className="text-xs text-muted mb-2">Roman → Arabic</p>
          <input className="input-field w-full mb-2 font-mono uppercase" placeholder="XIV" value={roman} onChange={e=>setRoman(e.target.value.toUpperCase())} />
          <div className="relative surface rounded-xl border p-3">
            <span className="font-mono text-xl font-bold pr-10">{romanResult}</span>
            <CopyBtn text={String(romanResult)} absolute />
          </div>
        </div>
      </div>
    </ToolWrap>
  );
}

/* ── GZIP Compress/Decompress ── */
export function GzipTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"compress"|"decompress">("compress");
  const [ratio, setRatio] = useState<number|null>(null);
  const process = async () => {
    try {
      if (mode==="compress") {
        const enc = new TextEncoder().encode(input);
        const cs = new CompressionStream("gzip");
        const writer = cs.writable.getWriter();
        writer.write(enc); writer.close();
        const buf = await new Response(cs.readable).arrayBuffer();
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        setOutput(b64);
        setRatio(Math.round((1-buf.byteLength/enc.byteLength)*100));
      } else {
        const bin = atob(input.trim());
        const buf = Uint8Array.from(bin, c=>c.charCodeAt(0));
        const ds = new DecompressionStream("gzip");
        const writer = ds.writable.getWriter();
        writer.write(buf); writer.close();
        const text = await new Response(ds.readable).text();
        setOutput(text); setRatio(null);
      }
    } catch(e) { setOutput("⚠ " + (e as Error).message); }
  };
  return (
    <ToolWrap>
      <div className="flex gap-2 mb-3">
        {(["compress","decompress"] as const).map(m=>(
          <button key={m} onClick={()=>{setMode(m);setOutput("");setRatio(null);}} className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${mode===m?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{m}</button>
        ))}
      </div>
      <TwoPane
        left={<textarea className="input-area h-36 font-mono text-xs" placeholder={mode==="compress"?"Text to compress…":"Base64-encoded gzip…"} value={input} onChange={e=>setInput(e.target.value)} />}
        right={<div className="relative"><textarea className="input-area h-36 pr-10 font-mono text-xs" readOnly value={output} /><CopyBtn text={output} absolute /></div>}
      />
      <button className="btn-primary mt-3" onClick={process}>{mode==="compress"?"Compress →":"← Decompress"}</button>
      {ratio!==null&&<p className="text-sm text-green-600 mt-2">Compression ratio: {ratio}% smaller</p>}
    </ToolWrap>
  );
}

/* ── Text to Speech ── */
export function TextToSpeech() {
  const [text, setText] = useState("Hello! This is a text to speech demonstration.");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [voice, setVoice] = useState("");
  const voices = typeof window!=="undefined" ? speechSynthesis.getVoices() : [];
  const speak = () => {
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate=rate; utt.pitch=pitch;
    const v = voices.find(v=>v.name===voice)||voices[0];
    if(v) utt.voice=v;
    speechSynthesis.speak(utt);
  };
  return (
    <ToolWrap>
      <textarea className="input-area h-24 mb-3" value={text} onChange={e=>setText(e.target.value)} placeholder="Text to speak…" />
      <div className="grid gap-3 sm:grid-cols-2 mb-3">
        <label className="text-sm"><span className="text-xs text-muted block mb-1">Voice</span>
          <select className="input-field w-full" value={voice} onChange={e=>setVoice(e.target.value)}>
            {voices.map(v=><option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
          </select>
        </label>
        <label className="text-sm"><span className="text-xs text-muted block mb-1">Rate: {rate}</span><input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={e=>setRate(+e.target.value)} className="w-full" /></label>
        <label className="text-sm"><span className="text-xs text-muted block mb-1">Pitch: {pitch}</span><input type="range" min={0.5} max={2} step={0.1} value={pitch} onChange={e=>setPitch(+e.target.value)} className="w-full" /></label>
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" onClick={speak}>▶ Speak</button>
        <button className="btn-secondary" onClick={()=>speechSynthesis.cancel()}>■ Stop</button>
        <button className="btn-secondary" onClick={()=>speechSynthesis.pause()}>⏸ Pause</button>
        <button className="btn-secondary" onClick={()=>speechSynthesis.resume()}>▶ Resume</button>
      </div>
    </ToolWrap>
  );
}

/* ── Whitespace Visualizer ── */
export function WhitespaceVisualizer() {
  const [text, setText] = useState("Hello   World\t!\nNew line here");
  const html = text.replace(/ /g,'<span class="bg-blue-200 dark:bg-blue-800 rounded-sm text-[9px] text-blue-600 dark:text-blue-300">·</span>').replace(/\t/g,'<span class="bg-orange-200 dark:bg-orange-800 rounded-sm px-1 text-[9px] text-orange-600 dark:text-orange-300">→</span>').replace(/\n/g,'<span class="bg-green-200 dark:bg-green-800 rounded-sm text-[9px] text-green-600 dark:text-green-300">↵</span>\n');
  return (
    <ToolWrap>
      <textarea className="input-area h-24 mb-3 font-mono" value={text} onChange={e=>setText(e.target.value)} />
      <div className="surface rounded-xl border p-3 font-mono text-sm whitespace-pre-wrap min-h-16" dangerouslySetInnerHTML={{__html:html}} />
      <div className="flex gap-4 mt-2 text-xs text-muted">
        <span className="bg-blue-200 dark:bg-blue-800 rounded px-1">·</span> = space
        <span className="bg-orange-200 dark:bg-orange-800 rounded px-1">→</span> = tab
        <span className="bg-green-200 dark:bg-green-800 rounded px-1">↵</span> = newline
      </div>
    </ToolWrap>
  );
}

/* ── Duplicate Word Finder ── */
export function DuplicateWordFinder() {
  const [text, setText] = useState("The cat sat on the mat and the cat sat again on the mat.");
  const [caseSensitive, setCase] = useState(false);
  const words = text.replace(/[^a-zA-Z\s]/g,"").split(/\s+/).filter(Boolean);
  const normalized = caseSensitive ? words : words.map(w=>w.toLowerCase());
  const freq = normalized.reduce((acc,w)=>({...acc,[w]:(acc[w]||0)+1}),{} as Record<string,number>);
  const dupes = Object.entries(freq).filter(([,c])=>c>1).sort(([,a],[,b])=>b-a);
  return (
    <ToolWrap>
      <textarea className="input-area h-24 mb-3" value={text} onChange={e=>setText(e.target.value)} placeholder="Paste text to find duplicate words…" />
      <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer"><input type="checkbox" checked={caseSensitive} onChange={e=>setCase(e.target.checked)} /> Case sensitive</label>
      {dupes.length>0 ? (
        <div>
          <p className="text-xs text-muted mb-2">{dupes.length} duplicate word{dupes.length!==1?"s":""} found:</p>
          <div className="flex flex-wrap gap-2">
            {dupes.map(([w,c])=>(
              <span key={w} className="rounded-full border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 px-3 py-1 text-sm font-medium">
                {w} <span className="text-yellow-600 dark:text-yellow-400">×{c}</span>
              </span>
            ))}
          </div>
        </div>
      ) : text&&<p className="text-sm text-green-600">✓ No duplicate words found</p>}
    </ToolWrap>
  );
}
