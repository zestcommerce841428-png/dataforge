"use client";
import { useState, useRef, useCallback } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── Image Resizer ── */
export function ImageResizer() {
  const [src, setSrc] = useState<string | null>(null);
  const [w, setW] = useState(800);
  const [h, setH] = useState(600);
  const [quality, setQ] = useState(90);
  const [fmt, setFmt] = useState<"image/png"|"image/jpeg"|"image/webp">("image/jpeg");
  const [linked, setLinked] = useState(true);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => { setOrigW(img.naturalWidth); setOrigH(img.naturalHeight); setW(img.naturalWidth); setH(img.naturalHeight); setSrc(url); };
    img.src = url;
  };
  const resize = () => {
    if (!src || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      if (fmt === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h); }
      ctx.drawImage(img, 0, 0, w, h);
    };
    img.src = src;
  };
  const download = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL(fmt, quality/100);
    a.download = `resized.${fmt.split("/")[1]}`;
    a.click();
  };
  const setWidth = (v: number) => { setW(v); if (linked && origW) setH(Math.round(v * origH / origW)); };
  const setHeight = (v: number) => { setH(v); if (linked && origH) setW(Math.round(v * origW / origH)); };
  return (
    <ToolWrap>
      <input type="file" accept="image/*" className="input-field w-full mb-3" onChange={onFile} />
      {src && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 mb-3">
            <label className="text-sm"><span className="text-xs text-muted block mb-1">Width (px)</span><input type="number" className="input-field w-full" value={w} onChange={e=>setWidth(+e.target.value)} /></label>
            <label className="text-sm"><span className="text-xs text-muted block mb-1">Height (px)</span><input type="number" className="input-field w-full" value={h} onChange={e=>setHeight(+e.target.value)} /></label>
          </div>
          <div className="flex gap-3 mb-3 flex-wrap items-center">
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={linked} onChange={e=>setLinked(e.target.checked)} /> Lock aspect ratio</label>
            <select className="input-field" value={fmt} onChange={e=>setFmt(e.target.value as typeof fmt)}>
              <option value="image/jpeg">JPEG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option>
            </select>
            {fmt !== "image/png" && <label className="flex items-center gap-2 text-sm">Quality: <input type="range" min={10} max={100} value={quality} onChange={e=>setQ(+e.target.value)} className="w-24" /> {quality}%</label>}
            <button className="btn-primary" onClick={resize}>Resize →</button>
            <button className="btn-secondary" onClick={download}>Download</button>
          </div>
          <p className="text-xs text-muted mb-2">Original: {origW}×{origH}px → Resized: {w}×{h}px</p>
          <canvas ref={canvasRef} className="max-w-full rounded-xl border" style={{maxHeight:"200px",objectFit:"contain"}} />
        </>
      )}
    </ToolWrap>
  );
}

