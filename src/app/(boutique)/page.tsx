import { Hero } from "@/components/home/hero";
import { ValueProps } from "@/components/home/value-props";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { EditorialBanner } from "@/components/home/editorial-banner";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { VideoShowcase } from "@/components/home/video-showcase";
import { SectionHeading } from "@/components/shared/section-heading";
import { StoreJsonLd } from "@/components/shared/json-ld";
import { ProductCarousel } from "@/components/product/product-carousel";
import { getCatalog } from "@/lib/catalog";
import { getNewArrivals, getBestSellers } from "@/lib/catalog-selectors";
import { getShopInfo } from "@/lib/get-shop-info";
import { getHomeEditorial } from "@/lib/get-home-editorial";
import { getHomeVideos } from "@/lib/get-home-videos";
import { socialHandle } from "@/lib/shop-info";

export default async function Home() {
  const [{ products, categories }, shop, editorial, videos] = await Promise.all([
    getCatalog(),
    getShopInfo(),
    getHomeEditorial(),
    getHomeVideos(),
  ]);
  const instagramHandle = socialHandle(shop.instagramUrl);
  const newArrivals = getNewArrivals(products);
  const bestSellers = getBestSellers(products);
  // Bas de page : 6 pièces en stock pas encore montrées plus haut (sinon les premières du catalogue).
  const shown = new Set([...newArrivals, ...bestSellers].map((p) => p.id));
  const available = products.filter((p) => p.images[0] && p.stock > 0);
  const morePieces = [...available.filter((p) => !shown.has(p.id)), ...available.filter((p) => shown.has(p.id))].slice(0, 6);

  return (
    <>
      <StoreJsonLd shop={shop} />
      <Hero />

      <section className="border-b border-line py-12 sm:py-14">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
          <ValueProps />
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
          <SectionHeading
            eyebrow="Nos univers"
            title="Explorez notre boutique"
            cta={{ label: "Toute la boutique", href: "/boutique" }}
            className="mb-10 sm:mb-14"
          />
          <CategoryShowcase categories={categories} />
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="py-20 sm:py-28 bg-sand">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
            <SectionHeading
              eyebrow="Fraîchement arrivé"
              title="Nouveautés"
              cta={{ label: "Voir tout", href: "/boutique?filter=nouveautes" }}
              className="mb-10 sm:mb-14"
            />
            <ProductCarousel products={newArrivals} />
          </div>
        </section>
      )}

      <section>
        <EditorialBanner content={editorial} categorySlugs={categories.map((c) => c.slug)} />
      </section>

      {bestSellers.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
            <SectionHeading
              eyebrow="Coup de cœur"
              title="Les meilleures ventes"
              cta={{ label: "Voir tout", href: "/boutique?filter=bestsellers" }}
              className="mb-10 sm:mb-14"
            />
            <ProductCarousel products={bestSellers} />
          </div>
        </section>
      )}

      {videos.length > 0 && <VideoShowcase videos={videos} />}

      {shop.instagramUrl && (
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
            <SectionHeading
              eyebrow={instagramHandle ?? "Instagram"}
              title="Suivez nos arrivages"
              description="Chaque nouvelle pièce passe d'abord sur Instagram. En voici quelques-unes, disponibles dès maintenant."
              align="center"
              className="mb-10 sm:mb-14 mx-auto"
            />
            <InstagramGallery url={shop.instagramUrl} handle={instagramHandle} products={morePieces} />
          </div>
        </section>
      )}
    </>
  );
}
