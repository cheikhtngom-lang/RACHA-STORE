"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { testimonials } from "@/data/testimonials";
import { Rating } from "@/components/shared/rating";

export function Testimonials() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {testimonials.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: i * 0.08 }}
          className="bg-cream border border-line p-6 flex flex-col gap-4"
        >
          <Rating value={t.rating} size={13} />
          <p className="text-sm text-stone leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
          <div className="flex items-center gap-3 pt-2 border-t border-line">
            <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0 bg-sand">
              <Image src={t.avatar} alt={t.author} fill sizes="40px" className="object-cover" />
            </div>
            <div>
              <p className="text-sm text-ink">{t.author}</p>
              <p className="text-xs text-stone-light">{t.role}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
