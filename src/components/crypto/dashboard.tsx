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

/* ── All CoinGecko-supported vs_currencies ──────────────────────────────── */
export const SUPPORTED_CURRENCIES = [
  /* ── Fiat ── */
  { code: "usd", label: "USD — US Dollar",              symbol: "$",   group: "Fiat" },
  { code: "eur", label: "EUR — Euro",                   symbol: "€",   group: "Fiat" },
  { code: "gbp", label: "GBP — British Pound",          symbol: "£",   group: "Fiat" },
  { code: "jpy", label: "JPY — Japanese Yen",           symbol: "¥",   group: "Fiat" },
  { code: "cad", label: "CAD — Canadian Dollar",        symbol: "CA$", group: "Fiat" },
  { code: "aud", label: "AUD — Australian Dollar",      symbol: "A$",  group: "Fiat" },
  { code: "chf", label: "CHF — Swiss Franc",            symbol: "Fr",  group: "Fiat" },
  { code: "cny", label: "CNY — Chinese Yuan",           symbol: "¥",   group: "Fiat" },
  { code: "inr", label: "INR — Indian Rupee",           symbol: "₹",   group: "Fiat" },
  { code: "krw", label: "KRW — South Korean Won",       symbol: "₩",   group: "Fiat" },
  { code: "sgd", label: "SGD — Singapore Dollar",       symbol: "S$",  group: "Fiat" },
  { code: "hkd", label: "HKD — Hong Kong Dollar",       symbol: "HK$", group: "Fiat" },
  { code: "nzd", label: "NZD — New Zealand Dollar",     symbol: "NZ$", group: "Fiat" },
  { code: "mxn", label: "MXN — Mexican Peso",           symbol: "MX$", group: "Fiat" },
  { code: "brl", label: "BRL — Brazilian Real",         symbol: "R$",  group: "Fiat" },
  { code: "sek", label: "SEK — Swedish Krona",          symbol: "kr",  group: "Fiat" },
  { code: "nok", label: "NOK — Norwegian Krone",        symbol: "kr",  group: "Fiat" },
  { code: "dkk", label: "DKK — Danish Krone",           symbol: "kr",  group: "Fiat" },
  { code: "pln", label: "PLN — Polish Zloty",           symbol: "zł",  group: "Fiat" },
  { code: "czk", label: "CZK — Czech Koruna",           symbol: "Kč",  group: "Fiat" },
  { code: "huf", label: "HUF — Hungarian Forint",       symbol: "Ft",  group: "Fiat" },
  { code: "rub", label: "RUB — Russian Ruble",          symbol: "₽",   group: "Fiat" },
  { code: "uah", label: "UAH — Ukrainian Hryvnia",      symbol: "₴",   group: "Fiat" },
  { code: "try", label: "TRY — Turkish Lira",           symbol: "₺",   group: "Fiat" },
  { code: "sar", label: "SAR — Saudi Riyal",            symbol: "﷼",   group: "Fiat" },
  { code: "aed", label: "AED — UAE Dirham",             symbol: "د.إ", group: "Fiat" },
  { code: "ils", label: "ILS — Israeli Shekel",         symbol: "₪",   group: "Fiat" },
  { code: "zar", label: "ZAR — South African Rand",     symbol: "R",   group: "Fiat" },
  { code: "ngn", label: "NGN — Nigerian Naira",         symbol: "₦",   group: "Fiat" },
  { code: "idr", label: "IDR — Indonesian Rupiah",      symbol: "Rp",  group: "Fiat" },
  { code: "myr", label: "MYR — Malaysian Ringgit",      symbol: "RM",  group: "Fiat" },
  { code: "thb", label: "THB — Thai Baht",              symbol: "฿",   group: "Fiat" },
  { code: "php", label: "PHP — Philippine Peso",        symbol: "₱",   group: "Fiat" },
  { code: "vnd", label: "VND — Vietnamese Dong",        symbol: "₫",   group: "Fiat" },
  { code: "twd", label: "TWD — Taiwan Dollar",          symbol: "NT$", group: "Fiat" },
  { code: "pkr", label: "PKR — Pakistani Rupee",        symbol: "₨",   group: "Fiat" },
  { code: "bdt", label: "BDT — Bangladeshi Taka",       symbol: "৳",   group: "Fiat" },
  { code: "lkr", label: "LKR — Sri Lankan Rupee",       symbol: "Rs",  group: "Fiat" },
  { code: "mmk", label: "MMK — Myanmar Kyat",           symbol: "K",   group: "Fiat" },
  { code: "ars", label: "ARS — Argentine Peso",         symbol: "AR$", group: "Fiat" },
  { code: "clp", label: "CLP — Chilean Peso",           symbol: "CL$", group: "Fiat" },
  { code: "kwd", label: "KWD — Kuwaiti Dinar",          symbol: "KD",  group: "Fiat" },
  { code: "bhd", label: "BHD — Bahraini Dinar",         symbol: "BD",  group: "Fiat" },
  { code: "bmd", label: "BMD — Bermudian Dollar",       symbol: "BD$", group: "Fiat" },
  { code: "gel", label: "GEL — Georgian Lari",          symbol: "₾",   group: "Fiat" },
  { code: "vef", label: "VEF — Venezuelan Bolívar",     symbol: "Bs",  group: "Fiat" },
  { code: "xdr", label: "XDR — IMF Special Drawing Rights", symbol: "SDR", group: "Fiat" },
  /* ── Commodities ── */
  { code: "xau", label: "XAU — Gold (troy oz)",         symbol: "oz",  group: "Commodity" },
  { code: "xag", label: "XAG — Silver (troy oz)",       symbol: "oz",  group: "Commodity" },
  /* ── Crypto ── */
  { code: "btc",  label: "BTC — Bitcoin",               symbol: "₿",   group: "Crypto" },
  { code: "eth",  label: "ETH — Ethereum",              symbol: "Ξ",   group: "Crypto" },
  { code: "bnb",  label: "BNB — Binance Coin",          symbol: "BNB", group: "Crypto" },
  { code: "xrp",  label: "XRP — Ripple",                symbol: "XRP", group: "Crypto" },
  { code: "ltc",  label: "LTC — Litecoin",              symbol: "Ł",   group: "Crypto" },
  { code: "bch",  label: "BCH — Bitcoin Cash",          symbol: "BCH", group: "Crypto" },
  { code: "dot",  label: "DOT — Polkadot",              symbol: "DOT", group: "Crypto" },
  { code: "link", label: "LINK — Chainlink",            symbol: "LINK",group: "Crypto" },
  { code: "xlm",  label: "XLM — Stellar",               symbol: "XLM", group: "Crypto" },
  { code: "eos",  label: "EOS — EOS",                   symbol: "EOS", group: "Crypto" },
  { code: "yfi",  label: "YFI — yearn.finance",         symbol: "YFI", group: "Crypto" },
  { code: "bits", label: "bits — Bitcoin bits (μBTC)",  symbol: "bits",group: "Crypto" },
  { code: "sats", label: "sats — Satoshis",             symbol: "sats",group: "Crypto" },
] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

