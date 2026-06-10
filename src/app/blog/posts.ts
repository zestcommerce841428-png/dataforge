import { CONV, PAIRS, convert } from "@/lib/conversions";

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readMins: number;
  category: string;
  content: string; // markdown
};

const fmt = (n: number) => {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1e9 || (Math.abs(n) < 1e-4 && n !== 0)) return n.toExponential(4);
  return (+n.toFixed(6)).toLocaleString("en-US");
};

// Stagger publish dates so the feed looks natural.
const dateFor = (i: number) => {
  const d = new Date("2026-06-05T00:00:00Z");
  d.setDate(d.getDate() - i);
  return d.toISOString().slice(0, 10);
};

/* ---------- Hand-written guides ---------- */
const MANUAL: Omit<Post, "date">[] = [
  {
    slug: "compress-image-to-target-size", category: "Image", readMins: 3,
    title: "How to Compress an Image to an Exact File Size (KB)",
    description: "Shrink a photo to a target size for PAN, passport and form uploads without losing too much quality.",
    content: `Many portals reject photos that are too large. Here's how to hit an **exact KB target**.

## The quick way
1. Open the [Image Resizer & Compressor](/image-tools).
2. Upload your photo.
3. In **Compress to target size**, type your limit (e.g. \`50\` KB) and click **Compress**.
4. Download — the tool binary-searches JPEG quality to land just under your target.

## Tips for ID photos
- Use the **PAN photo 213×213** or **passport** preset first, then compress.
- JPEG compresses far smaller than PNG for photos.
- If quality drops too much, raise the target slightly.

Everything runs in your browser, so your photo is never uploaded.`,
  },
  {
    slug: "json-yaml-xml-csv-differences", category: "Data", readMins: 4,
    title: "JSON vs YAML vs XML vs CSV: Which Data Format Should You Use?",
    description: "A plain-English comparison of the four most common data formats — and when to pick each one.",
    content: `Four formats dominate data exchange.

## JSON
The default for APIs and web apps. Compact, strict, great tooling.

## YAML
JSON's friendlier cousin — used for **config files** (CI, Docker, Kubernetes). Human-readable, supports comments.

## XML
Verbose but powerful — **documents, SOAP, RSS, office files**.

## CSV
Unbeatable for **tabular data** and spreadsheets.

Use the [Data Format Converter](/format-converter) to turn any of these into any other.`,
  },
  {
    slug: "text-to-handwriting-guide", category: "Productivity", readMins: 3,
    title: "Turn Typed Text into Realistic Handwriting",
    description: "Generate handwritten-looking assignments and notes with custom fonts, inks and paper — exported as PNG or PDF.",
    content: `Need something to look handwritten? The [Text to Handwriting](/handwriting) tool makes it effortless.

## What you can customise
- **30 handwriting fonts**
- **Any ink colour** plus ink-variation and **ink-bleed**
- **8 paper styles** plus **custom paper & line colours**
- **Realism jitter** and **unlimited pages**

## Export
Download a single **PNG**, a **ZIP** of all pages, or a multi-page **PDF**.`,
  },
  {
    slug: "best-free-online-developer-tools", category: "General", readMins: 4,
    title: "400+ Free Online Tools That Run Entirely in Your Browser",
    description: "A tour of DataForge — generators, converters, image & PDF tools, a spreadsheet, and more, all private and free.",
    content: `DataForge bundles **400+ tools** that work 100% in your browser — no sign-up, no uploads.

## Highlights
- **[Developer tools](/dev-tools):** JSON/CSV/XML, regex, hashing, 100+ converters.
- **[Image tools](/image-tools):** resize, crop, compress to KB, convert.
- **[PDF tools](/pdf-tools):** merge, split, compress, rotate, images↔PDF.
- **[Spreadsheet](/workbook) & [Formulas](/formula-manager):** 360+ functions.
- **[Code formatter](/code-formatter):** beautify/minify JSON, CSS, SQL, HTML, JS.

Have a request? [Contact us](/contact).`,
  },
  {
    slug: "what-is-utm-tracking", category: "Marketing", readMins: 3,
    title: "What Are UTM Parameters and How to Use Them",
    description: "Understand UTM tracking links and build them in seconds to measure your marketing campaigns.",
    content: `UTM parameters are tags added to a URL so analytics tools know **where traffic came from**.

## The five parameters
- \`utm_source\` — where (e.g. newsletter, google)
- \`utm_medium\` — type (email, cpc, social)
- \`utm_campaign\` — the campaign name
- \`utm_term\` and \`utm_content\` — optional details

## Build one instantly
Use the **UTM Link Builder** in [Developer Tools](/dev-tools) — fill the fields and copy your tracked URL.`,
  },
  {
    slug: "merge-and-split-pdf-online", category: "PDF", readMins: 3,
    title: "How to Merge and Split PDF Files Online (Free, Private)",
    description: "Combine multiple PDFs or extract pages without uploading your documents anywhere.",
    content: `Need to combine or split PDFs? Do it locally with [PDF Tools](/pdf-tools).

## Merge
1. Pick **Merge PDFs**, select 2+ files, run. Pages are combined in order.

## Split / extract
1. Pick **Extract pages**, select one PDF, enter a range like \`1-3, 5\`.

## More
You can also **compress**, **rotate**, **add page numbers**, **watermark**, and convert **images ↔ PDF** — all in your browser.`,
  },
];

