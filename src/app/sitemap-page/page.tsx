import type { Metadata } from "next";
import { TOOL_META, CATEGORIES, TOTAL_GENERATORS } from "@/lib/generators";
import { POSTS } from "@/app/blog/posts";
import { SITE_URL } from "@/lib/site";
import { BUILD_TIME_ISO } from "@/lib/version";
import { SitemapUI } from "./sitemap-ui";

export const metadata: Metadata = {
  title: "Site Map — DataForge",
  description: `Complete interactive site map for DataForge — browse all ${TOTAL_GENERATORS} generators, blog guides, tools and pages.`,
  alternates: { canonical: "/sitemap-page" },
};

export type SitemapEntry = {
  path: string;
  title: string;
  description: string;
  section: "static" | "tools" | "blog" | "api";
  category: string;
  priority: number;
  lastModified: string;
  isNew?: boolean;
};

const BUILD_DATE = BUILD_TIME_ISO.slice(0, 10);

const STATIC_PAGES: Omit<SitemapEntry, "section">[] = [
  { path: "/",                title: "Home — All Tools",         description: "Browse all generators by category, search and filter.",        category: "Main",        priority: 1.0,  lastModified: BUILD_DATE },
  { path: "/about",           title: "About DataForge",          description: "Our mission: fast, free, privacy-first data tools.",            category: "Company",     priority: 0.5,  lastModified: BUILD_DATE },
  { path: "/blog",            title: "Blog & Guides",            description: "How-tos and tips for getting the most out of DataForge.",       category: "Content",     priority: 0.7,  lastModified: BUILD_DATE },
  { path: "/crypto",          title: "Crypto Dashboard",         description: "Live crypto prices, trending coins and market data.",           category: "Tools",       priority: 0.8,  lastModified: BUILD_DATE },
  { path: "/ocr",             title: "OCR — Image to Text",      description: "Extract text from images using Tesseract.js in the browser.",  category: "Tools",       priority: 0.8,  lastModified: BUILD_DATE },
  { path: "/dev-tools",       title: "Developer Tools",          description: "JSON formatter, diff checker, regex tester and more.",         category: "Tools",       priority: 0.8,  lastModified: BUILD_DATE },
  { path: "/file-converter",  title: "File Converter",           description: "Convert between PDF, Word, images and other formats.",         category: "Tools",       priority: 0.8,  lastModified: BUILD_DATE },
  { path: "/image-tools",     title: "Image Tools",              description: "Resize, compress, crop, rotate and convert images.",           category: "Tools",       priority: 0.8,  lastModified: BUILD_DATE },
  { path: "/pdf-tools",       title: "PDF Tools",                description: "Merge, split, compress and edit PDF files in-browser.",        category: "Tools",       priority: 0.8,  lastModified: BUILD_DATE },
  { path: "/handwriting",     title: "Text to Handwriting",      description: "Convert typed text to realistic handwritten pages.",           category: "Tools",       priority: 0.8,  lastModified: BUILD_DATE },
  { path: "/code-formatter",  title: "Code Formatter",           description: "Format and beautify code in 20+ languages.",                   category: "Tools",       priority: 0.8,  lastModified: BUILD_DATE },
  { path: "/workbook",        title: "Spreadsheet Workbook",     description: "In-browser spreadsheet with formulas and exports.",            category: "Tools",       priority: 0.7,  lastModified: BUILD_DATE },
  { path: "/formula-manager", title: "Formula Manager",          description: "Build, test and share spreadsheet formulas.",                  category: "Tools",       priority: 0.7,  lastModified: BUILD_DATE },
  { path: "/typing",          title: "Typing Practice",          description: "Improve your typing speed and accuracy.",                      category: "Tools",       priority: 0.7,  lastModified: BUILD_DATE },
  { path: "/compare",         title: "Compare Generators",       description: "Side-by-side comparison of two data generators.",             category: "Tools",       priority: 0.6,  lastModified: BUILD_DATE },
  { path: "/format-converter", title: "Format Converter",        description: "Convert between JSON, YAML, XML, CSV and TOML.",              category: "Tools",       priority: 0.7,  lastModified: BUILD_DATE },
  { path: "/shortcuts",       title: "Keyboard Shortcuts",       description: "All keyboard shortcuts across DataForge tools.",              category: "Help",        priority: 0.5,  lastModified: BUILD_DATE },
  { path: "/changelog",       title: "Changelog",                description: "What's new — full commit history and release notes.",         category: "Company",     priority: 0.6,  lastModified: BUILD_DATE, isNew: true },
  { path: "/api-docs",        title: "Public API Docs",          description: "REST API for generating test data — no auth required.",       category: "API",         priority: 0.8,  lastModified: BUILD_DATE, isNew: true },
  { path: "/sitemap-page",    title: "Site Map",                 description: "Interactive index of all DataForge pages and tools.",         category: "Help",        priority: 0.4,  lastModified: BUILD_DATE, isNew: true },
  { path: "/regex",           title: "Regex Playground",         description: "Live regex tester with pattern library and match highlighting.", category: "Tools",       priority: 0.8,  lastModified: BUILD_DATE, isNew: true },
  { path: "/jwt",             title: "JWT Debugger",             description: "Decode and verify JSON Web Tokens. HMAC signature check.",       category: "Tools",       priority: 0.8,  lastModified: BUILD_DATE, isNew: true },
  { path: "/diff",            title: "Diff Viewer",              description: "Text and code comparison with LCS-based diff algorithm.",        category: "Tools",       priority: 0.8,  lastModified: BUILD_DATE, isNew: true },
  { path: "/base-converter",  title: "Base Converter",           description: "Convert between Decimal, Binary, Hex, Octal, Base64 and more.", category: "Tools",       priority: 0.8,  lastModified: BUILD_DATE, isNew: true },
  { path: "/color-toolkit",   title: "Color Toolkit",            description: "Convert, contrast-check, palette-generate and simulate color blindness.", category: "Tools", priority: 0.8, lastModified: BUILD_DATE, isNew: true },
  { path: "/cron-builder",    title: "Cron Expression Builder",  description: "Build cron schedules visually with next-run preview.",          category: "Tools",       priority: 0.8,  lastModified: BUILD_DATE, isNew: true },
  { path: "/json-path",       title: "JSON Path Explorer",       description: "Run JSONPath expressions and extract data from any JSON.",       category: "Tools",       priority: 0.8,  lastModified: BUILD_DATE, isNew: true },
  { path: "/bulk-template",   title: "Bulk Template Generator",  description: "Generate up to 200 unique outputs from any generator.",         category: "Tools",       priority: 0.7,  lastModified: BUILD_DATE, isNew: true },
  { path: "/contact",         title: "Contact Us",               description: "Get in touch with the DataForge team.",                       category: "Company",     priority: 0.4,  lastModified: BUILD_DATE },
  { path: "/privacy",         title: "Privacy Policy",           description: "How we handle (or rather, don't handle) your data.",         category: "Legal",       priority: 0.3,  lastModified: BUILD_DATE },
  { path: "/terms",           title: "Terms of Service",         description: "Rules for using DataForge tools and services.",               category: "Legal",       priority: 0.3,  lastModified: BUILD_DATE },
  { path: "/cookies",         title: "Cookie Policy",            description: "What cookies DataForge uses and why.",                        category: "Legal",       priority: 0.3,  lastModified: BUILD_DATE },
  { path: "/disclaimer",      title: "Disclaimer",               description: "Limitations of liability for DataForge content.",             category: "Legal",       priority: 0.3,  lastModified: BUILD_DATE },
];

