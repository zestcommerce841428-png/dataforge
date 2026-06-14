"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const INPUT = "w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);

  function startCooldown() {
    setResendIn(45);
    const id = setInterval(() => setResendIn((s) => (s <= 1 ? (clearInterval(id), 0) : s - 1)), 1000);
  }

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("Enter a valid email address."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setStep("code");
      startCooldown();
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code)) { setError("Enter the 6-digit code from your email."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) { setError(data.error ?? "Could not reset password."); return; }
      router.push("/auth/login?reset=1");
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="surface w-full max-w-md rounded-2xl border border-app p-8 shadow-xl">
      <h1 className="mb-1 text-2xl font-bold">Reset password</h1>
      <p className="mb-6 text-sm text-muted">
        {step === "email"
          ? "Enter your email to receive a 6-digit reset code"
          : `Enter the code we sent to ${email} and choose a new password`}
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {step === "email" ? (
        <form onSubmit={sendCode} className="space-y-4">
          <div>
            <label htmlFor="fp-email" className="mb-1.5 block text-sm font-medium">Email</label>
            <input id="fp-email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} className={INPUT} placeholder="you@example.com" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {loading ? "Sending…" : "Send reset code"}
          </button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="space-y-4">
          <div>
            <label htmlFor="fp-code" className="mb-1.5 block text-sm font-medium">Verification code</label>
            <input id="fp-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={INPUT + " text-center text-xl font-bold tracking-[0.4em]"} placeholder="000000" autoFocus />
          </div>
          <div>
            <label htmlFor="fp-pw" className="mb-1.5 block text-sm font-medium">New password</label>
            <div className="relative">
              <input id="fp-pw" type={showPw ? "text" : "password"} required autoComplete="new-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className={INPUT + " pr-12"} placeholder="min 8 characters" />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label={showPw ? "Hide" : "Show"}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="fp-confirm" className="mb-1.5 block text-sm font-medium">Confirm password</label>
            <input id="fp-confirm" type={showPw ? "text" : "password"} required autoComplete="new-password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className={INPUT} placeholder="repeat password" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {loading ? "Updating…" : "Reset password"}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => { setStep("email"); setError(""); }}
              className="text-muted hover:text-[var(--text)]">← Change email</button>
            <button type="button" onClick={() => sendCode()} disabled={resendIn > 0}
              className="text-brand-600 hover:underline disabled:text-muted disabled:no-underline">
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        Remember your password?{" "}
        <Link href="/auth/login" className="font-medium text-brand-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
