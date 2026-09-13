import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { products, getProductBySlug, getRelatedProducts } from "@/data/products";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Rating } from "@/components/shared/rating";
import { Price } from "@/components/shared/price";
import { ProductGallery } from "@/components/product/product-gallery";
import { AddToCartForm } from "@/components/product/add-to-cart-form";
import { ReviewsSection } from "@/components/product/reviews-section";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductCarousel } from "@/components/product/product-carousel";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { categories } from "@/data/categories";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: { images: [product.images[0]] },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = categories.find((c) => c.slug === product.category);
  const related = getRelatedProducts(product);

  return (
    <div>
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 pt-6">
        <Breadcrumbs
          items={[
            ...(category ? [{ label: category.name, href: `/boutique/${category.slug}` }] : []),
            { label: product.name },
          ]}
        />
      </div>

      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-8 sm:py-12 grid lg:grid-cols-2 gap-10 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-sans-wide uppercase text-stone-light mb-2">
            {product.subcategory ?? category?.name}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight">{product.name}</h1>

          <div className="flex items-center gap-4 mt-3">
            <Price amount={product.price} compareAt={product.compareAtPrice} size="lg" />
            <a href="#avis" className="flex items-center gap-1.5">
              <Rating value={product.rating} count={product.reviewCount} />
            </a>
          </div>

          <p className="text-sm text-stone leading-relaxed mt-6">{product.shortDescription}</p>

          <div className="mt-8">
            <AddToCartForm product={product} />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-8 pt-8 border-t border-line">
            <div className="flex flex-col items-center text-center gap-2">
              <Truck size={20} strokeWidth={1.2} className="text-gold" />
              <p className="text-[0.65rem] text-stone-light leading-tight">Livraison 2-4 jours</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <RotateCcw size={20} strokeWidth={1.2} className="text-gold" />
              <p className="text-[0.65rem] text-stone-light leading-tight">Retours sous 30 jours</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldCheck size={20} strokeWidth={1.2} className="text-gold" />
              <p className="text-[0.65rem] text-stone-light leading-tight">Paiement sécurisé</p>
            </div>
          </div>

          <div className="mt-8">
            <Accordion type="multiple" defaultValue={["description"]}>
              <AccordionItem value="description">
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">{product.description}</p>
                  <ul className="list-disc list-inside space-y-1">
                    {product.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              {(product.materials || product.care) && (
                <AccordionItem value="materials">
                  <AccordionTrigger>Matières & entretien</AccordionTrigger>
                  <AccordionContent>
                    {product.materials && <p className="mb-2">{product.materials}</p>}
                    {product.care && <p>{product.care}</p>}
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="shipping" className="border-b-0">
                <AccordionTrigger>Livraison & retours</AccordionTrigger>
                <AccordionContent>
                  Livraison estimée sous 2 à 4 jours ouvrés en France métropolitaine, 5 à 8 jours ouvrés en Europe.
                  Retours gratuits sous 30 jours à compter de la réception de votre commande, article non porté et
                  dans son emballage d&apos;origine.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="py-20 sm:py-28 bg-sand">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
            <SectionHeading eyebrow="Vous aimerez aussi" title="Complète le look" className="mb-10 sm:mb-14" />
            <ProductCarousel products={related} />
          </div>
        </section>
      )}

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
          <SectionHeading eyebrow="Témoignages" title="Avis clients" className="mb-10 sm:mb-14" />
          <ReviewsSection product={product} />
        </div>
      </section>

      <RecentlyViewed currentProductId={product.id} />
    </div>
  );
}