const API_ROUTES: Omit<SitemapEntry, "section">[] = [
  { path: "/api/generate",        title: "GET /api/generate",        description: "Generate one or more values from any tool.",            category: "Generate", priority: 0.9, lastModified: BUILD_DATE },
  { path: "/api/generate/tools",  title: "GET /api/generate/tools",  description: "List all available tool slugs and field schemas.",       category: "Generate", priority: 0.8, lastModified: BUILD_DATE },
  { path: "/api/my-ip",           title: "GET /api/my-ip",           description: "Returns the caller's public IP address.",                category: "Network",  priority: 0.6, lastModified: BUILD_DATE },
  { path: "/api/ip-lookup",       title: "GET /api/ip-lookup",       description: "Geo-locate any IPv4/IPv6 address.",                      category: "Network",  priority: 0.6, lastModified: BUILD_DATE },
  { path: "/api/dns",             title: "GET /api/dns",             description: "DNS record lookup for any domain.",                      category: "Network",  priority: 0.6, lastModified: BUILD_DATE },
  { path: "/api/og-check",        title: "GET /api/og-check",        description: "Fetch Open Graph metadata for any URL.",                 category: "Web",      priority: 0.5, lastModified: BUILD_DATE },
  { path: "/api/shorten",         title: "POST /api/shorten",        description: "Shorten a URL via multiple public providers.",           category: "Web",      priority: 0.5, lastModified: BUILD_DATE },
  { path: "/api/contact",         title: "POST /api/contact",        description: "Contact form submission endpoint.",                      category: "Internal", priority: 0.2, lastModified: BUILD_DATE },
  { path: "/api/crypto/markets",  title: "GET /api/crypto/markets",  description: "Live crypto market data from CoinGecko.",                category: "Crypto",   priority: 0.6, lastModified: BUILD_DATE },
  { path: "/api/crypto/trending", title: "GET /api/crypto/trending", description: "Trending coins by 24-hour volume.",                     category: "Crypto",   priority: 0.5, lastModified: BUILD_DATE },
  { path: "/api/crypto/coin",     title: "GET /api/crypto/coin",     description: "Detailed stats for a single coin by ID.",               category: "Crypto",   priority: 0.5, lastModified: BUILD_DATE },
  { path: "/api/crypto/search",   title: "GET /api/crypto/search",   description: "Search coins by name or ticker.",                       category: "Crypto",   priority: 0.5, lastModified: BUILD_DATE },
  { path: "/api/crypto/futures",  title: "GET /api/crypto/futures",  description: "Futures market data from Binance.",                     category: "Crypto",   priority: 0.4, lastModified: BUILD_DATE },
];

