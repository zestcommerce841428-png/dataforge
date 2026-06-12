"use client";

import { useState } from "react";
import { MarketsTab } from "./markets-tab";
import { ExchangeTab } from "./exchange-tab";
import { TrendingTab } from "./trending-tab";
import { WatchlistTab } from "./watchlist-tab";
import { PortfolioTab } from "./portfolio-tab";
import { AnalyticsTab } from "./analytics-tab";
import { ToolsTab } from "./tools-tab";

type Tab = "markets" | "exchange" | "trending" | "watchlist" | "portfolio" | "analytics" | "tools";

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
  { id: "markets",   label: "📈 Markets" },
  { id: "exchange",  label: "⚡ Exchange" },
  { id: "trending",  label: "🔥 Trending" },
  { id: "watchlist", label: "⭐ Watchlist" },
  { id: "portfolio", label: "💼 Portfolio" },
  { id: "analytics", label: "🗺 Analytics" },
  { id: "tools",     label: "🔧 Tools" },
];

const CURRENCY_TABS: Tab[] = ["markets", "trending", "watchlist", "portfolio"];

export function CryptoDashboard() {
  const [tab, setTab] = useState<Tab>("markets");
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES[0]);

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-4 overflow-x-auto pb-1">
        <div
          role="tablist"
          aria-label="Crypto dashboard sections"
          className="surface inline-flex min-w-max gap-1 rounded-2xl border p-1.5"
        >
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              onClick={() => setTab(id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === id
                  ? "bg-brand-600 text-white shadow"
                  : "text-muted hover:text-[var(--text)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Currency selector — only for tabs that use it */}
      {CURRENCY_TABS.includes(tab) && (
        <div className="mb-5 flex items-center gap-2">
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
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Panels — lazy-mounted on first visit */}
      <div id="panel-markets" role="tabpanel" aria-labelledby="tab-markets" hidden={tab !== "markets"}>
        {tab === "markets" && <MarketsTab currency={currency} />}
      </div>

      <div id="panel-exchange" role="tabpanel" aria-labelledby="tab-exchange" hidden={tab !== "exchange"}>
        {tab === "exchange" && <ExchangeTab currency={currency} />}
      </div>

      <div id="panel-trending" role="tabpanel" aria-labelledby="tab-trending" hidden={tab !== "trending"}>
        {tab === "trending" && <TrendingTab currency={currency} />}
      </div>

      <div id="panel-watchlist" role="tabpanel" aria-labelledby="tab-watchlist" hidden={tab !== "watchlist"}>
        {tab === "watchlist" && <WatchlistTab currency={currency} />}
      </div>

      <div id="panel-portfolio" role="tabpanel" aria-labelledby="tab-portfolio" hidden={tab !== "portfolio"}>
        {tab === "portfolio" && <PortfolioTab currency={currency} />}
      </div>

      <div id="panel-analytics" role="tabpanel" aria-labelledby="tab-analytics" hidden={tab !== "analytics"}>
        {tab === "analytics" && <AnalyticsTab />}
      </div>

      <div id="panel-tools" role="tabpanel" aria-labelledby="tab-tools" hidden={tab !== "tools"}>
        {tab === "tools" && <ToolsTab />}
      </div>
    </div>
  );
}
