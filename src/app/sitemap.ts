import type { MetadataRoute } from "next";
import { GENERATORS } from "@/lib/generators";
import { POSTS } from "./blog/posts";
import { SITE_URL as BASE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/about", "/privacy", "/terms", "/cookies", "/disclaimer", "/contact", "/crypto", "/ocr", "/file-converter", "/dev-tools", "/formula-manager", "/workbook", "/shortcuts", "/typing", "/image-tools", "/pdf-tools", "/handwriting", "/format-converter", "/code-formatter", "/blog"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.5,
  }));
  const tools = GENERATORS.map((g) => ({
    url: `${BASE}/tools/${g.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  const blog = POSTS.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...staticRoutes, ...blog, ...tools];
}
