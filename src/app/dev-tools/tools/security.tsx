"use client";
import { useState, useCallback } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── Hash Generator ── */
export function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string,string>>({});
  const [isFile, setIsFile] = useState(false);
  const generate = useCallback(async (data: string | ArrayBuffer) => {
    const buf = typeof data === "string" ? new TextEncoder().encode(data) : data;
    const algos: ["SHA-1","SHA-256","SHA-384","SHA-512"] = ["SHA-1","SHA-256","SHA-384","SHA-512"];
    const results: Record<string,string> = {};
    await Promise.all(algos.map(async a => {
      const h = await crypto.subtle.digest(a, buf);
      results[a] = Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,"0")).join("");
    }));
    // MD5 pure JS (simple implementation)
    if (typeof data === "string") {
      results["MD5"] = md5(data);
    }
    setHashes(results);
  }, []);
  const onText = async () => { if (input) await generate(input); };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = async () => { if (r.result instanceof ArrayBuffer) await generate(r.result); };
    r.readAsArrayBuffer(f);
  };
  return (
    <ToolWrap>
      <div className="flex gap-2 mb-3">
        {(["text","file"] as const).map(m=>(
          <button key={m} onClick={()=>setIsFile(m==="file")} className={`rounded-lg border px-3 py-1.5 text-xs ${isFile===(m==="file")?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{m}</button>
        ))}
      </div>
      {isFile ? (
        <input type="file" className="input-field w-full mb-3" onChange={onFile} />
      ) : (
        <div className="flex gap-2 mb-3">
          <textarea className="input-area flex-1 h-16" placeholder="Text to hash…" value={input} onChange={e=>setInput(e.target.value)} />
          <button className="btn-primary shrink-0" onClick={onText}>Hash</button>
        </div>
      )}
      <div className="space-y-2">
        {Object.entries(hashes).map(([algo, hash]) => (
          <div key={algo} className="surface flex items-center gap-3 rounded-lg border px-3 py-2">
            <span className="text-xs text-muted font-mono w-14 shrink-0">{algo}</span>
            <span className="font-mono text-xs flex-1 break-all">{hash}</span>
            <CopyBtn text={hash} />
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── HMAC Generator ── */
export function HmacGenerator() {
  const [msg, setMsg] = useState("");
  const [key, setKey] = useState("");
  const [algo, setAlgo] = useState<"SHA-256"|"SHA-384"|"SHA-512">("SHA-256");
  const [output, setOutput] = useState("");
  const generate = async () => {
    const enc = new TextEncoder();
    const k = await crypto.subtle.importKey("raw", enc.encode(key), {name:"HMAC",hash:algo}, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", k, enc.encode(msg));
    setOutput(Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,"0")).join(""));
  };
  return (
    <ToolWrap>
      <div className="space-y-3 mb-3">
        <textarea className="input-area h-20" placeholder="Message…" value={msg} onChange={e=>setMsg(e.target.value)} />
        <input className="input-field w-full" type="password" placeholder="Secret key…" value={key} onChange={e=>setKey(e.target.value)} />
        <div className="flex gap-2">
          {(["SHA-256","SHA-384","SHA-512"] as const).map(a=>(
            <button key={a} onClick={()=>setAlgo(a)} className={`rounded-lg border px-3 py-1.5 text-xs font-mono ${algo===a?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{a}</button>
          ))}
          <button className="btn-primary ml-auto" onClick={generate}>Generate</button>
        </div>
      </div>
      {output && (
        <div className="relative">
          <textarea className="input-area h-16 pr-10 font-mono text-xs" readOnly value={output} />
          <CopyBtn text={output} absolute />
        </div>
      )}
    </ToolWrap>
  );
}

/* ── Password Strength Checker ── */
export function PasswordStrength() {
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const checks = [
    { label: "8+ characters", pass: pass.length >= 8 },
    { label: "12+ characters", pass: pass.length >= 12 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(pass) },
    { label: "Lowercase letter", pass: /[a-z]/.test(pass) },
    { label: "Number", pass: /\d/.test(pass) },
    { label: "Special character", pass: /[^a-zA-Z0-9]/.test(pass) },
    { label: "No common patterns", pass: pass.length > 0 && !/^(password|123456|qwerty|abc123)/i.test(pass) },
  ];
  const score = checks.filter(c=>c.pass).length;
  const strength = score<=2?"Weak":score<=4?"Fair":score<=5?"Good":score<=6?"Strong":"Very Strong";
  const color = score<=2?"red":score<=4?"orange":score<=5?"yellow":score<=6?"green":"emerald";
  const colorClass = `text-${color}-500`;
  const barClass = `bg-${color}-500`;
  // Entropy
  let chars = 0;
  if (/[a-z]/.test(pass)) chars+=26;
  if (/[A-Z]/.test(pass)) chars+=26;
  if (/\d/.test(pass)) chars+=10;
  if (/[^a-zA-Z0-9]/.test(pass)) chars+=32;
  const entropy = pass.length ? Math.round(pass.length * Math.log2(chars||1)) : 0;
  const crackTime = entropy < 40 ? "< 1 second" : entropy < 60 ? "Minutes to hours" : entropy < 80 ? "Years" : "Centuries";
  return (
    <ToolWrap>
      <div className="relative mb-4">
        <input type={show?"text":"password"} className="input-field w-full pr-16 font-mono" placeholder="Enter password to check…" value={pass} onChange={e=>setPass(e.target.value)} />
        <button onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-[var(--text)]">{show?"Hide":"Show"}</button>
      </div>
      {pass && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-2.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
              <div className={`h-full rounded-full transition-all ${score<=2?"bg-red-500":score<=4?"bg-orange-500":score<=5?"bg-yellow-500":score<=6?"bg-green-500":"bg-emerald-500"}`} style={{width:`${(score/7)*100}%`}} />
            </div>
            <span className={`text-sm font-bold ${colorClass}`}>{strength}</span>
          </div>
          <div className="grid gap-1 mb-3">
            {checks.map(c=>(
              <div key={c.label} className={`flex items-center gap-2 text-sm ${c.pass?"text-green-600 dark:text-green-400":"text-muted"}`}>
                <span>{c.pass?"✓":"○"}</span><span>{c.label}</span>
              </div>
            ))}
          </div>
          <div className="surface rounded-xl border p-3 grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-xs text-muted">Entropy</div><div className="font-bold">{entropy} bits</div></div>
            <div><div className="text-xs text-muted">Estimated crack time</div><div className="font-bold">{crackTime}</div></div>
            <div><div className="text-xs text-muted">Length</div><div className="font-bold">{pass.length} chars</div></div>
          </div>
        </>
      )}
    </ToolWrap>
  );
}

