import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { img, pools } from "@/data/images";

export function Hero() {
  return (
    <section className="relative -mt-20 h-[88svh] min-h-[600px] max-h-[900px] w-full overflow-hidden bg-ink-dark">
      <Image
        src={img(pools.apparel[3], 2000, 2200)}
        alt="Tenue Racha Store"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-ink-dark/45" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-16 sm:px-8 sm:pb-24">
        <p className="eyebrow text-gold-light mb-5">Le style qui vous ressemble</p>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-cream max-w-3xl leading-[1.05]">
          Vêtements, sacs, chaussures et bijoux
        </h1>
        <p className="mt-6 max-w-md text-cream/80 text-sm sm:text-base leading-relaxed">
          Livraison 7j/7, au Sénégal et partout dans le monde. Offerte dès 100 000 F CFA d&apos;achat.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button asChild variant="gold" size="lg">
            <Link href="/boutique">Voir la boutique</Link>
          </Button>
          <Button asChild variant="outlineLight" size="lg">
            <Link href="/boutique?filter=nouveautes">Nouveautés</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
