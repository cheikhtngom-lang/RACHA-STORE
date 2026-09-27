"use client";

import { useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { LAST_ORDER_KEY, type LastOrder } from "@/lib/last-order";
import { useAuthStore } from "@/store/auth-store";

function readLastOrder() {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
}

export default function ConfirmationPage() {
  const raw = useSyncExternalStore(
    () => () => {},
    readLastOrder,
    () => null
  );
  const order = useMemo<LastOrder | null>(() => (raw ? JSON.parse(raw) : null), [raw]);
  const isAuthenticated = useAuthStore((s) => s.status === "authenticated");

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-20 sm:py-28 text-center">
      <p className="eyebrow text-gold mb-4">Commande enregistrée</p>
      <h1 className="font-display text-3xl sm:text-5xl text-ink leading-tight mb-4">
        Merci{order?.contact.firstName ? ` ${order.contact.firstName}` : ""}
      </h1>
      <p className="text-sm text-stone-light max-w-md mx-auto mb-10">
        {order
          ? `Votre commande n° ${order.orderNumber} est enregistrée et en attente de paiement. Gardez ce numéro : il vous sera demandé si vous nous contactez.`
          : "Votre commande est enregistrée."}
      </p>

      {order && (
        <div className="text-left border border-line divide-y divide-line mb-10">
          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li key={`${item.sku}-${item.color}-${item.size}`} className="flex gap-4 p-6">
                <div className="relative h-20 w-16 shrink-0 bg-sand">
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink">{item.name}</p>
                  <p className="text-xs text-stone-light mt-1">
                    {[item.color, item.size ? `Taille ${item.size}` : null, `Qté ${item.quantity}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="text-sm tabular-nums shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="p-6 flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-stone">
              <span>Sous-total</span>
              <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-gold">
                <span>Réduction{order.promoCode ? ` (${order.promoCode})` : ""}</span>
                <span className="tabular-nums">-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone">
              <span>Livraison</span>
              <span className="tabular-nums">{order.shipping === 0 ? "Offerte" : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-line">
              <span className="font-sans-wide text-xs uppercase text-ink">Total</span>
              <span className="font-display text-xl text-ink tabular-nums">{formatPrice(order.total)}</span>
            </div>
          </div>
          <div className="p-6 text-sm text-stone-light">
            <p className="text-ink text-xs font-sans-wide uppercase mb-2">Adresse de livraison</p>
            <p>
              {order.contact.firstName} {order.contact.lastName}, {order.contact.phone}
              <br />
              {order.contact.address}
              {order.contact.addressComplement ? `, ${order.contact.addressComplement}` : ""}
              <br />
              {[order.contact.postalCode, order.contact.city].filter(Boolean).join(" ")}, {order.contact.country}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="primary" size="lg">
          <Link href="/boutique">Poursuivre mes achats</Link>
        </Button>
        {isAuthenticated && (
          <Button asChild variant="outline" size="lg">
            <Link href="/compte/commandes">Voir mes commandes</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
