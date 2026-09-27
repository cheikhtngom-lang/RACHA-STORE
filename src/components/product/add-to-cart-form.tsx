"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export function AddToCartForm({
  product,
  compact,
}: {
  product: Product;
  compact?: boolean;
}) {
  const [color, setColor] = useState(product.colors?.[0]?.name);
  const [size, setSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUiStore((s) => s.openCart);

  const outOfStock = product.stock === 0;

  function handleAddToCart() {
    if (product.sizes && !size) {
      setSizeError(true);
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      color,
      size,
      quantity,
      sku: product.sku,
    });
    toast.success("Ajouté au panier", {
      description: `${product.name}${size ? ` · Taille ${size}` : ""}${color ? ` · ${color}` : ""}`,
    });
    openCart();
  }

  return (
    <div className={cn("flex flex-col", compact ? "gap-4" : "gap-6")}>
      {product.colors && product.colors.length > 0 && (
        <div>
          <p className="font-sans-wide text-[0.65rem] uppercase text-stone mb-2.5">
            Couleur {color && <span className="text-stone-light normal-case tracking-normal">: {color}</span>}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-label={c.name}
                onClick={() => setColor(c.name)}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-all cursor-pointer",
                  color === c.name ? "border-ink scale-110" : "border-transparent hover:border-line"
                )}
                style={{ backgroundColor: c.hex }}
              >
                <span
                  className="block h-full w-full rounded-full"
                  style={{ boxShadow: c.hex === "#F3ECDD" || c.hex === "#D8CBB0" ? "inset 0 0 0 1px rgba(0,0,0,0.12)" : undefined }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {product.sizes && product.sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="font-sans-wide text-[0.65rem] uppercase text-stone">
              Taille {size && <span className="text-stone-light normal-case tracking-normal">: {size}</span>}
            </p>
            {!compact && (
              <button type="button" className="text-xs text-stone-light underline underline-offset-2 cursor-pointer hover:text-ink">
                Guide des tailles
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s);
                  setSizeError(false);
                }}
                className={cn(
                  "h-10 min-w-10 px-3 border text-xs font-sans-wide uppercase transition-colors cursor-pointer",
                  size === s
                    ? "border-ink bg-ink text-cream"
                    : "border-line text-ink hover:border-ink"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          {sizeError && <p className="text-xs text-[#6E2A32] mt-2">Merci de sélectionner une taille.</p>}
        </div>
      )}

      <div className={cn("flex gap-3", compact ? "flex-col" : "flex-col sm:flex-row")}>
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <Button
          variant="primary"
          size={compact ? "md" : "lg"}
          className="flex-1"
          disabled={outOfStock}
          onClick={handleAddToCart}
        >
          {outOfStock ? "Épuisé" : "Ajouter au panier"}
        </Button>
      </div>

      {!compact && (
        <p className="text-xs text-stone-light">
          {outOfStock
            ? "Cette pièce reviendra bientôt en stock. Inscrivez-vous pour être averti·e."
            : `Livraison estimée sous 2 à 4 jours ouvrés · ${product.stock} en stock`}
        </p>
      )}
    </div>
  );
}
