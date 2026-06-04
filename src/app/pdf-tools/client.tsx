"use client";
import { useState } from "react";

type Tool = "merge" | "images" | "split" | "rotate" | "delete" | "topng" | "numbers" | "watermark";

const TOOLS: { id: Tool; name: string; icon: string; desc: string }[] = [
  { id: "merge", name: "Merge PDFs", icon: "🔗", desc: "Combine several PDFs into one" },
  { id: "images", name: "Images → PDF", icon: "🖼️", desc: "Turn JPG/PNG images into a PDF" },
  { id: "topng", name: "PDF → JPG", icon: "📸", desc: "Export each page as an image" },
  { id: "split", name: "Extract pages", icon: "✂️", desc: "Keep a page range as a new PDF" },
  { id: "delete", name: "Delete pages", icon: "🗑️", desc: "Remove specific pages" },
  { id: "rotate", name: "Rotate", icon: "↻", desc: "Rotate every page" },
  { id: "numbers", name: "Page numbers", icon: "#️⃣", desc: "Stamp page numbers" },
  { id: "watermark", name: "Watermark", icon: "💧", desc: "Add a text watermark" },
];

function download(bytes: Uint8Array, name: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function parseRanges(spec: string, max: number): number[] {
  const out = new Set<number>();
  for (const part of spec.split(",").map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) { for (let i = +m[1]; i <= +m[2]; i++) if (i >= 1 && i <= max) out.add(i); }
    else { const n = +part; if (n >= 1 && n <= max) out.add(n); }
  }
  return [...out].sort((a, b) => a - b);
}

