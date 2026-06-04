import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/recaptcha-verify";

export async function POST(req: NextRequest) {
  const { url, service = "tinyurl", recaptchaToken } = await req.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  // Bot/abuse protection (no-op unless RECAPTCHA_SECRET is configured)
  const check = await verifyRecaptcha(recaptchaToken, "shorten");
  if (!check.ok) {
    return NextResponse.json({ error: "recaptcha_failed", reason: check.reason }, { status: 403 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  const services: Record<string, () => Promise<string>> = {
    tinyurl: async () => {
      const r = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      if (!r.ok) throw new Error("TinyURL failed");
      return r.text();
    },
    isgd: async () => {
      const r = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
      if (!r.ok) throw new Error("is.gd failed");
      return r.text();
    },
    vgd: async () => {
      const r = await fetch(`https://v.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
      if (!r.ok) throw new Error("v.gd failed");
      return r.text();
    },
    clckru: async () => {
      const r = await fetch(`https://clck.ru/--?url=${encodeURIComponent(url)}`);
      if (!r.ok) throw new Error("clck.ru failed");
      return r.text();
    },
  };

  const fn = services[service];
  if (!fn) return NextResponse.json({ error: "unknown service" }, { status: 400 });

  try {
    const short = await fn();
    return NextResponse.json({ short: short.trim(), original: url, service });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