/* ---------- Generated converter "X to Y" posts ---------- */
function pairPost(p: typeof PAIRS[number], i: number): Post {
  const cat = CONV.find((c) => c.id === p.cat)!;
  const rows = [1, 2, 5, 10, 50, 100].map((v) => `| ${v} | ${fmt(convert(cat, v, p.from, p.to))} |`).join("\n");
  const one = fmt(convert(cat, 1, p.from, p.to));
  return {
    slug: `convert-${p.id}`,
    title: `${p.name}: Convert ${p.from} to ${p.to}`,
    description: `Convert ${p.from} to ${p.to} instantly with a free online tool, formula and conversion table. 1 ${p.from} = ${one} ${p.to}.`,
    date: dateFor(6 + i),
    readMins: 2,
    category: "Converters",
    content: `Quickly convert **${p.from} to ${p.to}** with our free [unit converter](/dev-tools?tool=conv-${p.id}).

## Formula
**1 ${p.from} = ${one} ${p.to}**

To convert, multiply your ${p.from} value by ${one}.

## Conversion table
| ${p.from} | ${p.to} |
|---|---|
${rows}

## How to convert online
1. Open the [${cat.label} Converter](/dev-tools).
2. Enter your value and choose **${p.from} → ${p.to}**.
3. The result updates instantly — copy it with one click.

All conversions run locally in your browser. See also the full [${cat.label}](/dev-tools) converter for ${Object.keys(cat.units).length} units.`,
  };
}

/* ---------- Generated category converter guides ---------- */
function catPost(c: typeof CONV[number], i: number): Post {
  const units = Object.keys(c.units);
  return {
    slug: `${c.id}-unit-converter`,
    title: `${c.label} Converter — Convert ${units.length} Units Online`,
    description: `Free ${c.label.toLowerCase()} converter supporting ${units.join(", ")}. Instant, accurate and private.`,
    date: dateFor(6 + PAIRS.length + i),
    readMins: 2,
    category: "Converters",
    content: `Convert between all common **${c.label.toLowerCase()}** units with our free [${c.label} Converter](/dev-tools).

## Supported units
${units.map((u) => `- ${u}`).join("\n")}

## How to use
1. Open [Developer Tools](/dev-tools) and search for &ldquo;${c.label}&rdquo;.
2. Enter a value, pick the **from** and **to** units.
3. Results appear instantly with a quick reference for other units.

Everything runs in your browser — nothing is uploaded.`,
  };
}

