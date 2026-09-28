// Domaine personnalisé (https://www.rachamarket.com), sans « / » final. Tant
// qu'il n'est pas défini, le site est servi en noindex : on ne lance pas sur
// une URL par défaut.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || undefined;

export const contactEmail = "contact@rachamarket.com";

export const phone = {
  display: "+221 77 344 59 51",
  tel: "+221773445951",
};

export const openingHours = "Du lundi au samedi, de 10h à 19h";

export const address = {
  district: "Scat Urbain",
  city: "Dakar",
  country: "Sénégal",
  full: "Scat Urbain, Dakar, Sénégal",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Scat+Urbain+Dakar+S%C3%A9n%C3%A9gal",
  directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Scat+Urbain+Dakar+S%C3%A9n%C3%A9gal",
  // Carte intégrée de la page Contact (sans clé d'API Google).
  embedUrl: "https://www.google.com/maps?q=Scat+Urbain+Dakar+S%C3%A9n%C3%A9gal&output=embed",
};

export const social = {
  instagram: {
    handle: "@racha_store_221",
    url: "https://www.instagram.com/racha_store_221",
  },
  tiktok: {
    handle: "@racha2200",
    url: "https://www.tiktok.com/@racha2200",
  },
};
