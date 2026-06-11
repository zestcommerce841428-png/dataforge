"use client";

import { useMemo, useState } from "react";

const FLAGS = [
  { key: "g", label: "g", title: "Global — find all matches" },
  { key: "i", label: "i", title: "Case insensitive" },
  { key: "m", label: "m", title: "Multiline — ^ and $ match line starts/ends" },
  { key: "s", label: "s", title: "Dot-all — . matches newlines" },
];

const PATTERNS = [
  { label: "Email",             pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}", flags: "gi" },
  { label: "URL",               pattern: "https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-.,@?^=%&:/~+#]*[\\w\\-@?^=%&/~+#])?", flags: "gi" },
  { label: "IPv4",              pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g" },
  { label: "IPv6",              pattern: "([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}", flags: "gi" },
  { label: "UUID",              pattern: "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", flags: "gi" },
  { label: "Date (YYYY-MM-DD)", pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])", flags: "g" },
  { label: "Time (HH:MM)",      pattern: "\\b([01]?\\d|2[0-3]):[0-5]\\d\\b", flags: "g" },
  { label: "Phone (US)",        pattern: "\\+?1?[-\\s.]?\\(?[0-9]{3}\\)?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4}", flags: "g" },
  { label: "Hex color",         pattern: "#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\\b", flags: "gi" },
  { label: "Credit card",       pattern: "\\b(?:\\d[ -]?){13,16}\\b", flags: "g" },
  { label: "JWT",               pattern: "eyJ[A-Za-z0-9_\\-]+\\.eyJ[A-Za-z0-9_\\-]+\\.[A-Za-z0-9_\\-]+", flags: "g" },
  { label: "Markdown heading",  pattern: "^#{1,6}\\s.+", flags: "gm" },
  { label: "HTML tag",          pattern: "<\\/?[a-z][\\w\\-]*(?:\\s[^>]*)?>", flags: "gi" },
  { label: "Whitespace (2+)",   pattern: "\\s{2,}", flags: "g" },
  { label: "Slug",              pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", flags: "" },
  { label: "Semver",            pattern: "\\bv?(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)(?:-[\\w.]+)?(?:\\+[\\w.]+)?\\b", flags: "g" },
  { label: "Base64",            pattern: "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$", flags: "" },
  { label: "IBAN",              pattern: "[A-Z]{2}\\d{2}[A-Z0-9]{4}\\d{7}(?:[A-Z0-9]?){0,16}", flags: "g" },
];

const SAMPLE_TEXT = `Contact us at hello@example.com or support@dataforge.app.
Visit https://dataforge-omega.vercel.app for more tools.
Server IP: 192.168.1.100 or 203.0.113.42
UUID: 550e8400-e29b-41d4-a716-446655440000
Color: #3478f6 or #fff
Date: 2026-06-11  Time: 14:30
Phone: +1 (555) 123-4567`;

interface Match {
  index: number;
  length: number;
  fullMatch: string;
  groups: string[];
  namedGroups: Record<string, string>;
}

function buildHighlighted(text: string, matches: Match[]): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let last = 0;
  matches.forEach((m, i) => {
    if (m.index > last) parts.push(<span key={`t${i}`}>{text.slice(last, m.index)}</span>);
    parts.push(
      <mark key={`m${i}`} className="rounded bg-amber-300 px-0.5 text-amber-900 dark:bg-amber-600 dark:text-amber-50" title={`Match ${i + 1}`}>
        {text.slice(m.index, m.index + m.length)}
      </mark>
    );
    last = m.index + m.length;
  });
  if (last < text.length) parts.push(<span key="tail">{text.slice(last)}</span>);
  return parts;
}

