import { NextRequest, NextResponse } from "next/server";

const CG = "https://api.coingecko.com/api/v3";

// ISR: Next.js will serve a cached response and revalidate in background
export const revalidate = 60;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = sp.get("page") ?? "1";
  const per_page = String(Math.min(250, parseInt(sp.get("per_page") ?? "100")));
  const ids = sp.get("ids") ?? "";
  const sparkline = sp.get("sparkline") ?? "true";

  const vs_currency = sp.get("vs_currency") ?? "usd";

  const qs = new URLSearchParams({
    vs_currency,
    order: "market_cap_desc",
    per_page,
    page,
    sparkline,
    price_change_percentage: "24h,7d",
  });
  if (ids) qs.set("ids", ids);

  try {
    const res = await fetch(`${CG}/coins/markets?${qs}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (res.status === 429) {
      return NextResponse.json(
        { error: "rate_limited", message: "CoinGecko rate limit reached. Retrying in 60s." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: "upstream_error", code: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        "X-Source": "coingecko",
        "X-Page": page,
        "X-Per-Page": per_page,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "network_error", message: (err as Error).message },
      { status: 503 }
    );
  }
}
