import type { Metadata } from "next";
import { FormatConverterClient } from "./client";

export const metadata: Metadata = {
  title: "JSON / YAML / XML / CSV Converter — Convert Any Data Format Online",
  description:
    "Convert between JSON, YAML, XML and CSV instantly in your browser. Any-to-any data format conversion with live output, copy and download. Private and free — nothing is uploaded.",
  keywords: [
    "json to yaml", "yaml to json", "json to xml", "xml to json", "json to csv", "csv to json",
    "yaml to csv", "data format converter", "convert json yaml xml csv online",
  ],
};

export default function FormatConverterPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Data Format Converter</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Convert between <strong>JSON, YAML, XML and CSV</strong> any-to-any. Pick your input and
          output formats, paste your data, and get instant results — all in your browser.
        </p>
      </div>
      <FormatConverterClient />
    </main>
  );
}
