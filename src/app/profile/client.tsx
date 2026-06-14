"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bangladesh","Belgium",
  "Brazil","Canada","Chile","China","Colombia","Croatia","Czech Republic","Denmark","Egypt",
  "Ethiopia","Finland","France","Germany","Ghana","Greece","Hungary","India","Indonesia",
  "Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan","Kenya","Malaysia","Mexico",
  "Morocco","Netherlands","New Zealand","Nigeria","Norway","Pakistan","Peru","Philippines",
  "Poland","Portugal","Romania","Russia","Saudi Arabia","South Africa","South Korea","Spain",
  "Sri Lanka","Sweden","Switzerland","Thailand","Turkey","Ukraine","United Arab Emirates",
  "United Kingdom","United States","Vietnam","Other",
];

const LANGUAGES = [
  "Arabic","Bengali","Chinese","Dutch","English","French","German","Hindi","Indonesian",
  "Italian","Japanese","Korean","Malay","Persian","Polish","Portuguese","Punjabi","Russian",
  "Spanish","Swahili","Tamil","Turkish","Ukrainian","Urdu","Vietnamese","Other",
];

const INDUSTRIES = [
  "Technology","Healthcare","Finance & Banking","Education","Marketing & Advertising",
  "Design & Creative","Legal","Engineering","Sales","E-commerce","Media & Entertainment",
  "Government","Non-profit","Real Estate","Manufacturing","Agriculture","Other",
];

const INTERESTS = [
  "Web Development","Mobile Apps","Data Science","AI / Machine Learning","DevOps & Cloud",
  "Cybersecurity","UI/UX Design","Product Management","Digital Marketing","Finance & Trading",
  "Open Source","Blockchain","Game Development","Content Creation","Research",
];

const INPUT_CLS = "w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
const SELECT_CLS = INPUT_CLS + " cursor-pointer";
const LABEL_CLS = "mb-1.5 block text-sm font-medium";

type OtpMethod = "email" | "totp";
interface TotpFactor { id: string; friendly_name?: string; status: string; }

interface Props { user: User; profile: Profile | null; }

