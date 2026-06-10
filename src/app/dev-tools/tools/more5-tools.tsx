"use client";
import { useEffect, useRef, useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── SERP Preview ── */
export function SerpPreview() {
  const [title, setTitle] = useState("DataForge — 400+ Free Online Tools"), [url, setUrl] = useState("https://dataforge.app/dev-tools"), [desc, setDesc] = useState("Free browser-based tools: converters, image & PDF tools, generators and more. Private and fast.");
  return (
    <ToolWrap>
      <div className="grid gap-2 sm:grid-cols-2 mb-3">
        <label className="text-sm">Title ({title.length}/60)<input className="input-field mt-1 w-full" value={title} onChange={e=>setTitle(e.target.value)} /></label>
        <label className="text-sm">URL<input className="input-field mt-1 w-full" value={url} onChange={e=>setUrl(e.target.value)} /></label>
      </div>
      <label className="text-sm block mb-3">Description ({desc.length}/160)<textarea className="input-area mt-1 w-full" rows={2} value={desc} onChange={e=>setDesc(e.target.value)} /></label>
      <div className="surface rounded-xl border p-4 max-w-xl">
        <div className="text-xs text-[#202124] dark:text-gray-300">{url.replace(/^https?:\/\//,"").split("/").join(" › ")}</div>
        <div className="text-xl text-[#1a0dab] dark:text-blue-400 truncate">{title.slice(0,60)}</div>
        <div className="text-sm text-[#4d5156] dark:text-gray-400">{desc.slice(0,160)}{desc.length>160?"…":""}</div>
      </div>
      {(title.length>60||desc.length>160)&&<p className="mt-2 text-xs text-amber-500">⚠ Title or description exceeds Google's typical display length.</p>}
    </ToolWrap>
  );
}

/* ── Schema.org JSON-LD Generator ── */
export function SchemaGenerator() {
  const [type, setType] = useState("Article"), [f, setF] = useState({ name: "My Title", author: "Naushad Alam", url: "https://dataforge.app", desc: "Description here" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const obj: Record<string, unknown> = { "@context": "https://schema.org", "@type": type, name: f.name, description: f.desc, url: f.url };
  if (type === "Article") obj.author = { "@type": "Person", name: f.author };
  if (type === "Product") obj.offers = { "@type": "Offer", price: "0", priceCurrency: "USD" };
  if (type === "Organization") obj.logo = f.url + "/logo.png";
  const out = `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;
  return (
    <ToolWrap>
      <div className="mb-3 flex flex-wrap gap-2">{["Article","Product","Organization","WebSite","FAQPage"].map(t=><button key={t} onClick={()=>setType(t)} className={`rounded-lg border px-3 py-1 text-sm ${type===t?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{t}</button>)}</div>
      <div className="grid gap-2 sm:grid-cols-2 mb-3">{(Object.keys(f) as (keyof typeof f)[]).map(k=><label key={k} className="text-sm capitalize">{k}<input className="input-field mt-1 w-full" value={f[k]} onChange={set(k)} /></label>)}</div>
      <div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={8} value={out} /><CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── Keyword Density ── */
export function KeywordDensity() {
  const [text, setText] = useState(""), STOP = new Set("the a an and or but of to in on for with is are was were be been it this that as at by".split(" "));
  const words = text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
  const total = words.length;
  const counts: Record<string, number> = {};
  for (const w of words) if (!STOP.has(w) && w.length > 2) counts[w] = (counts[w] || 0) + 1;
  const top = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,15);
  return (
    <ToolWrap>
      <textarea className="input-area w-full mb-3" rows={5} value={text} onChange={e=>setText(e.target.value)} placeholder="Paste your content…" />
      <p className="mb-2 text-sm text-muted">{total} words</p>
      <div className="space-y-1">{top.map(([w,c])=><div key={w} className="surface flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm"><span className="flex-1">{w}</span><span className="text-muted">{c}×</span><span className="w-16 text-right text-brand-600">{(c/total*100).toFixed(1)}%</span></div>)}</div>
    </ToolWrap>
  );
}

/* ── Hreflang Generator ── */
export function HreflangGenerator() {
  const [base, setBase] = useState("https://example.com/page"), [langs, setLangs] = useState("en, es, fr, de, hi");
  const codes = langs.split(",").map(s=>s.trim()).filter(Boolean);
  const out = codes.map(c=>`<link rel="alternate" hreflang="${c}" href="${base}?lang=${c}" />`).join("\n") + `\n<link rel="alternate" hreflang="x-default" href="${base}" />`;
  return (
    <ToolWrap>
      <label className="text-sm block mb-2">Base URL<input className="input-field mt-1 w-full" value={base} onChange={e=>setBase(e.target.value)} /></label>
      <label className="text-sm block mb-3">Language codes<input className="input-field mt-1 w-full" value={langs} onChange={e=>setLangs(e.target.value)} /></label>
      <div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={6} value={out} /><CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── Text Summarizer (extractive) ── */
export function TextSummarizer() {
  const [text, setText] = useState(""), [n, setN] = useState(3);
  const summarize = () => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [];
    if (sentences.length <= n) return text;
    const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
    const freq: Record<string,number> = {};
    for (const w of words) if (w.length>3) freq[w]=(freq[w]||0)+1;
    const scored = sentences.map((s,i)=>({ s, i, score: (s.toLowerCase().match(/[a-z']+/g)??[]).reduce((a,w)=>a+(freq[w]||0),0)/Math.max(1,(s.match(/\s/g)??[]).length) }));
    return [...scored].sort((a,b)=>b.score-a.score).slice(0,n).sort((a,b)=>a.i-b.i).map(x=>x.s.trim()).join(" ");
  };
  const out = text.trim() ? summarize() : "";
  return (
    <ToolWrap>
      <textarea className="input-area w-full mb-2" rows={6} value={text} onChange={e=>setText(e.target.value)} placeholder="Paste a long article…" />
      <label className="text-sm mb-3 block">Sentences: {n}<input type="range" min={1} max={8} value={n} onChange={e=>setN(+e.target.value)} className="w-full" /></label>
      <div className="relative surface rounded-xl border p-3 text-sm">{out||"Summary appears here…"}{out&&<CopyBtn text={out} absolute />}</div>
    </ToolWrap>
  );
}

/* ── Vowel / Pangram Counter ── */
export function VowelPangramCounter() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog");
  const lower = text.toLowerCase();
  const vowels = (lower.match(/[aeiou]/g)??[]).length;
  const consonants = (lower.match(/[bcdfghjklmnpqrstvwxyz]/g)??[]).length;
  const letters = new Set(lower.match(/[a-z]/g)??[]);
  const isPangram = letters.size === 26;
  return (
    <ToolWrap>
      <textarea className="input-area w-full mb-3" rows={3} value={text} onChange={e=>setText(e.target.value)} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Vowels",vowels],["Consonants",consonants],["Unique letters",`${letters.size}/26`],["Pangram?",isPangram?"✓ Yes":"✗ No"]].map(([l,v])=><div key={String(l)} className="surface rounded-xl border p-3 text-center"><div className="text-xl font-bold text-brand-600">{v}</div><div className="text-xs text-muted">{l}</div></div>)}
      </div>
    </ToolWrap>
  );
}

/* ── Leetspeak Converter ── */
export function LeetspeakConverter() {
  const [text, setText] = useState("Hello World");
  const map: Record<string,string> = {a:"4",e:"3",i:"1",o:"0",s:"5",t:"7",l:"1",g:"9",b:"8"};
  const out = [...text].map(c=>map[c.toLowerCase()]??c).join("");
  return <ToolWrap><textarea className="input-area w-full mb-3" rows={3} value={text} onChange={e=>setText(e.target.value)} /><div className="relative surface rounded-xl border p-3 font-mono text-lg">{out}<CopyBtn text={out} absolute /></div></ToolWrap>;
}

/* ── Braille Translator ── */
export function BrailleTranslator() {
  const [text, setText] = useState("hello");
  const B: Record<string,string> = {a:"⠁",b:"⠃",c:"⠉",d:"⠙",e:"⠑",f:"⠋",g:"⠛",h:"⠓",i:"⠊",j:"⠚",k:"⠅",l:"⠇",m:"⠍",n:"⠝",o:"⠕",p:"⠏",q:"⠟",r:"⠗",s:"⠎",t:"⠞",u:"⠥",v:"⠧",w:"⠺",x:"⠭",y:"⠽",z:"⠵"," ":" ","1":"⠼⠁","2":"⠼⠃","3":"⠼⠉"};
  const out = [...text.toLowerCase()].map(c=>B[c]??c).join("");
  return <ToolWrap><textarea className="input-area w-full mb-3" rows={3} value={text} onChange={e=>setText(e.target.value)} /><div className="relative surface rounded-xl border p-4 text-2xl">{out}<CopyBtn text={out} absolute /></div></ToolWrap>;
}

/* ── Percentage Change ── */
export function PercentageChange() {
  const [from, setFrom] = useState(100), [to, setTo] = useState(125);
  const change = from ? ((to-from)/Math.abs(from))*100 : 0;
  return <ToolWrap><div className="mb-4 grid gap-3 sm:grid-cols-2"><label className="text-sm">From<input type="number" className="input-field mt-1 w-full" value={from} onChange={e=>setFrom(+e.target.value)} /></label><label className="text-sm">To<input type="number" className="input-field mt-1 w-full" value={to} onChange={e=>setTo(+e.target.value)} /></label></div><div className="surface rounded-xl border p-5 text-center"><div className={`text-3xl font-black ${change>=0?"text-green-600":"text-red-500"}`}>{change>=0?"+":""}{change.toFixed(2)}%</div><div className="text-sm text-muted mt-1">{change>=0?"increase":"decrease"} · difference {(to-from).toLocaleString()}</div></div></ToolWrap>;
}

/* ── Modulo Calculator ── */
export function ModuloCalculator() {
  const [a, setA] = useState(17), [b, setB] = useState(5);
  const mod = b ? ((a%b)+b)%b : NaN;
  return <ToolWrap><div className="mb-4 flex items-center justify-center gap-2"><input type="number" className="input-field w-24" value={a} onChange={e=>setA(+e.target.value)} /><span>mod</span><input type="number" className="input-field w-24" value={b} onChange={e=>setB(+e.target.value)} /></div><div className="surface rounded-xl border p-5 text-center"><div className="text-3xl font-black text-brand-600">{Number.isFinite(mod)?mod:"—"}</div><div className="text-sm text-muted mt-1">{a} ÷ {b} = {b?Math.floor(a/b):"∞"} remainder {Number.isFinite(mod)?mod:"—"}</div></div></ToolWrap>;
}

/* ── Prime Checker ── */
export function PrimeChecker() {
  const [n, setN] = useState(97);
  const isPrime = (x: number) => { if (x<2) return false; for (let i=2;i*i<=x;i++) if (x%i===0) return false; return true; };
  const prime = isPrime(n);
  let next = n+1; while (!isPrime(next)) next++;
  let prev = n-1; while (prev>1 && !isPrime(prev)) prev--;
  return <ToolWrap><input type="number" className="input-field w-full mb-4 text-center text-lg" value={n} onChange={e=>setN(+e.target.value)} /><div className={`rounded-xl border p-5 text-center ${prime?"bg-green-500/10 border-green-400":"surface"}`}><div className="text-2xl font-black">{prime?"✓ Prime":"✗ Not prime"}</div><div className="text-sm text-muted mt-2">Previous prime: {prev>1?prev:"—"} · Next prime: {next}</div></div></ToolWrap>;
}

/* ── Factorial ── */
export function FactorialCalc() {
  const [n, setN] = useState(20);
  let f = 1n; for (let i=2n;i<=BigInt(Math.min(n,2000));i++) f*=i;
  return <ToolWrap><label className="text-sm block mb-3">n (0–2000)<input type="number" min={0} max={2000} className="input-field mt-1 w-full" value={n} onChange={e=>setN(Math.min(2000,+e.target.value))} /></label><div className="relative surface rounded-xl border p-4"><p className="text-xs text-muted mb-1">{n}! =</p><p className="font-mono text-sm break-all">{f.toString()}</p><CopyBtn text={f.toString()} absolute /></div></ToolWrap>;
}

/* ── Binary Calculator ── */
export function BinaryCalculator() {
  const [a, setA] = useState("1010"), [b, setB] = useState("0110"), [op, setOp] = useState("+");
  const na = parseInt(a,2)||0, nb = parseInt(b,2)||0;
  const res = op==="+"?na+nb:op==="-"?na-nb:op==="*"?na*nb:op==="AND"?na&nb:op==="OR"?na|nb:na^nb;
  return <ToolWrap><div className="mb-3 flex flex-wrap items-center gap-2"><input className="input-field w-28 font-mono" value={a} onChange={e=>setA(e.target.value)} /><select className="input-field" value={op} onChange={e=>setOp(e.target.value)}>{["+","-","*","AND","OR","XOR"].map(o=><option key={o}>{o}</option>)}</select><input className="input-field w-28 font-mono" value={b} onChange={e=>setB(e.target.value)} /></div><div className="surface rounded-xl border p-4 text-center"><div className="font-mono text-2xl font-bold text-brand-600">{(res>>>0).toString(2)}</div><div className="text-sm text-muted mt-1">= {res} (decimal) · 0x{(res>>>0).toString(16)}</div></div></ToolWrap>;
}

/* ── CSS clamp() generator ── */
export function CssClampGenerator() {
  const [minPx, setMinPx] = useState(16), [maxPx, setMaxPx] = useState(32), [minVw, setMinVw] = useState(320), [maxVw, setMaxVw] = useState(1280);
  const slope = (maxPx-minPx)/(maxVw-minVw);
  const yInt = minPx - slope*minVw;
  const out = `clamp(${minPx/16}rem, ${(yInt/16).toFixed(4)}rem + ${(slope*100).toFixed(4)}vw, ${maxPx/16}rem)`;
  return <ToolWrap><div className="mb-3 grid grid-cols-2 gap-3"><label className="text-sm">Min size (px)<input type="number" className="input-field mt-1 w-full" value={minPx} onChange={e=>setMinPx(+e.target.value)} /></label><label className="text-sm">Max size (px)<input type="number" className="input-field mt-1 w-full" value={maxPx} onChange={e=>setMaxPx(+e.target.value)} /></label><label className="text-sm">Min viewport<input type="number" className="input-field mt-1 w-full" value={minVw} onChange={e=>setMinVw(+e.target.value)} /></label><label className="text-sm">Max viewport<input type="number" className="input-field mt-1 w-full" value={maxVw} onChange={e=>setMaxVw(+e.target.value)} /></label></div><div className="relative surface rounded-xl border p-3 font-mono text-sm break-all">font-size: {out};<CopyBtn text={`font-size: ${out};`} absolute /></div></ToolWrap>;
}

/* ── Golden Ratio ── */
export function GoldenRatioCalc() {
  const [val, setVal] = useState(100), [mode, setMode] = useState<"long"|"short">("long");
  const phi = 1.618033988;
  const a = mode==="long" ? val : val*phi;
  const b = mode==="long" ? val/phi : val;
  return <ToolWrap><div className="mb-3 flex gap-2">{(["long","short"] as const).map(m=><button key={m} onClick={()=>setMode(m)} className={`rounded-lg border px-3 py-1.5 text-sm ${mode===m?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>I know the {m==="long"?"longer":"shorter"} side</button>)}</div><input type="number" className="input-field w-full mb-4" value={val} onChange={e=>setVal(+e.target.value)} /><div className="grid grid-cols-3 gap-3 text-center"><div className="surface rounded-xl border p-3"><div className="text-lg font-bold text-brand-600">{a.toFixed(2)}</div><div className="text-xs text-muted">Longer</div></div><div className="surface rounded-xl border p-3"><div className="text-lg font-bold">{b.toFixed(2)}</div><div className="text-xs text-muted">Shorter</div></div><div className="surface rounded-xl border p-3"><div className="text-lg font-bold">{(a+b).toFixed(2)}</div><div className="text-xs text-muted">Whole</div></div></div></ToolWrap>;
}

/* ── Color Mixer ── */
function hex2rgb(h:string){const n=parseInt(h.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255];}
const rgb2hex=(r:number,g:number,b:number)=>"#"+[r,g,b].map(x=>Math.round(x).toString(16).padStart(2,"0")).join("");
export function ColorMixer() {
  const [c1, setC1] = useState("#ff0000"), [c2, setC2] = useState("#0000ff"), [ratio, setRatio] = useState(50);
  const [r1,g1,b1]=hex2rgb(c1),[r2,g2,b2]=hex2rgb(c2),t=ratio/100;
  const mix = rgb2hex(r1+(r2-r1)*t,g1+(g2-g1)*t,b1+(b2-b1)*t);
  return <ToolWrap><div className="mb-3 flex items-center justify-center gap-3"><input type="color" value={c1} onChange={e=>setC1(e.target.value)} className="h-10 w-14" /><input type="range" min={0} max={100} value={ratio} onChange={e=>setRatio(+e.target.value)} /><input type="color" value={c2} onChange={e=>setC2(e.target.value)} className="h-10 w-14" /></div><div className="rounded-xl border border-[var(--border)] p-10 text-center" style={{background:mix}}><span className="rounded bg-black/40 px-3 py-1 font-mono text-white">{mix}</span></div></ToolWrap>;
}

/* ── Color Blindness Simulator ── */
export function ColorBlindSim() {
  const [c, setC] = useState("#1f59e0");
  const [r,g,b]=hex2rgb(c);
  const sims: [string,string][] = [
    ["Normal", c],
    ["Protanopia", rgb2hex(0.567*r+0.433*g,0.558*r+0.442*g,0.242*g+0.758*b)],
    ["Deuteranopia", rgb2hex(0.625*r+0.375*g,0.7*r+0.3*g,0.3*g+0.7*b)],
    ["Tritanopia", rgb2hex(0.95*r+0.05*g,0.433*g+0.567*b,0.475*g+0.525*b)],
  ];
  return <ToolWrap><div className="mb-3 flex items-center gap-2"><input type="color" value={c} onChange={e=>setC(e.target.value)} className="h-10 w-14" /><input className="input-field w-32 font-mono" value={c} onChange={e=>setC(e.target.value)} /></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{sims.map(([n,col])=><div key={n} className="text-center"><div className="h-16 rounded-lg border border-[var(--border)]" style={{background:col}} /><div className="mt-1 text-xs text-muted">{n}</div></div>)}</div></ToolWrap>;
}

/* ── Random Date ── */
export function RandomDateGenerator() {
  const [start, setStart] = useState("2000-01-01"), [end, setEnd] = useState("2026-12-31"), [out, setOut] = useState("");
  const gen = () => { const s=new Date(start).getTime(),e=new Date(end).getTime(); const d=new Date(s+Math.random()*(e-s)); setOut(d.toDateString()); };
  return <ToolWrap><div className="mb-3 flex gap-2"><input type="date" className="input-field flex-1" value={start} onChange={e=>setStart(e.target.value)} /><input type="date" className="input-field flex-1" value={end} onChange={e=>setEnd(e.target.value)} /></div><button onClick={gen} className="w-full rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">Random date</button>{out&&<div className="relative surface mt-3 rounded-xl border p-4 text-center text-xl font-bold text-brand-600">{out}<CopyBtn text={out} absolute /></div>}</ToolWrap>;
}

/* ── Random GPS ── */
export function RandomGpsGenerator() {
  const [out, setOut] = useState<{lat:string;lng:string}|null>(null);
  const gen = () => setOut({ lat:(Math.random()*180-90).toFixed(6), lng:(Math.random()*360-180).toFixed(6) });
  return <ToolWrap><button onClick={gen} className="w-full rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white mb-3">Generate coordinates</button>{out&&<div className="surface rounded-xl border p-4 text-center"><div className="font-mono text-lg">{out.lat}, {out.lng}</div><a href={`https://www.google.com/maps?q=${out.lat},${out.lng}`} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline">View on map →</a></div>}</ToolWrap>;
}

/* ── Random Team Generator ── */
export function RandomTeamGenerator() {
  const [names, setNames] = useState("Alice\nBob\nCarol\nDave\nEve\nFrank"), [teams, setTeams] = useState(2), [out, setOut] = useState<string[][]>([]);
  const gen = () => { const pool=names.split("\n").map(s=>s.trim()).filter(Boolean).sort(()=>Math.random()-0.5); const res:string[][]=Array.from({length:teams},()=>[]); pool.forEach((p,i)=>res[i%teams].push(p)); setOut(res); };
  return <ToolWrap><textarea className="input-area w-full mb-2" rows={5} value={names} onChange={e=>setNames(e.target.value)} placeholder="One name per line" /><div className="mb-3 flex items-center gap-2"><label className="text-sm">Teams<input type="number" min={2} max={10} className="input-field mx-1 w-16" value={teams} onChange={e=>setTeams(+e.target.value)} /></label><button onClick={gen} className="rounded-lg bg-brand-600 px-4 py-1.5 font-semibold text-white">Shuffle into teams</button></div><div className="grid gap-3 sm:grid-cols-2">{out.map((t,i)=><div key={i} className="surface rounded-xl border p-3"><p className="mb-1 text-xs font-bold text-brand-600">Team {i+1}</p>{t.map(n=><div key={n} className="text-sm">{n}</div>)}</div>)}</div></ToolWrap>;
}

/* ── Initials Avatar ── */
export function InitialsAvatar() {
  const [name, setName] = useState("Naushad Alam"), [bg, setBg] = useState("#1f59e0");
  const ref = useRef<HTMLCanvasElement|null>(null);
  const initials = name.trim().split(/\s+/).slice(0,2).map(w=>w[0]?.toUpperCase()??"").join("");
  useEffect(()=>{ const cv=ref.current; if(!cv)return; const ctx=cv.getContext("2d")!; ctx.fillStyle=bg; ctx.fillRect(0,0,256,256); ctx.fillStyle="#fff"; ctx.font="bold 110px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(initials,128,138); },[initials,bg]);
  const dl = () => { const a=document.createElement("a"); a.href=ref.current!.toDataURL("image/png"); a.download="avatar.png"; a.click(); };
  return <ToolWrap><div className="mb-3 flex items-center gap-2"><input className="input-field flex-1" value={name} onChange={e=>setName(e.target.value)} /><input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="h-10 w-12" /></div><div className="flex flex-col items-center gap-3"><canvas ref={ref} width={256} height={256} className="h-40 w-40 rounded-full border border-[var(--border)]" /><button onClick={dl} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">⬇ Download PNG</button></div></ToolWrap>;
}

/* ── Signature Pad ── */
export function SignaturePad() {
  const ref = useRef<HTMLCanvasElement|null>(null), draw = useRef(false);
  const [color, setColor] = useState("#101418");
  const pos = (e:React.PointerEvent) => { const r=ref.current!.getBoundingClientRect(); return {x:(e.clientX-r.left)*(ref.current!.width/r.width),y:(e.clientY-r.top)*(ref.current!.height/r.height)}; };
  const start = (e:React.PointerEvent) => { draw.current=true; const ctx=ref.current!.getContext("2d")!; const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); };
  const move = (e:React.PointerEvent) => { if(!draw.current)return; const ctx=ref.current!.getContext("2d")!; const p=pos(e); ctx.strokeStyle=color; ctx.lineWidth=3; ctx.lineCap="round"; ctx.lineTo(p.x,p.y); ctx.stroke(); };
  const clear = () => { const ctx=ref.current!.getContext("2d")!; ctx.clearRect(0,0,ref.current!.width,ref.current!.height); };
  const dl = () => { const a=document.createElement("a"); a.href=ref.current!.toDataURL("image/png"); a.download="signature.png"; a.click(); };
  return <ToolWrap><div className="mb-2 flex items-center gap-2"><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-9 w-12" /><button onClick={clear} className="rounded-lg border surface px-3 py-1.5 text-sm">Clear</button><button onClick={dl} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white">⬇ Download</button></div><canvas ref={ref} width={600} height={200} onPointerDown={start} onPointerMove={move} onPointerUp={()=>draw.current=false} onPointerLeave={()=>draw.current=false} className="w-full touch-none rounded-xl border-2 border-dashed border-[var(--border)] bg-white" style={{touchAction:"none"}} /><p className="mt-1 text-xs text-muted">Draw your signature with mouse or finger.</p></ToolWrap>;
}

/* ── Dockerfile Generator ── */
export function DockerfileGenerator() {
  const [stack, setStack] = useState("node"), [port, setPort] = useState(3000);
  const files: Record<string,string> = {
    node: `FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nEXPOSE ${port}\nCMD ["node", "server.js"]`,
    python: `FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nEXPOSE ${port}\nCMD ["python", "app.py"]`,
    nextjs: `FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nEXPOSE ${port}\nCMD ["npm", "start"]`,
    go: `FROM golang:1.22-alpine AS build\nWORKDIR /app\nCOPY . .\nRUN go build -o server .\nFROM alpine\nCOPY --from=build /app/server /server\nEXPOSE ${port}\nCMD ["/server"]`,
  };
  const out = files[stack];
  return <ToolWrap><div className="mb-3 flex flex-wrap gap-2 items-center">{Object.keys(files).map(s=><button key={s} onClick={()=>setStack(s)} className={`rounded-lg border px-3 py-1.5 text-sm ${stack===s?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{s}</button>)}<label className="text-sm ml-auto">Port<input type="number" className="input-field mx-1 w-20" value={port} onChange={e=>setPort(+e.target.value)} /></label></div><div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={9} value={out} /><CopyBtn text={out} absolute /></div></ToolWrap>;
}

/* ── Redirect Generator (.htaccess / Nginx) ── */
export function RedirectGenerator() {
  const [from, setFrom] = useState("/old-page"), [to, setTo] = useState("/new-page"), [type, setType] = useState("301"), [server, setServer] = useState<"apache"|"nginx">("apache");
  const out = server==="apache" ? `Redirect ${type} ${from} ${to}` : `location = ${from} {\n  return ${type} ${to};\n}`;
  return <ToolWrap><div className="mb-3 grid gap-2 sm:grid-cols-2"><label className="text-sm">From path<input className="input-field mt-1 w-full" value={from} onChange={e=>setFrom(e.target.value)} /></label><label className="text-sm">To URL/path<input className="input-field mt-1 w-full" value={to} onChange={e=>setTo(e.target.value)} /></label></div><div className="mb-3 flex gap-2"><select className="input-field" value={type} onChange={e=>setType(e.target.value)}><option value="301">301 Permanent</option><option value="302">302 Temporary</option></select>{(["apache","nginx"] as const).map(s=><button key={s} onClick={()=>setServer(s)} className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${server===s?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{s}</button>)}</div><div className="relative surface rounded-xl border p-3 font-mono text-xs whitespace-pre">{out}<CopyBtn text={out} absolute /></div></ToolWrap>;
}

/* ── SQL IN() Builder ── */
export function SqlInBuilder() {
  const [text, setText] = useState("alice@x.com\nbob@y.com\ncarol@z.com"), [quote, setQuote] = useState(true), [col, setCol] = useState("email");
  const items = text.split(/[\n,]/).map(s=>s.trim()).filter(Boolean);
  const vals = items.map(i=>quote?`'${i.replace(/'/g,"''")}'`:i).join(", ");
  const out = `${col} IN (${vals})`;
  return <ToolWrap><textarea className="input-area w-full font-mono text-sm mb-2" rows={5} value={text} onChange={e=>setText(e.target.value)} placeholder="One value per line or comma-separated" /><div className="mb-3 flex items-center gap-3"><label className="text-sm">Column<input className="input-field mx-1 w-32" value={col} onChange={e=>setCol(e.target.value)} /></label><label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={quote} onChange={e=>setQuote(e.target.checked)} /> Quote values</label></div><div className="relative surface rounded-xl border p-3 font-mono text-xs break-all">{out}<CopyBtn text={out} absolute /></div></ToolWrap>;
}

/* ── Cron Builder ── */
export function CronBuilder() {
  const [min, setMin] = useState("*"), [hour, setHour] = useState("*"), [dom, setDom] = useState("*"), [mon, setMon] = useState("*"), [dow, setDow] = useState("*");
  const expr = `${min} ${hour} ${dom} ${mon} ${dow}`;
  const presets: [string,string][] = [["Every minute","* * * * *"],["Hourly","0 * * * *"],["Daily midnight","0 0 * * *"],["Weekly Sun","0 0 * * 0"],["Monthly 1st","0 0 1 * *"]];
  const apply = (e:string) => { const [a,b,c,d,f]=e.split(" "); setMin(a);setHour(b);setDom(c);setMon(d);setDow(f); };
  return <ToolWrap><div className="mb-3 flex flex-wrap gap-2">{presets.map(([n,e])=><button key={n} onClick={()=>apply(e)} className="rounded-lg border surface px-3 py-1 text-xs">{n}</button>)}</div><div className="mb-3 grid grid-cols-5 gap-2">{[["min",min,setMin],["hour",hour,setHour],["day",dom,setDom],["month",mon,setMon],["wday",dow,setDow]].map(([l,v,s])=><label key={l as string} className="text-center text-xs">{l as string}<input className="input-field mt-1 w-full text-center font-mono" value={v as string} onChange={e=>(s as (x:string)=>void)(e.target.value)} /></label>)}</div><div className="relative surface rounded-xl border p-4 text-center font-mono text-lg">{expr}<CopyBtn text={expr} absolute /></div></ToolWrap>;
}

/* ── API Tester ── */
export function ApiTester() {
  const [url, setUrl] = useState("https://api.github.com/zen"), [out, setOut] = useState(""), [meta, setMeta] = useState(""), [busy, setBusy] = useState(false);
  const run = async () => { setBusy(true); setOut(""); setMeta(""); const t=performance.now(); try { const r=await fetch(url); const ms=Math.round(performance.now()-t); const body=await r.text(); setMeta(`${r.status} ${r.statusText} · ${ms}ms · ${(body.length/1024).toFixed(1)}KB`); try{ setOut(JSON.stringify(JSON.parse(body),null,2)); }catch{ setOut(body.slice(0,5000)); } } catch(e){ setMeta("Error: "+(e as Error).message+" (CORS may block some APIs)"); } setBusy(false); };
  return <ToolWrap><div className="mb-3 flex gap-2"><input className="input-field flex-1 font-mono text-sm" value={url} onChange={e=>setUrl(e.target.value)} /><button onClick={run} disabled={busy} className="rounded-lg bg-brand-600 px-4 font-semibold text-white disabled:opacity-50">{busy?"…":"GET"}</button></div>{meta&&<p className="mb-2 text-sm text-muted">{meta}</p>}{out&&<div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={10} value={out} /><CopyBtn text={out} absolute /></div>}</ToolWrap>;
}

/* ── Nearest CSS Color Name ── */
const CSS_COLORS: [string,string][] = [["black","#000000"],["white","#ffffff"],["red","#ff0000"],["lime","#00ff00"],["blue","#0000ff"],["yellow","#ffff00"],["cyan","#00ffff"],["magenta","#ff00ff"],["silver","#c0c0c0"],["gray","#808080"],["maroon","#800000"],["olive","#808000"],["green","#008000"],["purple","#800080"],["teal","#008080"],["navy","#000080"],["orange","#ffa500"],["pink","#ffc0cb"],["brown","#a52a2a"],["gold","#ffd700"],["coral","#ff7f50"],["salmon","#fa8072"],["khaki","#f0e68c"],["violet","#ee82ee"],["indigo","#4b0082"],["turquoise","#40e0d0"],["crimson","#dc143c"],["chocolate","#d2691e"]];
export function NearestColorName() {
  const [c, setC] = useState("#3478f6");
  const [r,g,b] = hex2rgb(c);
  const nearest = CSS_COLORS.map(([n,h])=>{const[r2,g2,b2]=hex2rgb(h);return{n,h,d:(r-r2)**2+(g-g2)**2+(b-b2)**2};}).sort((a,b)=>a.d-b.d)[0];
  return <ToolWrap><div className="mb-3 flex items-center gap-2"><input type="color" value={c} onChange={e=>setC(e.target.value)} className="h-10 w-14" /><input className="input-field w-32 font-mono" value={c} onChange={e=>setC(e.target.value)} /></div><div className="surface rounded-xl border p-5 text-center"><div className="mx-auto mb-2 h-10 w-10 rounded-full border border-[var(--border)]" style={{background:nearest.h}} /><div className="text-2xl font-black text-brand-600 capitalize">{nearest.n}</div><div className="text-sm text-muted">nearest CSS color ({nearest.h})</div></div></ToolWrap>;
}

/* ── Reading Time Estimator ── */
export function ReadingTime() {
  const [text, setText] = useState(""), [wpm, setWpm] = useState(220);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const mins = words/wpm;
  return <ToolWrap><textarea className="input-area w-full mb-3" rows={5} value={text} onChange={e=>setText(e.target.value)} placeholder="Paste your article…" /><label className="text-sm block mb-3">Reading speed: {wpm} wpm<input type="range" min={120} max={400} value={wpm} onChange={e=>setWpm(+e.target.value)} className="w-full" /></label><div className="grid grid-cols-3 gap-3 text-center"><div className="surface rounded-xl border p-3"><div className="text-xl font-bold text-brand-600">{words}</div><div className="text-xs text-muted">words</div></div><div className="surface rounded-xl border p-3"><div className="text-xl font-bold">{mins<1?"<1":Math.ceil(mins)}</div><div className="text-xs text-muted">min read</div></div><div className="surface rounded-xl border p-3"><div className="text-xl font-bold">{Math.ceil(words/wpm*60)}</div><div className="text-xs text-muted">seconds</div></div></div></ToolWrap>;
}

/* ── Aspect Ratio Crop Calculator ── */
export function AspectRatioResize() {
  const [w, setW] = useState(1920), [h, setH] = useState(1080), [tw, setTw] = useState(800);
  const th = w? Math.round(tw*h/w):0;
  const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a; const g=gcd(w,h)||1;
  return <ToolWrap><div className="mb-3 grid grid-cols-2 gap-3"><label className="text-sm">Original W<input type="number" className="input-field mt-1 w-full" value={w} onChange={e=>setW(+e.target.value)} /></label><label className="text-sm">Original H<input type="number" className="input-field mt-1 w-full" value={h} onChange={e=>setH(+e.target.value)} /></label></div><p className="mb-3 text-center text-sm text-muted">Aspect ratio: <strong className="text-brand-600">{w/g}:{h/g}</strong></p><div className="surface rounded-xl border p-4 text-center"><p className="text-sm">New width <input type="number" className="input-field mx-1 w-24" value={tw} onChange={e=>setTw(+e.target.value)} /> → height <strong className="text-brand-600">{th}px</strong></p></div></ToolWrap>;
}
