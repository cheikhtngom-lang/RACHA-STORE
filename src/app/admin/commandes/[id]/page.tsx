"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Panel, OrderStatusBadge, Loading, LoadError, ConfirmDialog } from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/shared/social-icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { orderStatusLabels, type OrderStatus } from "@/lib/order-status";
import { dbErrorMessage, formatDateTime } from "@/lib/admin/utils";
import { formatPrice, cn, whatsappNumber } from "@/lib/utils";

type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  address_complement: string | null;
  postal_code: string | null;
  city: string;
  country: string;
  shipping_method: "standard" | "express";
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  promo_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    product_id: string | null;
    product_name: string;
    sku: string;
    image_url: string | null;
    color: string | null;
    size: string | null;
    unit_price: number;
    quantity: number;
    line_total: number;
  }[];
};

// Factures PayDunya de la commande (table payments).
type Payment = {
  token: string;
  mode: "test" | "live";
  status: "pending" | "completed" | "cancelled" | "failed";
  amount: number;
  amount_paid: number | null;
  receipt_url: string | null;
  created_at: string;
  completed_at: string | null;
};

const paymentStatusLabels: Record<Payment["status"], string> = {
  pending: "Page de paiement ouverte",
  completed: "Paiement reçu",
  cancelled: "Abandonné par le client",
  failed: "Refusé ou expiré",
};

// Étapes normales d'une commande ; l'annulation est un bouton à part.
const STEPS: OrderStatus[] = ["pending", "paid", "shipped", "delivered"];

const shippingLabels = {
  standard: "Livraison standard",
  express: "Livraison express (en priorité)",
};

