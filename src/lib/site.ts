// Domaine personnalisé (ex. https://www.rachastore.com). Tant qu'il n'est pas
// défini, le site est servi en noindex : on ne lance pas sur une URL par défaut.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const address = {
  district: "Scat Urbain",
  city: "Dakar",
  country: "Sénégal",
  full: "Scat Urbain, Dakar, Sénégal",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Scat+Urbain+Dakar+S%C3%A9n%C3%A9gal",
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
