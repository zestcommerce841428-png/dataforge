"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── User Agent Parser ── */
export function UserAgentParser() {
  const [ua, setUa] = useState(typeof navigator !== "undefined" ? navigator.userAgent : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
  const detect = (s: string) => {
    let browser = "Unknown", bv = "";
    const bm =
      s.match(/(Edg|Edge)\/([\d.]+)/) ? ["Edge", s.match(/Edg\/([\d.]+)/)?.[1] ?? ""] :
      s.match(/OPR\/([\d.]+)/) ? ["Opera", s.match(/OPR\/([\d.]+)/)![1]] :
      s.match(/Firefox\/([\d.]+)/) ? ["Firefox", s.match(/Firefox\/([\d.]+)/)![1]] :
      s.match(/Chrome\/([\d.]+)/) ? ["Chrome", s.match(/Chrome\/([\d.]+)/)![1]] :
      s.match(/Version\/([\d.]+).*Safari/) ? ["Safari", s.match(/Version\/([\d.]+)/)![1]] : null;
    if (bm) { browser = bm[0]; bv = bm[1]; }
    let os = "Unknown";
    if (/Windows NT 10/.test(s)) os = "Windows 10/11"; else if (/Windows NT/.test(s)) os = "Windows";
    else if (/Mac OS X ([\d_]+)/.test(s)) os = "macOS " + (s.match(/Mac OS X ([\d_]+)/)?.[1].replace(/_/g, ".") ?? "");
    else if (/Android ([\d.]+)/.test(s)) os = "Android " + s.match(/Android ([\d.]+)/)![1];
    else if (/iPhone OS ([\d_]+)/.test(s)) os = "iOS " + s.match(/iPhone OS ([\d_]+)/)![1].replace(/_/g, ".");
    else if (/Linux/.test(s)) os = "Linux";
    const device = /Mobile|iPhone|Android/.test(s) ? (/iPad|Tablet/.test(s) ? "Tablet" : "Mobile") : "Desktop";
    const engine = /Gecko\/|Firefox/.test(s) && !/like Gecko/.test(s) ? "Gecko" : /AppleWebKit/.test(s) ? "WebKit/Blink" : "Unknown";
    return { browser, bv, os, device, engine };
  };
  const r = detect(ua);
  const rows: [string, string][] = [["Browser", `${r.browser} ${r.bv}`], ["OS", r.os], ["Device", r.device], ["Engine", r.engine]];
  return (
    <ToolWrap>
      <textarea className="input-area w-full font-mono text-xs mb-3" rows={3} value={ua} onChange={e => setUa(e.target.value)} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {rows.map(([l, v]) => <div key={l} className="surface rounded-xl border p-3 text-center"><div className="text-sm font-bold text-brand-600 break-words">{v}</div><div className="text-xs text-muted mt-1">{l}</div></div>)}
      </div>
    </ToolWrap>
  );
}

/* ── HTTP Header Analyzer ── */
const HEADER_INFO: Record<string, string> = {
  "content-type": "Media type of the resource body", "content-length": "Size of the body in bytes", "cache-control": "Caching directives for requests/responses", "set-cookie": "Sends a cookie from server to client", "authorization": "Credentials for authenticating the client", "user-agent": "Client application identifier", "accept": "Media types the client can process", "host": "Domain name of the server", "location": "URL to redirect to", "etag": "Version identifier for cache validation", "strict-transport-security": "Forces HTTPS (HSTS)", "x-frame-options": "Clickjacking protection", "content-security-policy": "Controls allowed resource sources", "access-control-allow-origin": "CORS allowed origins", "referer": "Address of the previous web page",
};
export function HttpHeaderAnalyzer() {
  const [text, setText] = useState("Content-Type: application/json\nCache-Control: max-age=3600\nX-Frame-Options: DENY\nStrict-Transport-Security: max-age=31536000");
  const parsed = text.split("\n").map(l => { const i = l.indexOf(":"); return i > 0 ? { name: l.slice(0, i).trim(), value: l.slice(i + 1).trim() } : null; }).filter(Boolean) as { name: string; value: string }[];
  return (
    <ToolWrap>
      <textarea className="input-area w-full font-mono text-xs mb-3" rows={5} value={text} onChange={e => setText(e.target.value)} placeholder="Paste raw HTTP headers…" />
      <div className="space-y-2">
        {parsed.map((h, i) => (
          <div key={i} className="surface rounded-xl border p-3">
            <div className="flex items-baseline gap-2 flex-wrap"><span className="font-mono text-sm font-bold text-brand-600">{h.name}</span><span className="font-mono text-xs break-all">{h.value}</span></div>
            <div className="text-xs text-muted mt-1">{HEADER_INFO[h.name.toLowerCase()] ?? "Custom or non-standard header"}</div>
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Common Ports Reference ── */
const PORTS: [number, string, string][] = [[20, "FTP-DATA", "TCP"], [21, "FTP", "TCP"], [22, "SSH", "TCP"], [23, "Telnet", "TCP"], [25, "SMTP", "TCP"], [53, "DNS", "TCP/UDP"], [67, "DHCP server", "UDP"], [68, "DHCP client", "UDP"], [80, "HTTP", "TCP"], [110, "POP3", "TCP"], [123, "NTP", "UDP"], [143, "IMAP", "TCP"], [161, "SNMP", "UDP"], [389, "LDAP", "TCP"], [443, "HTTPS", "TCP"], [465, "SMTPS", "TCP"], [587, "SMTP submission", "TCP"], [993, "IMAPS", "TCP"], [995, "POP3S", "TCP"], [1433, "MS SQL Server", "TCP"], [1521, "Oracle DB", "TCP"], [3306, "MySQL/MariaDB", "TCP"], [3389, "RDP", "TCP"], [5432, "PostgreSQL", "TCP"], [5672, "AMQP/RabbitMQ", "TCP"], [6379, "Redis", "TCP"], [8080, "HTTP alt", "TCP"], [8443, "HTTPS alt", "TCP"], [9200, "Elasticsearch", "TCP"], [27017, "MongoDB", "TCP"]];
export function PortReference() {
  const [q, setQ] = useState("");
  const filtered = PORTS.filter(([p, s]) => !q || String(p).includes(q) || s.toLowerCase().includes(q.toLowerCase()));
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3" placeholder="Search port or service…" value={q} onChange={e => setQ(e.target.value)} />
      <div className="max-h-72 overflow-auto space-y-1">
        {filtered.map(([p, s, proto]) => (
          <div key={p} className="surface flex items-center gap-3 rounded-lg border px-3 py-1.5 text-sm"><span className="font-mono font-bold text-brand-600 w-14">{p}</span><span className="flex-1">{s}</span><span className="text-xs text-muted">{proto}</span></div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Cookie Parser ── */
export function CookieParser() {
  const [text, setText] = useState("session_id=abc123; Path=/; HttpOnly; Secure; Max-Age=3600; SameSite=Strict");
  const parts = text.split(";").map(p => p.trim()).filter(Boolean);
  const first = parts[0]?.split("=");
  const attrs = parts.slice(1);
  return (
    <ToolWrap>
      <textarea className="input-area w-full font-mono text-xs mb-3" rows={3} value={text} onChange={e => setText(e.target.value)} placeholder="Paste a Set-Cookie value…" />
      <div className="surface rounded-xl border p-4 space-y-2">
        {first && <div className="flex gap-2"><span className="text-xs text-muted w-24">Name</span><span className="font-mono text-sm font-bold text-brand-600">{first[0]}</span></div>}
        {first && <div className="flex gap-2"><span className="text-xs text-muted w-24">Value</span><span className="font-mono text-sm break-all">{first.slice(1).join("=")}</span></div>}
        {attrs.map((a, i) => { const [k, v] = a.split("="); return <div key={i} className="flex gap-2"><span className="text-xs text-muted w-24">{k}</span><span className="font-mono text-sm">{v ?? "✓ flag"}</span></div>; })}
      </div>
    </ToolWrap>
  );
}

/* ── MAC Address Formatter ── */
export function MacAddressTool() {
  const [mac, setMac] = useState("00:1A:2B:3C:4D:5E");
  const clean = mac.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
  const valid = clean.length === 12;
  const pairs = clean.match(/.{1,2}/g) ?? [];
  const formats = valid ? {
    "Colon": pairs.join(":"), "Hyphen": pairs.join("-"), "Dot (Cisco)": (clean.match(/.{1,4}/g) ?? []).join("."), "Bare": clean,
  } : {};
  const firstByte = valid ? parseInt(pairs[0] ?? "0", 16) : 0;
  return (
    <ToolWrap>
      <input className="input-field w-full font-mono mb-3" value={mac} onChange={e => setMac(e.target.value)} />
      {valid ? (
        <>
          <div className="space-y-2 mb-3">
            {Object.entries(formats).map(([l, v]) => <div key={l} className="relative surface flex items-center gap-3 rounded-lg border px-3 py-2"><span className="text-xs text-muted w-24">{l}</span><span className="flex-1 font-mono text-sm">{v}</span><CopyBtn text={v} /></div>)}
          </div>
          <div className="surface rounded-xl border p-3 text-sm text-muted">
            OUI (vendor prefix): <strong className="text-brand-600">{pairs.slice(0, 3).join(":")}</strong> · {firstByte & 1 ? "Multicast" : "Unicast"} · {firstByte & 2 ? "Locally administered" : "Globally unique"}
          </div>
        </>
      ) : <p className="text-sm text-red-500">A MAC address needs 12 hex digits.</p>}
    </ToolWrap>
  );
}

/* ── CIDR → IP Range Expander ── */
export function IpRangeExpander() {
  const [cidr, setCidr] = useState("192.168.1.0/28");
  const parse = () => {
    const m = cidr.trim().match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/);
    if (!m) return { err: "Invalid CIDR (e.g. 192.168.1.0/24)" };
    const bits = +m[5]; if (bits < 0 || bits > 32) return { err: "Prefix must be 0–32" };
    const octets = m.slice(1, 5).map(Number);
    if (octets.some(o => o > 255)) return { err: "Octets must be 0–255" };
    const ipNum = (octets[0] << 24 | octets[1] << 16 | octets[2] << 8 | octets[3]) >>> 0;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    const network = (ipNum & mask) >>> 0, broadcast = (network | (~mask >>> 0)) >>> 0;
    const toIp = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
    const total = broadcast - network + 1;
    return { err: "", netNum: network, toIp, network: toIp(network), broadcast: toIp(broadcast), first: toIp(network + (bits < 31 ? 1 : 0)), last: toIp(broadcast - (bits < 31 ? 1 : 0)), total, usable: bits < 31 ? Math.max(0, total - 2) : total };
  };
  const r = parse();
  const list = !r.err && r.total! <= 256 ? Array.from({ length: r.total! }, (_, i) => r.toIp!((r.netNum! + i) >>> 0)) : [];
  return (
    <ToolWrap>
      <input className="input-field w-full font-mono mb-3" value={cidr} onChange={e => setCidr(e.target.value)} />
      {r.err ? <p className="text-sm text-red-500">{r.err}</p> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {[["Network", r.network], ["Broadcast", r.broadcast], ["First host", r.first], ["Last host", r.last], ["Total", String(r.total)], ["Usable", String(r.usable)]].map(([l, v]) => <div key={l} className="surface rounded-xl border p-3 text-center"><div className="font-mono text-sm font-bold text-brand-600">{v}</div><div className="text-xs text-muted">{l}</div></div>)}
          </div>
          {list.length > 0 && <div className="max-h-40 overflow-auto surface rounded-xl border p-3 font-mono text-xs columns-2 sm:columns-4">{list.map(ip => <div key={ip}>{ip}</div>)}</div>}
          {r.total! > 256 && <p className="text-xs text-muted">Range too large to list ({r.total!.toLocaleString()} addresses).</p>}
        </>
      )}
    </ToolWrap>
  );
}

/* ── Hostname Validator ── */
export function HostnameValidator() {
  const [host, setHost] = useState("sub.example-site.com");
  const h = host.trim();
  const checks = [
    { label: "Length ≤ 253", ok: h.length <= 253 && h.length > 0 },
    { label: "Valid characters (a-z 0-9 - .)", ok: /^[a-zA-Z0-9.-]+$/.test(h) },
    { label: "No leading/trailing dot or hyphen", ok: !/^[.-]|[.-]$/.test(h) },
    { label: "Each label 1–63 chars", ok: h.split(".").every(l => l.length >= 1 && l.length <= 63) },
    { label: "No label starts/ends with hyphen", ok: h.split(".").every(l => !/^-|-$/.test(l)) },
    { label: "No consecutive dots", ok: !/\.\./.test(h) },
  ];
  const valid = checks.every(c => c.ok);
  return (
    <ToolWrap>
      <input className="input-field w-full font-mono mb-3" value={host} onChange={e => setHost(e.target.value)} />
      <div className={`rounded-xl border p-3 mb-3 text-center font-bold ${valid ? "bg-green-500/10 border-green-400" : "bg-red-500/10 border-red-400"}`}>{valid ? "✓ Valid hostname" : "✗ Invalid hostname"}</div>
      <div className="space-y-1">{checks.map(c => <div key={c.label} className="flex items-center gap-2 text-sm"><span className={c.ok ? "text-green-600" : "text-red-500"}>{c.ok ? "✓" : "✗"}</span> {c.label}</div>)}</div>
    </ToolWrap>
  );
}

/* ── Accept-Language Parser ── */
export function AcceptLanguageParser() {
  const [text, setText] = useState("en-US,en;q=0.9,fr;q=0.8,de;q=0.7");
  const parsed = text.split(",").map(p => { const [lang, q] = p.trim().split(";"); return { lang: lang.trim(), q: q ? parseFloat(q.split("=")[1]) : 1 }; }).sort((a, b) => b.q - a.q);
  return (
    <ToolWrap>
      <input className="input-field w-full font-mono mb-3" value={text} onChange={e => setText(e.target.value)} />
      <div className="space-y-1">
        {parsed.map((p, i) => (
          <div key={i} className="surface flex items-center gap-3 rounded-lg border px-3 py-2">
            <span className="text-xs text-muted w-6">#{i + 1}</span>
            <span className="font-mono text-sm font-bold text-brand-600 flex-1">{p.lang}</span>
            <div className="w-32 h-2 rounded bg-[var(--border)] overflow-hidden"><div className="h-full bg-brand-500" style={{ width: `${p.q * 100}%` }} /></div>
            <span className="text-xs text-muted w-10 text-right">q={p.q}</span>
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Connection String Parser ── */
export function ConnectionStringParser() {
  const [text, setText] = useState("postgresql://user:pass@db.example.com:5432/mydb?sslmode=require");
  const parse = () => {
    try {
      const u = new URL(text.trim());
      return { ok: true, rows: [["Scheme", u.protocol.replace(":", "")], ["Username", u.username || "—"], ["Password", u.password ? "•".repeat(u.password.length) : "—"], ["Host", u.hostname], ["Port", u.port || "(default)"], ["Database", u.pathname.replace(/^\//, "") || "—"], ["Params", u.search ? [...u.searchParams].map(([k, v]) => `${k}=${v}`).join(", ") : "—"]] as [string, string][] };
    } catch { return { ok: false, rows: [] as [string, string][] }; }
  };
  const r = parse();
  return (
    <ToolWrap>
      <p className="text-xs text-muted mb-2">Supports URI-style strings (postgresql://, mysql://, mongodb://, redis://, amqp://…).</p>
      <input className="input-field w-full font-mono text-xs mb-3" value={text} onChange={e => setText(e.target.value)} />
      {r.ok ? (
        <div className="surface rounded-xl border divide-y divide-[var(--border)]">
          {r.rows.map(([l, v]) => <div key={l} className="flex gap-3 px-3 py-2"><span className="text-xs text-muted w-24">{l}</span><span className="font-mono text-sm break-all">{v}</span></div>)}
        </div>
      ) : <p className="text-sm text-red-500">Could not parse — check the format.</p>}
    </ToolWrap>
  );
}
