const props = [
  {
    title: "Livraison offerte",
    description: "Dès 100 000 F CFA d'achat, en 2 à 4 jours ouvrés.",
  },
  {
    title: "Retours sous 30 jours",
    description: "Article non porté, dans son emballage d'origine.",
  },
  {
    title: "Paiement sécurisé",
    description: "Visa, Mastercard, American Express et PayPal.",
  },
  {
    title: "Service client",
    description: "Par téléphone ou WhatsApp, du lundi au samedi.",
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
