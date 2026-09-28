import type { Metadata } from "next";
import { getShopInfo } from "@/lib/get-shop-info";
import type { ShopInfo } from "@/lib/shop-info";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Données collectées par Racha Store, utilisation, durée de conservation et exercice de vos droits.",
};

const sections = (shop: ShopInfo): { title: string; paragraphs: string[] }[] => [
  {
    title: "1. Responsable du traitement",
    paragraphs: [
      `Racha Store, ${shop.address}. Pour toute question sur vos données, écrivez-nous depuis la page Contact${shop.contactEmail ? ` ou à ${shop.contactEmail}` : ""}${shop.phones[0] ? `, ou appelez le ${shop.phones[0].display}` : ""}.`,
    ],
  },
  {
    title: "2. Données collectées",
    paragraphs: [
      "Compte client : prénom, nom, adresse e-mail, mot de passe, adresses de livraison et téléphone. Le mot de passe est chiffré de façon irréversible : personne, y compris Racha Store, ne peut le lire.",
      "Commandes : coordonnées de livraison, articles achetés, montants et code promo utilisé.",
      "Formulaire de contact : nom, adresse e-mail, sujet et message.",
      "Newsletter : adresse e-mail.",
      "Mesure d'audience : pages consultées, site de provenance (Instagram, Google…) et type d'appareil (mobile ou ordinateur), comptés de façon anonyme, sans cookie ni adresse IP.",
    ],
  },
  {
    title: "3. Utilisation",
    paragraphs: [
      "Ces données servent uniquement à préparer et livrer vos commandes, gérer votre compte, répondre à vos messages et, si vous vous y êtes inscrit·e, vous envoyer la newsletter. Elles ne sont ni vendues ni louées.",
    ],
  },
  {
    title: "4. Destinataires",
    paragraphs: [
      "Vos données sont accessibles à l'équipe de Racha Store. Le livreur reçoit le nom, le téléphone et l'adresse nécessaires à la livraison.",
      "Le site s'appuie sur des prestataires techniques : Supabase (base de données et comptes clients), Vercel (hébergement du site), Resend (envoi des e-mails de confirmation et de mot de passe) et ImprovMX (réception des e-mails adressés à la boutique). Ces prestataires peuvent héberger les données hors du Sénégal.",
    ],
  },
  {
    title: "5. Durée de conservation",
    paragraphs: [
      "Compte client : tant que le compte existe. Vous pouvez demander sa suppression à tout moment.",
      "Commandes : pendant la durée exigée par les obligations comptables.",
      "Messages : le temps de traiter votre demande.",
      "Newsletter : jusqu'à votre désinscription.",
    ],
  },
  {
    title: "6. Cookies et stockage dans le navigateur",
    paragraphs: [
      "Le site n'utilise que les cookies nécessaires à son fonctionnement : ceux qui gardent votre session ouverte quand vous êtes connecté·e. Votre panier, votre liste de souhaits et les produits consultés récemment sont gardés dans votre navigateur. Aucun cookie publicitaire n'est déposé.",
    ],
  },
  {
    title: "7. Sécurité",
    paragraphs: [
      "Les échanges avec le site sont chiffrés (HTTPS). L'accès aux commandes et aux données clients est réservé aux comptes administrateurs de la boutique.",
    ],
  },
  {
    title: "8. Vos droits",
    paragraphs: [
      `Conformément à la loi sénégalaise n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel, vous pouvez accéder à vos données, les faire rectifier ou supprimer, et vous opposer à leur utilisation. Écrivez-nous depuis la page Contact${shop.contactEmail ? ` ou à ${shop.contactEmail}` : ""}, y compris pour vous désinscrire de la newsletter.`,
      "Vous pouvez également saisir la Commission de Protection des Données Personnelles (CDP).",
    ],
  },
];

export default async function PrivacyPage() {
  const shop = await getShopInfo();
  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-16 sm:py-24">
      <h1 className="font-display text-4xl sm:text-5xl text-ink mb-4">Politique de confidentialité</h1>
      <p className="text-xs text-stone-light mb-16">Dernière mise à jour : septembre 2026</p>

      <div className="flex flex-col gap-10">
        {sections(shop).map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-xl text-ink mb-3">{s.title}</h2>
            <div className="flex flex-col gap-3">
              {s.paragraphs.map((p) => (
                <p key={p} className="text-sm text-stone leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
