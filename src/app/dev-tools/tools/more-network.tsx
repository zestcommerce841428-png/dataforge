"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── CIDR Calculator ── */
export function CidrCalculator() {
  const [cidr, setCidr] = useState("192.168.1.0/24");
  const calc = (cidrStr: string) => {
    try {
      const [ip, prefix] = cidrStr.split("/");
      const p = parseInt(prefix);
      if (p < 0 || p > 32) return null;
      const ipNum = ip.split(".").reduce((acc, o) => (acc << 8) | parseInt(o), 0) >>> 0;
      const mask = p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0;
      const network = (ipNum & mask) >>> 0;
      const broadcast = (network | (~mask >>> 0)) >>> 0;
      const toIp = (n: number) => [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join(".");
      const hosts = p >= 31 ? Math.pow(2, 32 - p) : Math.pow(2, 32 - p) - 2;
      return { network: toIp(network), broadcast: toIp(broadcast), mask: toIp(mask), first: toIp(network + (p < 31 ? 1 : 0)), last: toIp(broadcast - (p < 31 ? 1 : 0)), hosts, prefix: p };
    } catch { return null; }
  };
  const r = calc(cidr);
  return (
    <ToolWrap>
      <input className="input-field w-full font-mono mb-3" placeholder="192.168.1.0/24" value={cidr} onChange={e=>setCidr(e.target.value)} />
      {r ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {[["Network Address",r.network],["Broadcast Address",r.broadcast],["Subnet Mask",r.mask],["First Usable IP",r.first],["Last Usable IP",r.last],["Usable Hosts",r.hosts.toLocaleString()],["Prefix Length",`/${r.prefix}`],["Total IPs",Math.pow(2,32-r.prefix).toLocaleString()]].map(([l,v])=>(
            <div key={String(l)} className="surface flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <span className="text-xs text-muted w-36 shrink-0">{l}</span>
              <span className="font-mono text-xs flex-1">{String(v)}</span>
              <CopyBtn text={String(v)} />
            </div>
          ))}
        </div>
      ) : cidr&&<p className="text-sm text-red-500">⚠ Invalid CIDR notation</p>}
    </ToolWrap>
  );
}

