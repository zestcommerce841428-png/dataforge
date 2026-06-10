import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DataForge OG Checker)" },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    const tags: Record<string, string> = {};
    const metaRe = /<meta\s+([^>]+)>/gi;
    let m: RegExpExecArray | null;
    while ((m = metaRe.exec(html)) !== null) {
      const attrs = m[1];
      const prop =
        /property=["']([^"']+)["']/i.exec(attrs)?.[1] ||
        /name=["']([^"']+)["']/i.exec(attrs)?.[1];
      const content = /content=["']([^"']*)["']/i.exec(attrs)?.[1];
      if (prop && content !== undefined && /^(og:|twitter:|description$|title$)/i.test(prop)) {
        tags[prop] = content;
      }
    }

    const titleM = /<title[^>]*>([^<]*)<\/title>/i.exec(html);
    if (titleM && !tags["title"]) tags["title"] = titleM[1].trim();

    return NextResponse.json(tags);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
