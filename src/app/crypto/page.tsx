import type { Metadata } from "next";
import { CryptoDashboard } from "@/components/crypto/dashboard";
import { TickerTape } from "@/components/crypto/ticker-tape";

export const metadata: Metadata = {
  title: "Crypto Tracker — Live Prices, Binance Exchange & Market Data",
  description:
    "Advanced crypto tracker with live prices, Binance exchange, portfolio tracker, watchlist, market heatmap, DeFi TVL, technical indicators (RSI, VWAP, MA), DCA calculator, and more. Free, no sign-up.",
  keywords: ["crypto", "bitcoin", "ethereum", "binance", "live price", "order book", "candlestick", "portfolio", "DeFi", "RSI", "VWAP", "heatmap", "watchlist"],
  alternates: { canonical: "/crypto" },
  openGraph: {
    title: "DataForge Crypto — Live Prices & Binance Exchange",
    description: "Live crypto market data powered by CoinGecko + Binance public APIs.",
  },
};

export default function CryptoPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Crypto{" "}
          <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
            Tracker
          </span>
        </h1>
        <p className="mt-2 text-muted">
          Live prices · Binance exchange · Watchlist · Portfolio · Heatmap · DeFi TVL · RSI/VWAP/MA · DCA &amp; ROI calculators · No API key required.
        </p>
      </div>
      <TickerTape />
      <CryptoDashboard />
    </div>
  );
}
