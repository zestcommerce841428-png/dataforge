"use client";

import { useState, useCallback } from "react";

type Dialect = "standard" | "mysql" | "postgresql" | "sqlite";

const KEYWORDS = [
  "SELECT","FROM","WHERE","JOIN","LEFT","RIGHT","INNER","OUTER","FULL","ON","AS",
  "INSERT","INTO","VALUES","UPDATE","SET","DELETE","CREATE","TABLE","DROP","ALTER",
  "ADD","COLUMN","PRIMARY","KEY","FOREIGN","REFERENCES","INDEX","UNIQUE","NOT","NULL",
  "DEFAULT","AUTO_INCREMENT","SERIAL","AND","OR","IN","NOT IN","LIKE","BETWEEN","IS",
  "ORDER","BY","GROUP","HAVING","LIMIT","OFFSET","UNION","ALL","DISTINCT","EXISTS",
  "CASE","WHEN","THEN","ELSE","END","WITH","AS","RETURNING","CASCADE","CONSTRAINT",
];

function formatSQL(sql: string, dialect: Dialect): string {
  // Normalize whitespace
  let s = sql.replace(/\s+/g, " ").trim();

  // Uppercase keywords
  const kw = KEYWORDS.join("|");
  s = s.replace(new RegExp(`\\b(${kw})\\b`, "gi"), (m) => m.toUpperCase());

  // Newline before major clauses
  const clauses = [
    "SELECT","FROM","WHERE","JOIN","LEFT JOIN","RIGHT JOIN","INNER JOIN","FULL JOIN",
    "ORDER BY","GROUP BY","HAVING","LIMIT","OFFSET","UNION","INSERT INTO","VALUES",
    "UPDATE","SET","DELETE FROM","CREATE TABLE","WITH",
  ];
  for (const c of clauses) {
    s = s.replace(new RegExp(`\\b${c}\\b`, "g"), `\n${c}`);
  }

  // Indent columns after SELECT
  s = s.replace(/SELECT\n?(.+?)(\nFROM|\nINTO)/s, (_, cols, next) => {
    const formatted = cols.split(",").map((c: string) => `  ${c.trim()}`).join(",\n");
    return `SELECT\n${formatted}${next}`;
  });

  // Indent WHERE conditions
  s = s.replace(/WHERE (.+?)(\n[A-Z]|$)/s, (_, cond, after) => {
    const conditions = cond.replace(/\bAND\b/g, "\n  AND").replace(/\bOR\b/g, "\n  OR");
    return `WHERE ${conditions}${after}`;
  });

  // Dialect-specific adjustments
  if (dialect === "mysql") {
    s = s.replace(/\bSERIAL\b/g, "INT AUTO_INCREMENT");
  } else if (dialect === "postgresql") {
    s = s.replace(/\bAUTO_INCREMENT\b/g, "GENERATED ALWAYS AS IDENTITY");
    s = s.replace(/\bINT\b/g, "INTEGER");
  } else if (dialect === "sqlite") {
    s = s.replace(/\bAUTO_INCREMENT\b/g, "AUTOINCREMENT");
  }

  return s.replace(/\n{3,}/g, "\n\n").trim();
}

const SAMPLES: Record<string, string> = {
  select: `SELECT u.id, u.name, u.email, COUNT(o.id) AS order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.active = 1 AND u.created_at > '2024-01-01' GROUP BY u.id ORDER BY order_count DESC LIMIT 50`,
  insert: `INSERT INTO products (name, price, category, stock, created_at) VALUES ('Widget Pro', 29.99, 'electronics', 100, NOW())`,
  create: `CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role ENUM('admin','user') DEFAULT 'user', active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
};

export default function SqlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [dialect, setDialect] = useState<Dialect>("standard");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const format = useCallback(() => {
    setError("");
    if (!input.trim()) { setError("Enter a SQL query first."); return; }
    try {
      setOutput(formatSQL(input, dialect));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, dialect]);

  function copy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function paste() {
    try { setInput(await navigator.clipboard.readText()); } catch {}
  }

  const TA_CLS = "h-64 w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] p-4 font-mono text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">SQL Formatter</h1>
        <p className="mt-1 text-sm text-muted">
          Beautify and format SQL queries. Supports MySQL, PostgreSQL, SQLite, and standard SQL.
        </p>
      </div>

      {/* Dialect */}
      <div className="surface mb-5 rounded-2xl border border-app p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Dialect:</span>
          {(["standard", "mysql", "postgresql", "sqlite"] as Dialect[]).map((d) => (
            <label key={d} className="flex cursor-pointer items-center gap-2 rounded-xl border border-app px-3 py-1.5 text-sm hover:border-brand-500">
              <input type="radio" name="dialect" value={d} checked={dialect === d}
                onChange={() => setDialect(d)} className="accent-brand-600" />
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </label>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-muted">Samples:</span>
          {Object.keys(SAMPLES).map((k) => (
            <button key={k} type="button" onClick={() => setInput(SAMPLES[k])}
              className="rounded-lg border border-app px-2.5 py-0.5 text-xs hover:border-brand-500 hover:text-brand-600">
              {k.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface rounded-2xl border border-app p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Input SQL</h2>
            <div className="flex gap-2">
              <button type="button" onClick={paste}
                className="rounded-lg border border-app px-2.5 py-1 text-xs hover:bg-[var(--surface-2)]">Paste</button>
              <button type="button" onClick={() => { setInput(""); setOutput(""); setError(""); }}
                className="rounded-lg border border-app px-2.5 py-1 text-xs text-red-500 hover:bg-[var(--surface-2)]">Clear</button>
            </div>
          </div>
          <textarea className={TA_CLS} value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your SQL query here…" spellCheck={false} aria-label="SQL input" />
          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}
        </div>

        <div className="surface rounded-2xl border border-app p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Formatted SQL</h2>
            <button type="button" onClick={copy} disabled={!output}
              className="rounded-lg border border-app px-2.5 py-1 text-xs hover:bg-[var(--surface-2)] disabled:opacity-40">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea className={TA_CLS} value={output} readOnly
            placeholder="Formatted SQL will appear here…" spellCheck={false} aria-label="Formatted SQL output" />
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button type="button" onClick={format}
          className="rounded-xl bg-brand-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Format SQL
        </button>
      </div>
    </div>
  );
}
