"use client";
import { useState } from "react";
import { TwoPane, CopyBtn, ToolWrap } from "../ui";

/* ── Base64 ── */
export function Base64Tool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"text"|"file">("text");
  const [urlSafe, setUrlSafe] = useState(false);
  const encoded = (() => {
    try { const b = btoa(unescape(encodeURIComponent(input))); return urlSafe?b.replace(/\+/g,"-").replace(/\//g,"_"):b; }
    catch { return "⚠ encode error"; }
  })();
  const decoded = (() => {
    try { return decodeURIComponent(escape(atob(input.replace(/-/g,"+").replace(/_/g,"/")))); }
    catch { return "⚠ decode error (check input is valid base64)"; }
  })();
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3">
        <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="checkbox" checked={urlSafe} onChange={e=>setUrlSafe(e.target.checked)} /> URL-safe (base64url)</label>
      </div>
      <textarea className="input-area h-28 mb-3" placeholder="Text or base64 string…" value={input} onChange={e=>setInput(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        {[["Encoded",encoded],["Decoded",decoded]].map(([l,v])=>(
          <div key={l} className="relative">
            <p className="text-xs text-muted mb-1">{l}</p>
            <textarea className="input-area h-24 pr-10 font-mono text-xs" readOnly value={v} />
            <CopyBtn text={v} absolute />
          </div>
        ))}
      </div>
      {mode==="file" && <p className="text-xs text-muted mt-2">File → base64: use the File Converter tool</p>}
    </ToolWrap>
  );
}

/* ── URL Encode/Decode ── */
export function UrlEncodeTool() {
  const [input, setInput] = useState("");
  const encoded = (() => { try { return encodeURIComponent(input); } catch { return "⚠ error"; } })();
  const decoded = (() => { try { return decodeURIComponent(input); } catch { return "⚠ error"; } })();
  const encodedFull = (() => { try { return encodeURI(input); } catch { return "⚠ error"; } })();
  return (
    <ToolWrap>
      <textarea className="input-area h-24 mb-3" placeholder="URL or text to encode/decode…" value={input} onChange={e=>setInput(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        {[["encodeURIComponent()",encoded],["encodeURI()",encodedFull],["decodeURIComponent()",decoded]].map(([l,v])=>(
          <div key={l} className="relative">
            <p className="text-xs text-muted mb-1 font-mono">{l}</p>
            <textarea className="input-area h-16 pr-10 font-mono text-xs" readOnly value={v} />
            <CopyBtn text={v} absolute />
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── HTML Entities ── */
export function HtmlEntityTool() {
  const [input, setInput] = useState("");
  const encode = (s:string) => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]!);
  const decode = (s:string) => {
    const el = document.createElement("textarea");
    el.innerHTML = s;
    return el.value;
  };
  return (
    <ToolWrap>
      <textarea className="input-area h-28 mb-3" placeholder="HTML or entity-encoded text…" value={input} onChange={e=>setInput(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        {[["Encoded (→ entities)",encode(input)],["Decoded (→ text)",decode(input)]].map(([l,v])=>(
          <div key={l} className="relative">
            <p className="text-xs text-muted mb-1">{l}</p>
            <textarea className="input-area h-20 pr-10 font-mono text-xs" readOnly value={v} />
            <CopyBtn text={v} absolute />
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── JWT Decoder ── */
export function JwtDecoder() {
  const [token, setToken] = useState("");
  const decode = (t:string) => {
    const parts = t.trim().split(".");
    if (parts.length !== 3) return null;
    try {
      const dec = (s:string) => {
        const pad = s.replace(/-/g,"+").replace(/_/g,"/");
        return JSON.parse(atob(pad + "===".slice(0,(4-pad.length%4)%4)));
      };
      return { header: dec(parts[0]), payload: dec(parts[1]), sig: parts[2] };
    } catch { return null; }
  };
  const result = decode(token);
  const exp = result?.payload?.exp;
  const now = Math.floor(Date.now()/1000);
  const expired = exp && exp < now;
  return (
    <ToolWrap>
      <textarea className="input-area h-20 font-mono text-xs mb-3" placeholder="Paste JWT token…" value={token} onChange={e=>setToken(e.target.value)} />
      {result ? (
        <div className="space-y-3">
          {exp && <p className={`text-sm font-semibold ${expired?"text-red-500":"text-green-500"}`}>{expired?`✗ Expired ${new Date(exp*1000).toLocaleString()}`:`✓ Valid until ${new Date(exp*1000).toLocaleString()}`}</p>}
          {[["Header",result.header],["Payload",result.payload]].map(([l,v])=>(
            <div key={String(l)} className="relative">
              <p className="text-xs text-muted mb-1 font-semibold">{l}</p>
              <pre className="rounded-xl bg-[var(--surface-2)] border p-3 text-xs overflow-auto max-h-48 pr-8">{JSON.stringify(v,null,2)}</pre>
              <CopyBtn text={JSON.stringify(v,null,2)} absolute />
            </div>
          ))}
          <div><p className="text-xs text-muted mb-1 font-semibold">Signature (unverified)</p><p className="font-mono text-xs text-muted break-all">{result.sig}</p></div>
        </div>
      ) : token && <p className="text-sm text-red-500">⚠ Invalid JWT structure</p>}
    </ToolWrap>
  );
}

/* ── HTTP Basic Auth ── */
export function HttpBasicAuth() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [encoded, setEncoded] = useState("");
  const generate = () => setEncoded("Basic " + btoa(`${user}:${pass}`));
  const decode = () => {
    try {
      const b64 = encoded.replace(/^Basic\s+/i,"");
      const [u,p] = atob(b64).split(":");
      setUser(u); setPass(p||"");
    } catch { alert("Invalid Basic auth header"); }
  };
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2 mb-3">
        <input className="input-field" placeholder="Username" value={user} onChange={e=>setUser(e.target.value)} />
        <input className="input-field" type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} />
      </div>
      <div className="flex gap-2 mb-3">
        <button className="btn-primary flex-1" onClick={generate}>Generate →</button>
        <button className="btn-secondary flex-1" onClick={decode}>← Decode</button>
      </div>
      <div className="relative">
        <textarea className="input-area h-16 pr-10 font-mono text-sm" value={encoded} onChange={e=>setEncoded(e.target.value)} placeholder="Basic dXNlcjpwYXNz" />
        <CopyBtn text={encoded} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── Unicode Escape ── */
export function UnicodeTool() {
  const [input, setInput] = useState("");
  const escape = (s:string)=>s.split("").map(c=>c.charCodeAt(0)>127?`\\u${c.charCodeAt(0).toString(16).padStart(4,"0")}`:c).join("");
  const unescape2 = (s:string)=>s.replace(/\\u([0-9a-fA-F]{4})/g,(_,h)=>String.fromCharCode(parseInt(h,16)));
  return (
    <ToolWrap>
      <textarea className="input-area h-24 mb-3" placeholder="Text with unicode or \\uXXXX sequences…" value={input} onChange={e=>setInput(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        {[["Escaped",escape(input)],["Unescaped",unescape2(input)]].map(([l,v])=>(
          <div key={l} className="relative">
            <p className="text-xs text-muted mb-1">{l}</p>
            <textarea className="input-area h-20 pr-10 font-mono text-xs" readOnly value={v} />
            <CopyBtn text={v} absolute />
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── String Escaper ── */
export function StringEscaper() {
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<"json"|"js"|"sql"|"csv"|"html"|"regex">("json");
  const escape = (s:string)=>{
    switch(lang) {
      case "json": return JSON.stringify(s);
      case "js": return `\`${s.replace(/`/g,"\\`").replace(/\$/g,"\\$")}\``;
      case "sql": return `'${s.replace(/'/g,"''")}'`;
      case "csv": return s.includes(",")||s.includes('"')||s.includes("\n")?`"${s.replace(/"/g,'""')}"`:s;
      case "html": return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
      case "regex": return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    }
  };
  return (
    <ToolWrap>
      <div className="flex flex-wrap gap-2 mb-3">
        {(["json","js","sql","csv","html","regex"] as const).map(l=>(
          <button key={l} onClick={()=>setLang(l)} className={`rounded-lg border px-3 py-1.5 text-xs font-mono font-medium ${lang===l?"border-brand-500 bg-brand-500/10 text-brand-600":"surface hover:border-brand-400"}`}>{l}</button>
        ))}
      </div>
      <TwoPane
        left={<textarea className="input-area h-32" placeholder="Raw string…" value={input} onChange={e=>setInput(e.target.value)} />}
        right={<div className="relative"><textarea className="input-area h-32 pr-10 font-mono text-sm" readOnly value={escape(input)} /><CopyBtn text={escape(input)} absolute /></div>}
      />
    </ToolWrap>
  );
}

/* ── Base32 ── */
export function Base32Tool() {
  const [input, setInput] = useState("");
  const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const encode = (s:string) => {
    const bytes = new TextEncoder().encode(s);
    let out="", buf=0, bits=0;
    for (const b of bytes) { buf=(buf<<8)|b; bits+=8; while(bits>=5){out+=ALPHA[(buf>>(bits-5))&31];bits-=5;} }
    if (bits>0){out+=ALPHA[(buf<<(5-bits))&31];}
    while(out.length%8)out+="=";
    return out;
  };
  const decode = (s:string)=>{
    try {
      s=s.toUpperCase().replace(/=+$/,"");
      let buf=0,bits=0; const bytes: number[]=[];
      for(const c of s){const v=ALPHA.indexOf(c);if(v<0)continue;buf=(buf<<5)|v;bits+=5;if(bits>=8){bytes.push((buf>>(bits-8))&255);bits-=8;}}
      return new TextDecoder().decode(new Uint8Array(bytes));
    } catch { return "⚠ decode error"; }
  };
  return (
    <ToolWrap>
      <textarea className="input-area h-24 mb-3" placeholder="Text or Base32 string…" value={input} onChange={e=>setInput(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        {[["Encoded",encode(input)],["Decoded",decode(input)]].map(([l,v])=>(
          <div key={l} className="relative"><p className="text-xs text-muted mb-1">{l}</p><textarea className="input-area h-20 pr-10 font-mono text-xs" readOnly value={v} /><CopyBtn text={v} absolute /></div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Data URI Generator ── */
export function DataUriTool() {
  const [uri, setUri] = useState("");
  const [type, setType] = useState("text/html");
  const [content, setContent] = useState("<h1>Hello</h1>");
  const generate = () => setUri(`data:${type};base64,${btoa(unescape(encodeURIComponent(content)))}`);
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3 flex-wrap">
        <input className="input-field flex-1 min-w-40" placeholder="MIME type" value={type} onChange={e=>setType(e.target.value)} />
        <button className="btn-primary" onClick={generate}>Generate</button>
      </div>
      <textarea className="input-area h-24 mb-3" placeholder="Content…" value={content} onChange={e=>setContent(e.target.value)} />
      {uri && (
        <div className="relative">
          <p className="text-xs text-muted mb-1">Data URI</p>
          <textarea className="input-area h-20 pr-10 font-mono text-xs" readOnly value={uri} />
          <CopyBtn text={uri} absolute />
        </div>
      )}
    </ToolWrap>
  );
}
