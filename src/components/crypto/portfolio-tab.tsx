"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CoinModal } from "./coin-modal";
import { fmtPrice, fmtLarge, pct, pctColor } from "./markets-tab";
import type { Currency } from "./dashboard";

/* ── Storage ─────────────────────────────────────────────────────────────── */
const PORT_KEY = "df-crypto-portfolio";

export interface Holding {
  id: string;
  name: string;
  symbol: string;
  image: string;
  quantity: number;
  buyPrice: number;
  addedAt: number;
}

function loadHoldings(): Holding[] {
  try { return JSON.parse(localStorage.getItem(PORT_KEY) ?? "[]"); } catch { return []; }
}
function saveHoldings(h: Holding[]) { localStorage.setItem(PORT_KEY, JSON.stringify(h)); }

/* ── Donut chart ─────────────────────────────────────────────────────────── */
const PALETTE = [
  "#6366f1","#f59e0b","#22c55e","#ef4444","#3b82f6",
  "#a855f7","#ec4899","#14b8a6","#f97316","#84cc16",
];

function DonutChart({ slices }: { slices: Array<{ value: number; color: string; label: string }> }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (!total) return null;

  const r = 70, ir = 42, cx = 80, cy = 80;
  let cumAngle = -Math.PI / 2;

  const paths = slices.map(({ value, color }, idx) => {
    const angle = (value / total) * Math.PI * 2;
    const sa = cumAngle, ea = cumAngle + angle;
    cumAngle = ea;
    const x1 = cx + r * Math.cos(sa), y1 = cy + r * Math.sin(sa);
    const x2 = cx + r * Math.cos(ea), y2 = cy + r * Math.sin(ea);
    const xi1 = cx + ir * Math.cos(sa), yi1 = cy + ir * Math.sin(sa);
    const xi2 = cx + ir * Math.cos(ea), yi2 = cy + ir * Math.sin(ea);
    const la = angle > Math.PI ? 1 : 0;
    const d = `M${x1} ${y1} A${r} ${r} 0 ${la} 1 ${x2} ${y2} L${xi2} ${yi2} A${ir} ${ir} 0 ${la} 0 ${xi1} ${yi1}Z`;
    const scale = hovered === idx ? 1.04 : 1;
    return (
      <path
        key={idx}
        d={d}
        fill={color}
        style={{ transform: `scale(${scale})`, transformOrigin: "80px 80px", transition: "transform 0.15s ease" }}
        onMouseEnter={() => setHovered(idx)}
        onMouseLeave={() => setHovered(null)}
        aria-label={`${slices[idx].label}: ${((value / total) * 100).toFixed(1)}%`}
      />
    );
  });

  return (
    <svg viewBox="0 0 160 160" className="w-full max-w-[160px]" aria-label="Portfolio allocation donut chart">
      {paths}
      <circle cx={cx} cy={cy} r={ir} fill="var(--bg-base)" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.5}>Total</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
        {hovered !== null ? `${((slices[hovered].value / total) * 100).toFixed(1)}%` : "100%"}
      </text>
    </svg>
  );
}

/* ── Live price types ────────────────────────────────────────────────────── */
interface LiveCoin { id: string; current_price: number; price_change_percentage_24h: number; }

/* ── Search result ───────────────────────────────────────────────────────── */
interface SearchCoin { id: string; name: string; symbol: string; thumb: string; }

