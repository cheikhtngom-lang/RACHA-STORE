const messages = [
  "Livraison offerte dès 100 000 F CFA d'achat",
  "Retours gratuits sous 30 jours",
  "Nouvelle collection disponible dès maintenant",
  "Paiement 100% sécurisé",
];

export function AnnouncementBar() {
  const loop = [...messages, ...messages];
  return (
    <div className="bg-ink-dark text-cream overflow-hidden h-9 flex items-center">
      <div className="flex animate-marquee whitespace-nowrap">
        {loop.map((msg, i) => (
          <span key={i} className="flex items-center px-8 text-[0.68rem] font-sans-wide uppercase tracking-[0.15em]">
            {msg}
            <span className="ml-8 text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
