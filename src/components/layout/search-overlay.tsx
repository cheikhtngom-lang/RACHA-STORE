"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Search, X } from "lucide-react";
import { useUiStore } from "@/store/ui-store";
import { useCatalog } from "@/components/catalog-provider";
import { Price } from "@/components/shared/price";

const popularSearches = ["Manteau", "Sac cabas", "Sneakers", "Parfum", "Cachemire"];

export function SearchOverlay() {
  const isSearchOpen = useUiStore((s) => s.isSearchOpen);
  const closeSearch = useUiStore((s) => s.closeSearch);
  const [query, setQuery] = useState("");
  const { products } = useCatalog();

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [products, query]);

  return (
    <Dialog.Root open={isSearchOpen} onOpenChange={(open) => !open && closeSearch()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-dark/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          className="fixed top-0 left-0 right-0 z-50 bg-cream shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-top data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top duration-300"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            document.getElementById("store-search-input")?.focus();
          }}
        >
          <VisuallyHidden>
            <Dialog.Title>Rechercher</Dialog.Title>
          </VisuallyHidden>
          <div className="max-w-3xl mx-auto px-6 py-10">
            <div className="flex items-center gap-4 border-b border-ink pb-4">
              <Search size={22} strokeWidth={1.5} className="text-ink shrink-0" />
              <input
                id="store-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Rechercher un article, une catégorie…"
                className="flex-1 bg-transparent font-display text-2xl text-ink placeholder:text-stone-light focus:outline-none"
              />
              <Dialog.Close className="text-stone-light hover:text-ink cursor-pointer shrink-0">
                <X size={22} strokeWidth={1.5} />
              </Dialog.Close>
            </div>

            {query.trim().length < 2 ? (
              <div className="pt-8">
                <p className="eyebrow text-stone-light mb-4">Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="border border-line px-4 py-2 text-xs font-sans-wide uppercase hover:border-ink transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length === 0 ? (
              <p className="pt-10 text-sm text-stone-light">Aucun résultat pour « {query} ».</p>
            ) : (
              <ul className="pt-8 divide-y divide-line">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/produit/${p.slug}`}
                      onClick={closeSearch}
                      className="flex items-center gap-4 py-3 group"
                    >
                      <div className="relative h-16 w-14 bg-sand shrink-0">
                        <Image src={p.images[0]} alt={p.name} fill sizes="56px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink group-hover:text-gold transition-colors">{p.name}</p>
                        <p className="text-xs text-stone-light capitalize">{p.category.replace(/-/g, " ")}</p>
                      </div>
                      <Price amount={p.price} size="sm" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
