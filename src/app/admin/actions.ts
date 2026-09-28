"use server";

import { updateTag } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

// Appelée après une modification du catalogue (produit, catégorie) : la
// boutique affiche le changement tout de suite, sans attendre les 60 s du cache.
export async function refreshCatalog() {
  const supabase = await createServerSupabase();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    throw new Error("Accès réservé aux administrateurs");
  }
  updateTag("catalog");
}
