import type { Metadata } from "next";
import { Truck, Globe, RotateCcw, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Livraison & retours",
  description: "Toutes les informations sur nos délais de livraison, frais de port et politique de retour.",
};

const shippingOptions = [
  { icon: Truck, title: "Livraison standard", delay: "2 à 4 jours ouvrés", price: "Offerte dès 100 000 F CFA, sinon 5 000 F CFA" },
  { icon: Package, title: "Livraison express", delay: "1 à 2 jours ouvrés", price: "10 000 F CFA" },
  { icon: Globe, title: "Livraison internationale", delay: "5 à 8 jours ouvrés", price: "À partir de 12 000 F CFA" },
];

const returnSteps = [
  { step: "1", title: "Demandez votre retour", description: "Depuis « Mon compte » > « Commandes », sélectionnez l'article à retourner." },
  { step: "2", title: "Imprimez l'étiquette", description: "Une étiquette de retour prépayée vous est envoyée par e-mail." },
  { step: "3", title: "Expédiez le colis", description: "Déposez votre colis dans le point relais indiqué, sous 30 jours." },
  { step: "4", title: "Recevez votre remboursement", description: "Sous 5 à 10 jours ouvrés après réception et contrôle de l'article." },
];

export default function ShippingReturnsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="text-center mb-16">
        <p className="eyebrow text-gold mb-4">Service client</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink">Livraison & retours</h1>
      </div>

      <section className="mb-20">
        <h2 className="font-display text-2xl text-ink mb-8">Nos options de livraison</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {shippingOptions.map((o) => (
            <div key={o.title} className="border border-line p-6">
              <o.icon size={20} strokeWidth={1.5} className="text-gold mb-4" />
              <h3 className="text-sm text-ink mb-2">{o.title}</h3>
              <p className="text-xs text-stone-light mb-1">{o.delay}</p>
              <p className="text-xs text-stone-light">{o.price}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <RotateCcw size={20} strokeWidth={1.5} className="text-gold" />
          <h2 className="font-display text-2xl text-ink">Comment retourner un article</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-8">
          {returnSteps.map((s) => (
            <div key={s.step} className="flex gap-4">
              <span className="font-display text-3xl text-gold shrink-0">{s.step}</span>
              <div>
                <h3 className="text-sm text-ink mb-1.5">{s.title}</h3>
                <p className="text-sm text-stone-light leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-sand p-8 sm:p-10">
        <h2 className="font-display text-xl text-ink mb-4">Bon à savoir</h2>
        <ul className="text-sm text-stone leading-relaxed space-y-2 list-disc list-inside">
          <li>Les articles doivent être retournés non portés, non lavés, avec toutes leurs étiquettes d&apos;origine.</li>
          <li>Les articles soldés ou en édition limitée peuvent faire l&apos;objet d&apos;une politique de retour spécifique, précisée sur la fiche produit.</li>
          <li>Les frais de retour sont pris en charge par nos soins pour tout retour effectué en France métropolitaine.</li>
          <li>Pour toute question, notre service client reste disponible du lundi au samedi de 10h à 19h.</li>
        </ul>
      </section>
    </div>
  );
}
