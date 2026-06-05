import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with DataForge — email or WhatsApp. Built by Naushad Alam, India.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Contact us</h1>
      <p className="mt-3 text-muted">
        Have a question, bug report, feature request or partnership idea? We&apos;d love to hear from you.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <a href="mailto:contact@zestcommerce.in" className="surface rounded-2xl border p-5 transition-colors hover:border-brand-400">
          <div className="text-2xl">✉️</div>
          <div className="mt-2 font-bold">Email</div>
          <div className="text-sm text-muted">contact@zestcommerce.in</div>
        </a>
        <a href="https://wa.me/917492068998?text=Hi!%20I%20have%20a%20question%20about%20DataForge." target="_blank" rel="noopener noreferrer" className="surface rounded-2xl border p-5 transition-colors hover:border-brand-400">
          <div className="text-2xl">💬</div>
          <div className="mt-2 font-bold">WhatsApp</div>
          <div className="text-sm text-muted">+91 74920 68998</div>
        </a>
      </div>

      <div className="mt-6">
        <ContactForm />
      </div>

      <div className="surface mt-6 rounded-2xl border p-5">
        <h2 className="text-lg font-bold">About the maker</h2>
        <p className="mt-2 text-sm text-muted">
          DataForge is built and maintained by <strong className="text-[var(--text)]">Naushad Alam</strong> in India,
          with development assistance from Claude. It&apos;s a privacy-first suite of free online tools —
          everything runs in your browser.
        </p>
      </div>

      <p className="mt-6 text-sm text-muted">
        Typical response time: within 1–2 business days. For privacy questions, see our{" "}
        <a href="/privacy" className="text-brand-600 underline">Privacy Policy</a>.
      </p>
    </article>
  );
}
