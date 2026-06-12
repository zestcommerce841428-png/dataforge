"use client";

import { useState, useMemo } from "react";

/* ─── 1. UUID v1/v4/v7 Generator (gitopentools merge, enhanced) ──────── */
function uuidv4() { return crypto.randomUUID(); }
function uuidv7() {
  const ms = BigInt(Date.now());
  const randoms = new Uint8Array(10);
  crypto.getRandomValues(randoms);
  const hex = ms.toString(16).padStart(12, "0");
  const r = Array.from(randoms).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-7${r.slice(0,3)}-${((randoms[3] & 0x3f) | 0x80).toString(16)}${r.slice(4,7)}-${r.slice(7,19)}`;
}
function uuidv1() {
  const now = Date.now();
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  const hi = Math.floor(now / 0x100000000);
  const lo = now & 0xffffffff;
  const ts = ((BigInt(hi) * 10000n) + BigInt(lo) * 10000n + 122192928000000000n);
  const tsHex = ts.toString(16).padStart(16, "0");
  return `${tsHex.slice(7,15)}-${tsHex.slice(3,7)}-1${tsHex.slice(0,3)}-${((buf[8] & 0x3f) | 0x80).toString(16)}${buf[9].toString(16).padStart(2,"0")}-${Array.from(buf.slice(10)).map((b)=>b.toString(16).padStart(2,"0")).join("")}`;
}

export function UuidGeneratorEnhanced() {
  const [version, setVersion] = useState<"v1"|"v4"|"v7">("v4");
  const [qty, setQty] = useState(5);
  const [format, setFormat] = useState<"standard"|"upper"|"no-hyphens"|"braces"|"urn">("standard");
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState<number|null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  function applyFormat(id: string) {
    switch (format) {
      case "upper": return id.toUpperCase();
      case "no-hyphens": return id.replace(/-/g, "");
      case "braces": return `{${id}}`;
      case "urn": return `urn:uuid:${id}`;
      default: return id;
    }
  }

  function generate() {
    const gen = version === "v1" ? uuidv1 : version === "v7" ? uuidv7 : uuidv4;
    setUuids(Array.from({ length: qty }, () => applyFormat(gen())));
    setCopied(null); setCopiedAll(false);
  }

  async function copy(i: number) {
    await navigator.clipboard.writeText(uuids[i]);
    setCopied(i); setTimeout(() => setCopied(null), 1500);
  }

  async function copyAll() {
    await navigator.clipboard.writeText(uuids.join("\n"));
    setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(["v1","v4","v7"] as const).map((v) => (
          <button key={v} type="button" onClick={() => setVersion(v)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${version === v ? "border-brand-500 bg-brand-500/10 text-brand-600" : "border-app hover:bg-[var(--surface-2)] text-muted"}`}>
            UUID {v} {v==="v4"?"(random)":v==="v7"?"(ordered)":"(time)"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2.5 text-sm">
            <option value="standard">Standard</option>
            <option value="upper">UPPERCASE</option>
            <option value="no-hyphens">No hyphens</option>
            <option value="braces">With braces {"{}"}</option>
            <option value="urn">URN prefix</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Quantity (1–100)</label>
          <input type="number" min={1} max={100} value={qty} onChange={(e) => setQty(Math.min(100, Math.max(1, +e.target.value)))}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2.5 text-sm" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={generate} className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Generate
        </button>
        {uuids.length > 0 && (
          <button onClick={copyAll} className="rounded-xl border border-app px-5 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]">
            {copiedAll ? "✓ Copied" : "Copy all"}
          </button>
        )}
      </div>
      {uuids.length > 0 && (
        <div className="max-h-64 overflow-y-auto rounded-xl border border-app bg-[var(--surface-2)] p-3 space-y-1">
          {uuids.map((u, i) => (
            <div key={i} className="flex items-center gap-2">
              <code className="flex-1 font-mono text-xs">{u}</code>
              <button onClick={() => copy(i)} className="shrink-0 rounded border border-app px-2 py-0.5 text-[10px]">
                {copied === i ? "✓" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── 2. Enhanced URL Validator (gitopentools merge) ─────────────────── */
export function UrlValidatorEnhanced() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<{
    valid: boolean; parsed?: URL; accessible?: boolean; status?: number; latency?: number; error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function validate() {
    setLoading(true); setResult(null);
    let parsed: URL | undefined;
    try {
      parsed = new URL(url.startsWith("http") ? url : "https://" + url);
    } catch {
      setResult({ valid: false, error: "Invalid URL format" });
      setLoading(false); return;
    }
    const start = Date.now();
    try {
      const res = await fetch(`/api/og-check?url=${encodeURIComponent(parsed.href)}`, { signal: AbortSignal.timeout(10000) });
      const data = await res.json();
      setResult({ valid: true, parsed, accessible: data.ok !== false, status: data.status, latency: Date.now() - start });
    } catch {
      setResult({ valid: true, parsed, accessible: false, error: "Could not reach URL" });
    } finally {
      setLoading(false);
    }
  }

  const r = result;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && validate()}
          className="flex-1 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          placeholder="https://example.com/path?q=value" />
        <button onClick={validate} disabled={loading || !url}
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {loading ? "…" : "Check"}
        </button>
      </div>
      {r && (
        <div className="space-y-3">
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${r.valid ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"}`}>
            {r.valid ? "✓ Valid URL format" : `✗ ${r.error}`}
            {r.status && <span className="ml-auto font-mono">HTTP {r.status}</span>}
            {r.latency && <span className="text-muted">{r.latency}ms</span>}
          </div>
          {r.parsed && (
            <div className="grid gap-2 rounded-xl border border-app bg-[var(--surface-2)] p-4 text-sm">
              {[["Protocol", r.parsed.protocol.replace(":","")||"—"],
                ["Host", r.parsed.hostname||"—"],
                ["Port", r.parsed.port||"(default)"],
                ["Path", r.parsed.pathname||"/"],
                ["Query", r.parsed.search||"—"],
                ["Hash", r.parsed.hash||"—"],
                ["Secure", r.parsed.protocol==="https:"?"Yes":"No"],
              ].map(([k,v]) => (
                <div key={k} className="grid grid-cols-3 gap-2">
                  <span className="text-muted">{k}</span>
                  <code className="col-span-2 font-mono text-xs">{v}</code>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── 3. OpenAPI / JSON Schema Validator ─────────────────────────────── */
export function JsonSchemaValidator() {
  const [schema, setSchema] = useState(`{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age":  { "type": "number", "minimum": 0 }
  },
  "required": ["name"]
}`);
  const [data, setData] = useState(`{"name": "Alice", "age": 30}`);
  const [result, setResult] = useState<{ valid: boolean; errors: string[] } | null>(null);

  function validate() {
    try {
      const s = JSON.parse(schema);
      const d = JSON.parse(data);
      const errors: string[] = [];
      // Basic structural validation (type, required, minimum)
      if (s.required) {
        for (const req of s.required as string[]) {
          if (!(req in d)) errors.push(`Missing required field: "${req}"`);
        }
      }
      if (s.properties && s.type === "object") {
        for (const [key, def] of Object.entries(s.properties as Record<string, { type?: string; minimum?: number; maximum?: number }>)) {
          if (!(key in d)) continue;
          if (def.type && typeof d[key] !== def.type) errors.push(`"${key}" should be ${def.type}, got ${typeof d[key]}`);
          if (def.minimum !== undefined && d[key] < def.minimum) errors.push(`"${key}" must be ≥ ${def.minimum}`);
          if (def.maximum !== undefined && d[key] > def.maximum) errors.push(`"${key}" must be ≤ ${def.maximum}`);
        }
      }
      setResult({ valid: errors.length === 0, errors });
    } catch (e) {
      setResult({ valid: false, errors: [(e as Error).message] });
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">JSON Schema</label>
          <textarea value={schema} onChange={(e) => setSchema(e.target.value)} rows={10}
            className="w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 font-mono text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Data (JSON)</label>
          <textarea value={data} onChange={(e) => setData(e.target.value)} rows={10}
            className="w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 font-mono text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
        </div>
      </div>
      <button onClick={validate} className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
        Validate
      </button>
      {result && (
        <div className={`rounded-xl px-4 py-3 text-sm ${result.valid ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"}`}>
          {result.valid ? "✅ Valid — data matches schema!" : (
            <><strong>❌ Invalid:</strong><ul className="mt-2 list-disc pl-5 space-y-1">{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul></>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── 4. Fake Data Generator ─────────────────────────────────────────── */
const FAKE_FIRST = ["Alice","Bob","Charlie","Diana","Eve","Frank","Grace","Hank","Iris","Jack","Karen","Liam","Mia","Noah","Olivia","Paul","Quinn","Rose","Sam","Tara"];
const FAKE_LAST  = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Wilson","Moore","Taylor","Anderson","Thomas","Jackson","White","Harris","Martin"];
const FAKE_DOMAIN = ["gmail.com","yahoo.com","outlook.com","icloud.com","proton.me","example.com"];
const FAKE_COMPANY = ["Acme Corp","Globex","Initech","Umbrella","Stark Industries","Wayne Enterprises","Oscorp","Cyberdyne","Weyland-Yutani","Duff Beer Co"];
const FAKE_JOB = ["Software Engineer","Product Manager","Designer","Data Scientist","DevOps Engineer","Marketing Lead","QA Engineer","CTO","Backend Developer","Frontend Developer"];
const FAKE_STREETS = ["Main St","Oak Ave","Maple Dr","Cedar Ln","Elm Blvd","Pine Way","Willow Ct","Birch Rd","Cherry St","Walnut Ave"];
const FAKE_CITIES = ["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","San Jose","Austin","Jacksonville","Fort Worth","Columbus","Charlotte"];
const FAKE_COUNTRIES = ["USA","Canada","UK","Germany","France","Australia","Japan","India","Brazil","Mexico"];

type FakeField = "fullName"|"email"|"phone"|"company"|"jobTitle"|"address"|"dob"|"username"|"ipv4"|"color"|"uuid";

const FIELD_OPTIONS: { value: FakeField; label: string }[] = [
  { value: "fullName", label: "Full Name" },
  { value: "email",    label: "Email" },
  { value: "phone",    label: "Phone" },
  { value: "company",  label: "Company" },
  { value: "jobTitle", label: "Job Title" },
  { value: "address",  label: "Address" },
  { value: "dob",      label: "Date of Birth" },
  { value: "username", label: "Username" },
  { value: "ipv4",     label: "IPv4 Address" },
  { value: "color",    label: "Hex Color" },
  { value: "uuid",     label: "UUID v4" },
];

function rnd<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function rndNum(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function fakeValue(field: FakeField): string {
  switch (field) {
    case "fullName": return `${rnd(FAKE_FIRST)} ${rnd(FAKE_LAST)}`;
    case "email":    return `${rnd(FAKE_FIRST).toLowerCase()}.${rnd(FAKE_LAST).toLowerCase()}${rndNum(1,99)}@${rnd(FAKE_DOMAIN)}`;
    case "phone":    return `+1 (${rndNum(200,999)}) ${rndNum(100,999)}-${rndNum(1000,9999)}`;
    case "company":  return rnd(FAKE_COMPANY);
    case "jobTitle": return rnd(FAKE_JOB);
    case "address":  return `${rndNum(1,9999)} ${rnd(FAKE_STREETS)}, ${rnd(FAKE_CITIES)}, ${rnd(FAKE_COUNTRIES)}`;
    case "dob":      return new Date(Date.now() - rndNum(18*365, 65*365) * 86400000).toLocaleDateString("en-US");
    case "username": return `${rnd(FAKE_FIRST).toLowerCase()}${rnd(FAKE_LAST).toLowerCase().slice(0,4)}${rndNum(10,99)}`;
    case "ipv4":     return `${rndNum(1,254)}.${rndNum(0,255)}.${rndNum(0,255)}.${rndNum(1,254)}`;
    case "color":    return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6,"0")}`;
    case "uuid":     return crypto.randomUUID();
  }
}

export function FakeDataGenerator() {
  const [fields, setFields] = useState<FakeField[]>(["fullName","email","phone","company"]);
  const [qty, setQty] = useState(5);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [outputFmt, setOutputFmt] = useState<"table"|"json"|"csv">("table");
  const [copied, setCopied] = useState(false);

  function generate() {
    setRows(Array.from({ length: qty }, () => Object.fromEntries(fields.map((f) => [f, fakeValue(f)]))));
    setCopied(false);
  }

  function toggleField(f: FakeField) {
    setFields((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  }

  const exportText = useMemo(() => {
    if (rows.length === 0) return "";
    if (outputFmt === "json") return JSON.stringify(rows, null, 2);
    if (outputFmt === "csv") {
      const header = fields.join(",");
      const body = rows.map((r) => fields.map((f) => `"${r[f]}"`).join(",")).join("\n");
      return `${header}\n${body}`;
    }
    return "";
  }, [rows, fields, outputFmt]);

  async function copy() {
    await navigator.clipboard.writeText(exportText);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">Fields</p>
        <div className="flex flex-wrap gap-2">
          {FIELD_OPTIONS.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => toggleField(value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${fields.includes(value) ? "border-brand-500 bg-brand-500/10 text-brand-600" : "border-app text-muted hover:bg-[var(--surface-2)]"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Rows</span>
          <input type="number" min={1} max={100} value={qty} onChange={(e) => setQty(Math.min(100, Math.max(1, +e.target.value)))}
            className="w-20 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Format</span>
          <select value={outputFmt} onChange={(e) => setOutputFmt(e.target.value as typeof outputFmt)}
            className="rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm">
            <option value="table">Table</option>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>
      <button onClick={generate} disabled={fields.length === 0}
        className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
        Generate
      </button>
      {rows.length > 0 && outputFmt === "table" && (
        <div className="overflow-x-auto rounded-xl border border-app">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-2)]">
              <tr>{fields.map((f) => <th key={f} className="px-4 py-2 text-left text-xs font-semibold text-muted capitalize">{f}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-app">
                  {fields.map((f) => <td key={f} className="px-4 py-2 text-xs">{row[f]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows.length > 0 && outputFmt !== "table" && (
        <div className="relative">
          <textarea readOnly value={exportText} rows={10}
            className="w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] px-4 py-3 font-mono text-xs" />
          <button onClick={copy} className="absolute right-3 top-3 rounded-lg border border-app bg-[var(--bg-base)] px-3 py-1.5 text-xs">
            {copied ? "✓" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── 5. HTTP Status Code Reference ─────────────────────────────────── */
const HTTP_CODES: { code: number; name: string; desc: string }[] = [
  {code:100,name:"Continue",desc:"Server received request, client should proceed"},
  {code:101,name:"Switching Protocols",desc:"Server switching to requested protocol"},
  {code:200,name:"OK",desc:"Request succeeded"},
  {code:201,name:"Created",desc:"Request succeeded, resource created"},
  {code:204,name:"No Content",desc:"Request succeeded, no body returned"},
  {code:206,name:"Partial Content",desc:"Partial resource delivered (range request)"},
  {code:301,name:"Moved Permanently",desc:"Resource permanently moved to new URL"},
  {code:302,name:"Found",desc:"Resource temporarily at different URL"},
  {code:304,name:"Not Modified",desc:"Resource unchanged since last request"},
  {code:307,name:"Temporary Redirect",desc:"Temporary redirect preserving method"},
  {code:308,name:"Permanent Redirect",desc:"Permanent redirect preserving method"},
  {code:400,name:"Bad Request",desc:"Request invalid due to client error"},
  {code:401,name:"Unauthorized",desc:"Authentication required"},
  {code:403,name:"Forbidden",desc:"Authenticated but not authorized"},
  {code:404,name:"Not Found",desc:"Resource does not exist"},
  {code:405,name:"Method Not Allowed",desc:"HTTP method not supported for this resource"},
  {code:409,name:"Conflict",desc:"Request conflicts with current server state"},
  {code:410,name:"Gone",desc:"Resource permanently deleted"},
  {code:422,name:"Unprocessable Entity",desc:"Request well-formed but semantic errors"},
  {code:429,name:"Too Many Requests",desc:"Rate limit exceeded"},
  {code:500,name:"Internal Server Error",desc:"Generic server-side error"},
  {code:502,name:"Bad Gateway",desc:"Invalid response from upstream server"},
  {code:503,name:"Service Unavailable",desc:"Server temporarily unavailable"},
  {code:504,name:"Gateway Timeout",desc:"Upstream server timed out"},
];

function codeColor(code: number) {
  if (code < 200) return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  if (code < 300) return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";
  if (code < 400) return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";
  if (code < 500) return "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400";
  return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";
}

export function HttpStatusReference() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => HTTP_CODES.filter(
    ({ code, name, desc }) =>
      code.toString().includes(q) || name.toLowerCase().includes(q.toLowerCase()) || desc.toLowerCase().includes(q.toLowerCase())
  ), [q]);

  return (
    <div className="space-y-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search codes, names…"
        className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filtered.map(({ code, name, desc }) => (
          <div key={code} className="flex items-start gap-3 rounded-xl border border-app px-4 py-3">
            <span className={`shrink-0 rounded-lg px-2.5 py-1 font-mono text-sm font-bold ${codeColor(code)}`}>{code}</span>
            <div>
              <p className="text-sm font-semibold">{name}</p>
              <p className="text-xs text-muted">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 6. Webhook / HTTP Request Tester (no-CORS, shows request details) */
export function WebhookTester() {
  const [method, setMethod] = useState("POST");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState('{\n  "event": "test",\n  "timestamp": ' + Date.now() + "\n}");
  const [headers, setHeaders] = useState("Content-Type: application/json\nAccept: application/json");
  const [response, setResponse] = useState<{ status: number; body: string; headers: Record<string, string>; latency: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function send() {
    setErr(""); setResponse(null); setLoading(true);
    try {
      const parsedHeaders: Record<string, string> = {};
      for (const line of headers.split("\n")) {
        const [k, ...v] = line.split(":");
        if (k && v.length) parsedHeaders[k.trim()] = v.join(":").trim();
      }
      const start = Date.now();
      const res = await fetch(url, {
        method,
        headers: parsedHeaders,
        body: ["GET","HEAD"].includes(method) ? undefined : body,
        signal: AbortSignal.timeout(15000),
      });
      const latency = Date.now() - start;
      const resBody = await res.text();
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });
      setResponse({ status: res.status, body: resBody, headers: resHeaders, latency });
    } catch (e) {
      setErr((e as Error).message + " (CORS may be blocking — use a CORS proxy for cross-origin testing)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select value={method} onChange={(e) => setMethod(e.target.value)}
          className="rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2.5 text-sm font-mono font-semibold">
          {["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS"].map((m) => <option key={m}>{m}</option>)}
        </select>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint"
          className="flex-1 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Headers (Key: Value per line)</label>
        <textarea value={headers} onChange={(e) => setHeaders(e.target.value)} rows={3}
          className="w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 font-mono text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
      </div>
      {!["GET","HEAD"].includes(method) && (
        <div>
          <label className="mb-1 block text-sm font-medium">Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6}
            className="w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 font-mono text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
        </div>
      )}
      <button onClick={send} disabled={loading || !url}
        className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
        {loading ? "Sending…" : `Send ${method} request`}
      </button>
      {err && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">{err}</div>}
      {response && (
        <div className="space-y-3">
          <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${response.status < 400 ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"}`}>
            <span>HTTP {response.status}</span>
            <span className="ml-auto font-normal text-muted">{response.latency}ms</span>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-muted uppercase tracking-wide">Response Body</p>
            <pre className="max-h-48 overflow-auto rounded-xl border border-app bg-[var(--surface-2)] p-4 text-xs font-mono whitespace-pre-wrap">
              {(() => { try { return JSON.stringify(JSON.parse(response.body), null, 2); } catch { return response.body; } })()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 7. Nginx Config Generator ──────────────────────────────────────── */
export function NginxConfigGenerator() {
  const [domain, setDomain] = useState("example.com");
  const [port, setPort] = useState("3000");
  const [ssl, setSsl] = useState(true);
  const [type, setType] = useState<"proxy"|"static"|"spa">("proxy");
  const [copied, setCopied] = useState(false);

  const config = useMemo(() => {
    const lines: string[] = [];
    if (ssl) {
      lines.push(`server {`);
      lines.push(`    listen 80;`);
      lines.push(`    server_name ${domain} www.${domain};`);
      lines.push(`    return 301 https://$host$request_uri;`);
      lines.push(`}`);
      lines.push(``);
    }
    lines.push(`server {`);
    lines.push(ssl ? `    listen 443 ssl http2;` : `    listen 80;`);
    lines.push(`    server_name ${domain} www.${domain};`);
    if (ssl) {
      lines.push(`    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;`);
      lines.push(`    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;`);
      lines.push(`    ssl_protocols TLSv1.2 TLSv1.3;`);
      lines.push(`    ssl_ciphers HIGH:!aNULL:!MD5;`);
    }
    lines.push(``);
    lines.push(`    # Security headers`);
    lines.push(`    add_header X-Frame-Options "SAMEORIGIN" always;`);
    lines.push(`    add_header X-Content-Type-Options "nosniff" always;`);
    lines.push(`    add_header Referrer-Policy "strict-origin-when-cross-origin" always;`);
    lines.push(``);
    if (type === "proxy") {
      lines.push(`    location / {`);
      lines.push(`        proxy_pass http://127.0.0.1:${port};`);
      lines.push(`        proxy_http_version 1.1;`);
      lines.push(`        proxy_set_header Upgrade $http_upgrade;`);
      lines.push(`        proxy_set_header Connection 'upgrade';`);
      lines.push(`        proxy_set_header Host $host;`);
      lines.push(`        proxy_cache_bypass $http_upgrade;`);
      lines.push(`        proxy_set_header X-Real-IP $remote_addr;`);
      lines.push(`        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`);
      lines.push(`        proxy_set_header X-Forwarded-Proto $scheme;`);
      lines.push(`    }`);
    } else if (type === "static") {
      lines.push(`    root /var/www/${domain}/html;`);
      lines.push(`    index index.html index.htm;`);
      lines.push(`    location / {`);
      lines.push(`        try_files $uri $uri/ =404;`);
      lines.push(`    }`);
    } else {
      lines.push(`    root /var/www/${domain}/html;`);
      lines.push(`    index index.html;`);
      lines.push(`    location / {`);
      lines.push(`        try_files $uri $uri/ /index.html;`);
      lines.push(`    }`);
    }
    lines.push(`}`);
    return lines.join("\n");
  }, [domain, port, ssl, type]);

  async function copy() {
    await navigator.clipboard.writeText(config);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Domain</label>
          <input value={domain} onChange={(e) => setDomain(e.target.value)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">App Port (proxy only)</label>
          <input value={port} onChange={(e) => setPort(e.target.value)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Type:</span>
          {(["proxy","static","spa"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${type === t ? "border-brand-500 bg-brand-500/10 text-brand-600" : "border-app text-muted hover:bg-[var(--surface-2)]"}`}>
              {t === "proxy" ? "Reverse Proxy" : t === "static" ? "Static Files" : "SPA (React/Next)"}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={ssl} onChange={(e) => setSsl(e.target.checked)} className="accent-brand-600" />
          Enable SSL (Let&apos;s Encrypt)
        </label>
      </div>
      <div className="relative">
        <pre className="max-h-80 overflow-auto rounded-xl border border-app bg-[var(--surface-2)] p-4 text-xs font-mono">
          {config}
        </pre>
        <button onClick={copy} className="absolute right-3 top-3 rounded-lg border border-app bg-[var(--bg-base)] px-3 py-1.5 text-xs">
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/* ─── 8. Docker Compose Generator ────────────────────────────────────── */
type Service = { name: string; image: string; port: string; env: string };

export function DockerComposeGenerator() {
  const [services, setServices] = useState<Service[]>([
    { name: "app", image: "node:20-alpine", port: "3000:3000", env: "NODE_ENV=production" },
  ]);
  const [version, setVersion] = useState("3.9");
  const [copied, setCopied] = useState(false);

  function add() {
    setServices((prev) => [...prev, { name: `service${prev.length + 1}`, image: "", port: "", env: "" }]);
  }
  function remove(i: number) { setServices((prev) => prev.filter((_, idx) => idx !== i)); }
  function update(i: number, key: keyof Service, val: string) {
    setServices((prev) => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s));
  }

  const yaml = useMemo(() => {
    const lines = [`version: '${version}'`, `services:`];
    for (const svc of services) {
      lines.push(`  ${svc.name || "service"}:`);
      if (svc.image) lines.push(`    image: ${svc.image}`);
      if (svc.port) lines.push(`    ports:\n      - "${svc.port}"`);
      const envVars = svc.env.split("\n").filter(Boolean);
      if (envVars.length) {
        lines.push(`    environment:`);
        envVars.forEach((e) => lines.push(`      - ${e}`));
      }
      lines.push(`    restart: unless-stopped`);
    }
    lines.push(`\nnetworks:\n  default:\n    driver: bridge`);
    return lines.join("\n");
  }, [services, version]);

  async function copy() {
    await navigator.clipboard.writeText(yaml);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Compose version</span>
        <select value={version} onChange={(e) => setVersion(e.target.value)}
          className="rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm">
          <option>3.9</option><option>3.8</option><option>3.7</option>
        </select>
      </div>
      {services.map((svc, i) => (
        <div key={i} className="rounded-xl border border-app p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Service {i + 1}</span>
            {services.length > 1 && (
              <button onClick={() => remove(i)} className="text-xs text-red-500 hover:underline">Remove</button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted">Service name</label>
              <input value={svc.name} onChange={(e) => update(i, "name", e.target.value)}
                className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Image</label>
              <input value={svc.image} onChange={(e) => update(i, "image", e.target.value)}
                className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm" placeholder="nginx:latest" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Port mapping</label>
              <input value={svc.port} onChange={(e) => update(i, "port", e.target.value)}
                className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm" placeholder="80:80" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Env vars (one per line)</label>
              <textarea value={svc.env} onChange={(e) => update(i, "env", e.target.value)} rows={2}
                className="w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 font-mono text-xs"
                placeholder="KEY=value" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={add} className="w-full rounded-xl border border-dashed border-app py-2.5 text-sm text-muted hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
        + Add service
      </button>
      <div className="relative">
        <pre className="max-h-72 overflow-auto rounded-xl border border-app bg-[var(--surface-2)] p-4 text-xs font-mono">{yaml}</pre>
        <button onClick={copy} className="absolute right-3 top-3 rounded-lg border border-app bg-[var(--bg-base)] px-3 py-1.5 text-xs">
          {copied ? "✓" : "Copy"}
        </button>
      </div>
    </div>
  );
}
