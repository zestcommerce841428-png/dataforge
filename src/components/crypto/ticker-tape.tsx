"use client";

import { useEffect, useRef, useState } from "react";

interface TickerItem {
  symbol: string;
  price: string;
  change: string;
}

const TOP_SYMBOLS = [
  "BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT",
  "ADAUSDT","DOGEUSDT","AVAXUSDT","LINKUSDT","DOTUSDT",
  "UNIUSDT","LTCUSDT","MATICUSDT","NEARUSDT","ATOMUSDT",
  "XLMUSDT","AAVEUSDT","FILUSDT","ALGOUSDT","VETUSDT",
];

const BN = "https://api.binance.com/api/v3";

function fmtPrice(s: string): string {
  const n = parseFloat(s);
  if (!n) return "$0.00";
  if (n >= 1000) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(6)}`;
}

export function TickerTape() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPrices = async () => {
    try {
      const symbols = JSON.stringify(TOP_SYMBOLS);
      const res = await fetch(`${BN}/ticker/24hr?symbols=${encodeURIComponent(symbols)}`);
      if (!res.ok) return;
      const data = await res.json() as Array<{
        symbol: string;
        lastPrice: string;
        priceChangePercent: string;
      }>;
      const ordered = TOP_SYMBOLS
        .map((s) => data.find((d) => d.symbol === s))
        .filter(Boolean)
        .map((d) => ({
          symbol: d!.symbol.replace("USDT", ""),
          price: d!.lastPrice,
          change: d!.priceChangePercent,
        }));
      setItems(ordered);
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    fetchPrices();
    timer.current = setInterval(fetchPrices, 30000);
    return () => { if (timer.current) clearInterval(timer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!items.length) return null;

  // Duplicate items for seamless loop
  const tape = [...items, ...items];

  return (
    <div
      className="mb-6 overflow-hidden rounded-2xl border border-app surface-2 py-2"
      aria-label="Live crypto price ticker"
    >
      <div
        className="flex gap-6 whitespace-nowrap"
        style={{
          animation: "ticker-scroll 60s linear infinite",
          width: "max-content",
        }}
      >
        {tape.map(({ symbol, price, change }, i) => {
          const ch = parseFloat(change);
          const positive = ch >= 0;
          return (
            <span key={`${symbol}-${i}`} className="inline-flex items-center gap-2 px-3 text-sm">
              <span className="font-bold">{symbol}</span>
              <span className="font-mono font-semibold">{fmtPrice(price)}</span>
              <span className={`text-xs font-semibold ${positive ? "text-green-500" : "text-red-500"}`}>
                {positive ? "▲" : "▼"}{Math.abs(ch).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-tape { animation: none; }
        }
      `}</style>
    </div>
  );
}
