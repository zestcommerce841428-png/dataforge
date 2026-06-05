"use client";
import { useEffect, useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── UTM Link Builder ── */
export function UTMLinkBuilder() {
  const [base, setBase] = useState("https://example.com/page");
  const [p, setP] = useState({ source: "newsletter", medium: "email", campaign: "spring_sale", term: "", content: "" });
  const set = (k: keyof typeof p) => (e: React.ChangeEvent<HTMLInputElement>) => setP({ ...p, [k]: e.target.value });
  const qs = new URLSearchParams();
  if (p.source) qs.set("utm_source", p.source);
  if (p.medium) qs.set("utm_medium", p.medium);
  if (p.campaign) qs.set("utm_campaign", p.campaign);
  if (p.term) qs.set("utm_term", p.term);
  if (p.content) qs.set("utm_content", p.content);
  const out = base + (qs.toString() ? (base.includes("?") ? "&" : "?") + qs.toString() : "");
  return (
    <ToolWrap>
      <label className="mb-2 block text-sm">Website URL<input className="input-field mt-1 w-full" value={base} onChange={(e) => setBase(e.target.value)} /></label>
      <div className="grid gap-2 sm:grid-cols-2">
        {(["source", "medium", "campaign", "term", "content"] as const).map((k) => <label key={k} className="text-sm capitalize">{k}{(k === "source" || k === "medium" || k === "campaign") && " *"}<input className="input-field mt-1 w-full" value={p[k]} onChange={set(k)} /></label>)}
      </div>
      <div className="relative surface mt-3 rounded-xl border p-3 font-mono text-sm break-all">{out}<CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── Image Placeholder URL ── */
export function ImagePlaceholderURL() {
  const [w, setW] = useState(600), [h, setH] = useState(400), [svc, setSvc] = useState("picsum");
  const url = svc === "picsum" ? `https://picsum.photos/${w}/${h}` : `https://placehold.co/${w}x${h}`;
  return (
    <ToolWrap>
      <div className="mb-3 flex flex-wrap gap-2"><label className="text-sm">W<input type="number" className="input-field mx-1 w-24" value={w} onChange={(e) => setW(+e.target.value)} /></label><label className="text-sm">H<input type="number" className="input-field mx-1 w-24" value={h} onChange={(e) => setH(+e.target.value)} /></label><select className="input-field" value={svc} onChange={(e) => setSvc(e.target.value)}><option value="picsum">Lorem Picsum (photo)</option><option value="placehold">placehold.co (gray)</option></select></div>
      <div className="relative surface rounded-xl border p-3 font-mono text-sm break-all">{url}<CopyBtn text={url} absolute /></div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="placeholder preview" className="mt-3 max-h-48 rounded-lg border border-[var(--border)]" />
    </ToolWrap>
  );
}

/* ── HTML → Markdown ── */
export function HtmlToMarkdown() {
  const [html, setHtml] = useState("<h1>Title</h1>\n<p>A <strong>bold</strong> and <a href='https://x.com'>link</a>.</p>\n<ul><li>one</li><li>two</li></ul>");
  const md = html
    .replace(/<h([1-6])>(.*?)<\/h\1>/gi, (_, n, t) => "\n" + "#".repeat(+n) + " " + t + "\n")
    .replace(/<strong>(.*?)<\/strong>|<b>(.*?)<\/b>/gi, (_, a, b) => `**${a || b}**`)
    .replace(/<em>(.*?)<\/em>|<i>(.*?)<\/i>/gi, (_, a, b) => `*${a || b}*`)
    .replace(/<a [^>]*href=['"]([^'"]*)['"][^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<li>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<\/?(ul|ol)>/gi, "")
    .replace(/<p>(.*?)<\/p>/gi, "\n$1\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n").trim();
  return (
    <ToolWrap><div className="grid gap-3 sm:grid-cols-2"><textarea className="input-area w-full font-mono text-xs" rows={8} value={html} onChange={(e) => setHtml(e.target.value)} /><div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={8} value={md} /><CopyBtn text={md} absolute /></div></div></ToolWrap>
  );
}

/* ── Srcset Generator ── */
export function SrcsetGenerator() {
  const [name, setName] = useState("hero"), [ext, setExt] = useState("jpg"), [widths, setWidths] = useState("400, 800, 1200, 1600");
  const ws = widths.split(",").map((s) => parseInt(s.trim())).filter(Boolean);
  const srcset = ws.map((w) => `${name}-${w}.${ext} ${w}w`).join(",\n  ");
  const out = `<img\n  src="${name}-${ws[ws.length - 1] ?? 800}.${ext}"\n  srcset="\n  ${srcset}"\n  sizes="(max-width: 768px) 100vw, 50vw"\n  alt="" />`;
  return (
    <ToolWrap>
      <div className="mb-3 grid gap-2 sm:grid-cols-3"><label className="text-sm">Base name<input className="input-field mt-1 w-full" value={name} onChange={(e) => setName(e.target.value)} /></label><label className="text-sm">Ext<input className="input-field mt-1 w-full" value={ext} onChange={(e) => setExt(e.target.value)} /></label><label className="text-sm">Widths<input className="input-field mt-1 w-full" value={widths} onChange={(e) => setWidths(e.target.value)} /></label></div>
      <div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={7} value={out} /><CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── Email Signature ── */
export function EmailSignatureGenerator() {
  const [f, setF] = useState({ name: "Naushad Alam", title: "Founder", company: "DataForge", phone: "+91 74920 68998", email: "contact@zestcommerce.in", site: "dataforge" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const html = `<table style="font-family:Arial,sans-serif;font-size:13px;color:#333">
  <tr><td style="font-weight:bold;font-size:16px;color:#1f59e0">${f.name}</td></tr>
  <tr><td>${f.title}${f.company ? " · " + f.company : ""}</td></tr>
  <tr><td>${f.phone ? "📞 " + f.phone + "  " : ""}${f.email ? "✉ " + f.email : ""}</td></tr>
  ${f.site ? `<tr><td><a href="https://${f.site}" style="color:#1f59e0">${f.site}</a></td></tr>` : ""}
</table>`;
  return (
    <ToolWrap>
      <div className="mb-3 grid gap-2 sm:grid-cols-2">{(Object.keys(f) as (keyof typeof f)[]).map((k) => <label key={k} className="text-sm capitalize">{k}<input className="input-field mt-1 w-full" value={f[k]} onChange={set(k)} /></label>)}</div>
      <p className="mb-1 text-xs text-muted">Preview</p>
      <div className="surface rounded-xl border p-4" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="relative mt-2"><textarea readOnly className="input-area w-full font-mono text-xs" rows={5} value={html} /><CopyBtn text={html} absolute /></div>
    </ToolWrap>
  );
}

/* ── Social Share Link Generator ── */
export function SocialShareLinks() {
  const [url, setUrl] = useState("https://example.com"), [text, setText] = useState("Check this out!");
  const u = encodeURIComponent(url), t = encodeURIComponent(text);
  const links: [string, string][] = [
    ["WhatsApp", `https://wa.me/?text=${t}%20${u}`],
    ["Twitter / X", `https://twitter.com/intent/tweet?text=${t}&url=${u}`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${u}`],
    ["Telegram", `https://t.me/share/url?url=${u}&text=${t}`],
    ["Email", `mailto:?subject=${t}&body=${u}`],
  ];
  return (
    <ToolWrap>
      <div className="mb-3 grid gap-2 sm:grid-cols-2"><label className="text-sm">URL<input className="input-field mt-1 w-full" value={url} onChange={(e) => setUrl(e.target.value)} /></label><label className="text-sm">Text<input className="input-field mt-1 w-full" value={text} onChange={(e) => setText(e.target.value)} /></label></div>
      <div className="space-y-1">{links.map(([n, l]) => <div key={n} className="surface flex items-center gap-2 rounded-lg border px-3 py-2"><span className="w-24 text-sm font-medium">{n}</span><a href={l} target="_blank" rel="noopener noreferrer" className="flex-1 truncate font-mono text-xs text-brand-600">{l}</a><CopyBtn text={l} /></div>)}</div>
    </ToolWrap>
  );
}

/* ── JSON ↔ Query String ── */
export function JsonQueryString() {
  const [text, setText] = useState('{\n  "page": 2,\n  "sort": "name",\n  "active": true\n}'), [dir, setDir] = useState<"toQs" | "toJson">("toQs");
  let out = "";
  try {
    if (dir === "toQs") { const o = JSON.parse(text); out = new URLSearchParams(Object.entries(o).map(([k, v]) => [k, String(v)])).toString(); }
    else { const o: Record<string, string> = {}; new URLSearchParams(text.replace(/^\?/, "")).forEach((v, k) => { o[k] = v; }); out = JSON.stringify(o, null, 2); }
  } catch (e) { out = "Error: " + (e as Error).message; }
  return (
    <ToolWrap>
      <div className="mb-3 flex gap-2">{([["toQs", "JSON → query"], ["toJson", "Query → JSON"]] as const).map(([m, l]) => <button key={m} onClick={() => setDir(m)} className={`rounded-lg border px-3 py-1.5 text-sm ${dir === m ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{l}</button>)}</div>
      <div className="grid gap-3 sm:grid-cols-2"><textarea className="input-area w-full font-mono text-xs" rows={6} value={text} onChange={(e) => setText(e.target.value)} /><div className="relative"><textarea readOnly className="input-area w-full font-mono text-xs" rows={6} value={out} /><CopyBtn text={out} absolute /></div></div>
    </ToolWrap>
  );
}

/* ── Meta Robots Builder ── */
export function MetaRobotsBuilder() {
  const [o, setO] = useState({ index: true, follow: true, noarchive: false, nosnippet: false, noimageindex: false });
  const parts: string[] = [];
  parts.push(o.index ? "index" : "noindex");
  parts.push(o.follow ? "follow" : "nofollow");
  if (o.noarchive) parts.push("noarchive");
  if (o.nosnippet) parts.push("nosnippet");
  if (o.noimageindex) parts.push("noimageindex");
  const out = `<meta name="robots" content="${parts.join(", ")}">`;
  const toggles: [keyof typeof o, string][] = [["index", "Index this page"], ["follow", "Follow links"], ["noarchive", "No cached copy"], ["nosnippet", "No snippet"], ["noimageindex", "No image indexing"]];
  return (
    <ToolWrap>
      <div className="mb-3 space-y-1">{toggles.map(([k, l]) => <label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={o[k]} onChange={(e) => setO({ ...o, [k]: e.target.checked })} /> {l}</label>)}</div>
      <div className="relative surface rounded-xl border p-3 font-mono text-sm break-all">{out}<CopyBtn text={out} absolute /></div>
    </ToolWrap>
  );
}

/* ── Screen / Viewport Info ── */
export function ScreenInfo() {
  const [info, setInfo] = useState<[string, string][]>([]);
  useEffect(() => {
    const upd = () => setInfo([
      ["Viewport", `${window.innerWidth} × ${window.innerHeight}`],
      ["Screen", `${screen.width} × ${screen.height}`],
      ["Avail. screen", `${screen.availWidth} × ${screen.availHeight}`],
      ["Device pixel ratio", String(window.devicePixelRatio)],
      ["Color depth", screen.colorDepth + "-bit"],
      ["Orientation", screen.orientation?.type ?? "—"],
      ["Touch points", String(navigator.maxTouchPoints)],
      ["Language", navigator.language],
    ]);
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);
  return <ToolWrap><div className="grid grid-cols-2 gap-3">{info.map(([l, v]) => <div key={l} className="surface rounded-xl border p-3 text-center"><div className="font-mono text-sm font-bold text-brand-600">{v}</div><div className="text-xs text-muted">{l}</div></div>)}</div></ToolWrap>;
}
