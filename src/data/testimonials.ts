import { Testimonial } from "@/lib/types";
import { img, pools } from "./images";

export const testimonials: Testimonial[] = [
  {
    id: "t-1",
    author: "Camille Dubreuil",
    role: "Cliente depuis 2023",
    avatar: img(pools.portraits[0], 200, 200),
    rating: 5,
    quote:
      "Un service irréprochable du début à la fin. Le colis est arrivé emballé avec un soin qui donne vraiment l'impression de recevoir un cadeau.",
  },
  {
    id: "t-2",
    author: "Yasmine Toure",
    role: "Cliente fidèle",
    avatar: img(pools.portraits[3], 200, 200),
    rating: 5,
    quote:
      "La qualité des matières n'a rien à envier aux grandes maisons. Racha Store est devenu mon adresse incontournable pour chaque occasion.",
  },
  {
    id: "t-3",
    author: "Sophia Bennani",
    role: "Cliente depuis 2022",
    avatar: img(pools.portraits[5], 200, 200),
    rating: 5,
    quote:
      "Le service client a répondu en quelques minutes pour ajuster ma commande. Une expérience d'achat comme on en trouve rarement en ligne.",
  },
  {
    id: "t-4",
    author: "Nadia El Amrani",
    role: "Nouvelle cliente",
    avatar: img(pools.portraits[8], 200, 200),
    rating: 4,
    quote:
      "Livraison rapide et pièce conforme aux photos, ce qui n'est pas toujours le cas. Je recommande sans hésiter.",
  },
];
