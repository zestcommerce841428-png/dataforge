import type { Metadata } from "next";
import { TOOL_META } from "@/lib/generators";
import { CompareClient } from "@/components/compare-client";

export const metadata: Metadata = {
  title: "Generator Comparison",
  description: "Run two DataForge generators side by side and compare their output.",
};

export default function ComparePage({
  searchParams,
}: {
  searchParams: { a?: string; b?: string };
}) {
  const allSlugs = TOOL_META.map((t) => t.slug);
  const slugA = allSlugs.includes(searchParams.a ?? "") ? (searchParams.a as string) : allSlugs[0];
  const slugB = allSlugs.includes(searchParams.b ?? "") ? (searchParams.b as string) : allSlugs[1];

  return <CompareClient slugA={slugA} slugB={slugB} />;
}
