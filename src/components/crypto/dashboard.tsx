"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { MarketsTab } from "./markets-tab";
import { ExchangeTab } from "./exchange-tab";
import { TrendingTab } from "./trending-tab";
import { WatchlistTab } from "./watchlist-tab";
import { PortfolioTab } from "./portfolio-tab";
import { AnalyticsTab } from "./analytics-tab";
import { ToolsTab } from "./tools-tab";

type Tab = "markets" | "exchange" | "trending" | "watchlist" | "portfolio" | "analytics" | "tools";

/* ── Complete CoinGecko-supported vs_currencies + major global currencies ── */
export const SUPPORTED_CURRENCIES = [
  /* ── Major Fiat ── */
  { code: "usd", label: "US Dollar",                  symbol: "$",    flag: "🇺🇸", group: "Major Fiat" },
  { code: "eur", label: "Euro",                        symbol: "€",    flag: "🇪🇺", group: "Major Fiat" },
  { code: "gbp", label: "British Pound",               symbol: "£",    flag: "🇬🇧", group: "Major Fiat" },
  { code: "jpy", label: "Japanese Yen",                symbol: "¥",    flag: "🇯🇵", group: "Major Fiat" },
  { code: "cad", label: "Canadian Dollar",             symbol: "CA$",  flag: "🇨🇦", group: "Major Fiat" },
  { code: "aud", label: "Australian Dollar",           symbol: "A$",   flag: "🇦🇺", group: "Major Fiat" },
  { code: "chf", label: "Swiss Franc",                 symbol: "Fr",   flag: "🇨🇭", group: "Major Fiat" },
  { code: "cny", label: "Chinese Yuan",                symbol: "¥",    flag: "🇨🇳", group: "Major Fiat" },
  { code: "hkd", label: "Hong Kong Dollar",            symbol: "HK$",  flag: "🇭🇰", group: "Major Fiat" },
  { code: "sgd", label: "Singapore Dollar",            symbol: "S$",   flag: "🇸🇬", group: "Major Fiat" },
  { code: "nzd", label: "New Zealand Dollar",          symbol: "NZ$",  flag: "🇳🇿", group: "Major Fiat" },
  { code: "sek", label: "Swedish Krona",               symbol: "kr",   flag: "🇸🇪", group: "Major Fiat" },
  { code: "nok", label: "Norwegian Krone",             symbol: "kr",   flag: "🇳🇴", group: "Major Fiat" },
  { code: "dkk", label: "Danish Krone",                symbol: "kr",   flag: "🇩🇰", group: "Major Fiat" },
  /* ── Asia Pacific ── */
  { code: "inr", label: "Indian Rupee",                symbol: "₹",    flag: "🇮🇳", group: "Asia Pacific" },
  { code: "krw", label: "South Korean Won",            symbol: "₩",    flag: "🇰🇷", group: "Asia Pacific" },
  { code: "twd", label: "Taiwan Dollar",               symbol: "NT$",  flag: "🇹🇼", group: "Asia Pacific" },
  { code: "idr", label: "Indonesian Rupiah",           symbol: "Rp",   flag: "🇮🇩", group: "Asia Pacific" },
  { code: "myr", label: "Malaysian Ringgit",           symbol: "RM",   flag: "🇲🇾", group: "Asia Pacific" },
  { code: "thb", label: "Thai Baht",                   symbol: "฿",    flag: "🇹🇭", group: "Asia Pacific" },
  { code: "php", label: "Philippine Peso",             symbol: "₱",    flag: "🇵🇭", group: "Asia Pacific" },
  { code: "vnd", label: "Vietnamese Dong",             symbol: "₫",    flag: "🇻🇳", group: "Asia Pacific" },
  { code: "pkr", label: "Pakistani Rupee",             symbol: "₨",    flag: "🇵🇰", group: "Asia Pacific" },
  { code: "bdt", label: "Bangladeshi Taka",            symbol: "৳",    flag: "🇧🇩", group: "Asia Pacific" },
  { code: "lkr", label: "Sri Lankan Rupee",            symbol: "Rs",   flag: "🇱🇰", group: "Asia Pacific" },
  { code: "mmk", label: "Myanmar Kyat",                symbol: "K",    flag: "🇲🇲", group: "Asia Pacific" },
  /* ── Europe ── */
  { code: "pln", label: "Polish Zloty",                symbol: "zł",   flag: "🇵🇱", group: "Europe" },
  { code: "czk", label: "Czech Koruna",                symbol: "Kč",   flag: "🇨🇿", group: "Europe" },
  { code: "huf", label: "Hungarian Forint",            symbol: "Ft",   flag: "🇭🇺", group: "Europe" },
  { code: "ron", label: "Romanian Leu",                symbol: "lei",  flag: "🇷🇴", group: "Europe" },
  { code: "hrk", label: "Croatian Kuna",               symbol: "kn",   flag: "🇭🇷", group: "Europe" },
  { code: "rsd", label: "Serbian Dinar",               symbol: "din",  flag: "🇷🇸", group: "Europe" },
  { code: "bgn", label: "Bulgarian Lev",               symbol: "лв",   flag: "🇧🇬", group: "Europe" },
  { code: "isk", label: "Icelandic Króna",             symbol: "kr",   flag: "🇮🇸", group: "Europe" },
  { code: "rub", label: "Russian Ruble",               symbol: "₽",    flag: "🇷🇺", group: "Europe" },
  { code: "uah", label: "Ukrainian Hryvnia",           symbol: "₴",    flag: "🇺🇦", group: "Europe" },
  { code: "gel", label: "Georgian Lari",               symbol: "₾",    flag: "🇬🇪", group: "Europe" },
  /* ── Middle East & Africa ── */
  { code: "sar", label: "Saudi Riyal",                 symbol: "﷼",    flag: "🇸🇦", group: "Middle East & Africa" },
  { code: "aed", label: "UAE Dirham",                  symbol: "د.إ",  flag: "🇦🇪", group: "Middle East & Africa" },
  { code: "kwd", label: "Kuwaiti Dinar",               symbol: "KD",   flag: "🇰🇼", group: "Middle East & Africa" },
  { code: "bhd", label: "Bahraini Dinar",              symbol: "BD",   flag: "🇧🇭", group: "Middle East & Africa" },
  { code: "omr", label: "Omani Rial",                  symbol: "ر.ع.", flag: "🇴🇲", group: "Middle East & Africa" },
  { code: "qar", label: "Qatari Riyal",                symbol: "ر.ق",  flag: "🇶🇦", group: "Middle East & Africa" },
  { code: "jod", label: "Jordanian Dinar",             symbol: "JD",   flag: "🇯🇴", group: "Middle East & Africa" },
  { code: "ils", label: "Israeli Shekel",              symbol: "₪",    flag: "🇮🇱", group: "Middle East & Africa" },
  { code: "try", label: "Turkish Lira",                symbol: "₺",    flag: "🇹🇷", group: "Middle East & Africa" },
  { code: "egp", label: "Egyptian Pound",              symbol: "E£",   flag: "🇪🇬", group: "Middle East & Africa" },
  { code: "mad", label: "Moroccan Dirham",             symbol: "MAD",  flag: "🇲🇦", group: "Middle East & Africa" },
  { code: "dzd", label: "Algerian Dinar",              symbol: "د.ج",  flag: "🇩🇿", group: "Middle East & Africa" },
  { code: "zar", label: "South African Rand",          symbol: "R",    flag: "🇿🇦", group: "Middle East & Africa" },
  { code: "ngn", label: "Nigerian Naira",              symbol: "₦",    flag: "🇳🇬", group: "Middle East & Africa" },
  { code: "kes", label: "Kenyan Shilling",             symbol: "KSh",  flag: "🇰🇪", group: "Middle East & Africa" },
  { code: "ghs", label: "Ghanaian Cedi",               symbol: "₵",    flag: "🇬🇭", group: "Middle East & Africa" },
  { code: "tzs", label: "Tanzanian Shilling",          symbol: "TSh",  flag: "🇹🇿", group: "Middle East & Africa" },
  { code: "ugx", label: "Ugandan Shilling",            symbol: "USh",  flag: "🇺🇬", group: "Middle East & Africa" },
  { code: "etb", label: "Ethiopian Birr",              symbol: "Br",   flag: "🇪🇹", group: "Middle East & Africa" },
  /* ── Americas ── */
  { code: "mxn", label: "Mexican Peso",                symbol: "MX$",  flag: "🇲🇽", group: "Americas" },
  { code: "brl", label: "Brazilian Real",              symbol: "R$",   flag: "🇧🇷", group: "Americas" },
  { code: "ars", label: "Argentine Peso",              symbol: "AR$",  flag: "🇦🇷", group: "Americas" },
  { code: "clp", label: "Chilean Peso",                symbol: "CL$",  flag: "🇨🇱", group: "Americas" },
  { code: "cop", label: "Colombian Peso",              symbol: "CO$",  flag: "🇨🇴", group: "Americas" },
  { code: "pen", label: "Peruvian Sol",                symbol: "S/.",  flag: "🇵🇪", group: "Americas" },
  { code: "uyu", label: "Uruguayan Peso",              symbol: "$U",   flag: "🇺🇾", group: "Americas" },
  { code: "pyg", label: "Paraguayan Guaraní",          symbol: "₲",    flag: "🇵🇾", group: "Americas" },
  { code: "bob", label: "Bolivian Boliviano",          symbol: "Bs.",  flag: "🇧🇴", group: "Americas" },
  { code: "vef", label: "Venezuelan Bolívar",          symbol: "Bs",   flag: "🇻🇪", group: "Americas" },
  { code: "bmd", label: "Bermudian Dollar",            symbol: "BD$",  flag: "🇧🇲", group: "Americas" },
  /* ── Special & IMF ── */
  { code: "xdr", label: "IMF Special Drawing Rights", symbol: "SDR",  flag: "🌐", group: "Special" },
  /* ── Commodities ── */
  { code: "xau", label: "Gold (troy oz)",              symbol: "XAU",  flag: "🥇", group: "Commodities" },
  { code: "xag", label: "Silver (troy oz)",            symbol: "XAG",  flag: "🥈", group: "Commodities" },
  /* ── Crypto ── */
  { code: "btc",  label: "Bitcoin",                   symbol: "₿",    flag: "🟠", group: "Crypto" },
  { code: "eth",  label: "Ethereum",                  symbol: "Ξ",    flag: "🔷", group: "Crypto" },
  { code: "bnb",  label: "Binance Coin",              symbol: "BNB",  flag: "🟡", group: "Crypto" },
  { code: "xrp",  label: "Ripple XRP",               symbol: "XRP",  flag: "🔵", group: "Crypto" },
  { code: "ltc",  label: "Litecoin",                  symbol: "Ł",    flag: "🔘", group: "Crypto" },
  { code: "bch",  label: "Bitcoin Cash",              symbol: "BCH",  flag: "🟢", group: "Crypto" },
  { code: "dot",  label: "Polkadot",                  symbol: "DOT",  flag: "🔴", group: "Crypto" },
  { code: "link", label: "Chainlink",                 symbol: "LINK", flag: "🔗", group: "Crypto" },
  { code: "xlm",  label: "Stellar",                   symbol: "XLM",  flag: "⭐", group: "Crypto" },
  { code: "eos",  label: "EOS",                       symbol: "EOS",  flag: "⚫", group: "Crypto" },
  { code: "yfi",  label: "yearn.finance",             symbol: "YFI",  flag: "💰", group: "Crypto" },
  { code: "bits", label: "Bitcoin bits (μBTC)",       symbol: "bits", flag: "🔸", group: "Crypto" },
  { code: "sats", label: "Satoshis",                  symbol: "sats", flag: "⚡", group: "Crypto" },
] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

