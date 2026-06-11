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

function seoTitle(name: string, category: string): string {
  const actionMap: Record<string, string> = {
    name: "Generate", address: "Generate", text: "Generate", id: "Generate",
    date: "Generate", number: "Generate", code: "Generate", color: "Generate",
    finance: "Generate", internet: "Generate", science: "Generate", misc: "Generate",
    geo: "Generate", dev: "Generate", media: "Generate",
  };
  const verb = actionMap[category] ?? "Generate";
  return `${verb} ${name} — Free Online Tool`;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const gen = getGenerator(slug);
  if (!gen) return { title: "Tool not found" };
  const title = seoTitle(gen.name, gen.category);
  return {
    title,
    description: gen.description,
    keywords: [...gen.keywords, "free", "online", "generator", "tool", "DataForge"],
    alternates: { canonical: `/tools/${gen.slug}` },
    openGraph: { title: `${title} · DataForge`, description: gen.description },
    twitter: { card: "summary", title: `${gen.name} — DataForge`, description: gen.short },
  };
}

export default async function ToolPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const gen = getGenerator(slug);
  if (!gen) notFound();

  const category = CATEGORIES.find((c) => c.id === gen.category);

  // Same-category related (up to 4)
  const sameCategory = generatorsByCategory(gen.category).filter((g) => g.slug !== gen.slug).slice(0, 4);

  // Cross-category: pick 1 from each of up to 4 different categories
  const crossCategory = CATEGORIES
    .filter((c) => c.id !== gen.category)
    .slice(0, 4)
    .flatMap((c) => generatorsByCategory(c.id).slice(0, 1));

  const related = sameCategory.length >= 4 ? sameCategory : [...sameCategory, ...crossCategory].slice(0, 6);

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
          <h2 className="mb-4 text-lg font-bold">You might also like</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((g) => {
              const cat = CATEGORIES.find((c) => c.id === g.category);
              const isCross = g.category !== gen.category;
              return (
                <Link
                  key={g.slug}
                  href={`/tools/${g.slug}`}
                  className="surface rounded-xl border p-4 shadow-sm transition hover:border-brand-400 hover:shadow-md"
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <h3 className="font-semibold leading-tight">{g.name}</h3>
                    {isCross && cat && (
                      <span className="ml-auto shrink-0 rounded-full border border-app px-2 py-0.5 text-[10px] text-muted">{cat.name}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted">{g.short}</p>
                </Link>
              );
            })}
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
