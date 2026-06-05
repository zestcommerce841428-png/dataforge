"use client";
import { useState } from "react";

type Lang = "json" | "css" | "sql" | "xml" | "html" | "js";
const LANGS: [Lang, string][] = [["json", "JSON"], ["css", "CSS"], ["sql", "SQL"], ["xml", "XML"], ["html", "HTML"], ["js", "JavaScript"]];

const SAMPLES: Record<Lang, string> = {
  json: '{"name":"DataForge","tools":397,"tags":["fast","private"],"nested":{"a":1,"b":[2,3]}}',
  css: "body{margin:0;font-family:sans-serif}.btn{color:#fff;background:#1f59e0;padding:8px 16px}",
  sql: "select id, name, email from users where active = 1 and created_at > '2024-01-01' order by name asc",
  xml: '<note><to>User</to><from>DataForge</from><body>Hello there</body></note>',
  html: '<div class="card"><h2>Title</h2><p>Some <b>bold</b> text</p><ul><li>one</li><li>two</li></ul></div>',
  js: "function greet(name){if(name){return 'Hi '+name}else{return 'Hi'}}const x=[1,2,3].map(n=>n*2)",
};

function indentStr(n: number, size: number) { return " ".repeat(n * size); }

/* ---- JSON ---- */
function fmtJson(s: string, size: number) { return JSON.stringify(JSON.parse(s), null, size); }
function minJson(s: string) { return JSON.stringify(JSON.parse(s)); }

/* ---- CSS ---- */
function fmtCss(s: string, size: number) {
  let depth = 0; let out = "";
  s = s.replace(/\s+/g, " ").replace(/\/\*[\s\S]*?\*\//g, "").trim();
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "{") { out += " {\n"; depth++; out += indentStr(depth, size); }
    else if (c === "}") { out = out.replace(/\s+$/, ""); depth = Math.max(0, depth - 1); out += "\n" + indentStr(depth, size) + "}\n" + indentStr(depth, size); }
    else if (c === ";") { out += ";\n" + indentStr(depth, size); }
    else if (c === ":") { out += ": "; while (s[i + 1] === " ") i++; }
    else out += c;
  }
  return out.replace(/\n\s*\n/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
}
function minCss(s: string) { return s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}:;,])\s*/g, "$1").replace(/;}/g, "}").trim(); }

