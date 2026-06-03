import type { Metadata } from "next";
import { CryptoDashboard } from "@/components/crypto/dashboard";

export const metadata: Metadata = {
  title: "Crypto Tracker — Live Prices, Binance Exchange & Market Data",
  description:
    "Live cryptocurrency prices from CoinGecko, real-time Binance exchange data with order book, trade feed, candlestick charts and WebSocket ticker streams. Free, no sign-up.",
  keywords: ["crypto", "bitcoin", "ethereum", "binance", "live price", "order book", "candlestick"],
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
          Live market data via{" "}
          <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
            CoinGecko
          </a>{" "}
          · Real-time order book, trades &amp; candlestick charts via{" "}
          <a href="https://www.binance.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
            Binance
          </a>{" "}
          public APIs · WebSocket live feed · No API key required.
        </p>
      </div>
      <CryptoDashboard />
    </div>
  );
}
