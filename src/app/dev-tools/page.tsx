import type { Metadata } from "next";
import { DevToolsClient } from "./client";

export const metadata: Metadata = {
  title: "Developer Tools — 200+ Free Online Tools for Developers",
  description:
    "390+ free browser-based developer tools: JSON/CSV/XML converters, regex tester, hash & password generators, color and CSS generators, unit converters, date/time utilities, network and security tools, and more. 100% private — no server, no upload.",
  keywords: [
    "developer tools", "json formatter", "url shortener", "regex tester", "hash generator",
    "base64 encoder", "url encoder", "color converter", "timestamp converter", "css generator",
    "jwt decoder", "password strength", "text diff", "code tools", "free online tools",
  ],
};

export default function DevToolsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Developer Tools
        </h1>
        <p className="mt-2 text-muted">
          390+ free browser-based tools for developers. Everything runs locally — no files uploaded, no data sent to servers.
        </p>
      </div>
      <DevToolsClient />
    </main>
  );
}
