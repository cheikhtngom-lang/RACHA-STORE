"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { img, pools } from "@/data/images";

export function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink-dark">
      <Image
        src={img(pools.apparel[3], 2000, 2200)}
        alt="Collection Racha Store"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-dark via-ink-dark/50 to-ink-dark/30" />
      <div className="absolute inset-0 bg-ink-dark/10" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="eyebrow text-gold-light mb-6"
        >
          Collection Automne — Hiver
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-5xl sm:text-6xl lg:text-7xl text-cream max-w-4xl leading-[1.05]"
        >
          L&apos;élégance qui traverse le temps
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-lg text-cream/75 text-sm sm:text-base leading-relaxed"
        >
          Des pièces façonnées dans des matières nobles, pensées pour durer. Découvrez l&apos;univers Racha Store.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Button asChild variant="gold" size="lg">
            <Link href="/boutique">Découvrir la collection</Link>
          </Button>
          <Button asChild variant="outlineLight" size="lg">
            <Link href="/a-propos">Notre histoire</Link>
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-cream/70"
      >
        <span className="eyebrow">Découvrir</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={16} strokeWidth={1.5} />
        </motion.span>
      </motion.div>
    </section>
  );
}
