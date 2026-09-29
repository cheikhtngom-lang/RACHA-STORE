import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

// Client serveur avec la clé secrète : il passe outre les règles RLS. Réservé
// aux routes et pages serveur (webhooks, paiement), jamais au navigateur.
export function createAdminSupabase() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Variable manquante : SUPABASE_SECRET_KEY (voir .env.example)");
  }
  return createClient(getSupabaseEnv().url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
