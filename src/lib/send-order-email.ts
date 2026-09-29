import type { SupabaseClient } from "@supabase/supabase-js";
import { buildOrderNotification, type NotificationOrder, type OrderEmailKind } from "@/lib/order-email";
import { siteUrl } from "@/lib/site";

// Envoie un e-mail à la boutique au sujet d'une commande, via Resend.
// Destinataires : /admin/parametres (table admin_settings), sinon la variable
// ORDER_NOTIFICATION_EMAILS. Variables Vercel (serveur uniquement) :
// RESEND_API_KEY, ORDER_NOTIFICATION_EMAILS.

const FROM = "Racha Store <commandes@rachamarket.com>";

export async function sendOrderEmail(
  supabase: SupabaseClient,
  orderId: string,
  kind: OrderEmailKind,
  testPayment = false
): Promise<"sent" | "not_found" | "misconfigured" | "failed"> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("E-mail commande : RESEND_API_KEY manquante");
    return "misconfigured";
  }

  // Seul l'identifiant vient de l'appelant : la commande est relue dans la base.
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, email, first_name, last_name, phone, address, address_complement, postal_code, city, country, shipping_method, subtotal, discount, shipping_cost, total, promo_code, order_items (product_name, color, size, unit_price, quantity, line_total)"
    )
    .eq("id", orderId)
    .maybeSingle();
  if (error || !order) {
    console.error("E-mail commande : commande introuvable", orderId, error?.message);
    return "not_found";
  }

  const { data: settings } = await supabase.from("admin_settings").select("order_emails").maybeSingle();
  const envRecipients = (process.env.ORDER_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const recipients: string[] = settings?.order_emails?.length ? settings.order_emails : envRecipients;
  if (recipients.length === 0) {
    console.error("E-mail commande : aucun destinataire");
    return "misconfigured";
  }

  const { subject, html, text } = buildOrderNotification(
    order as NotificationOrder,
    siteUrl ?? "https://www.rachamarket.com",
    kind,
    testPayment
  );
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: recipients, reply_to: order.email, subject, html, text }),
  });
  if (!response.ok) {
    console.error("E-mail commande : envoi Resend refusé", response.status, await response.text());
    return "failed";
  }
  return "sent";
}
