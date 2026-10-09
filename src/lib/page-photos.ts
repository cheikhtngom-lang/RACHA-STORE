import { img, pools } from "@/data/images";

// Photos des pages Connexion et Inscription, modifiables dans /admin/parametres
// (table page_photos). Ce fichier ne lit pas la base : il sert au navigateur
// comme au serveur. La lecture est dans get-page-photos.ts.

export type PagePhotosRow = {
  login_image_url: string | null;
  signup_image_url: string | null;
};

export type PagePhotos = { login: string; signup: string };

// Photos affichées tant qu'aucune n'est choisie, ou tant que la migration
// 20261009120000_page_photos.sql n'a pas été exécutée.
export const DEFAULT_PAGE_PHOTOS: PagePhotos = {
  login: img(pools.apparel[12], 1200, 1600),
  signup: img(pools.apparel[14], 1200, 1600),
};
