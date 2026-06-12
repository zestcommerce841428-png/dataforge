"use client";

import { useCallback, useEffect, useState } from "react";
import { CoinModal } from "./coin-modal";
import { fmtPrice, fmtLarge, pct, pctColor } from "./markets-tab";
import type { Currency } from "./dashboard";

/* ── Types ────────────────────────────────────────────────────────────────── */
interface CoinMarket {
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
}

interface Protocol {
  name: string;
  tvl: number;
  change_1d: number;
  change_7d: number;
  category: string;
  logo?: string;
  chains: string[];
}

interface Chain { name: string; tvl: number; tokenSymbol?: string; }

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fl = (n: number, sym = "$") => {
  if (n >= 1e12) return `${sym}${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${sym}${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${sym}${(n / 1e6).toFixed(2)}M`;
  return `${sym}${n.toLocaleString("en-US")}`;
};

/* ── Market Heatmap (treemap) ─────────────────────────────────────────────── */
function computeTreemap(
  coins: CoinMarket[],
  width: number,
  height: number
): Array<CoinMarket & { x: number; y: number; w: number; h: number }> {
  if (!coins.length) return [];
  const total = coins.reduce((s, c) => s + Math.max(c.market_cap, 0), 0);
  if (!total) return [];

  type Rect = { x: number; y: number; w: number; h: number };
  type Item = CoinMarket & Rect;

  function squarify(items: CoinMarket[], rect: Rect): Item[] {
    if (!items.length) return [];
    const totalArea = rect.w * rect.h;
    const totalValue = items.reduce((s, c) => s + Math.max(c.market_cap, 0), 0);

    const results: Item[] = [];
    let remaining = [...items];
    let rx = rect.x, ry = rect.y, rw = rect.w, rh = rect.h;

    while (remaining.length) {
      const isWide = rw >= rh;
      const side = isWide ? rh : rw;
      let rowItems: CoinMarket[] = [];
      let rowValue = 0;

      for (const item of remaining) {
        const v = Math.max(item.market_cap, 0);
        const candidate = [...rowItems, item];
        const candidateValue = rowValue + v;
        const candidateArea = (candidateValue / totalValue) * totalArea;
        const rowLen = isWide ? rw : rh;
        const candidateSide = candidateArea / (side || 1);
        const scaledRowLen = rowLen * (candidateValue / (totalValue || 1));

        // worst aspect ratio in candidate row
        const worst = candidate.reduce((w, it) => {
          const a = ((Math.max(it.market_cap, 0) / (candidateValue || 1)) * (side * (scaledRowLen || 1)));
          const itemW = isWide ? scaledRowLen / (candidate.length || 1) : a / (candidateSide || 1);
          const itemH = isWide ? a / (scaledRowLen || 1) : scaledRowLen / (candidate.length || 1);
          return Math.max(w, Math.max(itemW / (itemH || 1), (itemH || 1) / (itemW || 1)));
        }, 0);

        if (rowItems.length > 0) {
          const prevWorst = rowItems.reduce((w, it) => {
            const a = ((Math.max(it.market_cap, 0) / (rowValue || 1)) * (side * (rowLen * (rowValue / (totalValue || 1)) || 1)));
            const itemW = isWide ? (rowLen * (rowValue / (totalValue || 1))) / (rowItems.length || 1) : a / (side || 1);
            const itemH = isWide ? a / ((rowLen * (rowValue / (totalValue || 1))) || 1) : (rowLen * (rowValue / (totalValue || 1))) / (rowItems.length || 1);
            return Math.max(w, Math.max(itemW / (itemH || 1), (itemH || 1) / (itemW || 1)));
          }, 0);
          if (worst > prevWorst) break;
        }

        rowItems.push(item);
        rowValue += v;
      }

      if (!rowItems.length) { rowItems = [remaining[0]]; rowValue = Math.max(remaining[0].market_cap, 0); }

      const rowAreaRatio = rowValue / (totalValue || 1);
      const rowLen = isWide ? rw * rowAreaRatio : rh * rowAreaRatio;
      const rowSide = isWide ? rh : rw;
      let pos = isWide ? ry : rx;

      for (const item of rowItems) {
        const itemRatio = Math.max(item.market_cap, 0) / (rowValue || 1);
        const itemLen = rowSide * itemRatio;
        results.push({
          ...item,
          x: isWide ? rx : pos,
          y: isWide ? pos : ry,
          w: isWide ? rowLen : itemLen,
          h: isWide ? itemLen : rowLen,
        });
        pos += itemLen;
      }

      if (isWide) { rx += rowLen; rw -= rowLen; }
      else { ry += rowLen; rh -= rowLen; }

      const usedIds = new Set(rowItems.map((r) => r.id));
      remaining = remaining.filter((r) => !usedIds.has(r.id));
    }

    return results;
  }

  return squarify(coins, { x: 0, y: 0, w: width, h: height });
}

