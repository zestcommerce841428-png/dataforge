"use client";

import { useState, useCallback, useMemo } from "react";

/* ─── 1. Enhanced Password Generator (gitopentools merge) ────────────── */
const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
  similar: "iIlL1oO0",
};

const PRESETS = {
  developer: { upper: true, lower: true, digits: true, symbols: true, length: 32, excludeSimilar: true, noSequential: false },
  website:   { upper: true, lower: true, digits: true, symbols: false, length: 16, excludeSimilar: true, noSequential: false },
  banking:   { upper: true, lower: false, digits: true, symbols: false, length: 8, excludeSimilar: true, noSequential: true },
  pin:       { upper: false, lower: false, digits: true, symbols: false, length: 6, excludeSimilar: false, noSequential: true },
};

type Preset = keyof typeof PRESETS;

function entropy(pool: number, len: number) {
  if (pool <= 0) return 0;
  return Math.log2(Math.pow(pool, len));
}

function strengthLabel(e: number) {
  if (e < 28) return { label: "Very Weak", color: "bg-red-600", w: "10%" };
  if (e < 36) return { label: "Weak",      color: "bg-orange-500", w: "30%" };
  if (e < 60) return { label: "Fair",      color: "bg-yellow-400", w: "55%" };
  if (e < 80) return { label: "Strong",    color: "bg-blue-500", w: "75%" };
  return           { label: "Very Strong", color: "bg-green-500", w: "100%" };
}

