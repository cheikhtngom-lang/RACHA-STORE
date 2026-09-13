import { Truck, RotateCcw, ShieldCheck, Headset } from "lucide-react";

const props = [
  {
    icon: Truck,
    title: "Livraison offerte",
    description: "Dès 100 000 F CFA d'achat, partout en Afrique de l'Ouest.",
  },
  {
    icon: RotateCcw,
    title: "Retours sous 30 jours",
    description: "Un changement d'avis ? Retournez votre article simplement.",
  },
  {
    icon: ShieldCheck,
    title: "Paiement sécurisé",
    description: "Vos transactions sont protégées de bout en bout.",
  },
  {
    icon: Headset,
    title: "Service client dédié",
    description: "Une équipe à votre écoute du lundi au samedi.",
  },
];

export function ValueProps() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
      {props.map((p) => (
        <div key={p.title} className="flex flex-col items-center text-center gap-3">
          <p.icon size={26} strokeWidth={1.1} className="text-gold" />
          <h3 className="font-sans-wide text-[0.72rem] uppercase text-ink">{p.title}</h3>
          <p className="text-xs text-stone-light leading-relaxed max-w-[180px]">{p.description}</p>
        </div>
      ))}
    </div>
  );
}
