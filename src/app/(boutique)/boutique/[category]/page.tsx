import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopPage } from "@/components/shop/shop-page";
import { getCatalog } from "@/lib/catalog";

async function getCategoryBySlug(slug: string) {
  const { categories } = await getCatalog();
  return categories.find((c) => c.slug === slug);
}

export async function generateStaticParams() {
  const { categories } = await getCatalog();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return {};
  return { title: cat.name, description: cat.description };
}

export default async function BoutiqueCategory({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();

  return (
    <Suspense>
      <ShopPage categorySlug={cat.slug} title={cat.name} description={cat.description} />
    </Suspense>
  );
}
