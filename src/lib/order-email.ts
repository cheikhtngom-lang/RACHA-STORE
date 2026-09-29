import { formatPrice, whatsappNumber } from "@/lib/utils";

// E-mails envoyés à la boutique : nouvelle commande, commande payée, paiement
// à vérifier. Les champs saisis par le client (nom, adresse…) sont échappés :
// ils ne doivent pas injecter de HTML.

export type OrderEmailKind = "new" | "paid" | "order_cancelled" | "duplicate" | "amount_mismatch";

const KINDS: Record<OrderEmailKind, { title: string; status: string; footer: string }> = {
  new: {
    title: "Nouvelle commande",
    status: "en attente de paiement",
    footer: "e-mail automatique envoyé à chaque commande",
  },
  paid: {
    title: "Commande payée",
    status: "payée en ligne (PayDunya), à préparer",
    footer: "e-mail automatique envoyé à chaque paiement",
  },
  order_cancelled: {
    title: "Paiement à vérifier",
    status: "paiement reçu sur une commande annulée : à rembourser ou à traiter à la main",
    footer: "e-mail automatique envoyé quand un paiement demande une vérification",
  },
  duplicate: {
    title: "Paiement à vérifier",
    status: "deuxième paiement reçu pour une commande déjà payée : à rembourser",
    footer: "e-mail automatique envoyé quand un paiement demande une vérification",
  },
  amount_mismatch: {
    title: "Paiement à vérifier",
    status: "montant payé différent du total : la commande est restée en attente",
    footer: "e-mail automatique envoyé quand un paiement demande une vérification",
  },
};

export type NotificationOrder = {
  id: string;
  order_number: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  address_complement: string | null;
  postal_code: string | null;
  city: string;
  country: string;
  shipping_method: "standard" | "express";
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  promo_code: string | null;
  order_items: {
    product_name: string;
    color: string | null;
    size: string | null;
    unit_price: number;
    quantity: number;
    line_total: number;
  }[];
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildOrderNotification(
  order: NotificationOrder,
  adminUrl: string,
  kind: OrderEmailKind = "new",
  // Paiement fait avec les clés de test PayDunya.
  testPayment = false
) {
  const { title, footer } = KINDS[kind];
  const status = `${KINDS[kind].status}${testPayment ? " (paiement de test, aucun argent reçu)" : ""}`;
  const name = `${order.first_name} ${order.last_name}`;
  const address = [
    order.address,
    order.address_complement,
    [order.postal_code, order.city].filter(Boolean).join(" "),
    order.country,
  ]
    .filter(Boolean)
    .join(", ");
  const shipping = order.shipping_method === "express" ? "Livraison express" : "Livraison standard";
  const orderUrl = `${adminUrl}/admin/commandes/${order.id}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber(order.phone)}`;

  const itemLines = order.order_items.map((item) => {
    const options = [item.color, item.size ? `Taille ${item.size}` : null].filter(Boolean).join(" · ");
    return { label: item.product_name, options, detail: `${item.quantity} × ${formatPrice(item.unit_price)}`, total: formatPrice(item.line_total) };
  });

  const totals: [string, string][] = [
    ["Sous-total", formatPrice(order.subtotal)],
    ...(order.discount > 0
      ? [[`Remise${order.promo_code ? ` (${order.promo_code})` : ""}`, `−${formatPrice(order.discount)}`] as [string, string]]
      : []),
    [shipping, order.shipping_cost === 0 ? "Offerte" : formatPrice(order.shipping_cost)],
  ];

  const subject = `${title} ${order.order_number} · ${formatPrice(order.total)}${testPayment ? " (test)" : ""}`;

  const text = [
    `${title} ${order.order_number}`,
    `Statut : ${status}`,
    "",
    `Client : ${name}`,
    `Téléphone : ${order.phone}`,
    `E-mail : ${order.email}`,
    `Livraison : ${address} (${shipping.toLowerCase()})`,
    "",
    ...itemLines.map((l) => `- ${l.label}${l.options ? ` (${l.options})` : ""} : ${l.detail} = ${l.total}`),
    "",
    ...totals.map(([label, value]) => `${label} : ${value}`),
    `Total : ${formatPrice(order.total)}`,
    "",
    `Voir la commande : ${orderUrl}`,
    `WhatsApp du client : ${whatsappUrl}`,
  ].join("\n");

  const cell = "padding: 8px 0; border-bottom: 1px solid #e4dcc9; font-size: 14px; vertical-align: top;";
  const html = `<div style="font-family: Arial, Helvetica, sans-serif; color: #242c27; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
  <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; margin: 0 0 8px;">${title}</p>
  <p style="font-size: 14px; color: #8c897c; margin: 0 0 24px;">${escapeHtml(order.order_number)} · ${status}</p>

  <p style="font-size: 15px; line-height: 1.6; margin: 0 0 4px;"><strong>${escapeHtml(name)}</strong></p>
  <p style="font-size: 14px; line-height: 1.6; margin: 0 0 4px;">${escapeHtml(order.phone)} · ${escapeHtml(order.email)}</p>
  <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px;">${escapeHtml(address)}<br />${shipping}</p>

  <table style="width: 100%; border-collapse: collapse; margin: 0 0 16px;">
    ${itemLines
      .map(
        (l) => `<tr>
      <td style="${cell}">${escapeHtml(l.label)}${l.options ? `<br /><span style="color: #8c897c; font-size: 12px;">${escapeHtml(l.options)}</span>` : ""}<br /><span style="color: #8c897c; font-size: 12px;">${l.detail}</span></td>
      <td style="${cell} text-align: right; white-space: nowrap;">${l.total}</td>
    </tr>`
      )
      .join("")}
    ${totals
      .map(
        ([label, value]) => `<tr>
      <td style="padding: 6px 0; font-size: 13px; color: #4c4a41;">${escapeHtml(label)}</td>
      <td style="padding: 6px 0; font-size: 13px; text-align: right; white-space: nowrap;">${value}</td>
    </tr>`
      )
      .join("")}
    <tr>
      <td style="padding: 12px 0 0; font-size: 15px;"><strong>Total</strong></td>
      <td style="padding: 12px 0 0; font-size: 18px; text-align: right; white-space: nowrap;"><strong>${formatPrice(order.total)}</strong></td>
    </tr>
  </table>

  <p style="margin: 32px 0 12px;">
    <a href="${orderUrl}" style="display: inline-block; background: #242c27; color: #faf8f3; text-decoration: none; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; padding: 14px 28px;">Voir la commande</a>
  </p>
  <p style="margin: 0 0 32px;">
    <a href="${whatsappUrl}" style="font-size: 14px; color: #242c27;">Écrire au client sur WhatsApp</a>
  </p>
  <p style="font-size: 12px; color: #8c897c; margin: 0;">Racha Store · ${footer}</p>
</div>`;

  return { subject, html, text };
}
