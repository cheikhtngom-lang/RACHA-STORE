// Mêmes règles que la fonction create_order de la base (supabase/migrations) :
// si vous les changez ici, changez-les aussi là-bas. Le montant enregistré est
// toujours celui calculé par la base ; ce fichier ne sert qu'à l'affichage.
export const FREE_SHIPPING_THRESHOLD = 100000;

export const SHIPPING_COSTS = {
  standard: 5000,
  express: 10000,
} as const;

export type ShippingMethod = keyof typeof SHIPPING_COSTS;

export function shippingCost(subtotal: number, method: ShippingMethod = "standard") {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COSTS[method];
}

export function discountAmount(subtotal: number, percentOff: number | null | undefined) {
  return percentOff ? Math.floor((subtotal * percentOff) / 100) : 0;
}
