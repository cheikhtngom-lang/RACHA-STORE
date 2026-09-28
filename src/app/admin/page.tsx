"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Panel, Loading, LoadError } from "@/components/admin/ui";
import { formatDate } from "@/lib/admin/utils";
import { formatPrice } from "@/lib/utils";

// En dessous, le produit apparaît dans « Stock faible ».
const LOW_STOCK = 3;

type Dashboard = {
  toCollect: number;
  toShip: number;
  monthSales: number;
  monthOrders: number;
  unreadMessages: number;
  recentOrders: { id: string; order_number: string; first_name: string; last_name: string; total: number; created_at: string }[];
  lowStock: { id: string; name: string; stock: number; images: string[] }[];
};

async function loadDashboard(): Promise<Dashboard> {
  const supabase = createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [pending, paid, month, messages, lowStock] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, first_name, last_name, total, created_at", { count: "exact" })
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
    supabase.from("orders").select("total").in("status", ["paid", "shipped", "delivered"]).gte("created_at", monthStart),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
    supabase
      .from("products")
      .select("id, name, stock, images")
      .eq("is_active", true)
      .lte("stock", LOW_STOCK)
      .order("stock")
      .limit(8),
  ]);

  const error = pending.error ?? paid.error ?? month.error ?? messages.error ?? lowStock.error;
  if (error) throw error;

  const monthTotals: { total: number }[] = month.data ?? [];
  return {
    toCollect: pending.count ?? 0,
    toShip: paid.count ?? 0,
    monthSales: monthTotals.reduce((sum, o) => sum + o.total, 0),
    monthOrders: monthTotals.length,
    unreadMessages: messages.count ?? 0,
    recentOrders: pending.data ?? [],
    lowStock: lowStock.data ?? [],
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadDashboard().then(setData, () => setFailed(true));
  }, []);

  const monthName = new Date().toLocaleDateString("fr-SN", { month: "long" });

  return (
    <>
      <PageHeader title="Tableau de bord" />
      {failed && <LoadError>Impossible de charger le tableau de bord. Actualisez la page.</LoadError>}
      {!failed && !data && <Loading />}
      {data && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Stat
              href="/admin/commandes?statut=pending"
              label="À encaisser"
              value={String(data.toCollect)}
              detail={data.toCollect > 1 ? "commandes en attente de paiement" : "commande en attente de paiement"}
            />
            <Stat
              href="/admin/commandes?statut=paid"
              label="À expédier"
              value={String(data.toShip)}
              detail={data.toShip > 1 ? "commandes payées" : "commande payée"}
            />
            <Stat
              label={`Ventes de ${monthName}`}
              value={formatPrice(data.monthSales)}
              detail={`${data.monthOrders} commande${data.monthOrders > 1 ? "s" : ""} payée${data.monthOrders > 1 ? "s" : ""}`}
            />
            <Stat
              href="/admin/messages"
              label="Messages"
              value={String(data.unreadMessages)}
              detail={data.unreadMessages > 1 ? "non lus" : "non lu"}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Panel
              title="En attente de paiement"
              action={
                <Link href="/admin/commandes?statut=pending" className="text-xs text-stone hover:text-ink underline underline-offset-2">
                  Tout voir
                </Link>
              }
            >
              {data.recentOrders.length === 0 ? (
                <p className="px-6 py-8 text-sm text-stone-light">Aucune commande en attente.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.recentOrders.map((o) => (
                    <li key={o.id}>
                      <Link href={`/admin/commandes/${o.id}`} className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-sand/50">
                        <div className="min-w-0">
                          <p className="text-sm text-ink truncate">
                            {o.first_name} {o.last_name}
                          </p>
                          <p className="text-xs text-stone-light mt-0.5">
                            {o.order_number} · {formatDate(o.created_at)}
                          </p>
                        </div>
                        <span className="text-sm tabular-nums shrink-0">{formatPrice(o.total)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel
              title="Stock faible"
              action={
                <Link href="/admin/produits" className="text-xs text-stone hover:text-ink underline underline-offset-2">
                  Produits
                </Link>
              }
            >
              {data.lowStock.length === 0 ? (
                <p className="px-6 py-8 text-sm text-stone-light">Aucun produit en vente sous {LOW_STOCK + 1} pièces.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.lowStock.map((p) => (
                    <li key={p.id}>
                      <Link href={`/admin/produits/${p.id}`} className="flex items-center gap-4 px-5 sm:px-6 py-3 hover:bg-sand/50">
                        <div className="relative h-12 w-10 shrink-0 bg-sand">
                          {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />}
                        </div>
                        <p className="flex-1 min-w-0 text-sm text-ink truncate">{p.name}</p>
                        <span className={p.stock === 0 ? "text-sm text-[#6E2A32]" : "text-sm text-stone"}>
                          {p.stock === 0 ? "Épuisé" : `${p.stock} en stock`}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}

function Stat({ label, value, detail, href }: { label: string; value: string; detail: string; href?: string }) {
  const content = (
    <>
      <p className="font-sans-wide text-[0.62rem] uppercase text-stone-light mb-3">{label}</p>
      <p className="font-display text-3xl sm:text-4xl text-ink tabular-nums leading-none">{value}</p>
      <div className="flex items-center justify-between gap-2 mt-3">
        <p className="text-xs text-stone-light">{detail}</p>
        {href && <ArrowRight size={14} className="text-stone-light group-hover:text-gold transition-colors shrink-0" />}
      </div>
    </>
  );
  const className = "group border border-line p-4 sm:p-6 flex flex-col justify-between";
  return href ? (
    <Link href={href} className={`${className} hover:border-ink transition-colors`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
