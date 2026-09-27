import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
};

const sections = [
  {
    title: "1. Éditeur du site",
    body: `Le site Racha Store est édité par [Raison sociale à compléter], [forme juridique], au capital de [montant] F CFA, immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) sous le numéro [numéro RCCM à compléter], dont le siège social est situé à Scat Urbain, Dakar, Sénégal. Numéro d'Identification Fiscale : [à compléter].`,
  },
  {
    title: "2. Directeur de la publication",
    body: `Le directeur de la publication du site est [Nom à compléter], en sa qualité de représentant légal de la société éditrice.`,
  },
  {
    title: "3. Hébergement",
    body: `Le site est hébergé par [Nom de l'hébergeur à compléter], [adresse de l'hébergeur à compléter].`,
  },
  {
    title: "4. Propriété intellectuelle",
    body: `L'ensemble des éléments présents sur le site Racha Store (textes, images, logos, vidéos, graphismes) est protégé par le droit d'auteur et le droit des marques. Toute reproduction, représentation ou exploitation, totale ou partielle, sans autorisation préalable, est strictement interdite.`,
  },
  {
    title: "5. Données personnelles",
    body: `Les informations recueillies via le site font l'objet d'un traitement destiné à la gestion des commandes et de la relation client. Conformément à la loi sénégalaise n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données vous concernant, exerçable à l'adresse contact@rachamarket.com. Vous pouvez également saisir la Commission de Protection des Données Personnelles (CDP).`,
  },
  {
    title: "6. Cookies",
    body: `Le site utilise des cookies afin d'améliorer l'expérience utilisateur et réaliser des statistiques de visite. Vous pouvez à tout moment paramétrer votre navigateur pour refuser l'utilisation de cookies.`,
  },
];

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-16 sm:py-24">
      <h1 className="font-display text-4xl sm:text-5xl text-ink mb-4">Mentions légales</h1>
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
