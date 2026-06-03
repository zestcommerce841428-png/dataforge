"use client";

import { useEffect, useState } from "react";
import { Sparkline } from "./sparkline";

interface MarketData {
  current_price: { usd: number };
  market_cap: { usd: number };
  total_volume: { usd: number };
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  price_change_percentage_1y: number;
  ath: { usd: number };
  ath_change_percentage: { usd: number };
  ath_date: { usd: string };
  atl: { usd: number };
  atl_change_percentage: { usd: number };
  atl_date: { usd: string };
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  fully_diluted_valuation: { usd: number | null };
  sparkline_7d: { price: number[] };
  market_cap_rank: number;
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
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
  categories: string[];
  hashing_algorithm: string | null;
  genesis_date: string | null;
}

const fp = (p: number) => {
  if (!p && p !== 0) return "—";
  if (p >= 1000)
    return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (p >= 1) return `$${p.toFixed(4)}`;
  if (p >= 0.0001) return `$${p.toFixed(6)}`;
  return `$${p.toFixed(10)}`;
};

const fl = (n: number | null | undefined) => {
  if (!n) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString("en-US")}`;
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

export function CoinModal({
  coinId,
  onClose,
}: {
  coinId: string;
  onClose: () => void;
}) {
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    setLoading(true);
    setError("");
    setCoin(null);
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
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="surface relative z-10 mx-auto flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-app shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-app px-5 py-4">
          {loading ? (
            <div className="h-6 w-48 animate-pulse rounded bg-[var(--surface-2)]" />
          ) : coin ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coin.image.large}
                alt={coin.name}
                width={44}
                height={44}
                className="rounded-full"
              />
              <div>
                <h2 className="text-xl font-bold">{coin.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <span className="uppercase font-mono">{coin.symbol}</span>
                  {coin.market_cap_rank && (
                    <span>· Rank #{coin.market_cap_rank}</span>
                  )}
                  {coin.hashing_algorithm && (
                    <span className="surface-2 rounded-full border border-app px-2 py-0.5 text-xs">
                      {coin.hashing_algorithm}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : null}
          <button
            onClick={onClose}
            className="ml-2 shrink-0 rounded-lg p-2 text-muted hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

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

          {coin && md && (
            <>
              {/* Price + sparkline */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-3xl font-extrabold tabular-nums">
                    {fp(md.current_price.usd)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {[
                      { label: "24h", val: md.price_change_percentage_24h },
                      { label: "7d", val: md.price_change_percentage_7d },
                      { label: "30d", val: md.price_change_percentage_30d },
                      { label: "1y", val: md.price_change_percentage_1y },
                    ].map(({ label, val }) => (
                      <span
                        key={label}
                        className={`text-sm font-semibold ${pc(val)}`}
                      >
                        {label}: {pct(val)}
                      </span>
                    ))}
                  </div>
                </div>
                {md.sparkline_7d?.price?.length ? (
                  <Sparkline
                    data={md.sparkline_7d.price}
                    positive={(md.price_change_percentage_7d ?? 0) >= 0}
                    width={200}
                    height={64}
                  />
                ) : null}
              </div>

              {/* Sentiment bar */}
              {coin.sentiment_votes_up_percentage != null &&
                coin.sentiment_votes_up_percentage > 0 && (
                  <div className="surface-2 rounded-xl border border-app p-3">
                    <div className="mb-1.5 flex justify-between text-xs font-semibold">
                      <span className="text-green-500">
                        👍 {coin.sentiment_votes_up_percentage.toFixed(1)}% Bullish
                      </span>
                      <span className="text-red-500">
                        {(100 - coin.sentiment_votes_up_percentage).toFixed(1)}% Bearish 👎
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-red-200 dark:bg-red-900/50">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{
                          width: `${coin.sentiment_votes_up_percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

              {/* Market stats */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <StatCard label="Market Cap" value={fl(md.market_cap.usd)} />
                <StatCard label="Volume 24h" value={fl(md.total_volume.usd)} />
                <StatCard
                  label="Fully Diluted Val."
                  value={fl(md.fully_diluted_valuation?.usd ?? null)}
                />
                <StatCard
                  label="Circulating Supply"
                  value={
                    md.circulating_supply
                      ? `${(md.circulating_supply / 1e6).toFixed(2)}M ${coin.symbol.toUpperCase()}`
                      : "—"
                  }
                />
                <StatCard
                  label="Total Supply"
                  value={
                    md.total_supply
                      ? `${(md.total_supply / 1e6).toFixed(2)}M`
                      : "∞"
                  }
                />
                <StatCard
                  label="Max Supply"
                  value={
                    md.max_supply
                      ? `${(md.max_supply / 1e6).toFixed(2)}M`
                      : "∞"
                  }
                />
              </div>

              {/* ATH / ATL */}
              <div className="grid grid-cols-2 gap-2">
                <div className="surface-2 rounded-xl border border-app p-3">
                  <div className="text-xs font-semibold text-green-500">
                    All-Time High
                  </div>
                  <div className="mt-1 font-bold">{fp(md.ath.usd)}</div>
                  <div className={`text-xs font-semibold ${pc(md.ath_change_percentage.usd)}`}>
                    {pct(md.ath_change_percentage.usd)} from ATH
                  </div>
                  <div className="mt-0.5 text-xs text-muted">
                    {new Date(md.ath_date.usd).toLocaleDateString()}
                  </div>
                </div>
                <div className="surface-2 rounded-xl border border-app p-3">
                  <div className="text-xs font-semibold text-red-500">
                    All-Time Low
                  </div>
                  <div className="mt-1 font-bold">{fp(md.atl.usd)}</div>
                  <div className={`text-xs font-semibold ${pc(md.atl_change_percentage.usd)}`}>
                    {pct(md.atl_change_percentage.usd)} from ATL
                  </div>
                  <div className="mt-0.5 text-xs text-muted">
                    {new Date(md.atl_date.usd).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Community data */}
              {(coin.community_data?.twitter_followers > 0 ||
                coin.community_data?.reddit_subscribers > 0) && (
                <div className="surface-2 rounded-xl border border-app p-4">
                  <h3 className="mb-3 text-sm font-semibold">Community</h3>
                  <div className="flex flex-wrap gap-6 text-sm">
                    {coin.community_data.twitter_followers > 0 && (
                      <div>
                        <div className="text-xs text-muted">Twitter</div>
                        <div className="font-semibold">
                          {(coin.community_data.twitter_followers / 1000).toFixed(0)}K followers
                        </div>
                      </div>
                    )}
                    {coin.community_data.reddit_subscribers > 0 && (
                      <div>
                        <div className="text-xs text-muted">Reddit</div>
                        <div className="font-semibold">
                          {(coin.community_data.reddit_subscribers / 1000).toFixed(0)}K subscribers
                        </div>
                      </div>
                    )}
                    {coin.community_data.reddit_average_posts_48h > 0 && (
                      <div>
                        <div className="text-xs text-muted">Posts/48h</div>
                        <div className="font-semibold">
                          {coin.community_data.reddit_average_posts_48h.toFixed(0)}
                        </div>
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
                    <span
                      key={cat}
                      className="surface-2 rounded-full border border-app px-3 py-1 text-xs text-muted"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-2">
                {coin.links?.homepage?.[0] && (
                  <a
                    href={coin.links.homepage[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="surface-2 rounded-lg border border-app px-3 py-1.5 text-xs font-medium text-muted transition hover:border-brand-400 hover:text-brand-600"
                  >
                    🌐 Website
                  </a>
                )}
                {coin.links?.twitter_screen_name && (
                  <a
                    href={`https://twitter.com/${coin.links.twitter_screen_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="surface-2 rounded-lg border border-app px-3 py-1.5 text-xs font-medium text-muted transition hover:border-brand-400 hover:text-brand-600"
                  >
                    𝕏 Twitter
                  </a>
                )}
                {coin.links?.subreddit_url && (
                  <a
                    href={coin.links.subreddit_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="surface-2 rounded-lg border border-app px-3 py-1.5 text-xs font-medium text-muted transition hover:border-brand-400 hover:text-brand-600"
                  >
                    🟠 Reddit
                  </a>
                )}
                {coin.links?.repos_url?.github?.[0] && (
                  <a
                    href={coin.links.repos_url.github[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="surface-2 rounded-lg border border-app px-3 py-1.5 text-xs font-medium text-muted transition hover:border-brand-400 hover:text-brand-600"
                  >
                    ⌨ GitHub
                  </a>
                )}
                {coin.links?.blockchain_site?.filter(Boolean)?.[0] && (
                  <a
                    href={coin.links.blockchain_site.filter(Boolean)[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="surface-2 rounded-lg border border-app px-3 py-1.5 text-xs font-medium text-muted transition hover:border-brand-400 hover:text-brand-600"
                  >
                    🔗 Explorer
                  </a>
                )}
              </div>

              {/* Description */}
              {coin.description?.en && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    About {coin.name}
                  </h3>
                  <p
                    className="text-sm text-muted leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: coin.description.en
                        .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" class="text-brand-600 hover:underline" ')
                        .replace(/<[^>]*>/g, (tag) =>
                          tag.startsWith("<a ") || tag === "</a>" ? tag : ""
                        )
                        .split("\r\n\r\n")
                        .slice(0, 3)
                        .join("\n\n"),
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
