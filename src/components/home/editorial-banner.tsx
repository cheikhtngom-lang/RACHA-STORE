"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { img, pools } from "@/data/images";

export function EditorialBanner() {
  return (
    <div className="grid lg:grid-cols-2 items-stretch">
      <div className="relative aspect-[4/3] lg:aspect-auto bg-sand order-2 lg:order-1">
        <Image
          src={img(pools.apparel[15], 1400, 1600)}
          alt="L'art du détail — Racha Store"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="order-1 lg:order-2 bg-ink flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="px-8 py-16 sm:px-16 sm:py-24 max-w-lg"
        >
          <p className="eyebrow text-gold-light mb-5">L&apos;art du détail</p>
          <h2 className="font-display text-3xl sm:text-4xl text-cream leading-tight mb-6">
            Chaque pièce raconte le savoir-faire d&apos;un artisan
          </h2>
          <p className="text-cream/70 text-sm leading-relaxed mb-8">
            De la sélection des matières premières à la dernière couture, nos ateliers partenaires
            perpétuent des techniques d&apos;exception. Une exigence silencieuse, mais que l&apos;on
            ressent à chaque instant.
          </p>
          <Button asChild variant="outlineLight" size="lg">
            <Link href="/a-propos">Découvrir notre savoir-faire</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
