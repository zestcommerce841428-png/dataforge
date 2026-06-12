"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => router.push("/profile"), 2000);
  }

  if (done) {
    return (
      <div className="surface w-full max-w-md rounded-2xl border border-app p-8 shadow-xl text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h1 className="mb-2 text-2xl font-bold">Password updated!</h1>
        <p className="text-sm text-muted">Redirecting to your profile…</p>
      </div>
    );
  }

  return (
    <div className="surface w-full max-w-md rounded-2xl border border-app p-8 shadow-xl">
      <h1 className="mb-1 text-2xl font-bold">New password</h1>
      <p className="mb-6 text-sm text-muted">Choose a strong password for your account</p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">New password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"} required autoComplete="new-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 pr-12 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="min 8 characters"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              aria-label={showPw ? "Hide" : "Show"}>
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Confirm password</label>
          <input
            type={showPw ? "text" : "password"} required autoComplete="new-password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            placeholder="repeat password"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
