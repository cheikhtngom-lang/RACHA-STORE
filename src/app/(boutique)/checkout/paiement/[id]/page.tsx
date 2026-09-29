import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { AccountOrdersLink, PayButton } from "@/components/checkout/payment-actions";
import { getPaydunyaConfig } from "@/lib/paydunya";
import { isUuid, refreshOrderPayments } from "@/lib/payment";
import type { OrderStatus } from "@/lib/order-status";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";

// Page de retour de PayDunya (paiement fait ou abandonné), et lien « Payer »
// des commandes en attente. L'identifiant de la commande, aléatoire, n'est
// connu que du client : la page n'affiche ni téléphone, ni e-mail, ni adresse.

export const metadata: Metadata = {
  title: "Paiement",
  robots: { index: false, follow: false },
};

type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  first_name: string;
  city: string;
  country: string;
  shipping_method: "standard" | "express";
  subtotal: number;
  discount: number;
  promo_code: string | null;
  shipping_cost: number;
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

async function loadOrder(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, first_name, city, country, shipping_method, subtotal, discount, promo_code, shipping_cost, total, order_items (id, product_name, image_url, color, size, quantity, line_total)"
    )
    .eq("id", id)
    .maybeSingle();
  // Erreur passagère : la page d'erreur propose de réessayer, plutôt qu'un « introuvable ».
  if (error) throw new Error(`Commande illisible : ${error.message}`);
  return data as Order | null;
}

export default async function PaymentPage({ params, searchParams }: PageProps<"/checkout/paiement/[id]">) {
  await connection();
  const { id } = await params;
  const { erreur } = await searchParams;
  if (!isUuid(id)) notFound();

  const supabase = createAdminSupabase();
  let order = await loadOrder(supabase, id);
  if (!order) notFound();

  // Retour depuis PayDunya : la notification de paiement peut arriver après le
  // client, on redemande donc le statut tout de suite.
  const config = getPaydunyaConfig();
  if (order.status === "pending" && config) {
    await refreshOrderPayments(supabase, config, order.id);
    order = (await loadOrder(supabase, id)) ?? order;
  }

  const isPaid = order.status === "paid" || order.status === "shipped" || order.status === "delivered";
  const isCancelled = order.status === "cancelled";

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-20 sm:py-28 text-center">
      <p className="eyebrow text-gold mb-4">
        {isPaid ? "Paiement reçu" : isCancelled ? "Commande annulée" : "Paiement en attente"}
      </p>
      <h1 className="font-display text-3xl sm:text-5xl text-ink leading-tight mb-4">
        {isPaid ? `Merci ${order.first_name}` : `Commande n° ${order.order_number}`}
      </h1>
      <p className="text-sm text-stone-light max-w-md mx-auto mb-10">
        {isPaid
          ? `Votre paiement de ${formatPrice(order.total)} est bien reçu pour la commande n° ${order.order_number}. Gardez ce numéro : il vous sera demandé si vous nous contactez.`
          : isCancelled
            ? "Cette commande a été annulée et ne peut plus être payée. Pour toute question, écrivez-nous depuis la page Contact."
            : "Votre commande est enregistrée, mais le paiement n'est pas encore reçu. Si vous venez de payer, la confirmation peut prendre une minute : actualisez cette page."}
      </p>

      {!isPaid && !isCancelled && (
        <div className="mb-10">
          {config ? (
            <PayButton orderId={order.id} total={order.total} initialError={erreur === "1"} />
          ) : (
            <p className="text-sm text-danger">Le paiement en ligne est momentanément indisponible. Réessayez plus tard.</p>
          )}
          <p className="text-xs text-stone-light mt-4">Wave, Orange Money ou carte bancaire, sur la page sécurisée de PayDunya.</p>
        </div>
      )}

      <div className="text-left border border-line divide-y divide-line mb-10">
        <ul className="divide-y divide-line">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex gap-4 p-6">
              <div className="relative h-20 w-16 shrink-0 bg-sand">
                {item.image_url && <Image src={item.image_url} alt={item.product_name} fill sizes="64px" className="object-cover" />}
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
        <div className="p-6 flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-stone">
            <span>Sous-total</span>
            <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-gold">
              <span>Réduction{order.promo_code ? ` (${order.promo_code})` : ""}</span>
              <span className="tabular-nums">-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-stone">
            <span>{order.shipping_method === "express" ? "Livraison express" : "Livraison standard"}</span>
            <span className="tabular-nums">{order.shipping_cost === 0 ? "Offerte" : formatPrice(order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-line">
            <span className="font-sans-wide text-xs uppercase text-ink">Total</span>
            <span className="font-display text-xl text-ink tabular-nums">{formatPrice(order.total)}</span>
          </div>
        </div>
        <div className="p-6 text-sm text-stone-light">
          <p className="text-ink text-xs font-sans-wide uppercase mb-2">Livraison à</p>
          <p>
            {order.city}, {order.country}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant={isPaid ? "primary" : "outline"} size="lg">
          <Link href="/boutique">Poursuivre mes achats</Link>
        </Button>
        {isCancelled && (
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Nous contacter</Link>
          </Button>
        )}
        <AccountOrdersLink />
      </div>
    </div>
  );
}
