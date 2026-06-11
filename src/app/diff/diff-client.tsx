"use client";

import { useMemo, useState } from "react";

const SAMPLE_A = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const users = ["Alice", "Bob", "Charlie"];
users.forEach(greet);`;

const SAMPLE_B = `function greet(name, greeting = "Hello") {
  console.log(\`\${greeting}, \${name}!\`);
}

const users = ["Alice", "Bob", "Charlie", "Diana"];
users.forEach((u) => greet(u, "Hi"));`;

interface DiffLine {
  type: "same" | "add" | "remove";
  lineA: number | null;
  lineB: number | null;
  text: string;
}

function lcs(a: string[], b: string[]): number[][] {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  return dp;
}

function computeDiff(a: string[], b: string[]): DiffLine[] {
  const dp = lcs(a, b);
  const result: DiffLine[] = [];
  let i = 0, j = 0, la = 1, lb = 1;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      result.push({ type: "same", lineA: la++, lineB: lb++, text: a[i] });
      i++; j++;
    } else if (j < b.length && (i >= a.length || dp[i][j + 1] >= dp[i + 1][j])) {
      result.push({ type: "add", lineA: null, lineB: lb++, text: b[j] });
      j++;
    } else {
      result.push({ type: "remove", lineA: la++, lineB: null, text: a[i] });
      i++;
    }
  }
  return result;
}

function unifiedView(diff: DiffLine[], ctx = 3): Array<DiffLine | "separator"> {
  const changed = new Set<number>();
  diff.forEach((d, i) => { if (d.type !== "same") for (let k = Math.max(0, i - ctx); k <= Math.min(diff.length - 1, i + ctx); k++) changed.add(k); });
  const result: Array<DiffLine | "separator"> = [];
  let prevIncluded = false;
  diff.forEach((d, i) => {
    if (changed.has(i)) {
      if (!prevIncluded && i > 0) result.push("separator");
      result.push(d);
      prevIncluded = true;
    } else {
      prevIncluded = false;
    }
  });
  return result;
}

function lineClass(type: DiffLine["type"]) {
  if (type === "add")    return "bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500";
  if (type === "remove") return "bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500";
  return "";
}
function lineNumClass(type: DiffLine["type"]) {
  if (type === "add")    return "text-green-600";
  if (type === "remove") return "text-red-600";
  return "text-muted";
}
function prefix(type: DiffLine["type"]) {
  if (type === "add")    return "+";
  if (type === "remove") return "-";
  return " ";
}

