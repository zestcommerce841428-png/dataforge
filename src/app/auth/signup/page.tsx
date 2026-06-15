"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { appUrl } from "@/lib/site";
import { executeRecaptcha } from "@/components/recaptcha";

const STEPS = ["Account", "Personal", "Professional", "Profile"];

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

const INPUT_CLS = "w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
const SELECT_CLS = INPUT_CLS + " cursor-pointer";
const LABEL_CLS = "mb-1.5 block text-sm font-medium";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [signedUpEmail, setSignedUpEmail] = useState("");

  // OTP verification step
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Step 1 — Account
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 2 — Personal
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [language, setLanguage] = useState("English");
  const [nationality, setNationality] = useState("");

  // Step 3 — Professional
  const [occupation, setOccupation] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [experience, setExperience] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [githubProfile, setGithubProfile] = useState("");
  const [portfolioWebsite, setPortfolioWebsite] = useState("");

  // Step 4 — Profile
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [newsletter, setNewsletter] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const strength = getStrength(password);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Max file size is 5 MB."); return; }
    if (!file.type.startsWith("image/")) { setError("Only image files allowed."); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  }

  function toggleInterest(item: string) {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  function validateStep(): boolean {
    setError("");
    if (step === 0) {
      if (!fullName.trim()) { setError("Full name is required."); return false; }
      if (!username.trim() || username.length < 3) { setError("Username must be at least 3 characters."); return false; }
      if (!/^[a-z0-9_]+$/i.test(username)) { setError("Username: letters, numbers, and underscores only."); return false; }
      if (!email.includes("@")) { setError("Enter a valid email address."); return false; }
      if (password.length < 8) { setError("Password must be at least 8 characters."); return false; }
      if (password !== confirmPw) { setError("Passwords do not match."); return false; }
    }
    if (step === 3 && !agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return false;
    }
    return true;
  }

  function nextStep() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prevStep() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleOAuth(provider: "google") {
    setError("");
    setOauthLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: appUrl("/auth/callback") },
    });
    if (error) { setError(error.message); setOauthLoading(null); }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    setError("");

    let avatarUrl = "";
    if (avatarFile) {
      try {
        const form = new FormData();
        form.append("file", avatarFile);
        form.append("uid", `signup_${Date.now()}`);
        const res = await fetch("/api/upload-public-avatar", { method: "POST", body: form });
        if (res.ok) {
          const data = await res.json();
          avatarUrl = data.url ?? "";
        }
      } catch { /* non-fatal: avatar upload optional */ }
    }

    const metadata = {
      full_name: fullName,
      username: username.toLowerCase(),
      phone,
      date_of_birth: dob,
      gender,
      country,
      city,
      language,
      nationality,
      occupation,
      company,
      industry,
      experience_years: experience,
      linkedin,
      twitter: twitterHandle,
      github_profile: githubProfile,
      portfolio_website: portfolioWebsite,
      bio,
      interests,
      avatar_url: avatarUrl,
      newsletter,
    };

    try {
      const recaptchaToken = await executeRecaptcha("signup");
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, metadata, recaptchaToken }),
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) { setError(data.error ?? "Sign up failed. Please try again."); return; }
      setSignedUpEmail(email);
      setOtpStep(true);
      startResendCooldown();
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  function startResendCooldown() {
    setResendIn(45);
    const id = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) { clearInterval(id); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setOtpError("");
    if (!/^\d{6}$/.test(otp)) { setOtpError("Enter the 6-digit code."); return; }
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signedUpEmail, code: otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setOtpError(data.error ?? "Verification failed."); setOtpLoading(false); return; }
      // Email confirmed — sign the user in and send them to their profile.
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: signedUpEmail, password });
      setOtpLoading(false);
      if (signInErr) { router.push("/auth/login?verified=1"); return; }
      router.push("/profile");
    } catch {
      setOtpLoading(false);
      setOtpError("Network error. Please try again.");
    }
  }

  async function resendOtp() {
    if (resendIn > 0) return;
    setOtpError("");
    try {
      const recaptchaToken = await executeRecaptcha("signup");
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signedUpEmail, password, metadata: { full_name: fullName, username: username.toLowerCase() }, recaptchaToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setOtpError(data.error ?? "Could not resend the code."); return; }
      startResendCooldown();
    } catch {
      setOtpError("Network error. Please try again.");
    }
  }

  if (otpStep) {
    return (
      <div className="surface w-full max-w-md rounded-2xl border border-app p-8 shadow-xl">
        <div className="mb-4 text-center text-5xl">📩</div>
        <h1 className="mb-2 text-center text-2xl font-bold">Enter your code</h1>
        <p className="mb-6 text-center text-sm text-muted">
          We emailed a 6-digit verification code to <strong>{signedUpEmail}</strong>. It expires in 10 minutes.
        </p>

        {otpError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {otpError}
          </div>
        )}

        <form onSubmit={verifyOtp} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            placeholder="000000"
            aria-label="6-digit verification code"
            autoFocus
          />
          <button
            type="submit"
            disabled={otpLoading || otp.length !== 6}
            className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {otpLoading ? "Verifying…" : "Verify & continue"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <button type="button" onClick={() => { setOtpStep(false); setOtp(""); setOtpError(""); }}
            className="text-muted hover:text-[var(--text)]">
            ← Edit details
          </button>
          <button type="button" onClick={resendOtp} disabled={resendIn > 0}
            className="text-brand-600 hover:underline disabled:text-muted disabled:no-underline">
            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="surface w-full max-w-lg rounded-2xl border border-app p-8 shadow-xl">
      <h1 className="mb-1 text-2xl font-bold">Create account</h1>
      <p className="mb-5 text-sm text-muted">Join DataForge — free forever</p>

      {/* OAuth — shown only on step 0 */}
      {step === 0 && (
        <>
          <div className="mb-5">
            <button type="button" onClick={() => handleOAuth("google")} disabled={!!oauthLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-3)] disabled:opacity-60 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {oauthLoading === "google" ? "Redirecting…" : "Sign up with Google"}
            </button>
          </div>
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-app" /></div>
            <div className="relative flex justify-center"><span className="bg-[var(--bg-base)] px-3 text-xs text-muted">or sign up with email</span></div>
          </div>
        </>
      )}

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              i < step ? "bg-green-500 text-white" : i === step ? "bg-brand-600 text-white" : "bg-[var(--surface-2)] text-muted"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] font-medium ${i === step ? "text-brand-600" : "text-muted"}`}>{label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Step 1 — Account */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="su-fullname" className={LABEL_CLS}>Full name <span className="text-red-500">*</span></label>
              <input id="su-fullname" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                className={INPUT_CLS} placeholder="Jane Doe" />
            </div>
            <div>
              <label htmlFor="su-username" className={LABEL_CLS}>Username <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">@</span>
                <input id="su-username" type="text" required value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className={INPUT_CLS + " pl-7"} placeholder="jane_doe" />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="su-email" className={LABEL_CLS}>Email address <span className="text-red-500">*</span></label>
            <input id="su-email" type="email" required autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} className={INPUT_CLS} placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="su-pw" className={LABEL_CLS}>Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input id="su-pw" type={showPw ? "text" : "password"} required autoComplete="new-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className={INPUT_CLS + " pr-11"} placeholder="min 8 characters" />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label="Toggle password">
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
          <div>
            <label htmlFor="su-confirm-pw" className={LABEL_CLS}>Confirm password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input id="su-confirm-pw" type={showConfirm ? "text" : "password"} required autoComplete="new-password"
                value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                className={INPUT_CLS + " pr-11"} placeholder="repeat password" />
              <button type="button" onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label="Toggle confirm password">
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {confirmPw && password !== confirmPw && (
              <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
            )}
          </div>
          <button type="button" onClick={nextStep}
            className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Continue →
          </button>
        </div>
      )}

      {/* Step 2 — Personal */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="su-phone" className={LABEL_CLS}>Phone number</label>
              <input id="su-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className={INPUT_CLS} placeholder="+1 555 000 0000" />
            </div>
            <div>
              <label htmlFor="su-dob" className={LABEL_CLS}>Date of birth</label>
              <input id="su-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                className={INPUT_CLS} max={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          <div>
            <label htmlFor="su-gender" className={LABEL_CLS}>Gender</label>
            <select id="su-gender" value={gender} onChange={(e) => setGender(e.target.value)} className={SELECT_CLS}>
              <option value="">Select gender</option>
              <option>Male</option><option>Female</option><option>Non-binary</option>
              <option>Prefer not to say</option><option>Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="su-country" className={LABEL_CLS}>Country</label>
              <select id="su-country" value={country} onChange={(e) => setCountry(e.target.value)} className={SELECT_CLS}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="su-city" className={LABEL_CLS}>City</label>
              <input id="su-city" type="text" value={city} onChange={(e) => setCity(e.target.value)}
                className={INPUT_CLS} placeholder="New York" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="su-language" className={LABEL_CLS}>Primary language</label>
              <select id="su-language" value={language} onChange={(e) => setLanguage(e.target.value)} className={SELECT_CLS}>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="su-nationality" className={LABEL_CLS}>Nationality</label>
              <input id="su-nationality" type="text" value={nationality} onChange={(e) => setNationality(e.target.value)}
                className={INPUT_CLS} placeholder="American" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={prevStep}
              className="flex-1 rounded-xl border border-app px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]">
              ← Back
            </button>
            <button type="button" onClick={nextStep}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Professional */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="su-occupation" className={LABEL_CLS}>Occupation / Role</label>
              <input id="su-occupation" type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)}
                className={INPUT_CLS} placeholder="Software Engineer" />
            </div>
            <div>
              <label htmlFor="su-company" className={LABEL_CLS}>Company / Organization</label>
              <input id="su-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                className={INPUT_CLS} placeholder="Acme Corp" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="su-industry" className={LABEL_CLS}>Industry</label>
              <select id="su-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={SELECT_CLS}>
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="su-experience" className={LABEL_CLS}>Years of experience</label>
              <select id="su-experience" value={experience} onChange={(e) => setExperience(e.target.value)} className={SELECT_CLS}>
                <option value="">Select range</option>
                <option>0–1 years</option><option>1–3 years</option><option>3–5 years</option>
                <option>5–10 years</option><option>10–15 years</option><option>15+ years</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="su-portfolio" className={LABEL_CLS}>Portfolio / Website</label>
            <input id="su-portfolio" type="url" value={portfolioWebsite} onChange={(e) => setPortfolioWebsite(e.target.value)}
              className={INPUT_CLS} placeholder="https://yoursite.com" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="su-linkedin" className={LABEL_CLS}>LinkedIn</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">in/</span>
                <input id="su-linkedin" type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                  className={INPUT_CLS + " pl-8"} placeholder="yourhandle" />
              </div>
            </div>
            <div>
              <label htmlFor="su-twitter" className={LABEL_CLS}>X / Twitter</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">@</span>
                <input id="su-twitter" type="text" value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)}
                  className={INPUT_CLS + " pl-7"} placeholder="handle" />
              </div>
            </div>
            <div>
              <label htmlFor="su-github" className={LABEL_CLS}>GitHub</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">@</span>
                <input id="su-github" type="text" value={githubProfile} onChange={(e) => setGithubProfile(e.target.value)}
                  className={INPUT_CLS + " pl-7"} placeholder="handle" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={prevStep}
              className="flex-1 rounded-xl border border-app px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]">
              ← Back
            </button>
            <button type="button" onClick={nextStep}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Profile */}
      {step === 3 && (
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Avatar */}
          <div>
            <p className={LABEL_CLS}>Profile photo</p>
            <div className="flex items-center gap-4">
              <div
                className="relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-app bg-[var(--surface-2)] hover:border-brand-500 transition-colors"
                onClick={() => fileRef.current?.click()}
                role="button"
                aria-label="Upload profile photo"
              >
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="Avatar preview" fill className="object-cover" />
                ) : (
                  <span className="text-2xl">📷</span>
                )}
              </div>
              <div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="rounded-lg border border-app px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">
                  {avatarPreview ? "Change photo" : "Upload photo"}
                </button>
                {avatarPreview && (
                  <button type="button" onClick={() => { setAvatarPreview(""); setAvatarFile(null); }}
                    className="ml-2 text-xs text-red-500 hover:underline">
                    Remove
                  </button>
                )}
                <p className="mt-1 text-xs text-muted">JPG, PNG, GIF — max 5 MB</p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={handleFileSelect} aria-label="Upload profile photo" />
          </div>

          <div>
            <label htmlFor="su-bio" className={LABEL_CLS}>Bio</label>
            <textarea id="su-bio" value={bio} onChange={(e) => setBio(e.target.value)}
              className={INPUT_CLS + " min-h-[80px] resize-y"} placeholder="Tell us a little about yourself…" />
          </div>

          <div>
            <p className={LABEL_CLS}>Interests (select all that apply)</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((item) => (
                <button
                  key={item} type="button"
                  onClick={() => toggleInterest(item)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    interests.includes(item)
                      ? "bg-brand-600 text-white"
                      : "border border-app bg-[var(--surface-2)] text-muted hover:border-brand-500 hover:text-[var(--text)]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)}
              className="mt-0.5 accent-brand-600" />
            <span className="text-xs text-muted">
              Send me tips, tool updates, and developer news (unsubscribe anytime).
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" required checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 accent-brand-600" />
            <span className="text-xs text-muted">
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="text-brand-600 hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" target="_blank" className="text-brand-600 hover:underline">Privacy Policy</Link>.
              <span className="text-red-500"> *</span>
            </span>
          </label>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={prevStep} disabled={loading}
              className="flex-1 rounded-xl border border-app px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)] disabled:opacity-60">
              ← Back
            </button>
            <button type="submit" disabled={loading || !agreeTerms}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </div>
        </form>
      )}

      <p className="mt-5 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
