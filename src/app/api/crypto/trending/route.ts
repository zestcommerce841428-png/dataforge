import { NextResponse } from "next/server";

const CG = "https://api.coingecko.com/api/v3";
const FNG = "https://api.alternative.me/fng/?limit=7&format=json";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [trendingRes, globalRes, fngRes] = await Promise.allSettled([
      fetch(`${CG}/search/trending`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`${CG}/global`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(FNG, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
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
          "Cache-Control": "public, max-age=120, stale-while-revalidate=300",
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
