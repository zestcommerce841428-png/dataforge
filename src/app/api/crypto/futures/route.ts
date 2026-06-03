import { NextRequest, NextResponse } from "next/server";

const FAPI = "https://fapi.binance.com/fapi/v1";

// Binance Futures public endpoints — no API key required
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const endpoint = sp.get("endpoint") ?? "fundingRate";
  const symbol = sp.get("symbol") ?? "BTCUSDT";
  const limit = sp.get("limit") ?? "10";

  const urls: Record<string, string> = {
    fundingRate:   `${FAPI}/fundingRate?symbol=${symbol}&limit=${limit}`,
    openInterest:  `${FAPI}/openInterest?symbol=${symbol}`,
    premiumIndex:  `${FAPI}/premiumIndex?symbol=${symbol}`,
    ticker24hr:    `${FAPI}/ticker/24hr`,
    topLongShort:  `${FAPI}/topLongShortPositionRatio?symbol=${symbol}&period=1h&limit=${limit}`,
  };

  const url = urls[endpoint];
  if (!url) {
    return NextResponse.json({ error: "unknown_endpoint" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });

    if (res.status === 429) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: `upstream_${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        "X-Source": "binance-futures",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "network_error", message: (err as Error).message },
      { status: 503 }
    );
  }
}
