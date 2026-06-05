"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Google handwriting fonts (loaded via <link> below)
const FONTS = [
  { name: "Caveat", css: "'Caveat'" },
  { name: "Dancing Script", css: "'Dancing Script'" },
  { name: "Patrick Hand", css: "'Patrick Hand'" },
  { name: "Shadows Into Light", css: "'Shadows Into Light'" },
  { name: "Indie Flower", css: "'Indie Flower'" },
  { name: "Homemade Apple", css: "'Homemade Apple'" },
  { name: "Gloria Hallelujah", css: "'Gloria Hallelujah'" },
  { name: "Reenie Beanie", css: "'Reenie Beanie'" },
  { name: "Kalam", css: "'Kalam'" },
  { name: "Liu Jian Mao Cao", css: "'Liu Jian Mao Cao'" },
];

const INKS = [
  { name: "Blue", value: "#1a3fb0" },
  { name: "Black", value: "#101418" },
  { name: "Royal", value: "#283593" },
  { name: "Red", value: "#b00020" },
  { name: "Green", value: "#1b5e20" },
  { name: "Purple", value: "#5e35b1" },
];

type Paper = "ruled" | "blank" | "grid" | "legal";

// A4 at ~96 DPI
const PAGE_W = 794, PAGE_H = 1123;

