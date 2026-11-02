// Demande au serveur (/api/paiement) l'adresse de la page de paiement PayDunya
// d'une commande. Sans adresse : commande plus à payer, paiement indisponible,
// ou facture refusée par PayDunya (avec sa raison).
export async function requestPaymentUrl(orderId: string): Promise<{ url?: string; reason?: string }> {
  try {
    const response = await fetch("/api/paiement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const data = await response.json();
    if (response.ok && typeof data?.url === "string") return { url: data.url };
    return { reason: typeof data?.reason === "string" ? data.reason : undefined };
  } catch {
    return {};
  }
}
