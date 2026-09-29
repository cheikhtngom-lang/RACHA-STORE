import type { SupabaseClient } from "@supabase/supabase-js";
import { confirmInvoice, createInvoice, type PaydunyaConfig } from "@/lib/paydunya";
import type { OrderEmailKind } from "@/lib/order-email";
import { sendOrderEmail } from "@/lib/send-order-email";

// Paiement des commandes avec PayDunya, côté serveur (clé secrète Supabase).
// Voir supabase/migrations/20260929200000_paiement_paydunya.sql.

// Réponses de record_paydunya_payment.
type RecordResult =
  | "paid"
  | "already_recorded"
  | "pending"
  | "cancelled"
  | "failed"
  | "unknown"
  | "amount_mismatch"
  | "order_cancelled"
  | "duplicate";

const EMAILS: Partial<Record<RecordResult, OrderEmailKind>> = {
  paid: "paid",
  amount_mismatch: "amount_mismatch",
  order_cancelled: "order_cancelled",
  duplicate: "duplicate",
};

type PaymentRef = { token: string; order_id: string; mode: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

// Redemande le statut d'une facture à PayDunya puis l'enregistre. Appelé au
// retour du client et par la notification de PayDunya : la base ne compte le
// paiement qu'une fois, et un seul de ces appels envoie l'e-mail à la boutique.
export async function syncPayment(
  supabase: SupabaseClient,
  config: PaydunyaConfig,
  payment: PaymentRef
): Promise<RecordResult> {
  // Facture ouverte avec les clés de l'autre mode (test ou production).
  if (payment.mode !== config.mode) return "pending";

  const invoice = await confirmInvoice(config, payment.token);
  if (invoice.status === "pending") return "pending";

  const { data, error } = await supabase.rpc("record_paydunya_payment", {
    p_token: payment.token,
    p_status: invoice.status,
    p_amount: Number.isFinite(invoice.amount) ? invoice.amount : null,
    p_receipt_url: invoice.receiptUrl,
  });
  if (error) throw new Error(`record_paydunya_payment : ${error.message}`);

  const result = data as RecordResult;
  const email = EMAILS[result];
  if (email) {
    // Le paiement reste enregistré même si l'e-mail ne part pas.
    await sendOrderEmail(supabase, payment.order_id, email, payment.mode === "test").catch((e) =>
      console.error("Paiement : e-mail non envoyé", e)
    );
  }
  return result;
}

// Au retour du client sur le site : relit les factures encore ouvertes.
export async function refreshOrderPayments(supabase: SupabaseClient, config: PaydunyaConfig, orderId: string) {
  const { data: open } = await supabase
    .from("payments")
    .select("token, order_id, mode")
    .eq("order_id", orderId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(3);
  for (const payment of open ?? []) {
    const result = await syncPayment(supabase, config, payment).catch((e) => {
      console.error("Paiement : statut illisible", e);
      return "pending" as const;
    });
    if (result === "paid") return;
  }
}

// Renvoie l'adresse de la page de paiement PayDunya d'une commande en attente,
// ou null si la commande n'est plus à payer (payée, annulée, introuvable).
export async function startPayment(
  supabase: SupabaseClient,
  config: PaydunyaConfig,
  orderId: string,
  baseUrl: string
): Promise<string | null> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_number, status, total, email, first_name, last_name, phone")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError) throw new Error(`Commande illisible : ${orderError.message}`);
  if (!order || order.status !== "pending") return null;

  // Une facture encore ouverte est réutilisée : deux factures payables pour
  // la même commande pourraient être payées toutes les deux.
  const { data: open, error: paymentsError } = await supabase
    .from("payments")
    .select("token, order_id, mode, checkout_url")
    .eq("order_id", order.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (paymentsError) throw new Error(`Paiements illisibles : ${paymentsError.message}`);
  for (const payment of open ?? []) {
    const result = await syncPayment(supabase, config, payment);
    if (result === "pending") {
      if (payment.mode === config.mode) return payment.checkout_url;
      continue;
    }
    if (result === "cancelled" || result === "failed") continue;
    // Payée entre-temps, ou paiement à vérifier par la boutique.
    return null;
  }

  const pageUrl = `${baseUrl}/checkout/paiement/${order.id}`;
  const invoice = await createInvoice(config, {
    amount: order.total,
    description: `Commande ${order.order_number} · Racha Store`,
    customer: { name: `${order.first_name} ${order.last_name}`, email: order.email, phone: order.phone },
    returnUrl: pageUrl,
    cancelUrl: pageUrl,
    callbackUrl: `${baseUrl}/api/webhooks/paydunya`,
    websiteUrl: baseUrl,
    customData: { order_id: order.id, order_number: order.order_number },
  });

  const { error } = await supabase.from("payments").insert({
    order_id: order.id,
    token: invoice.token,
    mode: config.mode,
    amount: order.total,
    checkout_url: invoice.url,
  });
  if (error) throw new Error(`Facture PayDunya non enregistrée : ${error.message}`);
  return invoice.url;
}
