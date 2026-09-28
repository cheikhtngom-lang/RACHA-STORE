import type { Metadata } from "next";

export const metadata: Metadata = {
  // Objet avec modèle : un simple texte ferait perdre « | Racha Store » aux pages enfants.
  title: { default: "Commande", template: "%s | Racha Store" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
