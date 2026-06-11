import type { Metadata } from "next";
import { BulkTemplateGenerator } from "./bulk-template-client";

export const metadata: Metadata = {
  title: "Bulk Template Generator — Generate Multiple Outputs at Once",
  description: "Apply any DataForge generator to produce 5–200 unique outputs in one click. Copy all, download as CSV or JSON, or pick favorites.",
  alternates: { canonical: "/bulk-template" },
};

export default function BulkTemplatePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Bulk Template Generator</h1>
        <p className="mt-2 text-muted">Choose any generator and produce up to 200 unique outputs in one click.</p>
      </header>
      <BulkTemplateGenerator />
    </main>
  );
}
