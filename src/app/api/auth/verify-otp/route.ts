import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin, type User } from "@supabase/supabase-js";
import { createHash } from "crypto";

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
  const code = String(body.code ?? "").trim();

  if (!email || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });
  }

  const admin = makeAdmin();
  const user = await findUserByEmail(admin, email);
  if (!user) return NextResponse.json({ error: "No pending verification for this email." }, { status: 404 });
  if (user.email_confirmed_at) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const meta = user.user_metadata ?? {};
  if (!meta._otph || !meta._otpe) {
    return NextResponse.json({ error: "No active code. Please request a new one." }, { status: 400 });
  }
  if (Date.now() > Number(meta._otpe)) {
    return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
  }
  if (hashCode(code) !== meta._otph) {
    return NextResponse.json({ error: "Incorrect code. Please check and try again." }, { status: 400 });
  }

  // Confirm the email and clear the one-time code.
  const cleaned = { ...meta };
  delete cleaned._otph;
  delete cleaned._otpe;
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
    user_metadata: cleaned,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