/* ── Image Filters ── */
export function ImageFilters() {
  const [src, setSrc] = useState<string | null>(null);
  const [filters, setFilters] = useState({ grayscale:0, sepia:0, brightness:100, contrast:100, blur:0, invert:0, hue:0, saturate:100 });
  const fStr = `grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) brightness(${filters.brightness}%) contrast(${filters.contrast}%) blur(${filters.blur}px) invert(${filters.invert}%) hue-rotate(${filters.hue}deg) saturate(${filters.saturate}%)`;
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if(f) setSrc(URL.createObjectURL(f)); };
  const download = () => {
    if (!src) return;
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas"); c.width=img.width; c.height=img.height;
      const ctx = c.getContext("2d")!; ctx.filter = fStr; ctx.drawImage(img,0,0);
      const a = document.createElement("a"); a.href=c.toDataURL("image/png"); a.download="filtered.png"; a.click();
    };
    img.src = src;
  };
  const reset = () => setFilters({ grayscale:0,sepia:0,brightness:100,contrast:100,blur:0,invert:0,hue:0,saturate:100 });
  const SLIDERS = [["grayscale","Grayscale %",0,100,1],["sepia","Sepia %",0,100,1],["brightness","Brightness %",0,200,1],["contrast","Contrast %",0,200,1],["blur","Blur (px)",0,20,0.5],["invert","Invert %",0,100,1],["hue","Hue Rotate °",0,360,1],["saturate","Saturation %",0,200,1]] as const;
  return (
    <ToolWrap>
      <input type="file" accept="image/*" className="input-field w-full mb-3" onChange={onFile} />
      {src && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="filtered" className="max-h-48 w-auto rounded-xl border mb-3" style={{filter:fStr}} />
          <div className="grid gap-2 sm:grid-cols-2 mb-3">
            {SLIDERS.map(([k,l,min,max,step])=>(
              <label key={k} className="text-xs flex items-center gap-2">
                <span className="w-28 shrink-0 text-muted">{l}</span>
                <input type="range" min={min} max={max} step={step} value={filters[k]} onChange={e=>setFilters({...filters,[k]:+e.target.value})} className="flex-1" />
                <span className="w-10 text-right tabular-nums">{filters[k]}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={reset}>Reset</button>
            <button className="btn-primary" onClick={download}>Download PNG</button>
            <div className="relative flex-1"><input className="input-field w-full font-mono text-xs" readOnly value={`filter: ${fStr};`} /><CopyBtn text={`filter: ${fStr};`} /></div>
          </div>
        </>
      )}
    </ToolWrap>
  );
}

/* ── Image to Base64 ── */
export function ImageToBase64() {
  const [b64, setB64] = useState("");
  const [mime, setMime] = useState("");
  const [size, setSize] = useState(0);
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if(!f) return;
    setMime(f.type); setSize(f.size);
    const r = new FileReader();
    r.onload = () => setB64(String(r.result));
    r.readAsDataURL(f);
  };
  const stripped = b64.replace(/^data:[^;]+;base64,/,"");
  return (
    <ToolWrap>
      <input type="file" accept="image/*" className="input-field w-full mb-3" onChange={onFile} />
      {b64 && (
        <>
          <p className="text-xs text-muted mb-2">{mime} · {(size/1024).toFixed(1)} KB → {(stripped.length/1024).toFixed(1)} KB base64</p>
          <div className="space-y-2">
            {[["Data URI (full)",b64],["Base64 only",stripped],["CSS background",`background-image: url('${b64}');`],["<img> tag",`<img src="${b64}" alt="">`]].map(([l,v])=>(
              <div key={String(l)} className="relative">
                <p className="text-xs text-muted mb-1">{l}</p>
                <textarea className="input-area h-16 pr-10 font-mono text-xs" readOnly value={v} />
                <CopyBtn text={v} absolute />
              </div>
            ))}
          </div>
        </>
      )}
    </ToolWrap>
  );
}

/* ── Base64 to Image ── */
export function Base64ToImage() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const getSrc = () => {
    const s = input.trim();
    if (s.startsWith("data:")) return s;
    try { atob(s); return `data:image/png;base64,${s}`; } catch { return null; }
  };
  const src = input ? getSrc() : null;
  const download = () => {
    if (!src) return;
    const a = document.createElement("a"); a.href=src; a.download="image.png"; a.click();
  };
  return (
    <ToolWrap>
      <textarea className="input-area h-24 font-mono text-xs mb-3" placeholder="Paste base64 or data URI…" value={input} onChange={e=>{setInput(e.target.value);setError("");}} />
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="decoded" className="max-h-48 w-auto rounded-xl border mb-3" onError={()=>setError("Invalid image data")} />
          <button className="btn-primary" onClick={download}>Download</button>
        </>
      ) : input && <p className="text-sm text-red-500">{error || "⚠ Invalid base64 or data URI"}</p>}
    </ToolWrap>
  );
}

/* ── EXIF / Image Metadata Viewer ── */
export function ExifViewer() {
  const [meta, setMeta] = useState<Record<string,string>|null>(null);
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if(!f) return;
    const info: Record<string,string> = {
      "File name": f.name, "File type": f.type, "File size": `${(f.size/1024).toFixed(2)} KB`,
      "Last modified": new Date(f.lastModified).toLocaleString(),
    };
    const img = new Image();
    img.onload = () => {
      info["Natural width"] = img.naturalWidth + "px";
      info["Natural height"] = img.naturalHeight + "px";
      info["Aspect ratio"] = (img.naturalWidth/img.naturalHeight).toFixed(3);
      setMeta(info);
    };
    img.src = URL.createObjectURL(f);
  };
  return (
    <ToolWrap>
      <input type="file" accept="image/*" className="input-field w-full mb-3" onChange={onFile} />
      {meta && (
        <div className="space-y-1.5">
          {Object.entries(meta).map(([k,v])=>(
            <div key={k} className="surface flex items-center gap-3 rounded-lg border px-3 py-2 text-sm">
              <span className="text-xs text-muted w-36 shrink-0">{k}</span>
              <span className="flex-1 font-mono text-xs">{v}</span>
              <CopyBtn text={v} />
            </div>
          ))}
          <p className="text-xs text-muted mt-2 italic">Note: EXIF metadata (GPS, camera info) requires a dedicated EXIF parser library. Shown above are browser-accessible properties.</p>
        </div>
      )}
    </ToolWrap>
  );
}

