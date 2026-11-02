"use client";

import { createContext, useContext } from "react";

// Le paiement en ligne n'est proposé que si le serveur a ses clés PayDunya :
// le layout de /checkout (serveur) le dit à la page de commande (navigateur).
const OnlinePaymentContext = createContext(false);

export function OnlinePaymentProvider({ available, children }: { available: boolean; children: React.ReactNode }) {
  return <OnlinePaymentContext value={available}>{children}</OnlinePaymentContext>;
}

export function useOnlinePayment() {
  return useContext(OnlinePaymentContext);
}
