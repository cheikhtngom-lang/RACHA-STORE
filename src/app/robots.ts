import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Tant que NEXT_PUBLIC_SITE_URL n'est pas défini, le site n'est pas lancé :
// aucun moteur de recherche ne doit l'indexer.
export default function robots(): MetadataRoute.Robots {
  if (!siteUrl) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/compte", "/checkout", "/panier", "/liste-de-souhaits", "/auth"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
