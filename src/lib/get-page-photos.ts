import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { DEFAULT_PAGE_PHOTOS, type PagePhotos, type PagePhotosRow } from "@/lib/page-photos";

// Photos des pages Connexion et Inscription, lues côté serveur. Même cache que
// le catalogue (60 s, vidé à chaque modification dans l'administration). Sans
// la table (migration non exécutée) ou sans photo choisie, celles par défaut.
export const getPagePhotos = cache(async (): Promise<PagePhotos> => {
  const { data, error } = await createPublicClient()
    .from("page_photos")
    .select("login_image_url, signup_image_url")
    .maybeSingle();
  const row = error ? null : (data as PagePhotosRow | null);
  return {
    login: row?.login_image_url ?? DEFAULT_PAGE_PHOTOS.login,
    signup: row?.signup_image_url ?? DEFAULT_PAGE_PHOTOS.signup,
  };
});
