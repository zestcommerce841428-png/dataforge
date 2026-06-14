import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET — list requests for a given endpoint (auth-gated)
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const endpointId = req.nextUrl.searchParams.get("endpoint_id");
  if (!endpointId) return NextResponse.json({ error: "endpoint_id required" }, { status: 400 });

  // Verify ownership
  const { data: ep } = await supabase.from("webhook_endpoints").select("id").eq("id", endpointId).eq("user_id", user.id).single();
  if (!ep) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase.from("webhook_requests")
    .select("id,method,headers,body,query_params,ip,received_at")
    .eq("endpoint_id", endpointId)
    .order("received_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — clear all requests for an endpoint
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const endpointId = req.nextUrl.searchParams.get("endpoint_id");
  if (!endpointId) return NextResponse.json({ error: "endpoint_id required" }, { status: 400 });

  const { data: ep } = await supabase.from("webhook_endpoints").select("id").eq("id", endpointId).eq("user_id", user.id).single();
  if (!ep) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await supabase.from("webhook_requests").delete().eq("endpoint_id", endpointId);
  return NextResponse.json({ ok: true });
}
