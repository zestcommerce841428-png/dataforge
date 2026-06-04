import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "DataForge privacy policy — your files and inputs are processed locally in your browser. Optional analytics and translation load only with your consent.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-muted">Last updated: {new Date().getFullYear()}</p>

      <p className="mt-4 text-muted">
        DataForge is privacy-first. Every tool — generators, converters, the spreadsheet,
        image and PDF tools — runs <strong>entirely in your browser</strong>. Your files,
        text and inputs are processed on your device and are never uploaded to our servers.
      </p>

      <h2 className="mt-8 text-xl font-bold">Local storage</h2>
      <p className="mt-2 text-muted">
        We use your browser&apos;s local storage to remember preferences such as your theme,
        background, accessibility settings and cookie choice. This never leaves your device.
      </p>

      <h2 className="mt-8 text-xl font-bold">Network requests</h2>
      <p className="mt-2 text-muted">
        A few tools call public third-party APIs to fetch live data you requested — for
        example cryptocurrency prices (CoinGecko), DNS and IP lookups (Cloudflare, ip-api),
        and URL shortening (TinyURL, is.gd). Only the data needed for that specific request
        is sent. We do not attach identifiers to these requests.
      </p>

      <h2 className="mt-8 text-xl font-bold">Cookies &amp; analytics</h2>
      <p className="mt-2 text-muted">
        With your consent, we load <strong>Google Analytics</strong> to understand aggregate,
        anonymized usage (IP anonymization is enabled). If you choose to translate the site,
        <strong> Google Translate</strong> is loaded on demand and sets a cookie to remember
        your language. Both are optional: decline the cookie banner and neither loads, and you
        can change your choice at any time. Essential features work without cookies.
      </p>

      <h2 className="mt-8 text-xl font-bold">Error monitoring</h2>
      <p className="mt-2 text-muted">
        We may use Sentry to capture anonymized technical error reports that help us fix bugs.
        This contains no personal data or tool inputs.
      </p>

      <h2 className="mt-8 text-xl font-bold">Your choices</h2>
      <p className="mt-2 text-muted">
        You can decline analytics in the cookie banner, clear local storage from your browser
        settings at any time, and use the site fully without accepting any cookies.
      </p>
    </article>
  );
}
