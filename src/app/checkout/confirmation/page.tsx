"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { CartItem } from "@/lib/types";

type Order = {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  contact: { email: string; firstName: string; lastName: string; address: string; city: string; postalCode: string; country: string };
  date: string;
};

export default function ConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("racha-store-last-order");
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
  }, []);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-20 sm:py-28 text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-gold flex items-center justify-center mb-8">
        <Check size={28} strokeWidth={2} className="text-ink-dark" />
      </div>
      <p className="eyebrow text-gold mb-4">Commande confirmée</p>
      <h1 className="font-display text-3xl sm:text-5xl text-ink leading-tight mb-4">
        Merci{order?.contact.firstName ? ` ${order.contact.firstName}` : ""} pour votre confiance
      </h1>
      <p className="text-sm text-stone-light max-w-md mx-auto mb-10">
        {order
          ? `Votre commande n° ${order.orderNumber} a bien été enregistrée. Un e-mail de confirmation vous a été envoyé à ${order.contact.email}.`
          : "Votre commande a bien été enregistrée."}
      </p>

      {order && (
        <div className="text-left border border-line divide-y divide-line mb-10">
          <div className="p-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Package size={18} strokeWidth={1.5} className="text-gold" />
              <span className="text-sm text-ink">Livraison estimée</span>
            </div>
            <span className="text-sm text-stone">
              {estimatedDelivery.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
            </span>
          </div>
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
              {order.contact.firstName} {order.contact.lastName}
              <br />
              {order.contact.address}
              <br />
              {order.contact.postalCode} {order.contact.city}, {order.contact.country}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="primary" size="lg">
          <Link href="/boutique">Poursuivre mes achats</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/compte/commandes">Suivre ma commande</Link>
        </Button>
      </div>
    </div>
  );
}
