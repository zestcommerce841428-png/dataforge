import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHash, randomBytes } from "crypto";

export const dynamic = "force-dynamic";

function hashKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

function generateKey(): { key: string; prefix: string } {
  const raw = randomBytes(24).toString("base64url");
  const key = `df_live_${raw}`;
  return { key, prefix: key.slice(0, 12) + "…" };
}

// GET — list user's API keys (no secrets returned)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("api_keys")
    .select("id,name,key_prefix,last_used_at,created_at,expires_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — create a new API key (returns plaintext ONCE)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = (body.name as string | undefined)?.trim();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  // Limit to 10 keys per user
  const { count } = await supabase.from("api_keys").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  if ((count ?? 0) >= 10) return NextResponse.json({ error: "Maximum 10 API keys per account." }, { status: 400 });

  const { key, prefix } = generateKey();
  const expiresAt = body.expires_days ? new Date(Date.now() + body.expires_days * 86400000).toISOString() : null;

  const { data, error } = await supabase.from("api_keys").insert({
    user_id: user.id, name, key_hash: hashKey(key), key_prefix: prefix, expires_at: expiresAt,
  }).select("id,name,key_prefix,created_at,expires_at").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ...data, key }, { status: 201 });
}

// DELETE — revoke an API key
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.from("api_keys").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
