import { NextResponse } from "next/server";
import { GENERATORS, CATEGORIES } from "@/lib/generators";

export const runtime = "edge";

export async function GET() {
  const tools = GENERATORS
    .filter((g) => g.slug !== "qr-code" && g.slug !== "barcode")
    .map((g) => ({
      slug:     g.slug,
      name:     g.name,
      category: g.category,
      short:    g.short,
      endpoint: `/api/generate?tool=${g.slug}`,
      fields:   g.fields.map((f) => ({
        key:     f.key,
        label:   f.label,
        type:    f.type,
        default: f.default,
        ...(f.min !== undefined ? { min: f.min } : {}),
        ...(f.max !== undefined ? { max: f.max } : {}),
        ...(f.options ? { options: f.options } : {}),
      })),
    }));

  const categories = CATEGORIES.map((c) => ({
    id:    c.id,
    name:  c.name,
    count: tools.filter((t) => t.category === c.id).length,
  }));

  return NextResponse.json({
    total: tools.length,
    categories,
    tools,
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
