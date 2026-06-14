"use client";

import { useState } from "react";

type EscapeMode =
  | "html"
  | "html-decode"
  | "js"
  | "js-decode"
  | "json"
  | "json-decode"
  | "regex"
  | "csv"
  | "base64-encode"
  | "base64-decode"
  | "sql";

const MODES: { value: EscapeMode; label: string; group: string }[] = [
  { value: "html", label: "HTML Encode", group: "HTML" },
  { value: "html-decode", label: "HTML Decode", group: "HTML" },
  { value: "js", label: "JavaScript Escape", group: "JavaScript" },
  { value: "js-decode", label: "JavaScript Unescape", group: "JavaScript" },
  { value: "json", label: "JSON String Escape", group: "JSON" },
  { value: "json-decode", label: "JSON String Unescape", group: "JSON" },
  { value: "regex", label: "Regex Escape", group: "Regex" },
  { value: "csv", label: "CSV Escape", group: "CSV" },
  { value: "base64-encode", label: "Base64 Encode", group: "Base64" },
  { value: "base64-decode", label: "Base64 Decode", group: "Base64" },
  { value: "sql", label: "SQL String Escape", group: "SQL" },
];

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function unescapeHtml(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}
function escapeJs(s: string) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}
function unescapeJs(s: string) {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}
function escapeJson(s: string) {
  return JSON.stringify(s).slice(1, -1);
}
function unescapeJson(s: string) {
  try { return JSON.parse(`"${s}"`); } catch { return s; }
}
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function escapeCsv(s: string) {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function encodeBase64(s: string) {
  try { return btoa(unescape(encodeURIComponent(s))); } catch { return "Error encoding"; }
}
function decodeBase64(s: string) {
  try { return decodeURIComponent(escape(atob(s))); } catch { return "Error decoding — invalid Base64"; }
}
function escapeSql(s: string) {
  return s.replace(/'/g, "''").replace(/\\/g, "\\\\");
}

function process(input: string, mode: EscapeMode): string {
  switch (mode) {
    case "html": return escapeHtml(input);
    case "html-decode": return unescapeHtml(input);
    case "js": return escapeJs(input);
    case "js-decode": return unescapeJs(input);
    case "json": return escapeJson(input);
    case "json-decode": return unescapeJson(input);
    case "regex": return escapeRegex(input);
    case "csv": return escapeCsv(input);
    case "base64-encode": return encodeBase64(input);
    case "base64-decode": return decodeBase64(input);
    case "sql": return escapeSql(input);
  }
}

const SAMPLES: Partial<Record<EscapeMode, string>> = {
  html: `Hello <World> & "friends"!`,
  "html-decode": `Hello &lt;World&gt; &amp; &quot;friends&quot;!`,
  js: `He said "It's a test"\nNew line here\tTabbed`,
  json: `She said "Hello\nWorld"`,
  regex: `user@example.com (1+2)*3`,
  csv: `Name, "Age", "City, State"`,
  "base64-encode": `Hello, DataForge! 🔐`,
  sql: `O'Brien's "special" value`,
};

export default function TextEscapePage() {
  const [mode, setMode] = useState<EscapeMode>("html");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [autoMode, setAutoMode] = useState(false);

  function run() {
    setOutput(process(input, mode));
  }

  function handleInputChange(val: string) {
    setInput(val);
    if (autoMode) setOutput(process(val, mode));
  }

  function handleModeChange(m: EscapeMode) {
    setMode(m);
    if (autoMode && input) setOutput(process(input, m));
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function swap() {
    setInput(output);
    setOutput("");
  }

  async function paste() {
    try { handleInputChange(await navigator.clipboard.readText()); } catch {}
  }

  const groups = Array.from(new Set(MODES.map((m) => m.group)));

  const TA_CLS = "h-48 w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] p-4 font-mono text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Text Escape / Unescape</h1>
        <p className="mt-1 text-sm text-muted">
          Escape and unescape text for HTML, JavaScript, JSON, Regex, CSV, Base64, and SQL.
        </p>
      </div>

      {/* Mode selector */}
      <div className="surface mb-5 rounded-2xl border border-app p-5">
        <div className="flex flex-wrap gap-6">
          {groups.map((group) => (
            <div key={group}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{group}</p>
              <div className="flex flex-col gap-1.5">
                {MODES.filter((m) => m.group === group).map((m) => (
                  <label key={m.value} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="radio" name="mode" value={m.value} checked={mode === m.value}
                      onChange={() => handleModeChange(m.value)} className="accent-brand-600" />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-app pt-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={autoMode} onChange={(e) => setAutoMode(e.target.checked)}
              className="accent-brand-600" />
            Auto-process on type
          </label>
          {SAMPLES[mode] && (
            <button type="button" onClick={() => handleInputChange(SAMPLES[mode]!)}
              className="ml-auto rounded-lg border border-app px-2.5 py-0.5 text-xs hover:border-brand-500 hover:text-brand-600">
              Load sample
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface rounded-2xl border border-app p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Input</h2>
            <div className="flex gap-2">
              <button type="button" onClick={paste}
                className="rounded-lg border border-app px-2.5 py-1 text-xs hover:bg-[var(--surface-2)]">Paste</button>
              <button type="button" onClick={() => { setInput(""); setOutput(""); }}
                className="rounded-lg border border-app px-2.5 py-1 text-xs text-red-500 hover:bg-[var(--surface-2)]">Clear</button>
            </div>
          </div>
          <textarea className={TA_CLS} value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={`Enter text to ${mode.includes("decode") || mode.includes("decode") ? "unescape" : "escape"}…`}
            spellCheck={false} aria-label="Input text" />
          <p className="mt-2 text-xs text-muted">{input.length} characters</p>
        </div>

        <div className="surface rounded-2xl border border-app p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Output</h2>
            <div className="flex gap-2">
              <button type="button" onClick={swap} disabled={!output}
                className="rounded-lg border border-app px-2.5 py-1 text-xs hover:bg-[var(--surface-2)] disabled:opacity-40">
                ⇅ Use as input
              </button>
              <button type="button" onClick={copy} disabled={!output}
                className="rounded-lg border border-app px-2.5 py-1 text-xs hover:bg-[var(--surface-2)] disabled:opacity-40">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <textarea className={TA_CLS} value={output} readOnly
            placeholder="Result will appear here…" spellCheck={false} aria-label="Output text" />
          <p className="mt-2 text-xs text-muted">{output.length} characters</p>
        </div>
      </div>

      {!autoMode && (
        <div className="mt-4 flex justify-center">
          <button type="button" onClick={run}
            className="rounded-xl bg-brand-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            {MODES.find((m) => m.value === mode)?.label ?? "Process"}
          </button>
        </div>
      )}
    </div>
  );
}
