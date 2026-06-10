export type Theme = { id: string; name: string; h: number; s: number };

// 50 real colour themes. Each generates a full 50–900 palette from a hue + saturation.
export const THEMES: Theme[] = [
  { id: "blue", name: "Classic Blue", h: 218, s: 80 },
  { id: "sky", name: "Sky", h: 200, s: 85 },
  { id: "azure", name: "Azure", h: 210, s: 90 },
  { id: "cyan", name: "Cyan", h: 190, s: 80 },
  { id: "teal", name: "Teal", h: 174, s: 65 },
  { id: "aqua", name: "Aqua", h: 182, s: 70 },
  { id: "emerald", name: "Emerald", h: 152, s: 60 },
  { id: "green", name: "Green", h: 142, s: 62 },
  { id: "forest", name: "Forest", h: 130, s: 45 },
  { id: "lime", name: "Lime", h: 95, s: 65 },
  { id: "olive", name: "Olive", h: 70, s: 45 },
  { id: "yellow", name: "Yellow", h: 48, s: 88 },
  { id: "gold", name: "Gold", h: 42, s: 80 },
  { id: "amber", name: "Amber", h: 38, s: 90 },
  { id: "orange", name: "Orange", h: 26, s: 90 },
  { id: "tangerine", name: "Tangerine", h: 18, s: 88 },
  { id: "coral", name: "Coral", h: 12, s: 80 },
  { id: "red", name: "Red", h: 2, s: 78 },
  { id: "crimson", name: "Crimson", h: 348, s: 75 },
  { id: "rose", name: "Rose", h: 340, s: 75 },
  { id: "pink", name: "Pink", h: 330, s: 78 },
  { id: "magenta", name: "Magenta", h: 320, s: 75 },
  { id: "fuchsia", name: "Fuchsia", h: 300, s: 72 },
  { id: "orchid", name: "Orchid", h: 288, s: 60 },
  { id: "purple", name: "Purple", h: 272, s: 65 },
  { id: "violet", name: "Violet", h: 258, s: 68 },
  { id: "indigo", name: "Indigo", h: 243, s: 65 },
  { id: "royal", name: "Royal Blue", h: 228, s: 72 },
  { id: "denim", name: "Denim", h: 214, s: 55 },
  { id: "steel", name: "Steel", h: 205, s: 30 },
  { id: "slate", name: "Slate", h: 215, s: 18 },
  { id: "gray", name: "Graphite", h: 220, s: 8 },
  { id: "zinc", name: "Zinc", h: 240, s: 5 },
  { id: "stone", name: "Stone", h: 30, s: 8 },
  { id: "sand", name: "Sand", h: 40, s: 30 },
  { id: "mocha", name: "Mocha", h: 25, s: 35 },
  { id: "coffee", name: "Coffee", h: 20, s: 40 },
  { id: "wine", name: "Wine", h: 345, s: 45 },
  { id: "plum", name: "Plum", h: 310, s: 40 },
  { id: "lavender", name: "Lavender", h: 265, s: 45 },
  { id: "periwinkle", name: "Periwinkle", h: 235, s: 55 },
  { id: "mint", name: "Mint", h: 160, s: 50 },
  { id: "sage", name: "Sage", h: 110, s: 25 },
  { id: "ocean", name: "Ocean", h: 196, s: 70 },
  { id: "sunset", name: "Sunset", h: 14, s: 85 },
  { id: "flamingo", name: "Flamingo", h: 350, s: 70 },
  { id: "turquoise", name: "Turquoise", h: 178, s: 72 },
  { id: "jade", name: "Jade", h: 148, s: 55 },
  { id: "midnight", name: "Midnight", h: 232, s: 45 },
  { id: "rosegold", name: "Rose Gold", h: 8, s: 55 },
];

// Lightness per shade, roughly matching a Tailwind ramp.
const LIGHT: Record<number, number> = { 50: 97, 100: 93, 200: 86, 300: 77, 400: 65, 500: 55, 600: 47, 700: 39, 800: 32, 900: 27 };

export function paletteCss(t: Theme): string {
  return Object.entries(LIGHT)
    .map(([shade, l]) => {
      const s = +shade <= 100 ? Math.min(t.s, 60) : t.s; // lighten saturation for tints
      return `--brand-${shade}:hsl(${t.h} ${s}% ${l}%);`;
    })
    .join("");
}

export const THEME_KEY = "df-color-theme";
export const THEME_CSS_KEY = "df-brand-css";

export function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const css = paletteCss(t);
  document.documentElement.style.cssText += css;
  try {
    localStorage.setItem(THEME_KEY, t.id);
    localStorage.setItem(THEME_CSS_KEY, css);
  } catch {}
}
