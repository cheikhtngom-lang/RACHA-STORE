"use client";

import Link from "next/link";
import { AreaChart } from "@/components/admin/charts/area-chart";
import { ColumnChart } from "@/components/admin/charts/column-chart";
import { BarList } from "@/components/admin/charts/bar-list";
import { RingChart, type RingSegment } from "@/components/admin/charts/ring-chart";
import { Gauge } from "@/components/admin/charts/gauge";
import { ChartCard, Delta, KpiCard } from "@/components/admin/charts/kpi";
import { MEASURE, OTHER, SERIES, formatCompact, formatInt, formatPercent } from "@/components/admin/charts/theme";
import { orderStatusLabels, ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";

// Chiffres calculés par public.admin_analytics (supabase/migrations).
export type Analytics = {
  period: { from: string; to: string; days: number; monthly: boolean };
  kpis: {
    revenue: number;
    revenue_prev: number;
    orders: number;
    orders_prev: number;
    orders_value: number;
    orders_value_prev: number;
    collected: number;
    cancelled: number;
    all_orders: number;
    express: number;
    visits: number;
    visits_prev: number;
    mobile_visits: number;
    items_sold: number;
    buyers: number;
    repeat_buyers: number;
    page_views: number;
    new_accounts: number;
    new_subscribers: number;
    messages: number;
    active_products: number;
    out_of_stock: number;
    low_stock: number;
  };
  series: { date: string; revenue: number; orders: number; visits: number }[];
  statuses: { status: OrderStatus; count: number }[];
  categories: { name: string; position: number | null; revenue: number; quantity: number }[];
  top_products: { name: string; quantity: number; revenue: number }[];
  most_viewed: { name: string; views: number; sold: number }[];
  sources: { source: string; visits: number }[];
  cities: { city: string; orders: number }[];
  weekdays: { dow: number; orders: number }[];
  promo_codes: { code: string; uses: number; discount: number }[];
};


const SOURCE_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  google: "Google",
  whatsapp: "WhatsApp",
  direct: "Accès direct (lien tapé, favori, application)",
  autre: "Autres sites",
};

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// Date de la mise en place du compteur de visites (VisitTracker).
const TRACKING_START = "28 septembre 2026";

function parseDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function bucketLabel(iso: string, monthly: boolean) {
  return parseDate(iso).toLocaleDateString(
    "fr-FR",
    monthly ? { month: "short", year: "2-digit" } : { day: "numeric", month: "short" }
  );
}

