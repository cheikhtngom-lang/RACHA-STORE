import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

const PAGES = ["", "/boutique", "/a-propos", "/contact", "/faq", "/livraison-retours", "/cgv", "/mentions-legales", "/confidentialite"];

// Pages publiques, catégories et produits en vente. Relu avec le catalogue.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteUrl) return [];
  const { categories, products } = await getCatalog();
  return [
    ...PAGES.map((path) => ({ url: `${siteUrl}${path}` })),
    ...categories.map((c) => ({ url: `${siteUrl}/boutique/${c.slug}` })),
    ...products.map((p) => ({ url: `${siteUrl}/produit/${p.slug}` })),
  ];
}
