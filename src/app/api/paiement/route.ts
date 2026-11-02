import { PaydunyaRefusal } from "@/lib/paydunya";
import { getOnlinePaymentConfig, isUuid, startPayment } from "@/lib/payment";
import { siteUrl } from "@/lib/site";
import { createAdminSupabase } from "@/lib/supabase/admin";

// Ouvre la page de paiement PayDunya d'une commande à valider. Appelé par le
// navigateur juste après create_order (choix « Payer en ligne »), puis par le
// bouton « Payer » de la page de suivi. L'identifiant de la commande
// (aléatoire, connu du seul client) sert de clé.
//
// Variables Vercel (serveur uniquement) : PAYDUNYA_MASTER_KEY,
// PAYDUNYA_PRIVATE_KEY, PAYDUNYA_TOKEN, PAYDUNYA_MODE (facultatif), SUPABASE_SECRET_KEY.

export async function POST(request: Request) {
  const config = getOnlinePaymentConfig();
  if (!config) {
    console.error("Paiement : variables PAYDUNYA_* ou SUPABASE_SECRET_KEY manquantes");
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  if (!isUuid(body?.orderId)) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const url = await startPayment(createAdminSupabase(), config, body.orderId, siteUrl ?? new URL(request.url).origin);
    return url ? Response.json({ url }) : Response.json({ error: "not_payable" }, { status: 409 });
  } catch (error) {
    console.error("Paiement :", error);
    // La raison de PayDunya est montrée : elle dit quoi corriger dans le compte PayDunya.
    const reason = error instanceof PaydunyaRefusal ? error.reason : undefined;
    return Response.json({ error: "provider", reason }, { status: 502 });
  }
}
