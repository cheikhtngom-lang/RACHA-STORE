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
    body: `Toute commande passée sur le site suppose l'acceptation sans réserve des présentes conditions générales de vente. Le Client commande sans créer de compte, avec ses nom, téléphone et adresse de livraison. Il reçoit un numéro de commande et un lien de suivi, et peut envoyer le récapitulatif de sa commande à Racha Store sur WhatsApp. La commande est confirmée par Racha Store après vérification du paiement ou, pour un paiement à la livraison, après un échange avec le Client.`,
  },
  {
    title: "3. Prix",
    body: `Les prix sont indiqués en francs CFA (XOF), toutes taxes comprises. Racha Store se réserve le droit de modifier ses prix à tout moment, étant entendu que le prix figurant sur la fiche produit au moment de la commande sera le seul applicable au Client.`,
  },
  {
    title: "4. Paiement",
    body: `Le Client choisit à la commande entre Wave, Orange Money et le paiement à la livraison. Par Wave ou Orange Money, il envoie le montant total au numéro indiqué au moment de la commande ; la commande est validée dès réception du paiement. À la livraison, il règle le montant total au livreur, en espèces, à la remise du colis. Racha Store ne demande jamais les codes secrets Wave ou Orange Money du Client.`,
  },
  {
    title: "5. Livraison",
    body: `Racha Store livre 7j/7, au Sénégal et à l'international. Les délais communiqués au Client sont donnés à titre indicatif. Racha Store ne saurait être tenue responsable des conséquences dues à un retard de livraison imputable au transporteur.`,
  },
  {
    title: "6. Retours",
    body: `Les articles ne sont ni repris ni remboursés pour un changement d'avis. Un article défectueux ou non conforme à la commande est échangé ou remboursé après vérification, à condition que le Client contacte Racha Store dès réception et remette l'article non lavé, avec ses étiquettes d'origine.`,
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
      <p className="text-xs text-stone-light mb-16">Dernière mise à jour : octobre 2026</p>

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
