"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = getStrength(password);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="surface w-full max-w-md rounded-2xl border border-app p-8 shadow-xl text-center">
        <div className="mb-4 text-5xl">📧</div>
        <h1 className="mb-2 text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-muted">
          We sent a verification link to <strong>{email}</strong>. Click it to activate your account.
          Check spam if you don&apos;t see it within a minute.
        </p>
        <Link href="/auth/login" className="mt-6 inline-block text-sm text-brand-600 hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="surface w-full max-w-md rounded-2xl border border-app p-8 shadow-xl">
      <h1 className="mb-1 text-2xl font-bold">Create account</h1>
      <p className="mb-6 text-sm text-muted">Join DataForge — free forever</p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Full name</label>
          <input
            type="text" required
            value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            placeholder="Jane Doe"
          />
        </div>
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
              type={showPw ? "text" : "password"} required autoComplete="new-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 pr-12 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="min 8 characters"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[var(--text)]"
              aria-label={showPw ? "Hide password" : "Show password"}>
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0,1,2,3].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength.score ? strength.color : "bg-[var(--surface-2)]"}`} />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted">{strength.label}</p>
            </div>
          )}
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-muted">
        By signing up you agree to our{" "}
        <Link href="/terms" className="text-brand-600 hover:underline">Terms</Link> and{" "}
        <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>.
      </p>

      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function getStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  return { score, label: labels[score - 1] ?? "Too short", color: colors[score - 1] ?? "bg-[var(--surface-2)]" };
}