export default function ProfileClient({ user, profile }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const meta = user.user_metadata ?? {};

  const [tab, setTab] = useState<"profile" | "details" | "security" | "danger">("profile");

  // ── Basic profile ─────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState(profile?.full_name ?? meta.full_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? meta.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? meta.bio ?? "");
  const [website, setWebsite] = useState(profile?.website ?? meta.portfolio_website ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? meta.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // ── Extended personal ─────────────────────────────────────────────────────
  const [phone, setPhone] = useState(meta.phone ?? "");
  const [dob, setDob] = useState(meta.date_of_birth ?? "");
  const [gender, setGender] = useState(meta.gender ?? "");
  const [country, setCountry] = useState(meta.country ?? "");
  const [city, setCity] = useState(meta.city ?? "");
  const [language, setLanguage] = useState(meta.language ?? "English");
  const [nationality, setNationality] = useState(meta.nationality ?? "");

  // ── Extended professional ─────────────────────────────────────────────────
  const [occupation, setOccupation] = useState(meta.occupation ?? "");
  const [company, setCompany] = useState(meta.company ?? "");
  const [industry, setIndustry] = useState(meta.industry ?? "");
  const [experience, setExperience] = useState(meta.experience_years ?? "");
  const [linkedin, setLinkedin] = useState(meta.linkedin ?? "");
  const [twitterHandle, setTwitterHandle] = useState(meta.twitter ?? "");
  const [githubProfile, setGithubProfile] = useState(meta.github_profile ?? "");
  const [portfolioWebsite, setPortfolioWebsite] = useState(meta.portfolio_website ?? "");

  // ── Preferences ───────────────────────────────────────────────────────────
  const [interests, setInterests] = useState<string[]>(meta.interests ?? []);
  const [newsletter, setNewsletter] = useState(meta.newsletter ?? true);

  // ── Security — password ───────────────────────────────────────────────────
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  // ── Security — email OTP (standalone verify) ──────────────────────────────
  const [otpEmail, setOtpEmail] = useState(user.email ?? "");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // ── Security — backup email ───────────────────────────────────────────────
  const [backupEmail, setBackupEmail] = useState<string>(meta.backup_email ?? "");
  const [editingBackup, setEditingBackup] = useState(false);
  const [backupInput, setBackupInput] = useState("");
  const [backupOtpSent, setBackupOtpSent] = useState(false);
  const [backupOtpCode, setBackupOtpCode] = useState("");
  const [backupLoading, setBackupLoading] = useState(false);

  // ── Security — TOTP (authenticator app) ──────────────────────────────────
  const [totpFactors, setTotpFactors] = useState<TotpFactor[]>([]);
  const [totpLoading, setTotpLoading] = useState(true);
  const [totpEnrolling, setTotpEnrolling] = useState(false);
  const [totpEnrollData, setTotpEnrollData] = useState<{ id: string; qr_code: string; secret: string } | null>(null);
  const [totpEnrollCode, setTotpEnrollCode] = useState("");
  const [totpEnrollLoading, setTotpEnrollLoading] = useState(false);
  const [totpDisabling, setTotpDisabling] = useState(false);

  // ── Photo removal (OTP-gated) ─────────────────────────────────────────────
  const [removePhotoStep, setRemovePhotoStep] = useState<"idle" | "method" | "otp" | "totp">("idle");
  const [removeMethod, setRemoveMethod] = useState<OtpMethod>("email");
  const [removeEmailOtpSent, setRemoveEmailOtpSent] = useState(false);
  const [removeEmailCode, setRemoveEmailCode] = useState("");
  const [removeEmailLoading, setRemoveEmailLoading] = useState(false);
  const [removeTotpCode, setRemoveTotpCode] = useState("");
  const [removeTotpLoading, setRemoveTotpLoading] = useState(false);
  const [removeChallengeId, setRemoveChallengeId] = useState("");

  // ── Danger zone ───────────────────────────────────────────────────────────
  const [dangerOtpVerified, setDangerOtpVerified] = useState(false);
  const [dangerMethod, setDangerMethod] = useState<OtpMethod>("email");
  const [dangerEmailSent, setDangerEmailSent] = useState(false);
  const [dangerEmailCode, setDangerEmailCode] = useState("");
  const [dangerEmailLoading, setDangerEmailLoading] = useState(false);
  const [dangerTotpCode, setDangerTotpCode] = useState("");
  const [dangerTotpLoading, setDangerTotpLoading] = useState(false);
  const [dangerChallengeId, setDangerChallengeId] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const hasTOTP = totpFactors.some((f) => f.status === "verified");

  // ── Load TOTP factors ─────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      setTotpFactors((data?.totp ?? []) as TotpFactor[]);
      setTotpLoading(false);
    });
  }, [supabase]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 5000);
  }

  function toggleInterest(item: string) {
    setInterests((p) => p.includes(item) ? p.filter((x) => x !== item) : [...p, item]);
  }

  // ── Profile photo ─────────────────────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { flash("err", "Max file size is 5 MB."); return; }
    if (!file.type.startsWith("image/")) { flash("err", "Only image files allowed."); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("uid", user.id);
      const res = await fetch("/api/upload-avatar", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const url: string = data.url;
      setAvatarUrl(url);
      await supabase.from("profiles").upsert({ id: user.id, avatar_url: url, updated_at: new Date().toISOString() });
      flash("ok", "Photo updated!");
    } catch (err) {
      flash("err", (err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  // Remove photo — step 1: choose method (or skip to email OTP if no TOTP)
  function startRemovePhoto() {
    if (hasTOTP) {
      setRemovePhotoStep("method");
    } else {
      setRemovePhotoStep("otp");
      doSendRemoveEmailOtp();
    }
  }

  async function doSendRemoveEmailOtp() {
    setRemoveEmailLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: user.email!, options: { shouldCreateUser: false } });
    setRemoveEmailLoading(false);
    if (error) { flash("err", error.message); setRemovePhotoStep("idle"); return; }
    setRemoveEmailOtpSent(true);
    flash("ok", "OTP sent to " + user.email);
  }

  async function handleConfirmMethodAndProceed() {
    if (removeMethod === "email") {
      setRemovePhotoStep("otp");
      doSendRemoveEmailOtp();
    } else {
      setRemovePhotoStep("totp");
      // pre-challenge TOTP
      setRemoveTotpLoading(true);
      const factor = totpFactors.find((f) => f.status === "verified");
      if (!factor) { flash("err", "No TOTP factor found."); setRemovePhotoStep("idle"); return; }
      const { data, error } = await supabase.auth.mfa.challenge({ factorId: factor.id });
      setRemoveTotpLoading(false);
      if (error) { flash("err", error.message); setRemovePhotoStep("idle"); return; }
      setRemoveChallengeId(data.id);
    }
  }

  async function handleRemoveViaEmailOtp(e: React.FormEvent) {
    e.preventDefault();
    setRemoveEmailLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email: user.email!, token: removeEmailCode, type: "email" });
    if (error) { flash("err", "Invalid or expired OTP."); setRemoveEmailLoading(false); return; }
    await doActualRemove();
  }

  async function handleRemoveViaTotpCode(e: React.FormEvent) {
    e.preventDefault();
    const factor = totpFactors.find((f) => f.status === "verified");
    if (!factor || !removeChallengeId) return;
    setRemoveTotpLoading(true);
    const { error } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: removeChallengeId, code: removeTotpCode });
    if (error) { flash("err", "Invalid TOTP code."); setRemoveTotpLoading(false); return; }
    await doActualRemove();
  }

  async function doActualRemove() {
    await supabase.from("profiles").upsert({ id: user.id, avatar_url: null, updated_at: new Date().toISOString() });
    setAvatarUrl("");
    setRemovePhotoStep("idle");
    setRemoveEmailOtpSent(false);
    setRemoveEmailCode("");
    setRemoveTotpCode("");
    setRemoveChallengeId("");
    setRemoveEmailLoading(false);
    setRemoveTotpLoading(false);
    flash("ok", "Photo removed.");
  }

  // ── Profile save ──────────────────────────────────────────────────────────
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, full_name: fullName, username: username || null,
      bio: bio || null, website: website || null, updated_at: new Date().toISOString(),
    });
    if (!error) await supabase.auth.updateUser({ data: { full_name: fullName, username, bio, portfolio_website: website } });
    setSaving(false);
    if (error) { flash("err", error.message); return; }
    flash("ok", "Profile saved!");
    router.refresh();
  }

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        phone, date_of_birth: dob, gender, country, city, language, nationality,
        occupation, company, industry, experience_years: experience,
        linkedin, twitter: twitterHandle, github_profile: githubProfile,
        portfolio_website: portfolioWebsite, interests, newsletter,
      },
    });
    setSaving(false);
    if (error) { flash("err", error.message); return; }
    flash("ok", "Details saved!");
  }

  // ── Password change ───────────────────────────────────────────────────────
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { flash("err", "New passwords don't match."); return; }
    if (newPw.length < 8) { flash("err", "Password must be ≥ 8 characters."); return; }
    setChangingPw(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email!, password: curPw });
    if (signInError) { flash("err", "Current password is incorrect."); setChangingPw(false); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setChangingPw(false);
    if (error) { flash("err", error.message); return; }
    flash("ok", "Password changed successfully!");
    setCurPw(""); setNewPw(""); setConfirmPw("");
  }

  // ── Email OTP (standalone verify) ─────────────────────────────────────────
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

  // ── Backup email ──────────────────────────────────────────────────────────
  async function handleSendBackupOtp(e: React.FormEvent) {
    e.preventDefault();
    setBackupLoading(true);
    const res = await fetch("/api/auth/backup-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: backupInput }),
    });
    const data = await res.json();
    setBackupLoading(false);
    if (!res.ok) { flash("err", data.error); return; }
    setBackupOtpSent(true);
    flash("ok", "OTP sent to " + backupInput);
  }

  async function handleVerifyBackupOtp(e: React.FormEvent) {
    e.preventDefault();
    setBackupLoading(true);
    const res = await fetch("/api/auth/backup-email", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: backupOtpCode }),
    });
    const data = await res.json();
    setBackupLoading(false);
    if (!res.ok) { flash("err", data.error); return; }
    setBackupEmail(data.backup_email);
    setBackupOtpSent(false); setBackupOtpCode(""); setBackupInput(""); setEditingBackup(false);
    flash("ok", "Backup email saved!");
  }

  async function handleRemoveBackupEmail() {
    setBackupLoading(true);
    const res = await fetch("/api/auth/backup-email", { method: "DELETE" });
    setBackupLoading(false);
    if (!res.ok) { flash("err", "Failed to remove backup email."); return; }
    setBackupEmail("");
    flash("ok", "Backup email removed.");
  }

  // ── TOTP enrollment ───────────────────────────────────────────────────────
  async function handleStartTotpEnroll() {
    setTotpEnrolling(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      issuer: "DataForge",
      friendlyName: "Authenticator App",
    });
    setTotpEnrolling(false);
    if (error || !data) { flash("err", error?.message ?? "Failed to start TOTP setup."); return; }
    setTotpEnrollData({ id: data.id, qr_code: data.totp.qr_code, secret: data.totp.secret });
  }

  async function handleVerifyTotpEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!totpEnrollData) return;
    setTotpEnrollLoading(true);
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: totpEnrollData.id });
    if (cErr || !challenge) {
      flash("err", cErr?.message ?? "Challenge failed."); setTotpEnrollLoading(false); return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: totpEnrollData.id, challengeId: challenge.id, code: totpEnrollCode,
    });
    setTotpEnrollLoading(false);
    if (error) { flash("err", "Invalid code — check your authenticator app."); return; }
    const { data: factors } = await supabase.auth.mfa.listFactors();
    setTotpFactors((factors?.totp ?? []) as TotpFactor[]);
    setTotpEnrollData(null); setTotpEnrollCode("");
    flash("ok", "Authenticator app enabled! You can now use it for verification.");
  }

  async function handleCancelTotpEnroll() {
    if (totpEnrollData) {
      await supabase.auth.mfa.unenroll({ factorId: totpEnrollData.id }).catch(() => null);
    }
    setTotpEnrollData(null); setTotpEnrollCode("");
  }

  async function handleDisableTotp() {
    const factor = totpFactors.find((f) => f.status === "verified");
    if (!factor) return;
    setTotpDisabling(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    setTotpDisabling(false);
    if (error) { flash("err", error.message); return; }
    setTotpFactors([]);
    flash("ok", "Authenticator app removed.");
  }

  // ── Danger zone — email OTP path ──────────────────────────────────────────
  async function handleSendDangerEmailOtp() {
    setDangerEmailLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: user.email!, options: { shouldCreateUser: false } });
    setDangerEmailLoading(false);
    if (error) { flash("err", error.message); return; }
    setDangerEmailSent(true);
    flash("ok", "OTP sent to " + user.email);
  }

  async function handleVerifyDangerEmailOtp(e: React.FormEvent) {
    e.preventDefault();
    setDangerEmailLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email: user.email!, token: dangerEmailCode, type: "email" });
    setDangerEmailLoading(false);
    if (error) { flash("err", "Invalid or expired OTP."); return; }
    setDangerOtpVerified(true);
    flash("ok", "Identity verified. You can now delete your account.");
  }

  // ── Danger zone — TOTP path ───────────────────────────────────────────────
  async function handleStartDangerTotp() {
    const factor = totpFactors.find((f) => f.status === "verified");
    if (!factor) return;
    setDangerTotpLoading(true);
    const { data, error } = await supabase.auth.mfa.challenge({ factorId: factor.id });
    setDangerTotpLoading(false);
    if (error) { flash("err", error.message); return; }
    setDangerChallengeId(data.id);
  }

  async function handleVerifyDangerTotp(e: React.FormEvent) {
    e.preventDefault();
    const factor = totpFactors.find((f) => f.status === "verified");
    if (!factor || !dangerChallengeId) return;
    setDangerTotpLoading(true);
    const { error } = await supabase.auth.mfa.verify({
      factorId: factor.id, challengeId: dangerChallengeId, code: dangerTotpCode,
    });
    setDangerTotpLoading(false);
    if (error) { flash("err", "Invalid TOTP code. Try again."); return; }
    setDangerOtpVerified(true);
    flash("ok", "Identity verified via authenticator. You can now delete your account.");
  }

  // ── Account delete ────────────────────────────────────────────────────────
  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!dangerOtpVerified) { flash("err", "Verify your identity first."); return; }
    if (deleteConfirm !== "DELETE") { flash("err", "Type DELETE to confirm."); return; }
    setDeleting(true);
    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } catch {
      flash("err", "Could not delete account. Please try again.");
      setDeleting(false); return;
    }
    router.push("/?account=deleted");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/"); router.refresh();
  }

  const initials = (fullName || user.email || "U").slice(0, 2).toUpperCase();
  const TABS = ["profile", "details", "security", "danger"] as const;

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
      <div className="mb-8 flex flex-wrap items-start gap-5">
        <div className="relative shrink-0">
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

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
              {uploading ? "Uploading…" : "Change photo"}
            </button>

            {/* Remove photo — idle state */}
            {avatarUrl && removePhotoStep === "idle" && (
              <button type="button" onClick={startRemovePhoto}
                className="rounded-xl border border-app px-4 py-2 text-sm font-medium text-muted hover:bg-[var(--surface-2)] hover:text-red-600">
                Remove
              </button>
            )}
          </div>

          {/* Remove photo — choose method */}
          {avatarUrl && removePhotoStep === "method" && (
            <div className="mt-3 rounded-xl border border-app bg-[var(--surface-2)] p-4">
              <p className="mb-2 text-sm font-medium">Choose verification method to remove photo</p>
              <div className="mb-3 flex gap-4">
                {(["email", "totp"] as OtpMethod[]).map((m) => (
                  <label key={m} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="radio" name="remove-method" value={m} checked={removeMethod === m} onChange={() => setRemoveMethod(m)} className="accent-brand-600" />
                    {m === "email" ? "Email OTP" : "Authenticator App"}
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleConfirmMethodAndProceed}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                  Continue
                </button>
                <button type="button" onClick={() => setRemovePhotoStep("idle")}
                  className="rounded-xl border border-app px-4 py-2 text-sm text-muted hover:bg-[var(--surface-2)]">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Remove photo — email OTP verify */}
          {avatarUrl && removePhotoStep === "otp" && (
            <form onSubmit={handleRemoveViaEmailOtp} className="mt-3 flex flex-wrap items-center gap-2">
              <input type="text" required maxLength={6} pattern="[0-9]{6}" placeholder="6-digit OTP"
                value={removeEmailCode} onChange={(e) => setRemoveEmailCode(e.target.value.replace(/\D/g, ""))}
                className="w-32 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-center font-mono tracking-widest text-sm outline-none focus:border-brand-500"
                aria-label="OTP code" />
              <button type="submit" disabled={removeEmailLoading || removeEmailCode.length !== 6}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {removeEmailLoading ? "…" : "Confirm remove"}
              </button>
              <button type="button" onClick={() => { setRemovePhotoStep("idle"); setRemoveEmailCode(""); setRemoveEmailOtpSent(false); }}
                className="text-xs text-muted hover:text-[var(--text)]">Cancel</button>
              {removeEmailOtpSent && <span className="text-xs text-green-600">OTP sent ✓</span>}
            </form>
          )}

          {/* Remove photo — TOTP verify */}
          {avatarUrl && removePhotoStep === "totp" && (
            <form onSubmit={handleRemoveViaTotpCode} className="mt-3 flex flex-wrap items-center gap-2">
              <input type="text" required maxLength={6} pattern="[0-9]{6}" placeholder="Authenticator code"
                value={removeTotpCode} onChange={(e) => setRemoveTotpCode(e.target.value.replace(/\D/g, ""))}
                className="w-36 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-center font-mono tracking-widest text-sm outline-none focus:border-brand-500"
                aria-label="TOTP code" />
              <button type="submit" disabled={removeTotpLoading || removeTotpCode.length !== 6 || !removeChallengeId}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {removeTotpLoading ? "…" : "Confirm remove"}
              </button>
              <button type="button" onClick={() => { setRemovePhotoStep("idle"); setRemoveTotpCode(""); setRemoveChallengeId(""); }}
                className="text-xs text-muted hover:text-[var(--text)]">Cancel</button>
            </form>
          )}

          {meta.occupation && <p className="mt-2 text-xs text-muted">{meta.occupation}{meta.company ? ` @ ${meta.company}` : ""}</p>}
          {meta.country && <p className="text-xs text-muted">{[meta.city, meta.country].filter(Boolean).join(", ")}</p>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} aria-label="Upload profile photo" />
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`mb-6 rounded-xl px-4 py-3 text-sm ${msg.type === "ok" ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-app bg-[var(--surface-2)] p-1">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-medium capitalize transition-colors ${tab === t ? "surface shadow text-[var(--text)]" : "text-muted hover:text-[var(--text)]"}`}>
            {t === "danger" ? "⚠️ Danger" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ─────────────────────────────────────────────────────── */}
      {tab === "profile" && (
        <form onSubmit={handleSaveProfile} className="surface rounded-2xl border border-app p-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="full-name" className={LABEL_CLS}>Full name</label>
              <input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={INPUT_CLS} placeholder="Jane Doe" />
            </div>
            <div>
              <label htmlFor="username" className={LABEL_CLS}>Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">@</span>
                <input id="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} className={INPUT_CLS + " pl-7"} placeholder="jane_doe" />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="bio" className={LABEL_CLS}>Bio</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className={"resize-none " + INPUT_CLS} placeholder="Tell us about yourself…" />
          </div>
          <div>
            <label htmlFor="website" className={LABEL_CLS}>Website / Portfolio</label>
            <input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={INPUT_CLS} placeholder="https://yoursite.com" />
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

      {/* ── Details Tab ─────────────────────────────────────────────────────── */}
      {tab === "details" && (
        <form onSubmit={handleSaveDetails} className="space-y-6">
          <div className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-4 font-semibold">Personal information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="d-phone" className={LABEL_CLS}>Phone number</label>
                <input id="d-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT_CLS} placeholder="+1 555 000 0000" />
              </div>
              <div>
                <label htmlFor="d-dob" className={LABEL_CLS}>Date of birth</label>
                <input id="d-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={INPUT_CLS} max={new Date().toISOString().split("T")[0]} />
              </div>
              <div>
                <label htmlFor="d-gender" className={LABEL_CLS}>Gender</label>
                <select id="d-gender" value={gender} onChange={(e) => setGender(e.target.value)} className={SELECT_CLS}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Non-binary</option>
                  <option>Prefer not to say</option><option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="d-nationality" className={LABEL_CLS}>Nationality</label>
                <input id="d-nationality" type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} className={INPUT_CLS} placeholder="American" />
              </div>
              <div>
                <label htmlFor="d-country" className={LABEL_CLS}>Country</label>
                <select id="d-country" value={country} onChange={(e) => setCountry(e.target.value)} className={SELECT_CLS}>
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="d-city" className={LABEL_CLS}>City</label>
                <input id="d-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className={INPUT_CLS} placeholder="New York" />
              </div>
              <div>
                <label htmlFor="d-language" className={LABEL_CLS}>Primary language</label>
                <select id="d-language" value={language} onChange={(e) => setLanguage(e.target.value)} className={SELECT_CLS}>
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-4 font-semibold">Professional information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="d-occ" className={LABEL_CLS}>Occupation / Role</label>
                <input id="d-occ" type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className={INPUT_CLS} placeholder="Software Engineer" />
              </div>
              <div>
                <label htmlFor="d-company" className={LABEL_CLS}>Company / Organization</label>
                <input id="d-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} className={INPUT_CLS} placeholder="Acme Corp" />
              </div>
              <div>
                <label htmlFor="d-industry" className={LABEL_CLS}>Industry</label>
                <select id="d-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={SELECT_CLS}>
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="d-exp" className={LABEL_CLS}>Years of experience</label>
                <select id="d-exp" value={experience} onChange={(e) => setExperience(e.target.value)} className={SELECT_CLS}>
                  <option value="">Select range</option>
                  <option>0–1 years</option><option>1–3 years</option><option>3–5 years</option>
                  <option>5–10 years</option><option>10–15 years</option><option>15+ years</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="d-portfolio" className={LABEL_CLS}>Portfolio website</label>
                <input id="d-portfolio" type="url" value={portfolioWebsite} onChange={(e) => setPortfolioWebsite(e.target.value)} className={INPUT_CLS} placeholder="https://yourportfolio.com" />
              </div>
              <div>
                <label htmlFor="d-linkedin" className={LABEL_CLS}>LinkedIn</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">in/</span>
                  <input id="d-linkedin" type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={INPUT_CLS + " pl-8"} placeholder="yourhandle" />
                </div>
              </div>
              <div>
                <label htmlFor="d-twitter" className={LABEL_CLS}>X / Twitter</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">@</span>
                  <input id="d-twitter" type="text" value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} className={INPUT_CLS + " pl-7"} placeholder="handle" />
                </div>
              </div>
              <div>
                <label htmlFor="d-github" className={LABEL_CLS}>GitHub</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">@</span>
                  <input id="d-github" type="text" value={githubProfile} onChange={(e) => setGithubProfile(e.target.value)} className={INPUT_CLS + " pl-7"} placeholder="handle" />
                </div>
              </div>
            </div>
          </div>

          <div className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-4 font-semibold">Interests &amp; preferences</h2>
            <p className={LABEL_CLS}>Interests</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {INTERESTS.map((item) => (
                <button key={item} type="button" onClick={() => toggleInterest(item)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    interests.includes(item) ? "bg-brand-600 text-white" : "border border-app bg-[var(--surface-2)] text-muted hover:border-brand-500 hover:text-[var(--text)]"
                  }`}>
                  {item}
                </button>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="accent-brand-600" />
              Receive tips, updates, and developer news by email
            </label>
          </div>

          <button type="submit" disabled={saving}
            className="w-full rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {saving ? "Saving…" : "Save all details"}
          </button>
        </form>
      )}

      {/* ── Security Tab ─────────────────────────────────────────────────────── */}
      {tab === "security" && (
        <div className="space-y-6">

          {/* Change password */}
          <div className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-4 text-base font-semibold">Change password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="cur-pw" className={LABEL_CLS}>Current password</label>
                <div className="relative">
                  <input id="cur-pw" type={showPw ? "text" : "password"} required value={curPw} onChange={(e) => setCurPw(e.target.value)} className={INPUT_CLS + " pr-12"} />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label="Toggle visibility">
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="new-pw" className={LABEL_CLS}>New password</label>
                <input id="new-pw" type={showPw ? "text" : "password"} required value={newPw} onChange={(e) => setNewPw(e.target.value)} className={INPUT_CLS} placeholder="min 8 characters" />
              </div>
              <div>
                <label htmlFor="confirm-pw" className={LABEL_CLS}>Confirm new password</label>
                <input id="confirm-pw" type={showPw ? "text" : "password"} required value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className={INPUT_CLS} />
                {confirmPw && newPw !== confirmPw && <p className="mt-1 text-xs text-red-500">Passwords do not match</p>}
              </div>
              <button type="submit" disabled={changingPw}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                {changingPw ? "Updating…" : "Change password"}
              </button>
            </form>
          </div>

          {/* Email OTP verification (standalone) */}
          <div className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-1 text-base font-semibold">Email OTP verification</h2>
            <p className="mb-4 text-sm text-muted">Verify your email address via a one-time code</p>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="flex gap-3">
                <input type="email" required value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} placeholder="your@email.com" aria-label="Email for OTP" className={"flex-1 " + INPUT_CLS} />
                <button type="submit" disabled={otpLoading}
                  className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                  {otpLoading ? "…" : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-sm text-muted">Enter the 6-digit code sent to <strong>{otpEmail}</strong></p>
                <div className="flex gap-3">
                  <input type="text" required maxLength={6} pattern="[0-9]{6}" placeholder="000000" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-40 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-center font-mono text-lg tracking-[0.4em] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" aria-label="6-digit OTP" />
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

          {/* Backup email */}
          <div className="surface rounded-2xl border border-app p-6">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-base font-semibold">Backup email</h2>
              {backupEmail && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/30 dark:text-green-400">Active</span>}
            </div>
            <p className="mb-4 text-sm text-muted">A secondary email address for account recovery. Must be verified before saving.</p>

            {backupEmail && !editingBackup && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-3">
                <span className="text-sm font-medium">{backupEmail}</span>
                <div className="ml-auto flex gap-2">
                  <button type="button" onClick={() => { setEditingBackup(true); setBackupInput(backupEmail); }}
                    className="rounded-lg border border-app px-3 py-1.5 text-xs font-medium text-muted hover:bg-[var(--surface)] hover:text-[var(--text)]">
                    Change
                  </button>
                  <button type="button" onClick={handleRemoveBackupEmail} disabled={backupLoading}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-900/40 dark:hover:bg-red-950/10">
                    {backupLoading ? "…" : "Remove"}
                  </button>
                </div>
              </div>
            )}

            {(!backupEmail || editingBackup) && !backupOtpSent && (
              <form onSubmit={handleSendBackupOtp} className="flex gap-3">
                <input type="email" required value={backupInput} onChange={(e) => setBackupInput(e.target.value)}
                  placeholder="backup@example.com" aria-label="Backup email address" className={"flex-1 " + INPUT_CLS} />
                <button type="submit" disabled={backupLoading}
                  className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                  {backupLoading ? "Sending…" : "Send OTP"}
                </button>
                {editingBackup && (
                  <button type="button" onClick={() => { setEditingBackup(false); setBackupInput(""); }}
                    className="rounded-xl border border-app px-4 py-2.5 text-sm text-muted hover:bg-[var(--surface-2)]">
                    Cancel
                  </button>
                )}
              </form>
            )}

            {backupOtpSent && (
              <form onSubmit={handleVerifyBackupOtp} className="space-y-3">
                <p className="text-sm text-muted">Enter the 6-digit code sent to <strong>{backupInput}</strong></p>
                <div className="flex flex-wrap gap-3">
                  <input type="text" required maxLength={6} pattern="[0-9]{6}" placeholder="000000" value={backupOtpCode}
                    onChange={(e) => setBackupOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-40 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-center font-mono text-lg tracking-[0.4em] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    aria-label="6-digit backup email OTP" />
                  <button type="submit" disabled={backupLoading || backupOtpCode.length !== 6}
                    className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                    {backupLoading ? "Verifying…" : "Verify & Save"}
                  </button>
                  <button type="button" onClick={() => { setBackupOtpSent(false); setBackupOtpCode(""); }}
                    className="rounded-xl border border-app px-4 py-2.5 text-sm text-muted hover:bg-[var(--surface-2)]">
                    Resend code
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* TOTP — authenticator app */}
          <div className="surface rounded-2xl border border-app p-6">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-base font-semibold">Authenticator app (TOTP)</h2>
              {!totpLoading && hasTOTP && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/30 dark:text-green-400">Enabled</span>
              )}
            </div>
            <p className="mb-4 text-sm text-muted">
              Use an authenticator app (Google Authenticator, Authy, 1Password, etc.) to generate time-based one-time codes.
              Once enabled, you can choose it as your verification method for sensitive actions.
            </p>

            {totpLoading && <div className="text-sm text-muted">Loading…</div>}

            {!totpLoading && !hasTOTP && !totpEnrollData && (
              <button type="button" onClick={handleStartTotpEnroll} disabled={totpEnrolling}
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                {totpEnrolling ? "Preparing…" : "Enable authenticator app"}
              </button>
            )}

            {/* QR code enrollment */}
            {totpEnrollData && (
              <div className="rounded-xl border border-app bg-[var(--surface-2)] p-5">
                <p className="mb-3 text-sm font-medium">1. Scan this QR code in your authenticator app</p>
                <div className="mb-4 flex justify-center">
                  {/* Supabase returns an SVG string */}
                  <div
                    className="rounded-xl border border-app bg-white p-3"
                    dangerouslySetInnerHTML={{ __html: totpEnrollData.qr_code }}
                    style={{ width: 200, height: 200 }}
                  />
                </div>
                <p className="mb-1 text-sm font-medium">Or enter this secret manually:</p>
                <code className="mb-4 block break-all rounded-lg bg-[var(--surface)] px-3 py-2 text-xs font-mono tracking-wider text-brand-600">
                  {totpEnrollData.secret}
                </code>
                <p className="mb-3 text-sm font-medium">2. Enter the 6-digit code from your app to confirm</p>
                <form onSubmit={handleVerifyTotpEnroll} className="flex gap-3">
                  <input type="text" required maxLength={6} pattern="[0-9]{6}" placeholder="000000" value={totpEnrollCode}
                    onChange={(e) => setTotpEnrollCode(e.target.value.replace(/\D/g, ""))}
                    className="w-40 rounded-xl border border-app bg-[var(--surface)] px-4 py-2.5 text-center font-mono text-lg tracking-[0.4em] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    aria-label="TOTP enrollment code" autoComplete="one-time-code" />
                  <button type="submit" disabled={totpEnrollLoading || totpEnrollCode.length !== 6}
                    className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                    {totpEnrollLoading ? "Verifying…" : "Activate"}
                  </button>
                  <button type="button" onClick={handleCancelTotpEnroll}
                    className="rounded-xl border border-app px-4 py-2.5 text-sm text-muted hover:bg-[var(--surface)]">
                    Cancel
                  </button>
                </form>
              </div>
            )}

            {/* TOTP is enabled — show disable option */}
            {!totpLoading && hasTOTP && !totpEnrollData && (
              <div className="flex items-center gap-4 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-3">
                <span className="text-xl">🔐</span>
                <div>
                  <p className="text-sm font-medium">Authenticator app is active</p>
                  <p className="text-xs text-muted">You can use it as your verification method for sensitive actions</p>
                </div>
                <button type="button" onClick={handleDisableTotp} disabled={totpDisabling}
                  className="ml-auto rounded-xl border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-900/40 dark:hover:bg-red-950/10">
                  {totpDisabling ? "Disabling…" : "Disable"}
                </button>
              </div>
            )}
          </div>

          {/* Connected OAuth accounts */}
          {user.app_metadata?.provider && (
            <div className="surface rounded-2xl border border-app p-6">
              <h2 className="mb-2 text-base font-semibold">Connected accounts</h2>
              <div className="flex items-center gap-3 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-3">
                <span className="text-lg">
                  {user.app_metadata.provider === "google" ? "G" : user.app_metadata.provider === "github" ? "⌥" : user.app_metadata.provider === "azure" ? "⊞" : "🔐"}
                </span>
                <div>
                  <p className="text-sm font-medium capitalize">{user.app_metadata.provider}</p>
                  <p className="text-xs text-muted">Connected OAuth provider</p>
                </div>
                <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/30 dark:text-green-400">Active</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Danger Zone ──────────────────────────────────────────────────────── */}
      {tab === "danger" && (
        <div className="surface rounded-2xl border border-red-200 p-6 dark:border-red-900/40">
          <h2 className="mb-1 text-base font-semibold text-red-600">Delete account</h2>
          <p className="mb-5 text-sm text-muted">
            This action is permanent. All your data, profile, and saved work will be deleted and cannot be recovered.
          </p>

          {/* Step 1 — identity verification */}
          {!dangerOtpVerified && (
            <div className="rounded-xl border border-app bg-[var(--surface-2)] p-5 space-y-4">
              <p className="text-sm font-semibold">Step 1 — Verify your identity</p>

              {/* Method choice (only when TOTP enabled) */}
              {hasTOTP && (
                <div>
                  <p className="mb-2 text-sm text-muted">Choose verification method:</p>
                  <div className="flex gap-6">
                    {(["email", "totp"] as OtpMethod[]).map((m) => (
                      <label key={m} className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                        <input type="radio" name="danger-method" value={m} checked={dangerMethod === m}
                          onChange={() => { setDangerMethod(m); setDangerEmailSent(false); setDangerEmailCode(""); setDangerTotpCode(""); setDangerChallengeId(""); }}
                          className="accent-brand-600" />
                        {m === "email" ? "📧 Email OTP" : "🔐 Authenticator App"}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Email OTP flow */}
              {dangerMethod === "email" && (
                <>
                  <p className="text-sm text-muted">
                    We will send a one-time code to <strong>{user.email}</strong>
                  </p>
                  {!dangerEmailSent ? (
                    <button type="button" onClick={handleSendDangerEmailOtp} disabled={dangerEmailLoading}
                      className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                      {dangerEmailLoading ? "Sending…" : "Send verification OTP"}
                    </button>
                  ) : (
                    <form onSubmit={handleVerifyDangerEmailOtp} className="space-y-3">
                      <p className="text-sm text-muted">Enter the 6-digit code sent to your email</p>
                      <div className="flex gap-3">
                        <input type="text" required maxLength={6} pattern="[0-9]{6}" placeholder="000000"
                          value={dangerEmailCode} onChange={(e) => setDangerEmailCode(e.target.value.replace(/\D/g, ""))}
                          className="w-40 rounded-xl border border-app bg-[var(--surface)] px-4 py-2.5 text-center font-mono text-lg tracking-[0.4em] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                          aria-label="OTP code" />
                        <button type="submit" disabled={dangerEmailLoading || dangerEmailCode.length !== 6}
                          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                          {dangerEmailLoading ? "…" : "Verify"}
                        </button>
                        <button type="button" onClick={() => { setDangerEmailSent(false); setDangerEmailCode(""); }}
                          className="rounded-xl border border-app px-4 py-2.5 text-sm text-muted hover:bg-[var(--surface)]">
                          Resend
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* TOTP flow */}
              {dangerMethod === "totp" && (
                <>
                  <p className="text-sm text-muted">Enter the current 6-digit code from your authenticator app</p>
                  {!dangerChallengeId ? (
                    <button type="button" onClick={handleStartDangerTotp} disabled={dangerTotpLoading}
                      className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                      {dangerTotpLoading ? "…" : "Start verification"}
                    </button>
                  ) : (
                    <form onSubmit={handleVerifyDangerTotp} className="space-y-3">
                      <div className="flex gap-3">
                        <input type="text" required maxLength={6} pattern="[0-9]{6}" placeholder="000000"
                          value={dangerTotpCode} onChange={(e) => setDangerTotpCode(e.target.value.replace(/\D/g, ""))}
                          className="w-40 rounded-xl border border-app bg-[var(--surface)] px-4 py-2.5 text-center font-mono text-lg tracking-[0.4em] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                          aria-label="TOTP code" autoComplete="one-time-code" />
                        <button type="submit" disabled={dangerTotpLoading || dangerTotpCode.length !== 6}
                          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                          {dangerTotpLoading ? "…" : "Verify"}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 2 — delete (only after OTP verified) */}
          {dangerOtpVerified && (
            <div className="rounded-xl border border-red-300 bg-red-50/50 p-5 dark:border-red-900/50 dark:bg-red-950/10">
              <p className="mb-4 text-sm font-semibold text-red-600">✓ Identity verified — Step 2: Confirm deletion</p>
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div>
                  <label className={LABEL_CLS}>Type <strong>DELETE</strong> to confirm</label>
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
      )}
    </div>
  );
}
