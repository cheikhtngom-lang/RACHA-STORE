import { CartItem } from "@/lib/types";

// Dernière commande passée dans cet onglet, pour la page de confirmation
// (un client non connecté ne peut pas relire ses commandes dans la base).
export const LAST_ORDER_KEY = "racha-store-last-order";

export type LastOrder = {
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  shipping: number;
  total: number;
  contact: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    addressComplement: string;
    postalCode: string;
    city: string;
    country: string;
  };
};
