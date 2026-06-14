"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { appUrl } from "@/lib/site";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: appUrl("/auth/callback?type=recovery"),
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="surface w-full max-w-md rounded-2xl border border-app p-8 shadow-xl text-center">
        <div className="mb-4 text-5xl">📬</div>
        <h1 className="mb-2 text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-muted">
          We sent a password reset link to <strong>{email}</strong>. The link expires in 1 hour.
        </p>
        <Link href="/auth/login" className="mt-6 inline-block text-sm text-brand-600 hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="surface w-full max-w-md rounded-2xl border border-app p-8 shadow-xl">
      <h1 className="mb-1 text-2xl font-bold">Reset password</h1>
      <p className="mb-6 text-sm text-muted">Enter your email to receive a reset link</p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <input
            type="email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            placeholder="you@example.com"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Remember your password?{" "}
        <Link href="/auth/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
