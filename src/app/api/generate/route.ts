import { type NextRequest, NextResponse } from "next/server";
import { getGenerator } from "@/lib/generators";

export const runtime = "edge";

const RATE_LIMIT = 100; // max count per request

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tool  = searchParams.get("tool")?.trim();
  const countParam = Number(searchParams.get("count") ?? "1");

  if (!tool) {
    return NextResponse.json(
      { error: "Missing required parameter: tool", docs: "GET /api/generate?tool=uuid&count=5" },
      { status: 400 }
    );
  }

  const gen = getGenerator(tool);
  if (!gen) {
    return NextResponse.json(
      { error: `Unknown tool: "${tool}". Check /api/generate/tools for the full list.` },
      { status: 404 }
    );
  }

  if (gen.slug === "qr-code" || gen.slug === "barcode") {
    return NextResponse.json(
      { error: "Visual generators (QR code, barcode) are not available via the API." },
      { status: 422 }
    );
  }

  const count = Math.max(1, Math.min(RATE_LIMIT, isNaN(countParam) ? 1 : countParam));

  // Build opts from remaining query params (apply generator field defaults first)
  const opts: Record<string, string | number | boolean> = {};
  for (const f of gen.fields) opts[f.key] = f.default;
  for (const f of gen.fields) {
    const v = searchParams.get(f.key);
    if (v !== null) {
      if (f.type === "number")   opts[f.key] = Number(v);
      else if (f.type === "checkbox") opts[f.key] = v === "true" || v === "1";
      else opts[f.key] = v;
    }
  }

  const results = await Promise.all(
    Array.from({ length: count }, () => Promise.resolve(gen.generate(opts)))
  );

  return NextResponse.json({
    tool:         gen.slug,
    name:         gen.name,
    category:     gen.category,
    count,
    results,
    generated_at: new Date().toISOString(),
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