export function PdfToolsClient() {
  const [tool, setTool] = useState<Tool>("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [pageSpec, setPageSpec] = useState("1-3");
  const [angle, setAngle] = useState(90);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  const reset = (t: Tool) => { setTool(t); setFiles([]); setMsg(""); };

  const run = async () => {
    setMsg(""); setBusy("Working…");
    try {
      const { PDFDocument, degrees, rgb } = await import("pdf-lib");

      if (tool === "merge") {
        if (files.length < 2) throw new Error("Select at least 2 PDF files.");
        const out = await PDFDocument.create();
        for (const f of files) {
          const src = await PDFDocument.load(await f.arrayBuffer());
          const pages = await out.copyPages(src, src.getPageIndices());
          pages.forEach((p) => out.addPage(p));
        }
        download(await out.save(), "merged-dataforge.pdf");
        setMsg(`Merged ${files.length} files into one PDF.`);
      }

      else if (tool === "images") {
        if (!files.length) throw new Error("Select one or more images.");
        const out = await PDFDocument.create();
        for (const f of files) {
          const bytes = new Uint8Array(await f.arrayBuffer());
          const img = f.type.includes("png") ? await out.embedPng(bytes) : await out.embedJpg(bytes);
          const page = out.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        }
        download(await out.save(), "images-dataforge.pdf");
        setMsg(`Created a PDF from ${files.length} image(s).`);
      }

      else if (tool === "topng") {
        if (files.length !== 1) throw new Error("Select exactly one PDF.");
        setBusy("Rendering pages…");
        const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
        GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";
        const buf = new Uint8Array(await files[0].arrayBuffer());
        const pdf = await getDocument({ data: buf }).promise;
        const { default: JSZip } = await import("jszip");
        const zip = new JSZip();
        let single: Blob | null = null;
        for (let i = 1; i <= pdf.numPages; i++) {
          setBusy(`Rendering page ${i} of ${pdf.numPages}…`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width; canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.92));
          if (blob) { single = blob; zip.file(`page-${String(i).padStart(3, "0")}.jpg`, blob); }
        }
        if (pdf.numPages === 1 && single) {
          const url = URL.createObjectURL(single);
          const a = document.createElement("a"); a.href = url; a.download = "page-1-dataforge.jpg"; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } else {
          const zblob = await zip.generateAsync({ type: "blob" });
          const url = URL.createObjectURL(zblob);
          const a = document.createElement("a"); a.href = url; a.download = "pdf-images-dataforge.zip"; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
        setMsg(`Exported ${pdf.numPages} page(s) as JPG.`);
      }

      else {
        if (files.length !== 1) throw new Error("Select exactly one PDF.");
        const src = await PDFDocument.load(await files[0].arrayBuffer());
        const count = src.getPageCount();

        if (tool === "numbers") {
          const font = await src.embedFont("Helvetica");
          src.getPages().forEach((p, i) => {
            const { width } = p.getSize();
            const label = `${i + 1} / ${count}`;
            const w = font.widthOfTextAtSize(label, 10);
            p.drawText(label, { x: width / 2 - w / 2, y: 18, size: 10, font });
          });
          download(await src.save(), "numbered-dataforge.pdf");
          setMsg(`Added page numbers to ${count} pages.`);
        }

        else if (tool === "watermark") {
          const text = watermarkText.trim() || "WATERMARK";
          const font = await src.embedFont("Helvetica");
          src.getPages().forEach((p) => {
            const { width, height } = p.getSize();
            const size = Math.min(width, height) / 8;
            const w = font.widthOfTextAtSize(text, size);
            p.drawText(text, {
              x: width / 2 - w / 2, y: height / 2, size, font,
              color: rgb(0.6, 0.6, 0.6), opacity: 0.25, rotate: degrees(45),
            });
          });
          download(await src.save(), "watermarked-dataforge.pdf");
          setMsg(`Watermarked ${count} pages with “${text}”.`);
        }

        else if (tool === "rotate") {
          src.getPages().forEach((p) => p.setRotation(degrees((p.getRotation().angle + angle) % 360)));
          download(await src.save(), "rotated-dataforge.pdf");
          setMsg(`Rotated all ${count} pages by ${angle}°.`);
        }

        else if (tool === "split") {
          const keep = parseRanges(pageSpec, count);
          if (!keep.length) throw new Error("No valid pages in that range.");
          const out = await PDFDocument.create();
          const pages = await out.copyPages(src, keep.map((n) => n - 1));
          pages.forEach((p) => out.addPage(p));
          download(await out.save(), "extracted-dataforge.pdf");
          setMsg(`Extracted ${keep.length} page(s): ${keep.join(", ")}.`);
        }

        else if (tool === "delete") {
          const remove = new Set(parseRanges(pageSpec, count));
          if (!remove.size) throw new Error("No valid pages to delete.");
          if (remove.size >= count) throw new Error("That would delete every page.");
          const keep = Array.from({ length: count }, (_, i) => i + 1).filter((n) => !remove.has(n));
          const out = await PDFDocument.create();
          const pages = await out.copyPages(src, keep.map((n) => n - 1));
          pages.forEach((p) => out.addPage(p));
          download(await out.save(), "edited-dataforge.pdf");
          setMsg(`Deleted ${remove.size} page(s); ${keep.length} remain.`);
        }
      }
    } catch (e) {
      setMsg("⚠ " + (e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const accept = tool === "images" ? "image/png,image/jpeg" : "application/pdf";
  const multiple = tool === "merge" || tool === "images";

  return (
    <div>
      <div className="mb-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => reset(t.id)}
            className={`surface rounded-2xl border p-4 text-left transition-colors ${tool === t.id ? "border-brand-500 bg-brand-500/10" : "hover:border-brand-400"}`}
          >
            <div className="text-2xl">{t.icon}</div>
            <div className="mt-1 font-bold text-sm">{t.name}</div>
            <div className="text-xs text-muted">{t.desc}</div>
          </button>
        ))}
      </div>

      <div className="surface rounded-2xl border p-5">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center hover:border-brand-400">
          <span className="text-2xl">{tool === "images" ? "🖼️" : "📄"}</span>
          <span className="mt-1 font-semibold">{files.length ? `${files.length} file(s) selected` : `Click to select ${tool === "images" ? "image(s)" : "PDF" + (multiple ? "s" : "")}`}</span>
          <span className="text-xs text-muted">Processed locally — nothing leaves your device</span>
          <input type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
        </label>

        {files.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {files.map((f, i) => (
              <li key={i} className="surface-2 flex items-center justify-between rounded-lg px-3 py-1.5">
                <span className="truncate">{f.name}</span>
                <span className="text-xs text-muted">{(f.size / 1024).toFixed(0)} KB</span>
              </li>
            ))}
          </ul>
        )}

        {(tool === "split" || tool === "delete") && (
          <label className="mt-4 block text-sm">
            Pages {tool === "split" ? "to keep" : "to delete"} (e.g. <code className="font-mono">1-3, 5, 8</code>)
            <input className="input-field mt-1 w-full" value={pageSpec} onChange={(e) => setPageSpec(e.target.value)} />
          </label>
        )}
        {tool === "rotate" && (
          <div className="mt-4 flex gap-2">
            {[90, 180, 270].map((a) => (
              <button key={a} onClick={() => setAngle(a)} className={`rounded-lg border px-3 py-1.5 text-sm ${angle === a ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{a}°</button>
            ))}
          </div>
        )}
        {tool === "watermark" && (
          <label className="mt-4 block text-sm">Watermark text
            <input className="input-field mt-1 w-full" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} />
          </label>
        )}

        <button onClick={run} disabled={!!busy || !files.length} className="mt-5 w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {busy || `Run ${TOOLS.find((t) => t.id === tool)!.name}`}
        </button>
        {msg && <p className={`mt-3 text-center text-sm ${msg.startsWith("⚠") ? "text-red-500" : "text-green-600"}`}>{msg}</p>}
      </div>
    </div>
  );
}
