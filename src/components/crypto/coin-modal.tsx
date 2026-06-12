"use client";

import { useEffect, useState } from "react";
import { Sparkline } from "./sparkline";
import type { Currency } from "./dashboard";

/* ── Types ───────────────────────────────────────────────────────────────── */
interface MarketData {
  current_price: Record<string, number>;
  market_cap: Record<string, number>;
  total_volume: Record<string, number>;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  price_change_percentage_1y: number;
  ath: Record<string, number>;
  ath_change_percentage: Record<string, number>;
  ath_date: Record<string, string>;
  atl: Record<string, number>;
  atl_change_percentage: Record<string, number>;
  atl_date: Record<string, string>;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  fully_diluted_valuation: Record<string, number | null>;
  sparkline_7d: { price: number[] };
  market_cap_rank: number;
}

interface DeveloperData {
  forks: number;
  stars: number;
  subscribers: number;
  total_issues: number;
  closed_issues: number;
  pull_requests_merged: number;
  commit_count_4_weeks: number;
}

interface CoinDetail {
  id: string;
  name: string;
  symbol: string;
  image: { large: string; small: string };
  description: { en: string };
  market_cap_rank: number;
  links: {
    homepage: string[];
    blockchain_site: string[];
    repos_url: { github: string[] };
    twitter_screen_name: string;
    subreddit_url: string;
  };
  market_data: MarketData;
  community_data: {
    twitter_followers: number;
    reddit_subscribers: number;
    reddit_average_posts_48h: number;
    reddit_average_comments_48h: number;
  };
  developer_data: DeveloperData;
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
  categories: string[];
  hashing_algorithm: string | null;
  genesis_date: string | null;
}

/* ── Price history types ─────────────────────────────────────────────────── */
interface HistoryPoint { timestamp: number; price: number; }

