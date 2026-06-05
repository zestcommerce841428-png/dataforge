import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "./posts";

export const metadata: Metadata = {
  title: "Blog & Guides — DataForge",
  description: "Guides and tips for getting the most out of DataForge's free online tools — image compression, data formats, handwriting, and more.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Blog &amp; Guides</h1>
      <p className="mt-2 text-muted">Tips and how-tos for getting the most out of DataForge.</p>
      <div className="mt-6 space-y-4">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="surface block rounded-2xl border p-5 transition-colors hover:border-brand-400">
            <h2 className="text-lg font-bold">{p.title}</h2>
            <p className="mt-1 text-sm text-muted">{p.description}</p>
            <p className="mt-2 text-xs text-muted">{new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · {p.readMins} min read</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
