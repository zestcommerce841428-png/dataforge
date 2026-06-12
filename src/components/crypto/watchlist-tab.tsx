"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkline } from "./sparkline";
import { CoinModal } from "./coin-modal";
import { fmtPrice, fmtLarge, pct, pctColor } from "./markets-tab";
import type { Currency } from "./dashboard";

/* ── localStorage helpers ────────────────────────────────────────────────── */
export const WL_KEY = "df-crypto-watchlist";

export interface WatchlistEntry {
  id: string;
  name: string;
  symbol: string;
  image: string;
}

export function loadWatchlist(): WatchlistEntry[] {
  try {
    return JSON.parse(localStorage.getItem(WL_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveWatchlist(list: WatchlistEntry[]) {
  localStorage.setItem(WL_KEY, JSON.stringify(list));
}

/* ── Shared hook (re-used in markets tab for the ❤️ button) ─────────────── */
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);

  useEffect(() => { setWatchlist(loadWatchlist()); }, []);

  // Listen for cross-component changes via a custom event
  useEffect(() => {
    const handler = () => setWatchlist(loadWatchlist());
    window.addEventListener("wl-update", handler);
    return () => window.removeEventListener("wl-update", handler);
  }, []);

  const dispatch = () => window.dispatchEvent(new Event("wl-update"));

  const add = useCallback((entry: WatchlistEntry) => {
    const current = loadWatchlist();
    if (current.some((x) => x.id === entry.id)) return;
    const next = [...current, entry];
    saveWatchlist(next);
    setWatchlist(next);
    dispatch();
  }, []);

  const remove = useCallback((id: string) => {
    const next = loadWatchlist().filter((x) => x.id !== id);
    saveWatchlist(next);
    setWatchlist(next);
    dispatch();
  }, []);

  const toggle = useCallback((entry: WatchlistEntry) => {
    const current = loadWatchlist();
    const exists = current.some((x) => x.id === entry.id);
    const next = exists ? current.filter((x) => x.id !== entry.id) : [...current, entry];
    saveWatchlist(next);
    setWatchlist(next);
    dispatch();
  }, []);

  const isWatched = useCallback(
    (id: string) => watchlist.some((x) => x.id === id),
    [watchlist]
  );

  return { watchlist, add, remove, toggle, isWatched };
}

/* ── Live price data ─────────────────────────────────────────────────────── */
interface LiveCoin {
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

/* ── Search result ───────────────────────────────────────────────────────── */
interface SearchCoin {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
}

/* ── WatchlistTab ────────────────────────────────────────────────────────── */
export function WatchlistTab({ currency }: { currency: Currency }) {
  const { watchlist, add, remove, isWatched } = useWatchlist();
  const [live, setLive] = useState<Map<string, LiveCoin>>(new Map());
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchCoin[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDropdownOpen = searchResults.length > 0 && searchQuery.length > 0;
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Fetch live prices for watchlisted coins */
  const fetchPrices = useCallback(async (ids: string[]) => {
    if (!ids.length) { setLive(new Map()); return; }
    setLiveLoading(true);
    try {
      const res = await fetch(
        `/api/crypto/markets?ids=${ids.join(",")}&sparkline=true&per_page=250&vs_currency=${currency.code}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: LiveCoin[] = await res.json();
      setLive(new Map(data.map((c) => [c.id, c])));
      setLiveError("");
    } catch (e) {
      setLiveError((e as Error).message);
    } finally {
      setLiveLoading(false);
    }
  }, [currency.code]);

  useEffect(() => {
    if (!watchlist.length) { setLive(new Map()); return; }
    fetchPrices(watchlist.map((w) => w.id));
    refreshTimer.current = setInterval(
      () => fetchPrices(watchlist.map((w) => w.id)),
      60000
    );
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, [watchlist, fetchPrices]);

  /* Debounced coin search */
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/crypto/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const { coins } = await res.json() as { coins: SearchCoin[] };
        setSearchResults((coins ?? []).slice(0, 8));
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, [searchQuery]);

  /* CSV export */
  const exportCSV = () => {
    const rows = [
      ["ID","Name","Symbol","Price","24h %","Market Cap","Volume"],
      ...watchlist.map((w) => {
        const l = live.get(w.id);
        return [
          w.id, w.name, w.symbol.toUpperCase(),
          l?.current_price ?? "",
          l?.price_change_percentage_24h?.toFixed(2) ?? "",
          l?.market_cap ?? "",
          l?.total_volume ?? "",
        ];
      }),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "watchlist.csv";
    a.click();
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search / Add */}
        <div className="relative min-w-56 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">🔍</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search to add a coin…"
            aria-label="Add coin to watchlist"
            className="surface-2 w-full rounded-xl border border-app py-2 pl-9 pr-8 text-sm outline-none focus:border-brand-400"
          />
          {searchLoading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="block h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </span>
          )}
          {searchDropdownOpen && (
            <div className="surface absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-app shadow-xl">
              {searchResults.map((r) => {
                const watched = isWatched(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      if (watched) {
                        remove(r.id);
                      } else {
                        add({ id: r.id, name: r.name, symbol: r.symbol, image: r.thumb });
                      }
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-[var(--surface-2)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.thumb} alt={r.name} width={24} height={24} className="rounded-full" />
                    <span className="flex-1 text-left font-semibold">{r.name}</span>
                    <span className="text-xs uppercase text-muted">{r.symbol}</span>
                    <span className={`text-lg ${watched ? "text-yellow-400" : "text-muted"}`}>
                      {watched ? "★" : "☆"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {watchlist.length > 0 && (
            <>
              <span className="text-sm text-muted">{watchlist.length} coins</span>
              <button
                type="button"
              onClick={exportCSV}
                className="surface-2 rounded-xl border border-app px-3 py-2 text-xs font-semibold text-muted transition hover:border-brand-400 hover:text-brand-600"
              >
                ↓ CSV
              </button>
            </>
          )}
        </div>
      </div>

      {liveError && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          ⚠ {liveError}
        </div>
      )}

      {/* Empty state */}
      {!watchlist.length && !searchQuery && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-app py-20 text-center">
          <span className="text-5xl">⭐</span>
          <h2 className="text-lg font-semibold">Your watchlist is empty</h2>
          <p className="text-sm text-muted">Search for coins above to track them here.</p>
        </div>
      )}

      {/* Table */}
      {watchlist.length > 0 && (
        <div className="overflow-auto rounded-2xl border border-app">
          <table className="w-full text-sm">
            <thead className="surface-2 sticky top-0 z-10 border-b border-app">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted">Coin</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">24h %</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">7d %</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">Mkt Cap</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">Volume</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted">7d</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {watchlist.map((w) => {
                const l = live.get(w.id);
                const ch = l?.price_change_percentage_24h ?? null;
                const ch7 = l?.price_change_percentage_7d_in_currency ?? null;
                return (
                  <tr
                    key={w.id}
                    className="cursor-pointer border-b border-app/40 transition hover:bg-[var(--surface-2)]"
                    onClick={() => setSelectedCoin(w.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedCoin(w.id)}
                    aria-label={`View ${w.name} details`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={w.image} alt={w.name} width={28} height={28} className="rounded-full" loading="lazy" />
                        <div>
                          <div className="font-semibold">{w.name}</div>
                          <div className="text-xs uppercase text-muted">{w.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      {liveLoading && !l ? (
                        <span className="ml-auto block h-4 w-20 animate-pulse rounded bg-[var(--surface-2)]" />
                      ) : (
                        fmtPrice(l?.current_price ?? 0, currency.symbol)
                      )}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums ${pctColor(ch)}`}>{pct(ch)}</td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums ${pctColor(ch7)}`}>{pct(ch7)}</td>
                    <td className="px-4 py-3 text-right text-muted">{fmtLarge(l?.market_cap ?? null, currency.symbol)}</td>
                    <td className="px-4 py-3 text-right text-muted">{fmtLarge(l?.total_volume ?? null, currency.symbol)}</td>
                    <td className="px-4 py-3">
                      {l?.sparkline_in_7d?.price?.length ? (
                        <Sparkline data={l.sparkline_in_7d.price} positive={(ch ?? 0) >= 0} width={100} height={36} />
                      ) : <span className="text-xs text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); remove(w.id); }}
                        className="rounded-lg p-1.5 text-muted transition hover:bg-red-500/10 hover:text-red-500"
                        aria-label={`Remove ${w.name} from watchlist`}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedCoin && (
        <CoinModal coinId={selectedCoin} onClose={() => setSelectedCoin(null)} currency={currency} />
      )}
    </div>
  );
}
