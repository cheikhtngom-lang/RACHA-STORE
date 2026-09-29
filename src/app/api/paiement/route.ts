import { getPaydunyaConfig } from "@/lib/paydunya";
import { isUuid, startPayment } from "@/lib/payment";
import { siteUrl } from "@/lib/site";
import { createAdminSupabase } from "@/lib/supabase/admin";

// Ouvre la page de paiement PayDunya d'une commande en attente. Appelé par le
// navigateur juste après create_order, puis depuis /checkout/paiement/[id].
// L'identifiant de la commande (aléatoire, connu du seul client) sert de clé.
//
// Variables Vercel (serveur uniquement) : PAYDUNYA_MASTER_KEY,
// PAYDUNYA_PRIVATE_KEY, PAYDUNYA_TOKEN, PAYDUNYA_MODE, SUPABASE_SECRET_KEY.

export async function POST(request: Request) {
  const config = getPaydunyaConfig();
  if (!config || !process.env.SUPABASE_SECRET_KEY) {
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
    return Response.json({ error: "provider" }, { status: 502 });
  }
}
