import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  GENERATORS,
  getGenerator,
  generatorsByCategory,
  CATEGORIES,
} from "@/lib/generators";
import { GeneratorClient } from "@/components/generator-client";

export function generateStaticParams() {
  return GENERATORS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const gen = getGenerator(slug);
  if (!gen) return { title: "Tool not found" };
  return {
    title: gen.name,
    description: gen.description,
    keywords: gen.keywords,
    alternates: { canonical: `/tools/${gen.slug}` },
    openGraph: { title: `${gen.name} · DataForge`, description: gen.description },
  };
}

export default async function ToolPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const gen = getGenerator(slug);
  if (!gen) notFound();

  const category = CATEGORIES.find((c) => c.id === gen.category);
  const related = generatorsByCategory(gen.category).filter((g) => g.slug !== gen.slug).slice(0, 4);

  return (
    <article>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-[var(--text)]">Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/#tools" className="hover:text-[var(--text)]">{category?.name}</Link></li>
          <li aria-hidden>/</li>
          <li className="font-medium text-[var(--text)]">{gen.name}</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{gen.name}</h1>
        <p className="mt-3 max-w-2xl text-muted">{gen.description}</p>
      </header>

      <GeneratorClient slug={gen.slug} />

      {related.length > 0 && (
        <section className="mt-12" aria-label="Related tools">
          <h2 className="mb-4 text-lg font-bold">Related generators</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((g) => (
              <Link
                key={g.slug}
                href={`/tools/${g.slug}`}
                className="surface rounded-xl border p-4 shadow-sm transition hover:border-brand-400 hover:shadow-md"
              >
                <h3 className="font-semibold">{g.name}</h3>
                <p className="mt-1 text-sm text-muted">{g.short}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: gen.name,
            description: gen.description,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
    </article>
  );
}
