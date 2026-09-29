import { timingSafeEqual } from "node:crypto";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { sendOrderEmail } from "@/lib/send-order-email";

// Appelé par Supabase (Database > Webhooks) à chaque nouvelle commande :
// envoie l'e-mail « Nouvelle commande » à la boutique via Resend.
//
// Variables Vercel (serveur uniquement, jamais NEXT_PUBLIC_) :
// ORDER_WEBHOOK_SECRET, SUPABASE_SECRET_KEY, RESEND_API_KEY, ORDER_NOTIFICATION_EMAILS.

function isAuthorized(request: Request) {
  const secret = process.env.ORDER_WEBHOOK_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

const FAILURES = {
  not_found: ["Order not found", 404],
  misconfigured: ["Server misconfigured", 500],
  failed: ["Email not sent", 502],
} as const;

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!process.env.SUPABASE_SECRET_KEY) {
    console.error("Webhook nouvelle-commande : SUPABASE_SECRET_KEY manquante");
    return new Response("Server misconfigured", { status: 500 });
  }

  const payload = await request.json().catch(() => null);
  const orderId: unknown = payload?.record?.id;
  if (payload?.type !== "INSERT" || payload?.table !== "orders" || typeof orderId !== "string") {
    return Response.json({ skipped: true });
  }

  const result = await sendOrderEmail(createAdminSupabase(), orderId, "new");
  if (result === "sent") return Response.json({ sent: true });
  const [message, status] = FAILURES[result];
  return new Response(message, { status });
}
