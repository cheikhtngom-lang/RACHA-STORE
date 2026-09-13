"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import { QuickViewModal } from "./quick-view-modal";

export function ProductGrid({ products, columns = 4 }: { products: Product[]; columns?: 3 | 4 }) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <>
      <div
        className={
          columns === 3
            ? "grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14"
            : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14"
        }
      >
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={setQuickViewProduct}
            priority={i < 4}
          />
        ))}
      </div>
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
