import Image from "next/image";
import Link from "next/link";
import { KineticTitle } from "@/components/home/kinetic-title";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative -mt-20 h-[88svh] min-h-[640px] max-h-[900px] w-full overflow-hidden bg-ink-dark">
      {/* Téléphone : photo en fond, voilée, sous le texte.
          Ordinateur : moitié droite, voilée en haut seulement, sous le menu. */}
      <div className="absolute inset-0 lg:left-1/2">
        <Image
          src="/brand/hero-vide-dressing.jpg"
          alt="Cliente Racha Store avec ses sacs, à côté d'un portant de friperie et de tenues africaines"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[65%_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-dark from-35% via-ink-dark/80 to-ink-dark/40 lg:hidden" />
        <div className="absolute inset-x-0 top-0 hidden h-36 bg-gradient-to-b from-ink-dark/55 to-transparent lg:block" />
      </div>

      <div className="relative z-10 mx-auto grid h-full max-w-[1600px] grid-cols-1 px-5 sm:px-8 lg:grid-cols-2">
        <div className="flex flex-col justify-end pb-14 sm:pb-20 lg:justify-center lg:pb-0 lg:pt-20 lg:pr-12">
          <p className="eyebrow text-gold-light mb-6">Vide dressing Racha Store</p>
          <KineticTitle>
            <p className="mt-4 max-w-md text-cream/60 text-xs sm:text-sm leading-relaxed">
              Livraison 7j/7, au Sénégal et partout dans le monde. Offerte dès 100&nbsp;000&nbsp;F&nbsp;CFA d&apos;achat.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <Button asChild variant="gold" size="lg">
                <Link href="/boutique/vide-dressing">Voir le vide dressing</Link>
              </Button>
              <Button asChild variant="outlineLight" size="lg">
                <Link href="/boutique/tenues-africaines">Tenues africaines</Link>
              </Button>
            </div>
          </KineticTitle>
        </div>
      </div>
    </section>
  );
}
