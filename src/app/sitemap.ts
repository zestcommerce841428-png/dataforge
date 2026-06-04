import type { MetadataRoute } from "next";
import { GENERATORS } from "@/lib/generators";
import { SITE_URL as BASE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/about", "/privacy", "/crypto", "/ocr", "/file-converter", "/dev-tools", "/formula-manager", "/workbook", "/shortcuts", "/typing", "/image-tools", "/pdf-tools"].map((p) => ({
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
  return [...staticRoutes, ...tools];
}
