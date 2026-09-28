// Domaine personnalisé (https://www.rachamarket.com), sans « / » final. Tant
// qu'il n'est pas défini, le site est servi en noindex : on ne lance pas sur
// une URL par défaut.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || undefined;

// Les coordonnées de la boutique (e-mail, téléphones, adresse, horaires,
// réseaux sociaux) se modifient dans /admin/parametres : voir lib/shop-info.ts.