function changeColor(ch: number): string {
  if (ch >= 10) return "#15803d";
  if (ch >= 5) return "#16a34a";
  if (ch >= 2) return "#22c55e";
  if (ch >= 0) return "#4ade80";
  if (ch >= -2) return "#f87171";
  if (ch >= -5) return "#ef4444";
  if (ch >= -10) return "#dc2626";
  return "#991b1b";
}

function Heatmap({ coins, onSelect }: { coins: CoinMarket[]; onSelect: (id: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const W = 800, H = 380;
  const cells = computeTreemap(coins.slice(0, 80), W, H);

  return (
    <div className="overflow-auto rounded-2xl border border-app">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="block"
        aria-label="Market cap heatmap"
      >
        {cells.map((cell) => {
          const ch = cell.price_change_percentage_24h ?? 0;
          const fill = changeColor(ch);
          const isHov = hovered === cell.id;
          const gap = 2;
          return (
            <g
              key={cell.id}
              cursor="pointer"
              onClick={() => onSelect(cell.id)}
              onMouseEnter={() => setHovered(cell.id)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`${cell.name}: ${pct(ch)}`}
            >
              <rect
                x={cell.x + gap}
                y={cell.y + gap}
                width={Math.max(0, cell.w - gap * 2)}
                height={Math.max(0, cell.h - gap * 2)}
                fill={fill}
                fillOpacity={isHov ? 1 : 0.82}
                rx={4}
              />
              {cell.w > 50 && cell.h > 30 && (
                <>
                  <text
                    x={cell.x + cell.w / 2}
                    y={cell.y + cell.h / 2 - (cell.h > 44 ? 8 : 0)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={Math.min(14, Math.max(8, cell.w / 8))}
                    fontWeight={700}
                    fill="white"
                    className="pointer-events-none select-none"
                  >
                    {cell.symbol.toUpperCase()}
                  </text>
                  {cell.h > 44 && (
                    <text
                      x={cell.x + cell.w / 2}
                      y={cell.y + cell.h / 2 + 10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={Math.min(11, Math.max(7, cell.w / 10))}
                      fill="rgba(255,255,255,0.85)"
                      className="pointer-events-none select-none"
                    >
                      {pct(ch)}
                    </text>
                  )}
                </>
              )}
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 text-xs text-muted">
        {[
          { label: "≤-10%", color: "#991b1b" },
          { label: "-5%", color: "#ef4444" },
          { label: "-2%", color: "#f87171" },
          { label: "0%", color: "#4ade80" },
          { label: "+2%", color: "#22c55e" },
          { label: "+5%", color: "#16a34a" },
          { label: "≥+10%", color: "#15803d" },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1">
            <svg width={16} height={12} aria-hidden="true"><rect width={16} height={12} rx={2} fill={color} /></svg>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Gainers / Losers board ───────────────────────────────────────────────── */
function GainersLosers({
  coins,
  onSelect,
  currency,
}: {
  coins: CoinMarket[];
  onSelect: (id: string) => void;
  currency: Currency;
}) {
  const sorted = [...coins].sort(
    (a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)
  );
  const gainers = sorted.filter((c) => (c.price_change_percentage_24h ?? 0) > 0).slice(0, 10);
  const losers = sorted.filter((c) => (c.price_change_percentage_24h ?? 0) < 0).reverse().slice(0, 10);

  const Row = ({ coin, rank }: { coin: CoinMarket; rank: number }) => (
    <button
      type="button"
      onClick={() => onSelect(coin.id)}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-[var(--surface-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <span className="w-5 text-right text-xs text-muted">{rank}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full" loading="lazy" />
      <span className="flex-1 truncate text-left font-semibold">{coin.name}</span>
      <span className="font-mono text-xs text-muted">{fmtPrice(coin.current_price, currency.symbol)}</span>
      <span className={`w-16 text-right text-xs font-bold tabular-nums ${pctColor(coin.price_change_percentage_24h)}`}>
        {pct(coin.price_change_percentage_24h)}
      </span>
    </button>
  );

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="surface rounded-2xl border p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-green-500">
          <span>🚀</span> Top Gainers (24h)
        </h3>
        <div className="space-y-0.5">
          {gainers.map((c, i) => <Row key={c.id} coin={c} rank={i + 1} />)}
          {!gainers.length && <p className="text-sm text-muted">No data yet</p>}
        </div>
      </div>
      <div className="surface rounded-2xl border p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-red-500">
          <span>📉</span> Top Losers (24h)
        </h3>
        <div className="space-y-0.5">
          {losers.map((c, i) => <Row key={c.id} coin={c} rank={i + 1} />)}
          {!losers.length && <p className="text-sm text-muted">No data yet</p>}
        </div>
      </div>
    </div>
  );
}

/* ── Volume Leaders ───────────────────────────────────────────────────────── */
function VolumeLeaders({
  coins,
  onSelect,
  currency,
}: {
  coins: CoinMarket[];
  onSelect: (id: string) => void;
  currency: Currency;
}) {
  const top = [...coins].sort((a, b) => b.total_volume - a.total_volume).slice(0, 10);
  const maxVol = top[0]?.total_volume ?? 1;

  return (
    <div className="surface rounded-2xl border p-5">
      <h3 className="mb-4 text-sm font-bold">📊 Volume Leaders (24h)</h3>
      <div className="space-y-3">
        {top.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className="group flex w-full items-center gap-3 text-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.image} alt={c.name} width={22} height={22} className="rounded-full" loading="lazy" />
            <span className="w-28 text-left font-semibold truncate">{c.name}</span>
            <svg width="100%" height="8" className="flex-1 overflow-visible" aria-hidden="true">
              <rect width="100%" height="8" rx="4" fill="var(--surface-2)" />
              <rect width={`${(c.total_volume / maxVol) * 100}%`} height="8" rx="4" fill="var(--brand-500,#6366f1)" />
            </svg>
            <span className="w-24 text-right font-mono text-xs text-muted">
              {fmtLarge(c.total_volume, currency.symbol)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── DeFi TVL ─────────────────────────────────────────────────────────────── */
function DefiPanel() {
  const [data, setData] = useState<{ chains: Chain[]; protocols: Protocol[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"chains" | "protocols">("chains");

  useEffect(() => {
    fetch("/api/crypto/defi")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalTVL = data?.chains.reduce((s, c) => s + c.tvl, 0) ?? 0;

  return (
    <div className="surface rounded-2xl border p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold">🏦 DeFi Total Value Locked</h3>
          {totalTVL > 0 && (
            <p className="text-xs text-muted">
              Total: <span className="font-semibold text-[var(--text)]">{fl(totalTVL)}</span> across all chains
            </p>
          )}
        </div>
        <div className="surface-2 flex gap-1 rounded-xl border p-1">
          {(["chains", "protocols"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                tab === t ? "bg-brand-600 text-white shadow-sm" : "text-muted hover:text-[var(--text)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded-lg bg-[var(--surface-2)]" />
          ))}
        </div>
      ) : tab === "chains" ? (
        <div className="space-y-2">
          {(data?.chains ?? []).map((c) => {
            const pct_ = totalTVL > 0 ? (c.tvl / totalTVL) * 100 : 0;
            return (
              <div key={c.name} className="flex items-center gap-3 text-sm">
                <span className="w-24 truncate font-semibold">{c.name}</span>
                <svg width="100%" height="8" className="flex-1 overflow-visible" aria-hidden="true">
                  <rect width="100%" height="8" rx="4" fill="var(--surface-2)" />
                  <rect width={`${pct_}%`} height="8" rx="4" fill="var(--brand-500,#6366f1)" />
                </svg>
                <span className="w-20 text-right font-mono text-xs font-semibold">{fl(c.tvl)}</span>
                <span className="w-10 text-right text-xs text-muted">{pct_.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="surface-2 border-b border-app">
              <tr>
                {["Protocol", "Category", "TVL", "1d %", "7d %"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.protocols ?? []).map((p) => (
                <tr key={p.name} className="border-b border-app/40">
                  <td className="px-3 py-2 font-semibold">{p.name}</td>
                  <td className="px-3 py-2 text-muted">{p.category}</td>
                  <td className="px-3 py-2 font-mono font-semibold">{fl(p.tvl)}</td>
                  <td className={`px-3 py-2 font-semibold tabular-nums ${pctColor(p.change_1d)}`}>{pct(p.change_1d)}</td>
                  <td className={`px-3 py-2 font-semibold tabular-nums ${pctColor(p.change_7d)}`}>{pct(p.change_7d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Sector Breakdown ─────────────────────────────────────────────────────── */
function SectorBreakdown({ coins, currency }: { coins: CoinMarket[]; currency: Currency }) {
  // Approximate sector grouping by symbol patterns
  const sectors: Record<string, string[]> = {
    "Layer 1": ["BTC","ETH","SOL","ADA","AVAX","DOT","ATOM","NEAR","ALGO","FTM","ONE","EGLD","HBAR","XTZ"],
    "Layer 2": ["MATIC","ARB","OP","IMX","METIS","BOBA","ZK"],
    "DeFi": ["UNI","AAVE","LINK","MKR","COMP","CRV","SUSHI","YFI","SNX","BAL","1INCH"],
    "Exchange": ["BNB","OKB","KCS","HT","FTT","CRO","GT","MX"],
    "Stablecoin": ["USDT","USDC","BUSD","DAI","FRAX","TUSD","USDP"],
    "NFT/Gaming": ["AXS","MANA","SAND","ENJ","GALA","ILV","FLOW","THETA"],
    "Meme": ["DOGE","SHIB","PEPE","FLOKI","BONK","WIF"],
    "Privacy": ["XMR","ZEC","DASH","SCRT"],
    "Other": [],
  };

  const known = new Set(Object.values(sectors).flat());
  const counts: Record<string, number> = {};
  const tvl: Record<string, number> = {};

  for (const coin of coins) {
    let found = false;
    for (const [sector, symbols] of Object.entries(sectors)) {
      if (sector === "Other") continue;
      if (symbols.includes(coin.symbol.toUpperCase())) {
        counts[sector] = (counts[sector] ?? 0) + 1;
        tvl[sector] = (tvl[sector] ?? 0) + coin.market_cap;
        found = true;
        break;
      }
    }
    if (!found) {
      counts["Other"] = (counts["Other"] ?? 0) + 1;
      tvl["Other"] = (tvl["Other"] ?? 0) + coin.market_cap;
    }
  }

  const totalTVL = Object.values(tvl).reduce((s, v) => s + v, 0);
  const rows = Object.entries(tvl)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  const COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#3b82f6","#a855f7","#14b8a6","#ec4899","#84cc16"];

  return (
    <div className="surface rounded-2xl border p-5">
      <h3 className="mb-4 text-sm font-bold">🏷️ Sector Breakdown</h3>
      <div className="space-y-2">
        {rows.map(([sector, value], i) => {
          const pct_ = totalTVL > 0 ? (value / totalTVL) * 100 : 0;
          const color = COLORS[i % COLORS.length];
          return (
            <div key={sector} className="flex items-center gap-3 text-sm">
              <svg width={12} height={12} className="shrink-0" aria-hidden="true"><circle cx={6} cy={6} r={6} fill={color} /></svg>
              <span className="w-28 font-semibold truncate">{sector}</span>
              <svg width="100%" height="8" className="flex-1 overflow-visible" aria-hidden="true">
                <rect width="100%" height="8" rx="4" fill="var(--surface-2)" />
                <rect width={`${pct_}%`} height="8" rx="4" fill={color} />
              </svg>
              <span className="w-16 text-right font-mono text-xs font-semibold">{fl(value, currency.symbol)}</span>
              <span className="w-10 text-right text-xs text-muted">{pct_.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Analytics Tab ────────────────────────────────────────────────────────── */
export function AnalyticsTab({ currency }: { currency: Currency }) {
  const [coins, setCoins] = useState<CoinMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<"heatmap" | "gainers" | "volume" | "defi">("heatmap");
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

  const fetchCoins = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/crypto/markets?per_page=250&page=1&sparkline=false&vs_currency=${currency.code}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: CoinMarket[] = await res.json();
      setCoins(data);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currency.code]);

  useEffect(() => {
    fetchCoins();
    const id = setInterval(fetchCoins, 120000);
    return () => clearInterval(id);
  }, [fetchCoins]);

  const VIEWS = [
    { id: "heatmap", label: "🗺 Heatmap" },
    { id: "gainers", label: "🚀 Gainers/Losers" },
    { id: "volume", label: "📊 Volume" },
    { id: "defi", label: "🏦 DeFi TVL" },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Sub-nav */}
      <div className="surface flex flex-wrap gap-1 rounded-2xl border p-1.5 w-fit">
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              view === id ? "bg-brand-600 text-white shadow" : "text-muted hover:text-[var(--text)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          ⚠ {error}{" "}
          <button type="button" onClick={fetchCoins} className="ml-2 underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
          <p className="mt-3 text-sm text-muted">Loading market data…</p>
        </div>
      ) : (
        <>
          {view === "heatmap" && (
            <div className="space-y-4">
              <p className="text-xs text-muted">Top 80 coins by market cap · sized by market cap · colored by 24h change · click to view details</p>
              <Heatmap coins={coins} onSelect={setSelectedCoin} />
              <SectorBreakdown coins={coins} currency={currency} />
            </div>
          )}
          {view === "gainers" && <GainersLosers coins={coins} onSelect={setSelectedCoin} currency={currency} />}
          {view === "volume" && <VolumeLeaders coins={coins} onSelect={setSelectedCoin} currency={currency} />}
          {view === "defi" && <DefiPanel />}
        </>
      )}

      {selectedCoin && <CoinModal coinId={selectedCoin} onClose={() => setSelectedCoin(null)} currency={currency} />}
    </div>
  );
}
