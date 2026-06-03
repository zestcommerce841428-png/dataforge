"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── Color Converter ── */
function hexToRgb(h:string){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return{r,g,b};}
function rgbToHex(r:number,g:number,b:number){return"#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("");}
function rgbToHsl(r:number,g:number,b:number){const rn=r/255,gn=g/255,bn=b/255;const max=Math.max(rn,gn,bn),min=Math.min(rn,gn,bn);let h=0,s=0,l=(max+min)/2;if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);h=max===rn?(gn-bn)/d+(gn<bn?6:0):max===gn?(bn-rn)/d+2:(rn-gn)/d+4;h/=6;}return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};}
function hslToRgb(h:number,s:number,l:number){s/=100;l/=100;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let r=0,g=0,b=0;if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}return{r:Math.round((r+m)*255),g:Math.round((g+m)*255),b:Math.round((b+m)*255)};}

export function ColorConverter() {
  const [hex, setHex] = useState("#6366f1");
  const rgb = hexToRgb(hex.length===7?hex:"#000000");
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = (() => {
    const {r,g,b}=rgb; const rn=r/255,gn=g/255,bn=b/255;
    const k=1-Math.max(rn,gn,bn); if(k===1) return{c:0,m:0,y:0,k:100};
    return{c:Math.round(((1-rn-k)/(1-k))*100),m:Math.round(((1-gn-k)/(1-k))*100),y:Math.round(((1-bn-k)/(1-k))*100),k:Math.round(k*100)};
  })();
  const vals = [
    ["HEX", hex],
    ["RGB", `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`],
    ["HSL", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`],
    ["CMYK", `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`],
    ["HSL CSS var", `--color: ${hsl.h} ${hsl.s}% ${hsl.l}%;`],
  ];
  return (
    <ToolWrap>
      <div className="flex items-center gap-4 mb-4">
        <input type="color" value={hex} onChange={e=>setHex(e.target.value)} className="h-14 w-14 rounded-xl border cursor-pointer" />
        <input className="input-field flex-1 font-mono uppercase" value={hex} onChange={e=>setHex(e.target.value.startsWith("#")?e.target.value:"#"+e.target.value)} maxLength={7} />
        <div className="h-14 w-14 rounded-xl border" style={{background:hex}} />
      </div>
      <div className="space-y-2">
        {vals.map(([l,v])=>(
          <div key={l} className="surface flex items-center gap-3 rounded-lg border px-3 py-2">
            <span className="text-xs text-muted w-24 shrink-0">{l}</span>
            <span className="font-mono text-xs flex-1">{v}</span>
            <CopyBtn text={v} />
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Color Palette Generator ── */
export function ColorPalette() {
  const [base, setBase] = useState("#6366f1");
  const {r,g,b} = hexToRgb(base.length===7?base:"#6366f1");
  const {h,s} = rgbToHsl(r,g,b);
  const shades = [5,10,20,30,40,50,60,70,80,90,95].map(l=>({l, hex:rgbToHex(...Object.values(hslToRgb(h,s,l)) as [number,number,number])}));
  const complementary = rgbToHex(...Object.values(hslToRgb((h+180)%360,s,50)) as [number,number,number]);
  const triadic = [(h+120)%360,(h+240)%360].map(hh=>rgbToHex(...Object.values(hslToRgb(hh,s,50)) as [number,number,number]));
  return (
    <ToolWrap>
      <div className="flex items-center gap-4 mb-4">
        <input type="color" value={base} onChange={e=>setBase(e.target.value)} className="h-12 w-12 rounded-xl border cursor-pointer" />
        <input className="input-field flex-1 font-mono uppercase" value={base} onChange={e=>setBase(e.target.value)} />
      </div>
      <div>
        <p className="text-xs text-muted mb-2 font-semibold">Shades</p>
        <div className="flex gap-1 mb-4 flex-wrap">
          {shades.map(({l,hex})=>(
            <div key={l} title={`${hex} (${l}%)`} onClick={()=>navigator.clipboard.writeText(hex)} className="cursor-pointer group relative">
              <div className="h-12 w-12 rounded-lg border border-black/10" style={{background:hex}} />
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-muted opacity-0 group-hover:opacity-100">{l}%</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mb-2 font-semibold mt-2">Harmonies</p>
        <div className="flex gap-2">
          {[[base,"Base"],[complementary,"Complement"],...triadic.map((c,i)=>[c,`Triadic ${i+1}`])].map(([c,l])=>(
            <div key={String(l)} className="text-center cursor-pointer" onClick={()=>navigator.clipboard.writeText(String(c))}>
              <div className="h-10 w-16 rounded-lg border border-black/10" style={{background:String(c)}} />
              <span className="text-[10px] text-muted">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolWrap>
  );
}

/* ── Contrast Checker ── */
export function ContrastChecker() {
  const [fg, setFg] = useState("#ffffff");
  const [bg, setBg] = useState("#6366f1");
  const relative = (hex:string) => {
    const {r,g,b}=hexToRgb(hex.length===7?hex:"#000000");
    const [R,G,B]=[r,g,b].map(v=>{const s=v/255;return s<=0.04045?s/12.92:Math.pow((s+0.055)/1.055,2.4);});
    return 0.2126*R+0.7152*G+0.0722*B;
  };
  const l1=relative(fg), l2=relative(bg);
  const ratio=l1>l2?(l1+0.05)/(l2+0.05):(l2+0.05)/(l1+0.05);
  const ratioStr = ratio.toFixed(2)+":1";
  const aaNormal = ratio>=4.5, aaLarge = ratio>=3, aaaNormal = ratio>=7, aaaLarge = ratio>=4.5;
  return (
    <ToolWrap>
      <div className="mb-4 rounded-2xl p-8 flex items-center justify-center text-2xl font-bold transition-colors" style={{background:bg,color:fg}}>
        Sample Text
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {([["Foreground",fg,setFg],["Background",bg,setBg]] as [string,string,(v:string)=>void][]).map(([l,v,set])=>(
          <div key={String(l)} className="flex items-center gap-2">
            <input type="color" value={String(v)} onChange={e=>(set as (v:string)=>void)(e.target.value)} className="h-10 w-10 rounded-lg border cursor-pointer shrink-0" />
            <div>
              <p className="text-xs text-muted">{l}</p>
              <input className="input-field font-mono text-xs w-24" value={String(v)} onChange={e=>(set as (v:string)=>void)(e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mb-4">
        <div className="text-4xl font-black tabular-nums">{ratioStr}</div>
        <div className="text-sm text-muted">Contrast ratio</div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[["AA Normal",aaNormal,"4.5:1"],["AA Large",aaLarge,"3:1"],["AAA Normal",aaaNormal,"7:1"],["AAA Large",aaaLarge,"4.5:1"]].map(([l,pass,min])=>(
          <div key={String(l)} className={`rounded-xl border p-3 text-center ${pass?"border-green-400 bg-green-50 dark:bg-green-950/20":"border-red-300 bg-red-50 dark:bg-red-950/20"}`}>
            <div className={`text-base font-bold ${pass?"text-green-600":"text-red-500"}`}>{pass?"✓":"✗"}</div>
            <div className="text-xs font-semibold">{l}</div>
            <div className="text-[10px] text-muted">min {String(min)}</div>
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── Gradient Generator ── */
export function GradientGenerator() {
  const [type, setType] = useState<"linear"|"radial"|"conic">("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState([{color:"#6366f1",pos:0},{color:"#a855f7",pos:50},{color:"#ec4899",pos:100}]);
  const gradient = type==="linear"
    ? `linear-gradient(${angle}deg, ${stops.map(s=>`${s.color} ${s.pos}%`).join(", ")})`
    : type==="radial"
    ? `radial-gradient(circle, ${stops.map(s=>`${s.color} ${s.pos}%`).join(", ")})`
    : `conic-gradient(from ${angle}deg, ${stops.map(s=>`${s.color} ${s.pos}%`).join(", ")})`;
  const css = `background: ${gradient};`;
  return (
    <ToolWrap>
      <div className="h-32 rounded-2xl mb-4 border" style={{background:gradient}} />
      <div className="flex gap-2 mb-3 flex-wrap">
        {(["linear","radial","conic"] as const).map(t=>(
          <button key={t} onClick={()=>setType(t)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${type===t?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{t}</button>
        ))}
        {type!=="radial"&&<label className="flex items-center gap-2 text-sm ml-auto">Angle: <input type="range" min={0} max={360} value={angle} onChange={e=>setAngle(+e.target.value)} className="w-24" /> {angle}°</label>}
      </div>
      <div className="space-y-2 mb-3">
        {stops.map((s,i)=>(
          <div key={i} className="flex items-center gap-2">
            <input type="color" value={s.color} onChange={e=>setStops(stops.map((x,j)=>j===i?{...x,color:e.target.value}:x))} className="h-9 w-9 rounded-lg border cursor-pointer" />
            <input type="range" min={0} max={100} value={s.pos} onChange={e=>setStops(stops.map((x,j)=>j===i?{...x,pos:+e.target.value}:x))} className="flex-1" />
            <span className="w-10 text-xs tabular-nums text-muted">{s.pos}%</span>
            {stops.length>2&&<button onClick={()=>setStops(stops.filter((_,j)=>j!==i))} className="text-muted hover:text-red-500">✕</button>}
          </div>
        ))}
        <button onClick={()=>setStops([...stops,{color:"#ffffff",pos:100}])} className="text-sm text-brand-600 hover:underline">+ Add stop</button>
      </div>
      <div className="relative">
        <textarea className="input-area h-16 pr-10 font-mono text-xs" readOnly value={css} />
        <CopyBtn text={css} absolute />
      </div>
    </ToolWrap>
  );
}

/* ── Box Shadow Generator ── */
export function BoxShadowGenerator() {
  const [shadows, setShadows] = useState([{x:0,y:4,blur:8,spread:0,color:"#00000033",inset:false}]);
  const css = `box-shadow: ${shadows.map(s=>`${s.inset?"inset ":""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`).join(",\n            ")};`;
  const add = ()=>setShadows([...shadows,{x:0,y:4,blur:8,spread:0,color:"#00000033",inset:false}]);
  return (
    <ToolWrap>
      <div className="h-24 w-full rounded-2xl bg-[var(--bg-base)] border mb-4 flex items-center justify-center" style={{boxShadow:shadows.map(s=>`${s.inset?"inset ":""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`).join(",")}}>
        <span className="text-sm text-muted">Preview</span>
      </div>
      <div className="space-y-3 mb-3">
        {shadows.map((s,i)=>(
          <div key={i} className="surface rounded-xl border p-3 space-y-2">
            <div className="flex gap-2 flex-wrap text-xs">
              {[["X",s.x,"x"],["Y",s.y,"y"],["Blur",s.blur,"blur"],["Spread",s.spread,"spread"]].map(([l,v,k])=>(
                <label key={String(k)} className="flex items-center gap-1"><span className="text-muted w-10">{l}</span><input type="number" className="input-field w-16 text-xs" value={Number(v)} onChange={e=>setShadows(shadows.map((x,j)=>j===i?{...x,[String(k)]:+e.target.value}:x))} /></label>
              ))}
              <label className="flex items-center gap-1 text-xs"><span className="text-muted">Color</span><input type="color" value={s.color.slice(0,7)} onChange={e=>setShadows(shadows.map((x,j)=>j===i?{...x,color:e.target.value+"33"}:x))} className="h-8 w-8 rounded border cursor-pointer" /></label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer"><input type="checkbox" checked={s.inset} onChange={e=>setShadows(shadows.map((x,j)=>j===i?{...x,inset:e.target.checked}:x))} /> Inset</label>
              {shadows.length>1&&<button onClick={()=>setShadows(shadows.filter((_,j)=>j!==i))} className="text-muted hover:text-red-500 ml-auto">Remove</button>}
            </div>
          </div>
        ))}
        <button onClick={add} className="text-sm text-brand-600 hover:underline">+ Add shadow</button>
      </div>
      <div className="relative"><textarea className="input-area h-20 pr-10 font-mono text-xs" readOnly value={css} /><CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}

/* ── Border Radius Generator ── */
export function BorderRadiusGenerator() {
  const [tl,setTl]=useState(12);const [tr,setTr]=useState(12);const [br,setBr]=useState(12);const [bl,setBl]=useState(12);const [linked,setLinked]=useState(true);
  const setAll=(v:number)=>{setTl(v);setTr(v);setBr(v);setBl(v);};
  const css=`border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
  return (
    <ToolWrap>
      <div className="mb-4 flex items-center justify-center">
        <div className="w-40 h-28 bg-brand-500/20 border-2 border-brand-400 transition-all" style={{borderRadius:`${tl}px ${tr}px ${br}px ${bl}px`}} />
      </div>
      <label className="flex items-center gap-2 mb-3 text-sm cursor-pointer"><input type="checkbox" checked={linked} onChange={e=>setLinked(e.target.checked)} /> Link all corners</label>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {([["Top Left",tl,linked?setAll:setTl],["Top Right",tr,linked?setAll:setTr],["Bottom Right",br,linked?setAll:setBr],["Bottom Left",bl,linked?setAll:setBl]] as [string,number,(n:number)=>void][]).map(([l,v,set])=>(
          <label key={String(l)} className="text-sm">
            <span className="text-xs text-muted block mb-1">{l}</span>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={100} value={Number(v)} onChange={e=>(set as (n:number)=>void)(+e.target.value)} className="flex-1" />
              <span className="w-12 text-right text-xs tabular-nums font-mono">{v}px</span>
            </div>
          </label>
        ))}
      </div>
      <div className="relative"><textarea className="input-area h-12 pr-10 font-mono text-xs" readOnly value={css} /><CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}

/* ── CSS Triangle Generator ── */
export function CssTriangle() {
  const [dir, setDir] = useState<"up"|"down"|"left"|"right">("up");
  const [size, setSize] = useState(40);
  const [color, setColor] = useState("#6366f1");
  const style = {
    up:{borderLeft:`${size}px solid transparent`,borderRight:`${size}px solid transparent`,borderBottom:`${size*2}px solid ${color}`,width:0,height:0},
    down:{borderLeft:`${size}px solid transparent`,borderRight:`${size}px solid transparent`,borderTop:`${size*2}px solid ${color}`,width:0,height:0},
    left:{borderTop:`${size}px solid transparent`,borderBottom:`${size}px solid transparent`,borderRight:`${size*2}px solid ${color}`,width:0,height:0},
    right:{borderTop:`${size}px solid transparent`,borderBottom:`${size}px solid transparent`,borderLeft:`${size*2}px solid ${color}`,width:0,height:0},
  }[dir];
  const css = `.triangle {\n  width: 0;\n  height: 0;\n  ${Object.entries(style).filter(([k])=>k!=="width"&&k!=="height").map(([k,v])=>`border-${k.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${v};`).join("\n  ")}\n}`;
  return (
    <ToolWrap>
      <div className="flex items-center justify-center mb-4 h-24">
        <div style={style} />
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {(["up","down","left","right"] as const).map(d=>(
          <button key={d} onClick={()=>setDir(d)} className={`rounded-lg border px-3 py-1.5 text-xs ${dir===d?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{d}</button>
        ))}
        <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-9 w-9 rounded-lg border cursor-pointer" />
        <label className="flex items-center gap-2 text-sm">Size: <input type="range" min={10} max={100} value={size} onChange={e=>setSize(+e.target.value)} className="w-24" /> {size}px</label>
      </div>
      <div className="relative"><textarea className="input-area h-28 pr-10 font-mono text-xs" readOnly value={css} /><CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}

/* ── Glassmorphism Generator ── */
export function GlassmorphismGenerator() {
  const [blur, setBlur] = useState(10);
  const [opacity, setOpacity] = useState(0.2);
  const [border, setBorder] = useState(0.3);
  const [color, setColor] = useState("#ffffff");
  const css = `.glass {\n  background: ${color}${Math.round(opacity*255).toString(16).padStart(2,"0")};\n  backdrop-filter: blur(${blur}px);\n  -webkit-backdrop-filter: blur(${blur}px);\n  border: 1px solid ${color}${Math.round(border*255).toString(16).padStart(2,"0")};\n  border-radius: 16px;\n}`;
  return (
    <ToolWrap>
      <div className="h-32 rounded-2xl mb-4 relative overflow-hidden" style={{background:"linear-gradient(135deg,#6366f1,#ec4899)"}}>
        <div className="absolute inset-4 rounded-xl flex items-center justify-center" style={{background:`${color}${Math.round(opacity*255).toString(16).padStart(2,"0")}`,backdropFilter:`blur(${blur}px)`,border:`1px solid ${color}${Math.round(border*255).toString(16).padStart(2,"0")}`}}>
          <span className="text-white text-sm font-semibold">Glass Card</span>
        </div>
      </div>
      <div className="space-y-2 mb-3">
        {([["Blur",blur,setBlur,0,40,"px",1],["BG Opacity",opacity,setOpacity,0,1,"",0.01],["Border Opacity",border,setBorder,0,1,"",0.01]] as [string,number,(n:number)=>void,number,number,string,number][]).map(([l,v,set,min,max,unit,step])=>(
          <label key={String(l)} className="flex items-center gap-3 text-sm">
            <span className="w-32 shrink-0 text-muted">{l}</span>
            <input type="range" min={Number(min)} max={Number(max)} step={Number(step)||1} value={Number(v)} onChange={e=>(set as (n:number)=>void)(+e.target.value)} className="flex-1" />
            <span className="w-16 text-right text-xs tabular-nums">{Number(v).toFixed(step?2:0)}{unit}</span>
          </label>
        ))}
        <label className="flex items-center gap-3 text-sm">
          <span className="w-32 shrink-0 text-muted">Base Color</span>
          <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-9 w-9 rounded-lg border cursor-pointer" />
        </label>
      </div>
      <div className="relative"><textarea className="input-area h-36 pr-10 font-mono text-xs" readOnly value={css} /><CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}

/* ── CSS Animation Generator ── */
export function CssAnimationGenerator() {
  const [name, setName] = useState("fadeInUp");
  const [duration, setDuration] = useState(0.5);
  const [timing, setTiming] = useState("ease-out");
  const [delay, setDelay] = useState(0);
  const [iter, setIter] = useState("1");
  const PRESETS: Record<string,{from:string;to:string}> = {
    fadeIn:{from:"opacity: 0",to:"opacity: 1"},
    fadeInUp:{from:"opacity: 0; transform: translateY(20px)",to:"opacity: 1; transform: translateY(0)"},
    slideIn:{from:"transform: translateX(-100%)",to:"transform: translateX(0)"},
    zoomIn:{from:"opacity: 0; transform: scale(0.8)",to:"opacity: 1; transform: scale(1)"},
    bounce:{from:"transform: translateY(0)",to:"transform: translateY(-20px)"},
    pulse:{from:"opacity: 1",to:"opacity: 0.5"},
    spin:{from:"transform: rotate(0deg)",to:"transform: rotate(360deg)"},
    shake:{from:"transform: translateX(0)",to:"transform: translateX(5px)"},
  };
  const preset = PRESETS[name] || PRESETS.fadeInUp;
  const css = `@keyframes ${name} {\n  from { ${preset.from}; }\n  to { ${preset.to}; }\n}\n\n.${name} {\n  animation: ${name} ${duration}s ${timing} ${delay}s ${iter};\n}`;
  return (
    <ToolWrap>
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.keys(PRESETS).map(p=>(
          <button key={p} onClick={()=>setName(p)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${name===p?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{p}</button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 mb-3">
        {([["Duration (s)",duration,setDuration,"number",0.1,5,0.1],["Delay (s)",delay,setDelay,"number",0,5,0.1],["Iteration",iter,setIter,"text",0,0,0]] as [string,string|number,(v:string|number)=>void,string,...number[]][]).map(([l,v,set,type,...rest])=>(
          <label key={String(l)} className="text-sm">
            <span className="text-xs text-muted block mb-1">{l}</span>
            <input type={String(type)} className="input-field w-full" value={String(v)} min={String(rest[0])} max={String(rest[1])} step={String(rest[2])} onChange={e=>(set as (v:string|number)=>void)(type==="number"?+e.target.value:e.target.value)} />
          </label>
        ))}
        <label className="text-sm">
          <span className="text-xs text-muted block mb-1">Timing function</span>
          <select className="input-field w-full" value={timing} onChange={e=>setTiming(e.target.value)}>
            {["ease","ease-in","ease-out","ease-in-out","linear","cubic-bezier(0.4,0,0.2,1)"].map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <div className="relative"><textarea className="input-area h-40 pr-10 font-mono text-xs" readOnly value={css} /><CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}

/* ── Media Query Builder ── */
export function MediaQueryBuilder() {
  const [type, setType] = useState<"min-width"|"max-width"|"between">("min-width");
  const [min, setMin] = useState(768);
  const [max, setMax] = useState(1024);
  const [body, setBody] = useState("  /* styles here */");
  const BREAKPOINTS = [{l:"sm",v:640},{l:"md",v:768},{l:"lg",v:1024},{l:"xl",v:1280},{l:"2xl",v:1536}];
  const mq = type==="between"
    ? `@media (min-width: ${min}px) and (max-width: ${max}px) {\n${body}\n}`
    : `@media (${type}: ${min}px) {\n${body}\n}`;
  return (
    <ToolWrap>
      <div className="flex flex-wrap gap-2 mb-3">
        {(["min-width","max-width","between"] as const).map(t=>(
          <button key={t} onClick={()=>setType(t)} className={`rounded-lg border px-3 py-1.5 text-xs ${type===t?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{t}</button>
        ))}
      </div>
      <div className="flex gap-3 mb-2 flex-wrap">
        <label className="flex items-center gap-2 text-sm">Min: <input type="number" className="input-field w-20" value={min} onChange={e=>setMin(+e.target.value)} />px</label>
        {type==="between"&&<label className="flex items-center gap-2 text-sm">Max: <input type="number" className="input-field w-20" value={max} onChange={e=>setMax(+e.target.value)} />px</label>}
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {BREAKPOINTS.map(bp=>(
          <button key={bp.l} onClick={()=>{setMin(bp.v);}} className="rounded-lg border px-2.5 py-1 text-xs surface hover:border-brand-400">{bp.l} ({bp.v}px)</button>
        ))}
      </div>
      <textarea className="input-area h-20 font-mono text-xs mb-3" value={body} onChange={e=>setBody(e.target.value)} />
      <div className="relative"><textarea className="input-area h-24 pr-10 font-mono text-xs" readOnly value={mq} /><CopyBtn text={mq} absolute /></div>
    </ToolWrap>
  );
}
