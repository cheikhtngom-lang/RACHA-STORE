import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Category } from "@/lib/types";

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-3 sm:gap-4 lg:h-[640px]">
      {categories.map((cat, i) => (
        <div key={cat.id} className={i === 0 ? "col-span-2 lg:col-span-2 lg:row-span-2" : ""}>
          <Link href={`/boutique/${cat.slug}`} className="group relative block h-full aspect-[4/5] lg:aspect-auto lg:h-full overflow-hidden bg-ink-soft">
            {cat.image && (
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 1024px) 50vw, 20vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-dark/70 via-ink-dark/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between">
              <div>
                <h3 className="font-display text-xl sm:text-2xl text-cream">{cat.name}</h3>
                <p className="text-cream/70 text-xs mt-1 hidden sm:block max-w-[220px]">{cat.description}</p>
              </div>
              <ArrowUpRight
                size={20}
                strokeWidth={1.5}
                className="text-cream shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
