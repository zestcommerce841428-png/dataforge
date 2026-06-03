import type { Metadata } from "next";
import { FileConverterClient } from "./file-converter-client";

export const metadata: Metadata = {
  title: "Advanced File Converter — Convert Images, Data & Text Files",
  description:
    "Free browser-based file converter. Convert images (PNG/JPG/WebP/BMP/ICO), data formats (JSON/CSV/XML/TSV/YAML), and text (Markdown/HTML). 100% private — files never leave your device.",
  keywords: [
    "file converter", "image converter", "png to jpg", "jpg to webp",
    "json to csv", "csv to json", "xml to json", "markdown to html",
    "free file converter", "online converter", "no upload",
  ],
  openGraph: {
    title: "Advanced File Converter — Convert Images, Data & Text Files",
    description: "Convert images, data files, and documents — 100% in your browser.",
    type: "website",
  },
};

export default function FileConverterPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Advanced File Converter
        </h1>
        <p className="mt-2 text-muted">
          Convert images, data files, and documents between formats — entirely in your browser.
          Nothing is uploaded to any server.
        </p>
      </div>
      <FileConverterClient />
    </main>
  );
}
