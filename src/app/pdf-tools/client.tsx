"use client";
import { useState } from "react";

type Tool = "merge" | "images" | "split" | "rotate" | "delete";

const TOOLS: { id: Tool; name: string; icon: string; desc: string }[] = [
  { id: "merge", name: "Merge PDFs", icon: "🔗", desc: "Combine several PDFs into one" },
  { id: "images", name: "Images → PDF", icon: "🖼️", desc: "Turn JPG/PNG images into a PDF" },
  { id: "split", name: "Extract pages", icon: "✂️", desc: "Keep a page range as a new PDF" },
  { id: "rotate", name: "Rotate", icon: "↻", desc: "Rotate every page" },
  { id: "delete", name: "Delete pages", icon: "🗑️", desc: "Remove specific pages" },
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
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  const reset = (t: Tool) => { setTool(t); setFiles([]); setMsg(""); };

  const run = async () => {
    setMsg(""); setBusy("Working…");
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");

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

      else {
        if (files.length !== 1) throw new Error("Select exactly one PDF.");
        const src = await PDFDocument.load(await files[0].arrayBuffer());
        const count = src.getPageCount();

        if (tool === "rotate") {
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

        <button onClick={run} disabled={!!busy || !files.length} className="mt-5 w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {busy || `Run ${TOOLS.find((t) => t.id === tool)!.name}`}
        </button>
        {msg && <p className={`mt-3 text-center text-sm ${msg.startsWith("⚠") ? "text-red-500" : "text-green-600"}`}>{msg}</p>}
      </div>
    </div>
  );
}