/* ── Formatters ──────────────────────────────────────────────────────────── */
const fp = (p: number, s = "$") => {
  if (!p && p !== 0) return "—";
  if (p >= 1000) return `${s}${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (p >= 1) return `${s}${p.toFixed(4)}`;
  if (p >= 0.0001) return `${s}${p.toFixed(6)}`;
  return `${s}${p.toFixed(10)}`;
};

const fl = (n: number | null | undefined, s = "$") => {
  if (!n) return "—";
  if (n >= 1e12) return `${s}${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${s}${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `${s}${n.toLocaleString("en-US")}`;
};

const pct = (n: number | null | undefined) => {
  if (n == null || isNaN(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
};

const pc = (n: number | null | undefined) =>
  n == null || isNaN(n) ? "text-muted" : n >= 0 ? "text-green-500" : "text-red-500";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="surface-2 rounded-xl border border-app p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 font-semibold tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

/* ── Price history chart ─────────────────────────────────────────────────── */
const RANGE_OPTIONS = [
  { label: "1D", days: "1" },
  { label: "7D", days: "7" },
  { label: "30D", days: "30" },
  { label: "90D", days: "90" },
  { label: "1Y", days: "365" },
  { label: "Max", days: "max" },
] as const;

function PriceHistoryChart({ coinId, currency }: { coinId: string; currency?: Currency }) {
  const cc = currency?.code ?? "usd";
  const sym = currency?.symbol ?? "$";
  const [range, setRange] = useState<string>("30");
  const [points, setPoints] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/crypto/history/${encodeURIComponent(coinId)}?days=${range}&vs_currency=${cc}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: { prices: [number, number][] }) => {
        setPoints((d.prices ?? []).map(([ts, price]) => ({ timestamp: ts, price })));
        setLoading(false);
      })
      .catch((e) => { setError((e as Error).message); setLoading(false); });
  }, [coinId, range]);

  const W = 560, H = 120;
  const pad = { l: 8, r: 8, t: 8, b: 20 };
  const w = W - pad.l - pad.r;
  const h = H - pad.t - pad.b;

  const prices = points.map((p) => p.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const rangeP = maxP - minP || 1;
  const positive = prices.length > 1 ? prices[prices.length - 1] >= prices[0] : true;

  let pathD = "";
  let areaD = "";
  if (points.length > 1) {
    const xs = points.map((_, i) => pad.l + (i / (points.length - 1)) * w);
    const ys = points.map((p) => pad.t + h - ((p.price - minP) / rangeP) * h);
    pathD = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x} ${ys[i]}`).join(" ");
    areaD = `${pathD} L${xs[xs.length - 1]} ${pad.t + h} L${xs[0]} ${pad.t + h} Z`;
  }

  const lineColor = positive ? "#22c55e" : "#ef4444";
  const currentPrice = prices[prices.length - 1];
  const startPrice = prices[0];
  const changePct = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0;

  // X-axis labels (first and last)
  const firstDate = points[0] ? new Date(points[0].timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
  const lastDate = points[points.length - 1] ? new Date(points[points.length - 1].timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Price History</h3>
        <div className="flex gap-1">
          {RANGE_OPTIONS.map(({ label, days }) => (
            <button
              key={days}
              type="button"
              onClick={() => setRange(days)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                range === days ? "bg-brand-600 text-white" : "text-muted hover:text-[var(--text)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          ⚠ {error}
        </div>
      ) : points.length > 1 ? (
        <div>
          <div className="mb-2 flex items-baseline gap-3">
            <span className="font-mono text-xl font-bold">{fp(currentPrice, sym)}</span>
            <span className={`text-sm font-semibold ${changePct >= 0 ? "text-green-500" : "text-red-500"}`}>
              {changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}% ({RANGE_OPTIONS.find((r) => r.days === range)?.label})
            </span>
          </div>
          <svg
            width="100%"
            viewBox={`0 0 ${W} ${H}`}
            className="block"
            aria-label="Price history chart"
          >
            {/* Area fill */}
            <defs>
              <linearGradient id="area-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            {areaD && <path d={areaD} fill="url(#area-grad)" />}
            {pathD && <path d={pathD} fill="none" stroke={lineColor} strokeWidth={1.5} strokeLinejoin="round" />}

            {/* X-axis labels */}
            {firstDate && (
              <text x={pad.l} y={H - 4} fontSize={9} fill="currentColor" opacity={0.45}>{firstDate}</text>
            )}
            {lastDate && (
              <text x={W - pad.r} y={H - 4} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.45}>{lastDate}</text>
            )}
          </svg>
        </div>
      ) : (
        <div className="h-32 rounded-xl border border-app bg-[var(--surface-2)] text-center text-xs text-muted flex items-center justify-center">
          No price history available
        </div>
      )}
    </div>
  );
}

/* ── Supply progress bar ─────────────────────────────────────────────────── */
function SupplyBar({
  circulating,
  total,
  maxSupply,
  symbol,
}: {
  circulating: number;
  total: number | null;
  maxSupply: number | null;
  symbol: string;
}) {
  const cap = maxSupply ?? total;
  if (!circulating || !cap) return null;
  const pctCirc = Math.min((circulating / cap) * 100, 100);

  const fmt = (n: number) => {
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
    return n.toLocaleString("en-US");
  };

  return (
    <div className="surface-2 rounded-xl border border-app p-3">
      <div className="mb-1.5 flex justify-between text-xs font-semibold">
        <span className="text-muted">Circulating Supply</span>
        <span>{pctCirc.toFixed(1)}% of {maxSupply ? "max" : "total"}</span>
      </div>
      <svg width="100%" height="8" aria-hidden="true" className="overflow-visible">
        <rect width="100%" height="8" rx="4" fill="var(--surface-2)" />
        <rect width={`${pctCirc}%`} height="8" rx="4" fill="var(--brand-500, #6366f1)" />
      </svg>
      <div className="mt-1.5 flex justify-between text-xs text-muted">
        <span>{fmt(circulating)} {symbol.toUpperCase()}</span>
        <span>{fmt(cap)} {symbol.toUpperCase()}</span>
      </div>
    </div>
  );
}

/* ── Developer stats ─────────────────────────────────────────────────────── */
function DevStats({ data }: { data: DeveloperData }) {
  const hasData = data.stars > 0 || data.forks > 0 || data.commit_count_4_weeks > 0;
  if (!hasData) return null;

  const fmt = (n: number) => n?.toLocaleString("en-US") ?? "—";

  return (
    <div className="surface-2 rounded-xl border border-app p-4">
      <h3 className="mb-3 text-sm font-semibold">⌨ Developer Activity</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        {[
          { label: "GitHub Stars", value: fmt(data.stars) },
          { label: "Forks", value: fmt(data.forks) },
          { label: "Subscribers", value: fmt(data.subscribers) },
          { label: "Commits (4w)", value: fmt(data.commit_count_4_weeks), highlight: data.commit_count_4_weeks > 0 },
          { label: "Open Issues", value: fmt(data.total_issues - data.closed_issues) },
          { label: "PRs Merged", value: fmt(data.pull_requests_merged) },
        ].map(({ label, value, highlight }) => (
          <div key={label}>
            <div className="text-xs text-muted">{label}</div>
            <div className={`font-semibold tabular-nums ${highlight ? "text-green-500" : ""}`}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Coin Modal ──────────────────────────────────────────────────────────── */
export function CoinModal({
  coinId,
  onClose,
  currency,
}: {
  coinId: string;
  onClose: () => void;
  currency?: Currency;
}) {
  const cc = currency?.code ?? "usd";
  const sym = currency?.symbol ?? "$";
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "history" | "developer">("overview");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    setLoading(true);
    setError("");
    setCoin(null);
    setTab("overview");
    fetch(`/api/crypto/coin/${encodeURIComponent(coinId)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => { setCoin(d); setLoading(false); })
      .catch((e) => { setError((e as Error).message); setLoading(false); });
  }, [coinId]);

  const md = coin?.market_data;

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={coin?.name ?? "Coin details"}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />

      {/* Panel */}
      <div className="surface relative z-10 mx-auto flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-app shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-app px-5 py-4">
          {loading ? (
            <div className="h-6 w-48 animate-pulse rounded bg-[var(--surface-2)]" />
          ) : coin ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coin.image.large} alt={coin.name} width={44} height={44} className="rounded-full" />
              <div>
                <h2 className="text-xl font-bold">{coin.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <span className="font-mono uppercase">{coin.symbol}</span>
                  {coin.market_cap_rank && <span>· Rank #{coin.market_cap_rank}</span>}
                  {coin.hashing_algorithm && (
                    <span className="surface-2 rounded-full border border-app px-2 py-0.5 text-xs">{coin.hashing_algorithm}</span>
                  )}
                </div>
              </div>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="ml-2 shrink-0 rounded-lg p-2 text-muted hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Sub-tabs */}
        {coin && (
          <div className="surface-2 flex shrink-0 gap-1 border-b border-app px-5 py-2">
            {(["overview", "history", "developer"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  tab === t ? "bg-brand-600 text-white shadow-sm" : "text-muted hover:text-[var(--text)]"
                }`}
              >
                {t === "overview" ? "📊 Overview" : t === "history" ? "📈 History" : "⌨ Developer"}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-5">
          {loading && (
            <div className="grid place-items-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
              <p className="mt-3 text-sm text-muted">Loading {coinId}…</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              ⚠ Failed to load: {error}
            </div>
          )}

          {coin && md && tab === "overview" && (
            <>
              {/* Price + sparkline */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-3xl font-extrabold tabular-nums">{fp(md.current_price[cc] ?? md.current_price["usd"] ?? 0, sym)}</div>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {[
                      { label: "24h", val: md.price_change_percentage_24h },
                      { label: "7d", val: md.price_change_percentage_7d },
                      { label: "30d", val: md.price_change_percentage_30d },
                      { label: "1y", val: md.price_change_percentage_1y },
                    ].map(({ label, val }) => (
                      <span key={label} className={`text-sm font-semibold ${pc(val)}`}>
                        {label}: {pct(val)}
                      </span>
                    ))}
                  </div>
                </div>
                {md.sparkline_7d?.price?.length ? (
                  <Sparkline data={md.sparkline_7d.price} positive={(md.price_change_percentage_7d ?? 0) >= 0} width={200} height={64} />
                ) : null}
              </div>

              {/* Sentiment bar */}
              {coin.sentiment_votes_up_percentage != null && coin.sentiment_votes_up_percentage > 0 && (
                <div className="surface-2 rounded-xl border border-app p-3">
                  <div className="mb-1.5 flex justify-between text-xs font-semibold">
                    <span className="text-green-500">👍 {coin.sentiment_votes_up_percentage.toFixed(1)}% Bullish</span>
                    <span className="text-red-500">{(100 - coin.sentiment_votes_up_percentage).toFixed(1)}% Bearish 👎</span>
                  </div>
                  <svg width="100%" height="8" aria-hidden="true" className="overflow-visible">
                    <rect width="100%" height="8" rx="4" fill="#fca5a5" />
                    <rect width={`${coin.sentiment_votes_up_percentage}%`} height="8" rx="4" fill="#22c55e" />
                  </svg>
                </div>
              )}

              {/* Supply bar */}
              <SupplyBar
                circulating={md.circulating_supply}
                total={md.total_supply}
                maxSupply={md.max_supply}
                symbol={coin.symbol}
              />

              {/* Market stats */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <StatCard label="Market Cap" value={fl(md.market_cap[cc] ?? md.market_cap["usd"] ?? null, sym)} />
                <StatCard label="Volume 24h" value={fl(md.total_volume[cc] ?? md.total_volume["usd"] ?? null, sym)} />
                <StatCard label="Fully Diluted Val." value={fl(md.fully_diluted_valuation?.[cc] ?? md.fully_diluted_valuation?.["usd"] ?? null, sym)} />
                <StatCard
                  label="Circulating Supply"
                  value={md.circulating_supply ? `${(md.circulating_supply / 1e6).toFixed(2)}M ${coin.symbol.toUpperCase()}` : "—"}
                />
                <StatCard label="Total Supply" value={md.total_supply ? `${(md.total_supply / 1e6).toFixed(2)}M` : "∞"} />
                <StatCard label="Max Supply" value={md.max_supply ? `${(md.max_supply / 1e6).toFixed(2)}M` : "∞"} />
              </div>

              {/* ATH / ATL */}
              <div className="grid grid-cols-2 gap-2">
                <div className="surface-2 rounded-xl border border-app p-3">
                  <div className="text-xs font-semibold text-green-500">All-Time High</div>
                  <div className="mt-1 font-bold">{fp(md.ath[cc] ?? md.ath["usd"] ?? 0, sym)}</div>
                  <div className={`text-xs font-semibold ${pc(md.ath_change_percentage[cc] ?? md.ath_change_percentage["usd"])}`}>{pct(md.ath_change_percentage[cc] ?? md.ath_change_percentage["usd"])} from ATH</div>
                  <div className="mt-0.5 text-xs text-muted">{new Date(md.ath_date[cc] ?? md.ath_date["usd"]).toLocaleDateString()}</div>
                </div>
                <div className="surface-2 rounded-xl border border-app p-3">
                  <div className="text-xs font-semibold text-red-500">All-Time Low</div>
                  <div className="mt-1 font-bold">{fp(md.atl[cc] ?? md.atl["usd"] ?? 0, sym)}</div>
                  <div className={`text-xs font-semibold ${pc(md.atl_change_percentage[cc] ?? md.atl_change_percentage["usd"])}`}>{pct(md.atl_change_percentage[cc] ?? md.atl_change_percentage["usd"])} from ATL</div>
                  <div className="mt-0.5 text-xs text-muted">{new Date(md.atl_date[cc] ?? md.atl_date["usd"]).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Community data */}
              {(coin.community_data?.twitter_followers > 0 || coin.community_data?.reddit_subscribers > 0) && (
                <div className="surface-2 rounded-xl border border-app p-4">
                  <h3 className="mb-3 text-sm font-semibold">Community</h3>
                  <div className="flex flex-wrap gap-6 text-sm">
                    {coin.community_data.twitter_followers > 0 && (
                      <div>
                        <div className="text-xs text-muted">Twitter</div>
                        <div className="font-semibold">{(coin.community_data.twitter_followers / 1000).toFixed(0)}K followers</div>
                      </div>
                    )}
                    {coin.community_data.reddit_subscribers > 0 && (
                      <div>
                        <div className="text-xs text-muted">Reddit</div>
                        <div className="font-semibold">{(coin.community_data.reddit_subscribers / 1000).toFixed(0)}K subscribers</div>
                      </div>
                    )}
                    {coin.community_data.reddit_average_posts_48h > 0 && (
                      <div>
                        <div className="text-xs text-muted">Posts/48h</div>
                        <div className="font-semibold">{coin.community_data.reddit_average_posts_48h.toFixed(0)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Genesis + algorithm */}
              {(coin.genesis_date || coin.hashing_algorithm) && (
                <div className="flex flex-wrap gap-4 text-sm">
                  {coin.genesis_date && (
                    <div className="surface-2 rounded-xl border border-app px-4 py-2">
                      <span className="text-muted">Genesis date: </span>
                      <span className="font-semibold">{coin.genesis_date}</span>
                    </div>
                  )}
                  {coin.hashing_algorithm && (
                    <div className="surface-2 rounded-xl border border-app px-4 py-2">
                      <span className="text-muted">Algorithm: </span>
                      <span className="font-semibold">{coin.hashing_algorithm}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Categories */}
              {coin.categories?.filter(Boolean).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {coin.categories.filter(Boolean).slice(0, 10).map((cat) => (
                    <span key={cat} className="surface-2 rounded-full border border-app px-3 py-1 text-xs text-muted">{cat}</span>
                  ))}
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-2">
                {coin.links?.homepage?.[0] && (
                  <a href={coin.links.homepage[0]} target="_blank" rel="noopener noreferrer" className="surface-2 rounded-lg border border-app px-3 py-1.5 text-xs font-medium text-muted transition hover:border-brand-400 hover:text-brand-600">🌐 Website</a>
                )}
                {coin.links?.twitter_screen_name && (
                  <a href={`https://twitter.com/${coin.links.twitter_screen_name}`} target="_blank" rel="noopener noreferrer" className="surface-2 rounded-lg border border-app px-3 py-1.5 text-xs font-medium text-muted transition hover:border-brand-400 hover:text-brand-600">𝕏 Twitter</a>
                )}
                {coin.links?.subreddit_url && (
                  <a href={coin.links.subreddit_url} target="_blank" rel="noopener noreferrer" className="surface-2 rounded-lg border border-app px-3 py-1.5 text-xs font-medium text-muted transition hover:border-brand-400 hover:text-brand-600">🟠 Reddit</a>
                )}
                {coin.links?.repos_url?.github?.[0] && (
                  <a href={coin.links.repos_url.github[0]} target="_blank" rel="noopener noreferrer" className="surface-2 rounded-lg border border-app px-3 py-1.5 text-xs font-medium text-muted transition hover:border-brand-400 hover:text-brand-600">⌨ GitHub</a>
                )}
                {coin.links?.blockchain_site?.filter(Boolean).slice(0, 2).map((url) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="surface-2 rounded-lg border border-app px-3 py-1.5 text-xs font-medium text-muted transition hover:border-brand-400 hover:text-brand-600">🔗 Explorer</a>
                ))}
              </div>

              {/* Description */}
              {coin.description?.en && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">About {coin.name}</h3>
                  <p
                    className="text-sm text-muted leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: coin.description.en
                        .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" class="text-brand-600 hover:underline" ')
                        .replace(/<[^>]*>/g, (tag) => tag.startsWith("<a ") || tag === "</a>" ? tag : "")
                        .split("\r\n\r\n").slice(0, 3).join("\n\n"),
                    }}
                  />
                </div>
              )}
            </>
          )}

          {coin && tab === "history" && (
            <PriceHistoryChart coinId={coinId} currency={currency} />
          )}

          {coin && tab === "developer" && (
            <>
              {coin.developer_data ? (
                <DevStats data={coin.developer_data} />
              ) : (
                <p className="text-sm text-muted">No developer data available for this coin.</p>
              )}
              {/* GitHub repos */}
              {coin.links?.repos_url?.github?.filter(Boolean).length > 0 && (
                <div className="surface-2 rounded-xl border border-app p-4">
                  <h3 className="mb-2 text-sm font-semibold">GitHub Repositories</h3>
                  <div className="space-y-1">
                    {coin.links.repos_url.github.filter(Boolean).map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-brand-600 hover:underline"
                      >
                        ⌨ {url.replace("https://github.com/", "")}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
