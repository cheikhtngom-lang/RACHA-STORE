import { createHash, timingSafeEqual } from "node:crypto";

// API PayDunya, paiement avec redirection (https://developers.paydunya.com/doc/FR/http_json).
// Serveur uniquement : les clés ne doivent jamais arriver dans le navigateur.
// PayDunya > Intégrez notre API > application Racha Store : clé principale,
// clé privée et token. Les clés privée et token changent entre test et production.

export type PaydunyaMode = "test" | "live";

export type PaydunyaConfig = {
  masterKey: string;
  privateKey: string;
  token: string;
  mode: PaydunyaMode;
};

export type InvoiceStatus = "pending" | "completed" | "cancelled" | "failed";

const API_URLS: Record<PaydunyaMode, string> = {
  test: "https://app.paydunya.com/sandbox-api/v1",
  live: "https://app.paydunya.com/api/v1",
};

// null tant que les variables PAYDUNYA_* ne sont pas renseignées dans Vercel.
// Sans PAYDUNYA_MODE, le mode suit la clé privée (« live_private_… » ou
// « test_private_… ») : des clés de production envoyées au bac à sable sont refusées.
export function getPaydunyaConfig(): PaydunyaConfig | null {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY?.trim();
  const privateKey = process.env.PAYDUNYA_PRIVATE_KEY?.trim();
  const token = process.env.PAYDUNYA_TOKEN?.trim();
  if (!masterKey || !privateKey || !token) return null;
  const setting = process.env.PAYDUNYA_MODE?.trim().toLowerCase();
  const mode: PaydunyaMode =
    setting === "live" || setting === "test" ? setting : privateKey.startsWith("test_") ? "test" : "live";
  return { masterKey, privateKey, token, mode };
}

// Facture refusée par PayDunya : la raison donnée (« response_text ») permet de
// corriger sans accès aux journaux de Vercel.
export class PaydunyaRefusal extends Error {
  reason: string;
  constructor(reason: string) {
    super(`Facture PayDunya refusée : ${reason}`);
    this.reason = reason;
  }
}

async function callApi(config: PaydunyaConfig, path: string, body?: unknown) {
  const response = await fetch(`${API_URLS[config.mode]}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      "PAYDUNYA-MASTER-KEY": config.masterKey,
      "PAYDUNYA-PRIVATE-KEY": config.privateKey,
      "PAYDUNYA-TOKEN": config.token,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  return response.json().catch(() => null);
}

// PayDunya attend un numéro sénégalais à 9 chiffres (771234567) ; tout autre
// format est laissé de côté : le client le saisira sur la page de paiement.
function paydunyaPhone(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^(00)?221(?=\d{9}$)/, "");
  return /^7\d{8}$/.test(digits) ? digits : undefined;
}

export async function createInvoice(
  config: PaydunyaConfig,
  input: {
    amount: number;
    description: string;
    customer: { name: string; email: string | null; phone: string };
    returnUrl: string;
    cancelUrl: string;
    callbackUrl: string;
    websiteUrl: string;
    customData: Record<string, string>;
  }
): Promise<{ token: string; url: string }> {
  // L'e-mail est facultatif depuis la commande sans compte : il n'est envoyé que s'il existe.
  const customer = {
    name: input.customer.name,
    email: input.customer.email || undefined,
    phone: paydunyaPhone(input.customer.phone),
  };
  // Refus avec les coordonnées du client : nouvel essai sans elles, le client
  // les saisit alors sur la page PayDunya.
  let refusal = "";
  for (const withCustomer of [true, false]) {
    const data = await callApi(config, "/checkout-invoice/create", {
      invoice: {
        total_amount: input.amount,
        description: input.description,
        ...(withCustomer ? { customer } : {}),
      },
      store: { name: "Racha Store", website_url: input.websiteUrl },
      actions: { return_url: input.returnUrl, cancel_url: input.cancelUrl, callback_url: input.callbackUrl },
      custom_data: input.customData,
    });

    const url = typeof data?.response_text === "string" ? data.response_text : "";
    // Le client n'est envoyé que vers une page PayDunya.
    const isPaydunyaUrl = /^https:\/\/([a-z0-9-]+\.)*paydunya\.com\//i.test(url);
    if (data?.response_code === "00" && typeof data.token === "string" && isPaydunyaUrl) {
      return { token: data.token, url };
    }
    refusal = `${data?.response_code ?? "sans réponse"} ${String(data?.response_text ?? data?.description ?? "").slice(0, 200)}`.trim();
    console.warn(`PayDunya (${config.mode}) : facture ${withCustomer ? "complète" : "sans client"} refusée :`, refusal);
  }
  throw new PaydunyaRefusal(refusal);
}

// Statut d'une facture, lu dans l'API PayDunya : c'est la seule source de vérité,
// jamais les paramètres d'une URL ou d'une notification.
export async function confirmInvoice(
  config: PaydunyaConfig,
  token: string
): Promise<{ status: InvoiceStatus; amount: number; receiptUrl: string | null }> {
  const data = await callApi(config, `/checkout-invoice/confirm/${encodeURIComponent(token)}`);
  if (data?.response_code !== "00") {
    throw new Error(`Facture PayDunya illisible : ${data?.response_code ?? "sans réponse"} ${data?.response_text ?? ""}`.trim());
  }
  const raw = String(data.status ?? "");
  const status: InvoiceStatus = raw === "completed" || raw === "pending" || raw === "cancelled" ? raw : "failed";
  return {
    status,
    amount: Number(data.invoice?.total_amount),
    receiptUrl: typeof data.receipt_url === "string" && data.receipt_url.startsWith("https://") ? data.receipt_url : null,
  };
}

// Les notifications de PayDunya portent le SHA-512 de la clé principale.
export function isValidIpnHash(config: PaydunyaConfig, hash: string) {
  const expected = Buffer.from(createHash("sha512").update(config.masterKey).digest("hex"));
  const given = Buffer.from(hash.toLowerCase());
  return given.length === expected.length && timingSafeEqual(given, expected);
}
