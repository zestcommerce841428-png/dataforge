"use client";

import { useState, useRef } from "react";
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

interface Props { user: User; profile: Profile | null; }

export default function ProfileClient({ user, profile }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const meta = user.user_metadata ?? {};

  const [tab, setTab] = useState<"profile" | "details" | "security" | "danger">("profile");

  // Basic profile
  const [fullName, setFullName] = useState(profile?.full_name ?? meta.full_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? meta.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? meta.bio ?? "");
  const [website, setWebsite] = useState(profile?.website ?? meta.portfolio_website ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? meta.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Extended — Personal
  const [phone, setPhone] = useState(meta.phone ?? "");
  const [dob, setDob] = useState(meta.date_of_birth ?? "");
  const [gender, setGender] = useState(meta.gender ?? "");
  const [country, setCountry] = useState(meta.country ?? "");
  const [city, setCity] = useState(meta.city ?? "");
  const [language, setLanguage] = useState(meta.language ?? "English");
  const [nationality, setNationality] = useState(meta.nationality ?? "");

  // Extended — Professional
  const [occupation, setOccupation] = useState(meta.occupation ?? "");
  const [company, setCompany] = useState(meta.company ?? "");
  const [industry, setIndustry] = useState(meta.industry ?? "");
  const [experience, setExperience] = useState(meta.experience_years ?? "");
  const [linkedin, setLinkedin] = useState(meta.linkedin ?? "");
  const [twitterHandle, setTwitterHandle] = useState(meta.twitter ?? "");
  const [githubProfile, setGithubProfile] = useState(meta.github_profile ?? "");
  const [portfolioWebsite, setPortfolioWebsite] = useState(meta.portfolio_website ?? "");

  // Extended — Preferences
  const [interests, setInterests] = useState<string[]>(meta.interests ?? []);
  const [newsletter, setNewsletter] = useState(meta.newsletter ?? true);

  // Security tab
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [otpEmail, setOtpEmail] = useState(user.email ?? "");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Danger tab
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [dangerOtpSent, setDangerOtpSent] = useState(false);
  const [dangerOtpCode, setDangerOtpCode] = useState("");
  const [dangerOtpLoading, setDangerOtpLoading] = useState(false);
  const [dangerOtpVerified, setDangerOtpVerified] = useState(false);

  // Photo remove OTP
  const [removePhotoOtpSent, setRemovePhotoOtpSent] = useState(false);
  const [removePhotoOtpCode, setRemovePhotoOtpCode] = useState("");
  const [removePhotoOtpLoading, setRemovePhotoOtpLoading] = useState(false);

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  }

  function toggleInterest(item: string) {
    setInterests((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
  }

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

  async function handleSendRemovePhotoOtp() {
    setRemovePhotoOtpLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: user.email!, options: { shouldCreateUser: false } });
    setRemovePhotoOtpLoading(false);
    if (error) { flash("err", error.message); return; }
    setRemovePhotoOtpSent(true);
    flash("ok", "OTP sent to " + user.email + ". Enter it to confirm photo removal.");
  }

  async function handleVerifyAndRemovePhoto(e: React.FormEvent) {
    e.preventDefault();
    setRemovePhotoOtpLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email: user.email!, token: removePhotoOtpCode, type: "email" });
    if (error) { flash("err", "Invalid or expired OTP."); setRemovePhotoOtpLoading(false); return; }
    await supabase.from("profiles").upsert({ id: user.id, avatar_url: null, updated_at: new Date().toISOString() });
    setAvatarUrl("");
    setRemovePhotoOtpSent(false);
    setRemovePhotoOtpCode("");
    setRemovePhotoOtpLoading(false);
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
    if (!error) {
      await supabase.auth.updateUser({ data: { full_name: fullName, username, bio, portfolio_website: website } });
    }
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

  async function handleSendDangerOtp() {
    setDangerOtpLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: user.email!, options: { shouldCreateUser: false } });
    setDangerOtpLoading(false);
    if (error) { flash("err", error.message); return; }
    setDangerOtpSent(true);
    flash("ok", "OTP sent to " + user.email);
  }

  async function handleVerifyDangerOtp(e: React.FormEvent) {
    e.preventDefault();
    setDangerOtpLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email: user.email!, token: dangerOtpCode, type: "email" });
    setDangerOtpLoading(false);
    if (error) { flash("err", "Invalid or expired OTP. Please try again."); return; }
    setDangerOtpVerified(true);
    setDangerOtpSent(false);
    flash("ok", "Identity verified. You can now delete your account.");
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!dangerOtpVerified) { flash("err", "Please verify your identity with OTP first."); return; }
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
        <div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
              {uploading ? "Uploading…" : "Change photo"}
            </button>
            {avatarUrl && !removePhotoOtpSent && (
              <button type="button" onClick={handleSendRemovePhotoOtp} disabled={uploading || removePhotoOtpLoading}
                className="rounded-xl border border-app px-4 py-2 text-sm font-medium text-muted hover:bg-[var(--surface-2)] hover:text-red-600 disabled:opacity-60">
                {removePhotoOtpLoading ? "Sending OTP…" : "Remove"}
              </button>
            )}
            {avatarUrl && removePhotoOtpSent && (
              <form onSubmit={handleVerifyAndRemovePhoto} className="flex items-center gap-2">
                <input type="text" required maxLength={6} pattern="[0-9]{6}" placeholder="OTP code"
                  value={removePhotoOtpCode} onChange={(e) => setRemovePhotoOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-28 rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-center font-mono text-sm tracking-widest outline-none focus:border-brand-500"
                  aria-label="OTP code to confirm photo removal" />
                <button type="submit" disabled={removePhotoOtpLoading || removePhotoOtpCode.length !== 6}
                  className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                  {removePhotoOtpLoading ? "…" : "Confirm"}
                </button>
                <button type="button" onClick={() => { setRemovePhotoOtpSent(false); setRemovePhotoOtpCode(""); }}
                  className="text-xs text-muted hover:text-[var(--text)]">Cancel</button>
              </form>
            )}
          </div>
          {meta.occupation && <p className="mt-1 text-xs text-muted">{meta.occupation}{meta.company ? ` @ ${meta.company}` : ""}</p>}
          {meta.country && <p className="text-xs text-muted">{[meta.city, meta.country].filter(Boolean).join(", ")}</p>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} aria-label="Upload profile photo" />
      </div>

      {/* Flash */}
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
            {t === "danger" ? "⚠️ Danger" : t === "details" ? "Details" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ── */}
      {tab === "profile" && (
        <form onSubmit={handleSaveProfile} className="surface rounded-2xl border border-app p-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="full-name" className={LABEL_CLS}>Full name</label>
              <input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className={INPUT_CLS} placeholder="Jane Doe" />
            </div>
            <div>
              <label htmlFor="username" className={LABEL_CLS}>Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">@</span>
                <input id="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className={INPUT_CLS + " pl-7"} placeholder="jane_doe" />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="bio" className={LABEL_CLS}>Bio</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
              className={"resize-none " + INPUT_CLS} placeholder="Tell us about yourself…" />
          </div>
          <div>
            <label htmlFor="website" className={LABEL_CLS}>Website / Portfolio</label>
            <input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
              className={INPUT_CLS} placeholder="https://yoursite.com" />
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

      {/* ── Details Tab ── */}
      {tab === "details" && (
        <form onSubmit={handleSaveDetails} className="space-y-6">
          {/* Personal */}
          <div className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-4 font-semibold">Personal information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="d-phone" className={LABEL_CLS}>Phone number</label>
                <input id="d-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className={INPUT_CLS} placeholder="+1 555 000 0000" />
              </div>
              <div>
                <label htmlFor="d-dob" className={LABEL_CLS}>Date of birth</label>
                <input id="d-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                  className={INPUT_CLS} max={new Date().toISOString().split("T")[0]} />
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
                <input id="d-nationality" type="text" value={nationality} onChange={(e) => setNationality(e.target.value)}
                  className={INPUT_CLS} placeholder="American" />
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
                <input id="d-city" type="text" value={city} onChange={(e) => setCity(e.target.value)}
                  className={INPUT_CLS} placeholder="New York" />
              </div>
              <div>
                <label htmlFor="d-language" className={LABEL_CLS}>Primary language</label>
                <select id="d-language" value={language} onChange={(e) => setLanguage(e.target.value)} className={SELECT_CLS}>
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Professional */}
          <div className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-4 font-semibold">Professional information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="d-occ" className={LABEL_CLS}>Occupation / Role</label>
                <input id="d-occ" type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)}
                  className={INPUT_CLS} placeholder="Software Engineer" />
              </div>
              <div>
                <label htmlFor="d-company" className={LABEL_CLS}>Company / Organization</label>
                <input id="d-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                  className={INPUT_CLS} placeholder="Acme Corp" />
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
                <input id="d-portfolio" type="url" value={portfolioWebsite} onChange={(e) => setPortfolioWebsite(e.target.value)}
                  className={INPUT_CLS} placeholder="https://yourportfolio.com" />
              </div>
              <div>
                <label htmlFor="d-linkedin" className={LABEL_CLS}>LinkedIn</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">in/</span>
                  <input id="d-linkedin" type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                    className={INPUT_CLS + " pl-8"} placeholder="yourhandle" />
                </div>
              </div>
              <div>
                <label htmlFor="d-twitter" className={LABEL_CLS}>X / Twitter</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">@</span>
                  <input id="d-twitter" type="text" value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)}
                    className={INPUT_CLS + " pl-7"} placeholder="handle" />
                </div>
              </div>
              <div>
                <label htmlFor="d-github" className={LABEL_CLS}>GitHub</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">@</span>
                  <input id="d-github" type="text" value={githubProfile} onChange={(e) => setGithubProfile(e.target.value)}
                    className={INPUT_CLS + " pl-7"} placeholder="handle" />
                </div>
              </div>
            </div>
          </div>

          {/* Interests & Preferences */}
          <div className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-4 font-semibold">Interests &amp; preferences</h2>
            <p className={LABEL_CLS}>Interests</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {INTERESTS.map((item) => (
                <button key={item} type="button" onClick={() => toggleInterest(item)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    interests.includes(item)
                      ? "bg-brand-600 text-white"
                      : "border border-app bg-[var(--surface-2)] text-muted hover:border-brand-500 hover:text-[var(--text)]"
                  }`}>
                  {item}
                </button>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)}
                className="accent-brand-600" />
              Receive tips, updates, and developer news by email
            </label>
          </div>

          <button type="submit" disabled={saving}
            className="w-full rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {saving ? "Saving…" : "Save all details"}
          </button>
        </form>
      )}

      {/* ── Security Tab ── */}
      {tab === "security" && (
        <div className="space-y-6">
          <div className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-4 text-base font-semibold">Change password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="cur-pw" className={LABEL_CLS}>Current password</label>
                <div className="relative">
                  <input id="cur-pw" type={showPw ? "text" : "password"} required value={curPw} onChange={(e) => setCurPw(e.target.value)}
                    className={INPUT_CLS + " pr-12"} />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label="Toggle visibility">
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="new-pw" className={LABEL_CLS}>New password</label>
                <input id="new-pw" type={showPw ? "text" : "password"} required value={newPw} onChange={(e) => setNewPw(e.target.value)}
                  className={INPUT_CLS} placeholder="min 8 characters" />
              </div>
              <div>
                <label htmlFor="confirm-pw" className={LABEL_CLS}>Confirm new password</label>
                <input id="confirm-pw" type={showPw ? "text" : "password"} required value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                  className={INPUT_CLS} />
                {confirmPw && newPw !== confirmPw && <p className="mt-1 text-xs text-red-500">Passwords do not match</p>}
              </div>
              <button type="submit" disabled={changingPw}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                {changingPw ? "Updating…" : "Change password"}
              </button>
            </form>
          </div>

          <div className="surface rounded-2xl border border-app p-6">
            <h2 className="mb-1 text-base font-semibold">Email OTP verification</h2>
            <p className="mb-4 text-sm text-muted">Verify your email address via a one-time code</p>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="flex gap-3">
                <input type="email" required value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)}
                  placeholder="your@email.com" aria-label="Email address for OTP"
                  className={"flex-1 " + INPUT_CLS} />
                <button type="submit" disabled={otpLoading}
                  className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                  {otpLoading ? "…" : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-sm text-muted">Enter the 6-digit code sent to <strong>{otpEmail}</strong></p>
                <div className="flex gap-3">
                  <input type="text" required maxLength={6} pattern="[0-9]{6}" aria-label="6-digit OTP code"
                    placeholder="000000" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
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

          {/* Connected accounts info */}
          {user.app_metadata?.provider && (
            <div className="surface rounded-2xl border border-app p-6">
              <h2 className="mb-2 text-base font-semibold">Connected accounts</h2>
              <div className="flex items-center gap-3 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-3">
                <span className="text-lg">
                  {user.app_metadata.provider === "google" ? "G" :
                   user.app_metadata.provider === "github" ? "⌥" :
                   user.app_metadata.provider === "azure" ? "⊞" : "🔐"}
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

      {/* ── Danger Zone ── */}
      {tab === "danger" && (
        <div className="space-y-5">
          <div className="surface rounded-2xl border border-red-200 p-6 dark:border-red-900/40">
            <h2 className="mb-1 text-base font-semibold text-red-600">Delete account</h2>
            <p className="mb-4 text-sm text-muted">
              This action is permanent. All your data, profile, and saved work will be deleted and cannot be recovered.
            </p>

            {/* Step 1: OTP gate */}
            {!dangerOtpVerified && (
              <div className="rounded-xl border border-app bg-[var(--surface-2)] p-4">
                <p className="mb-3 text-sm font-medium">Step 1 — Verify your identity</p>
                <p className="mb-3 text-sm text-muted">We will send a one-time code to <strong>{user.email}</strong> to confirm it&apos;s you.</p>
                {!dangerOtpSent ? (
                  <button type="button" onClick={handleSendDangerOtp} disabled={dangerOtpLoading}
                    className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                    {dangerOtpLoading ? "Sending…" : "Send verification OTP"}
                  </button>
                ) : (
                  <form onSubmit={handleVerifyDangerOtp} className="space-y-3">
                    <p className="text-sm text-muted">Enter the 6-digit code sent to your email</p>
                    <div className="flex gap-3">
                      <input type="text" required maxLength={6} pattern="[0-9]{6}" placeholder="000000"
                        value={dangerOtpCode} onChange={(e) => setDangerOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="w-40 rounded-xl border border-app bg-[var(--surface)] px-4 py-2.5 text-center font-mono text-lg tracking-[0.4em] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        aria-label="6-digit OTP code" />
                      <button type="submit" disabled={dangerOtpLoading || dangerOtpCode.length !== 6}
                        className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                        {dangerOtpLoading ? "…" : "Verify"}
                      </button>
                      <button type="button" onClick={() => { setDangerOtpSent(false); setDangerOtpCode(""); }}
                        className="rounded-xl border border-app px-4 py-2.5 text-sm text-muted hover:bg-[var(--surface-2)]">
                        Resend
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Step 2: Delete form (only after OTP verified) */}
            {dangerOtpVerified && (
              <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 dark:border-red-900/40 dark:bg-red-950/10">
                <p className="mb-3 text-sm font-medium text-red-600">✓ Identity verified — Step 2: Confirm deletion</p>
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
        </div>
      )}
    </div>
  );
}
