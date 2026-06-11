import type { Metadata } from "next";
import { BaseConverter } from "./base-client";

export const metadata: Metadata = {
  title: "Base Converter — Decimal, Binary, Hex, Octal, Base64",
  description: "Convert numbers between decimal, binary, octal, hexadecimal, Base32, Base58 and Base64. Visual bit layout, signed/unsigned, one-click copy.",
  alternates: { canonical: "/base-converter" },
};

export default function BaseConverterPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Base Converter</h1>
        <p className="mt-2 text-muted">Convert numbers instantly across all common bases. Visual bit layout included.</p>
      </header>
      <BaseConverter />
    </main>
  );
}
