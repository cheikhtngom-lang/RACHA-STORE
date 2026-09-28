const props = [
  {
    title: "Livraison 7j/7",
    description: "Au Sénégal et partout dans le monde, offerte dès 100 000 F CFA d'achat.",
  },
  {
    title: "Article défectueux",
    description: "Échangé ou remboursé après vérification.",
  },
  {
    title: "Paiement sécurisé",
    description: "Wave, Orange Money, Visa et Mastercard.",
  },
  {
    title: "Service client",
    description: "Par téléphone ou WhatsApp, numéros en bas de page.",
  },
];

export function ValueProps() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
      {props.map((p) => (
        <div key={p.title} className="flex flex-col gap-2 lg:border-l lg:border-line lg:pl-6 lg:first:border-l-0 lg:first:pl-0">
          <h3 className="font-sans-wide text-[0.72rem] uppercase text-ink">{p.title}</h3>
          <p className="text-xs text-stone-light leading-relaxed">{p.description}</p>
        </div>
      ))}
    </div>
  );
}
