import { NextResponse } from "next/server";

const CG = "https://api.coingecko.com/api/v3";
const FNG = "https://api.alternative.me/fng/?limit=7&format=json";

export const revalidate = 300;

export async function GET() {
  try {
    const [trendingRes, globalRes, fngRes] = await Promise.allSettled([
      fetch(`${CG}/search/trending`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
      }),
      fetch(`${CG}/global`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 120 },
      }),
      fetch(FNG, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      }),
    ]);

    const trending =
      trendingRes.status === "fulfilled" && trendingRes.value.ok
        ? await trendingRes.value.json()
        : null;

    const global =
      globalRes.status === "fulfilled" && globalRes.value.ok
        ? await globalRes.value.json()
        : null;

    const fng =
      fngRes.status === "fulfilled" && fngRes.value.ok
        ? await fngRes.value.json()
        : null;

    return NextResponse.json(
      { trending, global, fng },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "network_error", message: (err as Error).message },
      { status: 503 }
    );
  }
}
