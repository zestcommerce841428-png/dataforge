import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import { makeAdmin, hashCode, findUserByEmail } from "@/lib/auth-otp";
import { buildRequestContext, sendOtpEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// POST — send a password-reset OTP to the account email.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = (body.email as string | undefined)?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const admin = makeAdmin();
  const user = await findUserByEmail(admin, email);

  // Only send if the account exists, but always return ok so we don't leak
  // which emails are registered.
  if (user) {
    const code = String(randomInt(100000, 999999));
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        _rotph: hashCode(code),
        _rotpe: Date.now() + 10 * 60 * 1000,
      },
    });
    try {
      const ctx = await buildRequestContext(req.headers);
      await sendOtpEmail("reset", email, code, String(user.user_metadata?.full_name ?? ""), ctx);
    } catch (err) {
      console.error("Reset OTP email failed:", err);
      // still return ok to avoid enumeration; user can retry
    }
  }

  return NextResponse.json({ ok: true });
}
