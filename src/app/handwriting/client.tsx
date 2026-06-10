"use client";
import { useCallback, useEffect, useState } from "react";

const FONTS = [
  "Caveat", "Dancing Script", "Patrick Hand", "Shadows Into Light", "Indie Flower",
  "Homemade Apple", "Gloria Hallelujah", "Reenie Beanie", "Kalam", "Sacramento",
  "Satisfy", "Pacifico", "Permanent Marker", "Rock Salt", "Nanum Pen Script",
  "Cookie", "Architects Daughter", "Covered By Your Grace", "La Belle Aurore",
  "Zeyada", "Gochi Hand", "Liu Jian Mao Cao", "Just Another Hand", "Marck Script",
  "Yellowtail", "Bad Script", "Caveat Brush", "Mali", "Klee One", "Square Peg",
];

const INKS = [
  { name: "Blue", value: "#1a3fb0" }, { name: "Black", value: "#101418" },
  { name: "Royal", value: "#283593" }, { name: "Red", value: "#b00020" },
  { name: "Green", value: "#1b5e20" }, { name: "Purple", value: "#5e35b1" },
  { name: "Teal", value: "#00695c" }, { name: "Brown", value: "#5d4037" },
];

type Paper =
  // original 8
  | "ruled" | "blank" | "grid" | "dotted" | "graph" | "legal" | "dark" | "aged"
  // ruled variants
  | "wide-ruled" | "narrow-ruled" | "college" | "french-ruled" | "steno" | "cornell"
  // grid variants
  | "isometric" | "hex" | "small-grid" | "large-grid" | "cross-hatch" | "blueprint"
  // dot variants
  | "dot-large" | "dot-cross" | "bullet-journal"
  // specialty lined
  | "music" | "tablature" | "handwriting-practice" | "comic" | "storyboard"
  // colour papers
  | "yellow" | "pink" | "green" | "blue-paper" | "lavender" | "peach" | "gray"
  // textured / vintage
  | "kraft" | "newspaper" | "parchment" | "vellum" | "watercolor" | "canvas" | "leather" | "marble"
  // themed
  | "chalkboard" | "whiteboard" | "sticky-note" | "index-card" | "receipt" | "blueprint2"
  | "engineering" | "calligraphy" | "crossword" | "sudoku" | "origami" | "millimeter";

type PaperGroup = { group: string; items: [Paper, string][] };
const PAPER_GROUPS: PaperGroup[] = [
  { group: "Classic", items: [["ruled","Ruled"],["blank","Blank"],["wide-ruled","Wide ruled"],["narrow-ruled","Narrow ruled"],["college","College ruled"],["steno","Steno"]] },
  { group: "Lined", items: [["legal","Legal pad"],["french-ruled","French ruled"],["cornell","Cornell notes"],["handwriting-practice","Practice lines"],["calligraphy","Calligraphy"],["music","Music staff"]] },
  { group: "Grid", items: [["grid","Grid"],["graph","Graph"],["small-grid","Small grid"],["large-grid","Large grid"],["millimeter","Millimeter"],["engineering","Engineering"],["cross-hatch","Cross hatch"],["isometric","Isometric"],["blueprint","Blueprint"],["blueprint2","Blueprint 2"]] },
  { group: "Dot", items: [["dotted","Dotted"],["dot-large","Dot large"],["dot-cross","Dot cross"],["bullet-journal","Bullet journal"]] },
  { group: "Specialty", items: [["tablature","Guitar tab"],["comic","Comic strips"],["storyboard","Storyboard"],["crossword","Crossword"],["sudoku","Sudoku"],["origami","Origami"],["hex","Hexagonal"]] },
  { group: "Colour", items: [["yellow","Yellow"],["pink","Pink"],["green","Green"],["blue-paper","Blue"],["lavender","Lavender"],["peach","Peach"],["gray","Gray"]] },
  { group: "Vintage", items: [["aged","Aged"],["kraft","Kraft"],["newspaper","Newspaper"],["parchment","Parchment"],["vellum","Vellum"],["watercolor","Watercolour"],["leather","Leather"]] },
  { group: "Special", items: [["dark","Dark"],["chalkboard","Chalkboard"],["whiteboard","Whiteboard"],["canvas","Canvas"],["marble","Marble"],["sticky-note","Sticky note"],["index-card","Index card"],["receipt","Receipt"]] },
];
const PAPERS = PAPER_GROUPS.flatMap((g) => g.items);

