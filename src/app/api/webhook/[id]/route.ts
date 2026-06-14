import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function makeAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Receive any HTTP method — store the request
async function handleRequest(req: NextRequest, id: string) {
  const admin = makeAdmin();

  // Verify endpoint exists
  const { data: endpoint } = await admin.from("webhook_endpoints").select("id").eq("id", id).single();
  if (!endpoint) return new NextResponse("Not found", { status: 404 });

  const method = req.method;
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => { if (!k.startsWith(":")) headers[k] = v; });

  const queryParams: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => { queryParams[k] = v; });

  let body: string | null = null;
  try {
    const text = await req.text();
    body = text || null;
  } catch { /* ignore */ }

  // Keep only last 50 requests per endpoint
  const { count } = await admin.from("webhook_requests").select("id", { count: "exact", head: true }).eq("endpoint_id", id);
  if ((count ?? 0) >= 50) {
    const { data: oldest } = await admin.from("webhook_requests").select("id").eq("endpoint_id", id).order("received_at", { ascending: true }).limit(1);
    if (oldest?.[0]) await admin.from("webhook_requests").delete().eq("id", oldest[0].id);
  }

  await admin.from("webhook_requests").insert({
    endpoint_id: id, method, headers, body, query_params: queryParams,
    ip: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null,
  });

  return new NextResponse(JSON.stringify({ ok: true, received_at: new Date().toISOString() }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  params.then(({ id }) => handleRequest(req, id));
export const POST = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  params.then(({ id }) => handleRequest(req, id));
export const PUT = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  params.then(({ id }) => handleRequest(req, id));
export const PATCH = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  params.then(({ id }) => handleRequest(req, id));
export const DELETE = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  params.then(({ id }) => handleRequest(req, id));
