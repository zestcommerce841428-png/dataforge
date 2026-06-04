import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How DataForge uses cookies — optional analytics and translation only, with your consent.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <article className="mx-auto max-w-2xl py-8 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_p]:mt-2 [&_p]:text-muted">
      <h1 className="text-3xl font-extrabold tracking-tight">Cookie Policy</h1>
      <p className="mt-4">Last updated: {new Date().getFullYear()}</p>

      <p>
        DataForge is designed to work without cookies. We only set non-essential cookies after you
        accept them in the cookie banner.
      </p>

      <h2>Essential storage</h2>
      <p>
        We use your browser&apos;s local storage to remember preferences such as theme, accessibility
        settings, selected country and your cookie choice. This stays on your device and is not a
        tracking cookie.
      </p>

      <h2>Analytics (optional)</h2>
      <p>
        If you accept cookies, we load Google Analytics 4 with IP anonymization to understand
        aggregate, anonymized usage. It sets <code>_ga</code> cookies. Decline, and these never load;
        if you previously accepted and then decline, we remove them.
      </p>

      <h2>Translation (optional)</h2>
      <p>
        If you choose to translate the site, Google Translate sets a <code>googtrans</code> cookie to
        remember your selected language. It loads only when you pick a non-English language.
      </p>

      <h2>Security</h2>
      <p>
        Google reCAPTCHA may set cookies to distinguish humans from bots on certain actions (e.g. the
        URL shortener) to prevent abuse.
      </p>

      <h2>Managing cookies</h2>
      <p>
        You can change your choice anytime via the cookie banner, and clear cookies and local storage
        from your browser settings.
      </p>

      <h2>Contact</h2>
      <p>
        Email <a href="mailto:contact@zestcommerce.in" className="text-brand-600 underline">contact@zestcommerce.in</a>.
      </p>
    </article>
  );
}
