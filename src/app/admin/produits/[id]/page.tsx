"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Loading, LoadError } from "@/components/admin/ui";
import { ProductForm, type ProductRecord } from "@/components/admin/product-form";

export default function EditProductPage({ params }: PageProps<"/admin/produits/[id]">) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    createClient()
      .from("products")
      .select(
        "id, slug, sku, name, category_id, subcategory, price, compare_at_price, short_description, description, details, materials, care, images, colors, sizes, stock, is_new, is_best_seller, is_limited, is_active, position"
      )
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) setFailed(true);
        else setProduct(data as ProductRecord);
      });
  }, [id]);

  const back = { href: "/admin/produits", label: "Produits" };

  if (failed) {
    return (
      <>
        <PageHeader title="Produit introuvable" back={back} />
        <LoadError>Ce produit n&apos;existe pas ou n&apos;a pas pu être chargé.</LoadError>
      </>
    );
  }
  if (!product) return <Loading />;

  return (
    <>
      <PageHeader
        title={product.name}
        back={back}
        action={
          product.is_active && (
            <Link
              href={`/produit/${product.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 text-xs text-stone hover:text-ink underline underline-offset-2"
            >
              <ExternalLink size={14} strokeWidth={1.5} />
              Voir sur le site
            </Link>
          )
        }
      />
      <ProductForm product={product} />
    </>
  );
}
