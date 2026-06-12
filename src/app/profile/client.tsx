"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types";

const HOSTINGER_UPLOAD_URL = process.env.NEXT_PUBLIC_HOSTINGER_UPLOAD_URL ?? "";

interface Props {
  user: User;
  profile: Profile | null;
}

export default function ProfileClient({ user, profile }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<"profile" | "security" | "danger">("profile");
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [website, setWebsite] = useState(profile?.website ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Security tab
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  // OTP tab
  const [otpEmail, setOtpEmail] = useState(user.email ?? "");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Danger tab
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { flash("err", "Max file size is 5 MB."); return; }
    if (!file.type.startsWith("image/")) { flash("err", "Only image files allowed."); return; }

    setUploading(true);
    try {
      if (!HOSTINGER_UPLOAD_URL) throw new Error("Upload URL not configured. Set NEXT_PUBLIC_HOSTINGER_UPLOAD_URL.");
      const form = new FormData();
      form.append("file", file);
      form.append("uid", user.id);
      const res = await fetch(HOSTINGER_UPLOAD_URL, { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const url: string = data.url;
      setAvatarUrl(url);
      // Also save to profile immediately
      await supabase.from("profiles").upsert({ id: user.id, avatar_url: url, updated_at: new Date().toISOString() });
      flash("ok", "Photo updated!");
    } catch (err) {
      flash("err", (err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto() {
    setUploading(true);
    await supabase.from("profiles").upsert({ id: user.id, avatar_url: null, updated_at: new Date().toISOString() });
    setAvatarUrl("");
    setUploading(false);
    flash("ok", "Photo removed.");
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      username: username || null,
      bio: bio || null,
      website: website || null,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) { flash("err", error.message); return; }
    flash("ok", "Profile saved!");
    router.refresh();
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { flash("err", "New passwords don't match."); return; }
    if (newPw.length < 8) { flash("err", "Password must be ≥ 8 characters."); return; }
    setChangingPw(true);
    // Re-authenticate first
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email!, password: curPw });
    if (signInError) { flash("err", "Current password is incorrect."); setChangingPw(false); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setChangingPw(false);
    if (error) { flash("err", error.message); return; }
    flash("ok", "Password changed successfully!");
    setCurPw(""); setNewPw(""); setConfirmPw("");
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setOtpLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: otpEmail, options: { shouldCreateUser: false } });
    setOtpLoading(false);
    if (error) { flash("err", error.message); return; }
    setOtpSent(true);
    flash("ok", "OTP sent to " + otpEmail);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setOtpLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email: otpEmail, token: otpCode, type: "email" });
    setOtpLoading(false);
    if (error) { flash("err", error.message); return; }
    flash("ok", "Email verified!");
    setOtpSent(false); setOtpCode("");
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (deleteConfirm !== "DELETE") { flash("err", "Type DELETE to confirm."); return; }
    setDeleting(true);
    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } catch {
      flash("err", "Could not delete account. Please try again.");
      setDeleting(false);
      return;
    }
    router.push("/?account=deleted");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = (fullName || user.email || "U").slice(0, 2).toUpperCase();

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-sm text-muted">{user.email}</p>
        </div>
        <button type="button" onClick={handleSignOut}
          className="rounded-xl border border-app px-4 py-2 text-sm font-medium text-muted hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
          Sign out
        </button>
      </div>

      {/* Avatar */}
      <div className="mb-8 flex items-center gap-5">
        <div className="relative">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" width={80} height={80}
              className="h-20 w-20 rounded-2xl object-cover border border-app" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-black text-white">
              {initials}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {uploading ? "Uploading…" : "Change photo"}
          </button>
          {avatarUrl && (
            <button type="button" onClick={handleRemovePhoto} disabled={uploading}
              className="rounded-xl border border-app px-4 py-2 text-sm font-medium text-muted hover:bg-[var(--surface-2)] hover:text-red-600 disabled:opacity-60">
              Remove
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`mb-6 rounded-xl px-4 py-3 text-sm ${msg.type === "ok" ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-app bg-[var(--surface-2)] p-1">
        {(["profile", "security", "danger"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-colors ${tab === t ? "surface shadow text-[var(--text)]" : "text-muted hover:text-[var(--text)]"}`}>
            {t === "danger" ? "⚠️ Danger" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <form onSubmit={handleSaveProfile} className="surface rounded-2xl border border-app p-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="full-name" className="mb-1.5 block text-sm font-medium">Full name</label>
              <input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                placeholder="Jane Doe" />
            </div>
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium">Username</label>
              <input id="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                placeholder="jane_doe" />
            </div>
          </div>
          <div>
            <label htmlFor="bio" className="mb-1.5 block text-sm font-medium">Bio</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
              className="w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="Tell us about yourself…" />
          </div>
          <div>
            <label htmlFor="website" className="mb-1.5 block text-sm font-medium">Website</label>
            <input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="https://yoursite.com" />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {saving ? "Saving…" : "Save changes"}
            </button>
            <p className="text-xs text-muted">Email: {user.email}</p>
          </div>
        </form>
      )}

      {/* Security Tab */}
      {tab === "security" && (
        <div className="space-y-6">
          {/* Change password */}
          <div className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-4 text-base font-semibold">Change password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="cur-pw" className="mb-1.5 block text-sm font-medium">Current password</label>
                <div className="relative">
                  <input id="cur-pw" type={showPw ? "text" : "password"} required value={curPw} onChange={(e) => setCurPw(e.target.value)}
                    className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 pr-12 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label="Toggle visibility">
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="new-pw" className="mb-1.5 block text-sm font-medium">New password</label>
                <input id="new-pw" type={showPw ? "text" : "password"} required value={newPw} onChange={(e) => setNewPw(e.target.value)}
                  className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="min 8 characters" />
              </div>
              <div>
                <label htmlFor="confirm-pw" className="mb-1.5 block text-sm font-medium">Confirm new password</label>
                <input id="confirm-pw" type={showPw ? "text" : "password"} required value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                  className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <button type="submit" disabled={changingPw}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                {changingPw ? "Updating…" : "Change password"}
              </button>
            </form>
          </div>

          {/* OTP Verification */}
          <div className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-1 text-base font-semibold">Email OTP verification</h2>
            <p className="mb-4 text-sm text-muted">Verify your email or update via OTP code</p>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="flex gap-3">
                <input type="email" required value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)}
                  placeholder="your@email.com" aria-label="Email address for OTP"
                  className="flex-1 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                <button type="submit" disabled={otpLoading}
                  className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                  {otpLoading ? "…" : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-sm text-muted">Enter the 6-digit code sent to <strong>{otpEmail}</strong></p>
                <div className="flex gap-3">
                  <input type="text" required maxLength={6} pattern="[0-9]{6}"
                    aria-label="6-digit OTP code" placeholder="000000"
                    value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-40 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-center font-mono text-lg tracking-[0.4em] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                  <button type="submit" disabled={otpLoading || otpCode.length !== 6}
                    className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                    {otpLoading ? "…" : "Verify"}
                  </button>
                  <button type="button" onClick={() => { setOtpSent(false); setOtpCode(""); }}
                    className="rounded-xl border border-app px-4 py-2.5 text-sm text-muted hover:bg-[var(--surface-2)]">
                    Resend
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {tab === "danger" && (
        <div className="surface rounded-2xl border border-red-200 p-6 dark:border-red-900/40">
          <h2 className="mb-1 text-base font-semibold text-red-600">Delete account</h2>
          <p className="mb-4 text-sm text-muted">
            This action is permanent. All your data will be deleted and cannot be recovered.
          </p>
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full rounded-xl border border-red-200 bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-900/40"
                placeholder="DELETE" />
            </div>
            <button type="submit" disabled={deleting || deleteConfirm !== "DELETE"}
              className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40">
              {deleting ? "Deleting…" : "Permanently delete account"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