/* ---------- Generated tool how-to posts ---------- */
const TOOL_GUIDES: { slug: string; title: string; desc: string; href: string; cat: string; body: string }[] = [
  { slug: "generate-strong-password", title: "How to Generate a Strong, Secure Password", desc: "Create uncrackable passwords with adjustable length and character sets.", href: "/dev-tools", cat: "Security", body: "Use the **Password Generator** — pick length (16+ recommended), enable symbols, and copy. It uses the Web Crypto API for true randomness." },
  { slug: "format-json-online", title: "How to Format and Validate JSON Online", desc: "Beautify, minify and validate JSON instantly.", href: "/code-formatter", cat: "Developer", body: "Open the [Code Formatter](/code-formatter), pick JSON, paste your data and click **Beautify** or **Minify**. Invalid JSON shows the exact error." },
  { slug: "test-regular-expressions", title: "How to Test Regular Expressions", desc: "Debug regex patterns with live match highlighting.", href: "/dev-tools", cat: "Developer", body: "Use the **Regex Tester** in Developer Tools — type a pattern and test string to see matches highlighted live." },
  { slug: "convert-csv-to-json", title: "How to Convert CSV to JSON (and Back)", desc: "Turn spreadsheets into JSON arrays and vice-versa.", href: "/format-converter", cat: "Data", body: "Use the [Format Converter](/format-converter): choose CSV → JSON (or JSON → CSV), paste, and copy the result." },
  { slug: "calculate-emi", title: "How to Calculate Loan EMI", desc: "Work out monthly payments, total interest and payable amount.", href: "/dev-tools", cat: "Finance", body: "Use the **EMI Calculator** — enter loan amount, interest rate and tenure to see your monthly EMI and total interest." },
  { slug: "calculate-bmi", title: "How to Calculate Your BMI", desc: "Find your Body Mass Index and category.", href: "/dev-tools", cat: "Health", body: "Use the **BMI Calculator** — enter weight and height to get your BMI and whether you're in the healthy range." },
  { slug: "typing-speed-test", title: "How to Test and Improve Your Typing Speed", desc: "Measure WPM and accuracy and practise daily.", href: "/typing", cat: "Productivity", body: "Open [Typing Practice](/typing), choose a timed or word test, and type — your WPM and accuracy update live." },
  { slug: "generate-qr-code", title: "How to Generate a QR Code", desc: "Create QR codes for links, text and more.", href: "/#tools", cat: "General", body: "Use the **QR Code** generator on the homepage — enter your text or URL and download the QR image." },
  { slug: "pdf-to-jpg", title: "How to Convert PDF Pages to Images (JPG/PNG)", desc: "Export each PDF page as an image.", href: "/pdf-tools", cat: "PDF", body: "In [PDF Tools](/pdf-tools), pick **PDF → Image**, choose JPG or PNG, and download single pages or a ZIP." },
  { slug: "compress-pdf", title: "How to Compress a PDF File", desc: "Reduce PDF size for email and uploads.", href: "/pdf-tools", cat: "PDF", body: "Use **Compress PDF** in [PDF Tools](/pdf-tools) — it re-renders pages at your chosen quality to shrink the file." },
  { slug: "remove-image-background-resize", title: "How to Resize an Image for Social Media", desc: "Hit exact Instagram, YouTube and Facebook dimensions.", href: "/image-tools", cat: "Image", body: "Open [Image Tools](/image-tools) and use the social-media presets (Instagram, YouTube, Facebook) then download." },
  { slug: "hash-generator-guide", title: "How to Generate MD5, SHA-256 Hashes", desc: "Hash text and verify integrity online.", href: "/dev-tools", cat: "Security", body: "Use the **Hash Generator** in Developer Tools — paste text to get MD5, SHA-1, SHA-256, SHA-512 instantly." },
  { slug: "base64-encode-decode", title: "How to Base64 Encode and Decode", desc: "Convert text and files to Base64 and back.", href: "/dev-tools", cat: "Developer", body: "Use the **Base64** tool in Developer Tools to encode or decode strings and data URIs." },
  { slug: "color-picker-converter", title: "How to Convert HEX, RGB and HSL Colors", desc: "Switch between color formats and build palettes.", href: "/dev-tools", cat: "Design", body: "Use the **Color Converter** in Developer Tools to convert HEX ⇄ RGB ⇄ HSL and generate shades." },
  { slug: "word-character-counter", title: "How to Count Words and Characters", desc: "Stay within Tweet, SMS and SEO limits.", href: "/dev-tools", cat: "Text", body: "Use the **Character Limit Counter** to track length against Tweet, SMS and meta-description limits." },
  { slug: "unix-timestamp-converter", title: "How to Convert Unix Timestamps", desc: "Translate epoch time to human dates and back.", href: "/dev-tools", cat: "Developer", body: "Use the **Unix Timestamp Converter** in Developer Tools to convert epoch seconds to readable dates." },
  { slug: "calculate-age", title: "How to Calculate Your Exact Age", desc: "Find your age in years, days and seconds.", href: "/dev-tools", cat: "Date & Time", body: "Use the **Age / Days Alive** calculators to see your exact age in multiple units." },
  { slug: "create-email-signature", title: "How to Create an HTML Email Signature", desc: "Build a professional signature in minutes.", href: "/dev-tools", cat: "Marketing", body: "Use the **Email Signature Generator** — fill your details and copy the HTML into your email client." },
  { slug: "pomodoro-technique", title: "Using the Pomodoro Technique to Focus", desc: "Work in 25-minute sprints with a built-in timer.", href: "/dev-tools", cat: "Productivity", body: "Use the **Pomodoro Timer** in Developer Tools — 25 minutes focus, 5 minutes break, repeat." },
  { slug: "gst-calculator-guide", title: "How to Calculate GST (India)", desc: "Add or remove GST with CGST/SGST split.", href: "/dev-tools", cat: "Finance", body: "Use the **GST Calculator** — enter an amount and rate to add or remove GST and see the CGST/SGST breakdown." },
  { slug: "jwt-decoder-guide", title: "How to Decode a JWT Token", desc: "Inspect JWT header, payload and expiry.", href: "/dev-tools", cat: "Security", body: "Use the **JWT Decoder** to view a token's header and payload and check whether it has expired." },
  { slug: "uuid-generator-guide", title: "How to Generate UUIDs", desc: "Create v4 and v7 UUIDs in bulk.", href: "/dev-tools", cat: "Developer", body: "Use the **UUID Batch Generator** to create up to 100 UUIDs at once in v4, v7 or short format." },
  { slug: "lorem-ipsum-guide", title: "How to Generate Lorem Ipsum Placeholder Text", desc: "Fill mockups with words, sentences or paragraphs.", href: "/dev-tools", cat: "Text", body: "Use the **Lorem Ipsum Generator** to produce placeholder text by word, sentence or paragraph count." },
  { slug: "markdown-to-html", title: "How to Convert Markdown to HTML", desc: "Preview and export Markdown as HTML.", href: "/dev-tools", cat: "Developer", body: "Use the **Markdown Previewer** to render Markdown live and copy the resulting HTML." },
  { slug: "sip-calculator-guide", title: "How to Calculate SIP Returns", desc: "Project the future value of monthly investments.", href: "/dev-tools", cat: "Finance", body: "Use the **SIP Calculator** — enter monthly amount, expected return and years to see projected value and gains." },
  { slug: "calorie-bmr-guide", title: "How to Calculate Daily Calorie Needs (BMR/TDEE)", desc: "Find maintenance, cutting and bulking calories.", href: "/dev-tools", cat: "Health", body: "Use the **BMR & Calorie Calculator** — enter age, weight, height and activity to get your daily calorie targets." },
  { slug: "sleep-cycle-guide", title: "Best Time to Sleep and Wake Up", desc: "Plan bedtimes around 90-minute sleep cycles.", href: "/dev-tools", cat: "Health", body: "Use the **Sleep Calculator** — enter your wake time to get bedtimes aligned to full sleep cycles." },
  { slug: "format-sql-guide", title: "How to Format and Beautify SQL Queries", desc: "Make messy SQL readable instantly.", href: "/code-formatter", cat: "Developer", body: "Open the [Code Formatter](/code-formatter), choose SQL, paste your query and click **Beautify**." },
];

function guidePost(g: typeof TOOL_GUIDES[number], i: number): Post {
  return {
    slug: g.slug, title: g.title, description: g.desc,
    date: dateFor(6 + PAIRS.length + CONV.length + i), readMins: 2, category: g.cat,
    content: `${g.body}\n\n## Open the tool\n[Launch it here →](${g.href})\n\nAll DataForge tools run locally in your browser — fast, free and private.`,
  };
}

export const POSTS: Post[] = [
  ...MANUAL.map((m, i) => ({ ...m, date: dateFor(i) })),
  ...PAIRS.map(pairPost),
  ...CONV.map(catPost),
  ...TOOL_GUIDES.map(guidePost),
];

export const CATEGORIES = [...new Set(POSTS.map((p) => p.category))].sort();
export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
