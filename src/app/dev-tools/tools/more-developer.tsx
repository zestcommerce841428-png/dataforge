"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap, TwoPane } from "../ui";

/* ── JSON Diff ── */
export function JsonDiff() {
  const [a, setA] = useState('{"name":"Alice","age":30,"city":"NYC"}');
  const [b, setB] = useState('{"name":"Alice","age":31,"role":"admin"}');
  const diff = (() => {
    try {
      const oa = JSON.parse(a), ob = JSON.parse(b);
      const keys = new Set([...Object.keys(oa),...Object.keys(ob)]);
      return Array.from(keys).map(k => {
        if (!(k in oa)) return {k,type:"added",va:undefined,vb:ob[k]};
        if (!(k in ob)) return {k,type:"removed",va:oa[k],vb:undefined};
        const va=JSON.stringify(oa[k]),vb=JSON.stringify(ob[k]);
        return {k,type:va===vb?"same":"changed",va:oa[k],vb:ob[k]};
      });
    } catch(e) { return null; }
  })();
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2 mb-3">
        <textarea className="input-area h-32 font-mono text-xs" placeholder="Original JSON…" value={a} onChange={e=>setA(e.target.value)} />
        <textarea className="input-area h-32 font-mono text-xs" placeholder="Modified JSON…" value={b} onChange={e=>setB(e.target.value)} />
      </div>
      {diff ? (
        <div className="space-y-1 max-h-48 overflow-auto">
          {diff.map(d=>(
            <div key={d.k} className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm font-mono ${d.type==="added"?"bg-green-50 dark:bg-green-950/20":d.type==="removed"?"bg-red-50 dark:bg-red-950/20":d.type==="changed"?"bg-yellow-50 dark:bg-yellow-950/20":"bg-[var(--surface-2)]"}`}>
              <span className={`w-16 shrink-0 font-semibold ${d.type==="added"?"text-green-600":d.type==="removed"?"text-red-500":d.type==="changed"?"text-yellow-600":"text-muted"}`}>{d.type==="added"?"+ added":d.type==="removed"?"- removed":d.type==="changed"?"~ changed":"= same"}</span>
              <span className="text-brand-600 dark:text-brand-400 w-24 shrink-0 truncate">{d.k}</span>
              {d.type==="changed"&&<span className="text-muted line-through text-xs truncate">{JSON.stringify(d.va)}</span>}
              {d.type!=="removed"&&<span className="text-xs truncate">{JSON.stringify(d.vb??d.va)}</span>}
            </div>
          ))}
        </div>
      ) : (a||b)&&<p className="text-sm text-red-500">⚠ Invalid JSON in one or both fields</p>}
    </ToolWrap>
  );
}

/* ── YAML ↔ JSON ── */
export function YamlJsonConverter() {
  const [input, setInput] = useState('name: Alice\nage: 30\nactive: true\ntags:\n  - dev\n  - admin');
  const [mode, setMode] = useState<"yaml→json"|"json→yaml">("yaml→json");
  const toJson = (yaml:string):string => {
    try {
      const obj:Record<string,unknown>={};let cur=obj;const stack:[Record<string,unknown>,number,string|null][]=[]; let lastKey="";
      for(const rawLine of yaml.split(/\r?\n/)){
        if(/^\s*#/.test(rawLine)||rawLine.trim()==="")continue;
        const indent=rawLine.match(/^(\s*)/)![1].length;const t=rawLine.trimStart();
        while(stack.length&&stack[stack.length-1][1]>=indent)stack.pop();
        cur=stack.length?stack[stack.length-1][0]:obj;
        if(t.startsWith("- ")){const v=t.slice(2).trim();const parsed=v==="true"?true:v==="false"?false:!isNaN(+v)?+v:v;if(!Array.isArray(cur[lastKey]))cur[lastKey]=[];(cur[lastKey] as unknown[]).push(parsed);}
        else{const m=t.match(/^([^:]+):\s*(.*)$/);if(!m)continue;const[,k,vr]=m;const v=vr.trim();const parsed=v===""?{}:v==="true"?true:v==="false"?false:v==="null"?null:!isNaN(+v)?+v:v.replace(/^["']|["']$/g,"");cur[k.trim()]=parsed;lastKey=k.trim();if(v==="")stack.push([cur,indent,k.trim()]);}
      }
      return JSON.stringify(obj,null,2);
    }catch(e){return "⚠ "+( e as Error).message;}
  };
  const toYaml=(json:string):string=>{try{const v=JSON.parse(json);const conv=(val:unknown,d=0):string=>{const p="  ".repeat(d);if(val===null)return"null";if(typeof val==="boolean"||typeof val==="number")return String(val);if(typeof val==="string"){if(/[\n:"{}[\],&*?|<>=!%@`#]/.test(val)||val===""||/^\s|\s$/.test(val))return`"${val.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n")}"`;return val;}if(Array.isArray(val)){if(!val.length)return"[]";return val.map(i=>`\n${p}- ${conv(i,d+1)}`).join("");}if(typeof val==="object"){const e=Object.entries(val as Record<string,unknown>);if(!e.length)return"{}";return e.map(([k,v])=>{const r=conv(v,d+1);const il=typeof v!=="object"||v===null;return`\n${p}${k}:${il?" "+r:r}`;}).join("");}return String(val);};return conv(v).trimStart();}catch(e){return "⚠ "+(e as Error).message;}};
  const output = mode==="yaml→json"?toJson(input):toYaml(input);
  return (
    <ToolWrap>
      <div className="flex gap-2 mb-3">
        {(["yaml→json","json→yaml"] as const).map(m=>(
          <button key={m} onClick={()=>setMode(m)} className={`rounded-lg border px-3 py-1.5 text-xs font-mono ${mode===m?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{m}</button>
        ))}
      </div>
      <TwoPane
        left={<textarea className="input-area h-48 font-mono text-xs" value={input} onChange={e=>setInput(e.target.value)} />}
        right={<div className="relative"><textarea className="input-area h-48 pr-10 font-mono text-xs" readOnly value={output} /><CopyBtn text={output} absolute /></div>}
      />
    </ToolWrap>
  );
}

/* ── XML Formatter ── */
export function XmlFormatter() {
  const [input, setInput] = useState('<root><user id="1"><name>Alice</name><email>alice@example.com</email></user></root>');
  const [output, setOutput] = useState("");
  const format = () => {
    try {
      const doc = new DOMParser().parseFromString(input,"application/xml");
      const err = doc.querySelector("parsererror");
      if (err) { setOutput("⚠ " + (err.textContent||"Parse error")); return; }
      const indent = (node: Element, level: number): string => {
        const pad = "  ".repeat(level);
        const children = Array.from(node.children);
        const text = node.childNodes.length===1&&node.childNodes[0].nodeType===3?node.textContent?.trim()||"":"";
        const attrs = Array.from(node.attributes).map(a=>`${a.name}="${a.value}"`).join(" ");
        const tag = `${node.tagName}${attrs?" "+attrs:""}`;
        if (children.length===0) return `${pad}<${tag}>${text}</${node.tagName}>`;
        return `${pad}<${tag}>\n${children.map(c=>indent(c,level+1)).join("\n")}\n${pad}</${node.tagName}>`;
      };
      setOutput(indent(doc.documentElement,0));
    } catch(e) { setOutput("⚠ "+(e as Error).message); }
  };
  return (
    <ToolWrap>
      <button className="btn-primary mb-3" onClick={format}>Format XML</button>
      <TwoPane
        left={<textarea className="input-area h-48 font-mono text-xs" value={input} onChange={e=>setInput(e.target.value)} />}
        right={<div className="relative"><textarea className="input-area h-48 pr-10 font-mono text-xs" readOnly value={output} /><CopyBtn text={output} absolute /></div>}
      />
    </ToolWrap>
  );
}

/* ── CSS Minifier ── */
export function CssMinifier() {
  const [input, setInput] = useState(".button {\n  background: #6366f1;\n  color: white;\n  padding: 8px 16px;\n  border-radius: 8px;\n  /* hover state */\n}\n.button:hover {\n  background: #4f46e5;\n}");
  const minify = (css:string) => css.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\s*([{}:;,])\s*/g,"$1").replace(/;\}/g,"}").replace(/\s+/g," ").trim();
  const output = minify(input);
  const saved = input.length ? Math.round((1-output.length/input.length)*100) : 0;
  return (
    <ToolWrap>
      <TwoPane
        left={<textarea className="input-area h-48 font-mono text-xs" value={input} onChange={e=>setInput(e.target.value)} />}
        right={<div className="relative"><textarea className="input-area h-48 pr-10 font-mono text-xs" readOnly value={output} /><CopyBtn text={output} absolute /></div>}
      />
      <p className="text-xs text-green-600 mt-2">{input.length} → {output.length} bytes ({saved}% saved)</p>
    </ToolWrap>
  );
}

/* ── HTML Minifier ── */
export function HtmlMinifier() {
  const [input, setInput] = useState('<!DOCTYPE html>\n<html>\n  <head>\n    <title>Hello</title>\n  </head>\n  <body>\n    <!-- comment -->\n    <h1>Hello World</h1>\n    <p>  Some   text  here.  </p>\n  </body>\n</html>');
  const minify = (html:string) => html.replace(/<!--[\s\S]*?-->/g,"").replace(/\s{2,}/g," ").replace(/>\s+</g,"><").trim();
  const output = minify(input);
  const saved = input.length ? Math.round((1-output.length/input.length)*100) : 0;
  return (
    <ToolWrap>
      <TwoPane
        left={<textarea className="input-area h-48 font-mono text-xs" value={input} onChange={e=>setInput(e.target.value)} />}
        right={<div className="relative"><textarea className="input-area h-48 pr-10 font-mono text-xs" readOnly value={output} /><CopyBtn text={output} absolute /></div>}
      />
      <p className="text-xs text-green-600 mt-2">{input.length} → {output.length} bytes ({saved}% saved)</p>
    </ToolWrap>
  );
}

/* ── Gitignore Generator ── */
export function GitignoreGenerator() {
  const TEMPLATES: Record<string, string> = {
    Node: "node_modules/\ndist/\nbuild/\n.env\n.env.local\n*.log\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n.DS_Store\nThumbs.db",
    Python: "__pycache__/\n*.py[cod]\n*.pyo\n*.pyd\n.Python\nbuild/\ndist/\n*.egg-info/\n.eggs/\n.venv/\nvenv/\n.env\n*.log",
    React: "node_modules/\n.next/\nout/\nbuild/\n.env\n.env.local\n*.log\n.DS_Store",
    "Next.js": "node_modules/\n.next/\nout/\nbuild/\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local\n*.log",
    Java: "*.class\n*.jar\n*.war\n*.ear\n*.log\ntarget/\n.idea/\n*.iml\n.gradle/\nbuild/",
    Go: "*.exe\n*.test\n*.out\nvendor/\n.env",
    Rust: "target/\n**/*.rs.bk\nCargo.lock",
    macOS: ".DS_Store\n.AppleDouble\n.LSOverride\n._*\n.Spotlight-V100\n.Trashes\nIcon\n",
    Windows: "Thumbs.db\nehthumbs.db\nDesktop.ini\n$RECYCLE.BIN/\n*.cab\n*.msi\n*.lnk",
    Linux: "*~\n.fuse_hidden*\n.directory\n.Trash-*\n.nfs*",
  };
  const [selected, setSelected] = useState<string[]>(["Node","macOS"]);
  const toggle = (t:string) => setSelected(s=>s.includes(t)?s.filter(x=>x!==t):[...s,t]);
  const output = selected.map(t=>`# ${t}\n${TEMPLATES[t]}`).join("\n\n");
  return (
    <ToolWrap>
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.keys(TEMPLATES).map(t=>(
          <button key={t} onClick={()=>toggle(t)} className={`rounded-lg border px-3 py-1.5 text-sm ${selected.includes(t)?"border-brand-500 bg-brand-500/10 text-brand-600":"surface hover:border-brand-400"}`}>{t}</button>
        ))}
      </div>
      <div className="relative">
        <textarea className="input-area h-48 pr-10 font-mono text-xs" readOnly value={output} />
        <CopyBtn text={output} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── Open Source License Generator ── */
export function LicenseGenerator() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [name, setName] = useState("Your Name");
  const [license, setLicense] = useState("MIT");
  const LICENSES: Record<string,string> = {
    MIT: `MIT License\n\nCopyright (c) {{year}} {{name}}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,
    Apache2: `Apache License\nVersion 2.0, January 2004\n\nCopyright {{year}} {{name}}\n\nLicensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at\n\nhttp://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.`,
    GPL3: `GNU GENERAL PUBLIC LICENSE\nVersion 3, 29 June 2007\n\nCopyright (C) {{year}} {{name}}\n\nThis program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.\n\nThis program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.`,
    BSD2: `BSD 2-Clause License\n\nCopyright (c) {{year}}, {{name}}\nAll rights reserved.\n\nRedistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:\n1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.\n2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES ARE DISCLAIMED.`,
    ISC: `ISC License\n\nCopyright (c) {{year}}, {{name}}\n\nPermission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.\n\nTHE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES.`,
    Unlicense: `This is free and unencumbered software released into the public domain.\n\nAnyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.\n\nIn jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.`,
  };
  const output = (LICENSES[license]||"").replace(/{{year}}/g,String(year)).replace(/{{name}}/g,name);
  return (
    <ToolWrap>
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.keys(LICENSES).map(l=>(
          <button key={l} onClick={()=>setLicense(l)} className={`rounded-lg border px-3 py-1.5 text-sm ${license===l?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{l}</button>
        ))}
      </div>
      <div className="flex gap-3 mb-3">
        <input className="input-field flex-1" placeholder="Your name or company" value={name} onChange={e=>setName(e.target.value)} />
        <input type="number" className="input-field w-24" value={year} onChange={e=>setYear(+e.target.value)} />
      </div>
      <div className="relative">
        <textarea className="input-area h-48 pr-10 font-mono text-xs" readOnly value={output} />
        <CopyBtn text={output} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── Semantic Version Bumper ── */
export function SemverBumper() {
  const [version, setVersion] = useState("1.4.2");
  const parse = (v:string) => { const [ma,mi,pa]=(v.replace(/^v/,"").split(".").map(Number)); return isNaN(ma)?null:{major:ma,minor:mi||0,patch:pa||0}; };
  const p = parse(version);
  if (!p) return <ToolWrap><input className="input-field w-full" value={version} onChange={e=>setVersion(e.target.value)} placeholder="1.0.0" /></ToolWrap>;
  const bumps = { "patch": `${p.major}.${p.minor}.${p.patch+1}`, "minor": `${p.major}.${p.minor+1}.0`, "major": `${p.major+1}.0.0`, "pre-release": `${p.major}.${p.minor}.${p.patch}-alpha.1`, "build": `${p.major}.${p.minor}.${p.patch}+build.1` };
  return (
    <ToolWrap>
      <input className="input-field w-full font-mono text-lg mb-3" value={version} onChange={e=>setVersion(e.target.value)} placeholder="1.0.0" />
      <div className="grid gap-2 sm:grid-cols-2">
        {Object.entries(bumps).map(([type,val])=>(
          <div key={type} className="surface flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer hover:border-brand-400" onClick={()=>setVersion(val)}>
            <div><div className="text-xs text-muted capitalize">{type} bump</div><div className="font-mono text-lg font-bold">{val}</div></div>
            <CopyBtn text={val} />
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── UUID Generator (batch) ── */
export function UuidBatchGenerator() {
  const [count, setCount] = useState(10);
  const [fmt, setFmt] = useState<"v4"|"v7"|"short">("v4");
  const [uuids, setUuids] = useState<string[]>([]);
  const generate = () => {
    const list = Array.from({length:Math.min(count,100)},()=>{
      if (fmt==="v4") return crypto.randomUUID();
      if (fmt==="short") return crypto.randomUUID().replace(/-/g,"").slice(0,12);
      // v7 (timestamp-based)
      const ms=Date.now();const ts=ms.toString(16).padStart(12,"0");
      const r=crypto.randomUUID().replace(/-/g,"").slice(12);
      return `${ts.slice(0,8)}-${ts.slice(8,12)}-7${r.slice(0,3)}-${((parseInt(r[3],16)&0x3)|0x8).toString(16)}${r.slice(4,7)}-${r.slice(7,19)}`;
    });
    setUuids(list);
  };
  const all = uuids.join("\n");
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3 flex-wrap">
        <input type="number" className="input-field w-24" min={1} max={100} value={count} onChange={e=>setCount(+e.target.value)} />
        {(["v4","v7","short"] as const).map(f=>(
          <button key={f} onClick={()=>setFmt(f)} className={`rounded-lg border px-3 py-1.5 text-sm font-mono ${fmt===f?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{f}</button>
        ))}
        <button className="btn-primary" onClick={generate}>Generate</button>
        {all&&<CopyBtn text={all} />}
      </div>
      {uuids.length>0&&(
        <div className="max-h-56 overflow-auto space-y-1 font-mono text-xs">
          {uuids.map((u,i)=><div key={i} className="text-muted">{u}</div>)}
        </div>
      )}
    </ToolWrap>
  );
}

/* ── TOTP Generator ── */
export function TotpGenerator() {
  const [secret, setSecret] = useState("JBSWY3DPEHPK3PXP");
  const [otp, setOtp] = useState("");
  const [expires, setExpires] = useState(0);
  const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const b32decode = (s:string): Uint8Array => {
    const clean=s.toUpperCase().replace(/=+$/,"");let bits=0,val=0;const bytes:number[]=[];
    for(const c of clean){const v=BASE32_CHARS.indexOf(c);if(v<0)continue;val=(val<<5)|v;bits+=5;if(bits>=8){bytes.push((val>>(bits-8))&255);bits-=8;}}
    return new Uint8Array(bytes);
  };
  const generate = async () => {
    try {
      const counter=Math.floor(Date.now()/30000);
      const cBuf=new ArrayBuffer(8);new DataView(cBuf).setUint32(4,counter);
      const key=await crypto.subtle.importKey("raw",b32decode(secret).buffer as ArrayBuffer,{name:"HMAC",hash:"SHA-1"},false,["sign"]);
      const sig=await crypto.subtle.sign("HMAC",key,cBuf);
      const arr=new Uint8Array(sig);const offset=arr[19]&0xf;
      const code=((arr[offset]&0x7f)<<24|(arr[offset+1]&0xff)<<16|(arr[offset+2]&0xff)<<8|(arr[offset+3]&0xff))%1000000;
      setOtp(code.toString().padStart(6,"0"));
      setExpires(30-Math.floor(Date.now()/1000%30));
    } catch(e) { setOtp("⚠ "+( e as Error).message); }
  };
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3">
        <input className="input-field flex-1 font-mono uppercase tracking-widest" placeholder="Base32 secret key…" value={secret} onChange={e=>setSecret(e.target.value.toUpperCase())} />
        <button className="btn-primary" onClick={generate}>Generate OTP</button>
      </div>
      {otp&&(
        <div className="surface rounded-2xl border p-6 text-center">
          <div className="text-5xl font-black font-mono tracking-widest text-brand-600 mb-2">{otp.slice(0,3)} {otp.slice(3)}</div>
          <div className="text-sm text-muted">Expires in {expires}s · TOTP (RFC 6238)</div>
          <CopyBtn text={otp} />
        </div>
      )}
    </ToolWrap>
  );
}

/* ── HTTP Request Builder ── */
export function HttpRequestBuilder() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [headers, setHeaders] = useState([{k:"Content-Type",v:"application/json"},{k:"Accept",v:"application/json"}]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<number|null>(null);
  const [loading, setLoading] = useState(false);
  const send = async () => {
    setLoading(true);
    try {
      const h = Object.fromEntries(headers.filter(({k})=>k).map(({k,v})=>[k,v]));
      const opts: RequestInit = {method, headers:h};
      if (["POST","PUT","PATCH"].includes(method)&&body) opts.body=body;
      const r = await fetch(url, opts);
      setStatus(r.status);
      const ct = r.headers.get("content-type")||"";
      const text = await r.text();
      setResponse(ct.includes("json")?JSON.stringify(JSON.parse(text),null,2):text);
    } catch(e) { setResponse("⚠ "+( e as Error).message); setStatus(null); }
    setLoading(false);
  };
  const curl = `curl -X ${method}${headers.filter(h=>h.k).map(h=>` \\\n  -H "${h.k}: ${h.v}"`).join("")}${body?` \\\n  -d '${body}'`:""} \\\n  "${url}"`;
  return (
    <ToolWrap>
      <div className="flex gap-2 mb-3 flex-wrap">
        <select className="input-field w-28 font-mono font-bold" value={method} onChange={e=>setMethod(e.target.value)}>
          {["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS"].map(m=><option key={m}>{m}</option>)}
        </select>
        <input className="input-field flex-1 min-w-48 font-mono text-sm" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" />
        <button className="btn-primary" onClick={send} disabled={loading}>{loading?"…":"Send"}</button>
      </div>
      <div className="space-y-2 mb-3">
        {headers.map((h,i)=>(
          <div key={i} className="flex gap-2">
            <input className="input-field flex-1" placeholder="Header name" value={h.k} onChange={e=>setHeaders(headers.map((x,j)=>j===i?{...x,k:e.target.value}:x))} />
            <input className="input-field flex-1" placeholder="Value" value={h.v} onChange={e=>setHeaders(headers.map((x,j)=>j===i?{...x,v:e.target.value}:x))} />
            <button onClick={()=>setHeaders(headers.filter((_,j)=>j!==i))} className="text-muted hover:text-red-500 px-2">✕</button>
          </div>
        ))}
        <button onClick={()=>setHeaders([...headers,{k:"",v:""}])} className="text-sm text-brand-600 hover:underline">+ Add header</button>
      </div>
      {["POST","PUT","PATCH"].includes(method)&&<textarea className="input-area h-20 font-mono text-xs mb-3" placeholder='{"key": "value"}' value={body} onChange={e=>setBody(e.target.value)} />}
      {status&&<p className={`text-sm font-semibold mb-2 ${status<300?"text-green-600":status<400?"text-yellow-600":"text-red-500"}`}>HTTP {status}</p>}
      {response&&<div className="relative"><textarea className="input-area h-48 pr-10 font-mono text-xs" readOnly value={response} /><CopyBtn text={response} absolute /></div>}
      <details className="mt-3"><summary className="text-xs text-muted cursor-pointer">View as cURL</summary><pre className="mt-2 rounded-xl bg-[var(--surface-2)] border p-3 font-mono text-xs overflow-auto">{curl}</pre></details>
    </ToolWrap>
  );
}
