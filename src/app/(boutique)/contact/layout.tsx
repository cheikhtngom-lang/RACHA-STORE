import type { Metadata } from "next";
import { getShopInfo } from "@/lib/get-shop-info";

export async function generateMetadata(): Promise<Metadata> {
  const shop = await getShopInfo();
  const phone = shop.phones[0] ? `appelez le ${shop.phones[0].display}` : "appelez-nous";
  const hours = shop.openingHours ? `, ${shop.openingHours.charAt(0).toLowerCase()}${shop.openingHours.slice(1)}` : "";
  return {
    title: "Contact",
    description: `Écrivez-nous ou ${phone}${hours}. Racha Store, ${shop.address}.`,
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
