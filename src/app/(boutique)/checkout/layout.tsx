import type { Metadata } from "next";
import { OnlinePaymentProvider } from "@/components/checkout/online-payment";
import { getOnlinePaymentConfig } from "@/lib/payment";

export const metadata: Metadata = {
  // Objet avec modèle : un simple texte ferait perdre « | Racha Store » aux pages enfants.
  title: { default: "Commande", template: "%s | Racha Store" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OnlinePaymentProvider available={getOnlinePaymentConfig() !== null}>{children}</OnlinePaymentProvider>;
}
