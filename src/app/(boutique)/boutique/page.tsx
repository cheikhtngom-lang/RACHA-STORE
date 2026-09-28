import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopPage } from "@/components/shop/shop-page";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Découvrez toute la collection Racha Store : prêt-à-porter, maroquinerie, chaussures, bijoux et parfums.",
};

export default function Boutique() {
  return (
    <Suspense>
      <ShopPage title="Toute la boutique" description="Prêt-à-porter, sacs, chaussures, bijoux et beauté." />
    </Suspense>
  );
}
