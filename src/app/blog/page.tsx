import type { Metadata } from "next";
import { POSTS, CATEGORIES } from "./posts";
import { BlogList } from "./blog-list";

export const metadata: Metadata = {
  title: "Blog & Guides — DataForge",
  description: "140+ guides and how-tos for DataForge's free online tools — converters, image & PDF tools, handwriting, finance, health and more. Search and filter by category.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const items = [...POSTS]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ slug, title, description, date, readMins, category }) => ({ slug, title, description, date, readMins, category }));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Blog &amp; Guides</h1>
      <p className="mt-2 text-muted">{POSTS.length} how-tos and tips for getting the most out of DataForge — search or filter by category.</p>
      <div className="mt-6">
        <BlogList items={items} categories={CATEGORIES} />
      </div>
    </main>
  );
}
