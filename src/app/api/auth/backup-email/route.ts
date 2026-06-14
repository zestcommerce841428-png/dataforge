import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { createHash, randomInt } from "crypto";

export const dynamic = "force-dynamic";

function hashCode(code: string) {
  return createHash("sha256").update(code + process.env.SUPABASE_SERVICE_ROLE_KEY).digest("hex");
}

function makeAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function sendOtpEmail(to: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: (process.env.SMTP_PORT ?? "465") !== "587",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"DataForge" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to,
    subject: "DataForge — Backup Email Verification Code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <div style="padding:24px 0 8px">
          <span style="font-weight:900;font-size:20px">Data<span style="color:#7c3aed">Forge</span></span>
        </div>
        <h2 style="margin:0 0 12px;font-size:18px">Verify your backup email</h2>
        <p style="color:#555;margin:0 0 20px">Use this one-time code to confirm your backup email address:</p>
        <div style="font-size:40px;font-weight:900;letter-spacing:10px;padding:20px;background:#f4f4f5;border-radius:12px;text-align:center;color:#111">
          ${code}
        </div>
        <p style="color:#888;font-size:12px;margin:16px 0 0">
          This code expires in <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

// POST — send OTP to a candidate backup email
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const email = (body.email as string | undefined)?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }
  if (email === user.email?.toLowerCase()) {
    return NextResponse.json({ error: "Backup email must be different from your primary email." }, { status: 400 });
  }

  const code = String(randomInt(100000, 999999));
  const hash = hashCode(code);
  const expiry = Date.now() + 10 * 60 * 1000;

  const admin = makeAdmin();
  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      _bep: email,        // backup email pending
      _boh: hash,         // backup otp hash
      _boe: expiry,       // backup otp expiry
    },
  });

  try {
    await sendOtpEmail(email, code);
  } catch (err) {
    console.error("SMTP send failed:", err);
    return NextResponse.json(
      { error: "Could not send email. Check SMTP_HOST / SMTP_USER / SMTP_PASS env vars." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

// PATCH — verify OTP code and persist backup email
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim();

  const meta = user.user_metadata ?? {};
  if (!meta._bep || !meta._boh || !meta._boe) {
    return NextResponse.json({ error: "No pending backup email verification. Please request a new code." }, { status: 400 });
  }
  if (Date.now() > Number(meta._boe)) {
    return NextResponse.json({ error: "OTP has expired. Please request a new code." }, { status: 400 });
  }
  if (hashCode(code) !== meta._boh) {
    return NextResponse.json({ error: "Incorrect OTP code." }, { status: 400 });
  }

  const backupEmail = meta._bep as string;
  const { error } = await supabase.auth.updateUser({
    data: { backup_email: backupEmail, _bep: null, _boh: null, _boe: null },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, backup_email: backupEmail });
}

// DELETE — remove backup email
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.auth.updateUser({ data: { backup_email: null } });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
