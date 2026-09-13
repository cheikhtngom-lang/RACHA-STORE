"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import { QuickViewModal } from "./quick-view-modal";
import { cn } from "@/lib/utils";

export function ProductCarousel({ products }: { products: Product[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true, containScroll: "trimSnaps" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 sm:gap-6">
          {products.map((product, i) => (
            <div key={product.id} className="min-w-[62%] sm:min-w-[38%] lg:min-w-[24%] shrink-0">
              <ProductCard product={product} onQuickView={setQuickViewProduct} priority={i < 2} />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-3 justify-end mt-8">
        <button
          aria-label="Précédent"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canPrev}
          className={cn(
            "h-11 w-11 border border-line flex items-center justify-center transition-colors cursor-pointer",
            canPrev ? "hover:border-ink hover:text-gold" : "opacity-30"
          )}
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <button
          aria-label="Suivant"
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canNext}
          className={cn(
            "h-11 w-11 border border-line flex items-center justify-center transition-colors cursor-pointer",
            canNext ? "hover:border-ink hover:text-gold" : "opacity-30"
          )}
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      </div>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}