/* ── AES Encrypt/Decrypt ── */
export function AesTool() {
  const [text, setText] = useState("");
  const [key, setKey] = useState("");
  const [encrypted, setEncrypted] = useState("");
  const [decrypted, setDecrypted] = useState("");
  const [error, setError] = useState("");
  const deriveKey = async (pass: string) => {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name:"PBKDF2", salt: enc.encode("dataforge-salt"), iterations: 100000, hash:"SHA-256" },
      keyMaterial, { name:"AES-GCM", length: 256 }, false, ["encrypt","decrypt"]
    );
  };
  const encrypt = async () => {
    try {
      setError("");
      const k = await deriveKey(key);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = await crypto.subtle.encrypt({name:"AES-GCM",iv}, k, new TextEncoder().encode(text));
      const combined = new Uint8Array([...iv, ...new Uint8Array(ct)]);
      setEncrypted(btoa(String.fromCharCode(...combined)));
    } catch(e) { setError((e as Error).message); }
  };
  const decrypt = async () => {
    try {
      setError("");
      const k = await deriveKey(key);
      const combined = Uint8Array.from(atob(encrypted), c=>c.charCodeAt(0));
      const iv = combined.slice(0,12), ct = combined.slice(12);
      const pt = await crypto.subtle.decrypt({name:"AES-GCM",iv}, k, ct);
      setDecrypted(new TextDecoder().decode(pt));
    } catch(e) { setError("Decryption failed — wrong key or invalid ciphertext"); }
  };
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3" type="password" placeholder="Encryption key (password)…" value={key} onChange={e=>setKey(e.target.value)} />
      {error&&<p className="text-sm text-red-500 mb-2">⚠ {error}</p>}
      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted mb-1 font-semibold">Plaintext</p>
          <div className="flex gap-2">
            <textarea className="input-area flex-1 h-20" value={text} onChange={e=>setText(e.target.value)} placeholder="Text to encrypt…" />
            <button className="btn-primary shrink-0" onClick={encrypt}>Encrypt →</button>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted mb-1 font-semibold">Ciphertext (base64)</p>
          <div className="flex gap-2">
            <textarea className="input-area flex-1 h-20 font-mono text-xs" value={encrypted} onChange={e=>setEncrypted(e.target.value)} placeholder="Encrypted base64 string…" />
            <button className="btn-secondary shrink-0" onClick={decrypt}>← Decrypt</button>
          </div>
        </div>
        {decrypted&&<div className="relative"><p className="text-xs text-muted mb-1">Decrypted</p><textarea className="input-area h-16 pr-10" readOnly value={decrypted} /><CopyBtn text={decrypted} absolute /></div>}
      </div>
    </ToolWrap>
  );
}

