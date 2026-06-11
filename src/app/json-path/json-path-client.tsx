"use client";

import { useMemo, useState } from "react";

// ── Minimal JSONPath engine ───────────────────────────────────────────────────

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

function jsonPathQuery(root: JsonValue, path: string): { values: JsonValue[]; paths: string[] } {
  if (!path.trim() || path === "$") return { values: [root], paths: ["$"] };

  const results: { val: JsonValue; path: string }[] = [];

  function traverse(node: JsonValue, segments: string[], currentPath: string) {
    if (segments.length === 0) { results.push({ val: node, path: currentPath }); return; }
    const [head, ...rest] = segments;

    if (head === "**" || head === "..") {
      // deep wildcard
      traverse(node, rest, currentPath);
      if (Array.isArray(node)) {
        node.forEach((item, i) => traverse(item, segments, `${currentPath}[${i}]`));
      } else if (typeof node === "object" && node !== null) {
        Object.entries(node).forEach(([k, v]) => traverse(v, segments, `${currentPath}.${k}`));
      }
      return;
    }

    if (head === "*") {
      if (Array.isArray(node)) {
        node.forEach((item, i) => traverse(item, rest, `${currentPath}[${i}]`));
      } else if (typeof node === "object" && node !== null) {
        Object.entries(node).forEach(([k, v]) => traverse(v, rest, `${currentPath}.${k}`));
      }
      return;
    }

    // Array index or slice like [0], [1:3], [-1]
    const arrMatch = head.match(/^\[(-?\d+)\]$/);
    if (arrMatch && Array.isArray(node)) {
      let idx = parseInt(arrMatch[1]);
      if (idx < 0) idx = node.length + idx;
      if (idx >= 0 && idx < node.length) traverse(node[idx], rest, `${currentPath}[${idx}]`);
      return;
    }

    // Slice [start:end]
    const sliceMatch = head.match(/^\[(-?\d*):(-?\d*)\]$/);
    if (sliceMatch && Array.isArray(node)) {
      const len = node.length;
      const start = sliceMatch[1] ? (parseInt(sliceMatch[1]) < 0 ? len + parseInt(sliceMatch[1]) : parseInt(sliceMatch[1])) : 0;
      const end   = sliceMatch[2] ? (parseInt(sliceMatch[2]) < 0 ? len + parseInt(sliceMatch[2]) : parseInt(sliceMatch[2])) : len;
      for (let i = start; i < Math.min(end, len); i++) traverse(node[i], rest, `${currentPath}[${i}]`);
      return;
    }

    // Object key
    if (typeof node === "object" && node !== null && !Array.isArray(node)) {
      const key = head.replace(/^\[['"](.+)['"]\]$/, "$1");
      if (key in node) traverse((node as Record<string, JsonValue>)[key], rest, `${currentPath}.${key}`);
    }
  }

  // Tokenize path
  const normalized = path.replace(/^[$]\.?/, "").replace(/\.\./g, ".**.");
  const tokens: string[] = [];
  let i = 0;
  const raw = normalized;
  while (i < raw.length) {
    if (raw[i] === ".") { i++; continue; }
    if (raw[i] === "[") {
      const end = raw.indexOf("]", i);
      tokens.push(raw.slice(i, end + 1));
      i = end + 1;
    } else {
      let end = i;
      while (end < raw.length && raw[end] !== "." && raw[end] !== "[") end++;
      tokens.push(raw.slice(i, end));
      i = end;
    }
  }

  traverse(root, tokens, "$");
  return { values: results.map((r) => r.val), paths: results.map((r) => r.path) };
}

// ── Syntax-highlighted JSON renderer ─────────────────────────────────────────

function colorizeJson(val: JsonValue, depth = 0): string {
  const indent = "  ".repeat(depth);
  const inner  = "  ".repeat(depth + 1);
  if (val === null) return `<span class="text-purple-400">null</span>`;
  if (typeof val === "boolean") return `<span class="text-yellow-400">${val}</span>`;
  if (typeof val === "number")  return `<span class="text-cyan-400">${val}</span>`;
  if (typeof val === "string")  return `<span class="text-green-400">"${val.replace(/</g, "&lt;").replace(/>/g, "&gt;")}"</span>`;
  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";
    const items = val.map((v) => `${inner}${colorizeJson(v, depth + 1)}`).join(",\n");
    return `[\n${items}\n${indent}]`;
  }
  if (typeof val === "object") {
    const entries = Object.entries(val);
    if (entries.length === 0) return "{}";
    const items = entries.map(([k, v]) => `${inner}<span class="text-blue-300">"${k}"</span>: ${colorizeJson(v, depth + 1)}`).join(",\n");
    return `{\n${items}\n${indent}}`;
  }
  return String(val);
}

const SAMPLE_JSON = `{
  "store": {
    "name": "DataForge Books",
    "books": [
      { "title": "Clean Code", "author": "Martin", "price": 29.99, "category": "programming" },
      { "title": "DDIA", "author": "Kleppmann", "price": 49.99, "category": "databases" },
      { "title": "Design Patterns", "author": "GoF", "price": 39.99, "category": "programming" }
    ],
    "members": 1024
  },
  "version": "2.0"
}`;

const EXAMPLES = [
  { label: "Root",           path: "$" },
  { label: "All books",      path: "$.store.books" },
  { label: "First book",     path: "$.store.books[0]" },
  { label: "Last book",      path: "$.store.books[-1]" },
  { label: "All titles",     path: "$.store.books[*].title" },
  { label: "All values (deep)", path: "$..price" },
  { label: "Slice [0:2]",    path: "$.store.books[0:2]" },
  { label: "Store name",     path: "$.store.name" },
  { label: "Version",        path: "$.version" },
];

export function JsonPathExplorer() {
  const [jsonText, setJsonText] = useState(SAMPLE_JSON);
  const [path, setPath] = useState("$.store.books[*].title");
  const [showPaths, setShowPaths] = useState(false);

  const parsed = useMemo(() => {
    try { return { value: JSON.parse(jsonText) as JsonValue, error: null }; }
    catch (e) { return { value: null, error: (e as Error).message }; }
  }, [jsonText]);

  const queryResult = useMemo(() => {
    if (!parsed.value || parsed.error) return null;
    try { return jsonPathQuery(parsed.value, path); }
    catch { return null; }
  }, [parsed, path]);

  return (
    <div className="space-y-4">
      {/* Path input */}
      <div className="surface rounded-2xl border p-4 shadow-sm">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">JSONPath Expression</label>
        <input type="text" value={path} onChange={(e) => setPath(e.target.value)} spellCheck={false}
          className="surface-2 w-full rounded-xl border border-app px-4 py-3 font-mono text-sm outline-none"
          placeholder="$.store.books[*].title" aria-label="JSONPath expression" />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button key={ex.path} type="button" onClick={() => setPath(ex.path)}
              className="surface-2 rounded-full border border-app px-2.5 py-1 text-xs text-muted transition hover:border-brand-400 hover:text-brand-600">
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* JSON input */}
        <div className="surface rounded-2xl border p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted">JSON Input</label>
            {parsed.error && <span className="text-xs text-red-500 font-medium">Invalid JSON</span>}
            {!parsed.error && <span className="text-xs text-green-600 font-medium">✓ Valid</span>}
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck={false}
            rows={18}
            className="surface-2 w-full resize-none rounded-xl border border-app px-4 py-3 font-mono text-xs outline-none"
            aria-label="JSON input"
          />
          {parsed.error && <p className="mt-1.5 text-xs text-red-500">{parsed.error}</p>}
        </div>

        {/* Results */}
        <div className="surface rounded-2xl border p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted">
              Results {queryResult ? `(${queryResult.values.length})` : ""}
            </label>
            <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer">
              <input type="checkbox" checked={showPaths} onChange={(e) => setShowPaths(e.target.checked)} className="accent-brand-600" />
              Show paths
            </label>
          </div>
          {!queryResult ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted">
              {parsed.error ? "Fix JSON errors first" : "Enter a valid JSONPath expression"}
            </div>
          ) : queryResult.values.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted">No matches found</div>
          ) : (
            <ol className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
              {queryResult.values.map((v, i) => (
                <li key={i} className="rounded-xl border border-app surface-2 px-3 py-2">
                  {showPaths && (
                    <div className="mb-1 font-mono text-[10px] text-brand-500">{queryResult.paths[i]}</div>
                  )}
                  <pre
                    className="overflow-x-auto font-mono text-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: colorizeJson(v) }}
                  />
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Cheat sheet */}
      <details className="surface rounded-2xl border p-4 shadow-sm">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-muted">JSONPath Syntax Reference</summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            ["$", "Root element"],
            [".", "Child separator"],
            ["..", "Recursive descent (deep)"],
            ["*", "Wildcard (any key/index)"],
            ["[n]", "Array index (0-based)"],
            ["[-1]", "Last element"],
            ["[0:2]", "Array slice"],
            ["[*]", "All array elements"],
          ].map(([syn, desc]) => (
            <div key={syn} className="flex gap-3 rounded-lg px-2 py-1.5 hover:bg-[var(--surface-2)]">
              <code className="w-20 shrink-0 font-mono text-xs text-brand-600">{syn}</code>
              <span className="text-xs text-muted">{desc}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
