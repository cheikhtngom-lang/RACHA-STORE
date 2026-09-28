import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Écrivez-nous ou appelez le +221 77 344 59 51, du lundi au samedi de 10h à 19h. Racha Store, Scat Urbain, Dakar.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