/* ── Add Holding Modal ───────────────────────────────────────────────────── */
function AddHoldingModal({
  onAdd,
  onClose,
  currency,
}: {
  onAdd: (h: Holding) => void;
  onClose: () => void;
  currency: import("./dashboard").Currency;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCoin[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchCoin | null>(null);
  const [qty, setQty] = useState("");
  const [buyPx, setBuyPx] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query.trim() || selected) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/crypto/search?q=${encodeURIComponent(query.trim())}`);
        const { coins } = await res.json() as { coins: SearchCoin[] };
        setResults((coins ?? []).slice(0, 6));
      } catch { setResults([]); }
      setSearching(false);
    }, 350);
  }, [query, selected]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const submit = () => {
    if (!selected || !qty || !buyPx) return;
    onAdd({
      id: selected.id,
      name: selected.name,
      symbol: selected.symbol,
      image: selected.thumb,
      quantity: parseFloat(qty),
      buyPrice: parseFloat(buyPx),
      addedAt: Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="surface relative z-10 w-full max-w-md rounded-3xl border border-app p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Add Holding</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-[var(--surface-2)]" aria-label="Close">✕</button>
        </div>

        {/* Coin selector */}
        {!selected ? (
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a coin…"
              autoFocus
              className="surface-2 w-full rounded-xl border border-app px-4 py-2.5 text-sm outline-none focus:border-brand-400"
            />
            {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 block h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />}
            {results.length > 0 && (
              <div className="surface absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-app shadow-xl">
                {results.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setSelected(r); setQuery(r.name); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-[var(--surface-2)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.thumb} alt={r.name} width={24} height={24} className="rounded-full" />
                    <span className="flex-1 text-left font-semibold">{r.name}</span>
                    <span className="text-xs uppercase text-muted">{r.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-brand-400 bg-brand-500/5 px-4 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selected.thumb} alt={selected.name} width={32} height={32} className="rounded-full" />
            <div className="flex-1 font-semibold">{selected.name}</div>
            <button type="button" onClick={() => { setSelected(null); setQuery(""); }} className="text-xs text-muted hover:text-red-500">Change</button>
          </div>
        )}

        {/* Quantity + buy price */}
        {selected && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Quantity held</label>
              <input
                type="number"
                min="0"
                step="any"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="e.g. 0.5"
                className="surface-2 w-full rounded-xl border border-app px-4 py-2.5 text-sm outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Avg buy price ({currency.symbol})</label>
              <input
                type="number"
                min="0"
                step="any"
                value={buyPx}
                onChange={(e) => setBuyPx(e.target.value)}
                placeholder="e.g. 45000"
                className="surface-2 w-full rounded-xl border border-app px-4 py-2.5 text-sm outline-none focus:border-brand-400"
              />
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={!qty || !buyPx}
              className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-brand-700 disabled:opacity-50"
            >
              Add to Portfolio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── PortfolioTab ─────────────────────────────────────────────────────────── */
export function PortfolioTab({ currency }: { currency: Currency }) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [live, setLive] = useState<Map<string, LiveCoin>>(new Map());
  const [liveLoading, setLiveLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setHoldings(loadHoldings()); }, []);

  const fetchPrices = useCallback(async (ids: string[]) => {
    if (!ids.length) { setLive(new Map()); return; }
    setLiveLoading(true);
    try {
      const res = await fetch(
        `/api/crypto/markets?ids=${ids.join(",")}&sparkline=false&per_page=250&vs_currency=${currency.code}`
      );
      if (!res.ok) return;
      const data: LiveCoin[] = await res.json();
      setLive(new Map(data.map((c) => [c.id, c])));
    } catch { /* ignore */ }
    setLiveLoading(false);
  }, [currency.code]);

  useEffect(() => {
    const ids = [...new Set(holdings.map((h) => h.id))];
    if (!ids.length) { setLive(new Map()); return; }
    fetchPrices(ids);
    refreshTimer.current = setInterval(() => fetchPrices(ids), 60000);
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, [holdings, fetchPrices]);

  const addHolding = (h: Holding) => {
    const updated = [...holdings, h];
    setHoldings(updated);
    saveHoldings(updated);
  };

  const removeHolding = (idx: number) => {
    const updated = holdings.filter((_, i) => i !== idx);
    setHoldings(updated);
    saveHoldings(updated);
  };

  /* Derived calculations */
  const enriched = holdings.map((h) => {
    const l = live.get(h.id);
    const currentPrice = l?.current_price ?? 0;
    const currentValue = h.quantity * currentPrice;
    const costBasis = h.quantity * h.buyPrice;
    const pnl = currentValue - costBasis;
    const roi = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    return { ...h, currentPrice, currentValue, costBasis, pnl, roi };
  });

  const totalValue = enriched.reduce((s, x) => s + x.currentValue, 0);
  const totalCost = enriched.reduce((s, x) => s + x.costBasis, 0);
  const totalPnl = totalValue - totalCost;
  const totalRoi = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  /* Donut slices */
  const donutSlices = enriched.map((h, i) => ({
    value: h.currentValue,
    color: PALETTE[i % PALETTE.length],
    label: h.name,
  }));

  /* CSV export */
  const exportCSV = () => {
    const rows = [
      ["Coin","Symbol","Qty","Buy Price","Current Price","Current Value","Cost Basis","P&L","ROI %"],
      ...enriched.map((h) => [
        h.name, h.symbol.toUpperCase(), h.quantity, h.buyPrice.toFixed(2),
        h.currentPrice.toFixed(2), h.currentValue.toFixed(2),
        h.costBasis.toFixed(2), h.pnl.toFixed(2), h.roi.toFixed(2),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "portfolio.csv";
    a.click();
  };

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      {holdings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Value", value: `$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: null, color: "" },
            { label: "Total Invested", value: `$${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: null, color: "" },
            { label: "Total P&L", value: `${totalPnl >= 0 ? "+" : ""}$${Math.abs(totalPnl).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: null, color: totalPnl >= 0 ? "text-green-500" : "text-red-500" },
            { label: "Total ROI", value: `${totalRoi >= 0 ? "+" : ""}${totalRoi.toFixed(2)}%`, sub: `${holdings.length} positions`, color: totalRoi >= 0 ? "text-green-500" : "text-red-500" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="surface rounded-2xl border p-5">
              <p className="text-xs text-muted">{label}</p>
              <p className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>{value}</p>
              {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Donut + legend */}
      {holdings.length > 0 && (
        <div className="surface rounded-2xl border p-5">
          <h2 className="mb-4 text-sm font-semibold">Portfolio Allocation</h2>
          <div className="flex flex-wrap items-center gap-8">
            <DonutChart slices={donutSlices} />
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {enriched.map((h, i) => (
                <div key={h.id + i} className="flex items-center gap-2 text-sm">
                  <svg width={12} height={12} aria-hidden="true"><circle cx={6} cy={6} r={6} fill={PALETTE[i % PALETTE.length]} /></svg>
                  <span className="font-semibold">{h.symbol.toUpperCase()}</span>
                  <span className="text-muted">
                    {totalValue > 0 ? ((h.currentValue / totalValue) * 100).toFixed(1) : "0"}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-semibold">Holdings</h2>
        <div className="ml-auto flex items-center gap-2">
          {holdings.length > 0 && (
            <button
              type="button"
              onClick={exportCSV}
              className="surface-2 rounded-xl border border-app px-3 py-2 text-xs font-semibold text-muted transition hover:border-brand-400 hover:text-brand-600"
            >
              ↓ Export CSV
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-brand-700"
          >
            + Add Holding
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!holdings.length && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-app py-20 text-center">
          <span className="text-5xl">💼</span>
          <h2 className="text-lg font-semibold">Track your crypto portfolio</h2>
          <p className="text-sm text-muted">Add your holdings to see real-time P&L and allocation.</p>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-brand-700"
          >
            + Add First Holding
          </button>
        </div>
      )}

      {/* Holdings table */}
      {holdings.length > 0 && (
        <div className="overflow-auto rounded-2xl border border-app">
          <table className="w-full text-sm">
            <thead className="surface-2 sticky top-0 z-10 border-b border-app">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted">Coin</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">Avg Buy</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">Current Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">Value</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">P&L</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">ROI</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">24h %</th>
                <th className="px-4 py-3" scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((h, i) => {
                const liveData = live.get(h.id);
                const ch = liveData?.price_change_percentage_24h ?? null;
                return (
                  <tr key={h.id + h.addedAt} className="border-b border-app/40 transition hover:bg-[var(--surface-2)]">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedCoin(h.id)}
                        className="flex items-center gap-2 text-left"
                        aria-label={`View ${h.name} details`}
                      >
                        <svg width={12} height={12} aria-hidden="true"><circle cx={6} cy={6} r={6} fill={PALETTE[i % PALETTE.length]} /></svg>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={h.image} alt={h.name} width={28} height={28} className="rounded-full" loading="lazy" />
                        <div>
                          <div className="font-semibold">{h.name}</div>
                          <div className="text-xs uppercase text-muted">{h.symbol}</div>
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{h.quantity.toLocaleString("en-US", { maximumSignificantDigits: 8 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-muted">{fmtPrice(h.buyPrice)}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      {liveLoading && !liveData ? (
                        <span className="ml-auto block h-4 w-20 animate-pulse rounded bg-[var(--surface-2)]" />
                      ) : fmtPrice(h.currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {fmtPrice(h.currentValue)}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums ${h.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {h.pnl >= 0 ? "+" : ""}${Math.abs(h.pnl).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums ${h.roi >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {pct(h.roi)}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums ${pctColor(ch)}`}>
                      {pct(ch)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeHolding(i); }}
                        className="rounded-lg p-1.5 text-muted transition hover:bg-red-500/10 hover:text-red-500"
                        aria-label={`Remove ${h.name}`}
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

      {showAdd && <AddHoldingModal onAdd={addHolding} onClose={() => setShowAdd(false)} currency={currency} />}
      {selectedCoin && <CoinModal coinId={selectedCoin} onClose={() => setSelectedCoin(null)} currency={currency} />}
    </div>
  );
}
