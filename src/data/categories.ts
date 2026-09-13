import { Category } from "@/lib/types";
import { img, pools } from "./images";

export const categories: Category[] = [
  {
    id: "cat-1",
    slug: "pret-a-porter",
    name: "Prêt-à-porter",
    description: "Des pièces intemporelles taillées dans des matières nobles.",
    image: img(pools.apparel[2], 1200, 1500),
  },
  {
    id: "cat-2",
    slug: "sacs-maroquinerie",
    name: "Sacs & Maroquinerie",
    description: "Le cuir dans sa forme la plus raffinée, façonné à la main.",
    image: img(pools.bags[0], 1200, 1500),
  },
  {
    id: "cat-3",
    slug: "chaussures",
    name: "Chaussures",
    description: "Un équilibre parfait entre allure et confort absolu.",
    image: img(pools.shoes[2], 1200, 1500),
  },
  {
    id: "cat-4",
    slug: "bijoux-accessoires",
    name: "Bijoux & Accessoires",
    description: "Des détails précieux qui subliment chaque silhouette.",
    image: img(pools.jewelry[1], 1200, 1500),
  },
  {
    id: "cat-5",
    slug: "beaute-parfums",
    name: "Beauté & Parfums",
    description: "Des essences rares, composées pour marquer les esprits.",
    image: img(pools.beauty[1], 1200, 1500),
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
