"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, Tag } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductCarousel } from "@/components/product/product-carousel";
import { useCatalog } from "@/components/catalog-provider";
import { getBestSellers } from "@/lib/catalog-selectors";
import { discountAmount, shippingCost } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/client";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const promo = useCartStore((s) => s.promo);
  const setPromo = useCartStore((s) => s.setPromo);
  const [promoInput, setPromoInput] = useState("");
  const [checkingPromo, setCheckingPromo] = useState(false);

  const shipping = shippingCost(subtotal);
  const discount = discountAmount(subtotal, promo?.percentOff);
  const total = subtotal - discount + shipping;
  const { products } = useCatalog();
  const suggestions = getBestSellers(products, 4);

  async function applyPromo(e: React.FormEvent) {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setCheckingPromo(true);
    const { data: percentOff, error } = await createClient().rpc("check_promo_code", { p_code: code });
    setCheckingPromo(false);
    if (error || !percentOff) {
      toast.error("Code promo invalide ou expiré");
      return;
    }
    setPromo({ code, percentOff });
    setPromoInput("");
    toast.success("Code promo appliqué", { description: `-${percentOff} % sur votre commande` });
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-28 flex flex-col items-center text-center gap-5">
        <ShoppingBag size={44} strokeWidth={1} className="text-stone-light" />
        <h1 className="font-display text-3xl text-ink">Votre panier est vide</h1>
        <p className="text-sm text-stone-light max-w-sm">
          Découvrez notre collection et trouvez les pièces qui vous ressemblent.
        </p>
        <Button asChild variant="primary" size="lg">
          <Link href="/boutique">Découvrir la boutique</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-10 sm:py-14">
      <h1 className="font-display text-4xl sm:text-5xl text-ink mb-10">Votre panier</h1>

      <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={`${item.sku}-${item.color}-${item.size}`} className="flex gap-5 py-6">
              <Link href={`/produit/${item.slug}`} className="relative h-32 w-24 sm:h-40 sm:w-32 shrink-0 bg-sand">
                <Image src={item.image} alt={item.name} fill sizes="128px" className="object-cover" />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link href={`/produit/${item.slug}`} className="font-display text-lg sm:text-xl text-ink hover:text-gold transition-colors">
                      {item.name}
                    </Link>
                    <p className="text-xs text-stone-light mt-1.5">
                      {[item.color, item.size ? `Taille ${item.size}` : null].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <button
                    aria-label="Retirer l'article"
                    onClick={() => removeItem(item.sku, item.color, item.size)}
                    className="text-stone-light hover:text-ink shrink-0 cursor-pointer"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>
                <div className="flex items-end justify-between mt-auto pt-4">
                  <div className="flex items-center border border-line h-10">
                    <button
                      aria-label="Diminuer"
                      onClick={() => updateQuantity(item.sku, item.quantity - 1, item.color, item.size)}
                      className="w-9 h-full flex items-center justify-center hover:text-gold cursor-pointer"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="text-sm w-8 text-center tabular-nums">{item.quantity}</span>
                    <button
                      aria-label="Augmenter"
                      onClick={() => updateQuantity(item.sku, item.quantity + 1, item.color, item.size)}
                      className="w-9 h-full flex items-center justify-center hover:text-gold cursor-pointer"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <Price amount={item.price * item.quantity} />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="border border-line p-6 sm:p-8 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl text-ink mb-6">Récapitulatif</h2>

          {promo ? (
            <div className="flex items-center justify-between gap-2 mb-6 border border-line px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-ink">
                <Tag size={15} strokeWidth={1.5} className="text-stone-light" />
                {promo.code}
              </span>
              <button
                type="button"
                onClick={() => setPromo(null)}
                className="text-xs text-stone-light underline underline-offset-2 hover:text-ink cursor-pointer"
              >
                Retirer
              </button>
            </div>
          ) : (
            <form onSubmit={applyPromo} className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Tag size={15} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-light" />
                <Input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Code promo"
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline" disabled={checkingPromo}>
                Appliquer
              </Button>
            </form>
          )}

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between text-stone">
              <span>Sous-total</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            {promo && (
              <div className="flex justify-between text-gold">
                <span>Réduction ({promo.code})</span>
                <span className="tabular-nums">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone">
              <span>Livraison</span>
              <span className="tabular-nums">{shipping === 0 ? "Offerte" : formatPrice(shipping)}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline mt-6 pt-6 border-t border-line">
            <span className="font-sans-wide text-xs uppercase text-ink">Total</span>
            <Price amount={total} size="lg" />
          </div>

          <Button asChild variant="primary" size="lg" className="w-full mt-6">
            <Link href="/checkout">Passer la commande</Link>
          </Button>
          <Button asChild variant="link" className="w-full justify-center mt-2">
            <Link href="/boutique">Poursuivre mes achats</Link>
          </Button>
        </div>
      </div>

      <section className="mt-24 pt-16 border-t border-line">
        <SectionHeading eyebrow="Vous aimerez aussi" title="Complétez votre sélection" className="mb-10" />
        <ProductCarousel products={suggestions} />
      </section>
    </div>
  );
}
