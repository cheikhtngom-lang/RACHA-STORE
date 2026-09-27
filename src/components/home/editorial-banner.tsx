import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { img, pools } from "@/data/images";

export function EditorialBanner() {
  return (
    <div className="grid lg:grid-cols-2 items-stretch">
      <div className="relative aspect-[4/3] lg:aspect-auto bg-sand order-2 lg:order-1">
        <Image
          src={img(pools.apparel[15], 1400, 1600)}
          alt="Bracelets et bijoux Racha Store"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="order-1 lg:order-2 bg-ink flex items-center">
        <div className="px-8 py-16 sm:px-16 sm:py-24 max-w-lg">
          <p className="eyebrow text-gold-light mb-5">Matières</p>
          <h2 className="font-display text-3xl sm:text-4xl text-cream leading-tight mb-6">
            Laine, cachemire, soie et cuir pleine fleur
          </h2>
          <p className="text-cream/70 text-sm leading-relaxed mb-8">
            Chaque fiche produit indique la composition exacte et les conseils d&apos;entretien.
          </p>
          <Button asChild variant="outlineLight" size="lg">
            <Link href="/boutique/pret-a-porter">Voir le prêt-à-porter</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
