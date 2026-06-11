"use client";

import { useState, useMemo } from "react";

const B58_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const B32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function toBase58(n: bigint): string {
  if (n === 0n) return "1";
  let result = "";
  let num = n;
  while (num > 0n) {
    result = B58_CHARS[Number(num % 58n)] + result;
    num = num / 58n;
  }
  return result;
}

function fromBase58(s: string): bigint | null {
  try {
    let result = 0n;
    for (const c of s) {
      const idx = B58_CHARS.indexOf(c);
      if (idx === -1) return null;
      result = result * 58n + BigInt(idx);
    }
    return result;
  } catch { return null; }
}

function toBase32(n: bigint): string {
  if (n === 0n) return "A";
  let result = "";
  let num = n;
  while (num > 0n) {
    result = B32_CHARS[Number(num % 32n)] + result;
    num = num / 32n;
  }
  return result;
}

function toBase64(n: bigint): string {
  // Encode the number as a big-endian byte array then base64 encode
  let hex = n.toString(16);
  if (hex.length % 2 !== 0) hex = "0" + hex;
  const bytes = hex.match(/.{2}/g)!.map((b) => parseInt(b, 16));
  return btoa(String.fromCharCode(...bytes));
}

interface Bases {
  decimal: string; binary: string; octal: string; hex: string;
  base32: string; base58: string; base64: string;
}

function convertFrom(value: string, fromBase: number): Bases | null {
  if (!value.trim()) return null;
  try {
    let n: bigint;
    if (fromBase === 10)  n = BigInt(value.trim());
    else if (fromBase === 2)  n = BigInt("0b" + value.trim());
    else if (fromBase === 8)  n = BigInt("0o" + value.trim());
    else if (fromBase === 16) n = BigInt("0x" + value.trim());
    else if (fromBase === 58) { const r = fromBase58(value.trim()); if (r === null) return null; n = r; }
    else return null;
    if (n < 0n) return null; // handle signed later
    return {
      decimal: n.toString(10),
      binary:  n.toString(2),
      octal:   n.toString(8),
      hex:     n.toString(16).toUpperCase(),
      base32:  toBase32(n),
      base58:  toBase58(n),
      base64:  toBase64(n),
    };
  } catch { return null; }
}

const BASES = [
  { key: "decimal",  label: "Decimal",     base: 10,  prefix: "" },
  { key: "binary",   label: "Binary",      base: 2,   prefix: "0b" },
  { key: "octal",    label: "Octal",       base: 8,   prefix: "0o" },
  { key: "hex",      label: "Hexadecimal", base: 16,  prefix: "0x" },
  { key: "base32",   label: "Base32",      base: 32,  prefix: "" },
  { key: "base58",   label: "Base58",      base: 58,  prefix: "" },
  { key: "base64",   label: "Base64",      base: 64,  prefix: "" },
] as const;

type BaseKey = typeof BASES[number]["key"];

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
      className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium transition ${copied ? "bg-green-100 text-green-700" : "surface-2 border border-app text-muted hover:text-brand-600"}`}>
      {copied ? "✓" : "Copy"}
    </button>
  );
}

export function BaseConverter() {
  const [input, setInput] = useState("255");
  const [fromBase, setFromBase] = useState<BaseKey>("decimal");
  const [bitWidth, setBitWidth] = useState(8);
  const [copied, setCopied] = useState<string | null>(null);

  const baseNum = BASES.find((b) => b.key === fromBase)!.base;
  const converted = useMemo(() => convertFrom(input, baseNum), [input, baseNum]);

  const decimalVal = converted ? BigInt(converted.decimal) : null;

  // Bit layout
  const bits = useMemo(() => {
    if (!decimalVal) return [];
    const bin = decimalVal.toString(2).padStart(bitWidth, "0");
    return bin.slice(-bitWidth).split("").map(Number);
  }, [decimalVal, bitWidth]);

  const isTooLarge = decimalVal !== null && decimalVal >= 2n ** BigInt(bitWidth);

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="surface rounded-2xl border p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted">Input</label>
          <select value={fromBase} onChange={(e) => setFromBase(e.target.value as BaseKey)} aria-label="Input base"
            className="surface-2 rounded-lg border border-app px-2 py-1 text-xs outline-none">
            {BASES.map((b) => <option key={b.key} value={b.key}>{b.label} (Base {b.base})</option>)}
          </select>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted">Bit width:</span>
            {[8, 16, 32, 64].map((w) => (
              <button key={w} type="button" onClick={() => setBitWidth(w)}
                className={`rounded border px-2 py-0.5 text-xs font-medium transition ${bitWidth === w ? "border-brand-500 bg-brand-500 text-white" : "border-app text-muted hover:border-brand-400"}`}>
                {w}
              </button>
            ))}
          </div>
        </div>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false}
          className="surface-2 w-full rounded-xl border border-app px-4 py-3 font-mono text-sm outline-none"
          placeholder={`Enter a ${fromBase} number…`} aria-label="Number input" />
        {!converted && input.trim() && <p className="mt-2 text-xs text-red-500">Invalid {fromBase} value.</p>}
        {/* Quick examples */}
        <div className="mt-2 flex flex-wrap gap-2">
          {["0", "1", "10", "42", "127", "255", "65535", "2147483647"].map((v) => (
            <button key={v} type="button" onClick={() => { setInput(v); setFromBase("decimal"); }}
              className="surface-2 rounded border border-app px-1.5 py-0.5 font-mono text-[10px] text-muted hover:text-brand-600">
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Results grid */}
      {converted && (
        <div className="grid gap-3 sm:grid-cols-2">
          {BASES.map((b) => {
            const val = converted[b.key];
            return (
              <div key={b.key} className={`surface rounded-xl border p-4 shadow-sm ${b.key === fromBase ? "border-brand-400" : ""}`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-brand-600">{b.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted">Base {b.base}</span>
                    <CopyBtn value={b.prefix + val} />
                  </div>
                </div>
                <div className="font-mono text-sm break-all">{b.prefix}{val}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bit layout */}
      {converted && bits.length > 0 && (
        <div className="surface rounded-2xl border p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Bit Layout ({bitWidth}-bit)</p>
            {isTooLarge && <span className="text-xs text-amber-600">⚠ Value exceeds {bitWidth}-bit range — truncated</span>}
          </div>
          <div className="flex flex-wrap gap-1">
            {bits.map((bit, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className={`flex h-7 w-7 items-center justify-center rounded font-mono text-xs font-bold ${bit === 1 ? "bg-brand-500 text-white" : "surface-2 border border-app text-muted"}`}>
                  {bit}
                </span>
                <span className="text-[8px] text-muted tabular-nums">{bitWidth - 1 - i}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
            <span>Set bits: <strong className="text-[var(--text)]">{bits.filter((b) => b === 1).length}</strong></span>
            <span>Clear bits: <strong className="text-[var(--text)]">{bits.filter((b) => b === 0).length}</strong></span>
            <span>Unsigned value: <strong className="text-[var(--text)]">{decimalVal?.toString()}</strong></span>
            {bitWidth <= 32 && decimalVal !== null && decimalVal >= 2n ** BigInt(bitWidth - 1) && (
              <span>Signed (2&apos;s complement): <strong className="text-[var(--text)]">{(BigInt.asIntN(bitWidth, decimalVal)).toString()}</strong></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
