import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

function makeAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function sendMissedAlert(email: string, monitorName: string, lastPing: string | null) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const lastStr = lastPing
    ? `Last successful ping: ${new Date(lastPing).toLocaleString()}`
    : "This monitor has never pinged successfully before.";

  await transporter.sendMail({
    from: `"DataForge Alerts" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to: email,
    subject: `⚠️ Cron monitor missed: ${monitorName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <div style="padding:24px 0 8px">
          <span style="font-weight:900;font-size:20px">Data<span style="color:#7c3aed">Forge</span></span>
        </div>
        <h2 style="margin:0 0 12px;font-size:18px;color:#dc2626">⚠️ Cron job missed</h2>
        <p style="color:#555">The monitor <strong>${monitorName}</strong> did not ping within its expected schedule.</p>
        <p style="color:#888;font-size:13px">${lastStr}</p>
        <p style="color:#888;font-size:12px;margin-top:20px">
          Manage your monitors at <a href="https://dataforge.vercel.app/cron-monitor">DataForge Cron Monitor</a>.
        </p>
      </div>
    `,
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = makeAdmin();

  const { data: monitor } = await admin.from("cron_monitors").select("*").eq("id", id).single();
  if (!monitor) return new NextResponse("Monitor not found", { status: 404 });

  const status = req.nextUrl.searchParams.get("status") ?? "ok";
  const now = new Date().toISOString();

  await admin.from("cron_monitors").update({
    last_ping_at: now,
    last_status: status === "fail" ? "fail" : "ok",
  }).eq("id", id);

  return NextResponse.json({ ok: true, received_at: now, monitor: monitor.name });
}
