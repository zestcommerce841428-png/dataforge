"use client";

import { useCallback, useRef, useState } from "react";

/* ─── Format definitions ──────────────────────────────────────────────────── */

type FormatGroup = "image" | "data" | "text";

interface ConvFormat {
  ext: string;
  label: string;
  mime: string;
  group: FormatGroup;
}

const FORMATS: ConvFormat[] = [
  // Image
  { ext: "png",  label: "PNG",  mime: "image/png",  group: "image" },
  { ext: "jpg",  label: "JPEG", mime: "image/jpeg", group: "image" },
  { ext: "webp", label: "WebP", mime: "image/webp", group: "image" },
  { ext: "bmp",  label: "BMP",  mime: "image/bmp",  group: "image" },
  { ext: "gif",  label: "GIF (static)", mime: "image/gif", group: "image" },
  { ext: "ico",  label: "ICO (32×32)", mime: "image/x-icon", group: "image" },
  { ext: "avif", label: "AVIF", mime: "image/avif", group: "image" },
  // Data
  { ext: "json", label: "JSON", mime: "application/json", group: "data" },
  { ext: "csv",  label: "CSV",  mime: "text/csv", group: "data" },
  { ext: "tsv",  label: "TSV",  mime: "text/tab-separated-values", group: "data" },
  { ext: "xml",  label: "XML",  mime: "application/xml", group: "data" },
  { ext: "yaml", label: "YAML", mime: "application/x-yaml", group: "data" },
  { ext: "toml", label: "TOML", mime: "application/toml", group: "data" },
  { ext: "ini",  label: "INI/Properties", mime: "text/plain", group: "data" },
  // Text / Docs
  { ext: "md",   label: "Markdown", mime: "text/markdown", group: "text" },
  { ext: "html", label: "HTML",     mime: "text/html", group: "text" },
  { ext: "txt",  label: "Plain Text", mime: "text/plain", group: "text" },
  { ext: "docx", label: "Word (DOCX)", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", group: "text" },
  { ext: "xlsx", label: "Excel (XLSX)", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", group: "data" },
  { ext: "pdf",  label: "PDF (text extract)", mime: "application/pdf", group: "text" },
  { ext: "svg",  label: "SVG", mime: "image/svg+xml", group: "image" },
];

const ACCEPT =
  "image/png,image/jpeg,image/webp,image/bmp,image/gif,image/tiff,image/avif,image/svg+xml," +
  "application/json,text/csv,text/tab-separated-values,application/xml,text/xml," +
  "application/x-yaml,text/yaml,text/markdown,text/html,text/plain,application/toml," +
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf," +
  ".png,.jpg,.jpeg,.webp,.bmp,.gif,.tif,.tiff,.avif,.svg,.json,.csv,.tsv,.xml,.yaml,.yml,.md,.html,.htm,.txt,.toml,.ini,.properties,.docx,.xlsx,.pdf";

/* ─── Conversion logic ────────────────────────────────────────────────────── */

function detectFormat(file: File): ConvFormat | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const aliases: Record<string,string> = { yml:"yaml", htm:"html", tif:"png", tiff:"png", properties:"ini", jpeg:"jpg" };
  const resolvedExt = aliases[ext] || ext;
  const byExt = FORMATS.find((f) => f.ext === resolvedExt);
  if (byExt) return byExt;
  return FORMATS.find((f) => f.mime === file.type) ?? null;
}

function compatibleOutputs(input: ConvFormat): ConvFormat[] {
  if (input.group === "image") {
    return FORMATS.filter((f) => f.group === "image" && f.ext !== input.ext);
  }
  if (input.group === "data") {
    return FORMATS.filter((f) => f.group === "data" && f.ext !== input.ext);
  }
  if (input.group === "text") {
    return FORMATS.filter((f) => f.group === "text" && f.ext !== input.ext);
  }
  return [];
}

/* Image → Image via Canvas */
async function convertImage(file: File, outFmt: ConvFormat, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");

  if (outFmt.ext === "ico") {
    canvas.width = 32;
    canvas.height = 32;
  } else {
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
  }

  const ctx = canvas.getContext("2d")!;

  // White background for JPEG/BMP (no alpha)
  if (outFmt.ext === "jpg" || outFmt.ext === "bmp") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const mime = outFmt.ext === "ico" ? "image/png" : outFmt.mime;
  const q = outFmt.ext === "jpg" || outFmt.ext === "webp" ? quality / 100 : undefined;

  return new Promise<Blob>((res, rej) => {
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("Canvas export failed"))),
      mime,
      q
    );
  });
}