export default function SitemapPage() {
  const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name]));

  const toolEntries: SitemapEntry[] = TOOL_META.map((t) => ({
    path: `/tools/${t.slug}`,
    title: t.name,
    description: t.short,
    section: "tools",
    category: catMap[t.category] ?? t.category,
    priority: 0.8,
    lastModified: BUILD_DATE,
  }));

  const blogEntries: SitemapEntry[] = POSTS.map((p) => ({
    path: `/blog/${p.slug}`,
    title: p.title,
    description: p.description,
    section: "blog",
    category: p.category,
    priority: 0.6,
    lastModified: p.date,
  }));

  const staticEntries: SitemapEntry[] = STATIC_PAGES.map((e) => ({ ...e, section: "static" as const }));
  const apiEntries: SitemapEntry[]    = API_ROUTES.map((e) => ({ ...e, section: "api" as const }));

  const allEntries = [...staticEntries, ...toolEntries, ...blogEntries, ...apiEntries];

  const stats = {
    total:  allEntries.length,
    static: staticEntries.length,
    tools:  toolEntries.length,
    blog:   blogEntries.length,
    api:    apiEntries.length,
    siteUrl: SITE_URL,
    buildDate: BUILD_DATE,
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <SitemapUI entries={allEntries} stats={stats} />
    </main>
  );
}
