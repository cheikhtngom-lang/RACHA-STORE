import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

// Délai avant qu'une modification faite dans Supabase (prix, stock, nouveau
// produit) apparaisse sur le site, sans redéploiement.
const CATALOG_REVALIDATE_SECONDS = 60;

// Client sans session, pour lire les données publiques (catalogue) côté serveur.
export function createPublicClient() {
  const { url, key } = getSupabaseEnv();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["catalog"] } }),
    },
  });
}