/* ── Favicon Generator ── */
export function FaviconGenerator() {
  const [src, setSrc] = useState<string|null>(null);
  const SIZES = [16,32,48,64,96,128,180,256];
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if(f) setSrc(URL.createObjectURL(f)); };
  const download = (size: number) => {
    if (!src) return;
    const canvas = document.createElement("canvas"); canvas.width=size; canvas.height=size;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img,0,0,size,size);
      const a = document.createElement("a"); a.href=canvas.toDataURL("image/png"); a.download=`favicon-${size}x${size}.png`; a.click();
    };
    img.src = src;
  };
  return (
    <ToolWrap>
      <input type="file" accept="image/*" className="input-field w-full mb-3" onChange={onFile} />
      {src && (
        <>
          <p className="text-xs text-muted mb-3">Click any size to download as PNG:</p>
          <div className="flex flex-wrap gap-3">
            {SIZES.map(s=>(
              <button key={s} onClick={()=>download(s)} className="surface flex flex-col items-center gap-1 rounded-xl border p-3 hover:border-brand-400 transition-colors">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" width={Math.min(s,48)} height={Math.min(s,48)} style={{objectFit:"cover"}} className="rounded" />
                <span className="text-xs font-mono text-muted">{s}×{s}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-3">For ICO format, convert the 16×16 PNG using the File Converter tool.</p>
        </>
      )}
    </ToolWrap>
  );
}

/* ── Image Watermark ── */
export function ImageWatermark() {
  const [src, setSrc] = useState<string|null>(null);
  const [text, setText] = useState("© Your Name");
  const [pos, setPos] = useState<"bottom-right"|"bottom-left"|"center"|"top-right">("bottom-right");
  const [size, setSize] = useState(24);
  const [opacity, setOpacity] = useState(0.7);
  const [color, setColor] = useState("#ffffff");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if(f) setSrc(URL.createObjectURL(f)); };
  const apply = useCallback(() => {
    if (!src || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img,0,0);
      ctx.font = `bold ${size}px sans-serif`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      const tw = ctx.measureText(text).width;
      const pad = 20;
      const x = pos.includes("right") ? img.width-tw-pad : pos==="center" ? (img.width-tw)/2 : pad;
      const y = pos.includes("bottom") ? img.height-pad : pos==="center" ? img.height/2 : size+pad;
      ctx.fillText(text, x, y);
      ctx.globalAlpha = 1;
    };
    img.src = src;
  }, [src, text, pos, size, opacity, color]);
  const download = () => {
    apply();
    setTimeout(()=>{
      if(!canvasRef.current) return;
      const a = document.createElement("a"); a.href=canvasRef.current.toDataURL("image/png"); a.download="watermarked.png"; a.click();
    }, 100);
  };
  return (
    <ToolWrap>
      <input type="file" accept="image/*" className="input-field w-full mb-3" onChange={onFile} />
      {src && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 mb-3">
            <input className="input-field" placeholder="Watermark text…" value={text} onChange={e=>setText(e.target.value)} />
            <select className="input-field" value={pos} onChange={e=>setPos(e.target.value as typeof pos)}>
              <option value="bottom-right">Bottom Right</option><option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option><option value="center">Center</option>
            </select>
            <label className="flex items-center gap-2 text-sm">Font size: <input type="range" min={12} max={120} value={size} onChange={e=>setSize(+e.target.value)} className="flex-1" /> {size}px</label>
            <label className="flex items-center gap-2 text-sm">Opacity: <input type="range" min={0} max={1} step={0.05} value={opacity} onChange={e=>setOpacity(+e.target.value)} className="flex-1" /> {opacity}</label>
            <label className="flex items-center gap-2 text-sm">Color: <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-9 w-9 rounded-lg border cursor-pointer" /></label>
          </div>
          <div className="flex gap-2 mb-3">
            <button className="btn-secondary" onClick={apply}>Preview</button>
            <button className="btn-primary" onClick={download}>Download</button>
          </div>
          <canvas ref={canvasRef} className="max-w-full max-h-48 rounded-xl border" />
        </>
      )}
    </ToolWrap>
  );
}

