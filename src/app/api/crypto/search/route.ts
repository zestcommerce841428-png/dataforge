import { NextRequest, NextResponse } from "next/server";

const CG = "https://api.coingecko.com/api/v3";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 1) return NextResponse.json({ coins: [] });

  try {
    const res = await fetch(`${CG}/search?query=${encodeURIComponent(q)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return NextResponse.json({ coins: [] }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(
      { coins: (data.coins ?? []).slice(0, 30) },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json({ coins: [] }, { status: 503 });
  }
}
