import { NextRequest, NextResponse } from "next/server";

const CG = "https://api.coingecko.com/api/v3";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const days = req.nextUrl.searchParams.get("days") ?? "30";
  const vs_currency = req.nextUrl.searchParams.get("vs_currency") ?? "usd";

  try {
    const res = await fetch(
      `${CG}/coins/${encodeURIComponent(id)}/market_chart?vs_currency=${vs_currency}&days=${days}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 300 } }
    );

    if (res.status === 429) {
      return NextResponse.json(
        { error: "rate_limited" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
    if (!res.ok) {
      return NextResponse.json({ error: "upstream_error", code: res.status }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    return NextResponse.json({ error: "network_error", message: (err as Error).message }, { status: 503 });
  }
}
