import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
};

const sections = [
  {
    title: "1. Objet",
    body: `Les présentes conditions générales de vente régissent les relations contractuelles entre Racha Store et toute personne effectuant un achat via le site Racha Store, ci-après « le Client ».`,
  },
  {
    title: "2. Commandes",
    body: `Toute commande passée sur le site suppose l'acceptation sans réserve des présentes conditions générales de vente. La confirmation de commande est envoyée par e-mail à l'adresse renseignée par le Client.`,
  },
  {
    title: "3. Prix",
    body: `Les prix sont indiqués en francs CFA (XOF), toutes taxes comprises. Racha Store se réserve le droit de modifier ses prix à tout moment, étant entendu que le prix figurant sur la fiche produit au moment de la commande sera le seul applicable au Client.`,
  },
  {
    title: "4. Paiement",
    body: `Le paiement est exigible immédiatement à la commande. Le site utilise un système de paiement sécurisé. Les cartes bancaires Visa, Mastercard, American Express ainsi que PayPal sont acceptées.`,
  },
  {
    title: "5. Livraison",
    body: `Les délais de livraison sont indiqués à titre indicatif lors de la commande. Racha Store ne saurait être tenue responsable des conséquences dues à un retard de livraison imputable au transporteur.`,
  },
  {
    title: "6. Droit de rétractation & retours",
    body: `Le Client dispose d'un délai de 30 jours à compter de la réception de sa commande pour exercer son droit de rétractation, sans avoir à justifier de motif. Les articles doivent être retournés non portés, dans leur emballage d'origine avec les étiquettes.`,
  },
  {
    title: "7. Garanties",
    body: `Tous les produits vendus par Racha Store bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés, dans les conditions prévues par la législation sénégalaise en vigueur.`,
  },
  {
    title: "8. Litiges",
    body: `Les présentes conditions générales de vente sont soumises au droit sénégalais. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. À défaut, les juridictions compétentes de Dakar seront saisies.`,
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-16 sm:py-24">
      <h1 className="font-display text-4xl sm:text-5xl text-ink mb-4">Conditions générales de vente</h1>
      <p className="text-xs text-stone-light mb-16">Dernière mise à jour : Janvier 2026</p>

      <div className="flex flex-col gap-10">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-xl text-ink mb-3">{s.title}</h2>
            <p className="text-sm text-stone leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
