"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

/* ── Neumorphism Generator ── */
export function NeumorphismGenerator() {
  const [bg, setBg] = useState("#e0e5ec");
  const [size, setSize] = useState(20);
  const [blur, setBlur] = useState(40);
  const [intensity, setIntensity] = useState(15);
  const [shape, setShape] = useState<"flat"|"concave"|"convex"|"pressed">("flat");
  const darken = (hex:string, amt:number) => { const n=parseInt(hex.slice(1),16); return "#"+[n>>16,n>>8&0xff,n&0xff].map(c=>Math.max(0,Math.min(255,c-amt)).toString(16).padStart(2,"0")).join(""); };
  const lighten = (hex:string, amt:number) => darken(hex,-amt);
  const dark = darken(bg, intensity);
  const light = lighten(bg, intensity);
  const background = shape==="flat"?bg:shape==="concave"?`linear-gradient(145deg,${dark},${light})`:shape==="convex"?`linear-gradient(145deg,${light},${dark})`:bg;
  const boxShadow = shape==="pressed"
    ? `inset ${size}px ${size}px ${blur}px ${dark}, inset -${size}px -${size}px ${blur}px ${light}`
    : `${size}px ${size}px ${blur}px ${dark}, -${size}px -${size}px ${blur}px ${light}`;
  const css = `.neumorphic {\n  border-radius: 50px;\n  background: ${background};\n  box-shadow: ${boxShadow};\n}`;
  return (
    <ToolWrap>
      <div className="h-32 w-full flex items-center justify-center mb-4">
        <div className="h-24 w-24 rounded-3xl transition-all" style={{background,boxShadow}} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 mb-3">
        <label className="text-sm"><span className="text-xs text-muted block mb-1">Background Color</span><div className="flex gap-2"><input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="h-9 w-9 rounded-lg border cursor-pointer shrink-0" /><input className="input-field flex-1 font-mono" value={bg} onChange={e=>setBg(e.target.value)} /></div></label>
        <label className="text-sm"><span className="text-xs text-muted block mb-1">Shape</span>
          <select className="input-field w-full" value={shape} onChange={e=>setShape(e.target.value as typeof shape)}>
            <option value="flat">Flat</option><option value="concave">Concave</option><option value="convex">Convex</option><option value="pressed">Pressed</option>
          </select>
        </label>
        {([["Distance",size,setSize,5,50],["Blur",blur,setBlur,5,80],["Intensity",intensity,setIntensity,1,30]] as [string,number,(n:number)=>void,number,number][]).map(([l,v,set,min,max])=>(
          <label key={l} className="text-sm"><span className="text-xs text-muted block mb-1">{l}: {v}</span><input type="range" min={min} max={max} value={v} onChange={e=>set(+e.target.value)} className="w-full" /></label>
        ))}
      </div>
      <div className="relative"><textarea className="input-area h-28 pr-10 font-mono text-xs" readOnly value={css} /><CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}

/* ── CSS Button Generator ── */
export function CssButtonGenerator() {
  const [label, setLabel] = useState("Click Me");
  const [bg, setBg] = useState("#6366f1");
  const [textColor, setTextColor] = useState("#ffffff");
  const [radius, setRadius] = useState(8);
  const [px, setPx] = useState(20);
  const [py, setPy] = useState(10);
  const [fontSize, setFontSize] = useState(16);
  const [style, setStyle] = useState<"solid"|"outline"|"ghost"|"soft">("solid");
  const btnStyle: React.CSSProperties = style==="solid" ? {background:bg,color:textColor,borderRadius:radius,padding:`${py}px ${px}px`,fontSize,border:"none",cursor:"pointer",fontWeight:600} :
    style==="outline" ? {background:"transparent",color:bg,border:`2px solid ${bg}`,borderRadius:radius,padding:`${py}px ${px}px`,fontSize,cursor:"pointer",fontWeight:600} :
    style==="ghost" ? {background:"transparent",color:bg,border:"none",borderRadius:radius,padding:`${py}px ${px}px`,fontSize,cursor:"pointer",fontWeight:600} :
    {background:bg+"22",color:bg,border:"none",borderRadius:radius,padding:`${py}px ${px}px`,fontSize,cursor:"pointer",fontWeight:600};
  const css = `.button {\n  ${Object.entries(btnStyle).filter(([,v])=>v!==undefined).map(([k,v])=>`${k.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${typeof v==="number"&&k!=="fontWeight"?v+"px":v};`).join("\n  ")}\n}\n.button:hover {\n  opacity: 0.85;\n  transform: translateY(-1px);\n  transition: all 0.15s;\n}`;
  return (
    <ToolWrap>
      <div className="flex justify-center mb-4 p-6 rounded-2xl bg-[var(--surface-2)] border">
        <button style={btnStyle}>{label}</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 mb-3">
        <input className="input-field w-full" placeholder="Button label" value={label} onChange={e=>setLabel(e.target.value)} />
        <div className="flex gap-2">
          {(["solid","outline","ghost","soft"] as const).map(s=>(
            <button key={s} onClick={()=>setStyle(s)} className={`rounded-lg border px-2 py-1.5 text-xs ${style===s?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{s}</button>
          ))}
        </div>
        <label className="text-sm"><span className="text-xs text-muted block mb-1">Background</span><div className="flex gap-2"><input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="h-9 w-9 rounded-lg border cursor-pointer" /><input className="input-field flex-1 font-mono" value={bg} onChange={e=>setBg(e.target.value)} /></div></label>
        <label className="text-sm"><span className="text-xs text-muted block mb-1">Text Color</span><div className="flex gap-2"><input type="color" value={textColor} onChange={e=>setTextColor(e.target.value)} className="h-9 w-9 rounded-lg border cursor-pointer" /><input className="input-field flex-1 font-mono" value={textColor} onChange={e=>setTextColor(e.target.value)} /></div></label>
        {([["Border Radius",radius,setRadius,0,50],["Padding X",px,setPx,4,60],["Padding Y",py,setPy,4,30],["Font Size",fontSize,setFontSize,10,32]] as [string,number,(n:number)=>void,number,number][]).map(([l,v,set,min,max])=>(
          <label key={l} className="text-sm"><span className="text-xs text-muted block mb-1">{l}: {v}px</span><input type="range" min={min} max={max} value={v} onChange={e=>set(+e.target.value)} className="w-full" /></label>
        ))}
      </div>
      <div className="relative"><textarea className="input-area h-36 pr-10 font-mono text-xs" readOnly value={css} /><CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}

/* ── CSS Variables Generator ── */
export function CssVariablesGenerator() {
  const [vars, setVars] = useState([
    {k:"--color-primary",v:"#6366f1"},{k:"--color-secondary",v:"#ec4899"},
    {k:"--font-size-base",v:"16px"},{k:"--border-radius",v:"8px"},
    {k:"--spacing-sm",v:"0.5rem"},{k:"--spacing-md",v:"1rem"},
    {k:"--shadow",v:"0 4px 6px rgba(0,0,0,0.1)"},{k:"--transition",v:"all 0.2s ease"},
  ]);
  const css = `:root {\n${vars.map(({k,v})=>`  ${k}: ${v};`).join("\n")}\n}`;
  const addVar = () => setVars([...vars,{k:"--new-var",v:"value"}]);
  return (
    <ToolWrap>
      <div className="space-y-2 mb-3">
        {vars.map((v,i)=>(
          <div key={i} className="flex gap-2 items-center">
            <input className="input-field flex-1 font-mono text-xs" placeholder="--variable-name" value={v.k} onChange={e=>setVars(vars.map((x,j)=>j===i?{...x,k:e.target.value}:x))} />
            <span className="text-muted">:</span>
            <input className="input-field flex-1 font-mono text-xs" placeholder="value" value={v.v} onChange={e=>setVars(vars.map((x,j)=>j===i?{...x,v:e.target.value}:x))} />
            <button onClick={()=>setVars(vars.filter((_,j)=>j!==i))} className="text-muted hover:text-red-500 px-1">✕</button>
          </div>
        ))}
        <button onClick={addVar} className="text-sm text-brand-600 hover:underline">+ Add variable</button>
      </div>
      <div className="relative"><textarea className="input-area h-40 pr-10 font-mono text-xs" readOnly value={css} /><CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}

/* ── CSS Clip Path Generator ── */
export function CssClipPath() {
  const [shape, setShape] = useState<"polygon"|"circle"|"ellipse"|"inset">("polygon");
  const [values, setValues] = useState({
    polygon:"50% 0%, 100% 100%, 0% 100%",
    circle:"50% at 50% 50%",
    ellipse:"50% 30% at 50% 50%",
    inset:"10% 10% 10% 10% round 10px",
  });
  const clipPath = `${shape}(${values[shape]})`;
  const css = `.clipped {\n  clip-path: ${clipPath};\n  -webkit-clip-path: ${clipPath};\n}`;
  const PRESETS: Record<string, [string, string][]> = {
    polygon: [["Triangle","50% 0%,100% 100%,0% 100%"],["Pentagon","50% 0%,100% 38%,82% 100%,18% 100%,0% 38%"],["Hexagon","25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%"],["Arrow right","0% 0%,75% 0%,100% 50%,75% 100%,0% 100%,25% 50%"],["Star","50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%"]],
    circle: [["Center","50% at 50% 50%"],["Top-left","30% at 20% 20%"],["Full","50% at 50% 50%"]],
    ellipse: [["Wide","60% 40% at 50% 50%"],["Tall","30% 60% at 50% 50%"]],
    inset: [["Slight","5% 5% 5% 5% round 4px"],["Heavy","20% 20% 20% 20% round 20px"]],
  };
  return (
    <ToolWrap>
      <div className="flex justify-center mb-4 p-4 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500">
        <div className="w-32 h-32 bg-white transition-all" style={{clipPath}} />
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {(["polygon","circle","ellipse","inset"] as const).map(s=>(
          <button key={s} onClick={()=>setShape(s)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${shape===s?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{s}</button>
        ))}
      </div>
      <div className="mb-3">
        <p className="text-xs text-muted mb-1.5">Presets:</p>
        <div className="flex flex-wrap gap-2">
          {(PRESETS[shape]||[]).map(([label,val])=>(
            <button key={label} onClick={()=>setValues({...values,[shape]:val})} className="rounded-lg border px-2.5 py-1 text-xs surface hover:border-brand-400">{label}</button>
          ))}
        </div>
      </div>
      <input className="input-field w-full font-mono mb-3" value={values[shape]} onChange={e=>setValues({...values,[shape]:e.target.value})} />
      <div className="relative"><textarea className="input-area h-20 pr-10 font-mono text-xs" readOnly value={css} /><CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}

/* ── Typography Scale Generator ── */
export function TypographyScale() {
  const [base, setBase] = useState(16);
  const [ratio, setRatio] = useState(1.25);
  const [unit, setUnit] = useState<"px"|"rem">("rem");
  const RATIOS = [["Minor Second",1.067],["Major Second",1.125],["Minor Third",1.2],["Major Third",1.25],["Perfect Fourth",1.333],["Augmented Fourth",1.414],["Perfect Fifth",1.5],["Golden Ratio",1.618]];
  const scale = [-2,-1,0,1,2,3,4,5,6].map(step=>({
    step, name:["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl"][step+2],
    px: Math.round(base * Math.pow(ratio, step) * 100)/100,
    rem: Math.round(base * Math.pow(ratio, step) / base * 1000)/1000,
  }));
  const css = scale.map(s=>`--text-${s.name}: ${unit==="px"?s.px+"px":s.rem+"rem"};`).join("\n");
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <label className="text-sm flex items-center gap-2">Base: <input type="number" className="input-field w-20" value={base} min={10} max={24} onChange={e=>setBase(+e.target.value)} />px</label>
        <label className="text-sm flex items-center gap-2">Ratio:
          <select className="input-field" value={ratio} onChange={e=>setRatio(+e.target.value)}>
            {RATIOS.map(([l,v])=><option key={String(v)} value={Number(v)}>{l} ({v})</option>)}
          </select>
        </label>
        <div className="flex gap-1">
          {(["px","rem"] as const).map(u=><button key={u} onClick={()=>setUnit(u)} className={`rounded-lg border px-3 py-1.5 text-xs ${unit===u?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{u}</button>)}
        </div>
      </div>
      <div className="space-y-2 mb-3">
        {scale.map(s=>(
          <div key={s.name} className="flex items-center gap-3">
            <span className="text-xs text-muted w-12 shrink-0 font-mono">{s.name}</span>
            <div className="overflow-hidden" style={{fontSize:Math.min(s.px,32)+"px",lineHeight:1.2,fontWeight:s.step>=3?700:s.step>=1?600:400}}>Ag</div>
            <span className="text-xs text-muted ml-auto tabular-nums font-mono">{unit==="px"?s.px+"px":s.rem+"rem"}</span>
          </div>
        ))}
      </div>
      <div className="relative"><textarea className="input-area h-40 pr-10 font-mono text-xs" readOnly value={css} /><CopyBtn text={css} absolute /></div>
    </ToolWrap>
  );
}