export function periodLabel(p: Analytics["period"]) {
  const from = parseDate(p.from);
  const to = parseDate(p.to);
  if (p.monthly) {
    const f = (d: Date) => d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return `De ${f(from)} à ${f(to)}`;
  }
  return `Du ${from.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} au ${to.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

const money = (n: number) => formatPrice(n);
export const moneyAxis = (n: number) => (n === 0 ? "0" : `${formatCompact(n)} F`);
const ratio = (a: number, b: number) => (b > 0 ? a / b : 0);

export function StatisticsDashboard({ data, categoryOrder }: { data: Analytics; categoryOrder: string[] }) {
  const k = data.kpis;
  const monthly = data.period.monthly;
  const series = data.series;
  const placed = k.all_orders - k.cancelled;
  const avgOrder = ratio(k.orders_value, k.orders);
  const avgOrderPrev = ratio(k.orders_value_prev, k.orders_prev);
  const conversion = ratio(k.orders, k.visits);
  const conversionPrev = ratio(k.orders_prev, k.visits_prev);
  const noVisits = k.visits === 0;

  const revenuePoints = series.map((s) => ({ label: bucketLabel(s.date, monthly), value: s.revenue }));
  const visitPoints = series.map((s) => ({ label: bucketLabel(s.date, monthly), value: s.visits }));
  const orderPoints = series.map((s) => ({ label: bucketLabel(s.date, monthly), value: s.orders }));

  // Catégories : 5 couleurs dans l'ordre des catégories, le reste regroupé dans « Autres ».
  const ring: RingSegment[] = [];
  let others = 0;
  for (const c of [...data.categories].sort((a, b) => categoryOrder.indexOf(a.name) - categoryOrder.indexOf(b.name))) {
    const index = categoryOrder.indexOf(c.name);
    if (index >= 0 && index < SERIES.length) {
      ring.push({ key: c.name, label: c.name, value: c.revenue, color: SERIES[index] });
    } else {
      others += c.revenue;
    }
  }
  if (others > 0) ring.push({ key: "autres", label: "Autres", value: others, color: OTHER });

  const statusCounts = ORDER_STATUSES.map((status) => ({
    status,
    count: data.statuses.find((s) => s.status === status)?.count ?? 0,
  }));

  const weekdayPoints = WEEKDAYS.map((label, i) => ({
    label,
    value: data.weekdays.find((w) => w.dow === i + 1)?.orders ?? 0,
  }));

  return (
    <>
      {/* Le chiffre principal de la page. */}
      <ChartCard
        title="Chiffre d'affaires encaissé"
        description="Commandes payées, expédiées ou livrées"
        table={{ columns: ["Période", "Chiffre d'affaires"], rows: revenuePoints.map((p) => [p.label, money(p.value)]) }}
      >
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2 mb-4">
          <p className="text-3xl sm:text-5xl font-semibold text-ink leading-none">{money(k.revenue)}</p>
          <div className="pb-1">
            <Delta current={k.revenue} previous={k.revenue_prev} higherIsBetter />
          </div>
        </div>
        <AreaChart data={revenuePoints} name="Chiffre d'affaires encaissé" color={MEASURE.revenue} formatValue={money} formatAxis={moneyAxis} />
      </ChartCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Commandes"
          value={formatInt(k.orders)}
          current={k.orders}
          previous={k.orders_prev}
          trend={orderPoints.map((p) => p.value)}
          trendColor={MEASURE.orders}
        />
        <KpiCard label="Panier moyen" value={money(avgOrder)} current={avgOrder} previous={avgOrderPrev} />
        <KpiCard
          label="Visites"
          value={formatInt(k.visits)}
          current={k.visits}
          previous={k.visits_prev}
          trend={visitPoints.map((p) => p.value)}
          trendColor={MEASURE.visits}
        />
        <KpiCard
          label="Taux de conversion"
          value={noVisits ? "Non mesuré" : formatPercent(conversion)}
          current={noVisits ? undefined : conversion}
          previous={noVisits ? undefined : conversionPrev}
          note="Commandes pour 100 visites"
        />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <ChartCard
          title="Visites"
          description={noVisits ? `Comptées depuis le ${TRACKING_START}` : `${formatInt(k.page_views)} pages vues au total`}
          table={{ columns: ["Période", "Visites"], rows: visitPoints.map((p) => [p.label, formatInt(p.value)]) }}
        >
          <AreaChart data={visitPoints} name="Visites" color={MEASURE.visits} formatValue={(n) => `${formatInt(n)} visites`} formatAxis={formatInt} integer />
        </ChartCard>

        <ChartCard
          title="D'où viennent les visiteurs"
          description={noVisits ? undefined : `${formatPercent(ratio(k.mobile_visits, k.visits))} des visites sur mobile`}
          table={{ columns: ["Provenance", "Visites"], rows: data.sources.map((s) => [SOURCE_LABELS[s.source] ?? s.source, formatInt(s.visits)]) }}
        >
          {data.sources.length === 0 ? (
            <EmptyNote>Aucune visite enregistrée sur la période.</EmptyNote>
          ) : (
            <BarList
              items={data.sources.map((s) => ({ key: s.source, label: SOURCE_LABELS[s.source] ?? s.source, value: s.visits }))}
              color={MEASURE.visits}
              formatValue={formatInt}
            />
          )}
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <ChartCard
          title="Ventes par catégorie"
          description="Montant des articles commandés, hors commandes annulées"
          table={{
            columns: ["Catégorie", "Articles", "Montant"],
            rows: data.categories.map((c) => [c.name, formatInt(c.quantity), money(c.revenue)]),
          }}
        >
          {ring.length === 0 ? (
            <EmptyNote>Aucune vente sur la période.</EmptyNote>
          ) : (
            <RingChart segments={ring} totalLabel="Total des articles" formatValue={money} />
          )}
        </ChartCard>

        <ChartCard title="Commandes encaissées" description="Part des commandes passées qui sont payées">
          <div className="flex flex-col items-center gap-6">
            <Gauge
              ratio={ratio(k.collected, placed)}
              color={MEASURE.revenue}
              label={`${formatInt(k.collected)} sur ${formatInt(placed)} commande${placed > 1 ? "s" : ""}`}
              detail="Les autres attendent encore leur paiement"
            />
            <div className="w-full grid grid-cols-2 border-t border-line pt-4 text-center">
              <div>
                <p className="text-lg font-semibold text-ink">{formatPercent(ratio(k.cancelled, k.all_orders))}</p>
                <p className="text-xs text-stone-light">commandes annulées</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-ink">{formatPercent(ratio(k.express, k.orders))}</p>
                <p className="text-xs text-stone-light">en livraison express</p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard
          title="Produits les plus vendus"
          description="Nombre d'articles, hors commandes annulées"
          table={{
            columns: ["Produit", "Articles", "Montant"],
            rows: data.top_products.map((p) => [p.name, formatInt(p.quantity), money(p.revenue)]),
          }}
        >
          {data.top_products.length === 0 ? (
            <EmptyNote>Aucune vente sur la période.</EmptyNote>
          ) : (
            <BarList
              items={data.top_products.map((p) => ({ key: p.name, label: p.name, value: p.quantity, detail: money(p.revenue) }))}
              color={MEASURE.orders}
              formatValue={(n) => `${formatInt(n)} vendu${n > 1 ? "s" : ""}`}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Produits les plus consultés"
          description="Un produit très vu mais peu vendu mérite un meilleur prix, de meilleures photos ou plus de stock"
          table={{
            columns: ["Produit", "Vues", "Vendus"],
            rows: data.most_viewed.map((p) => [p.name, formatInt(p.views), formatInt(p.sold)]),
          }}
        >
          {data.most_viewed.length === 0 ? (
            <EmptyNote>{noVisits ? `Les vues sont comptées depuis le ${TRACKING_START}.` : "Aucune fiche produit consultée sur la période."}</EmptyNote>
          ) : (
            <BarList
              items={data.most_viewed.map((p) => ({
                key: p.name,
                label: p.name,
                value: p.views,
                detail: `${formatInt(p.sold)} vendu${p.sold > 1 ? "s" : ""} · ${formatPercent(ratio(p.sold, p.views))} des vues`,
              }))}
              color={MEASURE.visits}
              formatValue={(n) => `${formatInt(n)} vue${n > 1 ? "s" : ""}`}
            />
          )}
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard
          title="Commandes par jour de la semaine"
          description="Pour choisir quand publier et quand préparer les colis"
          table={{ columns: ["Jour", "Commandes"], rows: weekdayPoints.map((p) => [p.label, formatInt(p.value)]) }}
        >
          <ColumnChart data={weekdayPoints} name="Commandes par jour de la semaine" color={MEASURE.orders} formatValue={(n) => `${formatInt(n)} commande${n > 1 ? "s" : ""}`} />
        </ChartCard>

        <ChartCard
          title="Villes de livraison"
          table={{ columns: ["Ville", "Commandes"], rows: data.cities.map((c) => [c.city, formatInt(c.orders)]) }}
        >
          {data.cities.length === 0 ? (
            <EmptyNote>Aucune commande sur la période.</EmptyNote>
          ) : (
            <BarList
              items={data.cities.map((c) => ({ key: c.city, label: c.city, value: c.orders }))}
              color={MEASURE.orders}
              formatValue={(n) => `${formatInt(n)} commande${n > 1 ? "s" : ""}`}
            />
          )}
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard
          title="Commandes par statut"
          table={{ columns: ["Statut", "Commandes"], rows: statusCounts.map((s) => [orderStatusLabels[s.status].label, formatInt(s.count)]) }}
        >
          <BarList
            items={statusCounts.map((s) => ({
              key: s.status,
              label: orderStatusLabels[s.status].label,
              value: s.count,
            }))}
            color={MEASURE.orders}
            formatValue={formatInt}
          />
          <Link
            href="/admin/commandes?statut=pending"
            className="inline-block mt-5 text-xs text-stone hover:text-ink underline underline-offset-2"
          >
            Voir les commandes en attente
          </Link>
        </ChartCard>

        <ChartCard title="Clients et boutique">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Figure
              value={formatPercent(ratio(k.repeat_buyers, k.buyers))}
              label="clients qui ont déjà commandé plusieurs fois"
            />
            <Figure value={formatInt(k.items_sold)} label="articles vendus" />
            <Figure value={formatInt(k.new_accounts)} label="nouveaux comptes clients" />
            <Figure value={formatInt(k.new_subscribers)} label="inscrits à la newsletter" />
            <Figure value={formatInt(k.messages)} label="messages reçus" href="/admin/messages" />
            <Figure
              value={`${formatInt(k.out_of_stock)} · ${formatInt(k.low_stock)}`}
              label={`produits épuisés · stock faible (sur ${formatInt(k.active_products)} en vente)`}
              href="/admin/produits"
            />
          </div>
        </ChartCard>
      </div>

      {data.promo_codes.length > 0 && (
        <ChartCard
          title="Codes promo utilisés"
          table={{
            columns: ["Code", "Utilisations", "Remise accordée"],
            rows: data.promo_codes.map((p) => [p.code, formatInt(p.uses), money(p.discount)]),
          }}
        >
          <BarList
            items={data.promo_codes.map((p) => ({ key: p.code, label: p.code, value: p.uses, detail: `${money(p.discount)} de remise accordée` }))}
            color={MEASURE.orders}
            formatValue={(n) => `${formatInt(n)} utilisation${n > 1 ? "s" : ""}`}
          />
        </ChartCard>
      )}
    </>
  );
}

function Figure({ value, label, href }: { value: string; label: string; href?: string }) {
  const content = (
    <>
      <p className="text-xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-stone-light mt-1 leading-snug">{label}</p>
    </>
  );
  return href ? (
    <Link href={href} className="block hover:opacity-80">
      {content}
    </Link>
  ) : (
    <div>{content}</div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-stone-light py-8 text-center">{children}</p>;
}
