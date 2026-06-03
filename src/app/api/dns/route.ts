import { NextRequest, NextResponse } from "next/server";

const CF_DOH = "https://cloudflare-dns.com/dns-query";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const name = sp.get("name");
  const type = sp.get("type") ?? "A";

  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const types = type.split(",").filter(Boolean);
  const results: Record<string, unknown> = {};

  await Promise.all(
    types.map(async (t) => {
      const r = await fetch(`${CF_DOH}?name=${encodeURIComponent(name)}&type=${t}`, {
        headers: { Accept: "application/dns-json" },
        next: { revalidate: 60 },
      });
      if (r.ok) results[t] = await r.json();
    })
  );

  return NextResponse.json(results, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
