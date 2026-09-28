import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { DEFAULT_HOME_EDITORIAL, type HomeEditorialRow } from "@/lib/home-editorial";

// Bloc mis en avant de l'accueil, lu côté serveur. Même cache que le catalogue
// (60 s, vidé à chaque modification dans l'administration). Sans la table
// (migration non exécutée), le contenu par défaut.
export const getHomeEditorial = cache(async (): Promise<HomeEditorialRow> => {
  const { data, error } = await createPublicClient()
    .from("home_editorial")
    .select("image_url, eyebrow, title, body, button_label, button_url")
    .maybeSingle();
  if (error || !data) return DEFAULT_HOME_EDITORIAL;
  return data as HomeEditorialRow;
});
