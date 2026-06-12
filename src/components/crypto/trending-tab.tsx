"use client";

import { useEffect, useState } from "react";
import { CoinModal } from "./coin-modal";
import type { Currency } from "./dashboard";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface TrendingCoin {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    large: string;
    slug: string;
    price_btc: number;
    score: number;
    data?: {
      price: number;
      price_change_percentage_24h: { usd: number };
      market_cap: string;
      total_volume: string;
      sparkline: string;
    };
  };
}

interface GlobalData {
  data: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    market_cap_percentage: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
    updated_at: number;
  };
}

interface FngData {
  data: Array<{
    value: string;
    value_classification: string;
    timestamp: string;
  }>;
}

interface TrendingResponse {
  trending: { coins: TrendingCoin[] } | null;
  global: GlobalData | null;
  fng: FngData | null;
}

interface MarketCoin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  market_cap_rank: number;
}

interface DefiChain { name: string; tvl: number; }
interface DefiProtocol { name: string; tvl: number; chain: string; category: string; logo: string; change_1d: number | null; }
interface DefiData { chains: DefiChain[]; protocols: DefiProtocol[]; }

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fl = (n: number | null | undefined, sym = "$") => {
  if (!n) return "—";
  if (n >= 1e12) return `${sym}${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${sym}${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${sym}${(n / 1e6).toFixed(2)}M`;
  return `${sym}${n.toLocaleString("en-US")}`;
};

