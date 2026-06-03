import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ip = req.nextUrl.searchParams.get("ip") ?? "";
  const target = ip.trim() || "";

  const url = target
    ? `http://ip-api.com/json/${encodeURIComponent(target)}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`
    : `http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;

  const r = await fetch(url, { next: { revalidate: 300 } });
  const data = await r.json();

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