const CURRENCY_GROUPS = [
  "Major Fiat",
  "Asia Pacific",
  "Europe",
  "Middle East & Africa",
  "Americas",
  "Special",
  "Commodities",
  "Crypto",
] as const;

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "markets",   label: "📈 Markets" },
  { id: "exchange",  label: "⚡ Exchange" },
  { id: "trending",  label: "🔥 Trending" },
  { id: "watchlist", label: "⭐ Watchlist" },
  { id: "portfolio", label: "💼 Portfolio" },
  { id: "analytics", label: "🗺 Analytics" },
  { id: "tools",     label: "🔧 Tools" },
];

/* ── Professional searchable currency dropdown ── */
function CurrencyDropdown({
  value,
  onChange,
}: {
  value: Currency;
  onChange: (c: Currency) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!dropRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setSearch("");  }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  /* focus search on open */
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const q = search.toLowerCase();
  const filtered = useMemo(
    () =>
      SUPPORTED_CURRENCIES.filter(
        (c) =>
          c.code.includes(q) ||
          c.label.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q)
      ),
    [q]
  );

  const groupsToShow = CURRENCY_GROUPS.filter((g) =>
    filtered.some((c) => c.group === g)
  );

  return (
    <div ref={dropRef} className="relative shrink-0">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch(""); }}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all
          surface-2 hover:border-brand-400 focus:outline-none focus:border-brand-500
          ${open ? "border-brand-500 shadow-md" : "border-app"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select display currency"
      >
        <span className="text-base leading-none">{value.flag}</span>
        <span className="uppercase tracking-wide text-[var(--text)]">{value.code}</span>
        <span className="text-muted font-normal hidden sm:inline">{value.symbol}</span>
        <svg
          className={`ml-0.5 h-3.5 w-3.5 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-app shadow-2xl surface overflow-hidden"
          role="dialog"
          aria-label="Currency selector"
        >
          {/* Search */}
          <div className="p-2 border-b border-app">
            <div className="flex items-center gap-2 rounded-xl surface-2 border border-app px-3 py-1.5">
              <svg className="h-3.5 w-3.5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search currency…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm outline-none text-[var(--text)] placeholder:text-muted"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} className="text-muted hover:text-[var(--text)]">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Selected badge */}
          <div className="px-3 pt-2 pb-1 flex items-center gap-2">
            <span className="text-xs text-muted">Selected:</span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-brand-600/10 border border-brand-500/30 px-2 py-0.5 text-xs font-semibold text-brand-500">
              {value.flag} {value.code.toUpperCase()} — {value.label}
            </span>
          </div>

          {/* Groups + items */}
          <div className="max-h-72 overflow-y-auto overscroll-contain" role="listbox" aria-label="Currencies">
            {groupsToShow.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No currencies match &ldquo;{search}&rdquo;</p>
            ) : (
              groupsToShow.map((group) => {
                const items = filtered.filter((c) => c.group === group);
                if (!items.length) return null;
                return (
                  <div key={group}>
                    <div className="sticky top-0 surface z-10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted border-b border-app/50">
                      {group}
                    </div>
                    {items.map((c) => {
                      const active = c.code === value.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => { onChange(c as Currency); setOpen(false); setSearch(""); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors
                            ${active
                              ? "bg-brand-600/10 text-brand-500"
                              : "hover:bg-brand-600/5 text-[var(--text)]"
                            }`}
                        >
                          <span className="text-base leading-none w-5 text-center shrink-0">{c.flag}</span>
                          <span className="font-bold uppercase tracking-wide text-xs w-10 shrink-0">{c.code}</span>
                          <span className="flex-1 truncate text-xs text-muted">{c.label}</span>
                          <span className="shrink-0 text-xs font-mono text-muted">{c.symbol}</span>
                          {active && (
                            <svg className="h-3.5 w-3.5 shrink-0 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer count */}
          <div className="border-t border-app px-3 py-1.5 text-center text-[10px] text-muted">
            {filtered.length} of {SUPPORTED_CURRENCIES.length} currencies
          </div>
        </div>
      )}
    </div>
  );
}

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

        {/* Professional currency dropdown */}
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <span className="text-xs font-medium text-muted whitespace-nowrap hidden sm:inline">Currency:</span>
          <CurrencyDropdown value={currency} onChange={setCurrency} />
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
