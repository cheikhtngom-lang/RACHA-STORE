"use client";

import { createContext, useContext } from "react";
import type { Catalog } from "@/lib/catalog";

const CatalogContext = createContext<Catalog | null>(null);

// Le catalogue est lu une fois côté serveur (layout) puis partagé avec les
// composants client : recherche, filtres, panier, favoris, menus.
export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  return <CatalogContext value={catalog}>{children}</CatalogContext>;
}

export function useCatalog() {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error("useCatalog doit être utilisé dans <CatalogProvider>");
  return catalog;
}
