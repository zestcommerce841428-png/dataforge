"use client";

import { useState } from "react";
import { MarketsTab } from "./markets-tab";
import { ExchangeTab } from "./exchange-tab";
import { TrendingTab } from "./trending-tab";

type Tab = "markets" | "exchange" | "trending";

export const SUPPORTED_CURRENCIES = [
  { code: "usd", label: "USD $", symbol: "$" },
  { code: "eur", label: "EUR €", symbol: "€" },
  { code: "gbp", label: "GBP £", symbol: "£" },
  { code: "jpy", label: "JPY ¥", symbol: "¥" },
  { code: "cad", label: "CAD $", symbol: "CA$" },
  { code: "aud", label: "AUD $", symbol: "A$" },
  { code: "chf", label: "CHF", symbol: "Fr" },
  { code: "cny", label: "CNY ¥", symbol: "¥" },
  { code: "inr", label: "INR ₹", symbol: "₹" },
  { code: "krw", label: "KRW ₩", symbol: "₩" },
  { code: "btc", label: "BTC ₿", symbol: "₿" },
  { code: "eth", label: "ETH Ξ", symbol: "Ξ" },
] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "markets",  label: "📈 Markets" },
  { id: "exchange", label: "⚡ Exchange" },
  { id: "trending", label: "🔥 Trending" },
];

export function CryptoDashboard() {
  const [tab, setTab] = useState<Tab>("markets");
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES[0]);

  return (
    <div>
      {/* Tab bar + currency selector */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          aria-label="Crypto dashboard sections"
          className="surface flex gap-1 rounded-2xl border p-1.5"
        >
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              onClick={() => setTab(id)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                tab === id
                  ? "bg-brand-600 text-white shadow"
                  : "text-muted hover:text-[var(--text)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Currency selector — only relevant for Markets/Trending */}
        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="currency-select" className="text-xs text-muted whitespace-nowrap">
            Display currency:
          </label>
          <select
            id="currency-select"
            value={currency.code}
            onChange={(e) => {
              const c = SUPPORTED_CURRENCIES.find((x) => x.code === e.target.value);
              if (c) setCurrency(c);
            }}
            className="surface-2 rounded-xl border border-app px-3 py-2 text-sm font-semibold outline-none focus:border-brand-400"
            aria-label="Display currency"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Panels */}
      <div
        id="panel-markets"
        role="tabpanel"
        aria-labelledby="tab-markets"
        hidden={tab !== "markets"}
      >
        {tab === "markets" && <MarketsTab currency={currency} />}
      </div>

      <div
        id="panel-exchange"
        role="tabpanel"
        aria-labelledby="tab-exchange"
        hidden={tab !== "exchange"}
      >
        {tab === "exchange" && <ExchangeTab currency={currency} />}
      </div>

      <div
        id="panel-trending"
        role="tabpanel"
        aria-labelledby="tab-trending"
        hidden={tab !== "trending"}
      >
        {tab === "trending" && <TrendingTab currency={currency} />}
      </div>
    </div>
  );
}
