"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Heart, MapPin, Package } from "lucide-react";
import { AccountShell } from "@/components/account/account-shell";
import { CountUp, IconBadge, SpotlightCard } from "@/components/dashboard/fx";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { orderStatusLabels, type OrderStatus } from "@/lib/order-status";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn, formatPrice } from "@/lib/utils";

type LatestOrder = {
  id: string;
  order_number: string;
  status: OrderStatus;
  created_at: string;
  total: number;
  order_items: { id: string; product_name: string; image_url: string | null; quantity: number }[];
};

type Summary = { orders: number; addresses: number; latest: LatestOrder | null };

// Étapes du suivi, dans l'ordre de l'enum order_status (hors « Annulée »).
const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Passée" },
  { status: "paid", label: "Payée" },
  { status: "shipped", label: "Expédiée" },
  { status: "delivered", label: "Livrée" },
];

function AccountDashboard() {
  const userId = useAuthStore((s) => s.user?.id);
  const wishlistCount = useWishlistStore((s) => s.ids.length);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    // Filtres explicites : un compte administrateur peut lire toutes les commandes.
    Promise.all([
      supabase
        .from("orders")
        .select("id, order_number, status, created_at, total, order_items (id, product_name, image_url, quantity)", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase.from("addresses").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ]).then(([orders, addresses]) => {
      if (orders.error || addresses.error) {
        setFailed(true);
        return;
      }
      setSummary({
        orders: orders.count ?? 0,
        addresses: addresses.count ?? 0,
        latest: (orders.data?.[0] as LatestOrder | undefined) ?? null,
      });
    });
  }, [userId]);

  const cards = [
    {
      title: "Commandes",
      icon: Package,
      href: "/compte/commandes",
      value: summary?.orders,
      detail: "Suivi et historique",
    },
    {
      title: "Liste de souhaits",
      icon: Heart,
      href: "/liste-de-souhaits",
      value: wishlistCount,
      detail: wishlistCount > 1 ? "articles gardés de côté" : "article gardé de côté",
    },
    {
      title: "Adresses",
      icon: MapPin,
      href: "/compte/adresses",
      value: summary?.addresses,
      detail: "Adresses de livraison",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {cards.map((c) => (
          <SpotlightCard key={c.title} href={c.href} className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
            <div className="flex items-start justify-between gap-3">
              <IconBadge icon={c.icon} />
              <ArrowUpRight
                size={16}
                strokeWidth={1.5}
                className="text-stone-light group-hover:text-gold-light group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </div>
            <div>
              <p className="font-display text-4xl sm:text-5xl text-ink leading-none">
                {c.value === undefined ? <span className="text-stone-light">·</span> : <CountUp value={c.value} />}
              </p>
              <p className="text-xs sm:text-sm text-ink mt-3">{c.title}</p>
              <p className="hidden sm:block text-xs text-stone-light mt-1">{c.detail}</p>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {failed && <p className="text-sm text-danger">Impossible de charger vos commandes. Actualisez la page.</p>}
      {summary &&
        (summary.latest ? (
          <LatestOrderCard order={summary.latest} />
        ) : (
          <div className="dash-card overflow-hidden p-8 sm:p-10">
            <p className="font-sans-wide text-[0.68rem] uppercase text-gold-light mb-4">Aucune commande pour l&apos;instant</p>
            <p className="font-display text-3xl text-ink mb-3">Votre première pièce vous attend</p>
            <p className="text-sm text-stone leading-relaxed mb-8 max-w-md">
              Parcourez la collection : vos commandes et leur suivi apparaîtront ici.
            </p>
            <Button asChild variant="gold">
              <Link href="/boutique">Découvrir la boutique</Link>
            </Button>
          </div>
        ))}
    </div>
  );
}

function LatestOrderCard({ order }: { order: LatestOrder }) {
  const status = orderStatusLabels[order.status];
  const current = STEPS.findIndex((s) => s.status === order.status);
  const shown = order.order_items.slice(0, 4);
  const hidden = order.order_items.length - shown.length;

  return (
    <section className="dash-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 sm:px-8 py-5 border-b border-line">
        <div>
          <p className="font-sans-wide text-[0.62rem] uppercase text-stone-light mb-1">Dernière commande</p>
          <p className="text-sm text-ink">
            N° {order.order_number} ·{" "}
            {new Date(order.created_at).toLocaleDateString("fr-SN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span className={cn("font-sans-wide text-[0.62rem] uppercase px-3 py-1.5", status.className)}>{status.label}</span>
      </div>

      <div className="px-5 sm:px-8 py-8">
        {current === -1 ? (
          <p className="text-sm text-stone">Cette commande a été annulée.</p>
        ) : (
          <ol className="grid grid-cols-4" aria-label="Suivi de la commande">
            {STEPS.map((step, i) => {
              const done = i <= current;
              return (
                <li key={step.status} className="relative flex flex-col items-center text-center" aria-current={i === current ? "step" : undefined}>
                  {/* Trait vers l'étape suivante, doré une fois atteinte. */}
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute top-[13px] left-1/2 w-full h-px",
                        i < current ? "bg-gold shadow-[0_0_8px_rgb(201_161_94/0.7)]" : "bg-line"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 h-7 w-7 rounded-full flex items-center justify-center border text-[0.65rem]",
                      done ? "bg-gold border-gold text-ink-dark" : "bg-cream border-line text-stone-light",
                      i === current && "shadow-[0_0_0_5px_rgb(201_161_94/0.15),0_0_20px_rgb(201_161_94/0.5)]"
                    )}
                  >
                    {done ? <Check size={13} strokeWidth={2.5} /> : i + 1}
                  </span>
                  <span className={cn("mt-3 text-xs", done ? "text-ink" : "text-stone-light")}>{step.label}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6 px-5 sm:px-8 py-5 border-t border-line bg-ink/[0.02]">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {shown.map((item) => (
              <div key={item.id} className="relative h-14 w-11 overflow-hidden rounded-md border-2 border-cream bg-sand" title={item.product_name}>
                {item.image_url && <Image src={item.image_url} alt={item.product_name} fill sizes="44px" className="object-cover" />}
              </div>
            ))}
          </div>
          {hidden > 0 && <span className="text-xs text-stone-light">+{hidden}</span>}
        </div>
        <div className="flex items-center gap-6">
          <p className="font-display text-2xl text-ink tabular-nums">{formatPrice(order.total)}</p>
          <Link
            href="/compte/commandes"
            className="group inline-flex items-center gap-1.5 text-xs font-sans-wide uppercase text-gold-light hover:text-ink transition-colors"
          >
            Détail
            <ArrowUpRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function AccountPage() {
  return (
    <AccountShell>
      <AccountDashboard />
    </AccountShell>
  );
}
