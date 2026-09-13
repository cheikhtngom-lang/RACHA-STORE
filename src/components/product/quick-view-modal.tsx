"use client";

import Image from "next/image";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Product } from "@/lib/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Price } from "@/components/shared/price";
import { Rating } from "@/components/shared/rating";
import { AddToCartForm } from "./add-to-cart-form";

export function QuickViewModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      {product && (
        <DialogContent className="w-[92vw] max-w-3xl">
          <VisuallyHidden>
            <DialogPrimitive.Title>{product.name}</DialogPrimitive.Title>
          </VisuallyHidden>
          <div className="grid sm:grid-cols-2">
            <div className="relative aspect-[4/5] sm:aspect-auto bg-sand">
              <Image src={product.images[0]} alt={product.name} fill sizes="50vw" className="object-cover" />
            </div>
            <div className="p-6 sm:p-8 flex flex-col gap-5 overflow-y-auto">
              <div>
                <p className="text-[0.65rem] font-sans-wide uppercase text-stone-light mb-1">
                  {product.subcategory ?? product.category.replace(/-/g, " ")}
                </p>
                <h3 className="font-display text-2xl text-ink pr-8">{product.name}</h3>
                <div className="mt-2 flex items-center gap-3">
                  <Price amount={product.price} compareAt={product.compareAtPrice} />
                  <Rating value={product.rating} count={product.reviewCount} />
                </div>
              </div>
              <p className="text-sm text-stone leading-relaxed clamp-3">{product.shortDescription}</p>
              <AddToCartForm product={product} compact />
              <Link
                href={`/produit/${product.slug}`}
                onClick={onClose}
                className="text-xs font-sans-wide uppercase underline underline-offset-4 text-ink self-start"
              >
                Voir tous les détails
              </Link>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
