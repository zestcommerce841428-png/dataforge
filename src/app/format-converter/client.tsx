"use client";
import { useState } from "react";
import yaml from "js-yaml";

type Fmt = "json" | "yaml" | "xml" | "csv";
const FORMATS: [Fmt, string][] = [["json", "JSON"], ["yaml", "YAML"], ["xml", "XML"], ["csv", "CSV"]];

const SAMPLE = `{
  "team": "DataForge",
  "members": [
    { "name": "Alice", "role": "dev" },
    { "name": "Bob", "role": "design" }
  ],
  "active": true
}`;

/* ---- CSV ---- */
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
    else if (c !== "\r") cur += c;
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  const clean = rows.filter((r) => r.length > 1 || r[0] !== "");
  const head = clean[0] ?? [];
  return clean.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}
const csvCell = (v: unknown) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
function toCSV(data: unknown): string {
  const arr = Array.isArray(data) ? data : [data];
  const keys = [...new Set(arr.flatMap((o) => (o && typeof o === "object" ? Object.keys(o) : [])))];
  if (!keys.length) return String(data ?? "");
  return [keys.join(","), ...arr.map((o) => keys.map((k) => csvCell((o as Record<string, unknown>)?.[k])).join(","))].join("\n");
}

/* ---- XML ---- */
function toXml(obj: unknown, name = "root", indent = ""): string {
  if (obj === null || obj === undefined) return `${indent}<${name}/>`;
  if (Array.isArray(obj)) return obj.map((it) => toXml(it, name, indent)).join("\n");
  if (typeof obj === "object") {
    const inner = Object.entries(obj).map(([k, v]) => toXml(v, k.replace(/[^\w.-]/g, "_"), indent + "  ")).join("\n");
    return `${indent}<${name}>\n${inner}\n${indent}</${name}>`;
  }
  const esc = String(obj).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `${indent}<${name}>${esc}</${name}>`;
}
function xmlToObj(el: Element): unknown {
  const children = Array.from(el.children);
  if (!children.length) return el.textContent ?? "";
  const obj: Record<string, unknown> = {};
  for (const c of children) {
    const v = xmlToObj(c);
    if (c.tagName in obj) { const ex = obj[c.tagName]; obj[c.tagName] = Array.isArray(ex) ? [...ex, v] : [ex, v]; }
    else obj[c.tagName] = v;
  }
  return obj;
}

function parseInput(text: string, fmt: Fmt): unknown {
  if (fmt === "json") return JSON.parse(text);
  if (fmt === "yaml") return yaml.load(text);
  if (fmt === "csv") return parseCSV(text);
  // xml
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("Invalid XML");
  return xmlToObj(doc.documentElement);
}
function serialize(data: unknown, fmt: Fmt): string {
  if (fmt === "json") return JSON.stringify(data, null, 2);
  if (fmt === "yaml") return yaml.dump(data, { indent: 2 });
  if (fmt === "csv") return toCSV(data);
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + toXml(data);
}

export function FormatConverterClient() {
  const [input, setInput] = useState(SAMPLE);
  const [from, setFrom] = useState<Fmt>("json");
  const [to, setTo] = useState<Fmt>("yaml");
  const [copied, setCopied] = useState(false);

  let output = "", error = "";
  try { output = serialize(parseInput(input, from), to); }
  catch (e) { error = (e as Error).message; }

  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1200); };
  const download = () => {
    const ext = to;
    const blob = new Blob([output], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `converted.${ext}`; a.click();
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted">From</span>
          <select className="input-field" value={from} onChange={(e) => setFrom(e.target.value as Fmt)}>{FORMATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </div>
        <button onClick={() => { setFrom(to); setTo(from); setInput(output || input); }} className="surface rounded-lg border px-3 py-2 text-sm" title="Swap">⇄</button>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted">To</span>
          <select className="input-field" value={to} onChange={(e) => setTo(e.target.value as Fmt)}>{FORMATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={copy} disabled={!output} className="rounded-lg border surface px-3 py-2 text-sm disabled:opacity-50">{copied ? "✓ Copied" : "Copy"}</button>
          <button onClick={download} disabled={!output} className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Download</button>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold text-muted">Input ({from.toUpperCase()})</p>
          <textarea className="input-area w-full font-mono text-xs" rows={18} value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Paste ${from.toUpperCase()} here…`} />
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-muted">Output ({to.toUpperCase()})</p>
          {error ? (
            <div className="surface flex h-full min-h-[200px] items-center justify-center rounded-lg border border-red-400 bg-red-500/5 p-4 text-center text-sm text-red-500">⚠ {error}</div>
          ) : (
            <textarea readOnly className="input-area w-full font-mono text-xs" rows={18} value={output} />
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">Tip: CSV works best with a flat array of objects. XML and YAML support nested structures. Everything is processed locally.</p>
    </div>
  );
}
