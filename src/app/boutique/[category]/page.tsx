import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopPage } from "@/components/shop/shop-page";
import { categories, getCategoryBySlug } from "@/data/categories";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) return {};
  return { title: cat.name, description: cat.description };
}

export default async function BoutiqueCategory({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) notFound();

  return (
    <Suspense>
      <ShopPage categorySlug={cat.slug} title={cat.name} description={cat.description} />
    </Suspense>
  );
}
