import { Product } from "@/lib/types";

export function getNewArrivals(products: Product[], limit = 8) {
  return products.filter((p) => p.isNew).slice(0, limit);
}

export function getBestSellers(products: Product[], limit = 8) {
  return products.filter((p) => p.isBestSeller).slice(0, limit);
}

export function getLimitedEditions(products: Product[]) {
  return products.filter((p) => p.isLimited);
}

export function getRelatedProducts(products: Product[], product: Product, limit = 4) {
  return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
}
