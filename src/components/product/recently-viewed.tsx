"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { products } from "@/data/products";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductCarousel } from "./product-carousel";

const STORAGE_KEY = "racha-store-recently-viewed";
const MAX_ITEMS = 8;

export function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    let stored: string[] = [];
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      stored = [];
    }
    const others = stored.filter((id) => id !== currentProductId);
    setIds(others);

    const updated = [currentProductId, ...others].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [currentProductId]);

  const viewed: Product[] = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p);

  if (viewed.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 border-t border-line">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <SectionHeading eyebrow="Historique" title="Récemment consultés" className="mb-10 sm:mb-14" />
        <ProductCarousel products={viewed} />
      </div>
    </section>
  );
}
