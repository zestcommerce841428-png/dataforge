export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readMins: number;
  content: string; // markdown
};

export const POSTS: Post[] = [
  {
    slug: "compress-image-to-target-size",
    title: "How to Compress an Image to an Exact File Size (KB)",
    description: "Step-by-step guide to shrinking a photo to a target size for PAN, passport and form uploads — without losing too much quality.",
    date: "2026-06-01",
    readMins: 3,
    content: `Many government and job portals reject photos that are too large. Here's how to hit an **exact KB target** in seconds.

## The quick way

1. Open the [Image Resizer & Compressor](/image-tools).
2. Upload your photo.
3. In **Compress to target size**, type your limit (e.g. \`50\` KB) and click **Compress**.
4. Download — the tool binary-searches JPEG quality to land just under your target.

## Tips for ID photos

- Use the **PAN photo 213×213** or **passport** preset first, then compress.
- JPEG compresses far smaller than PNG for photos — switch format if needed.
- If quality drops too much, raise the target slightly (e.g. 45 → 60 KB).

Everything runs in your browser, so your photo is never uploaded.`,
  },
  {
    slug: "json-yaml-xml-csv-differences",
    title: "JSON vs YAML vs XML vs CSV: Which Data Format Should You Use?",
    description: "A plain-English comparison of the four most common data formats — and when to pick each one.",
    date: "2026-06-02",
    readMins: 4,
    content: `Four formats dominate data exchange. Here's the short version.

## JSON
The default for APIs and web apps. Compact, strict, great tooling. Not great for comments or huge tabular data.

## YAML
JSON's friendlier cousin — used for **config files** (CI, Docker, Kubernetes). Human-readable, supports comments, but indentation-sensitive.

## XML
Verbose but powerful — **documents, SOAP, RSS, office files**. Supports attributes and namespaces.

## CSV
Unbeatable for **tabular data** and spreadsheets. Tiny and universal, but no nesting and no types.

## Convert between them instantly

Use the [Data Format Converter](/format-converter) to turn any of these into any other — JSON ⇄ YAML ⇄ XML ⇄ CSV — right in your browser.`,
  },
  {
    slug: "text-to-handwriting-guide",
    title: "Turn Typed Text into Realistic Handwriting",
    description: "Generate handwritten-looking assignments and notes with custom fonts, inks and paper — exported as PNG or PDF.",
    date: "2026-06-03",
    readMins: 3,
    content: `Need something to look handwritten? Our [Text to Handwriting](/handwriting) tool makes it effortless.

## What you can customise

- **30 handwriting fonts** — from neat to messy
- **Any ink colour** plus natural ink-variation and **ink-bleed** for realism
- **8 paper styles** plus **custom paper & line colours** (effectively unlimited looks)
- **Realism jitter** so no two letters are identical
- **Unlimited pages** — long text auto-flows across pages

## Export

Download a single **PNG**, a **ZIP** of all pages, or a multi-page **PDF**. Pick A4, Letter, A5 or Legal.

> It all runs locally — your text never leaves your device.`,
  },
  {
    slug: "best-free-online-developer-tools",
    title: "400+ Free Online Tools That Run Entirely in Your Browser",
    description: "A tour of DataForge — generators, converters, image & PDF tools, a spreadsheet, and more, all private and free.",
    date: "2026-06-04",
    readMins: 4,
    content: `DataForge bundles **400+ tools** that work 100% in your browser — no sign-up, no uploads.

## Highlights

- **[Developer tools](/dev-tools):** JSON/CSV/XML, regex, hashing, 100+ unit converters, finance, health and productivity utilities.
- **[Image tools](/image-tools):** resize, crop, compress to KB, convert, DPI presets.
- **[PDF tools](/pdf-tools):** merge, split, compress, rotate, images↔PDF.
- **[Spreadsheet](/workbook) & [Formula manager](/formula-manager):** an Excel-style grid with 360+ functions.
- **[Code formatter](/code-formatter):** beautify/minify JSON, CSS, SQL, HTML, JS.

## Why in-browser?

Privacy and speed. Your data is processed on your device, so nothing is sent to a server — and results are instant.

Have a tool request? [Contact us](/contact).`,
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
