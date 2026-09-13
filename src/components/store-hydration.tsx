"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useAuthStore } from "@/store/auth-store";

/**
 * These stores persist to localStorage, which isn't available during SSR.
 * skipHydration keeps the initial client render identical to the server
 * (avoiding a hydration mismatch), and this component triggers the real
 * rehydration right after mount.
 */
export function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);

  return null;
}
