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
  n == null || isNaN(n)
    ? "text-muted"
    : n >= 0
    ? "text-green-500"
    : "text-red-500";

/* ── Fear & Greed gauge ─────────────────────────────────────────────────── */
function FearGreedGauge({ value, label }: { value: number; label: string }) {
  const angle = -90 + (value / 100) * 180;
  const color =
    value <= 25
      ? "#ef4444"
      : value <= 45
      ? "#f97316"
      : value <= 55
      ? "#eab308"
      : value <= 75
      ? "#84cc16"
      : "#22c55e";

  return (
    <div className="flex flex-col items-center">
      <svg width={160} height={90} viewBox="0 0 160 90" aria-label={`Fear & Greed: ${value}`}>
        {/* Background arc */}
        <path
          d="M 20 80 A 60 60 0 0 1 140 80"
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* Colored segments */}
        {[
          { end: 25, color: "#ef4444" },
          { end: 45, color: "#f97316" },
          { end: 55, color: "#eab308" },
          { end: 75, color: "#84cc16" },
          { end: 100, color: "#22c55e" },
        ].map(({ end }, i, arr) => {
          const start = i === 0 ? 0 : arr[i - 1].end;
          const startAngle = -Math.PI + (start / 100) * Math.PI;
          const endAngle = -Math.PI + (end / 100) * Math.PI;
          const x1 = 80 + 60 * Math.cos(startAngle);
          const y1 = 80 + 60 * Math.sin(startAngle);
          const x2 = 80 + 60 * Math.cos(endAngle);
          const y2 = 80 + 60 * Math.sin(endAngle);
          const largeArc = end - start > 50 ? 1 : 0;
          return (
            <path
              key={end}
              d={`M ${x1} ${y1} A 60 60 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none"
              stroke={arr[i].color}
              strokeWidth={14}
              strokeLinecap="round"
              opacity={0.35}
            />
          );
        })}
        {/* Needle */}
        <g
          transform={`rotate(${angle}, 80, 80)`}
          style={{ transition: "transform 0.8s ease" }}
        >
          <line
            x1={80}
            y1={80}
            x2={80}
            y2={28}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={80} cy={80} r={5} fill={color} />
        </g>
        {/* Value text */}
        <text x={80} y={70} textAnchor="middle" fontSize={22} fontWeight={700} fill={color}>
          {value}
        </text>
      </svg>
      <span className="mt-1 text-sm font-semibold" style={{ color }}>
        {label}
      </span>
      <span className="text-xs text-muted">Fear {"&"} Greed Index</span>
    </div>
  );
}

/* ── Global market stats bar ─────────────────────────────────────────────── */
function GlobalStats({ data, currency }: { data: GlobalData["data"]; currency: import("./dashboard").Currency }) {
  const btcDom = data.market_cap_percentage?.btc ?? 0;
  const ethDom = data.market_cap_percentage?.eth ?? 0;
  const sym = currency.symbol;
  const cc = currency.code;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[
        {
          label: "Total Market Cap",
          value: fl(data.total_market_cap?.[cc] ?? data.total_market_cap?.usd, sym),
          sub: pct(data.market_cap_change_percentage_24h_usd) + " 24h",
          subColor: pc(data.market_cap_change_percentage_24h_usd),
        },
        {
          label: "Total Volume 24h",
          value: fl(data.total_volume?.[cc] ?? data.total_volume?.usd, sym),
          sub: null,
          subColor: "",
        },
        {
          label: "Active Cryptocurrencies",
          value: data.active_cryptocurrencies?.toLocaleString("en-US") ?? "—",
          sub: null,
          subColor: "",
        },
        {
          label: "Active Markets",
          value: data.markets?.toLocaleString("en-US") ?? "—",
          sub: null,
          subColor: "",
        },
      ].map(({ label, value, sub, subColor }) => (
        <div key={label} className="surface rounded-xl border p-4">
          <p className="text-xs text-muted">{label}</p>
          <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
          {sub && (
            <p className={`mt-0.5 text-xs font-semibold ${subColor}`}>{sub}</p>
          )}
        </div>
      ))}
      {/* BTC / ETH dominance */}
      <div className="surface col-span-full rounded-xl border p-4">
        <p className="mb-2 text-xs text-muted">Market Dominance</p>
        <div className="space-y-2">
          {[
            { label: "BTC", val: btcDom, color: "bg-orange-400" },
            { label: "ETH", val: ethDom, color: "bg-blue-400" },
            {
              label: "Others",
              val: 100 - btcDom - ethDom,
              color: "bg-[var(--surface-2)]",
            },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <span className="w-12 text-right text-muted">{label}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className={`h-2 rounded-full ${color}`}
                  style={{ width: `${val.toFixed(1)}%` }}
                />
              </div>
              <span className="w-14 font-semibold tabular-nums">
                {val.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Trending Tab ─────────────────────────────────────────────────────────── */
export function TrendingTab({ currency }: { currency: Currency }) {
  const [data, setData] = useState<TrendingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/crypto/trending");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
        setError("");
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
    // Refresh every 5 min
    const id = setInterval(load, 300000);
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
          <div className="surface rounded-2xl border p-5 flex flex-col items-center justify-center">
            <FearGreedGauge
              value={parseInt(fngToday.value)}
              label={fngToday.value_classification}
            />
            {fngHistory.length > 1 && (
              <div className="mt-4 w-full">
                <p className="mb-2 text-center text-xs text-muted">
                  7-day history
                </p>
                <div className="flex items-end justify-center gap-1.5">
                  {fngHistory.slice(0, 7).reverse().map((d) => {
                    const v = parseInt(d.value);
                    const col =
                      v <= 25
                        ? "bg-red-500"
                        : v <= 45
                        ? "bg-orange-500"
                        : v <= 55
                        ? "bg-yellow-500"
                        : v <= 75
                        ? "bg-lime-500"
                        : "bg-green-500";
                    return (
                      <div key={d.timestamp} className="group relative flex flex-col items-center gap-1">
                        <span className="absolute bottom-full mb-1 hidden rounded bg-black/80 px-1.5 py-0.5 text-xs text-white group-hover:block whitespace-nowrap">
                          {v} · {d.value_classification}
                        </span>
                        <div
                          className={`w-7 rounded-t ${col} opacity-80`}
                          style={{ height: `${(v / 100) * 40 + 8}px` }}
                        />
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

      {/* Trending coins */}
      {trendingCoins.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-bold">
            🔥 Trending Coins
            <span className="ml-2 text-sm font-normal text-muted">
              Top searched on CoinGecko (past 24h)
            </span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trendingCoins.slice(0, 8).map(({ item }) => {
              const priceUsd = item.data?.price ?? 0;
              const change24h =
                item.data?.price_change_percentage_24h?.usd ?? null;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedCoin(item.id)}
                  className="surface group cursor-pointer rounded-2xl border p-4 text-left shadow-sm transition hover:border-brand-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label={`View ${item.name} details`}
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.large}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{item.name}</div>
                      <div className="text-xs uppercase text-muted">
                        {item.symbol}
                        {item.market_cap_rank
                          ? ` · #${item.market_cap_rank}`
                          : ""}
                      </div>
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
                        <div className={`mt-0.5 text-sm font-semibold ${pc(change24h)}`}>
                          {pct(change24h)} 24h
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="mt-3 text-sm text-muted">
                      {item.price_btc.toFixed(8)} BTC
                    </div>
                  )}
                  {item.data?.market_cap && (
                    <div className="mt-2 text-xs text-muted">
                      MCap {item.data.market_cap}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Coin modal */}
      {selectedCoin && (
        <CoinModal
          coinId={selectedCoin}
          onClose={() => setSelectedCoin(null)}
        />
      )}
    </div>
  );
}
