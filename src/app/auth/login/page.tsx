"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const redirect = params.get("redirect") ?? "/profile";

  useEffect(() => {
    if (params.get("error") === "auth_callback_failed") {
      setError("Authentication link expired or invalid. Please try again.");
    }
  }, [params]);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push(redirect);
    router.refresh();
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setOtpSent(true);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="surface w-full max-w-md rounded-2xl border border-app p-8 shadow-xl">
      <h1 className="mb-1 text-2xl font-bold">Welcome back</h1>
      <p className="mb-6 text-sm text-muted">Sign in to your DataForge account</p>

      {/* Mode toggle */}
      <div className="mb-6 flex rounded-xl border border-app bg-[var(--surface-2)] p-1">
        <button
          type="button"
          onClick={() => { setOtpMode(false); setOtpSent(false); setError(""); }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${!otpMode ? "surface shadow text-[var(--text)]" : "text-muted"}`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => { setOtpMode(true); setError(""); }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${otpMode ? "surface shadow text-[var(--text)]" : "text-muted"}`}
        >
          OTP / Magic Link
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {!otpMode ? (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email" required autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"} required autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 pr-12 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[var(--text)]"
                aria-label={showPw ? "Hide password" : "Show password"}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="mt-1.5 text-right">
              <Link href="/auth/forgot-password" className="text-xs text-brand-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : !otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email" required autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send OTP Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
            A 6-digit OTP was sent to <strong>{email}</strong>
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Enter OTP Code</label>
            <input
              type="text" required maxLength={6} pattern="[0-9]{6}"
              value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-center text-2xl font-mono tracking-[0.5em] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="000000"
            />
          </div>
          <button
            type="submit" disabled={loading || otp.length !== 6}
            className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Verify OTP"}
          </button>
          <button type="button" onClick={() => { setOtpSent(false); setOtp(""); }}
            className="w-full text-sm text-muted hover:text-[var(--text)]">
            ← Resend OTP
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="font-medium text-brand-600 hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