/* ---- SQL ---- */
const SQL_KW = ["SELECT", "FROM", "WHERE", "AND", "OR", "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "ON", "AS", "UNION", "CREATE TABLE", "ALTER TABLE", "DROP TABLE"];
const SQL_BREAK = ["FROM", "WHERE", "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "VALUES", "SET", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "UNION", "AND", "OR"];
function fmtSql(s: string) {
  let t = s.replace(/\s+/g, " ").trim();
  for (const kw of SQL_KW) t = t.replace(new RegExp(`\\b${kw.replace(/ /g, "\\s+")}\\b`, "gi"), kw);
  for (const kw of SQL_BREAK) t = t.replace(new RegExp(`\\s+${kw}\\b`, "g"), "\n" + (["AND", "OR"].includes(kw) ? "  " : "") + kw);
  return t.replace(/,\s*/g, ",\n  ").trim();
}
function minSql(s: string) { return s.replace(/\s+/g, " ").trim(); }

/* ---- XML / HTML ---- */
const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
function fmtMarkup(s: string, size: number, html: boolean) {
  const tokens = s.replace(/>\s+</g, "><").replace(/</g, "\n<").split("\n").filter((x) => x.trim());
  let depth = 0; const out: string[] = [];
  for (const raw of tokens) {
    const t = raw.trim();
    const isClose = /^<\//.test(t);
    const tagName = (t.match(/^<\/?([\w:-]+)/) || [])[1]?.toLowerCase() ?? "";
    const isSelfClose = /\/>$/.test(t) || (html && VOID_TAGS.has(tagName));
    const isOpen = /^<[^/!?]/.test(t) && !isSelfClose;
    const hasInlineClose = isOpen && t.includes(`</${tagName}>`);
    if (isClose) depth = Math.max(0, depth - 1);
    out.push(indentStr(depth, size) + t);
    if (isOpen && !hasInlineClose) depth++;
  }
  return out.join("\n");
}
function minMarkup(s: string) { return s.replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").replace(/<!--[\s\S]*?-->/g, "").trim(); }

/* ---- JS (best-effort brace indenter) ---- */
function fmtJs(s: string, size: number) {
  let depth = 0; let out = ""; let inStr = "";
  const src = s.replace(/;\s*/g, ";\n").replace(/\{/g, "{\n").replace(/\}/g, "\n}\n");
  for (const line of src.split("\n").map((l) => l.trim()).filter(Boolean)) {
    if (line.startsWith("}")) depth = Math.max(0, depth - 1);
    out += indentStr(depth, size) + line + "\n";
    if (line.endsWith("{")) depth++;
  }
  void inStr;
  return out.trim();
}
function minJs(s: string) { return s.replace(/\/\/[^\n]*/g, "").replace(/\s*([{}();,:=<>+\-*/])\s*/g, "$1").replace(/\s+/g, " ").trim(); }

function run(lang: Lang, mode: "beautify" | "minify", input: string, size: number): string {
  if (mode === "beautify") {
    switch (lang) { case "json": return fmtJson(input, size); case "css": return fmtCss(input, size); case "sql": return fmtSql(input); case "xml": return fmtMarkup(input, size, false); case "html": return fmtMarkup(input, size, true); case "js": return fmtJs(input, size); }
  } else {
    switch (lang) { case "json": return minJson(input); case "css": return minCss(input); case "sql": return minSql(input); case "xml": case "html": return minMarkup(input); case "js": return minJs(input); }
  }
}

export function CodeFormatterClient() {
  const [lang, setLang] = useState<Lang>("json");
  const [input, setInput] = useState(SAMPLES.json);
  const [size, setSize] = useState(2);
  const [copied, setCopied] = useState(false);

  let output = "", error = "";
  try { output = run(lang, "beautify", input, size); } catch (e) { error = (e as Error).message; }

  const doFormat = (mode: "beautify" | "minify") => { try { setInput(run(lang, mode, input, size)); } catch { /* invalid input — preview shows the error */ } };

  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1200); };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <select className="input-field" value={lang} onChange={(e) => { const l = e.target.value as Lang; setLang(l); setInput(SAMPLES[l]); }}>
          {LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <label className="text-sm">Indent
          <select className="input-field ml-1" value={size} onChange={(e) => setSize(+e.target.value)}>{[2, 4, 8].map((n) => <option key={n} value={n}>{n} spaces</option>)}</select>
        </label>
        <button onClick={() => doFormat("beautify")} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Beautify</button>
        <button onClick={() => doFormat("minify")} className="rounded-lg border surface px-4 py-2 text-sm">Minify</button>
        <button onClick={copy} disabled={!output} className="ml-auto rounded-lg border surface px-3 py-2 text-sm disabled:opacity-50">{copied ? "✓ Copied" : "Copy output"}</button>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold text-muted">Input</p>
          <textarea className="input-area w-full font-mono text-xs" rows={18} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-muted">Formatted preview</p>
          {error ? <div className="surface flex h-full min-h-[200px] items-center justify-center rounded-lg border border-red-400 bg-red-500/5 p-4 text-center text-sm text-red-500">⚠ {error}</div>
            : <textarea readOnly className="input-area w-full font-mono text-xs" rows={18} value={output} spellCheck={false} />}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">Beautify rewrites the input field; Minify too. JSON, CSS, SQL, XML and HTML are fully supported; JavaScript uses a lightweight brace-based formatter. Everything runs locally.</p>
    </div>
  );
}
