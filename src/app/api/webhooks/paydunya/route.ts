import { getPaydunyaConfig, isValidIpnHash } from "@/lib/paydunya";
import { syncPayment } from "@/lib/payment";
import { createAdminSupabase } from "@/lib/supabase/admin";

// Notification de paiement (IPN) envoyée par PayDunya à l'adresse callback_url
// de chaque facture. Son contenu n'est pas cru sur parole : la signature est
// vérifiée (SHA-512 de la clé principale), puis le statut de la facture est
// redemandé à l'API PayDunya.

type Notification = { hash: string; token: string };

// PayDunya envoie un formulaire « data[hash]=…&data[invoice][token]=… » ; le
// JSON ({"data": {...}}) est accepté aussi.
async function readNotification(request: Request): Promise<Notification> {
  const fromData = (data: { hash?: unknown; invoice?: { token?: unknown } } | undefined) => ({
    hash: String(data?.hash ?? ""),
    token: String(data?.invoice?.token ?? ""),
  });

  if ((request.headers.get("content-type") ?? "").includes("application/json")) {
    return fromData((await request.json().catch(() => null))?.data);
  }

  const form = await request.formData().catch(() => null);
  const data = form?.get("data");
  if (typeof data === "string") {
    try {
      return fromData(JSON.parse(data));
    } catch {
      return { hash: "", token: "" };
    }
  }
  return { hash: String(form?.get("data[hash]") ?? ""), token: String(form?.get("data[invoice][token]") ?? "") };
}

export async function POST(request: Request) {
  const config = getPaydunyaConfig();
  if (!config || !process.env.SUPABASE_SECRET_KEY) {
    console.error("Webhook PayDunya : variables PAYDUNYA_* ou SUPABASE_SECRET_KEY manquantes");
    return new Response("Server misconfigured", { status: 500 });
  }

  const { hash, token } = await readNotification(request);
  if (!isValidIpnHash(config, hash)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createAdminSupabase();
  const { data: payment, error } = await supabase
    .from("payments")
    .select("token, order_id, mode")
    .eq("token", token)
    .maybeSingle();
  if (error) {
    console.error("Webhook PayDunya : base illisible", error.message);
    return new Response("Database error", { status: 502 });
  }
  if (!payment) {
    return Response.json({ skipped: true });
  }

  try {
    return Response.json({ result: await syncPayment(supabase, config, payment) });
  } catch (error) {
    // Erreur passagère (API PayDunya ou base) : une nouvelle notification, ou
    // le retour du client, rattrapera le paiement.
    console.error("Webhook PayDunya :", error);
    return new Response("Provider error", { status: 502 });
  }
}
