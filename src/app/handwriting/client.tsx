"use client";
import { useCallback, useEffect, useState } from "react";

const FONTS = [
  "Caveat", "Dancing Script", "Patrick Hand", "Shadows Into Light", "Indie Flower",
  "Homemade Apple", "Gloria Hallelujah", "Reenie Beanie", "Kalam", "Sacramento",
  "Satisfy", "Pacifico", "Permanent Marker", "Rock Salt", "Nanum Pen Script",
  "Cookie", "Architects Daughter", "Covered By Your Grace", "La Belle Aurore",
  "Zeyada", "Gochi Hand", "Liu Jian Mao Cao",
];

const INKS = [
  { name: "Blue", value: "#1a3fb0" }, { name: "Black", value: "#101418" },
  { name: "Royal", value: "#283593" }, { name: "Red", value: "#b00020" },
  { name: "Green", value: "#1b5e20" }, { name: "Purple", value: "#5e35b1" },
  { name: "Teal", value: "#00695c" }, { name: "Brown", value: "#5d4037" },
];

type Paper = "ruled" | "blank" | "grid" | "dotted" | "graph" | "legal" | "dark" | "aged";
const PAPERS: [Paper, string][] = [["ruled", "Ruled"], ["blank", "Blank"], ["grid", "Grid"], ["dotted", "Dotted"], ["graph", "Graph"], ["legal", "Legal pad"], ["dark", "Dark"], ["aged", "Aged"]];

const SIZES: Record<string, [number, number]> = { A4: [794, 1123], Letter: [816, 1056], A5: [559, 794], Legal: [816, 1344] };

function Slider({ label, val, set, min, max, step = 1, unit = "" }: { label: string; val: number; set: (n: number) => void; min: number; max: number; step?: number; unit?: string }) {
  return <label className="block text-sm">{label}: {val}{unit}<input type="range" min={min} max={max} step={step} value={val} onChange={(e) => set(+e.target.value)} className="w-full" /></label>;
}

