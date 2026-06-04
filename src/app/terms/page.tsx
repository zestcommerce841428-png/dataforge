import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for DataForge — the rules for using our free online tools.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl py-8 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_p]:mt-2 [&_p]:text-muted">
      <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
      <p className="mt-4">Last updated: {new Date().getFullYear()}</p>

      <p>
        Welcome to DataForge. By accessing or using this website and its tools, you agree to
        these Terms of Service. If you do not agree, please do not use the site.
      </p>

      <h2>1. Use of the service</h2>
      <p>
        DataForge provides free, browser-based utilities (generators, converters, image and PDF
        tools, a spreadsheet, and more). You may use them for lawful personal and commercial
        purposes. You agree not to misuse the service, attempt to disrupt it, or use it to process
        unlawful content.
      </p>

      <h2>2. No warranty</h2>
      <p>
        The tools are provided &ldquo;as is&rdquo; without warranties of any kind. We do not
        guarantee that results will be accurate, complete or fit for a particular purpose. Any
        generated identifiers, sample data and outputs are for testing, demos and education only.
      </p>

      <h2>3. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, DataForge and its author are not liable for any
        direct, indirect, incidental or consequential damages arising from your use of, or inability
        to use, the service.
      </p>

      <h2>4. Third-party services</h2>
      <p>
        Some tools call third-party APIs (e.g. cryptocurrency data, DNS/IP lookups, URL shortening),
        and optional analytics/translation are provided by Google. Your use of those is also subject
        to their respective terms.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        The DataForge name, design and original code belong to their author. Output you create with
        the tools belongs to you.
      </p>

      <h2>6. Changes</h2>
      <p>
        We may update these terms from time to time. Continued use after changes constitutes
        acceptance of the updated terms.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions? Email <a href="mailto:contact@zestcommerce.in" className="text-brand-600 underline">contact@zestcommerce.in</a>.
      </p>
    </article>
  );
}
