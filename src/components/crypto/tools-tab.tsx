"use client";

import { useEffect, useRef, useState } from "react";
import type { Currency } from "./dashboard";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fm = (n: number, digits = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

const fmtC = (n: number, sym: string) => `${sym}${fm(n)}`;

/* ── Crypto Converter ─────────────────────────────────────────────────────── */
const CONVERTER_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink" },
  { id: "uniswap", symbol: "UNI", name: "Uniswap" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin" },
  { id: "near", symbol: "NEAR", name: "NEAR" },
  { id: "cosmos", symbol: "ATOM", name: "Cosmos" },
  { id: "aave", symbol: "AAVE", name: "Aave" },
];

const FIAT = [
  { code: "usd", symbol: "$", name: "USD" },
  { code: "eur", symbol: "€", name: "EUR" },
  { code: "gbp", symbol: "£", name: "GBP" },
  { code: "jpy", symbol: "¥", name: "JPY" },
  { code: "inr", symbol: "₹", name: "INR" },
  { code: "cad", symbol: "CA$", name: "CAD" },
  { code: "aud", symbol: "A$", name: "AUD" },
  { code: "chf", symbol: "Fr", name: "CHF" },
  { code: "krw", symbol: "₩", name: "KRW" },
  { code: "cny", symbol: "¥", name: "CNY" },
  { code: "btc", symbol: "₿", name: "BTC" },
  { code: "eth", symbol: "Ξ", name: "ETH" },
];

function CryptoConverter({ currency }: { currency: Currency }) {
  const [fromCoin, setFromCoin] = useState("bitcoin");
  const [toFiat, setToFiat] = useState(currency.code);
  const [amount, setAmount] = useState("1");
  const [prices, setPrices] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync toFiat when global currency changes
  useEffect(() => { setToFiat(currency.code); }, [currency.code]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const ids = CONVERTER_COINS.map((c) => c.id).join(",");
      const fiats = FIAT.map((f) => f.code).join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${fiats}`
      );
      if (res.ok) { setPrices(await res.json()); setLastFetch(new Date()); }
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrices();
    timer.current = setInterval(fetchPrices, 60000);
    return () => { if (timer.current) clearInterval(timer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const amt = parseFloat(amount) || 0;
  const priceInFiat = prices[fromCoin]?.[toFiat] ?? 0;
  const result = amt * priceInFiat;
  const fiatInfo = FIAT.find((f) => f.code === toFiat);
  const coinInfo = CONVERTER_COINS.find((c) => c.id === fromCoin);

  const allPrices = CONVERTER_COINS.map((c) => ({
    ...c,
    price: prices[c.id]?.[toFiat] ?? 0,
    value: amt * (prices[c.id]?.[toFiat] ?? 0),
  })).filter((c) => c.price > 0);

  return (
    <div className="space-y-5">
      <div className="surface rounded-2xl border p-5">
        <h3 className="mb-4 text-sm font-bold">💱 Crypto Converter</h3>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted">Amount & Coin</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="surface-2 min-w-0 flex-1 rounded-xl border border-app px-3 py-2.5 font-mono text-sm outline-none focus:border-brand-400"
              />
              <select
                value={fromCoin}
                onChange={(e) => setFromCoin(e.target.value)}
                className="surface-2 rounded-xl border border-app px-3 py-2.5 text-sm font-semibold outline-none focus:border-brand-400"
              >
                {CONVERTER_COINS.map((c) => (
                  <option key={c.id} value={c.id}>{c.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-end justify-center pb-1 text-2xl text-muted">=</div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted">Result</label>
            <div className="flex gap-2">
              <div className="surface-2 flex-1 rounded-xl border border-app px-3 py-2.5 font-mono text-sm font-semibold">
                {loading ? (
                  <span className="block h-4 w-24 animate-pulse rounded bg-[var(--surface-2)]" />
                ) : (
                  result > 0
                    ? `${fiatInfo?.symbol ?? ""}${result < 0.01 ? result.toExponential(4) : fm(result, result < 1 ? 6 : 2)}`
                    : "—"
                )}
              </div>
              <select
                value={toFiat}
                onChange={(e) => setToFiat(e.target.value)}
                className="surface-2 rounded-xl border border-app px-3 py-2.5 text-sm font-semibold outline-none focus:border-brand-400"
              >
                {FIAT.map((f) => (
                  <option key={f.code} value={f.code}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {priceInFiat > 0 && (
          <p className="mt-3 text-xs text-muted">
            1 {coinInfo?.symbol} = {fiatInfo?.symbol}{fm(priceInFiat, priceInFiat < 1 ? 6 : 2)} {fiatInfo?.name}
            {lastFetch && ` · updated ${lastFetch.toLocaleTimeString()}`}
          </p>
        )}
      </div>

      {/* Multi-coin conversion table */}
      {amt > 0 && allPrices.length > 0 && (
        <div className="surface rounded-2xl border p-5">
          <h3 className="mb-3 text-xs font-semibold text-muted">
            {fm(amt, amt < 1 ? 6 : 2)} {coinInfo?.name} equivalent in other coins (as {fiatInfo?.name} value)
          </h3>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="surface-2 border-b border-app">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted">Coin</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-muted">1 {coinInfo?.symbol} =</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-muted">{fm(amt, 4)} {coinInfo?.symbol} =</th>
                </tr>
              </thead>
              <tbody>
                {allPrices.filter((c) => c.id !== fromCoin).slice(0, 10).map((c) => (
                  <tr key={c.id} className="border-b border-app/40">
                    <td className="px-3 py-1.5 font-semibold">{c.symbol}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-muted">
                      {fiatInfo?.symbol}{fm(c.price, c.price < 1 ? 4 : 2)}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono font-semibold">
                      {fiatInfo?.symbol}{fm(c.value, c.value < 1 ? 4 : 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── DCA Calculator ───────────────────────────────────────────────────────── */
function DCACalculator({ currency }: { currency: Currency }) {
  const [investment, setInvestment] = useState("100");
  const [startPrice, setStartPrice] = useState("30000");
  const [currentPrice, setCurrentPrice] = useState("65000");
  const [months, setMonths] = useState("12");
  const [freq, setFreq] = useState<"weekly" | "monthly">("monthly");

  const inv = parseFloat(investment) || 0;
  const sp = parseFloat(startPrice) || 1;
  const cp = parseFloat(currentPrice) || 0;
  const mo = parseInt(months) || 1;
  const periods = freq === "weekly" ? mo * 4 : mo;

  // Price increases linearly from startPrice to currentPrice over periods
  const rows = Array.from({ length: Math.min(periods, 60) }, (_, i) => {
    const progress = periods > 1 ? i / (periods - 1) : 0;
    const price = sp + (cp - sp) * progress;
    const qty = inv / Math.max(price, 0.0001);
    return { period: i + 1, price, qty, invested: inv };
  });

  const totalInvested = inv * periods;
  const totalQty = rows.reduce((s, r) => s + r.qty, 0);
  const avgCost = totalQty > 0 ? totalInvested / totalQty : 0;
  const currentValue = totalQty * cp;
  const pnl = currentValue - totalInvested;
  const roi = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  return (
    <div className="space-y-5">
      <div className="surface rounded-2xl border p-5">
        <h3 className="mb-4 text-sm font-bold">📅 DCA (Dollar Cost Averaging) Calculator</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: `${freq === "weekly" ? "Weekly" : "Monthly"} investment (${currency.symbol})`, value: investment, set: setInvestment, type: "number" },
            { label: `Starting price (${currency.symbol})`, value: startPrice, set: setStartPrice, type: "number" },
            { label: `Current/exit price (${currency.symbol})`, value: currentPrice, set: setCurrentPrice, type: "number" },
            { label: "Number of months", value: months, set: setMonths, type: "number" },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
              <input
                type="number"
                min="0"
                step="any"
                value={value}
                onChange={(e) => set(e.target.value)}
                className="surface-2 w-full rounded-xl border border-app px-3 py-2.5 text-sm outline-none focus:border-brand-400"
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Frequency</label>
            <select
              value={freq}
              onChange={(e) => setFreq(e.target.value as "weekly" | "monthly")}
              className="surface-2 w-full rounded-xl border border-app px-3 py-2.5 text-sm outline-none focus:border-brand-400"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Total Invested", value: fmtC(totalInvested, currency.symbol), color: "" },
            { label: "Total Coins Bought", value: `${totalQty.toFixed(6)}`, color: "" },
            { label: "Avg Buy Price", value: fmtC(avgCost, currency.symbol), color: "" },
            { label: "Current Value", value: fmtC(currentValue, currency.symbol), color: "" },
            { label: "Profit / Loss", value: `${pnl >= 0 ? "+" : ""}${fmtC(pnl, currency.symbol)}`, color: pnl >= 0 ? "text-green-500" : "text-red-500" },
            { label: "ROI", value: `${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%`, color: roi >= 0 ? "text-green-500" : "text-red-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="surface-2 rounded-xl border border-app p-4">
              <p className="text-xs text-muted">{label}</p>
              <p className={`mt-1 text-lg font-bold tabular-nums ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule table preview */}
      {rows.length > 0 && (
        <div className="surface rounded-2xl border p-5">
          <h4 className="mb-3 text-xs font-semibold text-muted">Purchase Schedule (first {Math.min(rows.length, 12)})</h4>
          <div className="overflow-auto">
            <table className="w-full text-xs font-mono">
              <thead className="surface-2 border-b border-app">
                <tr>
                  {["Period", "Buy Price", "Coins Bought", "Cumul. Invested", "Cumul. Coins", "Value at Current"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 12).map((r, i) => {
                  const cumInvested = inv * (i + 1);
                  const cumQty = rows.slice(0, i + 1).reduce((s, x) => s + x.qty, 0);
                  const val = cumQty * cp;
                  return (
                    <tr key={r.period} className="border-b border-app/40">
                      <td className="px-3 py-1.5 text-muted">#{r.period}</td>
                      <td className="px-3 py-1.5">{currency.symbol}{fm(r.price, r.price < 1 ? 4 : 2)}</td>
                      <td className="px-3 py-1.5">{r.qty.toFixed(6)}</td>
                      <td className="px-3 py-1.5">{currency.symbol}{fm(cumInvested)}</td>
                      <td className="px-3 py-1.5">{cumQty.toFixed(6)}</td>
                      <td className={`px-3 py-1.5 font-semibold ${val >= cumInvested ? "text-green-500" : "text-red-500"}`}>
                        {currency.symbol}{fm(val)}
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

/* ── ROI Calculator ───────────────────────────────────────────────────────── */
function ROICalculator({ currency }: { currency: Currency }) {
  const [entry, setEntry] = useState("30000");
  const [exit, setExit] = useState("65000");
  const [invest, setInvest] = useState("1000");
  const [fee, setFee] = useState("0.1");

  const e = parseFloat(entry) || 0;
  const x = parseFloat(exit) || 0;
  const inv = parseFloat(invest) || 0;
  const feeRate = (parseFloat(fee) || 0) / 100;

  const qty = e > 0 ? inv / e : 0;
  const grossRevenue = qty * x;
  const entryFee = inv * feeRate;
  const exitFee = grossRevenue * feeRate;
  const totalFees = entryFee + exitFee;
  const netRevenue = grossRevenue - totalFees;
  const netPnl = netRevenue - inv;
  const roi = inv > 0 ? (netPnl / inv) * 100 : 0;
  const priceChange = e > 0 ? ((x - e) / e) * 100 : 0;
  const multiplier = e > 0 ? x / e : 0;

  return (
    <div className="surface rounded-2xl border p-5">
      <h3 className="mb-4 text-sm font-bold">📈 ROI Calculator</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: `Entry price (${currency.symbol})`, value: entry, set: setEntry },
          { label: `Exit price (${currency.symbol})`, value: exit, set: setExit },
          { label: `Investment amount (${currency.symbol})`, value: invest, set: setInvest },
          { label: "Trading fee (%)", value: fee, set: setFee },
        ].map(({ label, value, set }) => (
          <div key={label}>
            <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
            <input
              type="number"
              min="0"
              step="any"
              value={value}
              onChange={(ev) => set(ev.target.value)}
              className="surface-2 w-full rounded-xl border border-app px-3 py-2.5 text-sm outline-none focus:border-brand-400"
            />
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Coins Bought", value: qty.toFixed(8), color: "" },
          { label: "Price Change", value: `${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(2)}%`, color: priceChange >= 0 ? "text-green-500" : "text-red-500" },
          { label: "Multiplier", value: `${multiplier.toFixed(2)}×`, color: "" },
          { label: "Gross Revenue", value: fmtC(grossRevenue, currency.symbol), color: "" },
          { label: "Total Fees", value: fmtC(totalFees, currency.symbol), color: "text-red-400" },
          { label: "Net P&L", value: `${netPnl >= 0 ? "+" : ""}${fmtC(netPnl, currency.symbol)}`, color: netPnl >= 0 ? "text-green-500" : "text-red-500" },
          { label: "Net ROI", value: `${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%`, color: roi >= 0 ? "text-green-500" : "text-red-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="surface-2 rounded-xl border border-app p-4">
            <p className="text-xs text-muted">{label}</p>
            <p className={`mt-1 text-lg font-bold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Position Size Calculator ─────────────────────────────────────────────── */
function PositionSizeCalc({ currency }: { currency: Currency }) {
  const [account, setAccount] = useState("10000");
  const [riskPct, setRiskPct] = useState("2");
  const [entryPrice, setEntryPrice] = useState("65000");
  const [stopLoss, setStopLoss] = useState("60000");
  const [leverage, setLeverage] = useState("1");

  const acc = parseFloat(account) || 0;
  const risk = (parseFloat(riskPct) || 0) / 100;
  const ep = parseFloat(entryPrice) || 1;
  const sl = parseFloat(stopLoss) || 0;
  const lev = parseFloat(leverage) || 1;

  const riskAmount = acc * risk;
  const stopDist = Math.abs(ep - sl);
  const stopDistPct = ep > 0 ? (stopDist / ep) * 100 : 0;
  const positionValueUSD = stopDist > 0 ? riskAmount / (stopDist / ep) : 0;
  const positionQty = ep > 0 ? positionValueUSD / ep : 0;
  const marginRequired = positionValueUSD / Math.max(lev, 1);
  const riskReward = stopDist > 0 ? ((ep * 1.5 - ep) / stopDist) : 0; // 1.5R as example TP

  return (
    <div className="surface rounded-2xl border p-5">
      <h3 className="mb-4 text-sm font-bold">⚖️ Position Size Calculator</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: `Account size (${currency.symbol})`, value: account, set: setAccount },
          { label: "Risk per trade (%)", value: riskPct, set: setRiskPct },
          { label: `Entry price (${currency.symbol})`, value: entryPrice, set: setEntryPrice },
          { label: `Stop loss price (${currency.symbol})`, value: stopLoss, set: setStopLoss },
          { label: "Leverage (×)", value: leverage, set: setLeverage },
        ].map(({ label, value, set }) => (
          <div key={label}>
            <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
            <input
              type="number"
              min="0"
              step="any"
              value={value}
              onChange={(ev) => set(ev.target.value)}
              className="surface-2 w-full rounded-xl border border-app px-3 py-2.5 text-sm outline-none focus:border-brand-400"
            />
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: `Risk Amount (${currency.symbol})`, value: fmtC(riskAmount, currency.symbol), color: "text-red-400" },
          { label: "Stop Distance", value: `${stopDistPct.toFixed(2)}% (${currency.symbol}${fm(stopDist, 2)})`, color: "" },
          { label: `Position Size (${currency.symbol})`, value: fmtC(positionValueUSD, currency.symbol), color: "" },
          { label: "Position Size (coins)", value: positionQty.toFixed(8), color: "" },
          { label: "Margin Required", value: fmtC(marginRequired, currency.symbol), color: "" },
        ].map(({ label, value, color }) => (
          <div key={label} className="surface-2 rounded-xl border border-app p-4">
            <p className="text-xs text-muted">{label}</p>
            <p className={`mt-1 text-lg font-bold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted">
        💡 With {riskPct}% risk on a {currency.symbol}{fm(acc)} account, your max loss is {currency.symbol}{fm(riskAmount)} per trade.
        Set your position size to {positionQty.toFixed(6)} coins so a move to your stop loss costs exactly {currency.symbol}{fm(riskAmount)}.
      </p>
    </div>
  );
}

/* ── Break-even Calculator ────────────────────────────────────────────────── */
function BreakEvenCalc({ currency }: { currency: Currency }) {
  const [buyPrice, setBuyPrice] = useState("50000");
  const [fee, setFee] = useState("0.1");
  const [target, setTarget] = useState("10");

  const bp = parseFloat(buyPrice) || 0;
  const feeRate = (parseFloat(fee) || 0) / 100;
  const tgt = (parseFloat(target) || 0) / 100;

  const breakEven = bp * (1 + feeRate) / (1 - feeRate);
  const targetPrice = bp * (1 + tgt + feeRate * 2);
  const targetRoi = bp > 0 ? ((targetPrice - bp) / bp) * 100 : 0;

  return (
    <div className="surface rounded-2xl border p-5">
      <h3 className="mb-4 text-sm font-bold">🎯 Break-even & Target Calculator</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: `Buy price (${currency.symbol})`, value: buyPrice, set: setBuyPrice },
          { label: "Trading fee (%)", value: fee, set: setFee },
          { label: "Target profit (%)", value: target, set: setTarget },
        ].map(({ label, value, set }) => (
          <div key={label}>
            <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
            <input
              type="number"
              min="0"
              step="any"
              value={value}
              onChange={(ev) => set(ev.target.value)}
              className="surface-2 w-full rounded-xl border border-app px-3 py-2.5 text-sm outline-none focus:border-brand-400"
            />
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Break-even Price", value: `${currency.symbol}${fm(breakEven)}`, sub: `+${((breakEven - bp) / (bp || 1) * 100).toFixed(2)}% above buy`, color: "" },
          { label: `Target Price (${target}% profit)`, value: `${currency.symbol}${fm(targetPrice)}`, sub: `ROI incl. fees: ${targetRoi.toFixed(2)}%`, color: "text-green-500" },
          { label: "Fees Impact", value: `${currency.symbol}${fm(breakEven - bp)}`, sub: "per coin in fees to break even", color: "text-red-400" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="surface-2 rounded-xl border border-app p-4">
            <p className="text-xs text-muted">{label}</p>
            <p className={`mt-1 text-lg font-bold tabular-nums ${color}`}>{value}</p>
            <p className="mt-0.5 text-xs text-muted">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tools Tab ────────────────────────────────────────────────────────────── */
export function ToolsTab({ currency }: { currency: Currency }) {
  const [tool, setTool] = useState<"converter" | "dca" | "roi" | "position" | "breakeven">("converter");

  const TOOLS = [
    { id: "converter", label: "💱 Converter" },
    { id: "dca", label: "📅 DCA Calc" },
    { id: "roi", label: "📈 ROI Calc" },
    { id: "position", label: "⚖️ Position Size" },
    { id: "breakeven", label: "🎯 Break-even" },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Tool selector */}
      <div className="surface flex flex-wrap gap-1 rounded-2xl border p-1.5">
        {TOOLS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTool(id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tool === id ? "bg-brand-600 text-white shadow" : "text-muted hover:text-[var(--text)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tool === "converter" && <CryptoConverter currency={currency} />}
      {tool === "dca" && <DCACalculator currency={currency} />}
      {tool === "roi" && <ROICalculator currency={currency} />}
      {tool === "position" && <PositionSizeCalc currency={currency} />}
      {tool === "breakeven" && <BreakEvenCalc currency={currency} />}
    </div>
  );
}
