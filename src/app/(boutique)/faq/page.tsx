import type { Metadata } from "next";
import { getShopInfo } from "@/lib/get-shop-info";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Toutes les réponses à vos questions sur les commandes, la livraison, les articles défectueux et les tailles.",
};

const groups = (phone: string) => [
  {
    title: "Commandes",
    items: [
      {
        q: "Comment suivre ma commande ?",
        a: "Une fois votre commande expédiée, vous recevez un e-mail de confirmation avec un lien de suivi. Vous pouvez également consulter l'état de vos commandes depuis votre espace « Mon compte ».",
      },
      {
        q: "Puis-je modifier ou annuler ma commande ?",
        a: "Contactez notre service client dans les 2 heures suivant votre achat : nous ferons notre possible pour modifier ou annuler votre commande avant son expédition.",
      },
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Nous acceptons Wave, Orange Money et les cartes bancaires Visa et Mastercard.",
      },
    ],
  },
  {
    title: "Livraison",
    items: [
      {
        q: "Quels sont les délais de livraison ?",
        a: "Nous livrons 7j/7, au Sénégal et partout dans le monde. Le délai dépend de votre adresse et du mode choisi (standard ou express) : contactez-nous pour une estimation.",
      },
      {
        q: "La livraison est-elle offerte ?",
        a: "La livraison standard est offerte dès 100 000 F CFA d'achat. En dessous de ce montant, des frais de 5 000 F CFA s'appliquent.",
      },
      {
        q: "Livrez-vous à l'international ?",
        a: "Oui, partout dans le monde, 7j/7. Contactez-nous pour connaître le délai vers votre pays.",
      },
    ],
  },
  {
    title: "Article défectueux",
    items: [
      {
        q: "Puis-je retourner un article ?",
        a: "Les articles ne sont pas repris pour un changement d'avis. Un article défectueux ou qui ne correspond pas à votre commande est échangé ou remboursé après vérification.",
      },
      {
        q: "Que faire si mon article est défectueux ?",
        a: `Contactez-nous dès réception par téléphone ou WhatsApp${phone ? ` au ${phone}` : ""}, ou depuis « Mon compte » > « Commandes », avec une photo de l'article. Nous vous indiquons ensuite comment nous le remettre.`,
      },
      {
        q: "Sous quel délai suis-je remboursé·e ?",
        a: "Si un remboursement est convenu, il est effectué sous 5 à 10 jours ouvrés après vérification de l'article.",
      },
    ],
  },
  {
    title: "Tailles",
    id: "tailles",
    items: [
      {
        q: "Comment choisir ma taille ?",
        a: "Consultez notre guide des tailles disponible sur chaque fiche produit. En cas de doute entre deux tailles, nous recommandons généralement de prendre la taille supérieure pour les pièces structurées.",
      },
      {
        q: "Les tailles sont-elles ajustées ou larges ?",
        a: "Chaque description produit précise la coupe (ajustée, régulière ou oversize). N'hésitez pas à contacter notre service client pour un conseil personnalisé.",
      },
    ],
  },
];

export default async function FaqPage() {
  const shop = await getShopInfo();
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="text-center mb-16">
        <p className="eyebrow text-gold mb-4">Besoin d&apos;aide ?</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink">Questions fréquentes</h1>
      </div>

      <div className="flex flex-col gap-14">
        {groups(shop.phones[0]?.display ?? "").map((group) => (
          <div key={group.title} id={group.id}>
            <h2 className="font-display text-2xl text-ink mb-4">{group.title}</h2>
            <Accordion type="multiple">
              {group.items.map((item, i) => (
                <AccordionItem key={i} value={`${group.title}-${i}`} className={i === group.items.length - 1 ? "border-b-0" : ""}>
                  <AccordionTrigger className="normal-case text-sm tracking-normal text-ink">{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
