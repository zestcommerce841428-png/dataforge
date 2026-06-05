"use client";
import { useState } from "react";
import { executeRecaptcha } from "@/components/recaptcha";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending"); setError("");
    try {
      const recaptchaToken = await executeRecaptcha("contact");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, recaptchaToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setError(
          data.error === "email_not_configured"
            ? "The contact form isn't fully set up yet. Please email contact@zestcommerce.in directly."
            : data.error === "recaptcha_failed"
            ? "Spam check failed. Please reload and try again."
            : "Could not send your message. Please try again or email us directly."
        );
      }
    } catch {
      setStatus("error");
      setError("Network error. Please try again or email contact@zestcommerce.in.");
    }
  };

  if (status === "sent") {
    return (
      <div className="surface rounded-2xl border border-green-400 bg-green-500/10 p-6 text-center">
        <div className="text-3xl">✅</div>
        <h2 className="mt-2 text-lg font-bold">Message sent!</h2>
        <p className="mt-1 text-sm text-muted">Thanks for reaching out — we&apos;ll reply within 1–2 business days. Check your inbox for a confirmation.</p>
        <button onClick={() => setStatus("idle")} className="mt-4 rounded-xl border surface px-4 py-2 text-sm">Send another</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface rounded-2xl border p-5">
      <h2 className="mb-3 text-lg font-bold">Send us a message</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Name *<input required className="input-field mt-1 w-full" value={form.name} onChange={set("name")} /></label>
        <label className="text-sm">Email *<input required type="email" className="input-field mt-1 w-full" value={form.email} onChange={set("email")} /></label>
      </div>
      <label className="mt-3 block text-sm">Subject<input className="input-field mt-1 w-full" value={form.subject} onChange={set("subject")} placeholder="How can we help?" /></label>
      <label className="mt-3 block text-sm">Message *<textarea required rows={6} maxLength={5000} className="input-area mt-1 w-full" value={form.message} onChange={set("message")} /></label>

      {status === "error" && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-4 w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      <p className="mt-2 text-center text-[11px] text-muted">Protected by reCAPTCHA. We&apos;ll only use your details to reply.</p>
    </form>
  );
}
