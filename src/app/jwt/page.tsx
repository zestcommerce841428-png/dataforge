import type { Metadata } from "next";
import { JwtDebugger } from "./jwt-client";

export const metadata: Metadata = {
  title: "JWT Debugger — Decode & Verify JSON Web Tokens",
  description: "Decode JWT header and payload instantly in your browser. Inspect all claims, check expiry, verify HMAC signatures. No data leaves your device.",
  alternates: { canonical: "/jwt" },
};

export default function JwtPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">JWT Debugger</h1>
        <p className="mt-2 text-muted">Decode and inspect JSON Web Tokens instantly. Verify signatures with a secret. Nothing leaves your browser.</p>
      </header>
      <JwtDebugger />
    </main>
  );
}
