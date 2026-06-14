"use client";

import { useState, useCallback } from "react";

type Version = "v4" | "v1" | "v7" | "nil";
type Format = "standard" | "urn" | "braces" | "no-hyphens";

function uuidV4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function uuidV1(): string {
  const now = Date.now();
  const hi = Math.floor(now / 0x100000000);
  const lo = now & 0xffffffff;
  const node = Array.from({ length: 6 }, () => ((Math.random() * 256) | 0).toString(16).padStart(2, "0")).join("");
  const clock = ((Math.random() * 0x3fff) | 0x8000).toString(16);
  const timeHi = (((hi & 0xffff) | 0x1000)).toString(16).padStart(4, "0");
  const timeMid = ((lo >>> 16) & 0xffff).toString(16).padStart(4, "0");
  const timeLow = (lo & 0xffffffff).toString(16).padStart(8, "0");
  return `${timeLow}-${timeMid}-${timeHi}-${clock}-${node}`;
}

function uuidV7(): string {
  const ts = BigInt(Date.now());
  const rand = BigInt(Math.floor(Math.random() * 0xffffffffffff));
  const part1 = (ts >> 16n).toString(16).padStart(8, "0");
  const part2 = (ts & 0xffffn).toString(16).padStart(4, "0");
  const part3 = (0x7000n | (rand >> 36n)).toString(16).padStart(4, "0");
  const part4 = (0x8000n | ((rand >> 22n) & 0x3fffn)).toString(16).padStart(4, "0");
  const part5 = (rand & 0x3fffffffffffffn).toString(16).padStart(12, "0");
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

function applyFormat(uuid: string, fmt: Format): string {
  switch (fmt) {
    case "urn": return `urn:uuid:${uuid}`;
    case "braces": return `{${uuid}}`;
    case "no-hyphens": return uuid.replace(/-/g, "");
    default: return uuid;
  }
}

function generateUUIDs(version: Version, count: number, fmt: Format): string[] {
  if (version === "nil") return Array(count).fill(applyFormat("00000000-0000-0000-0000-000000000000", fmt));
  const gen = version === "v1" ? uuidV1 : version === "v7" ? uuidV7 : uuidV4;
  return Array.from({ length: count }, () => applyFormat(gen(), fmt));
}

export default function UuidGeneratorPage() {
  const [version, setVersion] = useState<Version>("v4");
  const [count, setCount] = useState(10);
  const [fmt, setFmt] = useState<Format>("standard");
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  const generate = useCallback(() => {
    setUuids(generateUUIDs(version, count, fmt));
  }, [version, count, fmt]);

  function copyOne(i: number, val: string) {
    navigator.clipboard.writeText(val);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  }

  function copyAll() {
    if (!uuids.length) return;
    navigator.clipboard.writeText(uuids.join("\n"));
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  }

  function download() {
    const blob = new Blob([uuids.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `uuids-${version}-${Date.now()}.txt`;
    a.click();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">UUID Generator</h1>
        <p className="mt-1 text-sm text-muted">
          Generate UUIDs / GUIDs in v1, v4, v7, and Nil formats. Bulk generation, copy, and download.
        </p>
      </div>

      <div className="surface mb-6 rounded-2xl border border-app p-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {/* Version */}
          <div>
            <p className="mb-2 text-sm font-medium">Version</p>
            <div className="flex flex-col gap-2">
              {([
                { v: "v4", label: "v4 — Random (recommended)" },
                { v: "v1", label: "v1 — Time-based" },
                { v: "v7", label: "v7 — Unix timestamp" },
                { v: "nil", label: "Nil — All zeros" },
              ] as { v: Version; label: string }[]).map(({ v, label }) => (
                <label key={v} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="radio" name="version" value={v} checked={version === v}
                    onChange={() => setVersion(v)} className="accent-brand-600" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label htmlFor="uuid-count" className="mb-2 block text-sm font-medium">
              Count: <span className="text-brand-600 font-bold">{count}</span>
            </label>
            <input id="uuid-count" type="range" min={1} max={100} value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-brand-600" />
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>1</span><span>50</span><span>100</span>
            </div>
            <div className="mt-3 flex gap-2">
              {[1, 5, 10, 25, 50, 100].map((n) => (
                <button key={n} type="button" onClick={() => setCount(n)}
                  className={`rounded-lg border px-2 py-0.5 text-xs transition-colors ${count === n ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/20" : "border-app hover:border-brand-500"}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <p className="mb-2 text-sm font-medium">Format</p>
            <div className="flex flex-col gap-2">
              {([
                { v: "standard", label: "Standard (default)" },
                { v: "urn", label: "URN prefix" },
                { v: "braces", label: "With braces" },
                { v: "no-hyphens", label: "No hyphens" },
              ] as { v: Format; label: string }[]).map(({ v, label }) => (
                <label key={v} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="radio" name="fmt" value={v} checked={fmt === v}
                    onChange={() => setFmt(v)} className="accent-brand-600" />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button type="button" onClick={generate}
            className="rounded-xl bg-brand-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Generate {count} UUID{count !== 1 ? "s" : ""}
          </button>
        </div>
      </div>

      {uuids.length > 0 && (
        <div className="surface rounded-2xl border border-app p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{uuids.length} UUID{uuids.length !== 1 ? "s" : ""}</h2>
            <div className="flex gap-2">
              <button type="button" onClick={copyAll}
                className="rounded-lg border border-app px-3 py-1 text-xs hover:bg-[var(--surface-2)]">
                {allCopied ? "All copied!" : "Copy all"}
              </button>
              <button type="button" onClick={download}
                className="rounded-lg border border-app px-3 py-1 text-xs hover:bg-[var(--surface-2)]">
                Download
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto rounded-xl border border-app">
            {uuids.map((u, i) => (
              <div key={i}
                className="flex items-center justify-between border-b border-app px-4 py-2.5 last:border-b-0 hover:bg-[var(--surface-2)]">
                <span className="font-mono text-sm">{u}</span>
                <button type="button" onClick={() => copyOne(i, u)}
                  className="ml-3 shrink-0 text-xs text-muted hover:text-brand-600">
                  {copied === i ? "✓" : "Copy"}
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            UUID {version.toUpperCase()} · {fmt} format · {uuids.length} generated
          </p>
        </div>
      )}
    </div>
  );
}
