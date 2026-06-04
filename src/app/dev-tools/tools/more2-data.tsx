"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* CSV parsing that respects quotes */
function parseCSV(text: string, delim = ","): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cur = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === delim) { row.push(cur); cur = ""; }
      else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else if (c === "\r") { /* skip */ }
      else cur += c;
    }
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.length > 1 || r[0] !== "");
}
const csvCell = (v: string) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

/* ── CSV → JSON ── */
export function CsvToJson() {
  const [text, setText] = useState("name,age,city\nAlice,30,NYC\nBob,25,LA");
  const [header, setHeader] = useState(true);
  let out = "";
  try {
    const rows = parseCSV(text);
    if (!rows.length) out = "[]";
    else if (header) {
      const [head, ...rest] = rows;
      out = JSON.stringify(rest.map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""]))), null, 2);
    } else out = JSON.stringify(rows, null, 2);
  } catch (e) { out = "Error: " + (e as Error).message; }
  return (
    <ToolWrap>
      <label className="text-sm flex items-center gap-2 mb-3"><input type="checkbox" checked={header} onChange={e => setHeader(e.target.checked)} /> First row is header</label>
      <div className="grid gap-3 sm:grid-cols-2">
        <textarea className="input-area w-full font-mono text-xs" rows={8} value={text} onChange={e => setText(e.target.value)} />
        <div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={8} value={out} /><CopyBtn text={out} absolute /></div>
      </div>
    </ToolWrap>
  );
}

/* ── JSON → CSV ── */
export function JsonToCsv() {
  const [text, setText] = useState('[\n  {"name":"Alice","age":30},\n  {"name":"Bob","age":25}\n]');
  let out = "";
  try {
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : [data];
    const keys = [...new Set(arr.flatMap((o: object) => Object.keys(o ?? {})))];
    out = [keys.map(csvCell).join(","), ...arr.map((o: Record<string, unknown>) => keys.map(k => csvCell(String(o?.[k] ?? ""))).join(","))].join("\n");
  } catch (e) { out = "Error: " + (e as Error).message; }
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2">
        <textarea className="input-area w-full font-mono text-xs" rows={8} value={text} onChange={e => setText(e.target.value)} />
        <div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={8} value={out} /><CopyBtn text={out} absolute /></div>
      </div>
    </ToolWrap>
  );
}

/* ── JSON → XML ── */
function toXml(obj: unknown, name = "root", indent = ""): string {
  if (obj === null || obj === undefined) return `${indent}<${name}/>`;
  if (Array.isArray(obj)) return obj.map(item => toXml(item, name, indent)).join("\n");
  if (typeof obj === "object") {
    const inner = Object.entries(obj).map(([k, v]) => toXml(v, k.replace(/[^\w.-]/g, "_"), indent + "  ")).join("\n");
    return `${indent}<${name}>\n${inner}\n${indent}</${name}>`;
  }
  const esc = String(obj).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `${indent}<${name}>${esc}</${name}>`;
}
export function JsonToXml() {
  const [text, setText] = useState('{\n  "user": { "name": "Alice", "roles": ["admin","editor"] }\n}');
  let out = "";
  try { out = '<?xml version="1.0" encoding="UTF-8"?>\n' + toXml(JSON.parse(text)); }
  catch (e) { out = "Error: " + (e as Error).message; }
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2">
        <textarea className="input-area w-full font-mono text-xs" rows={8} value={text} onChange={e => setText(e.target.value)} />
        <div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={8} value={out} /><CopyBtn text={out} absolute /></div>
      </div>
    </ToolWrap>
  );
}

