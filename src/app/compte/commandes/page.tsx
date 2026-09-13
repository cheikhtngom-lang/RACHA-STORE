"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { AccountShell } from "@/components/account/account-shell";
import { formatPrice } from "@/lib/utils";
import { CartItem } from "@/lib/types";

type Order = {
  orderNumber: string;
  items: CartItem[];
  total: number;
  date: string;
};

function OrdersList() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("racha-store-last-order");
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
  }, []);

  if (!order) {
    return (
      <div className="flex flex-col items-center text-center gap-4 border border-line py-20 px-6">
        <Package size={36} strokeWidth={1} className="text-stone-light" />
        <p className="text-sm text-stone-light max-w-sm">Vous n&apos;avez pas encore de commande à afficher ici.</p>
        <Link href="/boutique" className="text-xs font-sans-wide uppercase underline underline-offset-4 text-ink">
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-line">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6 border-b border-line bg-sand/40">
        <div>
          <p className="text-sm text-ink">Commande n° {order.orderNumber}</p>
          <p className="text-xs text-stone-light mt-1">
            {new Date(order.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span className="font-sans-wide text-[0.65rem] uppercase bg-gold text-ink-dark px-3 py-1.5">Confirmée</span>
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
      <div className="p-6 border-t border-line flex justify-between items-baseline">
        <span className="font-sans-wide text-xs uppercase text-ink">Total</span>
        <span className="font-display text-xl text-ink tabular-nums">{formatPrice(order.total)}</span>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AccountShell>
      <h2 className="font-display text-2xl text-ink mb-6">Mes commandes</h2>
      <OrdersList />
    </AccountShell>
  );
}