export function HandwritingClient() {
  const [text, setText] = useState(
    "Dear friend,\n\nThis is your text rendered as realistic handwriting. Type or paste anything — long text automatically flows across as many pages as you need.\n\nChoose a font, ink colour and paper style, then download as PNG or a multi-page PDF.\n\nYours,\nDataForge"
  );
  const [font, setFont] = useState(FONTS[0].css);
  const [ink, setInk] = useState(INKS[0].value);
  const [paper, setPaper] = useState<Paper>("ruled");
  const [fontSize, setFontSize] = useState(32);
  const [lineHeight, setLineHeight] = useState(46);
  const [marginX, setMarginX] = useState(70);
  const [marginY, setMarginY] = useState(70);
  const [jitter, setJitter] = useState(1.4);
  const [fontsReady, setFontsReady] = useState(false);

  const [pages, setPages] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState("");

  // Load Google Fonts once
  useEffect(() => {
    const families = FONTS.map((f) => f.name.replace(/ /g, "+")).join("&family=");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
    document.head.appendChild(link);
    const ready = async () => {
      try {
        await Promise.all(FONTS.map((f) => document.fonts.load(`${fontSize}px ${f.css}`)));
        await document.fonts.ready;
      } catch {}
      setFontsReady(true);
    };
    ready();
  }, [fontSize]);

  const wrapLines = useCallback((ctx: CanvasRenderingContext2D, maxW: number) => {
    const out: string[] = [];
    for (const para of text.split("\n")) {
      if (para === "") { out.push(""); continue; }
      const words = para.split(" ");
      let line = "";
      for (const w of words) {
        const test = line ? line + " " + w : w;
        if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; }
        else line = test;
      }
      out.push(line);
    }
    return out;
  }, [text]);

  const render = useCallback(() => {
    if (!fontsReady) return;
    const probe = document.createElement("canvas").getContext("2d")!;
    probe.font = `${fontSize}px ${font}`;
    const maxW = PAGE_W - marginX * 2;
    const lines = wrapLines(probe, maxW);
    const linesPerPage = Math.floor((PAGE_H - marginY * 2) / lineHeight);
    const pageCount = Math.max(1, Math.ceil(lines.length / linesPerPage));
    const result: string[] = [];

    for (let p = 0; p < pageCount; p++) {
      const canvas = document.createElement("canvas");
      canvas.width = PAGE_W; canvas.height = PAGE_H;
      const ctx = canvas.getContext("2d")!;
      // paper background
      ctx.fillStyle = paper === "legal" ? "#fffdf0" : "#ffffff";
      ctx.fillRect(0, 0, PAGE_W, PAGE_H);
      // lines / grid
      ctx.strokeStyle = "#cfe0f5"; ctx.lineWidth = 1;
      if (paper === "ruled" || paper === "legal") {
        for (let y = marginY + lineHeight; y < PAGE_H - 20; y += lineHeight) {
          ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(PAGE_W - 30, y); ctx.stroke();
        }
      }
      if (paper === "grid") {
        ctx.strokeStyle = "#e3e8f0";
        for (let x = 0; x < PAGE_W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, PAGE_H); ctx.stroke(); }
        for (let y = 0; y < PAGE_H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(PAGE_W, y); ctx.stroke(); }
      }
      if (paper === "legal") {
        ctx.strokeStyle = "#f2a9a9"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(marginX - 16, 0); ctx.lineTo(marginX - 16, PAGE_H); ctx.stroke();
        // holes
        ctx.fillStyle = "#dfe3ea";
        for (let y = 90; y < PAGE_H; y += 150) { ctx.beginPath(); ctx.arc(22, y, 8, 0, Math.PI * 2); ctx.fill(); }
      }

      // text with realism jitter
      ctx.fillStyle = ink;
      ctx.textBaseline = "alphabetic";
      const pageLines = lines.slice(p * linesPerPage, (p + 1) * linesPerPage);
      pageLines.forEach((ln, i) => {
        const baseY = marginY + (i + 1) * lineHeight - lineHeight * 0.25;
        let x = marginX;
        for (const ch of ln) {
          const size = fontSize + (Math.random() - 0.5) * jitter;
          ctx.font = `${size}px ${font}`;
          const dy = (Math.random() - 0.5) * jitter * 1.6;
          const rot = (Math.random() - 0.5) * 0.02 * jitter;
          ctx.save();
          ctx.translate(x, baseY + dy);
          ctx.rotate(rot);
          ctx.fillText(ch, 0, 0);
          ctx.restore();
          x += ctx.measureText(ch).width;
        }
      });
      result.push(canvas.toDataURL("image/png"));
    }
    setPages(result);
    setPage((cur) => Math.min(cur, result.length - 1));
  }, [fontsReady, font, ink, paper, fontSize, lineHeight, marginX, marginY, jitter, wrapLines]);

  useEffect(() => { const t = setTimeout(render, 250); return () => clearTimeout(t); }, [render]);

  const downloadPNG = () => {
    const a = document.createElement("a");
    a.href = pages[page]; a.download = `handwriting-page-${page + 1}.png`; a.click();
  };

  const downloadPDF = async () => {
    setBusy("Building PDF…");
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.create();
    for (const url of pages) {
      const png = await doc.embedPng(url);
      const pg = doc.addPage([PAGE_W, PAGE_H]);
      pg.drawImage(png, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });
    }
    const bytes = await doc.save();
    const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "handwriting-dataforge.pdf"; a.click();
    setBusy("");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      {/* Controls */}
      <div className="space-y-4">
        <textarea className="input-area w-full" rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your text…" />

        <div className="surface rounded-2xl border p-4 space-y-3">
          <label className="block text-sm">Handwriting font
            <select className="input-field mt-1 w-full" value={font} onChange={(e) => setFont(e.target.value)} style={{ fontFamily: font }}>
              {FONTS.map((f) => <option key={f.name} value={f.css} style={{ fontFamily: f.css }}>{f.name}</option>)}
            </select>
          </label>

          <div>
            <p className="mb-1 text-sm">Ink colour</p>
            <div className="flex flex-wrap gap-2">
              {INKS.map((c) => <button key={c.value} onClick={() => setInk(c.value)} title={c.name} className={`h-7 w-7 rounded-full border-2 ${ink === c.value ? "border-brand-500 scale-110" : "border-transparent"}`} style={{ background: c.value }} />)}
              <input type="color" value={ink} onChange={(e) => setInk(e.target.value)} className="h-7 w-9 rounded" title="Custom ink" />
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm">Paper</p>
            <div className="flex flex-wrap gap-2">
              {(["ruled", "blank", "grid", "legal"] as Paper[]).map((p) => <button key={p} onClick={() => setPaper(p)} className={`rounded-lg border px-3 py-1 text-xs capitalize ${paper === p ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{p}</button>)}
            </div>
          </div>

          <label className="block text-sm">Font size: {fontSize}px<input type="range" min={18} max={56} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full" /></label>
          <label className="block text-sm">Line height: {lineHeight}px<input type="range" min={28} max={80} value={lineHeight} onChange={(e) => setLineHeight(+e.target.value)} className="w-full" /></label>
          <label className="block text-sm">Realism (jitter): {jitter.toFixed(1)}<input type="range" min={0} max={4} step={0.2} value={jitter} onChange={(e) => setJitter(+e.target.value)} className="w-full" /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm">Margin X<input type="range" min={20} max={140} value={marginX} onChange={(e) => setMarginX(+e.target.value)} className="w-full" /></label>
            <label className="block text-sm">Margin Y<input type="range" min={20} max={160} value={marginY} onChange={(e) => setMarginY(+e.target.value)} className="w-full" /></label>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={downloadPNG} disabled={!pages.length} className="flex-1 rounded-xl border border-brand-500 bg-brand-500/10 px-3 py-2 text-sm font-semibold text-brand-600 disabled:opacity-50">⬇ This page (PNG)</button>
          <button onClick={downloadPDF} disabled={!pages.length || !!busy} className="flex-1 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy || `⬇ All ${pages.length} pages (PDF)`}</button>
        </div>
      </div>

      {/* Preview */}
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
