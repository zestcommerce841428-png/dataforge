"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkline } from "./sparkline";
import { CoinModal } from "./coin-modal";
import { useWatchlist } from "./watchlist-tab";
import type { Currency } from "./dashboard";

export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
  ath: number;
  ath_change_percentage: number;
  circulating_supply: number;
  max_supply: number | null;
}

/* ── Formatters (exported for use in other tabs) ────────────────────────── */
export const fmtPrice = (p: number, sym = "$") => {
  if (!p && p !== 0) return "—";
  if (p >= 1000)
    return `${sym}${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (p >= 1) return `${sym}${p.toFixed(4)}`;
  if (p >= 0.0001) return `${sym}${p.toFixed(6)}`;
  return `${sym}${p.toFixed(10)}`;
};

export const fmtLarge = (n: number | null | undefined, sym = "$") => {
  if (!n) return "—";
  if (n >= 1e12) return `${sym}${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${sym}${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${sym}${(n / 1e6).toFixed(2)}M`;
  return `${sym}${n.toLocaleString("en-US")}`;
};

export const pct = (n: number | null | undefined) => {
  if (n == null || isNaN(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
};

export const pctColor = (n: number | null | undefined) =>
  n == null || isNaN(n) ? "text-muted" : n >= 0 ? "text-green-500" : "text-red-500";

/* ── Market cap tiers ─────────────────────────────────────────────────────── */
type CapTier = "all" | "large" | "mid" | "small";
const CAP_LABELS: Record<CapTier, string> = {
  all: "All caps",
  large: "Large (>$10B)",
  mid: "Mid ($1B–$10B)",
  small: "Small (<$1B)",
};

function capTierOf(mc: number): CapTier {
  if (mc >= 10e9) return "large";
  if (mc >= 1e9) return "mid";
  return "small";
}

/* ── Sector / category keywords ──────────────────────────────────────────── */
type Sector = "all" | "defi" | "layer1" | "layer2" | "nft" | "meme" | "exchange" | "privacy";
const SECTOR_LABELS: Record<Sector, string> = {
  all: "All sectors",
  defi: "DeFi",
  layer1: "Layer 1",
  layer2: "Layer 2",
  nft: "NFT/Gaming",
  meme: "Meme",
  exchange: "Exchange",
  privacy: "Privacy",
};

const SECTOR_SYMBOLS: Record<Exclude<Sector, "all">, string[]> = {
  defi: ["UNI","AAVE","LINK","MKR","COMP","CRV","SUSHI","YFI","SNX","BAL","1INCH","LIDO","LDO","CAKE","DYDX"],
  layer1: ["BTC","ETH","SOL","ADA","AVAX","DOT","ATOM","NEAR","ALGO","FTM","ONE","EGLD","HBAR","XTZ","ICP","SUI","APT","SEI","INJ"],
  layer2: ["MATIC","ARB","OP","IMX","METIS","BOBA","ZK","STRK","MANTA"],
  nft: ["AXS","MANA","SAND","ENJ","GALA","ILV","FLOW","THETA","BLUR","APE","PIXEL"],
  meme: ["DOGE","SHIB","PEPE","FLOKI","BONK","WIF","BOME","BRETT"],
  exchange: ["BNB","OKB","KCS","HT","CRO","GT","MX"],
  privacy: ["XMR","ZEC","DASH","SCRT","ROSE"],
};

function matchesSector(coin: CoinMarket, sector: Sector): boolean {
  if (sector === "all") return true;
  const syms = SECTOR_SYMBOLS[sector];
  return syms.includes(coin.symbol.toUpperCase());
}

/* ── Sort key ────────────────────────────────────────────────────────────── */
type SortKey = "rank" | "price" | "change24h" | "change7d" | "marketcap" | "volume" | "ath";
type ViewMode = "table" | "grid";

/* ── Skeletons ──────────────────────────────────────────────────────────── */
const SKEL_WIDTHS = ["w-10","w-40","w-24","w-16","w-16","w-24","w-24","w-20","w-24"];
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-app/50">
      {SKEL_WIDTHS.map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`h-4 rounded bg-[var(--surface-2)] ${w}`} />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="surface animate-pulse rounded-2xl border p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[var(--surface-2)]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded bg-[var(--surface-2)]" />
          <div className="h-3 w-12 rounded bg-[var(--surface-2)]" />
        </div>
      </div>
      <div className="mt-3 h-6 w-32 rounded bg-[var(--surface-2)]" />
      <div className="mt-2 h-3 w-20 rounded bg-[var(--surface-2)]" />
      <div className="mt-3 h-10 w-full rounded bg-[var(--surface-2)]" />
    </div>
  );
}

/* ── Coin grid card ─────────────────────────────────────────────────────── */
function CoinGridCard({
  coin,
  watched,
  onToggleWatch,
  onClick,
}: {
  coin: CoinMarket;
  watched: boolean;
  onToggleWatch: () => void;
  onClick: () => void;
}) {
  const ch = coin.price_change_percentage_24h ?? 0;
  return (
    <div className="surface group relative rounded-2xl border shadow-sm transition hover:border-brand-400 hover:shadow-md">
      <button
        type="button"
        onClick={onToggleWatch}
        className="absolute right-3 top-3 z-10 rounded-full p-1 text-lg leading-none transition hover:scale-110"
        aria-label={watched ? `Remove ${coin.name} from watchlist` : `Add ${coin.name} to watchlist`}
      >
        {watched ? "★" : "☆"}
      </button>
      <button
        type="button"
        onClick={onClick}
        className="w-full p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-2xl"
        aria-label={`View ${coin.name} details`}
      >
        <div className="flex items-center gap-3 pr-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coin.image} alt={coin.name} width={40} height={40} className="rounded-full" loading="lazy" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{coin.name}</div>
            <div className="text-xs uppercase text-muted">
              {coin.symbol}{coin.market_cap_rank ? ` · #${coin.market_cap_rank}` : ""}
            </div>
          </div>
        </div>
        <div className="mt-3 font-mono text-lg font-bold">{fmtPrice(coin.current_price)}</div>
        <div className={`mt-0.5 text-sm font-semibold ${pctColor(ch)}`}>{pct(ch)} 24h</div>
        {coin.sparkline_in_7d?.price?.length ? (
          <div className="mt-2">
            <Sparkline data={coin.sparkline_in_7d.price} positive={ch >= 0} width={180} height={44} />
          </div>
        ) : null}
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>{fmtLarge(coin.market_cap)}</span>
          <span>Vol {fmtLarge(coin.total_volume)}</span>
        </div>
      </button>
    </div>
  );
}

/* ── SortTh helper ──────────────────────────────────────────────────────── */
function SortTh({
  k, label, sort, sortAsc, onSort,
}: {
  k: SortKey; label: string; sort: SortKey; sortAsc: boolean; onSort: (k: SortKey) => void;
}) {
  const ariaSort: "ascending" | "descending" | "none" =
    sort === k ? (sortAsc ? "ascending" : "descending") : "none";
  return (
    <th
      className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-muted hover:text-[var(--text)]"
      onClick={() => onSort(k)}
      aria-sort={ariaSort}
    >
      {label} {sort === k ? (sortAsc ? " ↑" : " ↓") : ""}
    </th>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */
export function MarketsTab({ currency }: { currency: Currency }) {
  const [coins, setCoins] = useState<CoinMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<CoinMarket[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [view, setView] = useState<ViewMode>("table");
  const [sort, setSort] = useState<SortKey>("rank");
  const [sortAsc, setSortAsc] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [capTier, setCapTier] = useState<CapTier>("all");
  const [sector, setSector] = useState<Sector>("all");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const { toggle, isWatched } = useWatchlist();

  const fetchPage = useCallback(async (p: number, append: boolean) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/crypto/markets?per_page=250&page=${p}&sparkline=true&vs_currency=${currency.code}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }
      const data: CoinMarket[] = await res.json();
      if (data.length < 250) setHasMore(false);
      setCoins((prev) => (append ? [...prev, ...data] : data));
      setLastUpdated(new Date());
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setCoins([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency.code]);

  // Auto-refresh
  useEffect(() => {
    refreshTimer.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/crypto/markets?per_page=250&page=1&sparkline=false&vs_currency=${currency.code}`
        );
        if (!res.ok) return;
        const fresh: CoinMarket[] = await res.json();
        const map = new Map(fresh.map((c) => [c.id, c]));
        setCoins((prev) =>
          prev.map((c) => {
            const u = map.get(c.id);
            if (!u) return c;
            return { ...c, current_price: u.current_price, price_change_percentage_24h: u.price_change_percentage_24h, total_volume: u.total_volume, market_cap: u.market_cap };
          })
        );
        setLastUpdated(new Date());
      } catch { /* silent */ }
    }, 60000);
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!search.trim()) { setSearchResults(null); return; }
    const q = search.trim().toLowerCase();
    const clientHits = coins.filter(
      (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    );
    if (clientHits.length >= 5) { setSearchResults(clientHits); return; }
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/crypto/search?q=${encodeURIComponent(search.trim())}`);
        const { coins: hits } = (await res.json()) as {
          coins: Array<{ id: string; name: string; symbol: string; thumb: string; market_cap_rank: number }>;
        };
        if (!hits?.length) { setSearchResults(clientHits.length ? clientHits : []); setSearchLoading(false); return; }
        const ids = hits.map((c) => c.id).join(",");
        const priceRes = await fetch(`/api/crypto/markets?ids=${ids}&sparkline=true&per_page=30`);
        const priceData: CoinMarket[] = priceRes.ok ? await priceRes.json() : [];
        const priceMap = new Map(priceData.map((c) => [c.id, c]));
        const merged = hits.map(
          (h) => priceMap.get(h.id) ?? ({ id: h.id, name: h.name, symbol: h.symbol, image: h.thumb, current_price: 0, market_cap: 0, market_cap_rank: h.market_cap_rank ?? 99999, total_volume: 0, price_change_percentage_24h: 0 } as CoinMarket)
        );
        setSearchResults(merged);
      } catch {
        setSearchResults(clientHits.length ? clientHits : []);
      }
      setSearchLoading(false);
    }, 400);
  }, [search, coins]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPage(next, true);
  };

  const handleSort = (key: SortKey) => {
    if (sort === key) setSortAsc((a) => !a);
    else { setSort(key); setSortAsc(key === "rank"); }
  };

  const base = (searchResults ?? coins).filter((c) => {
    if (capTier !== "all" && capTierOf(c.market_cap) !== capTier) return false;
    if (!matchesSector(c, sector)) return false;
    return true;
  });

  const displayed = base.slice().sort((a, b) => {
    let v = 0;
    switch (sort) {
      case "rank": v = (a.market_cap_rank ?? 99999) - (b.market_cap_rank ?? 99999); break;
      case "price": v = b.current_price - a.current_price; break;
      case "change24h": v = (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0); break;
      case "change7d": v = (b.price_change_percentage_7d_in_currency ?? 0) - (a.price_change_percentage_7d_in_currency ?? 0); break;
      case "marketcap": v = b.market_cap - a.market_cap; break;
      case "volume": v = b.total_volume - a.total_volume; break;
      case "ath": v = (b.ath_change_percentage ?? 0) - (a.ath_change_percentage ?? 0); break;
    }
    return sortAsc ? v : -v;
  });

  const sortProps = { sort, sortAsc, onSort: handleSort };

  return (
    <div>
      {/* Toolbar row 1: search + view */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">🔍</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search any coin by name or symbol…"
            aria-label="Search coins"
            className="surface-2 w-full rounded-xl border border-app py-2 pl-9 pr-8 text-sm outline-none focus:border-brand-400"
          />
          {searchLoading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="block h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </span>
          )}
        </div>

        <div className="surface-2 flex items-center gap-0.5 rounded-xl border border-app p-1">
          {(["table", "grid"] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${view === v ? "bg-brand-600 text-white shadow-sm" : "text-muted hover:text-[var(--text)]"}`}
            >
              {v === "table" ? "⊟ Table" : "⊞ Grid"}
            </button>
          ))}
        </div>

        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span className="block h-2 w-2 animate-pulse rounded-full bg-green-500" />
            {lastUpdated.toLocaleTimeString()} · 60s refresh
          </div>
        )}
      </div>

      {/* Toolbar row 2: filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Filter:</span>
        {/* Cap tier */}
        <div className="flex flex-wrap gap-1">
          {(Object.keys(CAP_LABELS) as CapTier[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setCapTier(t)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                capTier === t ? "bg-brand-600 text-white" : "surface-2 border border-app text-muted hover:text-[var(--text)]"
              }`}
            >
              {CAP_LABELS[t]}
            </button>
          ))}
        </div>

        <span className="text-xs text-muted hidden sm:block">|</span>

        {/* Sector */}
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value as Sector)}
          aria-label="Filter by sector"
          className="surface-2 rounded-xl border border-app px-3 py-1.5 text-xs font-semibold outline-none focus:border-brand-400"
        >
          {(Object.keys(SECTOR_LABELS) as Sector[]).map((s) => (
            <option key={s} value={s}>{SECTOR_LABELS[s]}</option>
          ))}
        </select>

        {(capTier !== "all" || sector !== "all") && (
          <button
            type="button"
            onClick={() => { setCapTier("all"); setSector("all"); }}
            className="rounded-full px-3 py-1 text-xs font-semibold text-muted transition hover:text-red-500"
          >
            ✕ Clear
          </button>
        )}

        <span className="ml-auto text-xs text-muted">{displayed.length} coins</span>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          <span>⚠ {error}</span>
          <button
            type="button"
            onClick={() => { setError(""); fetchPage(1, false); }}
            className="shrink-0 rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold transition hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && search && searchResults?.length === 0 && (
        <div className="mb-4 rounded-xl border border-app p-8 text-center text-sm text-muted">
          No coins found for &ldquo;{search}&rdquo;
        </div>
      )}

      {/* Table view */}
      {view === "table" && (
        <div className="overflow-auto rounded-2xl border border-app">
          <table className="w-full text-sm">
            <thead className="surface-2 sticky top-0 z-10 border-b border-app">
              <tr>
                <th className="px-3 py-3 text-center text-xs font-semibold text-muted">★</th>
                <SortTh k="rank" label="#" {...sortProps} />
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted">Coin</th>
                <SortTh k="price" label="Price" {...sortProps} />
                <SortTh k="change24h" label="24h %" {...sortProps} />
                <SortTh k="change7d" label="7d %" {...sortProps} />
                <SortTh k="marketcap" label="Market Cap" {...sortProps} />
                <SortTh k="volume" label="Volume 24h" {...sortProps} />
                <SortTh k="ath" label="ATH %" {...sortProps} />
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted">7d Chart</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 12 }).map((_, i) => <SkeletonRow key={i} />)
                : displayed.map((c) => {
                    const watched = isWatched(c.id);
                    return (
                      <tr
                        key={c.id}
                        className="cursor-pointer border-b border-app/40 transition hover:bg-[var(--surface-2)]"
                        onClick={() => setSelectedCoin(c.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setSelectedCoin(c.id)}
                        aria-label={`View ${c.name} details`}
                      >
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggle({ id: c.id, name: c.name, symbol: c.symbol, image: c.image });
                            }}
                            className={`text-base leading-none transition hover:scale-125 ${watched ? "text-yellow-400" : "text-muted"}`}
                            aria-label={watched ? `Remove ${c.name} from watchlist` : `Add ${c.name} to watchlist`}
                          >
                            {watched ? "★" : "☆"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-muted">{c.market_cap_rank ?? "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={c.image} alt={c.name} width={28} height={28} className="rounded-full" loading="lazy" />
                            <div>
                              <div className="font-semibold">{c.name}</div>
                              <div className="text-xs uppercase text-muted">{c.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono font-semibold">
                          {fmtPrice(c.current_price, currency.symbol)}
                        </td>
                        <td className={`px-4 py-3 font-semibold tabular-nums ${pctColor(c.price_change_percentage_24h)}`}>
                          {pct(c.price_change_percentage_24h)}
                        </td>
                        <td className={`px-4 py-3 font-semibold tabular-nums ${pctColor(c.price_change_percentage_7d_in_currency)}`}>
                          {pct(c.price_change_percentage_7d_in_currency)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted">{fmtLarge(c.market_cap, currency.symbol)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted">{fmtLarge(c.total_volume, currency.symbol)}</td>
                        <td className={`whitespace-nowrap px-4 py-3 font-semibold tabular-nums ${pctColor(c.ath_change_percentage)}`}>
                          {c.ath_change_percentage != null ? pct(c.ath_change_percentage) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {c.sparkline_in_7d?.price?.length ? (
                            <Sparkline data={c.sparkline_in_7d.price} positive={(c.price_change_percentage_24h ?? 0) >= 0} width={100} height={36} />
                          ) : (
                            <span className="text-xs text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 16 }).map((_, i) => <SkeletonCard key={i} />)
            : displayed.map((c) => (
                <CoinGridCard
                  key={c.id}
                  coin={c}
                  watched={isWatched(c.id)}
                  onToggleWatch={() => toggle({ id: c.id, name: c.name, symbol: c.symbol, image: c.image })}
                  onClick={() => setSelectedCoin(c.id)}
                />
              ))}
        </div>
      )}

      {/* Load more */}
      {!loading && !search && capTier === "all" && sector === "all" && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-sm text-muted">
            {coins.length.toLocaleString()} coins loaded{hasMore ? " · more available" : " · all loaded"}
          </p>
          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-brand-700 disabled:opacity-60"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Loading page {page + 1}…
                </span>
              ) : (
                `Load next 250 coins (page ${page + 1})`
              )}
            </button>
          )}
        </div>
      )}

      {selectedCoin && <CoinModal coinId={selectedCoin} onClose={() => setSelectedCoin(null)} />}
    </div>
  );
}