export function DiffViewer() {
  const [textA, setTextA] = useState(SAMPLE_A);
  const [textB, setTextB] = useState(SAMPLE_B);
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [showFull, setShowFull] = useState(false);
  const [copied, setCopied] = useState(false);

  const diff = useMemo(() => {
    const a = textA.split("\n");
    const b = textB.split("\n");
    if (a.length > 2000 || b.length > 2000) return [] as DiffLine[];
    return computeDiff(a, b);
  }, [textA, textB]);

  const stats = useMemo(() => ({
    added:     diff.filter((d) => d.type === "add").length,
    removed:   diff.filter((d) => d.type === "remove").length,
    unchanged: diff.filter((d) => d.type === "same").length,
  }), [diff]);

  const displayed = useMemo(() => showFull || viewMode === "split" ? diff : unifiedView(diff), [diff, showFull, viewMode]);

  const copyDiff = async () => {
    const text = diff.map((d) => `${prefix(d.type)} ${d.text}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-xl border border-app surface">
          {(["split", "unified"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setViewMode(m)}
              className={`px-4 py-2 text-sm font-medium capitalize transition ${viewMode === m ? "bg-brand-600 text-white" : "text-muted hover:text-[var(--text)]"}`}>
              {m}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">+{stats.added} added</span>
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">-{stats.removed} removed</span>
          <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-xs font-semibold text-muted">{stats.unchanged} unchanged</span>
        </div>
        <div className="ml-auto flex gap-2">
          {viewMode === "unified" && (
            <button type="button" onClick={() => setShowFull((v) => !v)} className="surface-2 rounded-lg border border-app px-3 py-1.5 text-xs font-medium text-muted hover:text-[var(--text)]">
              {showFull ? "Compact" : "Full diff"}
            </button>
          )}
          <button type="button" onClick={copyDiff} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${copied ? "border-green-500 text-green-600" : "surface-2 border-app text-muted hover:text-[var(--text)]"}`}>
            {copied ? "✓ Copied" : "Copy diff"}
          </button>
          <button type="button" onClick={() => { setTextA(SAMPLE_A); setTextB(SAMPLE_B); }} className="surface-2 rounded-lg border border-app px-3 py-1.5 text-xs text-muted hover:text-[var(--text)]">
            Sample
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid gap-4 lg:grid-cols-2">
        {(["Original (A)", "Modified (B)"] as const).map((label, idx) => (
          <div key={label} className="surface rounded-2xl border p-4 shadow-sm">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">{label}</label>
            <textarea
              value={idx === 0 ? textA : textB}
              onChange={(e) => idx === 0 ? setTextA(e.target.value) : setTextB(e.target.value)}
              rows={8}
              spellCheck={false}
              className="surface-2 w-full resize-y rounded-xl border border-app p-3 font-mono text-xs outline-none"
            />
          </div>
        ))}
      </div>

      {/* Diff output */}
      {diff.length > 0 && (
        <div className="surface overflow-hidden rounded-2xl border shadow-sm">
          <div className="border-b border-app px-4 py-3 flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Diff Output</p>
          </div>
          {viewMode === "split" ? (
            <div className="overflow-x-auto">
              <div className="grid min-w-[600px] font-mono text-xs" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {/* Side A */}
                <div className="border-r border-app">
                  {diff.map((d, i) => (
                    d.type !== "add" ? (
                      <div key={i} className={`flex gap-2 px-3 py-0.5 ${lineClass(d.type)}`}>
                        <span className={`w-8 shrink-0 select-none text-right tabular-nums ${lineNumClass(d.type)}`}>{d.lineA}</span>
                        <span className={d.type === "remove" ? "text-red-700 dark:text-red-300" : ""}>{d.text || " "}</span>
                      </div>
                    ) : (
                      <div key={i} className="flex gap-2 px-3 py-0.5 opacity-0 select-none" aria-hidden><span className="w-8" /><span> </span></div>
                    )
                  ))}
                </div>
                {/* Side B */}
                <div>
                  {diff.map((d, i) => (
                    d.type !== "remove" ? (
                      <div key={i} className={`flex gap-2 px-3 py-0.5 ${lineClass(d.type)}`}>
                        <span className={`w-8 shrink-0 select-none text-right tabular-nums ${lineNumClass(d.type)}`}>{d.lineB}</span>
                        <span className={d.type === "add" ? "text-green-700 dark:text-green-300" : ""}>{d.text || " "}</span>
                      </div>
                    ) : (
                      <div key={i} className="flex gap-2 px-3 py-0.5 opacity-0 select-none" aria-hidden><span className="w-8" /><span> </span></div>
                    )
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto font-mono text-xs">
              {(displayed as Array<DiffLine | "separator">).map((d, i) => {
                if (d === "separator") {
                  return <div key={i} className="bg-[var(--surface-2)] px-3 py-1 text-muted select-none">@@ … @@</div>;
                }
                return (
                  <div key={i} className={`flex gap-2 px-3 py-0.5 ${lineClass(d.type)}`}>
                    <span className="w-6 shrink-0 select-none text-center font-bold tabular-nums">
                      <span className={lineNumClass(d.type)}>{prefix(d.type)}</span>
                    </span>
                    <span className="w-8 shrink-0 select-none text-right tabular-nums text-muted">{d.lineA ?? d.lineB}</span>
                    <span className={d.type === "add" ? "text-green-700 dark:text-green-300" : d.type === "remove" ? "text-red-700 dark:text-red-300" : ""}>{d.text || " "}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
