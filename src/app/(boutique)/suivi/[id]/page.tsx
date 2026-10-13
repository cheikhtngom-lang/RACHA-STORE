import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/social-icons";
import { getShopInfo } from "@/lib/get-shop-info";
import { orderWhatsappUrl } from "@/lib/order-whatsapp";
import { isMobileMoney, paymentMethodLabel } from "@/lib/payment-methods";
import { isUuid } from "@/lib/payment";
import { TRACKING_STEPS, type OrderStatus } from "@/lib/order-status";
import { siteUrl } from "@/lib/site";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { cn, formatPrice } from "@/lib/utils";

// Page de suivi d'une commande, sans compte : l'identifiant de la commande,
// aléatoire, n'est connu que du client (lien gardé dans son navigateur et dans
// son message WhatsApp). La page n'affiche ni téléphone, ni e-mail, ni adresse.
// Le client peut renvoyer le récapitulatif à la boutique sur WhatsApp.

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
  payment_method: string | null;
  transaction_ref: string | null;
  created_at: string;
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

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Dakar" });

export default async function TrackingPage({ params, searchParams }: PageProps<"/suivi/[id]">) {
  await connection();
  const { id } = await params;
  const { nouvelle } = await searchParams;
  if (!isUuid(id)) notFound();

  const { data, error } = await createAdminSupabase()
    .from("orders")
    .select(
      "id, order_number, status, first_name, city, country, shipping_method, subtotal, discount, promo_code, shipping_cost, total, payment_method, transaction_ref, created_at, order_items (id, product_name, image_url, color, size, quantity, line_total)"
    )
    .eq("id", id)
    .maybeSingle();
  // Erreur passagère : la page d'erreur propose de réessayer, plutôt qu'un « introuvable ».
  if (error) throw new Error(`Commande illisible : ${error.message}`);
  const order = data as Order | null;
  if (!order) notFound();

  const shop = await getShopInfo();
  const isCancelled = order.status === "cancelled";
  const isNew = nouvelle === "1" && order.status === "pending";
  const currentStep = TRACKING_STEPS.findIndex((s) => s.status === order.status);
  const orderUrl = `${siteUrl ?? "https://www.rachamarket.com"}/suivi/${order.id}`;
  const whatsappUrl = shop.phones[0] && !isCancelled ? orderWhatsappUrl(shop.phones[0].tel, order, orderUrl) : null;
  const awaitingMobileMoney = order.status === "pending" && isMobileMoney(order.payment_method);

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-20 sm:py-28">
      <div className="text-center">
        <p className="eyebrow text-gold mb-4">{isNew ? "Commande enregistrée" : "Suivi de commande"}</p>
        <h1 className="font-display text-3xl sm:text-5xl text-ink leading-tight mb-4">
          {isNew ? `Merci ${order.first_name}` : `Commande n° ${order.order_number}`}
        </h1>
        <p className="text-sm text-stone-light max-w-md mx-auto mb-12">
          {isCancelled
            ? "Cette commande a été annulée. Pour toute question, écrivez-nous depuis la page Contact."
            : isNew
              ? `Votre commande n° ${order.order_number} est bien reçue. Gardez cette page : elle se met à jour à chaque étape.`
              : `Passée le ${dateTime(order.created_at)}.`}
        </p>
      </div>

      {!isCancelled && (
        <ol className="grid grid-cols-4 border border-line mb-10">
          {TRACKING_STEPS.map((s, i) => {
            const done = i <= currentStep;
            return (
              <li key={s.status} className={cn("p-4 sm:p-5 border-line", i > 0 && "border-l", done ? "bg-ink text-cream" : "text-stone-light")}>
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center border text-xs mb-3",
                    done ? "border-cream/40" : "border-line"
                  )}
                >
                  {done ? <Check size={14} strokeWidth={2} /> : i + 1}
                </span>
                <p className="font-sans-wide text-[0.62rem] sm:text-[0.68rem] uppercase">{s.label}</p>
                {i === currentStep && <p className="hidden sm:block text-xs mt-2 text-cream/70 leading-relaxed">{s.hint}</p>}
              </li>
            );
          })}
        </ol>
      )}

      {awaitingMobileMoney && (
        <div className="border border-line p-5 sm:p-6 mb-10 text-sm text-stone leading-relaxed">
          <p className="text-ink mb-1">Paiement par {paymentMethodLabel(order.payment_method)}</p>
          {order.transaction_ref ? (
            <p>
              Numéro de transaction indiqué : <span className="text-ink">{order.transaction_ref}</span>. La boutique vérifie le paiement puis
              valide la commande.
            </p>
          ) : (
            <p>
              Si ce n&apos;est pas déjà fait, envoyez <span className="text-ink tabular-nums">{formatPrice(order.total)}</span>
              {shop.paymentPhone ? (
                <>
                  {" "}
                  au <span className="text-ink whitespace-nowrap">{shop.paymentPhone.display}</span>
                </>
              ) : (
                " au numéro de la boutique"
              )}
              , puis envoyez la capture du paiement sur WhatsApp.
            </p>
          )}
        </div>
      )}

      {order.status === "pending" && order.payment_method === "cash" && (
        <p className="border border-line p-5 sm:p-6 mb-10 text-sm text-stone leading-relaxed">
          Paiement à la livraison : <span className="text-ink tabular-nums">{formatPrice(order.total)}</span> à régler au livreur. La
          boutique vous appelle pour confirmer la commande.
        </p>
      )}

      {whatsappUrl && (
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-stone max-w-md">
            {isNew
              ? "WhatsApp ne s'est pas ouvert ? Envoyez le récapitulatif de votre commande à la boutique : le message est déjà rédigé."
              : "Une question sur cette commande ? Envoyez-en le récapitulatif à la boutique sur WhatsApp."}
          </p>
          <Button asChild variant={isNew ? "primary" : "outline"} size="lg">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={18} />
              Envoyer sur WhatsApp
            </a>
          </Button>
        </div>
      )}

      <div className="border border-line divide-y divide-line mb-10">
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
        <div className="p-6 grid sm:grid-cols-2 gap-6 text-sm text-stone-light">
          <div>
            <p className="text-ink text-xs font-sans-wide uppercase mb-2">Livraison à</p>
            <p>
              {order.city}, {order.country}
            </p>
          </div>
          <div>
            <p className="text-ink text-xs font-sans-wide uppercase mb-2">Paiement</p>
            <p>{paymentMethodLabel(order.payment_method)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/boutique">Poursuivre mes achats</Link>
        </Button>
        {isCancelled && (
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Nous contacter</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
