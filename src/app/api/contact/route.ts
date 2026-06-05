import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { verifyRecaptcha } from "@/lib/recaptcha-verify";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; subject?: string; message?: string; recaptchaToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const subject = (body.subject ?? "").trim() || "New contact message";
  const message = (body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "message_too_long" }, { status: 400 });
  }

  // Spam protection — only block on a confirmed low bot score. Missing/invalid
  // tokens (e.g. reCAPTCHA still propagating a new domain) do NOT block contact,
  // so legitimate users can always reach us.
  const check = await verifyRecaptcha(body.recaptchaToken, "contact");
  if (!check.ok && check.reason === "low-score") {
    return NextResponse.json({ error: "recaptcha_failed", reason: check.reason }, { status: 403 });
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO || user || "contact@zestcommerce.in";

  if (!host || !user || !pass) {
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // SSL on 465, STARTTLS on 587
    auth: { user, pass },
  });

  const safe = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));

  try {
    await transporter.sendMail({
      from: `"DataForge Contact" <${user}>`,
      to,
      replyTo: email,
      subject: `[DataForge] ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<h2>New message from DataForge</h2>
        <p><strong>Name:</strong> ${safe(name)}</p>
        <p><strong>Email:</strong> ${safe(email)}</p>
        <p><strong>Subject:</strong> ${safe(subject)}</p>
        <hr/>
        <p style="white-space:pre-wrap">${safe(message)}</p>`,
    });

    // Optional auto-acknowledgement to the sender
    transporter.sendMail({
      from: `"DataForge" <${user}>`,
      to: email,
      subject: "We received your message — DataForge",
      text: `Hi ${name},\n\nThanks for reaching out to DataForge. We've received your message and will reply within 1–2 business days.\n\n— Naushad Alam, DataForge`,
    }).catch(() => { /* non-fatal */ });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "send_failed", message: (e as Error).message }, { status: 502 });
  }
}
