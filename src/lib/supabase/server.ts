import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

// Client serveur agissant au nom du visiteur connecté (session lue dans les
// cookies). Réservé aux Server Actions : ce sont les seules à pouvoir réécrire
// les cookies si la session doit être rafraîchie.
export async function createServerSupabase() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}