/* ── Email Validator ── */
export function EmailValidator() {
  const [emails, setEmails] = useState("alice@example.com\nbob@test.org\ninvalid@\n@nodomain.com\nvalid+tag@sub.domain.co.uk\nnot.an.email");
  const validate = (e: string) => {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    return re.test(e.trim());
  };
  const list = emails.split("\n").filter(e=>e.trim());
  const results = list.map(e=>({email:e.trim(),valid:validate(e)}));
  const validCount = results.filter(r=>r.valid).length;
  return (
    <ToolWrap>
      <textarea className="input-area h-32 font-mono text-sm mb-3" placeholder="One email per line…" value={emails} onChange={e=>setEmails(e.target.value)} />
      {results.length>0&&(
        <>
          <p className="text-sm text-muted mb-2">{validCount}/{results.length} valid</p>
          <div className="space-y-1 max-h-48 overflow-auto">
            {results.map(({email,valid},i)=>(
              <div key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${valid?"bg-green-50 dark:bg-green-950/20":"bg-red-50 dark:bg-red-950/20"}`}>
                <span className={valid?"text-green-600":"text-red-500"}>{valid?"✓":"✗"}</span>
                <span className="font-mono flex-1">{email}</span>
                <span className="text-xs text-muted">{valid?"valid":"invalid"}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolWrap>
  );
}

/* ── Domain Extractor ── */
export function DomainExtractor() {
  const [text, setText] = useState("Check out https://www.google.com and http://sub.example.co.uk/path?q=1 also ftp://files.example.org and example.net");
  const extract = (t: string) => {
    const urlRe = /https?:\/\/([a-zA-Z0-9.-]+)/g;
    const domainRe = /\b([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/g;
    const found = new Set<string>();
    let m;
    while((m=urlRe.exec(t))!==null) found.add(m[1]);
    while((m=domainRe.exec(t))!==null) { const d=m[0]; if(!found.has(d)&&!d.match(/^\d+\./)&&d.includes(".")) found.add(d); }
    return Array.from(found);
  };
  const domains = extract(text);
  return (
    <ToolWrap>
      <textarea className="input-area h-28 mb-3" placeholder="Paste text with URLs or domains…" value={text} onChange={e=>setText(e.target.value)} />
      {domains.length>0&&(
        <div className="space-y-1.5">
          <p className="text-xs text-muted">{domains.length} domain{domains.length!==1?"s":""} extracted:</p>
          {domains.map(d=>(
            <div key={d} className="surface flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
              <span className="font-mono text-sm">{d}</span>
              <CopyBtn text={d} />
            </div>
          ))}
          <CopyBtn text={domains.join("\n")} />
        </div>
      )}
    </ToolWrap>
  );
}

/* ── IPv4 / IPv6 Validator ── */
export function IpValidator() {
  const [ip, setIp] = useState("192.168.1.1");
  const isV4 = (s: string) => /^(\d{1,3}\.){3}\d{1,3}$/.test(s) && s.split(".").every(n=>+n<=255);
  const isV6 = (s: string) => /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(s);
  const isPrivate = (s: string) => /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.|169\.254\.|::1$|fc[0-9a-f]{2}:|fd[0-9a-f]{2}:)/.test(s);
  const v4 = isV4(ip); const v6 = isV6(ip);
  const valid = v4||v6;
  const priv = valid&&isPrivate(ip);
  return (
    <ToolWrap>
      <input className="input-field w-full font-mono mb-3" placeholder="192.168.1.1 or 2001:db8::1" value={ip} onChange={e=>setIp(e.target.value)} />
      {ip&&(
        <div className="space-y-2">
          {[["Valid IP",valid],["IPv4",v4],["IPv6",v6],["Private/Loopback",priv]].map(([l,ok])=>(
            <div key={String(l)} className="surface flex items-center gap-3 rounded-lg border px-3 py-2 text-sm">
              <span className={ok?"text-green-500":"text-muted"}>{ok?"✓":"○"}</span>
              <span>{l}</span>
            </div>
          ))}
        </div>
      )}
    </ToolWrap>
  );
}

/* ── Webhook Tester ── */
export function WebhookTester() {
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<number|null>(null);
  const [url, setUrl] = useState("https://httpbin.org/post");
  const [payload, setPayload] = useState('{\n  "event": "test",\n  "timestamp": "'+new Date().toISOString()+'",\n  "data": { "key": "value" }\n}');
  const [loading, setLoading] = useState(false);
  const send = async () => {
    setLoading(true);
    try {
      const r = await fetch(url, { method:"POST", headers:{"Content-Type":"application/json"}, body:payload });
      setStatus(r.status);
      setResponse(JSON.stringify(await r.json(),null,2));
    } catch(e) { setResponse("⚠ "+(e as Error).message); }
    setLoading(false);
  };
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3 font-mono text-sm" placeholder="Webhook URL…" value={url} onChange={e=>setUrl(e.target.value)} />
      <textarea className="input-area h-32 font-mono text-xs mb-3" value={payload} onChange={e=>setPayload(e.target.value)} />
      <button className="btn-primary mb-3" onClick={send} disabled={loading}>{loading?"Sending…":"Send Webhook POST"}</button>
      {status&&<p className={`text-sm font-semibold mb-2 ${status<300?"text-green-600":status<400?"text-yellow-600":"text-red-500"}`}>Response: HTTP {status}</p>}
      {response&&<div className="relative"><textarea className="input-area h-36 pr-10 font-mono text-xs" readOnly value={response} /><CopyBtn text={response} absolute /></div>}
    </ToolWrap>
  );
}

/* ── OG Tags Checker ── */
export function OgTagsChecker() {
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState<Record<string,string>|null>(null);
  const [error, setError] = useState("");
  const check = async () => {
    setError(""); setTags(null);
    try {
      const r = await fetch(`/api/og-check?url=${encodeURIComponent(url)}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setTags(await r.json());
    } catch(e) { setError((e as Error).message); }
  };
  return (
    <ToolWrap>
      <div className="flex gap-2 mb-3">
        <input className="input-field flex-1" placeholder="https://example.com" value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} />
        <button className="btn-primary" onClick={check} disabled={!url}>Check</button>
      </div>
      {error&&<p className="text-sm text-red-500">⚠ {error}</p>}
      {tags&&(
        <div className="space-y-2">
          {Object.entries(tags).map(([k,v])=>(
            <div key={k} className="surface flex items-start gap-2 rounded-lg border px-3 py-2 text-sm">
              <span className="font-mono text-xs text-brand-600 w-32 shrink-0">{k}</span>
              <span className="flex-1 text-xs break-all">{v}</span>
            </div>
          ))}
        </div>
      )}
    </ToolWrap>
  );
}

/* ── Punycode Converter ── */
export function PunycodeConverter() {
  const [input, setInput] = useState("münchen.de");
  const toPuny = (domain: string) => {
    try { return new URL(`http://${domain}`).hostname; } catch { return "⚠ Invalid domain"; }
  };
  const fromPuny = (domain: string) => {
    try { const u=new URL(`http://${domain}`); return u.hostname; } catch { return domain; }
  };
  const encoded = toPuny(input);
  const decoded = fromPuny(input);
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3 font-mono" placeholder="münchen.de or xn--mnchen-3ya.de" value={input} onChange={e=>setInput(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        {[["Punycode (encoded)",encoded],["Unicode (decoded)",decoded]].map(([l,v])=>(
          <div key={String(l)} className="relative">
            <p className="text-xs text-muted mb-1">{l}</p>
            <div className="surface rounded-xl border px-3 py-2 font-mono text-sm pr-10">{v}</div>
            <CopyBtn text={v} absolute />
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── SSL Certificate Info ── */
export function SslInfo() {
  const [domain, setDomain] = useState("example.com");
  const [info, setInfo] = useState("");
  const check = async () => {
    setInfo("Checking SSL certificate...\n\n⚠ Note: Browsers do not expose full SSL certificate data via JavaScript for security reasons.\n\nTo inspect a certificate:\n  • Chrome: Click the padlock → Certificate\n  • Firefox: Click the padlock → More information\n  • Terminal: openssl s_client -connect "+domain+":443 -showcerts 2>/dev/null | openssl x509 -text -noout\n\nBasic info via fetch:\n");
    try {
      const r = await fetch(`https://${domain}`);
      setInfo(prev=>prev+`✓ HTTPS responded with HTTP ${r.status}\n✓ Domain appears to have valid SSL certificate`);
    } catch(e) {
      setInfo(prev=>prev+"✗ Could not connect: "+(e as Error).message);
    }
  };
  return (
    <ToolWrap>
      <div className="flex gap-2 mb-3">
        <input className="input-field flex-1 font-mono" placeholder="example.com" value={domain} onChange={e=>setDomain(e.target.value)} />
        <button className="btn-primary" onClick={check}>Check</button>
      </div>
      {info&&<pre className="input-area h-40 font-mono text-xs overflow-auto">{info}</pre>}
    </ToolWrap>
  );
}
