"use client";
import { useState, useEffect } from "react";
import { CopyBtn, ToolWrap } from "../ui";

const rand = (n: number) => { const a = new Uint32Array(n); crypto.getRandomValues(a); return a; };

/* ── Password Generator ── */
export function PasswordGenerator() {
  const [len, setLen] = useState(16);
  const [opts, setOpts] = useState({ lower: true, upper: true, digit: true, symbol: true, ambiguous: false });
  const [pw, setPw] = useState("");
  const gen = () => {
    let set = "";
    if (opts.lower) set += "abcdefghijkmnpqrstuvwxyz" + (opts.ambiguous ? "lo" : "");
    if (opts.upper) set += "ABCDEFGHJKLMNPQRSTUVWXYZ" + (opts.ambiguous ? "IO" : "");
    if (opts.digit) set += "23456789" + (opts.ambiguous ? "01" : "");
    if (opts.symbol) set += "!@#$%^&*()-_=+[]{};:,.?";
    if (!set) { setPw(""); return; }
    const r = rand(len);
    setPw(Array.from({ length: len }, (_, i) => set[r[i] % set.length]).join(""));
  };
  useEffect(() => { gen(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const toggles: [keyof typeof opts, string][] = [["lower", "a-z"], ["upper", "A-Z"], ["digit", "0-9"], ["symbol", "!@#"], ["ambiguous", "Allow 0/O/1/l/I"]];
  return (
    <ToolWrap>
      <div className="relative surface rounded-xl border p-4 mb-3 font-mono text-lg break-all min-h-14">{pw || <span className="text-muted text-sm">Click Generate…</span>}<CopyBtn text={pw} absolute /></div>
      <label className="text-sm block mb-3">Length: {len}<input type="range" min={4} max={64} value={len} onChange={e => setLen(+e.target.value)} className="block w-full" /></label>
      <div className="flex flex-wrap gap-3 mb-3">
        {toggles.map(([k, l]) => <label key={k} className="text-sm flex items-center gap-1"><input type="checkbox" checked={opts[k]} onChange={e => setOpts(o => ({ ...o, [k]: e.target.checked }))} /> {l}</label>)}
      </div>
      <button onClick={gen} className="rounded-lg border border-brand-500 bg-brand-500/10 text-brand-600 px-4 py-2 text-sm font-semibold">↻ Generate</button>
    </ToolWrap>
  );
}

/* ── Passphrase Generator ── */
const WORDS = "able acid aged also area army away baby back ball band bank base bath bear beat been beer bell belt best bird blow blue boat body bone book born both bowl bulk burn bush busy cage cake call calm came camp card care case cash cell chat chip city clay club coal coat code cold come cook cool cope copy core corn cost crew crop dark data date dawn days dead deal dean dear debt deep deer desk dial diet dirt dish disk does done door dose down draw drew drop drug drum dual duke dust duty earn east easy edge else even ever evil exit face fact fade fail fair fall farm fast fate fear feed feel feet fell felt file fill film find fine fire firm fish five flag flat flee flew flow folk food fool foot ford form fort four free from fuel full fund gain game gate gave gear gene gift girl give glad goal goat goes gold golf gone good gray grew grow gulf hair half hall hand hang hard harm hate have head hear heat held hell help here hero high hill hire hold hole holy home hope host hour huge hung hunt hurt idea inch into iron item jack jane jazz join jump jury just kept kick kind king knee knew know lack lady laid lake land lane last late lead left lend less lift like line link list live load loan lock long look lord lose loss lost love luck made mail main make male mall many mark mass matt meal mean meat meet menu mere mike mile milk mill mind mine miss mode mood moon more most move much must name navy near neck need news next nice nick nine node none nose note noun okay once only onto open oral over pace pack page paid pain pair palm park part pass past path peak pick pile pine pink pipe plan play plot plug plus poem poet poll pool poor port post pour pull pure push race rail rain rank rare rate read real rear rely rent rest rice rich ride ring rise risk road rock role roll roof room root rope rose ross rule rush ruth safe said sail sake sale salt same sand save seal seat seed seek seem seen self sell send sent sept ship shoe shop shot show shut sick side sign silk sing sink site size skin slip slow snow soap sofa soft soil sold sole some song soon sort soul soup spot star stay step stop such suit sure surf swim tale talk tall tank tape task team tear tech tell tend term test text than that them then they thin this thus tide tidy tied tier ties till time tiny told toll tone tony took tool tops torn tour town tree trip true tube tune turn twin type unit upon used user vary vast very vice view vote wage wait wake walk wall want ward warm wash wave ways weak wear week well went were west what when whom wide wife wild will wind wine wing wire wise wish with wood wool word wore work yard yeah year your zero zone".split(" ");
export function PassphraseGenerator() {
  const [count, setCount] = useState(4), [sep, setSep] = useState("-"), [cap, setCap] = useState(false), [num, setNum] = useState(true);
  const [phrase, setPhrase] = useState("");
  const gen = () => {
    const r = rand(count);
    let words = Array.from({ length: count }, (_, i) => { const w = WORDS[r[i] % WORDS.length]; return cap ? w[0].toUpperCase() + w.slice(1) : w; });
    if (num) words = words.map((w, i) => i === count - 1 ? w + (rand(1)[0] % 100) : w);
    setPhrase(words.join(sep));
  };
  useEffect(() => { gen(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <ToolWrap>
      <div className="relative surface rounded-xl border p-4 mb-3 font-mono text-lg break-all min-h-14">{phrase}<CopyBtn text={phrase} absolute /></div>
      <div className="flex flex-wrap gap-3 mb-3 items-center">
        <label className="text-sm">Words: {count}<input type="range" min={3} max={8} value={count} onChange={e => setCount(+e.target.value)} className="block w-32" /></label>
        <label className="text-sm">Separator <input className="input-field w-16 font-mono" value={sep} onChange={e => setSep(e.target.value)} /></label>
        <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={cap} onChange={e => setCap(e.target.checked)} /> Capitalize</label>
        <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={num} onChange={e => setNum(e.target.checked)} /> Add number</label>
      </div>
      <button onClick={gen} className="rounded-lg border border-brand-500 bg-brand-500/10 text-brand-600 px-4 py-2 text-sm font-semibold">↻ Generate</button>
    </ToolWrap>
  );
}

/* ── Random String Generator ── */
export function RandomStringGenerator() {
  const [len, setLen] = useState(32), [charset, setCharset] = useState("hex"), [count, setCount] = useState(3);
  const sets: Record<string, string> = { hex: "0123456789abcdef", alnum: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", numeric: "0123456789", base64: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" };
  const [out, setOut] = useState("");
  const gen = () => {
    const set = sets[charset];
    const lines = Array.from({ length: count }, () => { const r = rand(len); return Array.from({ length: len }, (_, i) => set[r[i] % set.length]).join(""); });
    setOut(lines.join("\n"));
  };
  useEffect(() => { gen(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <ToolWrap>
      <div className="flex flex-wrap gap-3 mb-3 items-center">
        <label className="text-sm">Length<input type="number" min={1} max={256} className="input-field w-20 ml-1" value={len} onChange={e => setLen(+e.target.value)} /></label>
        <label className="text-sm">Count<input type="number" min={1} max={50} className="input-field w-20 ml-1" value={count} onChange={e => setCount(+e.target.value)} /></label>
        <select className="input-field" value={charset} onChange={e => setCharset(e.target.value)}>{Object.keys(sets).map(k => <option key={k}>{k}</option>)}</select>
        <button onClick={gen} className="rounded-lg border surface px-3 py-1.5 text-sm">↻</button>
      </div>
      <div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={4} value={out} /><CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── Credit Card Validator (Luhn) ── */
function luhn(num: string) {
  const digits = num.replace(/\D/g, "");
  let sum = 0, alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = +digits[i];
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d; alt = !alt;
  }
  return digits.length >= 12 && sum % 10 === 0;
}
function cardType(num: string) {
  const n = num.replace(/\D/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "American Express";
  if (/^6(?:011|5)/.test(n)) return "Discover";
  if (/^3(?:0[0-5]|[68])/.test(n)) return "Diners Club";
  if (/^35/.test(n)) return "JCB";
  return "Unknown";
}
export function CreditCardValidator() {
  const [num, setNum] = useState("4532 0151 1283 0366");
  const valid = luhn(num);
  return (
    <ToolWrap>
      <input className="input-field w-full font-mono text-lg mb-3" value={num} onChange={e => setNum(e.target.value)} placeholder="Card number…" />
      <div className={`rounded-xl border p-5 text-center ${valid ? "bg-green-500/10 border-green-400" : "bg-red-500/10 border-red-400"}`}>
        <div className="text-xl font-black">{valid ? "✓ Valid (Luhn check passed)" : "✗ Invalid checksum"}</div>
        <div className="text-sm text-muted mt-2">Detected type: <strong>{cardType(num)}</strong> · {num.replace(/\D/g, "").length} digits</div>
      </div>
      <p className="text-xs text-muted mt-2">Luhn validation only checks the checksum — it does not verify the card exists. Use test numbers only.</p>
    </ToolWrap>
  );
}

/* ── IBAN Validator ── */
function validateIban(iban: string) {
  const s = iban.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(s) || s.length < 15 || s.length > 34) return false;
  const rearranged = s.slice(4) + s.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, c => String(c.charCodeAt(0) - 55));
  let rem = 0;
  for (const ch of numeric) rem = (rem * 10 + +ch) % 97;
  return rem === 1;
}
export function IbanValidator() {
  const [iban, setIban] = useState("GB82 WEST 1234 5698 7654 32");
  const valid = validateIban(iban);
  const country = iban.trim().slice(0, 2).toUpperCase();
  return (
    <ToolWrap>
      <input className="input-field w-full font-mono mb-3" value={iban} onChange={e => setIban(e.target.value)} placeholder="IBAN…" />
      <div className={`rounded-xl border p-5 text-center ${valid ? "bg-green-500/10 border-green-400" : "bg-red-500/10 border-red-400"}`}>
        <div className="text-xl font-black">{valid ? "✓ Valid IBAN" : "✗ Invalid IBAN"}</div>
        <div className="text-sm text-muted mt-2">Country code: <strong>{country}</strong> · {iban.replace(/\s/g, "").length} chars (mod-97 check)</div>
      </div>
    </ToolWrap>
  );
}

/* ── Base58 Encoder ── */
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function toBase58(bytes: Uint8Array) {
  let digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) { carry += digits[i] << 8; digits[i] = carry % 58; carry = (carry / 58) | 0; }
    while (carry) { digits.push(carry % 58); carry = (carry / 58) | 0; }
  }
  let zeros = 0; for (const b of bytes) { if (b === 0) zeros++; else break; }
  return "1".repeat(zeros) + digits.reverse().map(d => B58[d]).join("");
}
function fromBase58(str: string) {
  const bytes = [0];
  for (const ch of str) {
    const val = B58.indexOf(ch); if (val < 0) throw new Error("Invalid Base58 character: " + ch);
    let carry = val;
    for (let i = 0; i < bytes.length; i++) { carry += bytes[i] * 58; bytes[i] = carry & 0xff; carry >>= 8; }
    while (carry) { bytes.push(carry & 0xff); carry >>= 8; }
  }
  let zeros = 0; for (const ch of str) { if (ch === "1") zeros++; else break; }
  return new TextDecoder().decode(new Uint8Array([...Array(zeros).fill(0), ...bytes.reverse()]));
}
export function Base58Tool() {
  const [text, setText] = useState("Hello"), [mode, setMode] = useState<"enc" | "dec">("enc");
  let out = "";
  try { out = mode === "enc" ? toBase58(new TextEncoder().encode(text)) : fromBase58(text.trim()); }
  catch (e) { out = "Error: " + (e as Error).message; }
  return (
    <ToolWrap>
      <div className="flex gap-2 mb-3">{(["enc", "dec"] as const).map(m => <button key={m} onClick={() => setMode(m)} className={`rounded-lg border px-3 py-1.5 text-sm ${mode === m ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{m === "enc" ? "Encode" : "Decode"}</button>)}</div>
      <textarea className="input-area w-full font-mono text-sm mb-3" rows={3} value={text} onChange={e => setText(e.target.value)} />
      <div className="relative surface rounded-xl border p-3 font-mono text-sm break-all">{out}<CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── ROT47 ── */
export function Rot47Tool() {
  const [text, setText] = useState("Hello, World!");
  const out = [...text].map(c => { const n = c.charCodeAt(0); return n >= 33 && n <= 126 ? String.fromCharCode(33 + ((n - 33 + 47) % 94)) : c; }).join("");
  return (
    <ToolWrap>
      <p className="text-xs text-muted mb-2">ROT47 is its own inverse — encode and decode are the same operation.</p>
      <textarea className="input-area w-full font-mono text-sm mb-3" rows={3} value={text} onChange={e => setText(e.target.value)} />
      <div className="relative surface rounded-xl border p-3 font-mono text-sm break-all">{out}<CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── Hash Identifier ── */
export function HashIdentifier() {
  const [hash, setHash] = useState("5d41402abc4b2a76b9719d911017c592");
  const h = hash.trim();
  const candidates: string[] = [];
  if (/^[a-f0-9]+$/i.test(h)) {
    if (h.length === 32) candidates.push("MD5", "MD4", "NTLM");
    else if (h.length === 40) candidates.push("SHA-1", "RIPEMD-160");
    else if (h.length === 56) candidates.push("SHA-224");
    else if (h.length === 64) candidates.push("SHA-256", "SHA3-256", "BLAKE2s");
    else if (h.length === 96) candidates.push("SHA-384");
    else if (h.length === 128) candidates.push("SHA-512", "SHA3-512", "BLAKE2b");
  }
  if (/^\$2[aby]\$\d{2}\$/.test(h)) candidates.push("bcrypt");
  if (/^\$argon2(id|i|d)\$/.test(h)) candidates.push("Argon2");
  if (/^\$6\$/.test(h)) candidates.push("SHA-512 crypt");
  if (/^\$1\$/.test(h)) candidates.push("MD5 crypt");
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(h) && h.length % 4 === 0) candidates.push("Possibly Base64-encoded");
  return (
    <ToolWrap>
      <textarea className="input-area w-full font-mono text-sm mb-3" rows={2} value={hash} onChange={e => setHash(e.target.value)} placeholder="Paste a hash…" />
      <div className="surface rounded-xl border p-4">
        <p className="text-xs text-muted mb-2">{h.length} characters · likely type(s):</p>
        {candidates.length ? <div className="flex flex-wrap gap-2">{candidates.map(c => <span key={c} className="rounded-lg bg-brand-500/10 border border-brand-400 px-3 py-1 text-sm font-semibold text-brand-600">{c}</span>)}</div> : <p className="text-sm text-red-500">Unrecognized format.</p>}
      </div>
    </ToolWrap>
  );
}

/* ── PIN / Numeric Code Generator ── */
export function PinGenerator() {
  const [len, setLen] = useState(6), [count, setCount] = useState(5);
  const [out, setOut] = useState("");
  const gen = () => {
    const lines = Array.from({ length: count }, () => { const r = rand(len); return Array.from({ length: len }, (_, i) => r[i] % 10).join(""); });
    setOut(lines.join("\n"));
  };
  useEffect(() => { gen(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <ToolWrap>
      <div className="flex flex-wrap gap-3 mb-3 items-center">
        <label className="text-sm">Digits<input type="number" min={3} max={12} className="input-field w-20 ml-1" value={len} onChange={e => setLen(+e.target.value)} /></label>
        <label className="text-sm">How many<input type="number" min={1} max={50} className="input-field w-20 ml-1" value={count} onChange={e => setCount(+e.target.value)} /></label>
        <button onClick={gen} className="rounded-lg border border-brand-500 bg-brand-500/10 text-brand-600 px-3 py-1.5 text-sm font-semibold">↻ Generate</button>
      </div>
      <div className="relative"><textarea readOnly className="input-area w-full font-mono text-lg tracking-widest" rows={3} value={out} /><CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}
