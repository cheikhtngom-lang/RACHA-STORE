// Valeurs de l'enum order_status (supabase/migrations). Mêmes libellés côté
// client (Mon compte) et côté administration.
export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

export const orderStatusLabels: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "En attente de paiement", className: "border border-ink/30 text-ink" },
  paid: { label: "Payée", className: "bg-gold text-ink-dark" },
  shipped: { label: "Expédiée", className: "bg-ink text-cream" },
  delivered: { label: "Livrée", className: "bg-ink text-cream" },
  cancelled: { label: "Annulée", className: "bg-[#6E2A32] text-cream" },
};
