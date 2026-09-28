"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, Mail, Plus, TrendingUp, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Panel, Loading, LoadError } from "@/components/admin/ui";
import { AreaChart } from "@/components/admin/charts/area-chart";
import { ChartCard, Delta, KpiCard } from "@/components/admin/charts/kpi";
import { MEASURE, formatInt } from "@/components/admin/charts/theme";
import { bucketLabel, moneyAxis, type Analytics } from "@/components/admin/statistics-dashboard";
import { CountUp, IconBadge, SpotlightCard } from "@/components/dashboard/fx";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/admin/utils";
import { cn, formatPrice } from "@/lib/utils";

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

const money = (n: number) => formatPrice(Math.round(n));
const plural = (n: number, one: string, many: string) => (n > 1 ? many : one);

export default function AdminDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [failed, setFailed] = useState(false);
  // Courbe des 30 derniers jours : si elle ne se charge pas, le reste s'affiche quand même.
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    loadDashboard().then(setData, () => setFailed(true));
    createClient()
      .rpc("admin_analytics", { p_days: 30 })
      .then(({ data: result, error }) => {
        if (!error) setAnalytics(result as Analytics);
      });
  }, []);

  const today = new Date().toLocaleDateString("fr-SN", { weekday: "long", day: "numeric", month: "long" });
  const monthName = new Date().toLocaleDateString("fr-SN", { month: "long" });

  return (
    <>
      <PageHeader
        eyebrow={today}
        title="Tableau de bord"
        description="Ce qui attend une action de votre part, puis les ventes."
        action={
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/statistiques">Statistiques</Link>
            </Button>
            <Button asChild variant="gold" size="sm">
              <Link href="/admin/produits/nouveau">
                <Plus size={14} strokeWidth={2} />
                Nouveau produit
              </Link>
            </Button>
          </div>
        }
      />
      {failed && <LoadError>Impossible de charger le tableau de bord. Actualisez la page.</LoadError>}
      {!failed && !data && <Loading />}
      {data && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <Stat
              href="/admin/commandes?statut=pending"
              icon={Clock}
              label="À encaisser"
              value={data.toCollect}
              detail="en attente de paiement"
              urgent={data.toCollect > 0}
            />
            <Stat
              href="/admin/commandes?statut=paid"
              icon={Truck}
              label="À expédier"
              value={data.toShip}
              detail={plural(data.toShip, "commande payée", "commandes payées")}
              urgent={data.toShip > 0}
            />
            <Stat
              icon={TrendingUp}
              label={`Ventes de ${monthName}`}
              value={data.monthSales}
              format={formatInt}
              unit="F CFA"
              detail={`${data.monthOrders} ${plural(data.monthOrders, "commande payée", "commandes payées")}`}
            />
            <Stat
              href="/admin/messages"
              icon={Mail}
              label="Messages"
              value={data.unreadMessages}
              detail={plural(data.unreadMessages, "non lu", "non lus")}
              urgent={data.unreadMessages > 0}
            />
          </div>

          {analytics && <Last30Days data={analytics} />}

          <div className="grid lg:grid-cols-2 gap-6">
            <Panel
              title="En attente de paiement"
              action={
                <Link href="/admin/commandes?statut=pending" className="text-xs text-stone-light hover:text-gold-light transition-colors">
                  Tout voir
                </Link>
              }
            >
              {data.recentOrders.length === 0 ? (
                <p className="px-6 py-10 text-sm text-stone-light">Aucune commande en attente.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.recentOrders.map((o) => (
                    <li key={o.id}>
                      <Link
                        href={`/admin/commandes/${o.id}`}
                        className="flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-ink/[0.03] transition-colors"
                      >
                        <span
                          aria-hidden="true"
                          className="h-9 w-9 shrink-0 rounded-full border border-gold/30 bg-gold/10 text-gold-light flex items-center justify-center text-xs font-medium uppercase"
                        >
                          {o.first_name.charAt(0)}
                          {o.last_name.charAt(0)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink truncate">
                            {o.first_name} {o.last_name}
                          </p>
                          <p className="text-xs text-stone-light mt-0.5">
                            {o.order_number} · {formatDate(o.created_at)}
                          </p>
                        </div>
                        <span className="text-sm text-ink tabular-nums shrink-0">{formatPrice(o.total)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel
              title="Stock faible"
              action={
                <Link href="/admin/produits" className="text-xs text-stone-light hover:text-gold-light transition-colors">
                  Produits
                </Link>
              }
            >
              {data.lowStock.length === 0 ? (
                <p className="px-6 py-10 text-sm text-stone-light">Aucun produit en vente sous {LOW_STOCK + 1} pièces.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.lowStock.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/admin/produits/${p.id}`}
                        className="flex items-center gap-4 px-5 sm:px-6 py-3 hover:bg-ink/[0.03] transition-colors"
                      >
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-sand">
                          {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink truncate">{p.name}</p>
                          {/* Jauge : pleine à LOW_STOCK pièces, vide à l'épuisement. */}
                          <div className="mt-2 h-1 w-full max-w-40 rounded-full bg-ink/10 overflow-hidden" aria-hidden="true">
                            <div
                              className={cn("h-full rounded-full", p.stock === 0 ? "bg-danger" : "bg-gold")}
                              style={{ width: `${Math.max(6, (p.stock / LOW_STOCK) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <span
                          className={cn(
                            "text-xs px-2.5 py-1 rounded-full shrink-0",
                            p.stock === 0 ? "text-danger bg-danger/10" : "text-stone bg-ink/5"
                          )}
                        >
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

function Stat({
  icon,
  label,
  value,
  format,
  unit,
  detail,
  href,
  urgent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  format?: (n: number) => string;
  unit?: string;
  detail: string;
  href?: string;
  urgent?: boolean;
}) {
  return (
    <SpotlightCard href={href} className="p-4 sm:p-6 flex flex-col gap-5 sm:gap-6">
      <div className="flex items-start justify-between gap-3">
        <IconBadge icon={icon} tone={urgent || !href ? "gold" : "muted"} />
        {urgent && (
          <span className="flex items-center gap-2 font-sans-wide text-[0.6rem] uppercase text-gold-light">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-gold opacity-60 animate-ping motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            À traiter
          </span>
        )}
      </div>
      <div>
        <p className="font-sans-wide text-[0.62rem] uppercase text-stone-light mb-2.5">{label}</p>
        <Figure value={value} format={format} unit={unit} className="text-[1.9rem] sm:text-[2.6rem]" />
      </div>
      <div className="flex items-center justify-between gap-2 -mt-2">
        <p className="text-xs text-stone-light">{detail}</p>
        {href && (
          <ArrowUpRight
            size={16}
            strokeWidth={1.5}
            className="shrink-0 text-stone-light group-hover:text-gold-light group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
          />
        )}
      </div>
    </SpotlightCard>
  );
}

// Grand chiffre animé ; l'unité, plus petite, passe à la ligne si la carte est étroite.
function Figure({
  value,
  format,
  unit,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  unit?: string;
  className?: string;
}) {
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 font-display text-ink leading-none", className)}>
      <span className="whitespace-nowrap">
        <CountUp value={value} format={format} />
      </span>
      {unit && <span className="font-body text-xs sm:text-sm text-stone-light">{unit}</span>}
    </p>
  );
}

// Les 30 derniers jours, calculés par public.admin_analytics.
function Last30Days({ data }: { data: Analytics }) {
  const k = data.kpis;
  const points = data.series.map((s) => ({ label: bucketLabel(s.date, false), value: s.revenue }));
  const avgOrder = k.orders > 0 ? k.orders_value / k.orders : 0;
  const avgOrderPrev = k.orders_prev > 0 ? k.orders_value_prev / k.orders_prev : 0;

  return (
    <div className="grid lg:grid-cols-[1.75fr_1fr] gap-6">
      <ChartCard
        title="Chiffre d'affaires encaissé"
        description="30 derniers jours : commandes payées, expédiées ou livrées"
        table={{ columns: ["Jour", "Chiffre d'affaires"], rows: points.map((p) => [p.label, formatPrice(p.value)]) }}
      >
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 mb-5">
          <Figure value={k.revenue} format={formatInt} unit="F CFA" className="text-4xl sm:text-5xl" />
          <Delta current={k.revenue} previous={k.revenue_prev} higherIsBetter />
        </div>
        <AreaChart data={points} name="Chiffre d'affaires par jour" color={MEASURE.revenue} formatValue={formatPrice} formatAxis={moneyAxis} />
      </ChartCard>

      <div className="grid gap-4 content-start">
        <KpiCard
          label="Commandes, 30 jours"
          value={<CountUp value={k.orders} format={formatInt} />}
          current={k.orders}
          previous={k.orders_prev}
          trend={data.series.map((s) => s.orders)}
          trendColor={MEASURE.orders}
        />
        <KpiCard
          label="Visites, 30 jours"
          value={<CountUp value={k.visits} format={formatInt} />}
          current={k.visits}
          previous={k.visits_prev}
          trend={data.series.map((s) => s.visits)}
          trendColor={MEASURE.visits}
        />
        <KpiCard
          label="Panier moyen"
          value={<CountUp value={avgOrder} format={money} />}
          current={avgOrder}
          previous={avgOrderPrev}
        />
        <Link
          href="/admin/statistiques"
          className="group inline-flex items-center gap-2 self-start text-xs text-stone-light hover:text-gold-light transition-colors"
        >
          Toutes les statistiques
          <ArrowUpRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
