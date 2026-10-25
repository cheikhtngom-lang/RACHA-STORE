import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

// Délai avant qu'une modification faite dans Supabase (prix, stock, nouveau
// produit) apparaisse sur le site, sans redéploiement. L'administration et les
// commandes vident ce cache tout de suite (tag « catalog ») : ce délai sert
// surtout aux annonces datées. Chaque relecture régénère les pages visitées,
// comptées en « ISR writes » par Vercel : à 60 s, le plan Hobby a été dépassé.
const CATALOG_REVALIDATE_SECONDS = 3600;

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
