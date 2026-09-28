"use client";

import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="Nouveau produit" back={{ href: "/admin/produits", label: "Produits" }} />
      <ProductForm />
    </>
  );
}
