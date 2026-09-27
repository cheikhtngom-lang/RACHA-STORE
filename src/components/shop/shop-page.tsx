"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Product } from "@/lib/types";
import { useCatalog } from "@/components/catalog-provider";
import { FiltersPanel, ShopFilters } from "./filters-panel";
import { ProductGrid } from "@/components/product/product-grid";
import { Sheet } from "@/components/ui/sheet";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

const sortLabels: Record<SortKey, string> = {
  featured: "En vedette",
  newest: "Nouveautés",
  "price-asc": "Prix croissant",
  "price-desc": "Prix décroissant",
};

function buildInitialFilters(priceCeiling: number, categorySlug?: string, flag?: string | null): ShopFilters {
  return {
    categories: categorySlug ? [categorySlug] : [],
    colors: [],
    sizes: [],
    maxPrice: priceCeiling,
    onlyNew: flag === "nouveautes",
    onlyBestSeller: flag === "bestsellers",
    onlyLimited: flag === "edition-limitee",
  };
}

export function ShopPage({ categorySlug, title, description }: { categorySlug?: string; title: string; description?: string }) {
  const searchParams = useSearchParams();
  const flag = searchParams.get("filter");
  const { products: allProducts, categories } = useCatalog();

  const priceCeiling = useMemo(
    () => Math.ceil(Math.max(0, ...allProducts.map((p) => p.price)) / 10000) * 10000,
    [allProducts]
  );

  const [filters, setFilters] = useState<ShopFilters>(() => buildInitialFilters(priceCeiling, categorySlug, flag));
  const [sort, setSort] = useState<SortKey>(flag === "nouveautes" ? "newest" : "featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const availableColors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string }>();
    allProducts.forEach((p) => p.colors?.forEach((c) => map.set(c.name, c)));
    return Array.from(map.values());
  }, [allProducts]);

  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => p.sizes?.forEach((s) => set.add(s)));
    return Array.from(set).sort((a, b) => (isNaN(+a) || isNaN(+b) ? a.localeCompare(b) : +a - +b));
  }, [allProducts]);

  const filtered = useMemo(() => {
    let list: Product[] = allProducts.filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (filters.colors.length && !p.colors?.some((c) => filters.colors.includes(c.name))) return false;
      if (filters.sizes.length && !p.sizes?.some((s) => filters.sizes.includes(s))) return false;
      if (p.price > filters.maxPrice) return false;
      if (filters.onlyNew && !p.isNew) return false;
      if (filters.onlyBestSeller && !p.isBestSeller) return false;
      if (filters.onlyLimited && !p.isLimited) return false;
      return true;
    });

    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
    }
    return list;
  }, [allProducts, filters, sort]);

  const activeCount =
    filters.categories.length +
    filters.colors.length +
    filters.sizes.length +
    Number(filters.onlyNew) +
    Number(filters.onlyBestSeller) +
    Number(filters.onlyLimited) +
    Number(filters.maxPrice < priceCeiling);

  function resetFilters() {
    setFilters(buildInitialFilters(priceCeiling));
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-10 sm:py-14">
      <div className="mb-10">
        <h1 className="font-display text-4xl sm:text-5xl text-ink">{title}</h1>
        {description && <p className="text-stone text-sm mt-3 max-w-xl">{description}</p>}
      </div>

      <div className="flex items-center justify-between border-y border-line py-4 mb-10">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 font-sans-wide text-[0.7rem] uppercase cursor-pointer lg:hidden"
        >
          <SlidersHorizontal size={15} strokeWidth={1.5} />
          Filtres {activeCount > 0 && `(${activeCount})`}
        </button>
        <p className="hidden lg:block text-xs text-stone-light">{filtered.length} article{filtered.length > 1 ? "s" : ""}</p>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sortLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-12">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <div className="flex items-center justify-between mb-6">
              <p className="font-sans-wide text-[0.7rem] uppercase text-ink">Filtrer par</p>
              {activeCount > 0 && (
                <button onClick={resetFilters} className="text-xs text-stone-light hover:text-ink underline underline-offset-2 cursor-pointer">
                  Réinitialiser
                </button>
              )}
            </div>
            <FiltersPanel
              filters={filters}
              onChange={setFilters}
              categories={categories}
              availableColors={availableColors}
              availableSizes={availableSizes}
              priceCeiling={priceCeiling}
            />
          </div>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
              <p className="font-display text-2xl text-ink">Aucun article ne correspond</p>
              <p className="text-sm text-stone-light max-w-sm">
                Essayez d&apos;élargir votre sélection ou réinitialisez les filtres pour découvrir toute la collection.
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <ProductGrid products={filtered} />
          )}
        </div>
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen} side="left" title="Filtres" widthClassName="w-full sm:w-[380px]">
        <div className="p-6">
          <FiltersPanel
            filters={filters}
            onChange={setFilters}
            categories={categories}
            availableColors={availableColors}
            availableSizes={availableSizes}
            priceCeiling={priceCeiling}
          />
        </div>
        <div className="p-6 border-t border-line flex gap-3 sticky bottom-0 bg-cream">
          <Button variant="outline" className="flex-1" onClick={resetFilters}>
            <X size={14} className="mr-1" /> Réinitialiser
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => setMobileFiltersOpen(false)}>
            Voir {filtered.length} articles
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
