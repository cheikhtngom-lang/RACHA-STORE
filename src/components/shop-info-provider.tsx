"use client";

import { createContext, useContext } from "react";
import { DEFAULT_SHOP_INFO, type ShopInfo } from "@/lib/shop-info";

const ShopInfoContext = createContext<ShopInfo>(DEFAULT_SHOP_INFO);

// Coordonnées de la boutique, lues une fois côté serveur (Storefront) puis
// partagées avec les composants client : pied de page, menu, page Contact.
export function ShopInfoProvider({ info, children }: { info: ShopInfo; children: React.ReactNode }) {
  return <ShopInfoContext value={info}>{children}</ShopInfoContext>;
}

export function useShopInfo() {
  return useContext(ShopInfoContext);
}
