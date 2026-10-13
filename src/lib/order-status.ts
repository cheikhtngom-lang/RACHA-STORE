// Valeurs de l'enum order_status (supabase/migrations). Depuis octobre 2026 la
// commande se paie par Wave, Orange Money ou à la livraison : « pending » est
// une commande à valider par la gérante, « paid » une commande validée
// (paiement vérifié, ou client joint pour un paiement à la livraison).
export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

export const orderStatusLabels: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "À valider", className: "border border-ink/30 text-ink" },
  paid: { label: "Validée", className: "bg-gold text-ink-dark" },
  shipped: { label: "Expédiée", className: "bg-ink text-cream" },
  delivered: { label: "Livrée", className: "bg-ink text-cream" },
  cancelled: { label: "Annulée", className: "bg-danger text-cream" },
};

// Étapes montrées au client sur la page de suivi (/suivi/[id]).
export const TRACKING_STEPS: { status: Exclude<OrderStatus, "cancelled">; label: string; hint: string }[] = [
  { status: "pending", label: "Reçue", hint: "La boutique a bien reçu votre commande et la vérifie." },
  { status: "paid", label: "Validée", hint: "Commande confirmée : votre colis se prépare." },
  { status: "shipped", label: "Expédiée", hint: "Votre colis est en route." },
  { status: "delivered", label: "Livrée", hint: "Merci pour votre confiance." },
];
