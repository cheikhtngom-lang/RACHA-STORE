import { address, phone, siteUrl, social } from "@/lib/site";
import type { Category, Product } from "@/lib/types";

// Données structurées lues par Google (fiche boutique, prix et stock dans les
// résultats, fil d'Ariane). Rien n'est émis tant que le site n'a pas son
// domaine : les adresses doivent être absolues et la page est en noindex.
function JsonLd({ data }: { data: Record<string, unknown> }) {
  // « < » échappé : le texte d'un produit ne peut pas fermer la balise script.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

function absolute(path: string) {
  return path.startsWith("http") ? path : `${siteUrl}${path}`;
}

export function StoreJsonLd() {
  if (!siteUrl) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ClothingStore",
        name: "Racha Store",
        url: siteUrl,
        logo: absolute("/brand/logo.jpeg"),
        image: absolute("/brand/og-image.jpg"),
        telephone: phone.tel,
        address: {
          "@type": "PostalAddress",
          streetAddress: address.district,
          addressLocality: address.city,
          addressCountry: "SN",
        },
        // Traduction de openingHours (lib/site.ts) : à modifier ensemble.
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "10:00",
          closes: "19:00",
        },
        currenciesAccepted: "XOF",
        sameAs: [social.instagram.url, social.tiktok.url],
      }}
    />
  );
}

export function ProductJsonLd({ product, category }: { product: Product; category?: Category }) {
  if (!siteUrl) return null;
  const url = `${siteUrl}/produit/${product.slug}`;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          sku: product.sku,
          description: product.shortDescription || product.description,
          image: product.images.map(absolute),
          brand: { "@type": "Brand", name: "Racha Store" },
          offers: {
            "@type": "Offer",
            url,
            price: product.price,
            priceCurrency: "XOF",
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
            ...(category
              ? [{ "@type": "ListItem", position: 2, name: category.name, item: `${siteUrl}/boutique/${category.slug}` }]
              : []),
            { "@type": "ListItem", position: category ? 3 : 2, name: product.name, item: url },
          ],
        }}
      />
    </>
  );
}
