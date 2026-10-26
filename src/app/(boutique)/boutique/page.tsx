import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopPage } from "@/components/shop/shop-page";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Découvrez toute la boutique Racha Store : vide dressing, tenues africaines, sacs, chaussures, bijoux et parfums.",
};

export default function Boutique() {
  return (
    <Suspense>
      <ShopPage title="Toute la boutique" description="Vide dressing, tenues africaines, sacs, chaussures, bijoux et beauté." />
    </Suspense>
  );
}
