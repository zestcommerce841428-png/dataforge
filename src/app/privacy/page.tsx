import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "DataForge privacy policy — we collect nothing. All generation happens locally.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-muted">Last updated: {new Date().getFullYear()}</p>
      <p className="mt-4 text-muted">
        DataForge does not collect, store or transmit any personal data. All generators run
        locally in your browser. We have no servers that receive your inputs or outputs.
      </p>
      <h2 className="mt-8 text-xl font-bold">Local storage</h2>
      <p className="mt-2 text-muted">
        We use your browser&apos;s local storage only to remember your theme and background
        preferences. This never leaves your device.
      </p>
      <h2 className="mt-8 text-xl font-bold">No tracking</h2>
      <p className="mt-2 text-muted">
        There are no third-party trackers or advertising cookies on this site.
      </p>
    </article>
  );
}
