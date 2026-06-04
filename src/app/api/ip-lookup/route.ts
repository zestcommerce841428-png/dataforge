import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ip = req.nextUrl.searchParams.get("ip") ?? "";
  const target = ip.trim() || "";

  const url = target
    ? `http://ip-api.com/json/${encodeURIComponent(target)}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`
    : `http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;

  try {
    const r = await fetch(url, { next: { revalidate: 300 } });
    if (r.status === 429) {
      return NextResponse.json(
        { error: "rate_limited", message: "IP lookup rate limit reached. Try again shortly." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
    if (!r.ok) {
      return NextResponse.json({ error: "upstream_error", code: r.status }, { status: 502 });
    }
    const data = await r.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "network_error", message: (err as Error).message },
      { status: 503 }
    );
  }
}
