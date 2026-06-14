import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/recaptcha-verify";

export const dynamic = "force-dynamic";

// Lightweight human-check used by forms that authenticate directly against
// Supabase (e.g. password login), so they can gate on reCAPTCHA too.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const result = await verifyRecaptcha(body.token, body.action);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "Failed bot verification." }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
