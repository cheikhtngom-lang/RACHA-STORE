"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCatalog } from "@/components/catalog-provider";

/**
 * These stores persist to localStorage, which isn't available during SSR.
 * skipHydration keeps the initial client render identical to the server
 * (avoiding a hydration mismatch), and this component triggers the real
 * rehydration right after mount.
 */
export function StoreHydration() {
  const { products } = useCatalog();

  useEffect(() => {
    const byId = new Map(products.map((p) => [p.id, p]));

    // Retire les articles qui ne sont plus en vente et reprend les prix actuels.
    Promise.resolve(useCartStore.persist.rehydrate()).then(() => {
      useCartStore.setState((state) => ({
        items: state.items
          .filter((item) => byId.has(item.productId))
          .map((item) => {
            const product = byId.get(item.productId)!;
            return { ...item, name: product.name, price: product.price, image: product.images[0] };
          }),
      }));
    });
    Promise.resolve(useWishlistStore.persist.rehydrate()).then(() => {
      useWishlistStore.setState((state) => ({ ids: state.ids.filter((id) => byId.has(id)) }));
    });
  }, [products]);

  return null;
}
