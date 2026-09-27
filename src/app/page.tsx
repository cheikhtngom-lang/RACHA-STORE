import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { ValueProps } from "@/components/home/value-props";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { EditorialBanner } from "@/components/home/editorial-banner";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductCarousel } from "@/components/product/product-carousel";
import { Button } from "@/components/ui/button";
import { img, pools } from "@/data/images";
import { getCatalog } from "@/lib/catalog";
import { getNewArrivals, getBestSellers, getLimitedEditions } from "@/lib/catalog-selectors";
import { social } from "@/lib/site";

export default async function Home() {
  const { products, categories } = await getCatalog();
  const newArrivals = getNewArrivals(products);
  const bestSellers = getBestSellers(products);
  const limited = getLimitedEditions(products);

  return (
    <>
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
            title="Explorez la collection"
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
        <EditorialBanner />
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

      {limited.length > 0 && (
        <section className="relative py-24 sm:py-32 bg-ink-dark overflow-hidden">
          <Image
            src={img(pools.apparel[10], 2000, 1200)}
            alt="Édition limitée Racha Store"
            fill
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 flex flex-col items-center text-center">
            <p className="eyebrow text-gold-light mb-5">Édition limitée</p>
            <h2 className="font-display text-3xl sm:text-5xl text-cream max-w-2xl leading-tight mb-6">
              {limited.length === 1
                ? "Une pièce produite en petite série"
                : `${limited.length} pièces produites en petite série`}
            </h2>
            <p className="text-cream/70 text-sm max-w-md mb-9">
              {limited.map((p) => p.name).join(", ")}. Pas de réassort prévu.
            </p>
            <Button asChild variant="gold" size="lg">
              <Link href="/boutique?filter=edition-limitee">Découvrir l&apos;édition limitée</Link>
            </Button>
          </div>
        </section>
      )}

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
          <SectionHeading
            eyebrow={social.instagram.handle}
            title="Suivez-nous sur Instagram"
            align="center"
            className="mb-10 sm:mb-14 mx-auto"
          />
          <InstagramGallery />
        </div>
      </section>
    </>
  );
}
