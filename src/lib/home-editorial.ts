import { img } from "@/data/images";

// Bloc mis en avant de la page d'accueil, modifiable dans /admin/parametres
// (table home_editorial). Ce fichier ne lit pas la base : il sert au
// navigateur comme au serveur. La lecture est dans get-home-editorial.ts.

export type HomeEditorialRow = {
  image_url: string | null;
  eyebrow: string;
  title: string;
  body: string;
  button_label: string;
  button_url: string;
};

// Photo par défaut : femme en grand boubou brodé, par Ibrahima Toure
// (Unsplash, licence libre : https://unsplash.com/photos/VFEbzdlXsSU).
export const DEFAULT_EDITORIAL_IMAGE = img("1687052093309-7a14efa58ecb", 1400, 1600);

// Textes affichés tant que la migration 20260929160000_home_editorial.sql n'a
// pas été exécutée : les mêmes que ceux qu'elle enregistre.
export const DEFAULT_HOME_EDITORIAL: HomeEditorialRow = {
  image_url: null,
  eyebrow: "Couture africaine",
  title: "Grand boubou, taille basse, ndokette et kaftan",
  body: "Robes en wax, ensembles pagne et boubous brodés en bazin riche : les coupes de la couture africaine, pour le quotidien comme pour les cérémonies. Chaque fiche produit indique le tissu et les conseils d'entretien.",
  button_label: "Voir nos types de couture africaine",
  button_url: "/boutique/tenues-africaines",
};
