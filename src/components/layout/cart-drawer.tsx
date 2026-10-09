"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/price";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";
import { LastOrderNotice } from "@/components/checkout/last-order-notice";

export function CartDrawer() {
  const isCartOpen = useUiStore((s) => s.isCartOpen);
  const closeCart = useUiStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <Sheet
      open={isCartOpen}
      onOpenChange={(open) => !open && closeCart()}
      title={`Panier (${items.reduce((s, i) => s + i.quantity, 0)})`}
      footer={
        items.length > 0 ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-sans-wide uppercase text-xs text-stone">Sous-total</span>
              <Price amount={subtotal} size="lg" />
            </div>
            <p className="text-xs text-stone-light">Frais de livraison et taxes calculés à l&apos;étape suivante.</p>
            <Button asChild variant="primary" size="lg" className="w-full" onClick={closeCart}>
              <Link href="/checkout">Passer la commande</Link>
            </Button>
            <Button asChild variant="link" className="w-full justify-center" onClick={closeCart}>
              <Link href="/panier">Voir le panier</Link>
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="px-6 py-5 border-b border-line bg-sand/60">
        {remaining > 0 ? (
          <p className="text-xs text-stone mb-2">
            Plus que <span className="text-ink font-medium">{formatPrice(remaining)}</span> pour la livraison offerte
          </p>
        ) : (
          <p className="text-xs text-ink mb-2">Vous bénéficiez de la livraison offerte</p>
        )}
        <div className="h-1 w-full bg-line overflow-hidden">
          <div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center py-20">
          <ShoppingBag size={36} strokeWidth={1} className="text-stone-light" />
          <p className="text-sm text-stone">Votre panier est vide.</p>
          <Button variant="outline" onClick={closeCart} asChild>
            <Link href="/boutique">Découvrir la boutique</Link>
          </Button>
          <LastOrderNotice onNavigate={closeCart} className="mt-4" />
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={`${item.sku}-${item.color}-${item.size}`} className="flex gap-4 p-6">
              <div className="relative h-24 w-20 shrink-0 bg-sand">
                <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <Link href={`/produit/${item.slug}`} onClick={closeCart} className="text-sm text-ink hover:text-gold transition-colors line-clamp-2">
                    {item.name}
                  </Link>
                  <button
                    aria-label="Retirer l'article"
                    onClick={() => removeItem(item.sku, item.color, item.size)}
                    className="text-stone-light hover:text-ink shrink-0 cursor-pointer"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>
                <p className="text-xs text-stone-light mt-1">
                  {[item.color, item.size ? `Taille ${item.size}` : null].filter(Boolean).join(" · ")}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-line h-8">
                    <button
                      aria-label="Diminuer"
                      onClick={() => updateQuantity(item.sku, item.quantity - 1, item.color, item.size)}
                      className="w-7 h-full flex items-center justify-center hover:text-gold cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs w-6 text-center tabular-nums">{item.quantity}</span>
                    <button
                      aria-label="Augmenter"
                      onClick={() => updateQuantity(item.sku, item.quantity + 1, item.color, item.size)}
                      className="w-7 h-full flex items-center justify-center hover:text-gold cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <Price amount={item.price * item.quantity} size="sm" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
