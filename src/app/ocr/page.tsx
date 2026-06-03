import type { Metadata } from "next";
import { OcrClient } from "./ocr-client";

export const metadata: Metadata = {
  title: "Advanced OCR — Extract Text from Any Image or PDF",
  description:
    "Free browser-based OCR tool. Upload any image (PNG, JPG, WebP, BMP, TIFF, GIF) or PDF and extract text instantly. 100% private — files never leave your device.",
  keywords: [
    "ocr", "optical character recognition", "image to text", "pdf to text",
    "extract text", "scan text", "free ocr", "online ocr", "tesseract",
  ],
  openGraph: {
    title: "Advanced OCR — Extract Text from Any Image or PDF",
    description: "Free browser-based OCR. 100% private — nothing uploaded to any server.",
    type: "website",
  },
};

export default function OcrPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Advanced OCR
        </h1>
        <p className="mt-2 text-muted">
          Extract text from any image or PDF — runs entirely in your browser.
          Files never leave your device.
        </p>
      </div>
      <OcrClient />
    </main>
  );
}
