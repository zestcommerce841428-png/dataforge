import type { Metadata } from "next";
import { ColorToolkit } from "./color-client";

export const metadata: Metadata = {
  title: "Color Toolkit — Convert, Contrast, Palette & Accessibility",
  description: "Convert between Hex, RGB, HSL, CMYK. Check WCAG contrast ratios, simulate color blindness, generate complementary palettes and CSS snippets.",
  alternates: { canonical: "/color-toolkit" },
};

export default function ColorToolkitPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Color Toolkit</h1>
        <p className="mt-2 text-muted">Convert, contrast-check, palette-generate and simulate color blindness — all in one place.</p>
      </header>
      <ColorToolkit />
    </main>
  );
}