const pct = (n: number | null | undefined) => {
  if (n == null || isNaN(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
};

const pc = (n: number | null | undefined) =>
  n == null || isNaN(n) ? "text-muted" : n >= 0 ? "text-green-500" : "text-red-500";

/* ── Fear & Greed color helpers (class-based, no inline style) ─────────── */
function fngColor(v: number): string {
  if (v <= 25) return "#ef4444";
  if (v <= 45) return "#f97316";
  if (v <= 55) return "#eab308";
  if (v <= 75) return "#84cc16";
  return "#22c55e";
}

function fngBgClass(v: number): string {
  if (v <= 25) return "bg-red-500";
  if (v <= 45) return "bg-orange-500";
  if (v <= 55) return "bg-yellow-500";
  if (v <= 75) return "bg-lime-500";
  return "bg-green-500";
}

function fngTextClass(v: number): string {
  if (v <= 25) return "text-red-500";
  if (v <= 45) return "text-orange-500";
  if (v <= 55) return "text-yellow-500";
  if (v <= 75) return "text-lime-500";
  return "text-green-500";
}

/* ── Fear & Greed gauge ─────────────────────────────────────────────────── */
function FearGreedGauge({ value, label }: { value: number; label: string }) {
  const angle = -90 + (value / 100) * 180;
  const color = fngColor(value);

  return (
    <div className="flex flex-col items-center">
      <svg width={160} height={90} viewBox="0 0 160 90" aria-label={`Fear & Greed: ${value}`}>
        <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={14} strokeLinecap="round" />
        {[
          { end: 25, color: "#ef4444" },
          { end: 45, color: "#f97316" },
          { end: 55, color: "#eab308" },
          { end: 75, color: "#84cc16" },
          { end: 100, color: "#22c55e" },
        ].map(({ end, color: sc }, i, arr) => {
          const start = i === 0 ? 0 : arr[i - 1].end;
          const startAngle = -Math.PI + (start / 100) * Math.PI;
          const endAngle = -Math.PI + (end / 100) * Math.PI;
          const x1 = 80 + 60 * Math.cos(startAngle);
          const y1 = 80 + 60 * Math.sin(startAngle);
          const x2 = 80 + 60 * Math.cos(endAngle);
          const y2 = 80 + 60 * Math.sin(endAngle);
          const largeArc = end - start > 50 ? 1 : 0;
          return (
            <path key={end} d={`M ${x1} ${y1} A 60 60 0 ${largeArc} 1 ${x2} ${y2}`} fill="none" stroke={sc} strokeWidth={14} strokeLinecap="round" opacity={0.35} />
          );
        })}
        {/* SVG transform attribute (not CSS style) */}
        <g transform={`rotate(${angle}, 80, 80)`}>
          <line x1={80} y1={80} x2={80} y2={28} stroke={color} strokeWidth={3} strokeLinecap="round" />
          <circle cx={80} cy={80} r={5} fill={color} />
        </g>
        <text x={80} y={70} textAnchor="middle" fontSize={22} fontWeight={700} fill={color}>{value}</text>
      </svg>
      <span className={`mt-1 text-sm font-semibold ${fngTextClass(value)}`}>{label}</span>
      <span className="text-xs text-muted">Fear {"&"} Greed Index</span>
    </div>
  );
}

/* ── Dominance bar (SVG — no CSS style) ─────────────────────────────────── */
function DominanceBar({ label, val, fillColor }: { label: string; val: number; fillColor: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-12 text-right text-muted">{label}</span>
      <svg width="100%" height="8" className="flex-1 overflow-visible" aria-hidden="true">
        <rect width="100%" height="8" rx="4" fill="var(--surface-2)" />
        <rect width={`${val.toFixed(1)}%`} height="8" rx="4" fill={fillColor} />
      </svg>
      <span className="w-14 font-semibold tabular-nums">{val.toFixed(1)}%</span>
    </div>
  );
}

/* ── Global market stats ──────────────────────────────────────────────────── */
function GlobalStats({ data, currency }: { data: GlobalData["data"]; currency: Currency }) {
  const btcDom = data.market_cap_percentage?.btc ?? 0;
  const ethDom = data.market_cap_percentage?.eth ?? 0;
  const sym = currency.symbol;
  const cc = currency.code;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Total Market Cap", value: fl(data.total_market_cap?.[cc] ?? data.total_market_cap?.usd, sym), sub: pct(data.market_cap_change_percentage_24h_usd) + " 24h", subColor: pc(data.market_cap_change_percentage_24h_usd) },
        { label: "Total Volume 24h", value: fl(data.total_volume?.[cc] ?? data.total_volume?.usd, sym), sub: null, subColor: "" },
        { label: "Active Cryptos", value: data.active_cryptocurrencies?.toLocaleString("en-US") ?? "—", sub: null, subColor: "" },
        { label: "Active Markets", value: data.markets?.toLocaleString("en-US") ?? "—", sub: null, subColor: "" },
      ].map(({ label, value, sub, subColor }) => (
        <div key={label} className="surface rounded-xl border p-4">
          <p className="text-xs text-muted">{label}</p>
          <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
          {sub && <p className={`mt-0.5 text-xs font-semibold ${subColor}`}>{sub}</p>}
        </div>
      ))}
      <div className="surface col-span-full rounded-xl border p-4">
        <p className="mb-3 text-xs text-muted">Market Dominance</p>
        <div className="space-y-2">
          <DominanceBar label="BTC" val={btcDom} fillColor="#f97316" />
          <DominanceBar label="ETH" val={ethDom} fillColor="#6366f1" />
          <DominanceBar label="Others" val={Math.max(0, 100 - btcDom - ethDom)} fillColor="#94a3b8" />
        </div>
      </div>
    </div>
  );
}

