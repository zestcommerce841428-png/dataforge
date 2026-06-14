import { NextRequest, NextResponse } from "next/server";
import { makeAdmin, findUserByEmail } from "@/lib/auth-otp";
import { buildRequestContext, sendOtpEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// POST — send a passwordless sign-in code. We use the admin generateLink API to
// mint Supabase's own email OTP (so the client can verifyOtp and get a real
// session), but deliver it through our own branded email — never a link.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = (body.email as string | undefined)?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const admin = makeAdmin();
  const user = await findUserByEmail(admin, email);
  // Don't reveal whether the account exists.
  if (!user) return NextResponse.json({ ok: true });

  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data?.properties?.email_otp) {
    console.error("generateLink failed:", error);
    return NextResponse.json({ error: "Could not start sign-in. Please try again." }, { status: 500 });
  }

  try {
    const ctx = await buildRequestContext(req.headers);
    await sendOtpEmail("login", email, data.properties.email_otp, String(user.user_metadata?.full_name ?? ""), ctx);
  } catch (err) {
    console.error("Login OTP email failed:", err);
    return NextResponse.json({ error: "Could not send the sign-in code. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
