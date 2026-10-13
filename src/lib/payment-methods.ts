// Moyens de paiement proposés à la commande (colonne orders.payment_method).
// Wave et Orange Money : le client envoie le montant au numéro de paiement de
// la boutique (/admin/parametres, onglet Boutique), puis la gérante vérifie
// sur son téléphone avant de valider. À la livraison : le client paie le livreur.
// « PayDunya » ne concerne que les anciennes commandes payées en ligne.
export type PaymentMethod = "wave" | "orange_money" | "cash";

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; hint: string }[] = [
  { id: "wave", label: "Wave", hint: "Envoyez le montant au numéro de la boutique." },
  { id: "orange_money", label: "Orange Money", hint: "Envoyez le montant au numéro de la boutique." },
  { id: "cash", label: "À la livraison", hint: "Vous payez le livreur à la réception du colis." },
];

export function isMobileMoney(method: string | null | undefined): method is "wave" | "orange_money" {
  return method === "wave" || method === "orange_money";
}

export function paymentMethodLabel(method: string | null | undefined) {
  if (method === "PayDunya") return "En ligne (PayDunya)";
  return PAYMENT_METHODS.find((m) => m.id === method)?.label ?? "Non précisé";
}

// « Wave, Orange Money ou paiement à la livraison ».
export function paymentMethodsText(conjunction: "ou" | "et" = "ou") {
  return `Wave, Orange Money ${conjunction} paiement à la livraison`;
}
