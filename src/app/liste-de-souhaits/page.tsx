"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { products } from "@/data/products";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids);
  const items = products.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-10 sm:py-14">
      <h1 className="font-display text-4xl sm:text-5xl text-ink mb-3">Liste de souhaits</h1>
      <p className="text-sm text-stone-light mb-10">
        {items.length > 0 ? `${items.length} article${items.length > 1 ? "s" : ""} sauvegardé${items.length > 1 ? "s" : ""}` : "Vos coups de cœur en un seul endroit."}
      </p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
          <Heart size={44} strokeWidth={1} className="text-stone-light" />
          <p className="text-sm text-stone-light max-w-sm">
            Ajoutez des articles à votre liste de souhaits en cliquant sur le cœur présent sur chaque produit.
          </p>
          <Button asChild variant="primary" size="lg">
            <Link href="/boutique">Découvrir la boutique</Link>
          </Button>
        </div>
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  );
}
