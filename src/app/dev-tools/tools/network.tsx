"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";
import { executeRecaptcha } from "@/components/recaptcha";

/* ── URL Shortener ── */
export function UrlShortener() {
  const [url, setUrl] = useState("");
  const [service, setService] = useState("tinyurl");
  const [results, setResults] = useState<{service:string;short:string;original:string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const SERVICES = [["tinyurl","TinyURL"],["isgd","is.gd"],["vgd","v.gd"],["all","All services"]];
  const shorten = async () => {
    setLoading(true); setError(""); setResults([]);
    const recaptchaToken = await executeRecaptcha("shorten");
    const toTry = service==="all"?["tinyurl","isgd","vgd"]:[service];
    const out: typeof results = [];
    await Promise.allSettled(toTry.map(async s => {
      const r = await fetch("/api/shorten", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({url, service:s, recaptchaToken}) });
      const d = await r.json();
      if (d.short) out.push(d);
    }));
    if (out.length) setResults(out);
    else setError("Shortening failed. Check the URL and try again.");
    setLoading(false);
  };
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3 flex-wrap">
        <input className="input-field flex-1 min-w-60" placeholder="https://example.com/very/long/url" value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&shorten()} />
        <select className="input-field w-40" value={service} onChange={e=>setService(e.target.value)}>
          {SERVICES.map(([v,l])=><option key={v} value={v}>{l}</option>)}
        </select>
        <button className="btn-primary" onClick={shorten} disabled={!url||loading}>{loading?"Shortening…":"Shorten"}</button>
      </div>
      {error&&<p className="text-sm text-red-500 mb-2">⚠ {error}</p>}
      <div className="space-y-2">
        {results.map(r=>(
          <div key={r.service} className="surface flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
            <div>
              <span className="text-xs text-muted font-semibold uppercase">{r.service} · </span>
              <a href={r.short} target="_blank" rel="noopener noreferrer" className="font-mono text-brand-600 hover:underline">{r.short}</a>
            </div>
            <CopyBtn text={r.short} />
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── URL Parser ── */
export function UrlParser() {
  const [url, setUrl] = useState("https://user:pass@example.com:8080/path/to/page?q=hello&lang=en#section");
  const parse = (u: string) => {
    try {
      const p = new URL(u);
      return {
        protocol: p.protocol, host: p.host, hostname: p.hostname, port: p.port||"(default)",
        pathname: p.pathname, search: p.search, hash: p.hash, username: p.username, password: p.password,
        params: Object.fromEntries(p.searchParams),
      };
    } catch { return null; }
  };
  const p = parse(url);
  return (
    <ToolWrap>
      <input className="input-field w-full font-mono mb-3" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/path?q=test" />
      {p ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(p).filter(([,v])=>typeof v==="string"&&v).map(([k,v])=>(
            <div key={k} className="surface flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <span className="text-xs text-muted w-20 shrink-0">{k}</span>
              <span className="font-mono text-xs flex-1 truncate">{String(v)}</span>
              <CopyBtn text={String(v)} />
            </div>
          ))}
          {p.params&&Object.keys(p.params).length>0&&(
            <div className="col-span-full surface rounded-lg border px-3 py-2 text-sm">
              <p className="text-xs text-muted mb-1">Query params</p>
              {Object.entries(p.params).map(([k,v])=>(
                <div key={k} className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-brand-600 dark:text-brand-400">{k}</span>
                  <span className="text-muted">=</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : <p className="text-sm text-red-500">⚠ Invalid URL</p>}
    </ToolWrap>
  );
}

/* ── URL Builder ── */
export function UrlBuilder() {
  const [proto, setProto] = useState("https");
  const [host, setHost] = useState("example.com");
  const [path, setPath] = useState("/api/v1/users");
  const [params, setParams] = useState([{k:"page",v:"1"},{k:"limit",v:"20"}]);
  const [hash, setHash] = useState("");
  const built = `${proto}://${host}${path}${params.filter(p=>p.k).length?`?${params.filter(p=>p.k).map(p=>`${encodeURIComponent(p.k)}=${encodeURIComponent(p.v)}`).join("&")}`:""} ${hash?"#"+hash:""}`.trim();
  const addParam = ()=>setParams([...params,{k:"",v:""}]);
  const removeParam = (i:number)=>setParams(params.filter((_,j)=>j!==i));
  return (
    <ToolWrap>
      <div className="grid gap-2 sm:grid-cols-3 mb-3">
        <select className="input-field" value={proto} onChange={e=>setProto(e.target.value)}><option value="https">https</option><option value="http">http</option><option value="ftp">ftp</option></select>
        <input className="input-field" placeholder="hostname" value={host} onChange={e=>setHost(e.target.value)} />
        <input className="input-field" placeholder="/path" value={path} onChange={e=>setPath(e.target.value)} />
      </div>
      <div className="space-y-2 mb-3">
        {params.map((p,i)=>(
          <div key={i} className="flex gap-2">
            <input className="input-field flex-1" placeholder="key" value={p.k} onChange={e=>setParams(params.map((x,j)=>j===i?{...x,k:e.target.value}:x))} />
            <span className="text-muted mt-2">=</span>
            <input className="input-field flex-1" placeholder="value" value={p.v} onChange={e=>setParams(params.map((x,j)=>j===i?{...x,v:e.target.value}:x))} />
            <button onClick={()=>removeParam(i)} className="text-muted hover:text-red-500 px-2">✕</button>
          </div>
        ))}
        <button onClick={addParam} className="text-sm text-brand-600 hover:underline">+ Add param</button>
      </div>
      <input className="input-field w-full mb-3" placeholder="hash (without #)" value={hash} onChange={e=>setHash(e.target.value)} />
      <div className="relative surface rounded-xl border p-3">
        <p className="font-mono text-sm break-all pr-12">{built}</p>
        <CopyBtn text={built} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── IP Lookup ── */
export function IpLookup() {
  const [ip, setIp] = useState("");
  const [data, setData] = useState<Record<string,unknown>|null>(null);
  const [loading, setLoading] = useState(false);
  const lookup = async () => {
    setLoading(true);
    const r = await fetch(`/api/ip-lookup?ip=${encodeURIComponent(ip)}`);
    setData(await r.json());
    setLoading(false);
  };
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3">
        <input className="input-field flex-1" placeholder="IP address (blank = your IP)" value={ip} onChange={e=>setIp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&lookup()} />
        <button className="btn-primary" onClick={lookup} disabled={loading}>{loading?"…":"Lookup"}</button>
      </div>
      {data&&data.status==="success"&&(
        <div className="grid gap-2 sm:grid-cols-2">
          {([["IP",String(data.query)],["Country",`${data.country} (${data.countryCode})`],["Region",String(data.regionName)],["City",String(data.city)],["Timezone",String(data.timezone)],["ISP",String(data.isp)],["Org",String(data.org)],["AS",String(data.as)],["Lat/Lon",`${data.lat}, ${data.lon}`]] as [string,string][]).map(([l,v])=>(
            <div key={l} className="surface flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <span className="text-xs text-muted w-20 shrink-0">{l}</span>
              <span className="text-xs flex-1 truncate">{v}</span>
            </div>
          ))}
        </div>
      )}
      {data&&data.status==="fail"&&<p className="text-sm text-red-500">⚠ {String(data.message)}</p>}
    </ToolWrap>
  );
}

/* ── DNS Lookup ── */
export function DnsLookup() {
  const [domain, setDomain] = useState("");
  const [types, setTypes] = useState(["A","AAAA","MX","TXT","NS","CNAME"]);
  const [results, setResults] = useState<Record<string,unknown>|null>(null);
  const [loading, setLoading] = useState(false);
  const ALL_TYPES = ["A","AAAA","MX","TXT","NS","CNAME","SOA","SRV","CAA","PTR"];
  const lookup = async () => {
    setLoading(true);
    const r = await fetch(`/api/dns?name=${encodeURIComponent(domain)}&type=${types.join(",")}`);
    setResults(await r.json());
    setLoading(false);
  };
  const toggle = (t:string)=>setTypes(types.includes(t)?types.filter(x=>x!==t):[...types,t]);
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-3 flex-wrap">
        <input className="input-field flex-1 min-w-48" placeholder="example.com" value={domain} onChange={e=>setDomain(e.target.value)} onKeyDown={e=>e.key==="Enter"&&lookup()} />
        <button className="btn-primary" onClick={lookup} disabled={!domain||loading}>{loading?"…":"Lookup"}</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {ALL_TYPES.map(t=>(
          <button key={t} onClick={()=>toggle(t)} className={`rounded-lg border px-2.5 py-1 text-xs font-mono font-medium ${types.includes(t)?"border-brand-500 bg-brand-500/10 text-brand-600":"surface hover:border-brand-400"}`}>{t}</button>
        ))}
      </div>
      {results&&(
        <div className="space-y-3 max-h-72 overflow-auto">
          {Object.entries(results).map(([type, data])=>{
            const answers = (data as {Answer?:{data:string;TTL:number}[]}).Answer;
            return (
              <div key={type} className="surface rounded-lg border p-3">
                <p className="font-mono text-xs font-bold text-brand-600 mb-2">{type}</p>
                {answers?.length ? answers.map((a,i)=>(
                  <div key={i} className="flex items-center gap-2 text-xs font-mono"><span className="flex-1 break-all">{a.data}</span><span className="text-muted shrink-0">TTL {a.TTL}s</span></div>
                )) : <p className="text-xs text-muted">No records</p>}
              </div>
            );
          })}
        </div>
      )}
    </ToolWrap>
  );
}

/* ── Query String Parser ── */
export function QueryStringParser() {
  const [qs, setQs] = useState("page=1&limit=20&sort=name&order=asc&tags=a,b,c");
  const parsed = (() => {
    try {
      const params = new URLSearchParams(qs.startsWith("?")?qs.slice(1):qs);
      return Object.fromEntries(params);
    } catch { return {}; }
  })();
  const built = (() => {
    try {
      return JSON.stringify(JSON.parse(qs.trim()),null,2);
    } catch { return ""; }
  })();
  return (
    <ToolWrap>
      <textarea className="input-area h-20 font-mono text-xs mb-3" value={qs} onChange={e=>setQs(e.target.value)} placeholder="key=value&another=123" />
      <div className="relative">
        <p className="text-xs text-muted mb-1">Parsed object</p>
        <pre className="rounded-xl bg-[var(--surface-2)] border p-3 font-mono text-xs pr-8 overflow-auto">{JSON.stringify(parsed,null,2)}</pre>
        <CopyBtn text={JSON.stringify(parsed,null,2)} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── Meta Tag Generator ── */
export function MetaTagGenerator() {
  const [title, setTitle] = useState("My Awesome Page");
  const [desc, setDesc] = useState("A brief description of the page content.");
  const [keywords, setKeywords] = useState("keyword1, keyword2, keyword3");
  const [author, setAuthor] = useState("");
  const [ogImg, setOgImg] = useState("https://example.com/og.png");
  const [twitter, setTwitter] = useState("@username");
  const meta = [
    `<title>${title}</title>`,
    `<meta name="description" content="${desc}">`,
    keywords?`<meta name="keywords" content="${keywords}">`:null,
    author?`<meta name="author" content="${author}">`:null,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${desc}">`,
    ogImg?`<meta property="og:image" content="${ogImg}">`:null,
    `<meta name="twitter:card" content="summary_large_image">`,
    twitter?`<meta name="twitter:site" content="${twitter}">`:null,
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${desc}">`,
  ].filter(Boolean).join("\n");
  return (
    <ToolWrap>
      <div className="grid gap-3 sm:grid-cols-2 mb-3">
        {([["Title",title,setTitle],["Description",desc,setDesc],["Keywords",keywords,setKeywords],["Author",author,setAuthor],["OG Image URL",ogImg,setOgImg],["Twitter handle",twitter,setTwitter]] as [string,string,(v:string)=>void][]).map(([l,v,set])=>(
          <div key={String(l)}>
            <label className="text-xs text-muted mb-1 block">{l}</label>
            <input className="input-field w-full" value={String(v)} onChange={e=>(set as (v:string)=>void)(e.target.value)} />
          </div>
        ))}
      </div>
      <div className="relative">
        <textarea className="input-area h-48 pr-10 font-mono text-xs" readOnly value={meta} />
        <CopyBtn text={meta} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── Robots.txt Generator ── */
export function RobotsTxtGenerator() {
  const [rules, setRules] = useState([{agent:"*",allow:["/"],disallow:["/admin","/private"]}]);
  const [sitemap, setSitemap] = useState("https://example.com/sitemap.xml");
  const output = [...rules.map(r=>`User-agent: ${r.agent}\n${r.allow.filter(Boolean).map(p=>`Allow: ${p}`).join("\n")}\n${r.disallow.filter(Boolean).map(p=>`Disallow: ${p}`).join("\n")}`), sitemap?`Sitemap: ${sitemap}`:null].filter(Boolean).join("\n\n");
  return (
    <ToolWrap>
      <div className="space-y-3 mb-3">
        {rules.map((r,i)=>(
          <div key={i} className="surface rounded-xl border p-4">
            <div className="flex gap-2 mb-2">
              <input className="input-field flex-1" placeholder="User-agent (*)" value={r.agent} onChange={e=>setRules(rules.map((x,j)=>j===i?{...x,agent:e.target.value}:x))} />
            </div>
            <input className="input-field w-full mb-2 text-sm" placeholder="Allow paths (comma separated)" value={r.allow.join(",")} onChange={e=>setRules(rules.map((x,j)=>j===i?{...x,allow:e.target.value.split(",")}:x))} />
            <input className="input-field w-full text-sm" placeholder="Disallow paths (comma separated)" value={r.disallow.join(",")} onChange={e=>setRules(rules.map((x,j)=>j===i?{...x,disallow:e.target.value.split(",")}:x))} />
          </div>
        ))}
        <input className="input-field w-full" placeholder="Sitemap URL" value={sitemap} onChange={e=>setSitemap(e.target.value)} />
      </div>
      <div className="relative">
        <textarea className="input-area h-32 pr-10 font-mono text-xs" readOnly value={output} />
        <CopyBtn text={output} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── CORS Header Generator ── */
export function CorsGenerator() {
  const [origin, setOrigin] = useState("*");
  const [methods, setMethods] = useState(["GET","POST","PUT","DELETE","OPTIONS"]);
  const [headers, setHeaders] = useState("Content-Type, Authorization");
  const [creds, setCreds] = useState(false);
  const [maxAge, setMaxAge] = useState("86400");
  const ALL_METHODS = ["GET","POST","PUT","PATCH","DELETE","OPTIONS","HEAD"];
  const toggle = (m:string)=>setMethods(methods.includes(m)?methods.filter(x=>x!==m):[...methods,m]);
  const corsHeaders = [
    `Access-Control-Allow-Origin: ${origin}`,
    `Access-Control-Allow-Methods: ${methods.join(", ")}`,
    headers?`Access-Control-Allow-Headers: ${headers}`:null,
    creds?"Access-Control-Allow-Credentials: true":null,
    maxAge?`Access-Control-Max-Age: ${maxAge}`:null,
  ].filter(Boolean).join("\n");
  return (
    <ToolWrap>
      <div className="space-y-3 mb-3">
        <input className="input-field w-full" placeholder="Origin (* or https://example.com)" value={origin} onChange={e=>setOrigin(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {ALL_METHODS.map(m=>(
            <button key={m} onClick={()=>toggle(m)} className={`rounded-lg border px-2.5 py-1 text-xs font-mono ${methods.includes(m)?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{m}</button>
          ))}
        </div>
        <input className="input-field w-full" placeholder="Allowed headers" value={headers} onChange={e=>setHeaders(e.target.value)} />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={creds} onChange={e=>setCreds(e.target.checked)} /> Allow Credentials</label>
          <input className="input-field w-32" placeholder="Max-Age (s)" value={maxAge} onChange={e=>setMaxAge(e.target.value)} />
        </div>
      </div>
      <div className="relative">
        <textarea className="input-area h-32 pr-10 font-mono text-xs" readOnly value={corsHeaders} />
        <CopyBtn text={corsHeaders} absolute />
      </div>
    </ToolWrap>
  );
}
