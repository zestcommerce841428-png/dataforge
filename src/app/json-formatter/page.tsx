"use client";

import { useState, useCallback } from "react";
import type { Metadata } from "next";

type IndentMode = "2" | "4" | "tab" | "minify";

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "text-blue-400"; // number
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? "text-red-400" : "text-green-400"; // key : string
        } else if (/true|false/.test(match)) {
          cls = "text-yellow-400";
        } else if (/null/.test(match)) {
          cls = "text-gray-400";
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

const SAMPLE = `{
  "name": "DataForge",
  "version": "1.0.0",
  "features": ["formatting", "validation", "minification"],
  "active": true,
  "meta": {
    "author": "DataForge Team",
    "license": "MIT"
  }
}`;

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<IndentMode>("2");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const format = useCallback(() => {
    setError("");
    if (!input.trim()) { setError("Paste some JSON first."); return; }
    try {
      const parsed = JSON.parse(input);
      let result: string;
      if (mode === "minify") {
        result = JSON.stringify(parsed);
      } else if (mode === "tab") {
        result = JSON.stringify(parsed, null, "\t");
      } else {
        result = JSON.stringify(parsed, null, parseInt(mode));
      }
      setOutput(result);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, mode]);

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function paste() {
    try { setInput(await navigator.clipboard.readText()); } catch {}
  }

  function clear() { setInput(""); setOutput(""); setError(""); }

  const lines = output.split("\n").length;
  const chars = output.length;

  const INPUT_CLS = "h-72 w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] p-4 font-mono text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">JSON Formatter</h1>
        <p className="mt-1 text-sm text-muted">
          Format, validate, and minify JSON. Syntax highlighting, error detection, and instant stats.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <div className="surface rounded-2xl border border-app p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Input JSON</h2>
            <div className="flex gap-2">
              <button type="button" onClick={paste}
                className="rounded-lg border border-app px-2.5 py-1 text-xs hover:bg-[var(--surface-2)]">Paste</button>
              <button type="button" onClick={() => setInput(SAMPLE)}
                className="rounded-lg border border-app px-2.5 py-1 text-xs hover:bg-[var(--surface-2)]">Sample</button>
              <button type="button" onClick={clear}
                className="rounded-lg border border-app px-2.5 py-1 text-xs text-red-500 hover:bg-[var(--surface-2)]">Clear</button>
            </div>
          </div>
          <textarea
            className={INPUT_CLS}
            placeholder={'Paste JSON here…\n{"key":"value"}'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            aria-label="JSON input"
          />
          {error && (
            <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
              ✗ {error}
            </p>
          )}
        </div>

        {/* Output */}
        <div className="surface rounded-2xl border border-app p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Formatted Output</h2>
            <button type="button" onClick={copyOutput} disabled={!output}
              className="rounded-lg border border-app px-2.5 py-1 text-xs hover:bg-[var(--surface-2)] disabled:opacity-40">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className={`${INPUT_CLS} overflow-auto`} aria-label="Formatted JSON output">
            {output ? (
              <pre dangerouslySetInnerHTML={{ __html: syntaxHighlight(output) }} className="text-[13px]" />
            ) : (
              <span className="text-muted">Formatted JSON will appear here…</span>
            )}
          </div>
          {output && (
            <p className="mt-2 text-xs text-muted">{lines} line{lines !== 1 ? "s" : ""} · {chars.toLocaleString()} chars</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="surface mt-6 rounded-2xl border border-app p-5">
        <h2 className="mb-4 font-semibold">Formatting options</h2>
        <div className="mb-4 flex flex-wrap gap-3">
          {([
            { value: "2", label: "2 Spaces" },
            { value: "4", label: "4 Spaces" },
            { value: "tab", label: "Tabs" },
            { value: "minify", label: "Minify" },
          ] as { value: IndentMode; label: string }[]).map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2 rounded-xl border border-app px-4 py-2 text-sm hover:border-brand-500">
              <input type="radio" name="indent" value={opt.value} checked={mode === opt.value}
                onChange={() => setMode(opt.value)} className="accent-brand-600" />
              {opt.label}
            </label>
          ))}
        </div>
        <button type="button" onClick={format}
          className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Format JSON
        </button>
      </div>
    </div>
  );
}
