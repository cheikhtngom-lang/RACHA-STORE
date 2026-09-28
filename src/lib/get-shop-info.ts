import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { DEFAULT_SHOP_INFO, toShopInfo, type ShopInfo, type ShopSettingsRow } from "@/lib/shop-info";

// Coordonnées de la boutique, lues côté serveur. Même cache que le catalogue
// (60 s, vidé à chaque modification dans l'administration). Sans la table
// (migration non exécutée), les valeurs par défaut de shop-info.ts.
export const getShopInfo = cache(async (): Promise<ShopInfo> => {
  const { data, error } = await createPublicClient()
    .from("shop_settings")
    .select("contact_email, phones, address, opening_hours, instagram_url, tiktok_url")
    .maybeSingle();
  if (error || !data) return DEFAULT_SHOP_INFO;
  return toShopInfo(data as ShopSettingsRow);
});
