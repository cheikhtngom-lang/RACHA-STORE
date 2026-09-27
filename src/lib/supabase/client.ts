import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

// Client du navigateur : la session du client connecté est gardée dans un cookie.
// Les droits sont contrôlés par les règles RLS de la base (supabase/migrations).
export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
