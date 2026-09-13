"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Category, ProductColor } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";

export type ShopFilters = {
  categories: string[];
  colors: string[];
  sizes: string[];
  maxPrice: number;
  onlyNew: boolean;
  onlyBestSeller: boolean;
  onlyLimited: boolean;
};

export function FiltersPanel({
  filters,
  onChange,
  categories,
  availableColors,
  availableSizes,
  priceCeiling,
}: {
  filters: ShopFilters;
  onChange: (filters: ShopFilters) => void;
  categories: Category[];
  availableColors: ProductColor[];
  availableSizes: string[];
  priceCeiling: number;
}) {
  function toggle(key: "categories" | "colors" | "sizes", value: string) {
    const list = filters[key];
    onChange({
      ...filters,
      [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    });
  }

  return (
    <div>
      <Accordion type="multiple" defaultValue={["categorie", "prix"]}>
        <AccordionItem value="categorie">
          <AccordionTrigger>Catégorie</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox
                    checked={filters.categories.includes(c.slug)}
                    onCheckedChange={() => toggle("categories", c.slug)}
                  />
                  <span className="text-sm text-stone group-hover:text-ink transition-colors">{c.name}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="collections">
          <AccordionTrigger>Collections</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <Checkbox checked={filters.onlyNew} onCheckedChange={(v) => onChange({ ...filters, onlyNew: !!v })} />
                <span className="text-sm text-stone group-hover:text-ink transition-colors">Nouveautés</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={filters.onlyBestSeller}
                  onCheckedChange={(v) => onChange({ ...filters, onlyBestSeller: !!v })}
                />
                <span className="text-sm text-stone group-hover:text-ink transition-colors">Meilleures ventes</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={filters.onlyLimited}
                  onCheckedChange={(v) => onChange({ ...filters, onlyLimited: !!v })}
                />
                <span className="text-sm text-stone group-hover:text-ink transition-colors">Édition limitée</span>
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="couleur">
          <AccordionTrigger>Couleur</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2.5">
              {availableColors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  aria-label={c.name}
                  onClick={() => toggle("colors", c.name)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all cursor-pointer",
                    filters.colors.includes(c.name) ? "border-gold scale-110" : "border-transparent hover:border-line"
                  )}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="taille">
          <AccordionTrigger>Taille</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle("sizes", s)}
                  className={cn(
                    "h-9 min-w-9 px-2.5 border text-xs font-sans-wide uppercase transition-colors cursor-pointer",
                    filters.sizes.includes(s) ? "border-ink bg-ink text-cream" : "border-line text-ink hover:border-ink"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="prix" className="border-b-0">
          <AccordionTrigger>Prix</AccordionTrigger>
          <AccordionContent>
            <div className="pt-2">
              <Slider
                min={0}
                max={priceCeiling}
                step={5000}
                value={[Math.min(filters.maxPrice, priceCeiling)]}
                onValueChange={([v]) => onChange({ ...filters, maxPrice: v })}
              />
              <div className="flex items-center justify-between mt-3 text-xs text-stone-light">
                <span>0 F CFA</span>
                <span className="text-ink">Jusqu&apos;à {formatPrice(filters.maxPrice)}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
