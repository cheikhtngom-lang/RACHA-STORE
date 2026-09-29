// Demande au serveur (/api/paiement) l'adresse de la page de paiement PayDunya
// d'une commande. null : commande plus à payer, ou paiement indisponible.
export async function requestPaymentUrl(orderId: string): Promise<string | null> {
  try {
    const response = await fetch("/api/paiement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const data = await response.json();
    return response.ok && typeof data?.url === "string" ? data.url : null;
  } catch {
    return null;
  }
}
