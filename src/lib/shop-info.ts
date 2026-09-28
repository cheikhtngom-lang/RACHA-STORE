import { whatsappNumber } from "@/lib/utils";

// Coordonnées de la boutique, modifiables dans /admin/parametres (table
// shop_settings). Ce fichier ne lit pas la base : il sert au navigateur comme
// au serveur. La lecture est dans get-shop-info.ts.

export type PhoneNumber = { display: string; tel: string };

export type ShopInfo = {
  contactEmail: string;
  // Le premier est le numéro principal (en-tête, page Contact, Google).
  phones: PhoneNumber[];
  address: string;
  openingHours: string;
  instagramUrl: string | null;
  tiktokUrl: string | null;
};

export type ShopSettingsRow = {
  contact_email: string;
  phones: string[];
  address: string;
  opening_hours: string;
  instagram_url: string | null;
  tiktok_url: string | null;
};

// Valeurs affichées tant que la migration 20260929090000_settings.sql n'a
// pas été exécutée (et sur les pages hors boutique).
export const DEFAULT_SHOP_SETTINGS: ShopSettingsRow = {
  contact_email: "sy.ndeyetacko@gmail.com",
  phones: ["+221 77 344 59 51", "+221 76 630 52 62", "+33 7 51 22 66 11"],
  address: "Scat Urbain, Dakar, Sénégal",
  opening_hours: "Du lundi au samedi, de 10h à 19h",
  instagram_url: "https://www.instagram.com/racha_store_221",
  tiktok_url: "https://www.tiktok.com/@racha2200",
};

// Numéro saisi tel quel (« 77 344 59 51 », « +33 7 51… ») → lien tel: et WhatsApp.
export function toPhoneNumber(display: string): PhoneNumber {
  return { display, tel: `+${whatsappNumber(display)}` };
}

export function toShopInfo(row: ShopSettingsRow): ShopInfo {
  return {
    contactEmail: row.contact_email,
    phones: row.phones.map(toPhoneNumber),
    address: row.address,
    openingHours: row.opening_hours,
    instagramUrl: row.instagram_url,
    tiktokUrl: row.tiktok_url,
  };
}

export const DEFAULT_SHOP_INFO = toShopInfo(DEFAULT_SHOP_SETTINGS);

// Liens Google Maps construits à partir de l'adresse (sans clé d'API).
export function mapsLinks(address: string) {
  const q = encodeURIComponent(address);
  return {
    search: `https://www.google.com/maps/search/?api=1&query=${q}`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
    embed: `https://www.google.com/maps?q=${q}&output=embed`,
  };
}

// « https://www.instagram.com/racha_store_221 » → « @racha_store_221 ».
export function socialHandle(url: string | null) {
  if (!url) return null;
  const last = url.split(/[?#]/)[0].replace(/\/+$/, "").split("/").pop() ?? "";
  // Adresse sans compte (« https://www.instagram.com ») : pas de nom à afficher.
  if (!last || last.includes(".")) return null;
  return last.startsWith("@") ? last : `@${last}`;
}