/* ── SQL INSERT Generator ── */
export function SqlInsertGenerator() {
  const [text, setText] = useState('[\n  {"id":1,"name":"Alice"},\n  {"id":2,"name":"Bob"}\n]');
  const [table, setTable] = useState("users");
  let out = "";
  try {
    const arr = JSON.parse(text);
    const rows = Array.isArray(arr) ? arr : [arr];
    const keys = [...new Set(rows.flatMap((o: object) => Object.keys(o ?? {})))];
    const lit = (v: unknown) => v === null || v === undefined ? "NULL" : typeof v === "number" ? String(v) : typeof v === "boolean" ? (v ? "1" : "0") : `'${String(v).replace(/'/g, "''")}'`;
    out = rows.map((o: Record<string, unknown>) => `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map(k => lit(o?.[k])).join(", ")});`).join("\n");
  } catch (e) { out = "Error: " + (e as Error).message; }
  return (
    <ToolWrap>
      <label className="text-sm flex items-center gap-2 mb-3">Table name: <input className="input-field w-48 font-mono" value={table} onChange={e => setTable(e.target.value)} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <textarea className="input-area w-full font-mono text-xs" rows={8} value={text} onChange={e => setText(e.target.value)} />
        <div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={8} value={out} /><CopyBtn text={out} absolute /></div>
      </div>
    </ToolWrap>
  );
}

