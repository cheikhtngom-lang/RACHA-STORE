"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/lib/types";

type Promo = { code: string; percentOff: number };

type CartState = {
  items: CartItem[];
  // Code vérifié par la base (check_promo_code) et revérifié à la commande.
  promo: Promo | null;
  addItem: (item: CartItem) => void;
  removeItem: (sku: string, color?: string, size?: string) => void;
  updateQuantity: (sku: string, quantity: number, color?: string, size?: string) => void;
  setPromo: (promo: Promo | null) => void;
  clear: () => void;
  subtotal: () => number;
  totalItems: () => number;
};

function sameLine(a: CartItem, sku: string, color?: string, size?: string) {
  return a.sku === sku && a.color === color && a.size === size;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promo: null,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item.sku, item.color, item.size));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item.sku, item.color, item.size)
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (sku, color, size) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, sku, color, size)),
        })),
      updateQuantity: (sku, quantity, color, size) =>
        set((state) => ({
          items: state.items
            .map((i) => (sameLine(i, sku, color, size) ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      setPromo: (promo) => set({ promo }),
      clear: () => set({ items: [], promo: null }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "racha-store-cart", skipHydration: true }
  )
);
