import type { Metadata } from "next";
import { getShopInfo } from "@/lib/get-shop-info";
import type { ShopInfo } from "@/lib/shop-info";

export const metadata: Metadata = {
  title: "Mentions légales",
};

const sections = (shop: ShopInfo) => [
  {
    title: "1. Éditeur du site",
    body: `Le site Racha Store (www.rachamarket.com) est édité et exploité techniquement par Bustane Holding, entreprise individuelle immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) sous le numéro SN.DKR.2022.A.296, NINEA 009100554, dont le siège est situé à Rufisque, ZAC Mbao, Sénégal, pour le compte de la boutique Racha Store, ${shop.address}. Contact de l'éditeur : bustaneimmo2021@gmail.com, 77 715 65 45.`,
  },
  {
    title: "2. Directeur de la publication",
    body: `Le directeur de la publication du site est le gérant de Bustane Holding.`,
  },
  {
    title: "3. Hébergement",
    body: `Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis. Les comptes clients, les commandes et les photos des produits sont stockés chez Supabase Inc.`,
  },
  {
    title: "4. Propriété intellectuelle",
    body: `L'ensemble des éléments présents sur le site Racha Store (textes, images, logos, vidéos, graphismes) est protégé par le droit d'auteur et le droit des marques. Toute reproduction, représentation ou exploitation, totale ou partielle, sans autorisation préalable, est strictement interdite.`,
  },
  {
    title: "5. Données personnelles",
    body: `Les informations recueillies via le site font l'objet d'un traitement destiné à la gestion des commandes et de la relation client. Conformément à la loi sénégalaise n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données vous concernant, exerçable depuis la page Contact du site${shop.contactEmail ? ` ou à l'adresse ${shop.contactEmail}` : ""}. Vous pouvez également saisir la Commission de Protection des Données Personnelles (CDP).`,
  },
  {
    title: "6. Cookies",
    body: `Le site n'utilise que les cookies nécessaires à son fonctionnement (session des clients connectés) et aucun cookie publicitaire. La mesure d'audience se fait sans cookie. Le détail figure dans la politique de confidentialité.`,
  },
];

export default async function LegalPage() {
  const shop = await getShopInfo();
  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-16 sm:py-24">
      <h1 className="font-display text-4xl sm:text-5xl text-ink mb-4">Mentions légales</h1>
      <p className="text-xs text-stone-light mb-16">Dernière mise à jour : septembre 2026</p>

      <div className="flex flex-col gap-10">
        {sections(shop).map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-xl text-ink mb-3">{s.title}</h2>
            <p className="text-sm text-stone leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
