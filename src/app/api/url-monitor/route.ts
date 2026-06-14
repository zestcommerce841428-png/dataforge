import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHash } from "crypto";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

function hashContent(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

async function sendChangeAlert(email: string, url: string, name: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: `"DataForge Alerts" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to: email,
    subject: `🔔 Page changed: ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <div style="padding:24px 0 8px"><span style="font-weight:900;font-size:20px">Data<span style="color:#7c3aed">Forge</span></span></div>
        <h2 style="margin:0 0 12px;font-size:18px">🔔 Content changed</h2>
        <p style="color:#555">The monitored page <strong>${name}</strong> has changed.</p>
        <p><a href="${url}" style="color:#7c3aed">${url}</a></p>
        <p style="color:#888;font-size:12px;margin-top:20px">
          Manage your monitors at <a href="https://dataforge.vercel.app/url-monitor">DataForge URL Monitor</a>.
        </p>
      </div>
    `,
  });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("url_monitors").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { url, name, alert_email, check_interval_hours = 24 } = body;
  if (!url?.trim() || !name?.trim()) return NextResponse.json({ error: "url and name are required" }, { status: 400 });

  const { count } = await supabase.from("url_monitors").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  if ((count ?? 0) >= 10) return NextResponse.json({ error: "Maximum 10 URL monitors per account." }, { status: 400 });

  const { data, error } = await supabase.from("url_monitors").insert({
    user_id: user.id, url: url.trim(), name: name.trim(),
    alert_email: alert_email || user.email, check_interval_hours,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.from("url_monitors").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PATCH — manually trigger a check for one monitor
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data: monitor } = await supabase.from("url_monitors").select("*").eq("id", id).eq("user_id", user.id).single();
  if (!monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });

  let html = "";
  try {
    const res = await fetch(monitor.url, { signal: AbortSignal.timeout(10000) });
    html = await res.text();
  } catch (e) {
    return NextResponse.json({ error: `Fetch failed: ${(e as Error).message}` }, { status: 500 });
  }

  const hash = hashContent(html);
  const changed = monitor.last_content_hash && monitor.last_content_hash !== hash;

  await supabase.from("url_monitors").update({ last_content_hash: hash, last_checked_at: new Date().toISOString() }).eq("id", id);

  if (changed && monitor.alert_email) {
    await sendChangeAlert(monitor.alert_email, monitor.url, monitor.name).catch(console.error);
  }

  return NextResponse.json({ ok: true, changed: changed ?? false, checked_at: new Date().toISOString() });
}
