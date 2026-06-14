import nodemailer from "nodemailer";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const BRAND = "#7c3aed";
const LOGO = `${SITE_URL}/icons/icon-192.png`;

export function makeTransport() {
  const port = Number(process.env.SMTP_PORT ?? 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.hostinger.com",
    port,
    secure: port !== 587, // 465 = implicit TLS, 587 = STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

/** Minimal, dependency-free user-agent parser. */
export function parseUserAgent(ua: string) {
  ua = ua || "";
  const browser =
    /Edg\//.test(ua) ? "Microsoft Edge" :
    /OPR\/|Opera/.test(ua) ? "Opera" :
    /Chrome\//.test(ua) && !/Chromium/.test(ua) ? "Chrome" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) && !/Chrome/.test(ua) ? "Safari" :
    "Unknown browser";
  const os =
    /Windows NT 10/.test(ua) ? "Windows 10/11" :
    /Windows/.test(ua) ? "Windows" :
    /Mac OS X/.test(ua) ? "macOS" :
    /Android/.test(ua) ? "Android" :
    /iPhone|iPad|iPod/.test(ua) ? "iOS" :
    /Linux/.test(ua) ? "Linux" :
    "Unknown OS";
  const device =
    /Mobile|Android|iPhone|iPod/.test(ua) ? "Mobile" :
    /iPad|Tablet/.test(ua) ? "Tablet" :
    "Desktop";
  return { browser, os, device };
}

export type RequestContext = {
  ip: string;
  browser: string;
  os: string;
  device: string;
  location: string; // "City, Region, Country" or "Unknown"
  isp: string;
  time: string;      // human-readable UTC
};

/** Build a RequestContext from request headers (UA + IP geolocation). */
export async function buildRequestContext(headers: Headers): Promise<RequestContext> {
  const ua = headers.get("user-agent") ?? "";
  const { browser, os, device } = parseUserAgent(ua);
  const ip =
    (headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    "";

  let location = "Unknown";
  let isp = "Unknown";
  const isPrivate = !ip || /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1|fc|fd)/i.test(ip);
  if (!isPrivate) {
    try {
      const r = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,isp`,
        { signal: AbortSignal.timeout(4000) }
      );
      const d = await r.json();
      if (d?.status === "success") {
        location = [d.city, d.regionName, d.country].filter(Boolean).join(", ") || "Unknown";
        isp = d.isp || "Unknown";
      }
    } catch { /* geolocation is best-effort */ }
  }

  return {
    ip: ip || "Unknown",
    browser, os, device,
    location, isp,
    time: new Date().toUTCString(),
  };
}

function shell(title: string, inner: string): string {
  return `
  <div style="background:#f4f4f7;padding:32px 12px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ececf1">
      <tr>
        <td style="background:linear-gradient(135deg,#3478f6,#1a45b4);padding:24px 28px;text-align:center">
          <img src="${LOGO}" width="44" height="44" alt="${SITE_NAME}" style="border-radius:10px;display:inline-block;vertical-align:middle" />
          <span style="color:#fff;font-weight:900;font-size:22px;letter-spacing:-0.3px;vertical-align:middle;margin-left:10px">${SITE_NAME}</span>
        </td>
      </tr>
      <tr><td style="padding:28px">
        <h1 style="margin:0 0 6px;font-size:20px;color:#111">${title}</h1>
        ${inner}
      </td></tr>
      <tr><td style="padding:18px 28px;background:#fafafb;border-top:1px solid #ececf1;text-align:center">
        <p style="margin:0;color:#9aa0ac;font-size:12px">
          © ${new Date().getFullYear()} ${SITE_NAME} · This is an automated security message.<br/>
          <a href="${SITE_URL}" style="color:${BRAND};text-decoration:none">${SITE_URL.replace(/^https?:\/\//, "")}</a>
        </p>
      </td></tr>
    </table>
  </div>`;
}

function detailsBox(ctx: RequestContext): string {
  const row = (label: string, value: string) =>
    `<tr>
       <td style="padding:6px 0;color:#888;font-size:12px;width:96px">${label}</td>
       <td style="padding:6px 0;color:#333;font-size:12px;font-weight:600">${value}</td>
     </tr>`;
  return `
    <div style="margin:22px 0 4px;background:#f7f8fa;border:1px solid #ececf1;border-radius:12px;padding:14px 16px">
      <p style="margin:0 0 8px;color:#555;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px">Request details</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Time", ctx.time)}
        ${row("Device", `${ctx.device} · ${ctx.os}`)}
        ${row("Browser", ctx.browser)}
        ${row("IP address", ctx.ip)}
        ${row("Location", ctx.location)}
        ${row("Network", ctx.isp)}
      </table>
    </div>`;
}

export type OtpPurpose = "signup" | "login" | "reset";

const COPY: Record<OtpPurpose, { title: string; subject: string; intro: (n: string) => string; note: string }> = {
  signup: {
    title: "Verify your email",
    subject: "is your verification code",
    intro: (n) => `Hi${n ? ` ${n}` : ""}, welcome to ${SITE_NAME}! Use the one-time code below to verify your email address and activate your account.`,
    note: `If you didn't create a ${SITE_NAME} account, you can safely ignore this email — no account will be created.`,
  },
  login: {
    title: "Your sign-in code",
    subject: "is your sign-in code",
    intro: (n) => `Hi${n ? ` ${n}` : ""}, use the one-time code below to sign in to your ${SITE_NAME} account.`,
    note: `If you didn't try to sign in, someone may have your email address — we recommend changing your password.`,
  },
  reset: {
    title: "Reset your password",
    subject: "is your password reset code",
    intro: (n) => `Hi${n ? ` ${n}` : ""}, use the one-time code below to reset your ${SITE_NAME} password.`,
    note: `If you didn't request a password reset, you can safely ignore this email — your password will stay the same.`,
  },
};

/** Professional one-time-code email with device/location details. */
export async function sendOtpEmail(
  purpose: OtpPurpose,
  to: string,
  code: string,
  name: string,
  ctx: RequestContext
) {
  const c = COPY[purpose];
  const inner = `
    <p style="margin:0 0 18px;color:#555;font-size:14px;line-height:1.6">${c.intro(escapeHtml(name))}</p>
    <div style="font-size:38px;font-weight:900;letter-spacing:12px;padding:20px;background:#f4f4f5;border-radius:12px;text-align:center;color:#111">
      ${code}
    </div>
    <p style="margin:14px 0 0;color:#888;font-size:12px">
      This code expires in <strong>10 minutes</strong>. ${c.note}
    </p>
    ${detailsBox(ctx)}`;
  await makeTransport().sendMail({
    from: `"${SITE_NAME}" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to,
    subject: `${code} ${c.subject} · ${SITE_NAME}`,
    html: shell(c.title, inner),
  });
}

/** Back-compat wrapper used by the signup route. */
export async function sendSignupOtp(to: string, code: string, name: string, ctx: RequestContext) {
  return sendOtpEmail("signup", to, code, name, ctx);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