/* ── Gainers / Losers ────────────────────────────────────────────────────── */
function GainersLosers({
  coins,
  onSelectCoin,
}: {
  coins: MarketCoin[];
  onSelectCoin: (id: string) => void;
}) {
  const sorted = [...coins].filter((c) => c.price_change_percentage_24h != null);
  const gainers = [...sorted].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5);
  const losers = [...sorted].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5);

  const Row = ({ c }: { c: MarketCoin }) => (
    <button
      type="button"
      onClick={() => onSelectCoin(c.id)}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-[var(--surface-2)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={c.image} alt={c.name} width={28} height={28} className="rounded-full" loading="lazy" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{c.name}</div>
        <div className="text-xs uppercase text-muted">{c.symbol}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-mono font-semibold">
          ${c.current_price < 0.01 ? c.current_price.toExponential(2) : c.current_price.toLocaleString("en-US", { maximumSignificantDigits: 5 })}
        </div>
        <div className={`text-xs font-bold ${pc(c.price_change_percentage_24h)}`}>
          {pct(c.price_change_percentage_24h)}
        </div>
      </div>
    </button>
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="surface rounded-xl border p-4">
        <h3 className="mb-3 text-sm font-bold text-green-500">▲ Top Gainers (24h)</h3>
        <div className="space-y-1">
          {gainers.map((c) => <Row key={c.id} c={c} />)}
        </div>
      </div>
      <div className="surface rounded-xl border p-4">
        <h3 className="mb-3 text-sm font-bold text-red-500">▼ Top Losers (24h)</h3>
        <div className="space-y-1">
          {losers.map((c) => <Row key={c.id} c={c} />)}
        </div>
      </div>
    </div>
  );
}

