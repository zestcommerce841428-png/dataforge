import type { Metadata } from "next";
import { TOTAL_GENERATORS } from "@/lib/generators";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about DataForge — a free, privacy-first suite of online data generators.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="prose-df mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">About DataForge</h1>
      <p className="mt-4 text-muted">
        DataForge is a free collection of {TOTAL_GENERATORS} online generators built for
        developers, QA engineers, designers and anyone who needs realistic sample data fast.
      </p>
      <h2 className="mt-8 text-xl font-bold">Privacy by design</h2>
      <p className="mt-2 text-muted">
        Every generator runs entirely in your browser using the Web Crypto API. No input or
        output is ever transmitted to a server, logged, or stored. Close the tab and it&apos;s gone.
      </p>
      <h2 className="mt-8 text-xl font-bold">Built for testing</h2>
      <p className="mt-2 text-muted">
        All generated identifiers, addresses and wallet strings are fictional and intended for
        software testing, demos and education only. They do not correspond to real people,
        devices or accounts.
      </p>
      <h2 className="mt-8 text-xl font-bold">Tech</h2>
      <p className="mt-2 text-muted">
        Built with the latest Next.js (App Router) and Tailwind CSS, statically rendered for
        speed, with full keyboard accessibility, dark mode and switchable backgrounds.
      </p>
    </article>
  );
}