export function HandwritingClient() {
  const [text, setText] = useState(
    "Dear friend,\n\nThis is your text rendered as realistic handwriting. Type or paste anything — long text automatically flows across as many pages as you need.\n\nChoose from 22 fonts, any ink colour, 8 paper styles and 4 page sizes, then download as PNG, ZIP or a multi-page PDF.\n\nYours,\nNaushad"
  );
  const [font, setFont] = useState(FONTS[0]);
  const [ink, setInk] = useState(INKS[0].value);
  const [paper, setPaper] = useState<Paper>("ruled");
  const [size, setSize] = useState("A4");
  const [fontSize, setFontSize] = useState(32);
  const [lineHeight, setLineHeight] = useState(46);
  const [marginX, setMarginX] = useState(70);
  const [marginY, setMarginY] = useState(70);
  const [jitter, setJitter] = useState(1.4);
  const [letterSpace, setLetterSpace] = useState(0);
  const [inkVar, setInkVar] = useState(0.15);
  const [penWeight, setPenWeight] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);
  const [pages, setPages] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    const families = FONTS.map((f) => f.replace(/ /g, "+")).join("&family=");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
    document.head.appendChild(link);
    (async () => {
      try { await Promise.all(FONTS.map((f) => document.fonts.load(`32px '${f}'`))); await document.fonts.ready; } catch {}
      setFontsReady(true);
    })();
  }, []);

  const wrap = useCallback((ctx: CanvasRenderingContext2D, maxW: number) => {
    const out: string[] = [];
    for (const para of text.split("\n")) {
      if (para === "") { out.push(""); continue; }
      let line = "";
      for (const w of para.split(" ")) {
        const test = line ? line + " " + w : w;
        if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; } else line = test;
      }
      out.push(line);
    }
    return out;
  }, [text]);

  const hexShift = (hex: string, amt: number) => {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    const b = Math.max(0, Math.min(255, (n & 255) + amt));
    return `rgb(${r},${g},${b})`;
  };

  const render = useCallback(() => {
    if (!fontsReady) return;
    const [W, H] = SIZES[size];
    const ff = `'${font}'`;
    const probe = document.createElement("canvas").getContext("2d")!;
    probe.font = `${fontSize}px ${ff}`;
    const lines = wrap(probe, W - marginX * 2);
    const linesPerPage = Math.max(1, Math.floor((H - marginY * 2) / lineHeight));
    const pageCount = Math.max(1, Math.ceil(lines.length / linesPerPage));
    const result: string[] = [];

    for (let p = 0; p < pageCount; p++) {
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d")!;
      // paper bg
      ctx.fillStyle = paper === "dark" ? "#1a1f2b" : paper === "aged" ? "#f3e9d2" : paper === "legal" ? "#fffdf0" : "#ffffff";
      ctx.fillRect(0, 0, W, H);
      if (paper === "aged") { ctx.fillStyle = "rgba(140,110,60,0.05)"; for (let i = 0; i < 400; i++) ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
      // guide lines
      const lineCol = paper === "dark" ? "#33405a" : "#cfe0f5";
      ctx.strokeStyle = lineCol; ctx.lineWidth = 1;
      if (paper === "ruled" || paper === "legal" || paper === "aged") {
        for (let y = marginY + lineHeight; y < H - 20; y += lineHeight) { ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke(); }
      } else if (paper === "grid" || paper === "graph") {
        const step = paper === "graph" ? 20 : 26;
        for (let x = 0; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      } else if (paper === "dotted") {
        ctx.fillStyle = lineCol;
        for (let x = 24; x < W; x += 26) for (let y = 24; y < H; y += 26) { ctx.beginPath(); ctx.arc(x, y, 1.3, 0, 6.3); ctx.fill(); }
      }
      if (paper === "legal") {
        ctx.strokeStyle = "#f2a9a9"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(marginX - 16, 0); ctx.lineTo(marginX - 16, H); ctx.stroke();
        ctx.fillStyle = "#dfe3ea"; for (let y = 90; y < H; y += 150) { ctx.beginPath(); ctx.arc(22, y, 8, 0, 6.3); ctx.fill(); }
      }
      // text
      ctx.textBaseline = "alphabetic";
      const pageLines = lines.slice(p * linesPerPage, (p + 1) * linesPerPage);
      pageLines.forEach((ln, i) => {
        const baseY = marginY + (i + 1) * lineHeight - lineHeight * 0.25;
        let x = marginX;
        for (const ch of ln) {
          const sz = fontSize + (Math.random() - 0.5) * jitter;
          ctx.font = `${sz}px ${ff}`;
          ctx.fillStyle = inkVar > 0 ? hexShift(ink, Math.round((Math.random() - 0.5) * 80 * inkVar)) : ink;
          const dy = (Math.random() - 0.5) * jitter * 1.6;
          const rot = (Math.random() - 0.5) * 0.02 * jitter;
          ctx.save(); ctx.translate(x, baseY + dy); ctx.rotate(rot);
          if (penWeight > 0) { ctx.strokeStyle = ctx.fillStyle as string; ctx.lineWidth = penWeight; ctx.strokeText(ch, 0, 0); }
          ctx.fillText(ch, 0, 0); ctx.restore();
          x += ctx.measureText(ch).width + letterSpace;
        }
      });
      result.push(canvas.toDataURL("image/png"));
    }
    setPages(result);
    setPage((c) => Math.min(c, result.length - 1));
  }, [fontsReady, font, ink, paper, size, fontSize, lineHeight, marginX, marginY, jitter, letterSpace, inkVar, penWeight, wrap]);

  useEffect(() => { const t = setTimeout(render, 250); return () => clearTimeout(t); }, [render]);

  const dlPNG = () => { const a = document.createElement("a"); a.href = pages[page]; a.download = `handwriting-page-${page + 1}.png`; a.click(); };
  const dlZIP = async () => {
    setBusy("Zipping…");
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    pages.forEach((url, i) => zip.file(`page-${String(i + 1).padStart(2, "0")}.png`, url.split(",")[1], { base64: true }));
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "handwriting-pages.zip"; a.click();
    setBusy("");
  };
  const dlPDF = async () => {
    setBusy("Building PDF…");
    const { PDFDocument } = await import("pdf-lib");
    const [W, H] = SIZES[size];
    const doc = await PDFDocument.create();
    for (const url of pages) { const png = await doc.embedPng(url); const pg = doc.addPage([W, H]); pg.drawImage(png, { x: 0, y: 0, width: W, height: H }); }
    const bytes = await doc.save();
    const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "handwriting-dataforge.pdf"; a.click();
    setBusy("");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        <textarea className="input-area w-full" rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your text…" />

        <div className="surface rounded-2xl border p-4 space-y-3">
          <label className="block text-sm">Font
            <select className="input-field mt-1 w-full" value={font} onChange={(e) => setFont(e.target.value)} style={{ fontFamily: `'${font}'` }}>
              {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: `'${f}'` }}>{f}</option>)}
            </select>
          </label>
          <div>
            <p className="mb-1 text-sm">Ink</p>
            <div className="flex flex-wrap gap-2">
              {INKS.map((c) => <button key={c.value} onClick={() => setInk(c.value)} title={c.name} className={`h-7 w-7 rounded-full border-2 ${ink === c.value ? "border-brand-500 scale-110" : "border-transparent"}`} style={{ background: c.value }} />)}
              <input type="color" value={ink} onChange={(e) => setInk(e.target.value)} className="h-7 w-9 rounded" title="Custom ink" />
            </div>
          </div>
          <div>
            <p className="mb-1 text-sm">Paper</p>
            <div className="flex flex-wrap gap-1.5">{PAPERS.map(([p, l]) => <button key={p} onClick={() => setPaper(p)} className={`rounded-lg border px-2.5 py-1 text-xs ${paper === p ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{l}</button>)}</div>
          </div>
          <div>
            <p className="mb-1 text-sm">Page size</p>
            <div className="flex gap-1.5">{Object.keys(SIZES).map((s) => <button key={s} onClick={() => setSize(s)} className={`rounded-lg border px-3 py-1 text-xs ${size === s ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{s}</button>)}</div>
          </div>
          <Slider label="Font size" val={fontSize} set={setFontSize} min={16} max={60} unit="px" />
          <Slider label="Line height" val={lineHeight} set={setLineHeight} min={26} max={90} unit="px" />
          <Slider label="Letter spacing" val={letterSpace} set={setLetterSpace} min={-2} max={12} unit="px" />
          <Slider label="Realism (jitter)" val={jitter} set={setJitter} min={0} max={4} step={0.2} />
          <Slider label="Ink variation" val={inkVar} set={setInkVar} min={0} max={1} step={0.05} />
          <Slider label="Pen weight" val={penWeight} set={setPenWeight} min={0} max={2} step={0.2} />
          <div className="grid grid-cols-2 gap-2">
            <Slider label="Margin X" val={marginX} set={setMarginX} min={20} max={160} />
            <Slider label="Margin Y" val={marginY} set={setMarginY} min={20} max={200} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button onClick={dlPNG} disabled={!pages.length} className="rounded-xl border border-brand-500 bg-brand-500/10 px-2 py-2 text-xs font-semibold text-brand-600 disabled:opacity-50">⬇ PNG</button>
          <button onClick={dlZIP} disabled={!pages.length || !!busy} className="rounded-xl border border-brand-500 bg-brand-500/10 px-2 py-2 text-xs font-semibold text-brand-600 disabled:opacity-50">⬇ ZIP</button>
          <button onClick={dlPDF} disabled={!pages.length || !!busy} className="rounded-xl bg-brand-600 px-2 py-2 text-xs font-semibold text-white disabled:opacity-50">⬇ PDF</button>
        </div>
        {busy && <p className="text-center text-sm text-muted">{busy}</p>}
      </div>

      <div>
        {!fontsReady && <p className="text-sm text-muted">Loading handwriting fonts…</p>}
        {pages.length > 0 && (
          <>
            <div className="mb-3 flex items-center justify-center gap-3">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded-lg border surface px-3 py-1 disabled:opacity-40">←</button>
              <span className="text-sm text-muted">Page {page + 1} of {pages.length}</span>
              <button onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))} disabled={page === pages.length - 1} className="rounded-lg border surface px-3 py-1 disabled:opacity-40">→</button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pages[page]} alt={`Handwriting page ${page + 1}`} className="mx-auto w-full max-w-[560px] rounded-lg border border-[var(--border)] shadow-lg" />
          </>
        )}
      </div>
    </div>
  );
}
