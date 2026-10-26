import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Category } from "@/lib/types";

// Une case carrée par catégorie : 3 par ligne sur ordinateur et tablette, 2 sur téléphone.
export function CategoryShowcase({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {categories.map((cat) => (
        <Link key={cat.id} href={`/boutique/${cat.slug}`} className="group relative block aspect-square overflow-hidden bg-ink-soft">
          {cat.image && (
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-dark/70 via-ink-dark/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between gap-3">
            <div>
              <h3 className="font-display text-xl sm:text-2xl text-cream">{cat.name}</h3>
              <p className="text-cream/70 text-xs mt-1 hidden md:block max-w-[260px]">{cat.description}</p>
            </div>
            <ArrowUpRight
              size={20}
              strokeWidth={1.5}
              className="text-cream shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
