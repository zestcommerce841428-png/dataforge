import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin, type User } from "@supabase/supabase-js";
import { createHash, randomInt } from "crypto";
import { buildRequestContext, sendSignupOtp } from "@/lib/email";

export const dynamic = "force-dynamic";

function makeAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function hashCode(code: string) {
  return createHash("sha256").update(code + process.env.SUPABASE_SERVICE_ROLE_KEY).digest("hex");
}

type Admin = ReturnType<typeof makeAdmin>;

async function findUserByEmail(admin: Admin, email: string): Promise<User | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data?.users?.length) break;
    const found = data.users.find((u) => u.email?.toLowerCase() === target);
    if (found) return found;
    if (data.users.length < 1000) break;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = (body.email as string | undefined)?.trim().toLowerCase();
  const password = body.password as string | undefined;
  const metadata = (body.metadata ?? {}) as Record<string, unknown>;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const admin = makeAdmin();
  const code = String(randomInt(100000, 999999));
  const otpMeta = { _otph: hashCode(code), _otpe: Date.now() + 10 * 60 * 1000 };

  const existing = await findUserByEmail(admin, email);
  if (existing) {
    if (existing.email_confirmed_at) {
      return NextResponse.json({ error: "This email is already registered. Try signing in." }, { status: 409 });
    }
    // Unconfirmed account: update details + password and resend a fresh code.
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      user_metadata: { ...existing.user_metadata, ...metadata, ...otpMeta },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // do NOT send Supabase's own email; we send our own OTP
      user_metadata: { ...metadata, ...otpMeta },
    });
    if (error) {
      const msg = /already|registered|exists/i.test(error.message)
        ? "This email is already registered. Try signing in."
        : error.message;
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  try {
    const ctx = await buildRequestContext(req.headers);
    await sendSignupOtp(email, code, String(metadata.full_name ?? ""), ctx);
  } catch (err) {
    console.error("OTP email send failed:", err);
    return NextResponse.json(
      { error: "Could not send the verification email. Please try again shortly." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
