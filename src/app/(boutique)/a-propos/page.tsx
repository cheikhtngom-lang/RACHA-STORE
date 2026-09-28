import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { img, pools } from "@/data/images";

export const metadata: Metadata = {
  title: "Notre histoire",
  description: "Découvrez l'histoire, les valeurs et le savoir-faire de la maison Racha Store.",
};

const values = [
  {
    title: "Matières nobles",
    description: "Nous sélectionnons des matières premières d'exception, tracées et responsables.",
  },
  {
    title: "Savoir-faire artisanal",
    description: "Chaque pièce est façonnée par des artisans qui perpétuent des techniques ancestrales.",
  },
  {
    title: "Production raisonnée",
    description: "Des collections pensées en petites séries pour limiter le gaspillage.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative h-[60vh] min-h-[420px] bg-ink-dark">
        <Image src={img(pools.apparel[6], 2000, 1400)} alt="Atelier Racha Store" fill sizes="100vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-dark via-ink-dark/30 to-transparent" />
        <div className="relative h-full flex flex-col items-center justify-end text-center px-6 pb-16">
          <p className="eyebrow text-gold-light mb-4">Racha Store</p>
          <h1 className="font-display text-4xl sm:text-6xl text-cream max-w-2xl">Notre histoire</h1>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <p className="font-display text-2xl sm:text-3xl text-ink leading-relaxed">
            Racha Store est née d&apos;une conviction simple : l&apos;élégance ne devrait jamais être éphémère.
          </p>
          <p className="text-stone leading-relaxed mt-6">
            Racha Store est une boutique basée à Dakar. Nous sélectionnons des
            vêtements, sacs, chaussures, bijoux et parfums, et chaque fiche produit indique la composition exacte
            et les conseils d&apos;entretien.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
          <SectionHeading eyebrow="Nos valeurs" title="Ce qui nous anime" align="center" className="mb-14 mx-auto" />
          <div className="grid sm:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="text-center px-4">
                <h3 className="font-display text-xl text-ink mb-3">{v.title}</h3>
                <p className="text-sm text-stone leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2">
        <div className="relative aspect-[4/3] lg:aspect-auto bg-sand">
          <Image src={img(pools.apparel[9], 1200, 1400)} alt="Savoir-faire" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="relative aspect-[4/3] lg:aspect-auto bg-sand">
          <Image src={img(pools.bags[1], 1200, 1400)} alt="Atelier maroquinerie" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-ink text-center">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="font-display text-3xl sm:text-4xl text-cream mb-5">Explorez notre collection</h2>
          <p className="text-cream/70 text-sm mb-9">
            Découvrez des pièces façonnées avec exigence, pensées pour vous accompagner longtemps.
          </p>
          <Button asChild variant="gold" size="lg">
            <Link href="/boutique">Découvrir la boutique</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
