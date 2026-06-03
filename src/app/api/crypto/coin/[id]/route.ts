import { NextRequest, NextResponse } from "next/server";

const CG = "https://api.coingecko.com/api/v3";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(
      `${CG}/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=true`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 120 },
      }
    );
    if (res.status === 429) {
      return NextResponse.json(
        { error: "rate_limited" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
    if (!res.ok) {
      return NextResponse.json({ error: "not_found" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "network_error", message: (err as Error).message },
      { status: 503 }
    );
  }
}
