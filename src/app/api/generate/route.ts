import { type NextRequest, NextResponse } from "next/server";
import { getGenerator } from "@/lib/generators";

export const runtime = "edge";

const MAX_COUNT   = 100;   // max values per request
const RATE_LIMIT  = 60;    // requests per window
const WINDOW_MS   = 60_000; // 1 minute

// In-memory store — persists within a single edge worker instance.
// Not globally consistent across instances, but provides meaningful burst protection.
const ipStore = new Map<string, { count: number; reset: number }>();

// Periodically prune stale entries to avoid unbounded growth
function pruneStore() {
  const now = Date.now();
  for (const [key, val] of ipStore) {
    if (now > val.reset) ipStore.delete(key);
  }
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  if (ipStore.size > 5000) pruneStore();

  const entry = ipStore.get(ip);
  if (!entry || now > entry.reset) {
    const reset = now + WINDOW_MS;
    ipStore.set(ip, { count: 1, reset });
    return { allowed: true, remaining: RATE_LIMIT - 1, reset };
  }
  entry.count++;
  const remaining = Math.max(0, RATE_LIMIT - entry.count);
  return { allowed: entry.count <= RATE_LIMIT, remaining, reset: entry.reset };
}

function rateLimitHeaders(remaining: number, reset: number) {
  return {
    "X-RateLimit-Limit":     String(RATE_LIMIT),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset":     String(Math.ceil(reset / 1000)),
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Expose-Headers": "X-RateLimit-Limit,X-RateLimit-Remaining,X-RateLimit-Reset",
  };
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
          ?? req.headers.get("cf-connecting-ip")
          ?? "unknown";

  const { allowed, remaining, reset } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down.", retry_after_seconds: Math.ceil((reset - Date.now()) / 1000) },
      { status: 429, headers: rateLimitHeaders(0, reset) }
    );
  }

  const { searchParams } = req.nextUrl;
  const tool       = searchParams.get("tool")?.trim();
  const countParam = Number(searchParams.get("count") ?? "1");

  if (!tool) {
    return NextResponse.json(
      { error: "Missing required parameter: tool", docs: "/api-docs" },
      { status: 400, headers: rateLimitHeaders(remaining, reset) }
    );
  }

  const gen = getGenerator(tool);
  if (!gen) {
    return NextResponse.json(
      { error: `Unknown tool: "${tool}". See /api/generate/tools for the full list.` },
      { status: 404, headers: rateLimitHeaders(remaining, reset) }
    );
  }

  if (gen.slug === "qr-code" || gen.slug === "barcode") {
    return NextResponse.json(
      { error: "Visual generators (qr-code, barcode) are not available via the API." },
      { status: 422, headers: rateLimitHeaders(remaining, reset) }
    );
  }

  const count = Math.max(1, Math.min(MAX_COUNT, isNaN(countParam) ? 1 : countParam));

  const opts: Record<string, string | number | boolean> = {};
  for (const f of gen.fields) opts[f.key] = f.default;
  for (const f of gen.fields) {
    const v = searchParams.get(f.key);
    if (v !== null) {
      if (f.type === "number")        opts[f.key] = Number(v);
      else if (f.type === "checkbox") opts[f.key] = v === "true" || v === "1";
      else                            opts[f.key] = v;
    }
  }

  const results = await Promise.all(
    Array.from({ length: count }, () => Promise.resolve(gen.generate(opts)))
  );

  return NextResponse.json(
    { tool: gen.slug, name: gen.name, category: gen.category, count, results, generated_at: new Date().toISOString() },
    { headers: { ...rateLimitHeaders(remaining, reset), "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
          ?? req.headers.get("cf-connecting-ip")
          ?? "unknown";

  const { allowed, remaining, reset } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down.", retry_after_seconds: Math.ceil((reset - Date.now()) / 1000) },
      { status: 429, headers: rateLimitHeaders(0, reset) }
    );
  }

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* empty body is fine */ }

  const tool       = (body.tool as string | undefined)?.trim();
  const countParam = Number(body.count ?? 1);
  const options    = (body.options as Record<string, unknown> | undefined) ?? {};

  if (!tool) {
    return NextResponse.json(
      { error: "Missing required field: tool", docs: "/api-docs" },
      { status: 400, headers: rateLimitHeaders(remaining, reset) }
    );
  }

  const gen = getGenerator(tool);
  if (!gen) {
    return NextResponse.json(
      { error: `Unknown tool: "${tool}". See /api/generate/tools for the full list.` },
      { status: 404, headers: rateLimitHeaders(remaining, reset) }
    );
  }

  if (gen.slug === "qr-code" || gen.slug === "barcode") {
    return NextResponse.json(
      { error: "Visual generators (qr-code, barcode) are not available via the API." },
      { status: 422, headers: rateLimitHeaders(remaining, reset) }
    );
  }

  const count = Math.max(1, Math.min(MAX_COUNT, isNaN(countParam) ? 1 : countParam));

  const opts: Record<string, string | number | boolean> = {};
  for (const f of gen.fields) opts[f.key] = f.default;
  for (const f of gen.fields) {
    const v = options[f.key];
    if (v !== undefined && v !== null) {
      if (f.type === "number")        opts[f.key] = Number(v);
      else if (f.type === "checkbox") opts[f.key] = Boolean(v);
      else                            opts[f.key] = String(v);
    }
  }

  const results = await Promise.all(
    Array.from({ length: count }, () => Promise.resolve(gen.generate(opts)))
  );

  return NextResponse.json(
    { ok: true, tool: gen.slug, name: gen.name, category: gen.category, count, values: results, generated_at: new Date().toISOString() },
    { headers: { ...rateLimitHeaders(remaining, reset), "Cache-Control": "no-store" } }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    },
  });
}