/* ── CSP Generator ── */
export function CspGenerator() {
  const [directives, setDirectives] = useState({
    "default-src": ["'self'"],
    "script-src": ["'self'","'unsafe-inline'"],
    "style-src": ["'self'","'unsafe-inline'"],
    "img-src": ["'self'","data:","https:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'"],
    "frame-ancestors": ["'none'"],
  });
  const header = Object.entries(directives).map(([k,v])=>`${k} ${v.join(" ")}`).join("; ");
  return (
    <ToolWrap>
      <div className="space-y-2 mb-3">
        {Object.entries(directives).map(([dir, vals]) => (
          <div key={dir} className="flex items-start gap-2">
            <span className="font-mono text-xs text-brand-600 dark:text-brand-400 w-36 shrink-0 pt-2">{dir}</span>
            <input className="input-field flex-1 text-xs font-mono" value={vals.join(" ")} onChange={e=>setDirectives({...directives,[dir]:e.target.value.split(/\s+/)})} />
          </div>
        ))}
      </div>
      <div className="relative">
        <p className="text-xs text-muted mb-1">Content-Security-Policy header value</p>
        <textarea className="input-area h-20 pr-10 font-mono text-xs" readOnly value={header} />
        <CopyBtn text={header} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── Secret Scanner ── */
export function SecretScanner() {
  const [code, setCode] = useState("");
  const PATTERNS = [
    {name:"AWS Access Key", re:/AKIA[0-9A-Z]{16}/g},
    {name:"AWS Secret", re:/aws_secret[_\s]*=\s*["']?[A-Za-z0-9+/]{40}/gi},
    {name:"Generic API Key", re:/api[_-]?key\s*[=:]\s*["']?([a-zA-Z0-9_\-]{20,})/gi},
    {name:"Bearer Token", re:/bearer\s+[a-zA-Z0-9._\-]{20,}/gi},
    {name:"Private Key Header", re:/-----BEGIN .*(PRIVATE|RSA) KEY-----/},
    {name:"JWT Token", re:/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g},
    {name:"Password in code", re:/password\s*[=:]\s*["'][^"']{6,}["']/gi},
    {name:"Connection string", re:/(?:mongodb|mysql|postgres|redis):\/\/[^\s"']+/gi},
    {name:"Slack token", re:/xox[baprs]-[0-9a-zA-Z]{10,}/g},
    {name:"GitHub token", re:/gh[pousr]_[A-Za-z0-9]{36}/g},
  ];
  const findings = code ? PATTERNS.flatMap(p=>{
    const m=[...code.matchAll(p.re)];
    return m.map(match=>({name:p.name,match:match[0].slice(0,60)+(match[0].length>60?"…":""),line:code.slice(0,match.index).split("\n").length}));
  }) : [];
  return (
    <ToolWrap>
      <textarea className="input-area h-40 font-mono text-xs mb-3" placeholder="Paste code or config files to scan for secrets…" value={code} onChange={e=>setCode(e.target.value)} />
      {findings.length>0 ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-red-500">⚠ {findings.length} potential secret{findings.length!==1?"s":""} found</p>
          {findings.map((f,i)=>(
            <div key={i} className="rounded-xl border border-red-300 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/20">
              <div className="text-xs font-bold text-red-600">{f.name} — line {f.line}</div>
              <div className="font-mono text-xs text-red-700 dark:text-red-400 mt-1 break-all">{f.match}</div>
            </div>
          ))}
        </div>
      ) : code && <p className="text-sm text-green-600 dark:text-green-400">✓ No secrets detected</p>}
    </ToolWrap>
  );
}

/* tiny MD5 (Crockford/Hadrob public domain) */
function md5(str: string): string {
  function safeAdd(x:number,y:number){const lsw=(x&0xFFFF)+(y&0xFFFF);return(((x>>16)+(y>>16)+(lsw>>16))<<16)|(lsw&0xFFFF);}
  function bitRotateLeft(num:number,cnt:number){return(num<<cnt)|(num>>>(32-cnt));}
  function md5cmn(q:number,a:number,b:number,x:number,s:number,t:number){return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
  function md5ff(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn((b&c)|(~b&d),a,b,x,s,t);}
  function md5gg(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn((b&d)|(c&~d),a,b,x,s,t);}
  function md5hh(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn(b^c^d,a,b,x,s,t);}
  function md5ii(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn(c^(b|~d),a,b,x,s,t);}
  const x=str2blks(str);let a=1732584193,b=-271733879,c=-1732584194,d=271733878;
  for(let i=0;i<x.length;i+=16){const [oa,ob,oc,od]=[a,b,c,d];
    a=md5ff(a,b,c,d,x[i],7,-680876936);d=md5ff(d,a,b,c,x[i+1],12,-389564586);c=md5ff(c,d,a,b,x[i+2],17,606105819);b=md5ff(b,c,d,a,x[i+3],22,-1044525330);
    a=md5ff(a,b,c,d,x[i+4],7,-176418897);d=md5ff(d,a,b,c,x[i+5],12,1200080426);c=md5ff(c,d,a,b,x[i+6],17,-1473231341);b=md5ff(b,c,d,a,x[i+7],22,-45705983);
    a=md5ff(a,b,c,d,x[i+8],7,1770035416);d=md5ff(d,a,b,c,x[i+9],12,-1958414417);c=md5ff(c,d,a,b,x[i+10],17,-42063);b=md5ff(b,c,d,a,x[i+11],22,-1990404162);
    a=md5ff(a,b,c,d,x[i+12],7,1804603682);d=md5ff(d,a,b,c,x[i+13],12,-40341101);c=md5ff(c,d,a,b,x[i+14],17,-1502002290);b=md5ff(b,c,d,a,x[i+15],22,1236535329);
    a=md5gg(a,b,c,d,x[i+1],5,-165796510);d=md5gg(d,a,b,c,x[i+6],9,-1069501632);c=md5gg(c,d,a,b,x[i+11],14,643717713);b=md5gg(b,c,d,a,x[i],20,-373897302);
    a=md5gg(a,b,c,d,x[i+5],5,-701558691);d=md5gg(d,a,b,c,x[i+10],9,38016083);c=md5gg(c,d,a,b,x[i+15],14,-660478335);b=md5gg(b,c,d,a,x[i+4],20,-405537848);
    a=md5gg(a,b,c,d,x[i+9],5,568446438);d=md5gg(d,a,b,c,x[i+14],9,-1019803690);c=md5gg(c,d,a,b,x[i+3],14,-187363961);b=md5gg(b,c,d,a,x[i+8],20,1163531501);
    a=md5gg(a,b,c,d,x[i+13],5,-1444681467);d=md5gg(d,a,b,c,x[i+2],9,-51403784);c=md5gg(c,d,a,b,x[i+7],14,1735328473);b=md5gg(b,c,d,a,x[i+12],20,-1926607734);
    a=md5hh(a,b,c,d,x[i+5],4,-378558);d=md5hh(d,a,b,c,x[i+8],11,-2022574463);c=md5hh(c,d,a,b,x[i+11],16,1839030562);b=md5hh(b,c,d,a,x[i+14],23,-35309556);
    a=md5hh(a,b,c,d,x[i+1],4,-1530992060);d=md5hh(d,a,b,c,x[i+4],11,1272893353);c=md5hh(c,d,a,b,x[i+7],16,-155497632);b=md5hh(b,c,d,a,x[i+10],23,-1094730640);
    a=md5hh(a,b,c,d,x[i+13],4,681279174);d=md5hh(d,a,b,c,x[i],11,-358537222);c=md5hh(c,d,a,b,x[i+3],16,-722521979);b=md5hh(b,c,d,a,x[i+6],23,76029189);
    a=md5hh(a,b,c,d,x[i+9],4,-640364487);d=md5hh(d,a,b,c,x[i+12],11,-421815835);c=md5hh(c,d,a,b,x[i+15],16,530742520);b=md5hh(b,c,d,a,x[i+2],23,-995338651);
    a=md5ii(a,b,c,d,x[i],6,-198630844);d=md5ii(d,a,b,c,x[i+7],10,1126891415);c=md5ii(c,d,a,b,x[i+14],15,-1416354905);b=md5ii(b,c,d,a,x[i+5],21,-57434055);
    a=md5ii(a,b,c,d,x[i+12],6,1700485571);d=md5ii(d,a,b,c,x[i+3],10,-1894986606);c=md5ii(c,d,a,b,x[i+10],15,-1051523);b=md5ii(b,c,d,a,x[i+1],21,-2054922799);
    a=md5ii(a,b,c,d,x[i+8],6,1873313359);d=md5ii(d,a,b,c,x[i+15],10,-30611744);c=md5ii(c,d,a,b,x[i+6],15,-1560198380);b=md5ii(b,c,d,a,x[i+13],21,1309151649);
    a=md5ii(a,b,c,d,x[i+4],6,-145523070);d=md5ii(d,a,b,c,x[i+11],10,-1120210379);c=md5ii(c,d,a,b,x[i+2],15,718787259);b=md5ii(b,c,d,a,x[i+9],21,-343485551);
    a=safeAdd(a,oa);b=safeAdd(b,ob);c=safeAdd(c,oc);d=safeAdd(d,od);
  }
  return [a,b,c,d].map(n=>Array.from({length:4},(_,i)=>((n>>>(i*8))&0xFF).toString(16).padStart(2,"0")).join("")).join("");
}
function str2blks(str:string){const nblk=((str.length+8)>>6)+1,blks=new Array(nblk*16).fill(0);let i=0;for(;i<str.length;i++)blks[i>>2]|=str.charCodeAt(i)<<((i%4)*8);blks[i>>2]|=0x80<<((i%4)*8);blks[nblk*16-2]=str.length*8;return blks;}
