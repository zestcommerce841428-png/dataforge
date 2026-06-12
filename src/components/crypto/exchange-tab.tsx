"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createBinanceWS } from "@/lib/crypto-ws";
import type { Currency } from "./dashboard";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface Ticker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openPrice: string;
  count: number;
}

interface Order { price: string; qty: string; }

interface Trade {
  id: number;
  price: string;
  qty: string;
  time: number;
  isBuyerMaker: boolean;
}

interface Kline {
  t: number;
  o: string;
  h: string;
  l: string;
  c: string;
  v: string;
}

interface Alert {
  id: string;
  symbol: string;
  price: number;
  direction: "above" | "below";
  triggered: boolean;
}

/* ── Constants ──────────────────────────────────────────────────────────── */
const BN = "https://api.binance.com/api/v3";

const POPULAR = [
  "BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT",
  "ADAUSDT","DOGEUSDT","AVAXUSDT","LINKUSDT","DOTUSDT",
  "UNIUSDT","LTCUSDT","MATICUSDT","NEARUSDT","ATOMUSDT",
  "XLMUSDT","ALGOUSDT","VETUSDT","FILUSDT","AAVEUSDT",
];

const INTERVALS = ["1m","5m","15m","1h","4h","1d","1w"];

/* ── Formatters ─────────────────────────────────────────────────────────── */
const fp = (s: string | number) => {
  const n = typeof s === "string" ? parseFloat(s) : s;
  if (!n) return "$0.00";
  if (n >= 1000)
    return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(8)}`;
};

const pct = (s: string | number) => {
  const n = typeof s === "string" ? parseFloat(s) : s;
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
};

const pc = (s: string | number) => {
  const n = typeof s === "string" ? parseFloat(s) : s;
  return n >= 0 ? "text-green-500" : "text-red-500";
};

/* ── Technical Indicator Calculations ───────────────────────────────────── */
function calcMA(klines: Kline[], period: number): (number | null)[] {
  return klines.map((_, i) => {
    if (i < period - 1) return null;
    const closes = klines.slice(i - period + 1, i + 1).map((k) => parseFloat(k.c));
    return closes.reduce((s, v) => s + v, 0) / period;
  });
}

function calcVWAP(klines: Kline[]): number[] {
  let cumPV = 0, cumV = 0;
  return klines.map((k) => {
    const typical = (parseFloat(k.h) + parseFloat(k.l) + parseFloat(k.c)) / 3;
    const vol = parseFloat(k.v);
    cumPV += typical * vol;
    cumV += vol;
    return cumV === 0 ? 0 : cumPV / cumV;
  });
}

function calcRSI(klines: Kline[], period = 14): (number | null)[] {
  const closes = klines.map((k) => parseFloat(k.c));
  return closes.map((_, i) => {
    if (i < period) return null;
    const slice = closes.slice(i - period + 1, i + 1);
    const diffs = slice.map((c, j, arr) => (j === 0 ? 0 : c - arr[j - 1]));
    const gains = diffs.filter((d) => d > 0).reduce((s, d) => s + d, 0) / period;
    const losses = diffs.filter((d) => d < 0).reduce((s, d) => s + Math.abs(d), 0) / period;
    if (losses === 0) return 100;
    return 100 - 100 / (1 + gains / losses);
  });
}

/* ── Candlestick + Indicator Chart ──────────────────────────────────────── */
function CandleChart({
  klines,
  width = 700,
  height = 260,
  showMA20 = true,
  showMA50 = true,
  showVWAP = false,
  showVolume = true,
}: {
  klines: Kline[];
  width?: number;
  height?: number;
  showMA20?: boolean;
  showMA50?: boolean;
  showVWAP?: boolean;
  showVolume?: boolean;
}) {
  if (!klines.length)
    return (
      <div className="surface-2 flex items-center justify-center rounded-xl text-sm text-muted" style={{ height }}>
        Loading chart…
      </div>
    );

  const volH = showVolume ? 48 : 0;
  const pad = { l: 8, r: 8, t: 8, b: 28 };
  const candleH = height - volH - pad.t - pad.b;
  const w = width - pad.l - pad.r;

  const highs = klines.map((k) => parseFloat(k.h));
  const lows  = klines.map((k) => parseFloat(k.l));
  const maxP  = Math.max(...highs);
  const minP  = Math.min(...lows);
  const range = maxP - minP || 1;
  const cw    = w / klines.length;
  const py    = (v: number) => pad.t + candleH - ((v - minP) / range) * candleH;
  const step  = Math.max(1, Math.floor(klines.length / 7));

  // Indicators
  const ma20  = showMA20 ? calcMA(klines, 20) : [];
  const ma50  = showMA50 ? calcMA(klines, 50) : [];
  const vwap  = showVWAP ? calcVWAP(klines)   : [];

  const buildLine = (vals: (number | null)[]) => {
    let d = "";
    vals.forEach((v, i) => {
      if (v == null) return;
      const x = pad.l + i * cw + cw / 2;
      const y = py(v);
      d += d ? ` L${x} ${y}` : `M${x} ${y}`;
    });
    return d;
  };

  // Volume
  const vols   = klines.map((k) => parseFloat(k.v));
  const maxVol = Math.max(...vols) || 1;
  const volY0  = pad.t + candleH + 4;

  // X-axis labels
  const labeledKlines = klines.filter((_, i) => i % step === 0);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ minHeight: height, display: "block" }}
      aria-label="Candlestick chart with indicators"
    >
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={pad.l} y1={pad.t + candleH * f}
          x2={pad.l + w} y2={pad.t + candleH * f}
          stroke="currentColor" strokeOpacity={0.08} strokeWidth={1}
        />
      ))}

      {/* Candles */}
      {klines.map((k, i) => {
        const o = parseFloat(k.o), c = parseFloat(k.c);
        const hi = parseFloat(k.h), lo = parseFloat(k.l);
        const green = c >= o;
        const x = pad.l + i * cw + cw * 0.1;
        const bw = Math.max(1, cw * 0.8);
        const cy1 = py(Math.max(o, c));
        const cy2 = py(Math.min(o, c));
        const bh = Math.max(1, cy2 - cy1);
        const mx = x + bw / 2;
        return (
          <g key={k.t}>
            <line x1={mx} y1={py(hi)} x2={mx} y2={py(lo)} stroke={green ? "#22c55e" : "#ef4444"} strokeWidth={1} />
            <rect x={x} y={cy1} width={bw} height={bh} fill={green ? "#22c55e" : "#ef4444"} fillOpacity={0.85} rx={0.5} />
          </g>
        );
      })}

      {/* MA20 line */}
      {showMA20 && buildLine(ma20) && (
        <path d={buildLine(ma20)} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeLinejoin="round" />
      )}

      {/* MA50 line */}
      {showMA50 && buildLine(ma50) && (
        <path d={buildLine(ma50)} fill="none" stroke="#6366f1" strokeWidth={1.5} strokeLinejoin="round" />
      )}

      {/* VWAP line */}
      {showVWAP && buildLine(vwap) && (
        <path d={buildLine(vwap)} fill="none" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4 2" strokeLinejoin="round" />
      )}

      {/* Volume bars */}
      {showVolume && klines.map((k, i) => {
        const green = parseFloat(k.c) >= parseFloat(k.o);
        const vh = (vols[i] / maxVol) * (volH - 6);
        return (
          <rect
            key={`v${k.t}`}
            x={pad.l + i * cw + cw * 0.15}
            y={volY0 + (volH - 6 - vh)}
            width={Math.max(1, cw * 0.7)}
            height={Math.max(1, vh)}
            fill={green ? "#22c55e" : "#ef4444"}
            fillOpacity={0.45}
            rx={0.5}
          />
        );
      })}

      {/* Volume label */}
      {showVolume && (
        <text x={pad.l + 4} y={volY0 + 10} fontSize={8} fill="currentColor" opacity={0.4}>VOL</text>
      )}

      {/* X-axis labels */}
      {labeledKlines.map((k) => {
        const i = klines.indexOf(k);
        return (
          <text
            key={k.t}
            x={pad.l + i * cw + cw / 2}
            y={height - 6}
            textAnchor="middle"
            fontSize={9}
            fill="currentColor"
            opacity={0.45}
          >
            {new Date(k.t).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </text>
        );
      })}

      {/* Indicator legend */}
      {(showMA20 || showMA50 || showVWAP) && (
        <g>
          {showMA20 && <><rect x={pad.l + 4} y={pad.t + 4} width={18} height={3} fill="#f59e0b" rx={1.5} /><text x={pad.l + 26} y={pad.t + 10} fontSize={9} fill="currentColor" opacity={0.65}>MA20</text></>}
          {showMA50 && <><rect x={pad.l + 62} y={pad.t + 4} width={18} height={3} fill="#6366f1" rx={1.5} /><text x={pad.l + 84} y={pad.t + 10} fontSize={9} fill="currentColor" opacity={0.65}>MA50</text></>}
          {showVWAP && <><rect x={pad.l + 120} y={pad.t + 4} width={18} height={3} fill="#a855f7" rx={1.5} /><text x={pad.l + 142} y={pad.t + 10} fontSize={9} fill="currentColor" opacity={0.65}>VWAP</text></>}
        </g>
      )}
    </svg>
  );
}

/* ── RSI Chart ──────────────────────────────────────────────────────────── */
function RSIChart({ klines, width = 700, height = 80 }: { klines: Kline[]; width?: number; height?: number }) {
  if (!klines.length) return null;
  const rsi = calcRSI(klines);
  const pad = { l: 8, r: 8, t: 8, b: 20 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const cw = w / klines.length;
  const py = (v: number) => pad.t + h - ((v - 0) / 100) * h;

  let pathD = "";
  rsi.forEach((v, i) => {
    if (v == null) return;
    const x = pad.l + i * cw + cw / 2;
    const y = py(v);
    pathD += pathD ? ` L${x} ${y}` : `M${x} ${y}`;
  });

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ minHeight: height, display: "block" }}
      aria-label="RSI indicator"
    >
      {/* Levels 30, 50, 70 */}
      {[30, 50, 70].map((level) => (
        <g key={level}>
          <line
            x1={pad.l} y1={py(level)} x2={pad.l + w} y2={py(level)}
            stroke={level === 70 ? "#ef4444" : level === 30 ? "#22c55e" : "currentColor"}
            strokeOpacity={level === 50 ? 0.15 : 0.3}
            strokeWidth={1}
            strokeDasharray={level === 50 ? "4 2" : "0"}
          />
          <text x={pad.l + 3} y={py(level) - 2} fontSize={8} fill="currentColor" opacity={0.45}>{level}</text>
        </g>
      ))}

      {/* Overbought / oversold fill */}
      <rect x={pad.l} y={py(70)} width={w} height={py(100) - py(70)} fill="#ef4444" fillOpacity={0.06} />
      <rect x={pad.l} y={py(30)} width={w} height={py(0) - py(30)} fill="#22c55e" fillOpacity={0.06} />

      {/* RSI line */}
      {pathD && <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeLinejoin="round" />}

      {/* Label */}
      <text x={pad.l + w - 4} y={pad.t + 10} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.5}>RSI(14)</text>

      {/* Current value */}
      {rsi[rsi.length - 1] != null && (
        <text x={pad.l + 4} y={pad.t + 10} fontSize={9} fill="#f59e0b">
          {(rsi[rsi.length - 1] as number).toFixed(1)}
        </text>
      )}

      {/* X-axis labels */}
      <text x={pad.l} y={height - 4} fontSize={8} fill="currentColor" opacity={0.3}>0</text>
      <text x={pad.l + w} y={height - 4} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.3}>100</text>
    </svg>
  );
}

/* ── Price Alerts Panel ──────────────────────────────────────────────────── */
function AlertsPanel({
  symbol,
  currentPrice,
}: {
  symbol: string;
  currentPrice: number;
}) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [price, setPrice] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) setNotifPerm(Notification.permission);
  }, []);

  useEffect(() => {
    if (!currentPrice || !alerts.length) return;
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.triggered || a.symbol !== symbol) return a;
        const hit =
          (a.direction === "above" && currentPrice >= a.price) ||
          (a.direction === "below" && currentPrice <= a.price);
        if (!hit) return a;
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`🔔 ${symbol} Alert`, {
            body: `Price is now $${currentPrice.toFixed(2)} (${a.direction === "above" ? "above" : "below"} $${a.price})`,
            icon: "/favicon.svg",
          });
        }
        return { ...a, triggered: true };
      })
    );
  }, [currentPrice, symbol, alerts]);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
  };

  const addAlert = () => {
    const p = parseFloat(price);
    if (!p || p <= 0) return;
    setAlerts((prev) => [
      ...prev,
      { id: `${Date.now()}`, symbol, price: p, direction, triggered: false },
    ]);
    setPrice("");
  };

  const activeAlerts = alerts.filter((a) => a.symbol === symbol);

  return (
    <div className="surface rounded-2xl border p-4">
      <h3 className="mb-3 text-sm font-semibold">🔔 Price Alerts — {symbol}</h3>

      {notifPerm === "default" && (
        <button
          type="button"
          onClick={requestPermission}
          className="mb-3 w-full rounded-lg bg-brand-600/10 px-3 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-600/20"
        >
          Enable browser notifications
        </button>
      )}
      {notifPerm === "denied" && (
        <p className="mb-3 text-xs text-red-400">Notifications are blocked. Enable them in browser settings.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as "above" | "below")}
          className="surface-2 rounded-lg border border-app px-2 py-1.5 text-xs outline-none focus:border-brand-400"
        >
          <option value="above">Price above</option>
          <option value="below">Price below</option>
        </select>
        <input
          type="number"
          min="0"
          step="any"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={`e.g. ${currentPrice ? (currentPrice * 1.05).toFixed(0) : "50000"}`}
          className="surface-2 w-32 rounded-lg border border-app px-2 py-1.5 text-xs outline-none focus:border-brand-400"
        />
        <button
          type="button"
          onClick={addAlert}
          disabled={!price}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          + Add Alert
        </button>
      </div>

      {activeAlerts.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {activeAlerts.map((a) => (
            <div
              key={a.id}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                a.triggered
                  ? "border-green-400/30 bg-green-500/5 text-green-500"
                  : "border-app surface-2"
              }`}
            >
              <span className="font-semibold">
                {a.triggered ? "✅" : "⏳"} {a.direction === "above" ? "▲" : "▼"} ${a.price.toLocaleString("en-US")}
              </span>
              <button
                type="button"
                onClick={() => setAlerts((prev) => prev.filter((x) => x.id !== a.id))}
                className="ml-2 rounded p-0.5 text-muted hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Order book ─────────────────────────────────────────────────────────── */
