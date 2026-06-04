import type { Metadata } from "next";
import Link from "next/link";
import { ImageToolsClient } from "./client";

export const metadata: Metadata = {
  title: "Image Resizer & Compressor — Resize, Compress & Convert Images Free",
  description:
    "Resize, compress and convert images right in your browser. Resize by pixels or percent, compress to a target file size (KB) for passport/PAN/form uploads, convert between JPG, PNG and WebP, rotate and flip. 100% private — nothing is uploaded.",
  keywords: [
    "image resizer", "compress image", "resize image", "image converter", "reduce image size",
    "compress jpeg", "image to webp", "png to jpg", "resize photo kb", "pan card photo resize",
    "passport photo resize", "image optimizer",
  ],
};

export default function ImageToolsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Image Resizer & Compressor</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Resize, compress and convert images instantly. Hit an exact file size for upload forms,
            change format, rotate and flip — all in your browser, nothing uploaded.
          </p>
        </div>
        <Link href="/pdf-tools" className="rounded-xl border border-app px-4 py-2 text-sm font-medium text-muted hover:border-brand-400 hover:text-brand-600">
          📄 PDF tools →
        </Link>
      </div>
      <ImageToolsClient />
    </main>
  );
}