export default function AdminOrderPage({ params }: PageProps<"/admin/commandes/[id]">) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [failed, setFailed] = useState(false);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    createClient()
      .from("orders")
      .select("*, order_items (id, product_id, product_name, sku, image_url, color, size, unit_price, quantity, line_total)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setFailed(true);
          return;
        }
        setOrder(data as Order);
        setNote(data.notes ?? "");
      });
    // Requête à part : la page reste utilisable si la table n'existe pas encore.
    createClient()
      .from("payments")
      .select("token, mode, status, amount, amount_paid, receipt_url, created_at, completed_at")
      .eq("order_id", id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPayments((data as Payment[] | null) ?? []));
  }, [id]);

  async function setStatus(status: OrderStatus) {
    if (!order) return;
    setUpdating(true);
    const { error } = await createClient().rpc("admin_set_order_status", { p_order_id: order.id, p_status: status });
    setUpdating(false);
    setConfirmCancel(false);
    if (error) {
      toast.error(dbErrorMessage(error, "Le statut n'a pas pu être modifié."));
      return;
    }
    setOrder({ ...order, status });
    toast.success(`Commande ${orderStatusLabels[status].label.toLowerCase()}`);
  }

  async function saveNote() {
    if (!order) return;
    setSavingNote(true);
    const value = note.trim() || null;
    const { error } = await createClient().from("orders").update({ notes: value }).eq("id", order.id);
    setSavingNote(false);
    if (error) {
      toast.error(dbErrorMessage(error, "La note n'a pas pu être enregistrée."));
      return;
    }
    setOrder({ ...order, notes: value });
    toast.success("Note enregistrée");
  }

  const back = { href: "/admin/commandes", label: "Commandes" };

  if (failed) {
    return (
      <>
        <PageHeader title="Commande introuvable" back={back} />
        <LoadError>Cette commande n&apos;existe pas ou n&apos;a pas pu être chargée.</LoadError>
      </>
    );
  }
  if (!order) return <Loading />;

  const whatsappText = `Bonjour ${order.first_name}, merci pour votre commande ${order.order_number} sur Racha Store (${formatPrice(order.total)}).`;

  const received = payments.filter((p) => p.status === "completed");
  const paymentWarnings = [
    received.length > 1 && "Plusieurs paiements reçus pour cette commande : remboursez le paiement en trop depuis PayDunya.",
    received.length > 0 && order.status === "cancelled" && "Paiement reçu sur une commande annulée : à rembourser depuis PayDunya.",
    received.some((p) => p.amount_paid !== order.total) && "Montant payé différent du total de la commande.",
  ].filter((w): w is string => Boolean(w));

  return (
    <>
      <PageHeader
        title={`Commande ${order.order_number}`}
        description={`Passée le ${formatDateTime(order.created_at)}`}
        back={back}
        action={<OrderStatusBadge status={order.status} />}
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          <Panel title="Statut">
            <div className="p-5 sm:p-6">
              {order.status === "cancelled" ? (
                <p className="text-sm text-stone">
                  Commande annulée le {formatDateTime(order.updated_at)}. Les articles ont été remis en stock.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {STEPS.map((step) => (
                      <button
                        key={step}
                        type="button"
                        disabled={updating || step === order.status}
                        onClick={() => setStatus(step)}
                        className={cn(
                          "h-11 px-3 font-sans-wide text-[0.62rem] uppercase border transition-colors cursor-pointer disabled:cursor-default",
                          step === order.status ? "bg-ink border-ink text-cream" : "border-line text-stone hover:border-ink hover:text-ink"
                        )}
                      >
                        {orderStatusLabels[step].label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    disabled={updating}
                    className="mt-5 text-xs text-danger underline underline-offset-2 cursor-pointer"
                  >
                    Annuler la commande
                  </button>
                </>
              )}
            </div>
          </Panel>

          <Panel title="Paiement">
            <div className="p-5 sm:p-6 text-sm flex flex-col gap-4">
              {payments.length === 0 ? (
                <p className="text-stone">Aucun paiement en ligne pour cette commande.</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {payments.map((p) => (
                    <li key={p.token}>
                      <div className="flex justify-between gap-3">
                        <span className="text-ink">
                          {paymentStatusLabels[p.status]}
                          {p.mode === "test" ? " (test, aucun argent reçu)" : ""}
                        </span>
                        <span className="tabular-nums shrink-0">{formatPrice(p.amount_paid ?? p.amount)}</span>
                      </div>
                      <p className="text-xs text-stone-light mt-1">
                        PayDunya · {formatDateTime(p.completed_at ?? p.created_at)}
                        {p.receipt_url && (
                          <>
                            {" · "}
                            <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                              Voir le reçu
                            </a>
                          </>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {paymentWarnings.map((w) => (
                <p key={w} className="text-xs text-danger border border-danger/30 p-3">
                  {w}
                </p>
              ))}
            </div>
          </Panel>

          <Panel title={`Articles (${order.order_items.reduce((n, i) => n + i.quantity, 0)})`}>
            <ul className="divide-y divide-line">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex gap-4 px-5 sm:px-6 py-4">
                  <div className="relative h-20 w-16 shrink-0 bg-sand">
                    {item.image_url && <Image src={item.image_url} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {item.product_id ? (
                      <Link href={`/admin/produits/${item.product_id}`} className="text-sm text-ink hover:underline underline-offset-2">
                        {item.product_name}
                      </Link>
                    ) : (
                      <p className="text-sm text-ink">{item.product_name}</p>
                    )}
                    <p className="text-xs text-stone-light mt-1">
                      {[item.sku, item.color, item.size ? `Taille ${item.size}` : null].filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-xs text-stone mt-1 tabular-nums">
                      {item.quantity} × {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums shrink-0">{formatPrice(item.line_total)}</span>
                </li>
              ))}
            </ul>
            <dl className="border-t border-line px-5 sm:px-6 py-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone">Sous-total</dt>
                <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-stone">Remise{order.promo_code ? ` (${order.promo_code})` : ""}</dt>
                  <dd className="tabular-nums">−{formatPrice(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-stone">{order.shipping_method === "express" ? "Livraison express" : "Livraison standard"}</dt>
                <dd className="tabular-nums">{order.shipping_cost === 0 ? "Offerte" : formatPrice(order.shipping_cost)}</dd>
              </div>
              <div className="flex justify-between items-baseline border-t border-line pt-3 mt-1">
                <dt className="font-sans-wide text-xs uppercase text-ink">Total</dt>
                <dd className="font-display text-2xl text-ink tabular-nums">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Note interne">
            <div className="p-5 sm:p-6 flex flex-col gap-3">
              <Textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Visible seulement dans l'administration. Ex. : payé par Wave le 28/09, livreur Moussa."
                aria-label="Note interne"
              />
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                onClick={saveNote}
                disabled={savingNote || (note.trim() || null) === order.notes}
              >
                {savingNote ? "Enregistrement…" : "Enregistrer la note"}
              </Button>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Client">
            <div className="p-5 sm:p-6 text-sm flex flex-col gap-4">
              <div>
                <p className="text-ink">
                  {order.first_name} {order.last_name}
                </p>
                <p className="text-stone mt-1 break-all">{order.email}</p>
                <p className="text-stone mt-1">{order.phone}</p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={`https://wa.me/${whatsappNumber(order.phone)}?text=${encodeURIComponent(whatsappText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 h-11 px-4 border border-line hover:border-ink transition-colors"
                >
                  <WhatsAppIcon size={15} className="text-gold" />
                  Écrire sur WhatsApp
                </a>
                <a href={`tel:${order.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 h-11 px-4 border border-line hover:border-ink transition-colors">
                  <Phone size={15} strokeWidth={1.5} className="text-gold" />
                  Appeler
                </a>
                <a
                  href={`mailto:${order.email}?subject=${encodeURIComponent(`Votre commande ${order.order_number}`)}`}
                  className="flex items-center gap-3 h-11 px-4 border border-line hover:border-ink transition-colors"
                >
                  <Mail size={15} strokeWidth={1.5} className="text-gold" />
                  Envoyer un e-mail
                </a>
              </div>
            </div>
          </Panel>

          <Panel title="Livraison">
            <div className="p-5 sm:p-6 text-sm text-stone leading-relaxed">
              <p>
                {order.address}
                {order.address_complement ? `, ${order.address_complement}` : ""}
                <br />
                {[order.postal_code, order.city].filter(Boolean).join(" ")}, {order.country}
              </p>
              <p className="text-xs text-stone-light mt-3">{shippingLabels[order.shipping_method]}</p>
            </div>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Annuler la commande ?"
        confirmLabel="Annuler la commande"
        onConfirm={() => setStatus("cancelled")}
        pending={updating}
      >
        Les articles seront remis en stock
        {order.promo_code ? ` et le code ${order.promo_code} pourra de nouveau être utilisé` : ""}. Une commande annulée ne
        peut plus changer de statut.
        {received.length > 0 && " Le paiement reçu n'est pas remboursé automatiquement : remboursez le client depuis PayDunya."}
      </ConfirmDialog>
    </>
  );
}
