import { formatPrice, whatsappNumber } from "@/lib/utils";

// Message que le client envoie à la boutique sur WhatsApp depuis la page de sa
// commande (/checkout/paiement/[id]) : la gérante voit la commande passer sans
// être connectée à l'administration. Le client peut modifier le texte avant
// l'envoi, d'où le lien vers la page de la commande, qui montre le vrai statut.

type WhatsappOrder = {
  order_number: string;
  first_name: string;
  city: string;
  country: string;
  shipping_method: "standard" | "express";
  discount: number;
  promo_code: string | null;
  shipping_cost: number;
  total: number;
  order_items: { product_name: string; color: string | null; size: string | null; quantity: number; line_total: number }[];
};

export function orderWhatsappUrl(shopPhone: string, order: WhatsappOrder, isPaid: boolean, orderUrl: string) {
  const items = order.order_items.map((item) => {
    const options = [item.color, item.size ? `taille ${item.size}` : null].filter(Boolean).join(", ");
    return `- ${item.product_name}${options ? ` (${options})` : ""} x${item.quantity} : ${formatPrice(item.line_total)}`;
  });
  const shipping = order.shipping_method === "express" ? "Livraison express" : "Livraison standard";

  const text = [
    `Bonjour Racha Store, je suis ${order.first_name}.`,
    `Je viens de passer la commande *n° ${order.order_number}* sur le site.`,
    "",
    ...items,
    ...(order.discount > 0 ? [`Réduction${order.promo_code ? ` (${order.promo_code})` : ""} : -${formatPrice(order.discount)}`] : []),
    `${shipping} : ${order.shipping_cost === 0 ? "offerte" : formatPrice(order.shipping_cost)}`,
    `*Total : ${formatPrice(order.total)}*`,
    `Paiement : ${isPaid ? "reçu" : "en attente"}`,
    `Livraison à : ${order.city}, ${order.country}`,
    "",
    `Suivi de la commande : ${orderUrl}`,
  ].join("\n");

  return `https://wa.me/${whatsappNumber(shopPhone)}?text=${encodeURIComponent(text)}`;
}