// A wide range of page sizes (px @ ~96 DPI). "Custom" reads the width/height inputs.
const SIZES: Record<string, [number, number]> = {
  A3: [1123, 1587], A4: [794, 1123], A5: [559, 794], A6: [397, 559],
  Letter: [816, 1056], Legal: [816, 1344], Tabloid: [1056, 1632],
  Executive: [696, 1008], Statement: [528, 816], Folio: [816, 1248],
  B4: [944, 1334], B5: [665, 944], B6: [469, 665],
  Postcard: [400, 600], Index4x6: [384, 576], Index5x8: [480, 768],
  Square: [900, 900], Notebook: [720, 960], Pocket: [340, 540],
  Wide: [1280, 720], Portrait: [768, 1024], Landscape: [1123, 794],
};

function Slider({ label, val, set, min, max, step = 1, unit = "" }: { label: string; val: number; set: (n: number) => void; min: number; max: number; step?: number; unit?: string }) {
  return <label className="block text-sm">{label}: {val}{unit}<input type="range" min={min} max={max} step={step} value={val} onChange={(e) => set(+e.target.value)} className="w-full" /></label>;
}

export function HandwritingClient() {
  const [text, setText] = useState(
    "Dear friend,\n\nThis is your text rendered as realistic handwriting. Type or paste anything — long text automatically flows across as many pages as you need.\n\nChoose from 30 fonts, any ink colour, 8 paper styles and 20+ page sizes (or your own custom dimensions), then download as PNG, ZIP or a multi-page PDF.\n\nYours,\nNaushad"
  );
  const [font, setFont] = useState(FONTS[0]);
  const [ink, setInk] = useState(INKS[0].value);
  const [paper, setPaper] = useState<Paper>("ruled");
  const [size, setSize] = useState("A4");
  const [customW, setCustomW] = useState(794);
  const [customH, setCustomH] = useState(1123);
  const [fontSize, setFontSize] = useState(32);
  const [lineHeight, setLineHeight] = useState(46);
  const [marginX, setMarginX] = useState(70);
  const [marginY, setMarginY] = useState(70);
  const [jitter, setJitter] = useState(1.4);
  const [letterSpace, setLetterSpace] = useState(0);
  const [inkVar, setInkVar] = useState(0.15);
  const [penWeight, setPenWeight] = useState(0);
  const [inkBleed, setInkBleed] = useState(0);
  const [texture, setTexture] = useState(true);
  const [customPaper, setCustomPaper] = useState("");
  const [ruleColor, setRuleColor] = useState("");
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
    const [W, H] = size === "Custom" ? [customW, customH] : SIZES[size];
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
      // ── Paper background ───────────────────────────────────────────────
      const BG: Partial<Record<Paper, string>> = {
        "dark": "#1a1f2b", "chalkboard": "#1a2a1a", "aged": "#f3e9d2",
        "legal": "#fffdf0", "yellow": "#fffde7", "pink": "#fce4ec",
        "green": "#f1f8e9", "blue-paper": "#e3f2fd", "lavender": "#f3e5f5",
        "peach": "#fff3e0", "gray": "#f5f5f5", "kraft": "#c8a96e",
        "newspaper": "#e8e0d0", "parchment": "#f0e6c8", "vellum": "#f8f4e8",
        "watercolor": "#eef4fa", "leather": "#6b3a2a", "canvas": "#f5f0e8",
        "marble": "#f0f0f0", "whiteboard": "#fafafa", "sticky-note": "#fff9c4",
        "index-card": "#fffef5", "receipt": "#f9f5ed", "blueprint": "#0a2a5a",
        "blueprint2": "#0d3b6e", "engineering": "#f4f1e8",
      };
      ctx.fillStyle = customPaper || BG[paper] || "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // ── Paper surface effects ───────────────────────────────────────────
      if (paper === "aged" || paper === "parchment") {
        ctx.fillStyle = "rgba(140,110,60,0.05)";
        for (let i = 0; i < 400; i++) ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
      }
      if (paper === "kraft") {
        for (let i = 0; i < 1200; i++) {
          ctx.fillStyle = `rgba(${Math.random()>0.5?180:100},${Math.random()>0.5?120:80},40,${Math.random()*0.07})`;
          ctx.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random() * 2, 1);
        }
      }
      if (paper === "newspaper") {
        for (let i = 0; i < 600; i++) { ctx.fillStyle = `rgba(80,70,50,${Math.random()*0.04})`; ctx.fillRect(Math.random()*W, Math.random()*H, 1, 1); }
      }
      if (paper === "watercolor") {
        const wc = ctx.createRadialGradient(W*0.3,H*0.3,0,W*0.5,H*0.5,W*0.6);
        wc.addColorStop(0,"rgba(180,210,240,0.18)"); wc.addColorStop(1,"rgba(200,230,250,0.05)");
        ctx.fillStyle = wc; ctx.fillRect(0,0,W,H);
      }
      if (paper === "canvas") {
        for (let i = 0; i < W * H / 600; i++) { ctx.fillStyle = `rgba(90,70,40,${Math.random()*0.04})`; ctx.fillRect(Math.random()*W, Math.random()*H, 1+(Math.random()<0.5?1:0), 1+(Math.random()<0.5?1:0)); }
      }
      if (paper === "marble") {
        for (let i = 0; i < 12; i++) {
          ctx.beginPath(); ctx.moveTo(Math.random()*W, 0);
          ctx.bezierCurveTo(Math.random()*W,H*0.3,Math.random()*W,H*0.7,Math.random()*W,H);
          ctx.strokeStyle = `rgba(180,180,180,${0.05+Math.random()*0.08})`; ctx.lineWidth = 1+Math.random()*3; ctx.stroke();
        }
      }
      if (paper === "leather") {
        for (let i = 0; i < 800; i++) { ctx.fillStyle = `rgba(255,200,150,${Math.random()*0.05})`; ctx.fillRect(Math.random()*W,Math.random()*H,1,1); }
      }
      // paper grain (most paper types)
      const skipGrain: Paper[] = ["dark","chalkboard","marble","blueprint","blueprint2"];
      if (texture && !skipGrain.includes(paper)) {
        const isDark = paper === "leather";
        for (let i = 0; i < W * H / 900; i++) {
          ctx.fillStyle = isDark ? `rgba(255,255,255,${Math.random()*0.03})` : `rgba(0,0,0,${Math.random()*0.025})`;
          ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
        }
      }
      if ((paper === "dark" || paper === "chalkboard") && texture) {
        for (let i = 0; i < W * H / 900; i++) { ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.025})`; ctx.fillRect(Math.random()*W, Math.random()*H, 1, 1); }
      }

      // ── Guide lines / patterns ──────────────────────────────────────────
      const defaultLineCol = ["dark","chalkboard","blueprint","blueprint2","leather"].includes(paper)
        ? (paper === "chalkboard" ? "#5a7a5a" : paper.startsWith("blueprint") ? "#2060c0" : "#44607a")
        : "#cfe0f5";
      const lineCol = ruleColor || defaultLineCol;
      ctx.strokeStyle = lineCol; ctx.lineWidth = 1;

      // Ruled family
      const ruledStep: Partial<Record<Paper, number>> = {
        "ruled": lineHeight, "wide-ruled": 36, "narrow-ruled": 24,
        "college": 29, "steno": lineHeight, "aged": lineHeight,
        "french-ruled": lineHeight, "cornell": lineHeight, "legal": lineHeight,
        "handwriting-practice": lineHeight, "calligraphy": lineHeight,
        "yellow": lineHeight, "pink": lineHeight, "green": lineHeight,
        "blue-paper": lineHeight, "lavender": lineHeight, "peach": lineHeight,
        "gray": lineHeight, "sticky-note": lineHeight, "index-card": lineHeight,
        "receipt": 22,
      };
      if (ruledStep[paper]) {
        const step = ruledStep[paper]!;
        for (let y = marginY + step; y < H - 20; y += step) {
          ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();
        }
      }
      // French ruled: vertical margin line
      if (paper === "french-ruled") {
        ctx.strokeStyle = "#f2c0c0"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(marginX, 0); ctx.lineTo(marginX, H); ctx.stroke();
        ctx.strokeStyle = lineCol; ctx.lineWidth = 1;
      }
      // Cornell: right-side notes column + bottom summary box
      if (paper === "cornell") {
        ctx.strokeStyle = "#f2a9a9"; ctx.lineWidth = 1.5;
        const cue = Math.round(W * 0.28);
        ctx.beginPath(); ctx.moveTo(cue, 0); ctx.lineTo(cue, H - 120); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, H - 120); ctx.lineTo(W, H - 120); ctx.stroke();
        ctx.strokeStyle = lineCol; ctx.lineWidth = 1;
      }
      // Legal: red margin + punched holes
      if (paper === "legal") {
        ctx.strokeStyle = "#f2a9a9"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(marginX - 16, 0); ctx.lineTo(marginX - 16, H); ctx.stroke();
        ctx.fillStyle = "#dfe3ea";
        for (let y = 90; y < H; y += 150) { ctx.beginPath(); ctx.arc(22, y, 8, 0, 6.3); ctx.fill(); }
        ctx.strokeStyle = lineCol; ctx.lineWidth = 1;
      }
      // Steno: center vertical line
      if (paper === "steno") {
        ctx.strokeStyle = "#f2a9a9"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
        ctx.strokeStyle = lineCol; ctx.lineWidth = 1;
      }
      // Calligraphy: ascender + baseline + descender triplet
      if (paper === "calligraphy") {
        const band = lineHeight;
        for (let y = marginY + band; y < H - 20; y += band) {
          ctx.strokeStyle = "rgba(100,140,200,0.25)"; ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(30, y - band * 0.6); ctx.lineTo(W - 30, y - band * 0.6); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(30, y - band * 0.35); ctx.lineTo(W - 30, y - band * 0.35); ctx.stroke();
          ctx.setLineDash([]); ctx.strokeStyle = lineCol;
          ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke();
          ctx.strokeStyle = "rgba(200,150,150,0.3)"; ctx.setLineDash([2, 6]);
          ctx.beginPath(); ctx.moveTo(30, y + band * 0.25); ctx.lineTo(W - 30, y + band * 0.25); ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      // Handwriting practice: dashed midline
      if (paper === "handwriting-practice") {
        for (let y = marginY + lineHeight; y < H - 20; y += lineHeight) {
          ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(100,140,200,0.3)";
          ctx.beginPath(); ctx.moveTo(30, y - lineHeight / 2); ctx.lineTo(W - 30, y - lineHeight / 2); ctx.stroke();
          ctx.setLineDash([]); ctx.strokeStyle = lineCol;
        }
      }
      // Music staff: 5 lines per system
      if (paper === "music") {
        const gap = 10, systemH = gap * 4 + 60;
        for (let sy = marginY; sy < H - systemH; sy += systemH) {
          for (let i = 0; i < 5; i++) {
            ctx.beginPath(); ctx.moveTo(30, sy + i * gap); ctx.lineTo(W - 30, sy + i * gap); ctx.stroke();
          }
          // treble clef placeholder bar
          ctx.strokeStyle = lineCol; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(30, sy); ctx.lineTo(30, sy + gap * 4); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(W - 30, sy); ctx.lineTo(W - 30, sy + gap * 4); ctx.stroke();
          ctx.lineWidth = 1;
        }
      }
      // Guitar tablature: 6 strings
      if (paper === "tablature") {
        const gap = 12, systemH = gap * 5 + 60;
        for (let sy = marginY; sy < H - systemH; sy += systemH) {
          for (let i = 0; i < 6; i++) {
            ctx.beginPath(); ctx.moveTo(40, sy + i * gap); ctx.lineTo(W - 40, sy + i * gap); ctx.stroke();
          }
          ctx.font = "9px sans-serif"; ctx.fillStyle = lineCol;
          ["e","B","G","D","A","E"].forEach((n,i) => ctx.fillText(n, 16, sy + i * gap + 3));
        }
      }
      // Grid family
      const gridStep: Partial<Record<Paper,number>> = {
        "grid": 26, "graph": 20, "small-grid": 14, "large-grid": 40,
        "millimeter": 6, "engineering": 10, "cross-hatch": 20,
        "blueprint": 26, "blueprint2": 20,
      };
      if (gridStep[paper]) {
        const step = gridStep[paper]!;
        const col = paper.startsWith("blueprint") ? "rgba(70,120,220,0.4)" : lineCol;
        // minor lines
        for (let x = 0; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.strokeStyle = col; ctx.lineWidth=0.5; ctx.stroke(); }
        for (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.strokeStyle = col; ctx.lineWidth=0.5; ctx.stroke(); }
        // major lines every 5 minor
        if (["graph","millimeter","engineering","blueprint","blueprint2"].includes(paper)) {
          const major = step * 5;
          ctx.lineWidth = 1;
          const majCol = paper.startsWith("blueprint") ? "rgba(100,160,255,0.7)" : ruleColor || "#a0b4c8";
          for (let x = 0; x < W; x += major) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.strokeStyle = majCol; ctx.stroke(); }
          for (let y = 0; y < H; y += major) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.strokeStyle = majCol; ctx.stroke(); }
        }
        ctx.lineWidth = 1;
      }
      // Cross-hatch diagonal overlay
      if (paper === "cross-hatch") {
        ctx.strokeStyle = lineCol; ctx.lineWidth = 0.4;
        const s = 20;
        for (let i = -H; i < W + H; i += s) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i+H,H); ctx.stroke(); }
        for (let i = 0; i < W + H; i += s) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i-H,H); ctx.stroke(); }
      }
      // Dot family
      if (paper === "dotted" || paper === "dot-large" || paper === "dot-cross" || paper === "bullet-journal") {
        const dotStep = paper === "dot-large" ? 36 : 26;
        const dotR = paper === "dot-large" ? 2 : 1.3;
        ctx.fillStyle = lineCol;
        for (let x = 24; x < W; x += dotStep) {
          for (let y = 24; y < H; y += dotStep) {
            if (paper === "dot-cross") {
              ctx.lineWidth = 0.8; ctx.strokeStyle = lineCol;
              ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke();
            } else {
              ctx.beginPath(); ctx.arc(x, y, dotR, 0, 6.3); ctx.fill();
            }
          }
        }
        // bullet journal: monthly divider at top
        if (paper === "bullet-journal") {
          ctx.strokeStyle = lineCol; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(30, marginY); ctx.lineTo(W - 30, marginY); ctx.stroke();
          ctx.lineWidth = 1;
        }
      }
      // Isometric grid (60° triangles)
      if (paper === "hex" || paper === "isometric") {
        const s = 30;
        const h = s * Math.sqrt(3) / 2;
        ctx.strokeStyle = lineCol; ctx.lineWidth = 0.5;
        if (paper === "isometric") {
          for (let y = 0; y < H + s; y += h) {
            for (let x = -s; x < W + s; x += s) {
              const off = Math.round(y / h) % 2 === 0 ? 0 : s / 2;
              ctx.beginPath(); ctx.moveTo(x + off, y); ctx.lineTo(x + off + s, y); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(x + off, y); ctx.lineTo(x + off - s/2, y + h); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(x + off, y); ctx.lineTo(x + off + s/2, y + h); ctx.stroke();
            }
          }
        } else {
          // flat-top hex grid
          const cols = Math.ceil(W / (s * 1.5)) + 1;
          const rows = Math.ceil(H / (h * 2)) + 1;
          const hex = (cx: number, cy: number) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const a = Math.PI / 180 * (60 * i - 30);
              const px = cx + s * Math.cos(a), py = cy + s * Math.sin(a);
              i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath(); ctx.stroke();
          };
          for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
            const cx = c * s * 1.5 + s;
            const cy = r * h * 2 + (c % 2 === 0 ? h : 0);
            hex(cx, cy);
          }
        }
      }
      // Comic: 4 panels
      if (paper === "comic") {
        ctx.strokeStyle = lineCol; ctx.lineWidth = 2;
        const pw = (W - marginX * 2) / 2, ph = (H - marginY * 2) / 2, gap = 8;
        for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
          ctx.strokeRect(marginX + c * (pw + gap), marginY + r * (ph + gap), pw, ph);
        }
      }
      // Storyboard: 3×2 panels with caption bars
      if (paper === "storyboard") {
        const cols = 3, rows = 2;
        const pw = (W - marginX * 2) / cols - 6, ph = (H - marginY * 2) / rows * 0.75;
        const capH = (H - marginY * 2) / rows * 0.22;
        ctx.strokeStyle = lineCol; ctx.lineWidth = 1.5;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const bx = marginX + c * (pw + 8), by = marginY + r * (ph + capH + 10);
          ctx.strokeRect(bx, by, pw, ph);
          ctx.fillStyle = "rgba(0,0,0,0.04)"; ctx.fillRect(bx, by + ph, pw, capH);
          ctx.strokeRect(bx, by + ph, pw, capH);
        }
      }
      // Crossword grid
      if (paper === "crossword") {
        const cell = 28, cols = Math.floor((W - marginX * 2) / cell), rows = Math.floor((H - marginY * 2) / cell);
        ctx.strokeStyle = lineCol; ctx.lineWidth = 1;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          if ((r + c) % 7 === 0 || (r * c) % 11 === 0) {
            ctx.fillStyle = "#222";
          } else {
            ctx.fillStyle = "transparent";
          }
          ctx.fillRect(marginX + c * cell, marginY + r * cell, cell, cell);
          ctx.strokeRect(marginX + c * cell, marginY + r * cell, cell, cell);
        }
      }
      // Sudoku grid (9×9 + 3×3 bold boxes)
      if (paper === "sudoku") {
        const cell = Math.min(40, Math.floor((Math.min(W, H) - marginX * 2) / 9));
        const ox = marginX, oy = marginY;
        for (let i = 0; i <= 9; i++) {
          ctx.lineWidth = i % 3 === 0 ? 2 : 0.5;
          ctx.strokeStyle = lineCol;
          ctx.beginPath(); ctx.moveTo(ox + i * cell, oy); ctx.lineTo(ox + i * cell, oy + 9 * cell); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ox, oy + i * cell); ctx.lineTo(ox + 9 * cell, oy + i * cell); ctx.stroke();
        }
      }
      // Origami: diagonal fold lines
      if (paper === "origami") {
        ctx.strokeStyle = lineCol; ctx.lineWidth = 0.5; ctx.setLineDash([6, 6]);
        const s = 60;
        for (let i = -H; i < W + H; i += s) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i+H,H); ctx.stroke(); }
        for (let i = 0; i < W + H; i += s) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i-H,H); ctx.stroke(); }
        ctx.setLineDash([]); ctx.lineWidth = 1;
        for (let x = 0; x < W; x += s) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
        for (let y = 0; y < H; y += s) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
      }
      // Sticky note: top colour bar
      if (paper === "sticky-note") {
        ctx.fillStyle = "#f9a825"; ctx.fillRect(0, 0, W, 36);
        ctx.strokeStyle = "#e65100"; ctx.lineWidth = 1;
        for (let y = 60; y < H - 20; y += lineHeight) { ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(W - 20, y); ctx.stroke(); }
      }
      // Index card: top red line + ruled
      if (paper === "index-card") {
        ctx.strokeStyle = "#e57373"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, marginY); ctx.lineTo(W, marginY); ctx.stroke();
        ctx.strokeStyle = "#90caf9"; ctx.lineWidth = 1;
        for (let y = marginY + lineHeight; y < H - 10; y += lineHeight) { ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(W - 10, y); ctx.stroke(); }
      }
      // Receipt: narrow ruled, dotted edges
      if (paper === "receipt") {
        ctx.setLineDash([2, 4]); ctx.strokeStyle = lineCol;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(W, H); ctx.stroke();
        ctx.setLineDash([]);
        for (let y = marginY; y < H - 10; y += 22) { ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(W - 10, y); ctx.stroke(); }
      }
      // Whiteboard: subtle shadow border
      if (paper === "whiteboard") {
        ctx.shadowColor = "rgba(0,0,0,0.1)"; ctx.shadowBlur = 12;
        ctx.strokeStyle = "#ddd"; ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, W - 8, H - 8);
        ctx.shadowBlur = 0; ctx.lineWidth = 1;
        ctx.strokeStyle = lineCol;
        for (let y = marginY + lineHeight; y < H - 20; y += lineHeight) { ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke(); }
      }
      // Chalkboard: chalk line style
      if (paper === "chalkboard") {
        ctx.strokeStyle = "rgba(200,230,200,0.25)"; ctx.lineWidth = 1.5;
        for (let y = marginY + lineHeight; y < H - 20; y += lineHeight) { ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 30, y); ctx.stroke(); }
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
          if (inkBleed > 0) { ctx.shadowColor = ctx.fillStyle as string; ctx.shadowBlur = inkBleed; }
          if (penWeight > 0) { ctx.strokeStyle = ctx.fillStyle as string; ctx.lineWidth = penWeight; ctx.strokeText(ch, 0, 0); }
          ctx.fillText(ch, 0, 0);
          if (inkBleed > 0) ctx.shadowBlur = 0;
          ctx.restore();
          x += ctx.measureText(ch).width + letterSpace;
        }
      });
      result.push(canvas.toDataURL("image/png"));
    }
    setPages(result);
    setPage((c) => Math.min(c, result.length - 1));
  }, [fontsReady, font, ink, paper, size, customW, customH, fontSize, lineHeight, marginX, marginY, jitter, letterSpace, inkVar, penWeight, inkBleed, texture, customPaper, ruleColor, wrap]);

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
    const [W, H] = size === "Custom" ? [customW, customH] : SIZES[size];
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
            <p className="mb-1 text-sm font-medium">Paper <span className="text-muted font-normal">({PAPERS.length})</span></p>
            <div className="max-h-52 overflow-auto rounded-xl border surface p-2 space-y-2">
              {PAPER_GROUPS.map((g) => (
                <div key={g.group}>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">{g.group}</p>
                  <div className="flex flex-wrap gap-1">
                    {g.items.map(([p, l]) => (
                      <button key={p} onClick={() => setPaper(p)} className={`rounded-md border px-2 py-0.5 text-[11px] ${paper === p ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface hover:border-brand-400"}`}>{l}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1 text-sm">Paper colour
              <input type="color" value={customPaper || "#ffffff"} onChange={(e) => setCustomPaper(e.target.value)} className="h-7 w-9 rounded" />
              {customPaper && <button onClick={() => setCustomPaper("")} className="text-xs text-brand-600">reset</button>}
            </label>
            <label className="flex items-center gap-1 text-sm">Line colour
              <input type="color" value={ruleColor || "#cfe0f5"} onChange={(e) => setRuleColor(e.target.value)} className="h-7 w-9 rounded" />
              {ruleColor && <button onClick={() => setRuleColor("")} className="text-xs text-brand-600">reset</button>}
            </label>
          </div>
          <div>
            <p className="mb-1 text-sm">Page size <span className="text-muted">({Object.keys(SIZES).length + 1})</span></p>
            <div className="flex max-h-28 flex-wrap gap-1.5 overflow-auto">
              {Object.keys(SIZES).map((s) => <button key={s} onClick={() => setSize(s)} className={`rounded-lg border px-2.5 py-1 text-xs ${size === s ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>{s}</button>)}
              <button onClick={() => setSize("Custom")} className={`rounded-lg border px-2.5 py-1 text-xs ${size === "Custom" ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface"}`}>Custom</button>
            </div>
            {size === "Custom" && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <label className="flex items-center gap-1">W
                  <input type="number" min={120} max={4000} value={customW} onChange={(e) => setCustomW(Math.max(120, Math.min(4000, +e.target.value || 120)))} className="input-field w-20" />
                </label>
                <span className="text-muted">×</span>
                <label className="flex items-center gap-1">H
                  <input type="number" min={120} max={4000} value={customH} onChange={(e) => setCustomH(Math.max(120, Math.min(4000, +e.target.value || 120)))} className="input-field w-20" />
                </label>
                <span className="text-muted text-xs">px</span>
              </div>
            )}
          </div>
          <Slider label="Font size" val={fontSize} set={setFontSize} min={16} max={60} unit="px" />
          <Slider label="Line height" val={lineHeight} set={setLineHeight} min={26} max={90} unit="px" />
          <Slider label="Letter spacing" val={letterSpace} set={setLetterSpace} min={-2} max={12} unit="px" />
          <Slider label="Realism (jitter)" val={jitter} set={setJitter} min={0} max={4} step={0.2} />
          <Slider label="Ink variation" val={inkVar} set={setInkVar} min={0} max={1} step={0.05} />
          <Slider label="Pen weight" val={penWeight} set={setPenWeight} min={0} max={2} step={0.2} />
          <Slider label="Ink bleed" val={inkBleed} set={setInkBleed} min={0} max={4} step={0.5} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={texture} onChange={(e) => setTexture(e.target.checked)} /> Paper texture</label>
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
