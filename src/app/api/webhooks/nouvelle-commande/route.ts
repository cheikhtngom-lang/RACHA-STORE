import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { buildOrderNotification, type NotificationOrder } from "@/lib/order-email";
import { siteUrl } from "@/lib/site";

// Appelé par Supabase (Database > Webhooks) à chaque nouvelle commande :
// envoie l'e-mail « Nouvelle commande » à la boutique via Resend.
//
// Destinataires : /admin/parametres (table admin_settings), sinon la variable
// ORDER_NOTIFICATION_EMAILS.
// Variables Vercel (serveur uniquement, jamais NEXT_PUBLIC_) :
// ORDER_WEBHOOK_SECRET, SUPABASE_SECRET_KEY, RESEND_API_KEY, ORDER_NOTIFICATION_EMAILS.

const FROM = "Racha Store <commandes@rachamarket.com>";

function isAuthorized(request: Request) {
  const secret = process.env.ORDER_WEBHOOK_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const envRecipients = (process.env.ORDER_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (!secretKey || !resendKey) {
    console.error("Webhook nouvelle-commande : variables d'environnement manquantes");
    return new Response("Server misconfigured", { status: 500 });
  }

  const payload = await request.json().catch(() => null);
  const orderId: unknown = payload?.record?.id;
  if (payload?.type !== "INSERT" || payload?.table !== "orders" || typeof orderId !== "string") {
    return Response.json({ skipped: true });
  }

  // Seul l'identifiant vient de l'appel : la commande est relue dans la base.
  const supabase = createClient(getSupabaseEnv().url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, email, first_name, last_name, phone, address, address_complement, postal_code, city, country, shipping_method, subtotal, discount, shipping_cost, total, promo_code, order_items (product_name, color, size, unit_price, quantity, line_total)"
    )
    .eq("id", orderId)
    .maybeSingle();
  if (error || !order) {
    console.error("Webhook nouvelle-commande : commande introuvable", orderId, error?.message);
    return new Response("Order not found", { status: 404 });
  }

  // Destinataires choisis dans /admin/parametres ; à défaut, ORDER_NOTIFICATION_EMAILS.
  const { data: settings } = await supabase.from("admin_settings").select("order_emails").maybeSingle();
  const recipients: string[] = settings?.order_emails?.length ? settings.order_emails : envRecipients;
  if (recipients.length === 0) {
    console.error("Webhook nouvelle-commande : aucun destinataire");
    return new Response("Server misconfigured", { status: 500 });
  }

  const { subject, html, text } = buildOrderNotification(order as NotificationOrder, siteUrl ?? "https://www.rachamarket.com");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: recipients, reply_to: order.email, subject, html, text }),
  });
  if (!response.ok) {
    console.error("Webhook nouvelle-commande : envoi Resend refusé", response.status, await response.text());
    return new Response("Email not sent", { status: 502 });
  }

  return Response.json({ sent: true });
}
