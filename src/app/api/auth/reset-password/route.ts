import { NextRequest, NextResponse } from "next/server";
import { makeAdmin, hashCode, findUserByEmail } from "@/lib/auth-otp";

export const dynamic = "force-dynamic";

// POST — verify the reset OTP and set a new password.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = (body.email as string | undefined)?.trim().toLowerCase();
  const code = String(body.code ?? "").trim();
  const password = body.password as string | undefined;

  if (!email || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const admin = makeAdmin();
  const user = await findUserByEmail(admin, email);
  if (!user) return NextResponse.json({ error: "No reset request found for this email." }, { status: 404 });

  const meta = user.user_metadata ?? {};
  if (!meta._rotph || !meta._rotpe) {
    return NextResponse.json({ error: "No active reset code. Please request a new one." }, { status: 400 });
  }
  if (Date.now() > Number(meta._rotpe)) {
    return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
  }
  if (hashCode(code) !== meta._rotph) {
    return NextResponse.json({ error: "Incorrect code. Please check and try again." }, { status: 400 });
  }

  const cleaned = { ...meta };
  delete cleaned._rotph;
  delete cleaned._rotpe;
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true, // a successful reset also proves email ownership
    user_metadata: cleaned,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
