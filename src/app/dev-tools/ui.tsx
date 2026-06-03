"use client";
import { useState, type ReactNode } from "react";

export function ToolWrap({ children }: { children: ReactNode }) {
  return <div className="space-y-2 w-full">{children}</div>;
}

export function TwoPane({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

export function CopyBtn({ text, absolute = false }: { text: string; absolute?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      title="Copy"
      className={`${absolute ? "absolute right-2 top-2" : ""} rounded-md border bg-[var(--bg-base)] px-2 py-1 text-xs font-medium text-muted hover:text-[var(--text)] transition-colors z-10`}
    >
      {copied ? "✓" : "Copy"}
    </button>
  );
}

export function IOTextarea({
  label, value, onChange, placeholder, readOnly, rows = 6, mono = false,
}: {
  label?: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; readOnly?: boolean; rows?: number; mono?: boolean;
}) {
  return (
    <div className="relative flex-1">
      {label && <p className="mb-1 text-xs font-semibold text-muted">{label}</p>}
      <textarea
        className={`input-area w-full pr-10 ${mono ? "font-mono text-xs" : ""}`}
        style={{ minHeight: `${rows * 1.625}rem` }}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      {readOnly && <CopyBtn text={value} absolute />}
    </div>
  );
}