/* ── Color Picker from Image ── */
export function ColorPickerFromImage() {
  const [src, setSrc] = useState<string|null>(null);
  const [picked, setPicked] = useState<{hex:string;rgb:string;hsl:string}|null>(null);
  const [pos, setPos] = useState({x:0,y:0});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f=e.target.files?.[0]; if(f) setSrc(URL.createObjectURL(f)); };
  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current; if(!c) return;
    const rect = c.getBoundingClientRect();
    const scaleX = c.width/rect.width, scaleY = c.height/rect.height;
    const x = Math.floor((e.clientX-rect.left)*scaleX), y = Math.floor((e.clientY-rect.top)*scaleY);
    const ctx = c.getContext("2d")!;
    const [r,g,b] = ctx.getImageData(x,y,1,1).data;
    const hex = "#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("");
    const rn=r/255,gn=g/255,bn=b/255,max=Math.max(rn,gn,bn),min=Math.min(rn,gn,bn);
    let h=0,s=0,l=(max+min)/2;
    if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);h=max===rn?(gn-bn)/d+(gn<bn?6:0):max===gn?(bn-rn)/d+2:(rn-gn)/d+4;h=Math.round(h*60);}
    setPos({x,y}); setPicked({hex, rgb:`rgb(${r},${g},${b})`, hsl:`hsl(${h},${Math.round(s*100)}%,${Math.round(l*100)}%)`});
  };
  const imgOnLoad = () => {
    if (!src || !canvasRef.current) return;
    const img = new Image(); img.onload=()=>{const c=canvasRef.current!;c.width=img.width;c.height=img.height;c.getContext("2d")!.drawImage(img,0,0);};
    img.src = src;
  };
  return (
    <ToolWrap>
      <input type="file" accept="image/*" className="input-field w-full mb-3" onChange={onFile} />
      {src && (
        <>
          <p className="text-xs text-muted mb-2">Click anywhere on the image to pick a color:</p>
          <canvas ref={canvasRef} className="max-w-full max-h-56 rounded-xl border cursor-crosshair" onClick={onClick} onLoad={imgOnLoad} style={{display:"block"}} />
          {/* Load image into canvas */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="sr-only" onLoad={imgOnLoad} />
          {picked && (
            <div className="mt-3 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl border-2 border-[var(--border)] shadow" style={{background:picked.hex}} />
              <div className="space-y-1">
                {[picked.hex, picked.rgb, picked.hsl].map(v=>(
                  <div key={v} className="flex items-center gap-2">
                    <span className="font-mono text-sm">{v}</span>
                    <CopyBtn text={v} />
                  </div>
                ))}
                <span className="text-xs text-muted">at ({pos.x},{pos.y})</span>
              </div>
            </div>
          )}
        </>
      )}
    </ToolWrap>
  );
}

/* ── Image Compressor ── */
export function ImageCompressor() {
  const [src, setSrc] = useState<string|null>(null);
  const [origSize, setOrigSize] = useState(0);
  const [quality, setQ] = useState(70);
  const [fmt, setFmt] = useState<"image/jpeg"|"image/webp">("image/webp");
  const [result, setResult] = useState<{url:string;size:number}|null>(null);
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f=e.target.files?.[0]; if(!f) return; setOrigSize(f.size); setSrc(URL.createObjectURL(f)); setResult(null); };
  const compress = () => {
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width=img.naturalWidth; c.height=img.naturalHeight;
      const ctx = c.getContext("2d")!;
      if (fmt==="image/jpeg") { ctx.fillStyle="#fff"; ctx.fillRect(0,0,c.width,c.height); }
      ctx.drawImage(img,0,0);
      const dataUrl = c.toDataURL(fmt, quality/100);
      const size = Math.round(dataUrl.length * 0.75);
      setResult({url:dataUrl, size});
    };
    img.src = src;
  };
  const fmtBytes = (b:number)=>b>=1024*1024?`${(b/1024/1024).toFixed(2)}MB`:b>=1024?`${(b/1024).toFixed(1)}KB`:`${b}B`;
  return (
    <ToolWrap>
      <input type="file" accept="image/*" className="input-field w-full mb-3" onChange={onFile} />
      {src && (
        <>
          <div className="flex gap-3 mb-3 flex-wrap items-center">
            <select className="input-field" value={fmt} onChange={e=>setFmt(e.target.value as typeof fmt)}>
              <option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option>
            </select>
            <label className="flex items-center gap-2 text-sm flex-1">Quality: <input type="range" min={10} max={100} value={quality} onChange={e=>setQ(+e.target.value)} className="flex-1" /> {quality}%</label>
            <button className="btn-primary" onClick={compress}>Compress</button>
          </div>
          {result && (
            <div className="surface rounded-xl border p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold">Original: {fmtBytes(origSize)}</div>
                  <div className="text-sm font-semibold text-green-600">Compressed: {fmtBytes(result.size)} ({Math.round((1-result.size/origSize)*100)}% saved)</div>
                </div>
                <a href={result.url} download={`compressed.${fmt.split("/")[1]}`} className="btn-primary text-sm no-underline">Download</a>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.url} alt="compressed" className="max-h-40 w-auto rounded-lg" />
            </div>
          )}
        </>
      )}
    </ToolWrap>
  );
}