function OrderBook({ bids, asks }: { bids: Order[]; asks: Order[] }) {
  const all = [...bids, ...asks];
  const maxQty = all.length ? Math.max(...all.map((o) => parseFloat(o.qty))) : 1;

  const Row = ({ o, side }: { o: Order; side: "bid" | "ask" }) => {
    const ratio = (parseFloat(o.qty) / maxQty) * 100;
    return (
      <div className={`relative flex justify-between gap-2 rounded px-2 py-0.5 font-mono text-xs ${side === "bid" ? "text-green-500" : "text-red-500"}`}>
        <div
          className={`absolute inset-y-0 rounded ${side === "bid" ? "right-0 bg-green-500/10" : "left-0 bg-red-500/10"}`}
          style={{ width: `${ratio}%` }}
        />
        <span className="relative">{parseFloat(o.price).toFixed(2)}</span>
        <span className="relative text-muted">{parseFloat(o.qty).toFixed(4)}</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <p className="mb-1 text-xs font-semibold text-green-500">BIDS</p>
        {bids.slice(0, 14).map((b, i) => <Row key={i} o={b} side="bid" />)}
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-red-500">ASKS</p>
        {asks.slice(0, 14).map((a, i) => <Row key={i} o={a} side="ask" />)}
      </div>
    </div>
  );
}

/* ── All Pairs grid ─────────────────────────────────────────────────────── */
function AllPairsGrid({ onSelectSymbol }: { onSelectSymbol: (sym: string) => void }) {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [search, setSearch] = useState("");
  const [quote, setQuote] = useState("USDT");
  const [sortBy, setSortBy] = useState<"volume" | "change" | "price">("volume");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch(`${BN}/ticker/24hr`);
      if (!res.ok) return;
      const data: Ticker[] = await res.json();
      setTickers(data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 30000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const displayed = tickers
    .filter((t) => {
      if (!t.symbol.endsWith(quote)) return false;
      if (search && !t.symbol.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "change") return parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent);
      if (sortBy === "price") return parseFloat(b.lastPrice) - parseFloat(a.lastPrice);
      return parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume);
    });

  return (
    <div className="surface rounded-2xl border p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">All Binance Pairs — {displayed.length} shown</h2>
          {lastUpdated && <p className="text-xs text-muted">Updated {lastUpdated.toLocaleTimeString()} · 30s refresh</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter symbol…"
            aria-label="Filter trading pairs"
            className="surface-2 w-32 rounded-lg border border-app px-3 py-1.5 text-sm outline-none focus:border-brand-400"
          />
          <select
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            className="surface-2 rounded-lg border border-app px-2 py-1.5 text-xs"
            aria-label="Quote currency"
          >
            {["USDT", "BTC", "ETH", "BNB", "FDUSD"].map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "volume" | "change" | "price")}
            className="surface-2 rounded-lg border border-app px-2 py-1.5 text-xs"
            aria-label="Sort by"
          >
            <option value="volume">By Volume</option>
            <option value="change">By Change</option>
            <option value="price">By Price</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-app p-3">
              <div className="h-4 w-24 rounded bg-[var(--surface-2)]" />
              <div className="mt-2 h-4 w-20 rounded bg-[var(--surface-2)]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid max-h-[600px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ contain: "strict" }}>
          {displayed.map((t) => {
            const ch = parseFloat(t.priceChangePercent);
            const base = t.symbol.replace(quote, "");
            return (
              <button
                key={t.symbol}
                type="button"
                onClick={() => onSelectSymbol(t.symbol)}
                className="surface-2 flex items-center justify-between rounded-xl border border-app px-3 py-2 text-left transition hover:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                style={{ contentVisibility: "auto", containIntrinsicSize: "auto 52px" }}
                aria-label={`Select ${t.symbol}`}
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold">{base}/{quote}</div>
                  <div className="text-xs text-muted">${(parseFloat(t.quoteVolume) / 1e6).toFixed(1)}M vol</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold">
                    {parseFloat(t.lastPrice).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </div>
                  <div className={`text-xs font-semibold ${ch >= 0 ? "text-green-500" : "text-red-500"}`}>{pct(ch)}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Futures Panel ──────────────────────────────────────────────────────── */
interface FundingRate { symbol: string; fundingRate: string; fundingTime: number }
interface OpenInterest { symbol: string; openInterest: string; time: number }
interface PremiumIndex { symbol: string; markPrice: string; indexPrice: string; lastFundingRate: string; nextFundingTime: number }

function FuturesPanel({ symbol }: { symbol: string }) {
  const [funding, setFunding] = useState<FundingRate[]>([]);
  const [oi, setOI] = useState<OpenInterest | null>(null);
  const [premium, setPremium] = useState<PremiumIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      fetch(`/api/crypto/futures?endpoint=fundingRate&symbol=${symbol}&limit=10`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/crypto/futures?endpoint=openInterest&symbol=${symbol}`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/crypto/futures?endpoint=premiumIndex&symbol=${symbol}`).then((r) => r.ok ? r.json() : null),
    ])
      .then(([f, o, p]) => {
        if (f) setFunding(Array.isArray(f) ? f : []);
        if (o) setOI(o);
        if (p) setPremium(p);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) return <div className="grid place-items-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>;
  if (error) return <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">⚠ Binance Futures: {error}</div>;

  return (
    <div className="space-y-4">
      {premium && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Mark Price", value: `$${parseFloat(premium.markPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
            { label: "Index Price", value: `$${parseFloat(premium.indexPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
            { label: "Funding Rate", value: `${(parseFloat(premium.lastFundingRate) * 100).toFixed(4)}%` },
          ].map(({ label, value }) => (
            <div key={label} className="surface rounded-xl border p-4">
              <p className="text-xs text-muted">{label}</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      )}
      {oi && (
        <div className="surface rounded-xl border p-4">
          <p className="text-xs text-muted mb-1">Open Interest</p>
          <p className="text-2xl font-bold">{parseFloat(oi.openInterest).toLocaleString("en-US", { maximumFractionDigits: 0 })} {symbol.replace("USDT", "")}</p>
        </div>
      )}
      {funding.length > 0 && (
        <div className="surface rounded-2xl border p-5">
          <h3 className="mb-3 text-sm font-semibold">Funding Rate History (last {funding.length})</h3>
          <div className="overflow-auto">
            <table className="w-full text-xs font-mono">
              <thead className="surface-2">
                <tr>
                  {["Funding Time", "Rate", "APR equiv."].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...funding].reverse().map((f, i) => {
                  const rate = parseFloat(f.fundingRate);
                  const apr = rate * 3 * 365 * 100;
                  return (
                    <tr key={i} className="border-b border-app/40">
                      <td className="px-3 py-1.5 text-muted">{new Date(f.fundingTime).toLocaleString()}</td>
                      <td className={`px-3 py-1.5 font-semibold ${rate >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {rate >= 0 ? "+" : ""}{(rate * 100).toFixed(4)}%
                      </td>
                      <td className={`px-3 py-1.5 ${apr >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {apr >= 0 ? "+" : ""}{apr.toFixed(2)}% APR
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Exchange Tab ─────────────────────────────────────────────────────────── */
export function ExchangeTab({ currency: _currency }: { currency: Currency }) {
  const [subTab, setSubTab] = useState<"spot" | "futures">("spot");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setKInterval] = useState("1h");
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [bids, setBids] = useState<Order[]>([]);
  const [asks, setAsks] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [klines, setKlines] = useState<Kline[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState("");

  // Indicator toggles
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(true);
  const [showVWAP, setShowVWAP] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  const wsRef = useRef(createBinanceWS());

  const fetchRest = useCallback(async () => {
    try {
      setError("");
      const [tRes, dRes, trRes, kRes] = await Promise.all([
        fetch(`${BN}/ticker/24hr?symbol=${symbol}`),
        fetch(`${BN}/depth?symbol=${symbol}&limit=20`),
        fetch(`${BN}/trades?symbol=${symbol}&limit=30`),
        fetch(`${BN}/klines?symbol=${symbol}&interval=${interval}&limit=100`),
      ]);
      if (!tRes.ok) throw new Error(`Binance API ${tRes.status}`);
      const [t, d, tr, k] = await Promise.all([tRes.json(), dRes.json(), trRes.json(), kRes.json()]);
      setTicker(t as Ticker);
      setBids((d.bids as string[][]).map(([price, qty]) => ({ price, qty })));
      setAsks((d.asks as string[][]).map(([price, qty]) => ({ price, qty })));
      setTrades(tr as Trade[]);
      setKlines(
        (k as unknown[][]).map((kl) => ({
          t: kl[0] as number,
          o: kl[1] as string,
          h: kl[2] as string,
          l: kl[3] as string,
          c: kl[4] as string,
          v: kl[5] as string,
        }))
      );
    } catch (e) {
      setError(`${(e as Error).message}`);
    }
  }, [symbol, interval]);

  useEffect(() => {
    const sym = symbol.toLowerCase();
    const ws = wsRef.current;
    ws.setStreams([`${sym}@ticker`, `${sym}@aggTrade`, `${sym}@depth20@1000ms`]).connect();
    const offStatus = ws.onStatus(setWsConnected);
    const offMsg = ws.subscribe((stream, data) => {
      if (stream.endsWith("@ticker")) {
        const d = data as { c: string; P: string; h: string; l: string; v: string; q: string; o: string; n: number };
        setTicker((prev) => prev ? { ...prev, lastPrice: d.c, priceChangePercent: d.P, highPrice: d.h, lowPrice: d.l, volume: d.v, quoteVolume: d.q, openPrice: d.o, count: d.n } : null);
      }
      if (stream.endsWith("@aggTrade")) {
        const d = data as { a: number; p: string; q: string; T: number; m: boolean };
        setTrades((prev) => [{ id: d.a, price: d.p, qty: d.q, time: d.T, isBuyerMaker: d.m }, ...prev].slice(0, 40));
      }
      if (stream.endsWith("@depth20@1000ms")) {
        const d = data as { bids: string[][]; asks: string[][] };
        setBids(d.bids.map(([price, qty]) => ({ price, qty })));
        setAsks(d.asks.map(([price, qty]) => ({ price, qty })));
      }
    });
    return () => { offStatus(); offMsg(); };
  }, [symbol]);

  useEffect(() => {
    const ws = wsRef.current;
    return () => ws.destroy();
  }, []);

  useEffect(() => {
    fetchRest();
    const id = setInterval(fetchRest, 30000);
    return () => clearInterval(id);
  }, [fetchRest]);

  const change = parseFloat(ticker?.priceChangePercent ?? "0");
  const currentPrice = parseFloat(ticker?.lastPrice ?? "0");

  const ToggleBtn = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
        active ? "bg-brand-600 text-white" : "surface-2 border border-app text-muted hover:text-[var(--text)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Sub-tab */}
      <div className="surface flex gap-1 rounded-2xl border p-1.5 w-fit">
        {(["spot", "futures"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setSubTab(t)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
              subTab === t ? "bg-brand-600 text-white shadow" : "text-muted hover:text-[var(--text)]"
            }`}
          >
            {t === "spot" ? "⚡ Spot" : "📊 Futures"}
          </button>
        ))}
      </div>

      {/* Futures */}
      {subTab === "futures" && (
        <div className="space-y-4">
          <div className="surface flex flex-wrap items-center gap-3 rounded-2xl border p-4">
            <label className="text-xs text-muted">Symbol:</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              aria-label="Futures trading pair"
              className="surface-2 rounded-xl border border-app px-3 py-2 text-sm font-semibold outline-none"
            >
              {POPULAR.map((s) => <option key={s} value={s}>{s.replace("USDT", "/USDT")}</option>)}
            </select>
          </div>
          <FuturesPanel symbol={symbol} />
        </div>
      )}

      {/* Spot */}
      {subTab === "spot" && (
        <>
          {/* Controls bar */}
          <div className="surface flex flex-wrap items-end gap-4 rounded-2xl border p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Trading Pair</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="surface-2 rounded-xl border border-app px-3 py-2 text-sm font-semibold outline-none focus:border-brand-400"
                aria-label="Trading pair"
              >
                {POPULAR.map((s) => <option key={s} value={s}>{s.replace("USDT", "/USDT")}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Chart Interval</label>
              <select
                value={interval}
                onChange={(e) => setKInterval(e.target.value)}
                className="surface-2 rounded-xl border border-app px-3 py-2 text-sm outline-none focus:border-brand-400"
                aria-label="Chart interval"
              >
                {INTERVALS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* Indicator toggles */}
            <div>
              <p className="mb-1 text-xs font-medium text-muted">Indicators</p>
              <div className="flex flex-wrap gap-1.5">
                <ToggleBtn label="MA20" active={showMA20} onClick={() => setShowMA20((v) => !v)} />
                <ToggleBtn label="MA50" active={showMA50} onClick={() => setShowMA50((v) => !v)} />
                <ToggleBtn label="VWAP" active={showVWAP} onClick={() => setShowVWAP((v) => !v)} />
                <ToggleBtn label="Volume" active={showVolume} onClick={() => setShowVolume((v) => !v)} />
                <ToggleBtn label="RSI" active={showRSI} onClick={() => setShowRSI((v) => !v)} />
                <ToggleBtn label="🔔 Alerts" active={showAlerts} onClick={() => setShowAlerts((v) => !v)} />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${wsConnected ? "animate-pulse bg-green-500" : "bg-red-500"}`} />
              <span className="text-xs text-muted">{wsConnected ? "WebSocket live" : "Connecting…"}</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              <span>⚠ {error}</span>
              <button type="button" onClick={fetchRest} className="shrink-0 rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50">Retry</button>
            </div>
          )}

          {/* Ticker stats */}
          {ticker && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Last Price", value: fp(ticker.lastPrice), color: pc(change) },
                { label: "24h Change", value: pct(ticker.priceChangePercent), color: pc(change) },
                { label: "24h High", value: fp(ticker.highPrice), color: "text-green-500" },
                { label: "24h Low", value: fp(ticker.lowPrice), color: "text-red-500" },
                { label: "Volume (base)", value: parseFloat(ticker.volume).toLocaleString("en-US", { maximumFractionDigits: 0 }), color: "" },
                { label: "Volume (quote)", value: `$${(parseFloat(ticker.quoteVolume) / 1e6).toFixed(2)}M`, color: "" },
                { label: "Open Price", value: fp(ticker.openPrice), color: "" },
                { label: "Trades 24h", value: ticker.count?.toLocaleString("en-US") ?? "—", color: "" },
              ].map(({ label, value, color }) => (
                <div key={label} className="surface rounded-xl border p-4">
                  <p className="text-xs text-muted">{label}</p>
                  <p className={`mt-1 text-xl font-bold tabular-nums ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Chart + Order book */}
          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="surface rounded-2xl border p-5">
              <h2 className="mb-3 text-sm font-semibold">
                {symbol} · {interval} Candlestick Chart
                {klines.length > 0 && <span className="ml-2 text-xs font-normal text-muted">({klines.length} candles)</span>}
              </h2>
              <div className="overflow-hidden text-[var(--text-muted)]">
                <CandleChart
                  klines={klines}
                  showMA20={showMA20}
                  showMA50={showMA50}
                  showVWAP={showVWAP}
                  showVolume={showVolume}
                />
                {showRSI && klines.length > 14 && (
                  <div className="mt-1 border-t border-app pt-1">
                    <RSIChart klines={klines} />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="surface rounded-2xl border p-5">
                <h2 className="mb-3 text-sm font-semibold">
                  Order Book <span className="text-xs font-normal text-muted">· live @depth</span>
                </h2>
                <OrderBook bids={bids} asks={asks} />
                {bids[0] && asks[0] && (
                  <div className="mt-3 border-t border-app pt-3 text-center font-mono text-sm font-semibold">
                    Spread: <span className="text-muted">${(parseFloat(asks[0].price) - parseFloat(bids[0].price)).toFixed(4)}</span>
                  </div>
                )}
              </div>

              {showAlerts && <AlertsPanel symbol={symbol} currentPrice={currentPrice} />}
            </div>
          </div>

          {/* Recent trades */}
          <div className="surface rounded-2xl border p-5">
            <h2 className="mb-3 text-sm font-semibold">
              Recent Trades <span className="text-xs font-normal text-muted">· live @aggTrade</span>
            </h2>
            <div className="max-h-64 overflow-auto">
              <table className="w-full text-xs font-mono">
                <thead className="surface-2 sticky top-0">
                  <tr>
                    {["Time", "Price", "Qty", "Side"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr key={t.id} className="border-b border-app/40 hover:bg-[var(--surface-2)]">
                      <td className="px-3 py-1.5 text-muted">{new Date(t.time).toLocaleTimeString()}</td>
                      <td className={`px-3 py-1.5 font-semibold ${t.isBuyerMaker ? "text-red-500" : "text-green-500"}`}>
                        {parseFloat(t.price).toFixed(2)}
                      </td>
                      <td className="px-3 py-1.5 text-muted">{parseFloat(t.qty).toFixed(5)}</td>
                      <td className={`px-3 py-1.5 font-semibold ${t.isBuyerMaker ? "text-red-500" : "text-green-500"}`}>
                        {t.isBuyerMaker ? "SELL" : "BUY"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <AllPairsGrid onSelectSymbol={setSymbol} />
        </>
      )}
    </div>
  );
}
