import type { Metadata } from "next";
import { getShopInfo } from "@/lib/get-shop-info";

export const metadata: Metadata = {
  title: "Livraison & retours",
  description: "Livraison 7j/7 au Sénégal et partout dans le monde, frais de port et article défectueux.",
};

const shippingOptions: { title: string; delay: string; price?: string }[] = [
  { title: "Livraison standard", delay: "Au Sénégal, 7j/7", price: "Offerte dès 100 000 F CFA, sinon 5 000 F CFA" },
  { title: "Livraison express", delay: "En priorité, 7j/7", price: "10 000 F CFA" },
  { title: "Livraison internationale", delay: "Partout dans le monde, 7j/7" },
];

const returnSteps = [
  { step: "1", title: "Contactez-nous dès réception", description: "Par téléphone ou WhatsApp, ou depuis « Mon compte » > « Commandes », avec une photo de l'article." },
  { step: "2", title: "Vérification", description: "Nous examinons l'article et vous confirmons l'échange ou le remboursement." },
  { step: "3", title: "Remettez-nous l'article", description: "Non lavé, avec ses étiquettes d'origine. Nous vous indiquons où le déposer." },
  { step: "4", title: "Échange ou remboursement", description: "Un remboursement éventuel est effectué sous 5 à 10 jours ouvrés après vérification." },
];

export default async function ShippingReturnsPage() {
  const shop = await getShopInfo();
  const hours = shop.openingHours ? ` (${shop.openingHours.charAt(0).toLowerCase()}${shop.openingHours.slice(1)})` : "";
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
              <h3 className="text-sm text-ink mb-2">{o.title}</h3>
              <p className="text-xs text-stone-light mb-1">{o.delay}</p>
              {o.price && <p className="text-xs text-stone-light">{o.price}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="font-display text-2xl text-ink mb-3">Article défectueux ou non conforme</h2>
        <p className="text-sm text-stone-light leading-relaxed mb-8 max-w-2xl">
          Les articles ne sont pas repris pour un changement d&apos;avis. Un article défectueux ou qui ne correspond pas à
          votre commande est échangé ou remboursé après vérification.
        </p>
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
          <li>Nous livrons 7j/7, au Sénégal et partout dans le monde.</li>
          <li>Signalez un article défectueux dès réception : il doit nous être remis non lavé, avec ses étiquettes d&apos;origine.</li>
          <li>Pour un article défectueux, les frais de retour sont à notre charge au Sénégal.</li>
          <li>Pour toute question, notre service client reste disponible{hours}.</li>
        </ul>
      </section>
    </div>
  );
}
