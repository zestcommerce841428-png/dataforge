import { NextResponse } from "next/server";

const LLAMA = "https://api.llama.fi";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [chainsRes, protocolsRes] = await Promise.allSettled([
      fetch(`${LLAMA}/v2/chains`, { signal: AbortSignal.timeout(8000) }),
      fetch(`${LLAMA}/protocols`, { signal: AbortSignal.timeout(8000) }),
    ]);

    const chains =
      chainsRes.status === "fulfilled" && chainsRes.value.ok
        ? ((await chainsRes.value.json()) as Array<{ name: string; tvl: number; tokenSymbol?: string }>)
            .sort((a, b) => b.tvl - a.tvl)
            .slice(0, 10)
        : [];

    const protocols =
      protocolsRes.status === "fulfilled" && protocolsRes.value.ok
        ? ((await protocolsRes.value.json()) as Array<{
            name: string;
            tvl: number;
            change_1d: number;
            change_7d: number;
            category: string;
            logo?: string;
            chains: string[];
          }>)
            .sort((a, b) => b.tvl - a.tvl)
            .slice(0, 20)
        : [];

    return NextResponse.json(
      { chains, protocols },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "network_error", message: (err as Error).message },
      { status: 503 }
    );
  }
}
