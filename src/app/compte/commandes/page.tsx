"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { AccountShell } from "@/components/account/account-shell";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, cn } from "@/lib/utils";

type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

type OrderRow = {
  id: string;
  order_number: string;
  status: OrderStatus;
  created_at: string;
  total: number;
  order_items: {
    id: string;
    product_name: string;
    image_url: string | null;
    color: string | null;
    size: string | null;
    quantity: number;
    line_total: number;
  }[];
};

const statusLabels: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "En attente de paiement", className: "border border-ink/30 text-ink" },
  paid: { label: "Payée", className: "bg-gold text-ink-dark" },
  shipped: { label: "Expédiée", className: "bg-ink text-cream" },
  delivered: { label: "Livrée", className: "bg-ink text-cream" },
  cancelled: { label: "Annulée", className: "bg-[#6E2A32] text-cream" },
};

function OrdersList() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    createClient()
      .from("orders")
      .select("id, order_number, status, created_at, total, order_items (id, product_name, image_url, color, size, quantity, line_total)")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setFailed(true);
        else setOrders(data as OrderRow[]);
      });
  }, []);

  if (failed) {
    return <p className="text-sm text-[#6E2A32]">Impossible de charger vos commandes. Actualisez la page.</p>;
  }

  if (!orders) {
    return <p className="text-sm text-stone-light">Chargement…</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center text-center gap-4 border border-line py-20 px-6">
        <Package size={36} strokeWidth={1} className="text-stone-light" />
        <p className="text-sm text-stone-light max-w-sm">Vous n&apos;avez pas encore passé de commande.</p>
        <Link href="/boutique" className="text-xs font-sans-wide uppercase underline underline-offset-4 text-ink">
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {orders.map((order) => {
        const status = statusLabels[order.status];
        return (
          <div key={order.id} className="border border-line">
            <div className="flex flex-wrap items-center justify-between gap-3 p-6 border-b border-line bg-sand/40">
              <div>
                <p className="text-sm text-ink">Commande n° {order.order_number}</p>
                <p className="text-xs text-stone-light mt-1">
                  {new Date(order.created_at).toLocaleDateString("fr-SN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <span className={cn("font-sans-wide text-[0.65rem] uppercase px-3 py-1.5", status.className)}>
                {status.label}
              </span>
            </div>
            <ul className="divide-y divide-line">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex gap-4 p-6">
                  <div className="relative h-20 w-16 shrink-0 bg-sand">
                    {item.image_url && (
                      <Image src={item.image_url} alt={item.product_name} fill sizes="64px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink">{item.product_name}</p>
                    <p className="text-xs text-stone-light mt-1">
                      {[item.color, item.size ? `Taille ${item.size}` : null, `Qté ${item.quantity}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums shrink-0">{formatPrice(item.line_total)}</span>
                </li>
              ))}
            </ul>
            <div className="p-6 border-t border-line flex justify-between items-baseline">
              <span className="font-sans-wide text-xs uppercase text-ink">Total</span>
              <span className="font-display text-xl text-ink tabular-nums">{formatPrice(order.total)}</span>
            </div>
          </div>
        );
      })}
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
