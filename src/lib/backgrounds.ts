// 72 ready-made page backgrounds. Each `css` is the value applied to the
// `--bg-grad` CSS variable on <html>, so they work in both light and dark mode
// (the colours are translucent and layer over --bg-base).

export type Bg = { id: string; label: string; css: string };

type Palette = { name: string; label: string; c: [string, string, string] };

const PALETTES: Palette[] = [
  { name: "aurora", label: "Aurora", c: ["#a7f3d0", "#bae6fd", "#ddd6fe"] },
  { name: "sunset", label: "Sunset", c: ["#fed7aa", "#fecaca", "#fbcfe8"] },
  { name: "ocean", label: "Ocean", c: ["#7dd3fc", "#5eead4", "#a5b4fc"] },
  { name: "berry", label: "Berry", c: ["#f0abfc", "#fda4af", "#c4b5fd"] },
  { name: "lime", label: "Lime", c: ["#bef264", "#86efac", "#5eead4"] },
  { name: "ember", label: "Ember", c: ["#fdba74", "#f87171", "#facc15"] },
  { name: "grape", label: "Grape", c: ["#c4b5fd", "#a78bfa", "#f0abfc"] },
  { name: "mint", label: "Mint", c: ["#6ee7b7", "#99f6e4", "#a7f3d0"] },
  { name: "rose", label: "Rose", c: ["#fda4af", "#fbcfe8", "#fecdd3"] },
  { name: "sky", label: "Sky", c: ["#93c5fd", "#bae6fd", "#c7d2fe"] },
  { name: "coral", label: "Coral", c: ["#fca5a5", "#fdba74", "#fde68a"] },
  { name: "lavender", label: "Lavender", c: ["#ddd6fe", "#e9d5ff", "#c7d2fe"] },
  { name: "forest", label: "Forest", c: ["#86efac", "#4ade80", "#a3e635"] },
  { name: "peach", label: "Peach", c: ["#fed7aa", "#fecaca", "#fef08a"] },
  { name: "teal", label: "Teal", c: ["#5eead4", "#67e8f9", "#7dd3fc"] },
  { name: "blush", label: "Blush", c: ["#fbcfe8", "#f5d0fe", "#fecdd3"] },
  { name: "indigo", label: "Indigo", c: ["#a5b4fc", "#818cf8", "#c4b5fd"] },
  { name: "citrus", label: "Citrus", c: ["#fde047", "#bef264", "#fdba74"] },
  { name: "ice", label: "Ice", c: ["#bae6fd", "#e0f2fe", "#cffafe"] },
  { name: "plum", label: "Plum", c: ["#d8b4fe", "#f0abfc", "#a78bfa"] },
  { name: "sand", label: "Sand", c: ["#fde68a", "#fed7aa", "#fef3c7"] },
  { name: "jade", label: "Jade", c: ["#34d399", "#2dd4bf", "#4ade80"] },
  { name: "flamingo", label: "Flamingo", c: ["#f9a8d4", "#fda4af", "#fbbf24"] },
  { name: "cobalt", label: "Cobalt", c: ["#60a5fa", "#818cf8", "#38bdf8"] },
  // extra palettes — brings total to 40 × 3 + 1 = 121
  { name: "neon", label: "Neon", c: ["#86efac", "#67e8f9", "#f9a8d4"] },
  { name: "volcano", label: "Volcano", c: ["#fde68a", "#fca5a5", "#fed7aa"] },
  { name: "galaxy", label: "Galaxy", c: ["#818cf8", "#c084fc", "#38bdf8"] },
  { name: "arctic", label: "Arctic", c: ["#e0f2fe", "#f0f9ff", "#cffafe"] },
  { name: "desert", label: "Desert", c: ["#fde68a", "#fcd34d", "#fed7aa"] },
  { name: "autumn", label: "Autumn", c: ["#fde68a", "#fca5a5", "#fed7aa"] },
  { name: "tropical", label: "Tropical", c: ["#34d399", "#60a5fa", "#fcd34d"] },
  { name: "cosmic", label: "Cosmic", c: ["#818cf8", "#c084fc", "#7dd3fc"] },
  { name: "nordic", label: "Nordic", c: ["#bfdbfe", "#ddd6fe", "#c7d2fe"] },
  { name: "candy", label: "Candy", c: ["#f9a8d4", "#a5b4fc", "#6ee7b7"] },
  { name: "earth", label: "Earth", c: ["#d6b896", "#a3c9a8", "#c4a882"] },
  { name: "vapor", label: "Vapor", c: ["#fce7f3", "#ede9fe", "#e0f2fe"] },
  { name: "fire", label: "Fire", c: ["#fca5a5", "#fdba74", "#fef08a"] },
  { name: "dusk", label: "Dusk", c: ["#c4b5fd", "#f9a8d4", "#fda4af"] },
  { name: "dawn", label: "Dawn", c: ["#fed7aa", "#fde68a", "#fce7f3"] },
  { name: "borealis", label: "Borealis", c: ["#4ade80", "#818cf8", "#06b6d4"] },
];

const STYLES = ["radial", "conic", "linear"] as const;
const STYLE_LABEL: Record<(typeof STYLES)[number], string> = {
  radial: "Glow",
  conic: "Swirl",
  linear: "Wash",
};

function gradient(style: (typeof STYLES)[number], c: [string, string, string]): string {
  const [a, b, d] = c;
  if (style === "radial")
    return `radial-gradient(50rem 40rem at 100% 0%, ${a}66 0%, transparent 55%), radial-gradient(50rem 50rem at 0% 100%, ${b}66 0%, transparent 55%), radial-gradient(40rem 40rem at 50% 50%, ${d}4d 0%, transparent 60%)`;
  if (style === "conic")
    return `conic-gradient(from 200deg at 50% 50%, ${a}40, ${b}40, ${d}40, ${a}40)`;
  return `linear-gradient(135deg, ${a}3d 0%, ${b}30 50%, ${d}3d 100%)`;
}

export const BACKGROUNDS: Bg[] = PALETTES.flatMap((p) =>
  STYLES.map((s) => ({
    id: `${p.name}-${s}`,
    label: `${p.label} ${STYLE_LABEL[s]}`,
    css: gradient(s, p.c),
  })),
);

// A clean "no gradient" option as the very first choice.
BACKGROUNDS.unshift({ id: "plain", label: "Plain", css: "none" });

export const BG_KEY = "df-bg";
export const BG_CSS_KEY = "df-bg-css";

export function applyBg(b: Bg) {
  const el = document.documentElement;
  el.style.setProperty("--bg-grad", b.css);
  el.setAttribute("data-bg", b.id);
  try {
    localStorage.setItem(BG_KEY, b.id);
    localStorage.setItem(BG_CSS_KEY, b.css);
  } catch {}
}