export function RegexPlayground() {
  const [pattern, setPattern] = useState("\\b[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}\\b");
  const [activeFlags, setActiveFlags] = useState<Set<string>>(new Set(["g", "i"]));
  const [testStr, setTestStr] = useState(SAMPLE_TEXT);
  const [replaceWith, setReplaceWith] = useState("***");
  const [mode, setMode] = useState<"match" | "replace">("match");
  const [showPatterns, setShowPatterns] = useState(false);

  const flagStr = FLAGS.map((f) => (activeFlags.has(f.key) ? f.key : "")).join("");

  const { matches, error, replaced } = useMemo(() => {
    if (!pattern) return { matches: [], error: "", replaced: testStr };
    try {
      const re = new RegExp(pattern, flagStr || "g");
      const found: Match[] = [];
      if (flagStr.includes("g")) {
        let m: RegExpExecArray | null;
        re.lastIndex = 0;
        while ((m = re.exec(testStr)) !== null) {
          found.push({
            index: m.index,
            length: m[0].length,
            fullMatch: m[0],
            groups: m.slice(1),
            namedGroups: (m.groups as Record<string, string>) ?? {},
          });
          if (m[0].length === 0) re.lastIndex++;
          if (found.length > 500) break;
        }
      } else {
        const m = re.exec(testStr);
        if (m) {
          found.push({
            index: m.index,
            length: m[0].length,
            fullMatch: m[0],
            groups: m.slice(1),
            namedGroups: (m.groups as Record<string, string>) ?? {},
          });
        }
      }
      const replaced = mode === "replace" ? testStr.replace(new RegExp(pattern, flagStr || "g"), replaceWith) : testStr;
      return { matches: found, error: "", replaced };
    } catch (e) {
      return { matches: [], error: (e as Error).message, replaced: testStr };
    }
  }, [pattern, flagStr, testStr, mode, replaceWith]);

  const hasNamedGroups = matches.some((m) => Object.keys(m.namedGroups).length > 0);

  return (
    <div className="space-y-5">
      {/* Pattern input */}
      <div className="surface rounded-2xl border p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted">Pattern</label>
          <div className="flex items-center gap-2">
            {FLAGS.map((f) => (
              <button
                key={f.key}
                type="button"
                title={f.title}
                aria-pressed={activeFlags.has(f.key) ? "true" : "false"}
                onClick={() => setActiveFlags((prev) => {
                  const next = new Set(prev);
                  next.has(f.key) ? next.delete(f.key) : next.add(f.key);
                  return next;
                })}
                className={`rounded border px-2 py-0.5 font-mono text-xs font-bold transition ${
                  activeFlags.has(f.key) ? "border-brand-500 bg-brand-500 text-white" : "border-app text-muted hover:border-brand-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowPatterns((v) => !v)}
            className="ml-auto surface-2 rounded-lg border border-app px-2.5 py-1 text-xs font-medium text-muted hover:text-[var(--text)]"
          >
            📚 Pattern library
          </button>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-muted select-none">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            spellCheck={false}
            className={`surface-2 w-full rounded-xl border py-3 pl-7 pr-12 font-mono text-sm outline-none ${error ? "border-red-400" : "border-app"}`}
            placeholder="Enter regex pattern…"
            aria-label="Regex pattern"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-muted select-none">/{flagStr}</span>
        </div>
        {error && <p className="mt-2 text-xs text-red-500">⚠ {error}</p>}

        {/* Pattern library */}
        {showPatterns && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PATTERNS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setPattern(p.pattern);
                  setActiveFlags(new Set(p.flags.split("").filter(Boolean)));
                  setShowPatterns(false);
                }}
                className="surface-2 rounded-lg border border-app px-3 py-2 text-left text-xs hover:border-brand-400"
              >
                <span className="font-semibold">{p.label}</span>
                <span className="ml-1.5 font-mono text-muted">{p.flags && `/${p.flags}`}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mode toggle + Replace input */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-app overflow-hidden surface">
          {(["match", "replace"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm font-medium capitalize transition ${mode === m ? "bg-brand-600 text-white" : "text-muted hover:text-[var(--text)]"}`}
            >
              {m}
            </button>
          ))}
        </div>
        {mode === "replace" && (
          <input
            type="text"
            value={replaceWith}
            onChange={(e) => setReplaceWith(e.target.value)}
            className="surface-2 flex-1 rounded-xl border border-app px-3 py-2 font-mono text-sm outline-none"
            placeholder="Replace with…"
          />
        )}
        <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${
          error ? "bg-red-100 text-red-700" : matches.length > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-[var(--surface-2)] text-muted"
        }`}>
          {error ? "Error" : `${matches.length} match${matches.length !== 1 ? "es" : ""}`}
        </span>
      </div>

      {/* Main panes */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Test string */}
        <div className="surface rounded-2xl border p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted">Test string</label>
            <button type="button" onClick={() => setTestStr(SAMPLE_TEXT)} className="text-xs text-muted hover:text-[var(--text)]">Reset sample</button>
          </div>
          <textarea
            value={testStr}
            onChange={(e) => setTestStr(e.target.value)}
            rows={10}
            spellCheck={false}
            className="surface-2 w-full resize-y rounded-xl border border-app p-3 font-mono text-sm outline-none"
            aria-label="Test string"
          />
        </div>

        {/* Highlighted output / Replace output */}
        <div className="surface rounded-2xl border p-4 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
            {mode === "replace" ? "Replaced output" : "Match preview"}
          </p>
          {mode === "replace" ? (
            <pre className="surface-2 max-h-64 overflow-auto rounded-xl border border-app p-3 font-mono text-sm whitespace-pre-wrap break-all">{replaced}</pre>
          ) : (
            <div className="surface-2 max-h-64 overflow-auto rounded-xl border border-app p-3 font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
              {matches.length === 0 ? (
                <span className="text-muted">{error ? "Fix the pattern to see highlights." : "No matches."}</span>
              ) : (
                buildHighlighted(testStr, matches)
              )}
            </div>
          )}
        </div>
      </div>

      {/* Matches table */}
      {mode === "match" && matches.length > 0 && (
        <div className="surface overflow-hidden rounded-2xl border shadow-sm">
          <div className="border-b border-app px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Matches</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-app text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Match</th>
                  <th className="px-4 py-2">Index</th>
                  {matches[0]?.groups?.length > 0 && <th className="px-4 py-2">Groups</th>}
                  {hasNamedGroups && <th className="px-4 py-2">Named</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-app font-mono">
                {matches.slice(0, 100).map((m, i) => (
                  <tr key={i} className="hover:bg-[var(--surface-2)]">
                    <td className="px-4 py-2 text-muted">{i + 1}</td>
                    <td className="px-4 py-2 max-w-xs truncate">{m.fullMatch}</td>
                    <td className="px-4 py-2 tabular-nums text-muted">{m.index}–{m.index + m.length - 1}</td>
                    {m.groups?.length > 0 && (
                      <td className="px-4 py-2 text-muted">{m.groups.map((g, j) => <span key={j} className="mr-2">[{j + 1}]: {g ?? "—"}</span>)}</td>
                    )}
                    {hasNamedGroups && (
                      <td className="px-4 py-2 text-muted">{Object.entries(m.namedGroups).map(([k, v]) => <span key={k} className="mr-2">{k}: {v}</span>)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {matches.length > 100 && <p className="px-4 py-2 text-xs text-muted">Showing first 100 of {matches.length} matches.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
