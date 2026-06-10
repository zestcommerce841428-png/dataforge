import type { Metadata } from "next";
import { TOOL_META } from "@/lib/generators";
import { CompareClient } from "@/components/compare-client";

export const metadata: Metadata = {
  title: "Generator Comparison",
  description: "Run two DataForge generators side by side and compare their output.",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { a, b } = await searchParams;
  const allSlugs = TOOL_META.map((t) => t.slug);
  const slugA = allSlugs.includes(a ?? "") ? (a as string) : allSlugs[0];
  const slugB = allSlugs.includes(b ?? "") ? (b as string) : allSlugs[1];

  return <CompareClient slugA={slugA} slugB={slugB} />;
}