export function EnhancedPasswordGenerator() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [noSequential, setNoSequential] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  const pool = useMemo(() => {
    let p = "";
    if (upper) p += CHARSETS.upper;
    if (lower) p += CHARSETS.lower;
    if (digits) p += CHARSETS.digits;
    if (symbols) p += CHARSETS.symbols;
    if (excludeSimilar) p = p.split("").filter((c) => !CHARSETS.similar.includes(c)).join("");
    return p;
  }, [upper, lower, digits, symbols, excludeSimilar]);

  const generate = useCallback(() => {
    if (!pool) return;
    const arr: string[] = [];
    for (let q = 0; q < quantity; q++) {
      let pw = "";
      const buf = new Uint32Array(length * 2);
      crypto.getRandomValues(buf);
      let i = 0;
      while (pw.length < length && i < buf.length) {
        const c = pool[buf[i] % pool.length];
        if (noSequential && pw.length > 0) {
          const prev = pw.charCodeAt(pw.length - 1);
          if (Math.abs(c.charCodeAt(0) - prev) <= 1) { i++; continue; }
        }
        pw += c;
        i++;
      }
      arr.push(pw);
    }
    setPasswords(arr);
    setCopied(null);
  }, [pool, length, quantity, noSequential]);

  function applyPreset(name: Preset) {
    const p = PRESETS[name];
    setUpper(p.upper); setLower(p.lower); setDigits(p.digits); setSymbols(p.symbols);
    setLength(p.length); setExcludeSimilar(p.excludeSimilar); setNoSequential(p.noSequential);
  }

  const ent = entropy(pool.length, length);
  const str = strengthLabel(ent);

  async function copy(idx: number) {
    await navigator.clipboard.writeText(passwords[idx]);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(PRESETS) as Preset[]).map((p) => (
          <button key={p} type="button" onClick={() => applyPreset(p)}
            className="rounded-full border border-app px-3 py-1 text-xs font-medium capitalize hover:bg-[var(--surface-2)]">
            {p}
          </button>
        ))}
      </div>

      {/* Length slider */}
      <div>
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-medium">Length</span>
          <span className="font-mono text-brand-600">{length}</span>
        </div>
        <input type="range" min={6} max={128} value={length} onChange={(e) => setLength(+e.target.value)}
          className="w-full accent-brand-600" />
      </div>

      {/* Character sets */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {([["upper", upper, setUpper, "A–Z"], ["lower", lower, setLower, "a–z"],
           ["digits", digits, setDigits, "0–9"], ["symbols", symbols, setSymbols, "!@#…"]] as const).map(
          ([key, val, setter, lab]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 rounded-xl border border-app px-3 py-2 text-sm hover:bg-[var(--surface-2)]">
              <input type="checkbox" checked={val} onChange={(e) => setter(e.target.checked)} className="accent-brand-600" />
              <span>{lab}</span>
            </label>
          )
        )}
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={excludeSimilar} onChange={(e) => setExcludeSimilar(e.target.checked)} className="accent-brand-600" />
          Exclude similar chars (i, l, 1, O, 0…)
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={noSequential} onChange={(e) => setNoSequential(e.target.checked)} className="accent-brand-600" />
          Avoid sequential chars
        </label>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Quantity</span>
        <input type="number" min={1} max={50} value={quantity} onChange={(e) => setQuantity(Math.min(50, Math.max(1, +e.target.value)))}
          className="w-20 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-1.5 text-sm" />
      </div>

      {/* Entropy bar */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-muted">
          <span>Strength: <strong className="text-[var(--text)]">{str.label}</strong></span>
          <span>{ent.toFixed(1)} bits entropy</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div className={`h-full rounded-full transition-all ${str.color}`} style={{ width: str.w }} />
        </div>
      </div>

      <button onClick={generate} disabled={!pool}
        className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
        Generate {quantity > 1 ? `${quantity} passwords` : "password"}
      </button>

      {passwords.map((pw, i) => (
        <div key={i} className="flex items-center gap-2 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-3">
          <code className="flex-1 break-all font-mono text-sm">{pw}</code>
          <button onClick={() => copy(i)} className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium border border-app hover:bg-[var(--surface-2)]">
            {copied === i ? "✓" : "Copy"}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── 2. Passphrase Generator (word-based, enhanced) ─────────────────── */
const WORDS = ["correct","horse","battery","staple","cloud","river","forest","dragon","castle","morning","ocean","silver","golden","bridge","garden","thunder","whisper","shadow","crystal","falcon","mountain","pepper","violet","cosmic","breeze","marble","sunrise","winter","autumn","spiral","lantern","copper","velvet","harbor","distant","ancient","bright","mighty","swift","frozen","gentle","noble","fierce","calm","brave","wild","quiet","bold","deep","high","warm","cold","soft","hard","wide","long","true","pure","free","wise"];

export function PassphraseGenerator() {
  const [words, setWords] = useState(4);
  const [sep, setSep] = useState("-");
  const [capitalize, setCapitalize] = useState(true);
  const [addNumber, setAddNumber] = useState(true);
  const [phrase, setPhrase] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    const selected: string[] = [];
    const buf = new Uint32Array(words);
    crypto.getRandomValues(buf);
    buf.forEach((n) => {
      let w = WORDS[n % WORDS.length];
      if (capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
      selected.push(w);
    });
    let result = selected.join(sep);
    if (addNumber) {
      const n = new Uint32Array(1);
      crypto.getRandomValues(n);
      result += sep + (n[0] % 900 + 100);
    }
    setPhrase(result);
    setCopied(false);
  }

  async function copy() {
    await navigator.clipboard.writeText(phrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Words</label>
          <input type="range" min={3} max={8} value={words} onChange={(e) => setWords(+e.target.value)} className="w-full accent-brand-600" />
          <span className="text-xs text-muted">{words} words</span>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Separator</label>
          <select value={sep} onChange={(e) => setSep(e.target.value)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm">
            <option value="-">Hyphen (-)</option>
            <option value=".">Dot (.)</option>
            <option value="_">Underscore (_)</option>
            <option value=" ">Space</option>
            <option value="">None</option>
          </select>
        </div>
      </div>
      <div className="flex gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={capitalize} onChange={(e) => setCapitalize(e.target.checked)} className="accent-brand-600" />
          Capitalize words
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={addNumber} onChange={(e) => setAddNumber(e.target.checked)} className="accent-brand-600" />
          Add number
        </label>
      </div>
      <button onClick={generate} className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
        Generate passphrase
      </button>
      {phrase && (
        <div className="flex items-center gap-2 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-3">
          <code className="flex-1 break-all font-mono text-sm">{phrase}</code>
          <button onClick={copy} className="shrink-0 rounded-lg border border-app px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">
            {copied ? "✓" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── 3. Have I Been Pwned Checker ───────────────────────────────────── */
export function HaveIBeenPwned() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ count: number; checked: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    setLoading(true);
    setResult(null);
    try {
      const msgBuf = new TextEncoder().encode(input.trim());
      const hashBuf = await crypto.subtle.digest("SHA-1", msgBuf);
      const hashHex = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
      const prefix = hashHex.slice(0, 5);
      const suffix = hashHex.slice(5);
      const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: { "Add-Padding": "true" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error("HIBP API error");
      const text = await res.text();
      const lines = text.split("\n");
      let count = 0;
      for (const line of lines) {
        const [hash, c] = line.trim().split(":");
        if (hash === suffix) { count = parseInt(c, 10); break; }
      }
      setResult({ count, checked: true });
    } catch (e) {
      setResult({ count: -1, checked: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Check if a password has appeared in known data breaches. Uses k-anonymity — your password never leaves your browser.</p>
      <div className="flex gap-2">
        <input type="password" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
          className="flex-1 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm font-mono outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          placeholder="Enter password to check…" />
        <button onClick={check} disabled={loading || !input.trim()}
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {loading ? "…" : "Check"}
        </button>
      </div>
      {result && (
        result.count === -1 ? (
          <div className="rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-700 dark:bg-orange-950/30 dark:text-orange-400">
            ⚠️ Could not reach HIBP API. Check your connection.
          </div>
        ) : result.count > 0 ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
            🚨 This password was found <strong>{result.count.toLocaleString()}</strong> times in data breaches. Do not use it!
          </div>
        ) : (
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
            ✅ Not found in any known breach. Still use a unique password per site!
          </div>
        )
      )}
    </div>
  );
}

/* ─── 4. Security Headers Analyzer ──────────────────────────────────── */
const HEADERS_INFO: Record<string, { good: boolean; desc: string }> = {
  "content-security-policy":             { good: true, desc: "Controls allowed resource origins" },
  "strict-transport-security":           { good: true, desc: "Forces HTTPS connections" },
  "x-content-type-options":             { good: true, desc: "Prevents MIME-type sniffing" },
  "x-frame-options":                    { good: true, desc: "Prevents clickjacking via iframes" },
  "x-xss-protection":                   { good: true, desc: "Legacy XSS filter (less important now)" },
  "referrer-policy":                     { good: true, desc: "Controls referrer information" },
  "permissions-policy":                  { good: true, desc: "Controls browser feature access" },
  "cross-origin-embedder-policy":        { good: true, desc: "Controls cross-origin embedding" },
  "cross-origin-opener-policy":          { good: true, desc: "Controls window.opener access" },
  "cross-origin-resource-policy":        { good: true, desc: "Controls cross-origin resource reads" },
};

export function SecurityHeadersAnalyzer() {
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function analyze() {
    setErr(""); setHeaders(null); setLoading(true);
    try {
      const u = url.startsWith("http") ? url : "https://" + url;
      const res = await fetch(`/api/og-check?url=${encodeURIComponent(u)}`, { signal: AbortSignal.timeout(10000) });
      const data = await res.json();
      setHeaders(data.headers ?? {});
    } catch {
      setErr("Could not fetch headers. The URL may block cross-origin requests.");
    } finally {
      setLoading(false);
    }
  }

  const found = headers ? Object.keys(HEADERS_INFO).filter((h) => h in headers) : [];
  const missing = headers ? Object.keys(HEADERS_INFO).filter((h) => !(h in headers)) : [];
  const score = headers ? Math.round((found.length / Object.keys(HEADERS_INFO).length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && analyze()}
          className="flex-1 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          placeholder="example.com" />
        <button onClick={analyze} disabled={loading || !url}
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {loading ? "…" : "Analyze"}
        </button>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {headers && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black text-brand-600">{score}%</div>
            <div>
              <div className="text-sm font-medium">Security Score</div>
              <div className="text-xs text-muted">{found.length}/{Object.keys(HEADERS_INFO).length} headers present</div>
            </div>
          </div>
          {found.map((h) => (
            <div key={h} className="flex items-start gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm dark:bg-green-950/20">
              <span className="text-green-600">✓</span>
              <div><code className="font-mono text-xs">{h}</code><p className="text-xs text-muted mt-0.5">{HEADERS_INFO[h].desc}: <em>{headers[h]?.slice(0, 60)}</em></p></div>
            </div>
          ))}
          {missing.map((h) => (
            <div key={h} className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm dark:bg-red-950/20">
              <span className="text-red-500">✗</span>
              <div><code className="font-mono text-xs">{h}</code><p className="text-xs text-muted mt-0.5">{HEADERS_INFO[h].desc}</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── 5. API Key Generator ───────────────────────────────────────────── */
const KEY_FORMATS = {
  "Hex 32":     { chars: "0123456789abcdef", len: 64 },
  "AlphaNum 32":{ chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", len: 32 },
  "Base58 22":  { chars: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", len: 22 },
  "UUID v4":    { chars: "", len: 0 },
};
type KeyFmt = keyof typeof KEY_FORMATS;

export function ApiKeyGenerator() {
  const [fmt, setFmt] = useState<KeyFmt>("Hex 32");
  const [prefix, setPrefix] = useState("sk-");
  const [qty, setQty] = useState(1);
  const [keys, setKeys] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  function generate() {
    const generated: string[] = [];
    for (let i = 0; i < qty; i++) {
      let key: string;
      if (fmt === "UUID v4") {
        key = crypto.randomUUID();
      } else {
        const { chars, len } = KEY_FORMATS[fmt];
        const buf = new Uint32Array(len);
        crypto.getRandomValues(buf);
        key = Array.from(buf).map((n) => chars[n % chars.length]).join("");
      }
      generated.push(prefix + key);
    }
    setKeys(generated);
    setCopied(null);
  }

  async function copy(i: number) {
    await navigator.clipboard.writeText(keys[i]);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Format</label>
          <select value={fmt} onChange={(e) => setFmt(e.target.value as KeyFmt)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2.5 text-sm">
            {Object.keys(KEY_FORMATS).map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Prefix (optional)</label>
          <input value={prefix} onChange={(e) => setPrefix(e.target.value)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2.5 text-sm"
            placeholder="sk-" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Quantity</span>
        <input type="number" min={1} max={20} value={qty} onChange={(e) => setQty(Math.min(20, Math.max(1, +e.target.value)))}
          className="w-20 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm" />
      </div>
      <button onClick={generate} className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
        Generate
      </button>
      {keys.map((k, i) => (
        <div key={i} className="flex items-center gap-2 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-3">
          <code className="flex-1 break-all font-mono text-xs">{k}</code>
          <button onClick={() => copy(i)} className="shrink-0 rounded-lg border border-app px-3 py-1.5 text-xs font-medium">
            {copied === i ? "✓" : "Copy"}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── 6. JWT Builder / Encoder ───────────────────────────────────────── */
function base64url(obj: unknown) {
  return btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function JwtBuilder() {
  const [alg, setAlg] = useState("HS256");
  const [payload, setPayload] = useState('{\n  "sub": "user123",\n  "name": "Jane Doe",\n  "iat": ' + Math.floor(Date.now() / 1000) + "\n}");
  const [secret, setSecret] = useState("your-secret-key");
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  function build() {
    setErr("");
    try {
      JSON.parse(payload);
    } catch {
      setErr("Invalid JSON payload"); return;
    }
    const header = base64url({ alg, typ: "JWT" });
    const body = base64url(JSON.parse(payload));
    // Note: This creates an UNSIGNED token (signature is placeholder) — for real signing use server-side
    const unsigned = `${header}.${body}`;
    const sig = btoa("unsigned-demo-use-server-for-real-jwt").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    setToken(`${unsigned}.${sig}`);
    setCopied(false);
  }

  async function copy() {
    await navigator.clipboard.writeText(token);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
        ⚠️ This builds unsigned JWT tokens for testing only. For real HMAC signing, use a server-side library.
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Algorithm</label>
          <select value={alg} onChange={(e) => setAlg(e.target.value)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2.5 text-sm">
            <option>HS256</option><option>HS384</option><option>HS512</option><option>RS256</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Secret</label>
          <input value={secret} onChange={(e) => setSecret(e.target.value)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2.5 text-sm font-mono" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Payload (JSON)</label>
        <textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={5}
          className="w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 font-mono text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button onClick={build} className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
        Build token
      </button>
      {token && (
        <div className="space-y-2">
          <div className="rounded-xl border border-app bg-[var(--surface-2)] p-4">
            <code className="break-all font-mono text-xs leading-relaxed">
              <span className="text-red-500">{token.split(".")[0]}</span>.
              <span className="text-purple-500">{token.split(".")[1]}</span>.
              <span className="text-blue-500">{token.split(".")[2]}</span>
            </code>
          </div>
          <button onClick={copy} className="w-full rounded-xl border border-app py-2 text-sm hover:bg-[var(--surface-2)]">
            {copied ? "✓ Copied" : "Copy token"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── 7. Two-Factor Recovery Codes Generator ─────────────────────────── */
export function RecoveryCodesGenerator() {
  const [codes, setCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  function generate() {
    const newCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const buf = new Uint32Array(2);
      crypto.getRandomValues(buf);
      const part1 = buf[0].toString(36).slice(0, 5).toUpperCase().padStart(5, "0");
      const part2 = buf[1].toString(36).slice(0, 5).toUpperCase().padStart(5, "0");
      newCodes.push(`${part1}-${part2}`);
    }
    setCodes(newCodes);
    setCopied(false);
  }

  async function copyAll() {
    await navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Generate 10 one-time recovery codes for 2FA backup. Store them in a safe place.</p>
      <button onClick={generate} className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
        Generate recovery codes
      </button>
      {codes.length > 0 && (
        <div className="rounded-xl border border-app bg-[var(--surface-2)] p-4">
          <div className="grid grid-cols-2 gap-2">
            {codes.map((c, i) => (
              <code key={i} className="rounded-lg bg-[var(--bg-base)] px-3 py-1.5 text-center font-mono text-sm tracking-widest">{c}</code>
            ))}
          </div>
          <button onClick={copyAll} className="mt-4 w-full rounded-xl border border-app py-2 text-sm hover:bg-[var(--bg-base)]">
            {copied ? "✓ Copied all" : "Copy all codes"}
          </button>
          <p className="mt-2 text-center text-xs text-muted">⚠️ Each code can only be used once. Save these now!</p>
        </div>
      )}
    </div>
  );
}

/* ─── 8. Bcrypt Hash Simulator (client-side, 1000 iterations SHA256) ─── */
export function BcryptSimulator() {
  const [input, setInput] = useState("");
  const [rounds, setRounds] = useState(10);
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyInput, setVerifyInput] = useState("");
  const [matchResult, setMatchResult] = useState<boolean | null>(null);

  async function computeHash() {
    setLoading(true); setHash(""); setMatchResult(null);
    try {
      const enc = new TextEncoder();
      let key = enc.encode(input);
      const iterations = Math.pow(2, rounds);
      for (let i = 0; i < Math.min(iterations, 4096); i++) {
        const buf = await crypto.subtle.digest("SHA-256", key);
        key = new Uint8Array(buf);
      }
      const hex = Array.from(key).map((b) => b.toString(16).padStart(2, "0")).join("");
      setHash(`$sim2b$${rounds}$${hex}`);
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    const enc = new TextEncoder();
    let key = enc.encode(verifyInput);
    const rounds_ = parseInt(hash.split("$")[2] ?? "10", 10);
    const original = hash.split("$")[3];
    for (let i = 0; i < Math.min(Math.pow(2, rounds_), 4096); i++) {
      const buf = await crypto.subtle.digest("SHA-256", key);
      key = new Uint8Array(buf);
    }
    const hex = Array.from(key).map((b) => b.toString(16).padStart(2, "0")).join("");
    setMatchResult(hex === original);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
        ⚠️ Simulated bcrypt using iterated SHA-256 (for demo purposes). Use a real bcrypt library server-side.
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Input string</label>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Cost factor</span>
        <input type="range" min={8} max={14} value={rounds} onChange={(e) => setRounds(+e.target.value)} className="flex-1 accent-brand-600" />
        <span className="text-sm font-mono text-brand-600">{rounds} ({Math.pow(2,rounds)} iter)</span>
      </div>
      <button onClick={computeHash} disabled={loading || !input}
        className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
        {loading ? "Computing…" : "Hash"}
      </button>
      {hash && (
        <>
          <div className="rounded-xl border border-app bg-[var(--surface-2)] px-4 py-3">
            <code className="break-all font-mono text-xs">{hash}</code>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Verify — enter original string</label>
            <div className="flex gap-2">
              <input value={verifyInput} onChange={(e) => setVerifyInput(e.target.value)}
                className="flex-1 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm" />
              <button onClick={verify} disabled={!verifyInput}
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                Verify
              </button>
            </div>
            {matchResult !== null && (
              <p className={`mt-2 text-sm font-medium ${matchResult ? "text-green-600" : "text-red-600"}`}>
                {matchResult ? "✅ Match!" : "❌ No match"}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