/* Group labels for the select optgroup */
const CURRENCY_GROUPS = ["Fiat", "Commodity", "Crypto"] as const;

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "markets",   label: "📈 Markets" },
  { id: "exchange",  label: "⚡ Exchange" },
  { id: "trending",  label: "🔥 Trending" },
  { id: "watchlist", label: "⭐ Watchlist" },
  { id: "portfolio", label: "💼 Portfolio" },
  { id: "analytics", label: "🗺 Analytics" },
  { id: "tools",     label: "🔧 Tools" },
];

export function CryptoDashboard() {
  const [tab, setTab] = useState<Tab>("markets");
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES[0]);

  return (
    <div>
      {/* Tab bar + currency selector — always visible */}
      <div className="mb-5 flex flex-wrap items-start gap-3">
        {/* Scrollable tab bar */}
        <div className="overflow-x-auto pb-1 flex-1">
          <nav
            aria-label="Crypto dashboard sections"
            className="surface inline-flex min-w-max gap-1 rounded-2xl border p-1.5"
          >
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
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
          </nav>
        </div>

        {/* Currency selector — always visible, affects all tabs */}
        <div className="flex shrink-0 items-center gap-2">
          <label htmlFor="currency-select" className="text-xs font-medium text-muted whitespace-nowrap">
            Currency:
          </label>
          <select
            id="currency-select"
            value={currency.code}
            onChange={(e) => {
              const c = SUPPORTED_CURRENCIES.find((x) => x.code === e.target.value);
              if (c) setCurrency(c);
            }}
            className="surface-2 rounded-xl border border-app px-3 py-2 text-sm font-semibold outline-none focus:border-brand-400 max-w-[200px]"
            aria-label="Display currency"
          >
            {CURRENCY_GROUPS.map((group) => (
              <optgroup key={group} label={group}>
                {SUPPORTED_CURRENCIES.filter((c) => c.group === group).map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Tab panels */}
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
        {tab === "analytics" && <AnalyticsTab currency={currency} />}
      </div>

      <div id="panel-tools" role="tabpanel" aria-labelledby="tab-tools" hidden={tab !== "tools"}>
        {tab === "tools" && <ToolsTab currency={currency} />}
      </div>
    </div>
  );
}
