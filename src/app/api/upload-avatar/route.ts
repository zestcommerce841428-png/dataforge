import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uploadUrl = process.env.NEXT_PUBLIC_HOSTINGER_UPLOAD_URL;
  const secret = process.env.HOSTINGER_UPLOAD_SECRET;
  if (!uploadUrl) return NextResponse.json({ error: "Upload not configured" }, { status: 500 });

  const formData = await req.formData();
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: secret ? { "X-Upload-Secret": secret } : {},
    body: formData,
    signal: AbortSignal.timeout(15000),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}
