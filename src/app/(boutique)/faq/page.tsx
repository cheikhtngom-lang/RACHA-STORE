import type { Metadata } from "next";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Toutes les réponses à vos questions sur les commandes, livraisons, retours et tailles.",
};

const groups = [
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
        a: "Nous acceptons les cartes Visa, Mastercard et American Express, ainsi que PayPal.",
      },
    ],
  },
  {
    title: "Livraison",
    items: [
      {
        q: "Quels sont les délais de livraison ?",
        a: "Comptez 2 à 4 jours ouvrés au Sénégal en livraison standard, et 1 à 2 jours ouvrés en express. Pour l'international, comptez 5 à 8 jours ouvrés.",
      },
      {
        q: "La livraison est-elle offerte ?",
        a: "La livraison standard est offerte dès 100 000 F CFA d'achat. En dessous de ce montant, des frais de 5 000 F CFA s'appliquent.",
      },
      {
        q: "Livrez-vous à l'international ?",
        a: "Oui. Comptez 5 à 8 jours ouvrés, avec des frais à partir de 12 000 F CFA. Contactez-nous pour vérifier que nous livrons dans votre pays.",
      },
    ],
  },
  {
    title: "Retours & remboursements",
    items: [
      {
        q: "Quelle est votre politique de retour ?",
        a: "Vous disposez de 30 jours à compter de la réception pour nous retourner un article non porté, dans son emballage d'origine avec les étiquettes.",
      },
      {
        q: "Comment initier un retour ?",
        a: "Contactez-nous par téléphone ou WhatsApp au +221 77 344 59 51, ou depuis « Mon compte » > « Commandes ». Nous vous indiquons ensuite comment nous remettre l'article.",
      },
      {
        q: "Sous quel délai suis-je remboursé·e ?",
        a: "Le remboursement est effectué sous 5 à 10 jours ouvrés après réception et contrôle de l'article retourné.",
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

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="text-center mb-16">
        <p className="eyebrow text-gold mb-4">Besoin d&apos;aide ?</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink">Questions fréquentes</h1>
      </div>

      <div className="flex flex-col gap-14">
        {groups.map((group) => (
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