/* CSV / TSV parser */
function parseCsv(text: string, sep: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cols: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === sep && !inQ) {
        cols.push(cur); cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur);
    rows.push(cols);
  }
  return rows;
}

function rowsToJson(rows: string[][]): string {
  if (rows.length === 0) return "[]";
  const [headers, ...data] = rows;
  return JSON.stringify(
    data.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""]))),
    null, 2
  );
}

function jsonToRows(json: unknown[]): string[][] {
  if (!Array.isArray(json) || json.length === 0) return [];
  const keys = Object.keys(json[0] as object);
  return [keys, ...json.map((row) => keys.map((k) => String((row as Record<string,unknown>)[k] ?? "")))];
}

function rowsToCsv(rows: string[][], sep: string): string {
  return rows.map((r) =>
    r.map((c) => (c.includes(sep) || c.includes('"') || c.includes("\n") ? `"${c.replace(/"/g, '""')}"` : c)).join(sep)
  ).join("\n");
}

function jsonToXml(json: unknown, rootTag = "root", itemTag = "item"): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const toXml = (val: unknown, tag: string): string => {
    if (Array.isArray(val))
      return val.map((v) => toXml(v, itemTag)).join("\n");
    if (val !== null && typeof val === "object")
      return `<${tag}>\n${Object.entries(val as Record<string,unknown>)
        .map(([k, v]) => toXml(v, k)).join("\n")}\n</${tag}>`;
    return `<${tag}>${esc(String(val ?? ""))}</${tag}>`;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(json, rootTag)}`;
}

function basicXmlToJson(xml: string): unknown {
  // Use browser DOMParser — no deps needed
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const parseErr = doc.querySelector("parsererror");
  if (parseErr) throw new Error("Invalid XML: " + parseErr.textContent?.slice(0, 100));
  const nodeToObj = (node: Element): unknown => {
    const children = Array.from(node.children);
    if (children.length === 0) return node.textContent ?? "";
    const result: Record<string, unknown> = {};
    for (const child of children) {
      const key = child.tagName;
      const val = nodeToObj(child);
      if (key in result) {
        if (!Array.isArray(result[key])) result[key] = [result[key]];
        (result[key] as unknown[]).push(val);
      } else {
        result[key] = val;
      }
    }
    return result;
  };
  return nodeToObj(doc.documentElement);
}

function jsonToYaml(val: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (val === null) return "null";
  if (typeof val === "boolean" || typeof val === "number") return String(val);
  if (typeof val === "string") {
    if (/[\n:"{}[\],&*?|<>=!%@`#]/.test(val) || val === "" || /^\s|\s$/.test(val))
      return `"${val.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
    return val;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";
    return val.map((item) => `\n${pad}- ${jsonToYaml(item, indent + 1)}`).join("");
  }
  if (typeof val === "object") {
    const entries = Object.entries(val as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries.map(([k, v]) => {
      const rendered = jsonToYaml(v, indent + 1);
      const inline = typeof v !== "object" || v === null;
      return `\n${pad}${k}:${inline ? " " + rendered : rendered}`;
    }).join("");
  }
  return String(val);
}

function basicYamlToJson(yaml: string): unknown {
  // Simple key: value and list parser (covers most real YAML generated by this app)
  const lines = yaml.split(/\r?\n/);
  const root: Record<string, unknown> = {};
  const stack: { obj: Record<string,unknown>|unknown[]; indent: number; key?: string }[] = [
    { obj: root, indent: -1 },
  ];
  for (const rawLine of lines) {
    if (/^\s*#/.test(rawLine) || rawLine.trim() === "") continue;
    const indent = rawLine.match(/^(\s*)/)![1].length;
    const trimmed = rawLine.trimStart();
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1];
    if (trimmed.startsWith("- ")) {
      const val = trimmed.slice(2).trim();
      const arr = parent.key && Array.isArray((parent.obj as Record<string,unknown>)[parent.key])
        ? (parent.obj as Record<string,unknown>)[parent.key] as unknown[]
        : [];
      if (parent.key) (parent.obj as Record<string,unknown>)[parent.key] = arr;
      arr.push(val);
    } else {
      const m = trimmed.match(/^([^:]+):\s*(.*)$/);
      if (!m) continue;
      const [, key, valRaw] = m;
      const val = valRaw.trim();
      const parsed: unknown = val === "" ? {} : val === "null" ? null : val === "true" ? true : val === "false" ? false : isNaN(Number(val)) ? val.replace(/^"(.*)"$/, "$1") : Number(val);
      (parent.obj as Record<string,unknown>)[key.trim()] = parsed;
      if (val === "") {
        stack.push({ obj: parent.obj as Record<string,unknown>, indent, key: key.trim() });
      }
    }
  }
  return root;
}

/* Markdown → HTML (no external dep) */
function mdToHtml(md: string): string {
  let html = md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Fenced code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="language-${lang}">${code.trimEnd()}</code></pre>`)
    // Headings
    .replace(/^######\s+(.+)$/gm, "<h6>$1</h6>")
    .replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>")
    .replace(/^####\s+(.+)$/gm, "<h4>$1</h4>")
    .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#\s+(.+)$/gm, "<h1>$1</h1>")
    // Bold / italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Strikethrough
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    // Links and images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // HR
    .replace(/^---+$/gm, "<hr>")
    // Blockquotes
    .replace(/^>\s?(.+)$/gm, "<blockquote>$1</blockquote>")
    // Unordered list
    .replace(/^[\-\*]\s+(.+)$/gm, "<li>$1</li>")
    // Ordered list
    .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>")
    // Paragraphs (lines not already wrapped)
    .replace(/^(?!<[a-z]).+$/gm, (line) =>
      line.trim() ? `<p>${line}</p>` : "")
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>[\s\S]+?<\/li>)/g, (m) => `<ul>${m}</ul>`);
  return `<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"></head>\n<body>\n${html}\n</body>\n</html>`;
}

