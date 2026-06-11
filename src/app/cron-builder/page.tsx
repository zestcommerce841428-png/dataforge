import type { Metadata } from "next";
import { CronBuilder } from "./cron-client";

export const metadata: Metadata = {
  title: "Cron Expression Builder — Visual Cron Job Generator",
  description: "Build cron expressions visually. Get human-readable descriptions, see the next 10 scheduled runs, and copy the cron string. Free, in-browser.",
  alternates: { canonical: "/cron-builder" },
};

export default function CronBuilderPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Cron Expression Builder</h1>
        <p className="mt-2 text-muted">Build cron schedules visually. Instant human-readable description and next run times.</p>
      </header>
      <CronBuilder />
    </main>
  );
}
