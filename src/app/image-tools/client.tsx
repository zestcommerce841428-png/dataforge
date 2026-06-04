"use client";
import { useCallback, useRef, useState } from "react";

type Fmt = "image/jpeg" | "image/png" | "image/webp";
const EXT: Record<Fmt, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function prettyBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function ImageToolsClient() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("image");
  const [origSize, setOrigSize] = useState(0);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [fmt, setFmt] = useState<Fmt>("image/jpeg");
  const [quality, setQuality] = useState(0.85);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const [targetKB, setTargetKB] = useState(100);
  const [result, setResult] = useState<{ url: string; size: number; w: number; h: number } | null>(null);
  const [busy, setBusy] = useState("");
  const aspect = useRef(1);

  // Crop state (fractions 0..1 of the displayed image)
  const [cropping, setCropping] = useState(false);
  const [sel, setSel] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);
  const previewImgRef = useRef<HTMLImageElement | null>(null);

  const loadFile = useCallback((file: File) => {
    setFileName(file.name.replace(/\.[^.]+$/, "") || "image");
    setOrigSize(file.size);
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      aspect.current = image.width / image.height;
      setImg(image);
      setWidth(image.width);
      setHeight(image.height);
      setResult(null);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }, []);

  const onWidth = (w: number) => { setWidth(w); if (lockAspect) setHeight(Math.round(w / aspect.current)); };
  const onHeight = (h: number) => { setHeight(h); if (lockAspect) setWidth(Math.round(h * aspect.current)); };

  const applyPreset = (w: number, h: number) => { setLockAspect(false); setWidth(w); setHeight(h); };

  // ── Crop ──
  const fracFromEvent = (e: React.PointerEvent) => {
    const el = previewImgRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    };
  };
  const cropDown = (e: React.PointerEvent) => {
    if (!cropping) return;
    const p = fracFromEvent(e);
    dragRef.current = { startX: p.x, startY: p.y };
    setSel({ x: p.x, y: p.y, w: 0, h: 0 });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const cropMove = (e: React.PointerEvent) => {
    if (!cropping || !dragRef.current) return;
    const p = fracFromEvent(e);
    const s = dragRef.current;
    setSel({ x: Math.min(s.startX, p.x), y: Math.min(s.startY, p.y), w: Math.abs(p.x - s.startX), h: Math.abs(p.y - s.startY) });
  };
  const cropUp = () => { dragRef.current = null; };

  const applyCrop = () => {
    if (!img || !sel || sel.w < 0.02 || sel.h < 0.02) { setCropping(false); return; }
    const sx = sel.x * img.width, sy = sel.y * img.height;
    const sw = sel.w * img.width, sh = sel.h * img.height;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sw); canvas.height = Math.round(sh);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    const cropped = new Image();
    cropped.onload = () => {
      aspect.current = cropped.width / cropped.height;
      setImg(cropped);
      setWidth(cropped.width); setHeight(cropped.height);
      setResult(null); setSel(null); setCropping(false);
    };
    cropped.src = canvas.toDataURL("image/png");
  };

  const draw = useCallback((w: number, h: number): HTMLCanvasElement | null => {
    if (!img) return null;
    const swap = rotation === 90 || rotation === 270;
    const canvas = document.createElement("canvas");
    canvas.width = swap ? h : w;
    canvas.height = swap ? w : h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    return canvas;
  }, [img, rotation, flipH, flipV]);

  const toBlob = (canvas: HTMLCanvasElement, q: number): Promise<Blob | null> =>
    new Promise((res) => canvas.toBlob(res, fmt, q));

  const process = useCallback(async () => {
    if (!img) return;
    setBusy("Processing…");
    const canvas = draw(width, height);
    if (!canvas) { setBusy(""); return; }
    const blob = await toBlob(canvas, fmt === "image/png" ? 1 : quality);
    if (blob) setResult({ url: URL.createObjectURL(blob), size: blob.size, w: canvas.width, h: canvas.height });
    setBusy("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, width, height, fmt, quality, draw]);

  // Compress to a target file size by binary-searching JPEG/WebP quality
  const compressToTarget = useCallback(async () => {
    if (!img) return;
    if (fmt === "image/png") { setBusy("Switch to JPEG or WebP for target-size compression"); return; }
    setBusy("Optimizing to target size…");
    const canvas = draw(width, height);
    if (!canvas) { setBusy(""); return; }
    const targetBytes = targetKB * 1024;
    let lo = 0.05, hi = 1, best: Blob | null = null;
    for (let i = 0; i < 8; i++) {
      const mid = (lo + hi) / 2;
      const blob = await toBlob(canvas, mid);
      if (!blob) break;
      if (blob.size <= targetBytes) { best = blob; lo = mid; } else { hi = mid; }
    }
    if (!best) best = await toBlob(canvas, 0.05);
    if (best) setResult({ url: URL.createObjectURL(best), size: best.size, w: canvas.width, h: canvas.height });
    setBusy("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, width, height, fmt, targetKB, draw]);

  return (
    <div>
      {/* Upload */}
      <label className="surface flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center hover:border-brand-400">
        <span className="text-3xl">🖼️</span>
        <span className="mt-2 font-semibold">{img ? "Choose a different image" : "Click to upload an image"}</span>
        <span className="text-xs text-muted">JPG, PNG, WebP, GIF — processed locally, never uploaded</span>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
      </label>

      {img && (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* Controls */}
          <div className="space-y-4">
            <div className="surface rounded-2xl border p-4">
              <p className="mb-2 text-sm font-bold">Quick presets</p>
              <p className="mb-1 text-xs text-muted">Document & ID photos</p>
              <div className="mb-3 flex flex-wrap gap-2">
                {[
                  ["PAN photo 213×213", 213, 213],
                  ["Passport 35×45mm", 413, 531],
                  ["Signature 140×60", 140, 60],
                  ["Visa 600×600", 600, 600],
                  ["Avatar 512×512", 512, 512],
                ].map(([label, w, h]) => (
                  <button key={label as string} onClick={() => applyPreset(w as number, h as number)} className="rounded-lg border surface px-2.5 py-1 text-xs hover:border-brand-400">{label}</button>
                ))}
              </div>
              <p className="mb-1 text-xs text-muted">Social media</p>
              <div className="flex flex-wrap gap-2">
                {[
                  ["Instagram post 1080²", 1080, 1080],
                  ["IG story 1080×1920", 1080, 1920],
                  ["FB cover 820×312", 820, 312],
                  ["Twitter/X 1600×900", 1600, 900],
                  ["YouTube thumb 1280×720", 1280, 720],
                  ["LinkedIn 1200×627", 1200, 627],
                ].map(([label, w, h]) => (
                  <button key={label as string} onClick={() => applyPreset(w as number, h as number)} className="rounded-lg border surface px-2.5 py-1 text-xs hover:border-brand-400">{label}</button>
                ))}
              </div>
            </div>

            <div className="surface rounded-2xl border p-4">
              <p className="mb-2 text-sm font-bold">Resize</p>
              <div className="flex items-end gap-2">
                <label className="text-sm flex-1">Width<input type="number" className="input-field mt-1 w-full" value={width} onChange={(e) => onWidth(+e.target.value)} /></label>
                <label className="text-sm flex-1">Height<input type="number" className="input-field mt-1 w-full" value={height} onChange={(e) => onHeight(+e.target.value)} /></label>
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} /> Lock aspect ratio</label>
              <div className="mt-2 flex gap-2">
                {[25, 50, 75].map((p) => (
                  <button key={p} onClick={() => { setWidth(Math.round(img.width * p / 100)); setHeight(Math.round(img.height * p / 100)); }} className="rounded-lg border surface px-3 py-1 text-xs">{p}%</button>
                ))}
                <button onClick={() => { setWidth(img.width); setHeight(img.height); }} className="rounded-lg border surface px-3 py-1 text-xs">Original</button>
              </div>
            </div>

            <div className="surface rounded-2xl border p-4">
              <p className="mb-2 text-sm font-bold">Format & quality</p>
              <div className="flex gap-2">
                {(["image/jpeg", "image/png", "image/webp"] as Fmt[]).map((f) => (
                  <button key={f} onClick={() => setFmt(f)} className={`rounded-lg border px-3 py-1.5 text-sm uppercase ${fmt === f ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{EXT[f]}</button>
                ))}
              </div>
              {fmt !== "image/png" && (
                <label className="mt-3 block text-sm">Quality: {Math.round(quality * 100)}%<input type="range" min={0.1} max={1} step={0.05} value={quality} onChange={(e) => setQuality(+e.target.value)} className="mt-1 w-full" /></label>
              )}
            </div>

            <div className="surface rounded-2xl border p-4">
              <p className="mb-2 text-sm font-bold">Rotate & flip</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setRotation((r) => (r + 90) % 360)} className="rounded-lg border surface px-3 py-1.5 text-sm">↻ Rotate 90°</button>
                <button onClick={() => setFlipH((v) => !v)} className={`rounded-lg border px-3 py-1.5 text-sm ${flipH ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>⇄ Flip H</button>
                <button onClick={() => setFlipV((v) => !v)} className={`rounded-lg border px-3 py-1.5 text-sm ${flipV ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>⇅ Flip V</button>
                <button onClick={() => { setCropping((c) => !c); setSel(null); setResult(null); }} className={`rounded-lg border px-3 py-1.5 text-sm ${cropping ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>✂ Crop</button>
                <span className="self-center text-xs text-muted">Rotation: {rotation}°</span>
              </div>
              {cropping && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted">Drag on the image →</span>
                  <button onClick={applyCrop} className="rounded-lg border border-brand-500 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600">Apply crop</button>
                  <button onClick={() => { setCropping(false); setSel(null); }} className="rounded-lg border surface px-3 py-1 text-xs">Cancel</button>
                </div>
              )}
            </div>

            <div className="surface rounded-2xl border p-4">
              <p className="mb-2 text-sm font-bold">Compress to target size</p>
              <p className="mb-2 text-xs text-muted">Great for upload limits (passport / PAN / form photos). JPEG or WebP only.</p>
              <div className="mb-2 flex flex-wrap gap-2">
                {[20, 50, 100, 200, 500].map((kb) => (
                  <button key={kb} onClick={() => setTargetKB(kb)} className={`rounded-lg border px-2.5 py-1 text-xs ${targetKB === kb ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{kb} KB</button>
                ))}
              </div>
              <div className="flex items-end gap-2">
                <label className="text-sm flex-1">Target size (KB)<input type="number" className="input-field mt-1 w-full" value={targetKB} onChange={(e) => setTargetKB(+e.target.value)} /></label>
                <button onClick={compressToTarget} className="rounded-lg border border-brand-500 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-600">Compress</button>
              </div>
            </div>

            <button onClick={process} className="w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700">Apply & generate</button>
            {busy && <p className="text-center text-sm text-muted">{busy}</p>}
          </div>

          {/* Preview / result */}
          <div className="space-y-3">
            <div className="surface rounded-2xl border p-4">
              <p className="mb-2 text-sm font-bold">{cropping ? "Drag to select crop area" : result ? "Result" : "Original"}</p>
              <div className="relative mx-auto w-fit" style={{ touchAction: cropping ? "none" : undefined }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={previewImgRef}
                  src={cropping ? img.src : (result?.url ?? img.src)}
                  alt="preview"
                  draggable={false}
                  onPointerDown={cropDown}
                  onPointerMove={cropMove}
                  onPointerUp={cropUp}
                  className={`max-h-[360px] rounded-lg border border-[var(--border)] ${cropping ? "cursor-crosshair select-none" : ""}`}
                />
                {cropping && sel && sel.w > 0 && (
                  <div
                    className="pointer-events-none absolute border-2 border-brand-500 bg-brand-500/20"
                    style={{ left: `${sel.x * 100}%`, top: `${sel.y * 100}%`, width: `${sel.w * 100}%`, height: `${sel.h * 100}%` }}
                  />
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm">
                <div className="surface-2 rounded-lg p-2"><div className="font-bold">{result ? `${result.w}×${result.h}` : `${img.width}×${img.height}`}</div><div className="text-xs text-muted">dimensions</div></div>
                <div className="surface-2 rounded-lg p-2"><div className="font-bold">{prettyBytes(result?.size ?? origSize)}</div><div className="text-xs text-muted">{result ? "new size" : "original"}</div></div>
              </div>
              {result && origSize > 0 && (
                <p className="mt-2 text-center text-xs text-muted">
                  {result.size < origSize ? `↓ ${(100 - (result.size / origSize) * 100).toFixed(0)}% smaller` : `↑ ${((result.size / origSize) * 100 - 100).toFixed(0)}% larger`}
                </p>
              )}
            </div>
            {result && (
              <a href={result.url} download={`${fileName}-dataforge.${EXT[fmt]}`} className="block rounded-xl border border-brand-500 bg-brand-500/10 px-4 py-3 text-center font-semibold text-brand-600">
                ⬇ Download {EXT[fmt].toUpperCase()} ({prettyBytes(result.size)})
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
