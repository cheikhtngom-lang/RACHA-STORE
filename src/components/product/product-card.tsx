"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Eye } from "lucide-react";
import { Product } from "@/lib/types";
import { Price } from "@/components/shared/price";
import { Rating } from "@/components/shared/rating";
import { Badge } from "@/components/ui/badge";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ProductCard({
  product,
  onQuickView,
  priority,
}: {
  product: Product;
  onQuickView?: (product: Product) => void;
  priority?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const isWishlisted = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
      : null;

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        <Link href={`/produit/${product.slug}`} className="block h-full w-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={cn(
              "object-cover transition-opacity duration-700",
              hovered && product.images[1] ? "opacity-0" : "opacity-100"
            )}
          />
          {product.images[1] && (
            <Image
              src={product.images[1]}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className={cn(
                "object-cover transition-opacity duration-700 scale-105",
                hovered ? "opacity-100" : "opacity-0"
              )}
            />
          )}
        </Link>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && <Badge variant="gold">Nouveau</Badge>}
          {product.isLimited && <Badge variant="default">Édition limitée</Badge>}
          {discount && <Badge variant="sale">-{discount}%</Badge>}
        </div>

        <div
          className={cn(
            "absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300",
            "sm:opacity-0 sm:translate-x-2 sm:group-hover:opacity-100 sm:group-hover:translate-x-0"
          )}
        >
          <button
            type="button"
            aria-label={isWishlisted ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
              toast(isWishlisted ? "Retiré de vos favoris" : "Ajouté à vos favoris", {
                description: product.name,
              });
            }}
            className="h-9 w-9 flex items-center justify-center bg-cream/95 hover:bg-ink hover:text-cream transition-colors cursor-pointer"
          >
            <Heart size={16} strokeWidth={1.5} className={cn(isWishlisted && "fill-current")} />
          </button>
          {onQuickView && (
            <button
              type="button"
              aria-label="Aperçu rapide"
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              className="h-9 w-9 flex items-center justify-center bg-cream/95 hover:bg-ink hover:text-cream transition-colors cursor-pointer"
            >
              <Eye size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-ink-dark/85 text-cream text-center py-1.5 text-[0.65rem] font-sans-wide uppercase">
            Plus que {product.stock} en stock
          </div>
        )}
      </div>

      <Link href={`/produit/${product.slug}`} className="mt-3 block">
        <p className="text-[0.65rem] font-sans-wide uppercase text-stone-light mb-1">
          {product.subcategory ?? product.category.replace(/-/g, " ")}
        </p>
        <h3 className="text-sm text-ink group-hover:text-gold transition-colors">{product.name}</h3>
        <div className="mt-1.5 flex items-center justify-between">
          <Price amount={product.price} compareAt={product.compareAtPrice} size="sm" />
          <Rating value={product.rating} size={11} />
        </div>
      </Link>
    </div>
  );
}