/* ── DeFi TVL card ───────────────────────────────────────────────────────── */
function DefiTVLCard() {
  const [data, setData] = useState<DefiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/crypto/defi")
      .then((r) => r.json())
      .then((d: DefiData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="surface rounded-xl border p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="mt-3 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-[var(--surface-2)]" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxTvl = data.chains[0]?.tvl ?? 1;

  return (
    <div className="surface rounded-xl border p-4">
      <h3 className="mb-4 text-sm font-bold">⛓ DeFi TVL by Chain</h3>
      <div className="space-y-2">
        {data.chains.slice(0, 8).map((chain) => {
          const widthPct = Math.max(2, (chain.tvl / maxTvl) * 100);
          return (
            <div key={chain.name} className="flex items-center gap-3 text-sm">
              <span className="w-20 truncate text-right text-xs text-muted">{chain.name}</span>
              <svg width="100%" height="18" className="flex-1 overflow-visible" aria-hidden="true">
                <rect width="100%" height="18" rx="4" fill="var(--surface-2)" />
                <rect width={`${widthPct}%`} height="18" rx="4" fill="var(--brand-500, #6366f1)" opacity="0.7" />
              </svg>
              <span className="w-20 text-xs font-semibold tabular-nums">{fl(chain.tvl)}</span>
            </div>
          );
        })}
      </div>

      {data.protocols.length > 0 && (
        <>
          <h3 className="mb-3 mt-5 text-sm font-bold">🏛 Top DeFi Protocols</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-app text-muted">
                  <th className="pb-2 text-left font-medium">Protocol</th>
                  <th className="pb-2 text-left font-medium">Chain</th>
                  <th className="pb-2 text-right font-medium">TVL</th>
                  <th className="pb-2 text-right font-medium">24h</th>
                </tr>
              </thead>
              <tbody>
                {data.protocols.slice(0, 10).map((p) => (
                  <tr key={p.name} className="border-b border-app/50">
                    <td className="py-2 font-semibold">
                      <div className="flex items-center gap-2">
                        {p.logo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.logo} alt={p.name} width={18} height={18} className="rounded-full" loading="lazy" />
                        )}
                        {p.name}
                      </div>
                    </td>
                    <td className="py-2 text-muted">{p.chain}</td>
                    <td className="py-2 text-right font-mono">{fl(p.tvl)}</td>
                    <td className={`py-2 text-right font-semibold ${pc(p.change_1d)}`}>
                      {p.change_1d != null ? pct(p.change_1d) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Trending Tab ─────────────────────────────────────────────────────────── */
export function TrendingTab({ currency }: { currency: Currency }) {
  const [data, setData] = useState<TrendingResponse | null>(null);
  const [markets, setMarkets] = useState<MarketCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [trendRes, mktRes] = await Promise.allSettled([
          fetch("/api/crypto/trending"),
          fetch("/api/crypto/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h"),
        ]);
        if (trendRes.status === "fulfilled" && trendRes.value.ok) setData(await trendRes.value.json());
        if (mktRes.status === "fulfilled" && mktRes.value.ok) setMarkets(await mktRes.value.json());
        setError("");
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 300_000);
    return () => clearInterval(id);
  }, []);

  const trendingCoins = data?.trending?.coins ?? [];
  const globalData = data?.global?.data ?? null;
  const fngToday = data?.fng?.data?.[0] ?? null;
  const fngHistory = data?.fng?.data ?? [];

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
        <p className="mt-3 text-sm text-muted">Loading market data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
        ⚠ {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global stats + Fear & Greed */}
      <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          {globalData && <GlobalStats data={globalData} currency={currency} />}
        </div>
        {fngToday && (
          <div className="surface flex flex-col items-center justify-center rounded-2xl border p-5">
            <FearGreedGauge value={parseInt(fngToday.value)} label={fngToday.value_classification} />
            {fngHistory.length > 1 && (
              <div className="mt-4 w-full">
                <p className="mb-2 text-center text-xs text-muted">7-day history</p>
                <div className="flex items-end justify-center gap-1.5">
                  {fngHistory.slice(0, 7).reverse().map((d) => {
                    const v = parseInt(d.value);
                    const barH = Math.round((v / 100) * 40 + 8);
                    return (
                      <div key={d.timestamp} className="group relative flex flex-col items-center gap-1">
                        <span className="absolute bottom-full mb-1 hidden rounded bg-black/80 px-1.5 py-0.5 text-xs whitespace-nowrap text-white group-hover:block">
                          {v} · {d.value_classification}
                        </span>
                        <svg width={28} height={48} aria-hidden="true">
                          <rect y={48 - barH} width={28} height={barH} rx="3" fill={fngColor(v)} opacity={0.8} />
                        </svg>
                        <span className="text-[9px] text-muted">
                          {new Date(parseInt(d.timestamp) * 1000).toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gainers / Losers */}
      {markets.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-bold">📊 Market Movers</h2>
          <GainersLosers coins={markets} onSelectCoin={setSelectedCoin} />
        </div>
      )}

      {/* DeFi TVL */}
      <div>
        <h2 className="mb-3 text-lg font-bold">🏦 DeFi Overview</h2>
        <DefiTVLCard />
      </div>

      {/* Trending coins */}
      {trendingCoins.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-bold">
            🔥 Trending Coins
            <span className="ml-2 text-sm font-normal text-muted">Top searched on CoinGecko (past 24h)</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trendingCoins.slice(0, 8).map(({ item }) => {
              const priceUsd = item.data?.price ?? 0;
              const change24h = item.data?.price_change_percentage_24h?.usd ?? null;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedCoin(item.id)}
                  className="surface group cursor-pointer rounded-2xl border p-4 text-left shadow-sm transition hover:border-brand-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label={`View ${item.name} details`}
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.large} alt={item.name} width={40} height={40} className="rounded-full" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{item.name}</div>
                      <div className="text-xs uppercase text-muted">{item.symbol}{item.market_cap_rank ? ` · #${item.market_cap_rank}` : ""}</div>
                    </div>
                    <span className="shrink-0 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-semibold text-orange-500">
                      #{item.score + 1}
                    </span>
                  </div>
                  {priceUsd > 0 ? (
                    <>
                      <div className="mt-3 font-mono text-base font-bold">
                        ${priceUsd < 0.01 ? priceUsd.toExponential(2) : priceUsd.toLocaleString("en-US", { maximumSignificantDigits: 6 })}
                      </div>
                      {change24h != null && (
                        <div className={`mt-0.5 text-sm font-semibold ${pc(change24h)}`}>{pct(change24h)} 24h</div>
                      )}
                    </>
                  ) : (
                    <div className="mt-3 text-sm text-muted">{item.price_btc.toFixed(8)} BTC</div>
                  )}
                  {item.data?.market_cap && (
                    <div className="mt-2 text-xs text-muted">MCap {item.data.market_cap}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedCoin && (
        <CoinModal coinId={selectedCoin} onClose={() => setSelectedCoin(null)} />
      )}
    </div>
  );
}