function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.innerText ?? doc.body.textContent ?? "";
}

/* ─── Main conversion dispatcher ──────────────────────────────────────────── */

async function convert(
  file: File,
  inFmt: ConvFormat,
  outFmt: ConvFormat,
  quality: number
): Promise<{ blob: Blob; ext: string }> {
  // Image → Image
  if (inFmt.group === "image" && outFmt.group === "image") {
    const blob = await convertImage(file, outFmt, quality);
    const ext = outFmt.ext === "ico" ? "png" : outFmt.ext; // ICO via PNG canvas
    return { blob, ext };
  }

  const text = await file.text();

  // JSON → *
  if (inFmt.ext === "json") {
    const parsed = JSON.parse(text);
    if (outFmt.ext === "csv") {
      const rows = jsonToRows(parsed);
      return { blob: new Blob([rowsToCsv(rows, ",")], { type: outFmt.mime }), ext: "csv" };
    }
    if (outFmt.ext === "tsv") {
      const rows = jsonToRows(parsed);
      return { blob: new Blob([rowsToCsv(rows, "\t")], { type: outFmt.mime }), ext: "tsv" };
    }
    if (outFmt.ext === "xml") {
      return { blob: new Blob([jsonToXml(parsed)], { type: outFmt.mime }), ext: "xml" };
    }
    if (outFmt.ext === "yaml") {
      return { blob: new Blob([jsonToYaml(parsed).trimStart()], { type: outFmt.mime }), ext: "yaml" };
    }
    if (outFmt.ext === "txt") {
      return { blob: new Blob([JSON.stringify(parsed, null, 2)], { type: "text/plain" }), ext: "txt" };
    }
  }

  // CSV / TSV → *
  if (inFmt.ext === "csv" || inFmt.ext === "tsv") {
    const sep = inFmt.ext === "tsv" ? "\t" : ",";
    const rows = parseCsv(text, sep);
    if (outFmt.ext === "json") {
      return { blob: new Blob([rowsToJson(rows)], { type: outFmt.mime }), ext: "json" };
    }
    if (outFmt.ext === "tsv" || outFmt.ext === "csv") {
      const outSep = outFmt.ext === "tsv" ? "\t" : ",";
      return { blob: new Blob([rowsToCsv(rows, outSep)], { type: outFmt.mime }), ext: outFmt.ext };
    }
    if (outFmt.ext === "xml") {
      const json = JSON.parse(rowsToJson(rows));
      return { blob: new Blob([jsonToXml(json)], { type: outFmt.mime }), ext: "xml" };
    }
    if (outFmt.ext === "yaml") {
      const json = JSON.parse(rowsToJson(rows));
      return { blob: new Blob([jsonToYaml(json).trimStart()], { type: outFmt.mime }), ext: "yaml" };
    }
  }

  // XML → *
  if (inFmt.ext === "xml") {
    const obj = basicXmlToJson(text);
    if (outFmt.ext === "json") {
      return { blob: new Blob([JSON.stringify(obj, null, 2)], { type: outFmt.mime }), ext: "json" };
    }
    if (outFmt.ext === "yaml") {
      return { blob: new Blob([jsonToYaml(obj).trimStart()], { type: outFmt.mime }), ext: "yaml" };
    }
    if (outFmt.ext === "csv" || outFmt.ext === "tsv") {
      const sep = outFmt.ext === "tsv" ? "\t" : ",";
      const arr = Array.isArray(obj) ? obj : [obj];
      const rows = jsonToRows(arr);
      return { blob: new Blob([rowsToCsv(rows, sep)], { type: outFmt.mime }), ext: outFmt.ext };
    }
    if (outFmt.ext === "txt") {
      return { blob: new Blob([JSON.stringify(obj, null, 2)], { type: "text/plain" }), ext: "txt" };
    }
  }

  // YAML → *
  if (inFmt.ext === "yaml") {
    const obj = basicYamlToJson(text);
    if (outFmt.ext === "json") {
      return { blob: new Blob([JSON.stringify(obj, null, 2)], { type: outFmt.mime }), ext: "json" };
    }
    if (outFmt.ext === "xml") {
      return { blob: new Blob([jsonToXml(obj)], { type: outFmt.mime }), ext: "xml" };
    }
    if (outFmt.ext === "csv" || outFmt.ext === "tsv") {
      const sep = outFmt.ext === "tsv" ? "\t" : ",";
      const arr = Array.isArray(obj) ? obj : [obj];
      const rows = jsonToRows(arr);
      return { blob: new Blob([rowsToCsv(rows, sep)], { type: outFmt.mime }), ext: outFmt.ext };
    }
  }

  // Markdown → HTML / plain text
  if (inFmt.ext === "md") {
    if (outFmt.ext === "html") {
      return { blob: new Blob([mdToHtml(text)], { type: outFmt.mime }), ext: "html" };
    }
    if (outFmt.ext === "txt") {
      return { blob: new Blob([text], { type: "text/plain" }), ext: "txt" };
    }
  }

  // HTML → plain text / markdown (basic strip)
  if (inFmt.ext === "html") {
    if (outFmt.ext === "txt") {
      return { blob: new Blob([htmlToText(text)], { type: "text/plain" }), ext: "txt" };
    }
    if (outFmt.ext === "md") {
      // Basic HTML→Markdown
      const plain = text
        .replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi, (_, n, c) => "#".repeat(+n) + " " + c + "\n")
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
        .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
        .replace(/<em[^>]*>(.*?)<\/em>/gi, "_$1_")
        .replace(/<i[^>]*>(.*?)<\/i>/gi, "_$1_")
        .replace(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
        .replace(/<img[^>]+alt="([^"]*)"[^>]+src="([^"]+)"[^>]*/gi, "![$1]($2)")
        .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
      return { blob: new Blob([plain], { type: "text/plain" }), ext: "md" };
    }
  }

  // TOML → JSON (basic parser)
  if (inFmt.ext === "toml") {
    const obj: Record<string, unknown> = {};
    let cur = obj;
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const section = t.match(/^\[([^\]]+)\]$/);
      if (section) { obj[section[1]] = obj[section[1]] || {}; cur = obj[section[1]] as Record<string,unknown>; continue; }
      const eq = t.indexOf("=");
      if (eq<0) continue;
      const k = t.slice(0,eq).trim();
      const v = t.slice(eq+1).trim().replace(/^["']|["']$/g,"");
      cur[k] = v === "true" ? true : v === "false" ? false : isNaN(Number(v)) ? v : Number(v);
    }
    if (outFmt.ext === "json") return { blob: new Blob([JSON.stringify(obj,null,2)], { type:"application/json" }), ext:"json" };
    if (outFmt.ext === "yaml") return { blob: new Blob([jsonToYaml(obj).trimStart()], { type:"application/x-yaml" }), ext:"yaml" };
  }

  // INI / Properties → JSON
  if (inFmt.ext === "ini") {
    const obj: Record<string,unknown> = {};
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#") || t.startsWith(";")) continue;
      const eq = t.indexOf("=");
      if (eq<0) continue;
      obj[t.slice(0,eq).trim()] = t.slice(eq+1).trim();
    }
    if (outFmt.ext === "json") return { blob: new Blob([JSON.stringify(obj,null,2)], { type:"application/json" }), ext:"json" };
  }

  // DOCX → plain text (extract XML content from ZIP)
  if (inFmt.ext === "docx") {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const docXml = await zip.file("word/document.xml")?.async("text");
      if (docXml) {
        const doc = new DOMParser().parseFromString(docXml, "application/xml");
        const paras = Array.from(doc.querySelectorAll("p")).map(p => p.textContent || "").join("\n");
        if (outFmt.ext === "txt") return { blob: new Blob([paras], { type:"text/plain" }), ext:"txt" };
        if (outFmt.ext === "html") return { blob: new Blob([paras.split("\n").map(l=>`<p>${l}</p>`).join("\n")], { type:"text/html" }), ext:"html" };
        if (outFmt.ext === "md") return { blob: new Blob([paras], { type:"text/plain" }), ext:"md" };
      }
    } catch(e) { throw new Error("DOCX extraction failed: " + (e as Error).message); }
  }

  // XLSX → CSV (extract first sheet from ZIP)
  if (inFmt.ext === "xlsx") {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      // Get shared strings
      const ssXml = await zip.file("xl/sharedStrings.xml")?.async("text");
      const sharedStrings: string[] = [];
      if (ssXml) {
        const doc = new DOMParser().parseFromString(ssXml, "application/xml");
        doc.querySelectorAll("si").forEach(si => sharedStrings.push(si.textContent || ""));
      }
      // Get first sheet
      const sheet1 = await zip.file("xl/worksheets/sheet1.xml")?.async("text");
      if (sheet1) {
        const doc = new DOMParser().parseFromString(sheet1, "application/xml");
        const rows = Array.from(doc.querySelectorAll("row")).map(row => {
          return Array.from(row.querySelectorAll("c")).map(c => {
            const t = c.getAttribute("t");
            const v = c.querySelector("v")?.textContent || "";
            return t === "s" ? (sharedStrings[parseInt(v)] || v) : v;
          });
        });
        const csv = rowsToCsv(rows, ",");
        if (outFmt.ext === "csv") return { blob: new Blob([csv], { type:"text/csv" }), ext:"csv" };
        if (outFmt.ext === "json") return { blob: new Blob([rowsToJson(rows)], { type:"application/json" }), ext:"json" };
        if (outFmt.ext === "tsv") return { blob: new Blob([rowsToCsv(rows,"\t")], { type:"text/tab-separated-values" }), ext:"tsv" };
      }
    } catch(e) { throw new Error("XLSX extraction failed: " + (e as Error).message); }
  }

  // PDF → text (via pdf.js text layer)
  if (inFmt.ext === "pdf") {
    try {
      const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
      GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;
      const buf = await file.arrayBuffer();
      const pdf = await getDocument({ data: new Uint8Array(buf) }).promise;
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        pages.push(content.items.map((it: Record<string,unknown>) => String(it["str"] ?? "")).join(" "));
      }
      const fullText = pages.join("\n\n");
      if (outFmt.ext === "txt") return { blob: new Blob([fullText], { type:"text/plain" }), ext:"txt" };
      if (outFmt.ext === "md") return { blob: new Blob([fullText], { type:"text/plain" }), ext:"md" };
      if (outFmt.ext === "html") return { blob: new Blob([fullText.split("\n\n").map(p=>`<p>${p}</p>`).join("\n")], { type:"text/html" }), ext:"html" };
    } catch(e) { throw new Error("PDF text extraction failed: " + (e as Error).message); }
  }

  // SVG → PNG/JPG/WebP (via canvas + Image)
  if (inFmt.ext === "svg" && outFmt.group === "image") {
    const svgBlob = new Blob([text], { type:"image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    await new Promise<void>((res,rej) => { img.onload=()=>res(); img.onerror=rej; img.src=url; });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || 512;
    canvas.height = img.naturalHeight || 512;
    const ctx = canvas.getContext("2d")!;
    if (outFmt.ext === "jpg") { ctx.fillStyle="#fff"; ctx.fillRect(0,0,canvas.width,canvas.height); }
    ctx.drawImage(img,0,0);
    URL.revokeObjectURL(url);
    const mime = outFmt.ext === "jpg" ? "image/jpeg" : outFmt.ext === "webp" ? "image/webp" : "image/png";
    return new Promise<{blob:Blob;ext:string}>((res,rej) => {
      canvas.toBlob(b => b ? res({blob:b,ext:outFmt.ext}) : rej(new Error("Canvas export failed")), mime, quality/100);
    });
  }

  // Plain text passthrough
  if (outFmt.ext === "txt") {
    return { blob: new Blob([text], { type: "text/plain" }), ext: "txt" };
  }

  throw new Error(`Conversion from ${inFmt.ext.toUpperCase()} to ${outFmt.ext.toUpperCase()} is not supported.`);
}

/* ─── Component ───────────────────────────────────────────────────────────── */

type ConvState = "idle" | "converting" | "done" | "error";

const GROUP_LABELS: Record<FormatGroup, string> = {
  image: "Images",
  data: "Data formats",
  text: "Text & Documents",
};

export function FileConverterClient() {
  const [inFmt, setInFmt] = useState<ConvFormat | null>(null);
  const [outFmt, setOutFmt] = useState<ConvFormat | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(90);
  const [state, setState] = useState<ConvState>("idle");
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const prevResult = useRef<string | null>(null);

  const resetResult = () => {
    if (prevResult.current) URL.revokeObjectURL(prevResult.current);
    prevResult.current = null;
    setResultUrl(null);
    setResultSize(0);
    setState("idle");
    setError("");
  };

  const pickFile = useCallback((f: File) => {
    resetResult();
    const detected = detectFormat(f);
    setFile(f);
    setInFmt(detected);
    setOutFmt(null);
    if (detected?.group === "image") {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) pickFile(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pickFile(f);
  };

  const runConvert = async () => {
    if (!file || !inFmt || !outFmt) return;
    setState("converting");
    setError("");
    try {
      const { blob, ext } = await convert(file, inFmt, outFmt, quality);
      const url = URL.createObjectURL(blob);
      prevResult.current = url;
      setResultUrl(url);
      setResultSize(blob.size);
      setState("done");
    } catch (e) {
      setError((e as Error).message);
      setState("error");
    }
  };

  const downloadResult = () => {
    if (!resultUrl || !file || !outFmt) return;
    const base = file.name.replace(/\.[^.]+$/, "");
    const ext = outFmt.ext === "ico" ? "png" : outFmt.ext;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${base}-converted.${ext}`;
    a.click();
  };

  const fmtBytes = (b: number) =>
    b >= 1e6 ? `${(b / 1e6).toFixed(2)} MB` : b >= 1e3 ? `${(b / 1e3).toFixed(1)} KB` : `${b} B`;

  const outputs = inFmt ? compatibleOutputs(inFmt) : [];
  const isImage = inFmt?.group === "image";
  const canConvert = file && inFmt && outFmt && state !== "converting";

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload file to convert"
        className={`relative flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-950/20"
            : "border-[var(--border)] hover:border-brand-400"
        }`}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <input ref={fileRef} type="file" className="sr-only" accept={ACCEPT} onChange={onFileInput} />
        <div className="mb-3 text-4xl opacity-60">🔄</div>
        {file ? (
          <>
            <p className="font-semibold">{file.name}</p>
            <p className="text-sm text-muted">
              {inFmt ? `Detected: ${inFmt.label}` : "Unknown format"} · {fmtBytes(file.size)}
            </p>
            <p className="mt-1 text-xs text-brand-600 underline underline-offset-2">
              Click to choose a different file
            </p>
          </>
        ) : (
          <>
            <p className="text-base font-semibold">
              Drop a file here or{" "}
              <span className="text-brand-600 underline underline-offset-2">browse</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              Images, JSON, CSV, TSV, XML, YAML, Markdown, HTML, TXT
            </p>
          </>
        )}
      </div>

      {/* Source preview */}
      {previewUrl && (
        <div className="surface rounded-xl border p-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Source preview" className="h-20 w-20 rounded-lg object-cover border" />
          <div className="text-sm text-muted">
            Source image preview
          </div>
        </div>
      )}

      {/* Format selector */}
      {inFmt && (
        <div className="surface rounded-2xl border p-5 space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold">
              Convert to: <span className="text-muted font-normal">(select output format)</span>
            </p>
            {(["image", "data", "text"] as FormatGroup[])
              .filter((g) => outputs.some((o) => o.group === g))
              .map((g) => (
                <div key={g} className="mb-3">
                  <p className="mb-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
                    {GROUP_LABELS[g]}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {outputs
                      .filter((o) => o.group === g)
                      .map((fmt) => (
                        <button
                          key={fmt.ext}
                          onClick={() => { setOutFmt(fmt); resetResult(); }}
                          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                            outFmt?.ext === fmt.ext
                              ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400"
                              : "surface hover:border-brand-400"
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Quality slider for lossy image formats */}
          {outFmt && (outFmt.ext === "jpg" || outFmt.ext === "webp") && (
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium w-28 shrink-0">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => setQuality(+e.target.value)}
                className="flex-1"
              />
              <span className="text-xs text-muted w-20 text-right">
                {quality >= 85 ? "High quality" : quality >= 60 ? "Balanced" : "Smaller file"}
              </span>
            </div>
          )}

          {/* Convert button */}
          <button
            onClick={runConvert}
            disabled={!canConvert}
            className="w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {state === "converting"
              ? "Converting…"
              : outFmt
              ? `Convert to ${outFmt.label}`
              : "Select output format to convert"}
          </button>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          ⚠ {error}
        </div>
      )}

      {/* Result */}
      {state === "done" && resultUrl && outFmt && file && (
        <div className="surface rounded-2xl border p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-green-600 dark:text-green-400">
                ✓ Conversion complete
              </p>
              <p className="text-sm text-muted">
                {fmtBytes(resultSize)} · {outFmt.label}
              </p>
            </div>
            <button
              onClick={downloadResult}
              className="rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 transition"
            >
              Download {outFmt.label}
            </button>
          </div>
          {/* Image result preview */}
          {outFmt.group === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resultUrl} alt="Converted result" className="max-h-64 w-auto rounded-xl border object-contain" />
          )}
        </div>
      )}

      {/* Supported conversions table */}
      <div className="surface rounded-2xl border p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">
          Supported Conversions
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["image", "data", "text"] as FormatGroup[]).map((g) => (
            <div key={g}>
              <p className="mb-2 text-xs font-semibold text-muted uppercase tracking-wider">
                {GROUP_LABELS[g]}
              </p>
              <ul className="space-y-1 text-sm text-muted">
                {g === "image" && (
                  <>
                    <li>PNG → JPG, WebP, BMP, ICO</li>
                    <li>JPG → PNG, WebP, BMP, ICO</li>
                    <li>WebP → PNG, JPG, BMP</li>
                    <li>GIF → PNG, JPG, WebP</li>
                    <li>BMP → PNG, JPG, WebP</li>
                    <li>TIFF → PNG, JPG, WebP</li>
                  </>
                )}
                {g === "data" && (
                  <>
                    <li>JSON → CSV, TSV, XML, YAML</li>
                    <li>CSV → JSON, TSV, XML, YAML</li>
                    <li>TSV → JSON, CSV, XML, YAML</li>
                    <li>XML → JSON, YAML, CSV</li>
                    <li>YAML → JSON, XML, CSV</li>
                  </>
                )}
                {g === "text" && (
                  <>
                    <li>Markdown → HTML, Plain Text</li>
                    <li>HTML → Plain Text, Markdown</li>
                    <li>Plain Text passthrough</li>
                  </>
                )}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">
          All conversions run 100% in your browser. No files are uploaded to any server.
        </p>
      </div>
    </div>
  );
}
