// Generates square maskable PWA icons (192 & 512) from an inline SVG.
// Run: node scripts/gen-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), "public", "icons");
mkdirSync(OUT, { recursive: true });

// Full-bleed gradient background (maskable-safe) + centered white lightning bolt.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3478f6"/>
      <stop offset="100%" stop-color="#1a45b4"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <path d="M296 56 154 296h104l-42 160 184-248H288z" fill="#fff"/>
</svg>`;

const buf = Buffer.from(svg);

for (const size of [192, 512]) {
  await sharp(buf, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(join(OUT, `icon-${size}.png`));
  console.log(`wrote icon-${size}.png`);
}
