import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { Category, Product, ProductColor } from "@/lib/types";

// Affichée tant qu'un produit n'a pas encore de photo dans Supabase.
const PLACEHOLDER_IMAGE = "/brand/placeholder.png";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
};

type ProductRow = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  subcategory: string | null;
  price: number;
  compare_at_price: number | null;
  short_description: string;
  description: string;
  details: string[];
  materials: string | null;
  care: string | null;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  stock: number;
  is_new: boolean;
  is_best_seller: boolean;
  is_limited: boolean;
  category: { slug: string } | null;
};

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: row.image_url ?? undefined,
  };
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    category: row.category?.slug ?? "",
    subcategory: row.subcategory ?? undefined,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    shortDescription: row.short_description,
    description: row.description,
    details: row.details,
    materials: row.materials ?? undefined,
    care: row.care ?? undefined,
    images: row.images.length > 0 ? row.images : [PLACEHOLDER_IMAGE],
    // Un tableau vide rendrait le choix obligatoire dans le formulaire d'ajout au panier.
    colors: row.colors.length > 0 ? row.colors : undefined,
    sizes: row.sizes.length > 0 ? row.sizes : undefined,
    stock: row.stock,
    isNew: row.is_new,
    isBestSeller: row.is_best_seller,
    isLimited: row.is_limited,
  };
}

// Catégories et produits actifs, triés par la colonne « position ».
// Une erreur est levée plutôt que de renvoyer un catalogue vide : le site
// continue alors d'afficher la dernière version valide en cache.
export const getCatalog = cache(async () => {
  const supabase = createPublicClient();
  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("categories").select("id, slug, name, description, image_url").order("position"),
    supabase
      .from("products")
      .select(
        "id, slug, sku, name, subcategory, price, compare_at_price, short_description, description, details, materials, care, images, colors, sizes, stock, is_new, is_best_seller, is_limited, category:categories(slug)"
      )
      .order("position"),
  ]);

  if (categoriesResult.error) {
    throw new Error(`Lecture des catégories impossible : ${categoriesResult.error.message}`);
  }
  if (productsResult.error) {
    throw new Error(`Lecture des produits impossible : ${productsResult.error.message}`);
  }

  return {
    categories: (categoriesResult.data as CategoryRow[]).map(toCategory),
    products: (productsResult.data as unknown as ProductRow[]).map(toProduct),
  };
});

export type Catalog = Awaited<ReturnType<typeof getCatalog>>;