/* ── cURL → fetch() ── */
export function CurlConverter() {
  const [text, setText] = useState(`curl -X POST https://api.example.com/users -H "Content-Type: application/json" -d '{"name":"Alice"}'`);
  const convert = (curl: string) => {
    const tokens = curl.replace(/\\\n/g, " ").match(/'[^']*'|"[^"]*"|\S+/g) ?? [];
    let url = "", method = "GET", body: string | null = null;
    const headers: Record<string, string> = {};
    const unq = (s: string) => s.replace(/^['"]|['"]$/g, "");
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t === "-X" || t === "--request") method = unq(tokens[++i] ?? "GET");
      else if (t === "-H" || t === "--header") { const h = unq(tokens[++i] ?? ""); const idx = h.indexOf(":"); if (idx > 0) headers[h.slice(0, idx).trim()] = h.slice(idx + 1).trim(); }
      else if (t === "-d" || t === "--data" || t === "--data-raw") { body = unq(tokens[++i] ?? ""); if (method === "GET") method = "POST"; }
      else if (/^https?:\/\//.test(unq(t))) url = unq(t);
    }
    const opts: string[] = [`  method: ${JSON.stringify(method)}`];
    if (Object.keys(headers).length) opts.push(`  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")}`);
    if (body) opts.push(`  body: ${JSON.stringify(body)}`);
    return `fetch(${JSON.stringify(url)}, {\n${opts.join(",\n")}\n})\n  .then(r => r.json())\n  .then(console.log);`;
  };
  let out = "";
  try { out = convert(text); } catch (e) { out = "Error: " + (e as Error).message; }
  return (
    <ToolWrap>
      <textarea className="input-area w-full font-mono text-xs mb-3" rows={3} value={text} onChange={e => setText(e.target.value)} placeholder="Paste a curl command…" />
      <div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={9} value={out} /><CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── Mock Data Generator ── */
const FIRST = ["Alice","Bob","Carol","David","Eve","Frank","Grace","Heidi","Ivan","Judy","Mallory","Niaj","Olivia","Peggy","Rupert","Sybil","Trent","Victor","Walter","Wendy"];
const LAST = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Lee","Walker","Hall","Allen","Young","King","Wright","Scott","Green","Baker"];
const DOMAINS = ["example.com","test.org","demo.net","mail.io","corp.co"];
const CITIES = ["New York","London","Tokyo","Paris","Berlin","Sydney","Toronto","Madrid","Rome","Dubai"];
export function MockDataGenerator() {
  const [count, setCount] = useState(5);
  const [, force] = useState(0);
  const rnd = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  const data = Array.from({ length: Math.min(count, 100) }, (_, i) => {
    const f = rnd(FIRST), l = rnd(LAST);
    return { id: i + 1, firstName: f, lastName: l, email: `${f.toLowerCase()}.${l.toLowerCase()}@${rnd(DOMAINS)}`, age: 18 + Math.floor(Math.random() * 50), city: rnd(CITIES), active: Math.random() > 0.5 };
  });
  const out = JSON.stringify(data, null, 2);
  return (
    <ToolWrap>
      <div className="flex items-center gap-3 mb-3">
        <label className="text-sm flex items-center gap-2">Records: <input type="number" min={1} max={100} className="input-field w-24" value={count} onChange={e => setCount(Math.min(100, +e.target.value))} /></label>
        <button onClick={() => force(n => n + 1)} className="rounded-lg border surface px-3 py-1.5 text-sm">↻ Regenerate</button>
      </div>
      <div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={10} value={out} /><CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── JSON Flatten / Unflatten ── */
function flatten(obj: unknown, prefix = "", res: Record<string, unknown> = {}): Record<string, unknown> {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj)) flatten(v, prefix ? `${prefix}.${k}` : k, res);
  } else if (Array.isArray(obj)) {
    obj.forEach((v, i) => flatten(v, `${prefix}[${i}]`, res));
  } else res[prefix] = obj;
  return res;
}
export function JsonFlatten() {
  const [text, setText] = useState('{\n  "user": { "name": "Alice", "address": { "city": "NYC" } },\n  "tags": ["a","b"]\n}');
  let out = "";
  try { out = JSON.stringify(flatten(JSON.parse(text)), null, 2); }
  catch (e) { out = "Error: " + (e as Error).message; }
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2">
        <textarea className="input-area w-full font-mono text-xs" rows={8} value={text} onChange={e => setText(e.target.value)} />
        <div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={8} value={out} /><CopyBtn text={out} absolute /></div>
      </div>
    </ToolWrap>
  );
}

/* ── ASCII Tree Generator ── */
export function AsciiTreeGenerator() {
  const [text, setText] = useState("src\n  app\n    page.tsx\n    layout.tsx\n  components\n    button.tsx\npackage.json");
  const build = (input: string) => {
    const items = input.split("\n").filter(l => l.trim()).map(l => ({ depth: Math.floor((l.length - l.trimStart().length) / 2), name: l.trim() }));
    // For each depth d, is there a later sibling before the branch closes?
    const hasLaterSibling = (i: number, d: number) => {
      for (let j = i + 1; j < items.length; j++) {
        if (items[j].depth < d) return false;
        if (items[j].depth === d) return true;
      }
      return false;
    };
    return items.map((it, i) => {
      let prefix = "";
      for (let d = 0; d < it.depth - 1; d++) prefix += hasLaterSibling(i, d) ? "│   " : "    ";
      if (it.depth > 0) prefix += hasLaterSibling(i, it.depth - 1) ? "├── " : "└── ";
      return prefix + it.name;
    }).join("\n");
  };
  const out = build(text);
  return (
    <ToolWrap>
      <p className="text-xs text-muted mb-2">Indent children with 2 spaces per level.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <textarea className="input-area w-full font-mono text-xs" rows={9} value={text} onChange={e => setText(e.target.value)} />
        <div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={9} value={out} /><CopyBtn text={out} absolute /></div>
      </div>
    </ToolWrap>
  );
}

/* ── JWT Builder (HS256) ── */
function b64url(buf: ArrayBuffer | Uint8Array | string) {
  let bytes: Uint8Array;
  if (typeof buf === "string") bytes = new TextEncoder().encode(buf);
  else bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  const s = btoa(String.fromCharCode(...bytes));
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function JwtBuilder() {
  const [payload, setPayload] = useState('{\n  "sub": "1234567890",\n  "name": "Alice",\n  "iat": 1700000000\n}');
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const sign = async () => {
    setErr("");
    try {
      const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const body = b64url(JSON.stringify(JSON.parse(payload)));
      const data = `${header}.${body}`;
      const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
      setToken(`${data}.${b64url(sig)}`);
    } catch (e) { setErr((e as Error).message); setToken(""); }
  };
  return (
    <ToolWrap>
      <p className="text-xs font-semibold text-muted mb-1">Payload (JSON)</p>
      <textarea className="input-area w-full font-mono text-xs mb-3" rows={5} value={payload} onChange={e => setPayload(e.target.value)} />
      <label className="text-sm block mb-3">Secret: <input className="input-field w-full font-mono mt-1" value={secret} onChange={e => setSecret(e.target.value)} /></label>
      <button onClick={sign} className="rounded-lg border border-brand-500 bg-brand-500/10 text-brand-600 px-4 py-2 text-sm font-semibold mb-3">Sign JWT (HS256)</button>
      {err && <p className="text-sm text-red-500 mb-2">{err}</p>}
      {token && <div className="relative surface rounded-xl border p-3 font-mono text-xs break-all">{token}<CopyBtn text={token} absolute /></div>}
    </ToolWrap>
  );
}
