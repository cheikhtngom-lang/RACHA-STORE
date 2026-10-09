import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader, Panel } from "@/components/admin/ui";

// Mode d'emploi de l'administration, onglet par onglet, pour la gérante.
// À tenir à jour quand un onglet change.

export const metadata: Metadata = {
  title: "Guide de l'administration",
};

const CHAPTERS = [
  { id: "quotidien", title: "Au quotidien" },
  { id: "notifications", title: "E-mails et WhatsApp reçus" },
  { id: "tableau-de-bord", title: "Tableau de bord" },
  { id: "statistiques", title: "Statistiques" },
  { id: "commandes", title: "Commandes" },
  { id: "produits", title: "Produits" },
  { id: "categories", title: "Catégories" },
  { id: "codes-promo", title: "Codes promo" },
  { id: "annonces", title: "Annonces" },
  { id: "messages", title: "Messages" },
  { id: "newsletter", title: "Newsletter" },
  { id: "parametres", title: "Paramètres" },
  { id: "problemes", title: "En cas de problème" },
];

export default function AdminGuidePage() {
  return (
    <>
      <PageHeader
        title="Guide"
        description="Comment utiliser chaque onglet de l'administration. Revenez ici dès que vous avez un doute."
      />

      <div className="grid xl:grid-cols-[220px_1fr] gap-6 items-start">
        <nav aria-label="Sommaire du guide" className="dash-card p-5 xl:sticky xl:top-8">
          <p className="font-sans-wide text-[0.62rem] uppercase text-stone-light mb-3">Sommaire</p>
          <ol className="grid sm:grid-cols-2 xl:grid-cols-1 gap-x-6 gap-y-1.5 text-sm">
            {CHAPTERS.map((c, i) => (
              <li key={c.id}>
                <a href={`#${c.id}`} className="text-stone hover:text-gold-light transition-colors">
                  <span className="tabular-nums text-stone-light mr-2">{i + 1}.</span>
                  {c.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-col gap-6 min-w-0">
          <Chapter id="quotidien" title="Au quotidien">
            <p>
              L&apos;administration se trouve à l&apos;adresse www.rachamarket.com/admin. Connectez-vous avec votre compte
              habituel du site : il n&apos;y a pas de mot de passe à part. Depuis la boutique, le bouton « Administration » de
              l&apos;en-tête (ou du menu sur téléphone) vous ramène ici, et « Voir la boutique », en bas du menu, vous
              renvoie sur le site.
            </p>
            <p>
              Les pastilles dorées du menu comptent ce qui reste à traiter : les commandes en attente ou payées à côté de
              « Commandes », les messages non lus à côté de « Messages ».
            </p>
            <Heading>La routine conseillée</Heading>
            <Steps>
              <li>Ouvrez le Tableau de bord : les cartes « À expédier », « À encaisser » et « Messages » montrent ce qui attend.</li>
              <li>Préparez les commandes payées. Passez-les en « Expédiée » quand le colis part, puis en « Livrée » à la remise.</li>
              <li>Répondez aux messages de la page Contact.</li>
              <li>Regardez la liste « Stock faible » et mettez à jour le stock des produits réapprovisionnés.</li>
            </Steps>
          </Chapter>

          <Chapter id="notifications" title="E-mails et WhatsApp reçus">
            <p>
              Vous êtes prévenue de chaque commande, même sans être connectée à l&apos;administration. Les e-mails partent aux
              adresses choisies dans Paramètres, onglet Boutique.
            </p>
            <Points>
              <li>
                <b>« Nouvelle commande »</b> : envoyé dès qu&apos;un client valide son panier, avant le paiement. La commande est
                « En attente de paiement ».
              </li>
              <li>
                <b>« Commande payée »</b> : PayDunya a confirmé le paiement. C&apos;est le signal pour préparer le colis.
              </li>
              <li>
                <b>« Paiement à vérifier »</b> : paiement reçu deux fois, paiement sur une commande annulée, ou montant
                différent du total. Ouvrez la commande et suivez l&apos;avertissement en rouge du panneau « Paiement ».
              </li>
              <li>
                <b>Message WhatsApp d&apos;un client</b> : après son achat, le client peut vous envoyer le récapitulatif de sa
                commande sur WhatsApp, au numéro principal de la boutique (le premier numéro dans Paramètres, onglet
                Boutique). Le message donne le numéro de commande, les articles, le total et la ville de livraison.
              </li>
            </Points>
            <Note>
              Le client peut modifier le message WhatsApp avant de l&apos;envoyer : ne vous fiez pas à la ligne « Paiement :
              reçu ». Ouvrez le lien « Suivi de la commande » à la fin du message. Cette page affiche le vrai statut, sans
              connexion : « Paiement reçu » veut dire que l&apos;argent est arrivé. Vous pouvez aussi chercher le numéro de
              commande dans l&apos;onglet Commandes.
            </Note>
          </Chapter>

          <Chapter id="tableau-de-bord" title="Tableau de bord" href="/admin">
            <p>La première page après la connexion : ce qui attend une action de votre part, puis les ventes.</p>
            <Points>
              <li><b>À encaisser</b> : commandes enregistrées dont le paiement n&apos;est pas encore arrivé.</li>
              <li><b>À expédier</b> : commandes payées, à préparer et à envoyer.</li>
              <li><b>Ventes du mois</b> : total des commandes payées, expédiées ou livrées depuis le 1er du mois.</li>
              <li><b>Messages</b> : messages de la page Contact pas encore lus.</li>
              <li>
                <b>30 derniers jours</b> : chiffre d&apos;affaires encaissé, commandes, visites et panier moyen, comparés aux 30
                jours d&apos;avant.
              </li>
              <li><b>En attente de paiement</b> : les 5 dernières commandes non payées. Cliquez pour ouvrir la commande.</li>
              <li>
                <b>Stock faible</b> : produits en vente avec 3 pièces ou moins. Cliquez sur un produit pour corriger son stock.
              </li>
            </Points>
            <p>
              Les cartes « À encaisser », « À expédier » et « Messages » ouvrent la liste correspondante. Le bouton « Nouveau
              produit » ouvre la fiche d&apos;ajout.
            </p>
          </Chapter>

          <Chapter id="statistiques" title="Statistiques" href="/admin/statistiques">
            <p>
              Choisissez la période en haut de la page : 7 jours, 30 jours, 90 jours ou 12 mois. Chaque chiffre est comparé à
              la période précédente de même durée : en vert quand c&apos;est mieux, en rouge quand c&apos;est moins bien.
            </p>
            <Points>
              <li><b>Chiffre d&apos;affaires encaissé</b> : commandes payées, expédiées ou livrées. Les commandes annulées ne comptent pas.</li>
              <li><b>Panier moyen</b> et <b>taux de conversion</b> : montant moyen d&apos;une commande, et nombre de commandes pour 100 visites.</li>
              <li><b>D&apos;où viennent les visiteurs</b> : WhatsApp, Instagram, TikTok, Google, accès direct… Utile pour savoir quelles publications marchent.</li>
              <li><b>Ventes par catégorie</b>, <b>produits les plus vendus</b> et <b>les plus consultés</b> : un produit très vu mais peu vendu mérite un meilleur prix, de meilleures photos ou plus de stock.</li>
              <li><b>Commandes par jour de la semaine</b> et <b>villes de livraison</b> : pour choisir quand publier et organiser les livraisons.</li>
            </Points>
            <p>Les visites sont comptées depuis le 28 septembre 2026, sans cookie : les chiffres plus anciens sont à zéro.</p>
          </Chapter>

          <Chapter id="commandes" title="Commandes" href="/admin/commandes">
            <p>
              Toutes les commandes du site, de la plus récente à la plus ancienne. Les onglets filtrent par statut, la barre de
              recherche trouve une commande par numéro (RS-…), nom, téléphone ou e-mail. « Afficher plus » charge la suite.
            </p>
            <Heading>Les statuts</Heading>
            <Points>
              <li><b>En attente de paiement</b> : la commande est enregistrée et les articles sont réservés dans le stock, mais l&apos;argent n&apos;est pas encore arrivé.</li>
              <li><b>Payée</b> : PayDunya a confirmé le paiement. Le statut change tout seul, vous n&apos;avez rien à faire.</li>
              <li><b>Expédiée</b> : à choisir quand le colis part chez le livreur.</li>
              <li><b>Livrée</b> : à choisir quand le client a reçu son colis.</li>
              <li><b>Annulée</b> : les articles reviennent dans le stock et le code promo éventuel peut resservir. C&apos;est définitif.</li>
            </Points>
            <Heading>Traiter une commande</Heading>
            <Steps>
              <li>Ouvrez la commande depuis la liste. Le panneau « Articles » donne chaque pièce avec sa couleur, sa taille et sa référence (SKU).</li>
              <li>Vérifiez l&apos;adresse et le mode de livraison (standard ou express, à traiter en priorité) dans le panneau « Livraison ».</li>
              <li>Contactez le client si besoin avec les boutons « Écrire sur WhatsApp » (message déjà rédigé), « Appeler » ou « Envoyer un e-mail ».</li>
              <li>Dans le panneau « Statut », cliquez sur « Expédiée » quand le colis part, puis sur « Livrée » à la remise.</li>
              <li>Notez ce qui doit être retenu dans « Note interne » (livreur, date de remise…), puis « Enregistrer la note ». Le client ne la voit jamais.</li>
            </Steps>
            <Heading>Le panneau Paiement</Heading>
            <p>
              Il liste les paiements PayDunya de la commande, avec un lien « Voir le reçu ». La mention « test, aucun argent
              reçu » signale un paiement d&apos;essai. Un message en rouge apparaît si un paiement est en double, arrive sur une
              commande annulée ou ne correspond pas au total.
            </p>
            <Note>
              Annuler une commande ne rembourse pas le client : faites le remboursement depuis votre compte PayDunya. Ne passez
              une commande en « Payée » à la main que si l&apos;argent est bien arrivé sur votre compte PayDunya.
            </Note>
          </Chapter>

          <Chapter id="produits" title="Produits" href="/admin/produits">
            <p>
              La liste de tous les produits, avec recherche par nom ou par SKU et filtre par catégorie. Un produit marqué «
              Retiré de la vente » est masqué sur le site mais conservé.
            </p>
            <Heading>Ajouter ou modifier un produit</Heading>
            <p>Cliquez sur « Ajouter un produit », ou sur un produit de la liste pour le modifier. La fiche est découpée en panneaux :</p>
            <Points>
              <li><b>Informations</b> : le nom, l&apos;accroche (une phrase affichée sous le prix et dans Google) et la description.</li>
              <li>
                <b>Photos</b> : « Ajouter des photos » accepte plusieurs photos d&apos;un coup, directement depuis le téléphone ;
                elles sont réduites automatiquement. La première est la photo principale. Les flèches changent l&apos;ordre, la
                croix retire une photo. Le format portrait (plus haut que large) rend le mieux.
              </li>
              <li>
                <b>Couleurs et tailles</b> : pour chaque couleur, une teinte et un nom affiché (ex. Camel). Tailles séparées par
                des virgules : S, M, L ou 38, 39, 40. Sans couleur ni taille, le client n&apos;a rien à choisir.
              </li>
              <li><b>Détails</b> : les points clés (un par ligne), les matières (wax, bazin riche…) et l&apos;entretien.</li>
              <li>
                <b>Prix et stock</b> : le prix en F CFA, en chiffres seuls (25000). Le prix barré, facultatif, est l&apos;ancien
                prix et doit être plus élevé. Le stock baisse à chaque commande et remonte si elle est annulée ; à 0, le produit
                s&apos;affiche « Épuisé » et ne peut plus être commandé. Le SKU se crée tout seul si vous le laissez vide.
              </li>
              <li>
                <b>Rangement</b> : la catégorie, le type (ex. Robes, affiché au-dessus du nom), l&apos;ordre d&apos;affichage
                (du plus petit au plus grand) et l&apos;adresse de la page, créée à partir du nom.
              </li>
              <li>
                <b>Visibilité</b> : « En vente sur le site », les badges « Nouveau » et « Édition limitée », et « Meilleure
                vente » pour le filtre du même nom.
              </li>
            </Points>
            <p>
              Terminez par « Ajouter le produit » ou « Enregistrer », en bas de la page. Le site est mis à jour aussitôt.
            </p>
            <Note>
              Pour arrêter de vendre un produit, décochez « En vente sur le site » plutôt que de le supprimer : vous gardez sa
              fiche et ses photos. « Supprimer le produit » efface la fiche et les photos ; les commandes déjà passées gardent
              leur détail. Évitez de changer l&apos;adresse de la page d&apos;un produit déjà partagé : l&apos;ancien lien ne
              fonctionnerait plus.
            </Note>
          </Chapter>

          <Chapter id="categories" title="Catégories" href="/admin/categories">
            <p>
              Les rubriques de la boutique. Leur ordre est celui du menu et des rubriques de la page d&apos;accueil.
            </p>
            <Steps>
              <li>« Ajouter une catégorie », ou « Modifier » sur une catégorie existante.</li>
              <li>Indiquez le nom, la description (affichée en tête de la page de la catégorie), une photo et l&apos;ordre d&apos;affichage.</li>
              <li>« Enregistrer ».</li>
            </Steps>
            <p>
              L&apos;adresse de la page (/boutique/…) est créée à partir du nom et ne change plus ensuite, même si vous renommez
              la catégorie. « Supprimer » n&apos;apparaît que pour une catégorie vide : déplacez d&apos;abord ses produits vers une
              autre catégorie.
            </p>
          </Chapter>

          <Chapter id="codes-promo" title="Codes promo" href="/admin/codes-promo">
            <p>
              Le client tape le code dans son panier ; la remise, en pourcentage, s&apos;applique aux articles, pas à la
              livraison.
            </p>
            <Steps>
              <li>« Créer un code ».</li>
              <li>Le code : de 3 à 30 lettres, chiffres ou tirets, sans espace (ex. TABASKI15).</li>
              <li>La remise en %, puis si besoin une date de début, une date de fin (incluse) et un nombre d&apos;utilisations maximum (vide : illimité, chaque commande compte pour une).</li>
              <li>Laissez « Code actif » coché et enregistrez.</li>
            </Steps>
            <p>
              Le statut de chaque code s&apos;affiche dans la liste : Actif, Programmé (pas encore commencé), Expiré, Épuisé ou
              Désactivé. « Désactiver » arrête un code tout de suite. Le texte d&apos;un code ne se modifie plus après sa
              création, et seul un code jamais utilisé peut être supprimé : sinon, désactivez-le.
            </p>
          </Chapter>

          <Chapter id="annonces" title="Annonces" href="/admin/annonces">
            <p>
              Les messages du bandeau noir qui défile en haut de la boutique : soldes, nouvelle collection, fermeture
              exceptionnelle… L&apos;« Aperçu du bandeau » montre ce que voient les visiteurs en ce moment.
            </p>
            <Steps>
              <li>« Nouvelle annonce ».</li>
              <li>Le texte : court et précis, 140 caractères au plus (ex. « Soldes : -30 % sur les sacs jusqu&apos;au 15 octobre »).</li>
              <li>Le lien, facultatif : une page du site (ex. /boutique/chaussures) ou une adresse complète en https://.</li>
              <li>Des dates de début et de fin si l&apos;annonce est temporaire : elle s&apos;affiche et disparaît toute seule.</li>
              <li>Laissez « Afficher sur le site » coché et enregistrez.</li>
            </Steps>
            <p>
              Les flèches changent l&apos;ordre de passage, « Masquer » retire une annonce du bandeau sans la supprimer. Sans
              annonce en ligne, le bandeau disparaît de la boutique.
            </p>
          </Chapter>

          <Chapter id="messages" title="Messages" href="/admin/messages">
            <p>
              Les messages envoyés depuis la page Contact du site. Un point doré signale un message non lu ; l&apos;onglet « Non
              lus » n&apos;affiche qu&apos;eux.
            </p>
            <Points>
              <li>Cliquez sur un message pour le lire en entier : il passe en « lu ».</li>
              <li>« Répondre » ouvre votre messagerie avec l&apos;adresse du client et le sujet déjà remplis.</li>
              <li>« Marquer comme non lu » le garde en évidence, « Supprimer » l&apos;efface définitivement.</li>
            </Points>
          </Chapter>

          <Chapter id="newsletter" title="Newsletter" href="/admin/newsletter">
            <p>
              Les adresses e-mail inscrites depuis le pied de page du site. Le site ne fait que les collecter : il
              n&apos;envoie pas lui-même de newsletter.
            </p>
            <Points>
              <li>« Exporter (CSV) » télécharge la liste, à importer dans votre outil d&apos;envoi d&apos;e-mails.</li>
              <li>« Retirer » supprime une adresse, par exemple quand une personne demande à ne plus rien recevoir.</li>
            </Points>
          </Chapter>

          <Chapter id="parametres" title="Paramètres" href="/admin/parametres">
            <Heading>Onglet Mon compte</Heading>
            <Points>
              <li><b>Profil</b> : votre prénom, votre nom et votre téléphone (jamais affiché sur le site).</li>
              <li><b>Adresse e-mail de connexion</b> : un lien de confirmation part à la nouvelle adresse ; le changement se fait quand vous l&apos;ouvrez.</li>
              <li><b>Mot de passe</b> : le mot de passe actuel, puis le nouveau deux fois (8 caractères minimum).</li>
              <li><b>Appareils connectés</b> : « Se déconnecter partout » ferme le compte sur tous les appareils, en cas de téléphone perdu ou d&apos;ordinateur partagé.</li>
            </Points>
            <Heading>Onglet Boutique</Heading>
            <Points>
              <li>
                <b>Coordonnées affichées sur le site</b> : l&apos;e-mail de contact (laissé vide, aucun e-mail n&apos;est affiché),
                les téléphones, l&apos;adresse, les horaires, Instagram et TikTok. Le premier téléphone est le numéro principal :
                c&apos;est lui qui reçoit les commandes envoyées sur WhatsApp par les clients.
              </li>
              <li>
                <b>E-mail « Nouvelle commande »</b> : les adresses qui reçoivent les e-mails de commande et de paiement (5 au
                plus). Elles ne sont pas affichées sur le site.
              </li>
            </Points>
            <Heading>Onglet Page d&apos;accueil</Heading>
            <p>
              Le bloc mis en avant sur l&apos;accueil : une photo (en hauteur de préférence), un petit titre doré, un titre, un
              texte de 400 caractères au plus et un bouton avec la page qu&apos;il ouvre (ex. /boutique/tenues-africaines).
              « Remettre la photo par défaut » revient à la photo d&apos;origine. Pensez à cliquer sur « Enregistrer ».
            </p>
            <Heading>Onglet Connexion et inscription</Heading>
            <p>
              La grande photo affichée à côté du formulaire des pages Connexion et Inscription (sur ordinateur et tablette,
              pas sur téléphone). Pour chaque page, « Choisir une photo », de préférence en hauteur, puis « Enregistrer ».
              « Remettre la photo par défaut » revient à la photo d&apos;origine.
            </p>
          </Chapter>

          <Chapter id="problemes" title="En cas de problème">
            <Points>
              <li>
                <b>Une page affiche une erreur ou reste sur « Chargement… »</b> : vérifiez la connexion internet et actualisez
                la page.
              </li>
              <li>
                <b>Un client dit avoir payé mais la commande est « En attente de paiement »</b> : la confirmation de PayDunya
                peut prendre une minute. Ouvrez la commande et regardez le panneau « Paiement », puis vérifiez dans votre compte
                PayDunya avant de changer le statut à la main.
              </li>
              <li>
                <b>Un client veut annuler</b> : ouvrez sa commande, « Annuler la commande », puis remboursez-le depuis PayDunya
                s&apos;il avait déjà payé.
              </li>
              <li>
                <b>Une modification n&apos;apparaît pas sur le site</b> : vérifiez que vous avez bien cliqué sur « Enregistrer »
                (un message de confirmation s&apos;affiche en bas de l&apos;écran), puis actualisez la page de la boutique.
              </li>
            </Points>
          </Chapter>
        </div>
      </div>
    </>
  );
}

function Chapter({ id, title, href, children }: { id: string; title: string; href?: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24 xl:scroll-mt-8">
      <Panel
        title={title}
        action={
          href && (
            <Link href={href} className="group inline-flex items-center gap-1.5 text-xs text-stone-light hover:text-gold-light transition-colors">
              Ouvrir l&apos;onglet
              <ArrowUpRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          )
        }
      >
        <div className="p-5 sm:p-6 flex flex-col gap-4 text-sm text-stone leading-relaxed max-w-3xl [&_b]:font-medium [&_b]:text-ink">
          {children}
        </div>
      </Panel>
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-sans-wide text-[0.65rem] uppercase text-ink pt-2">{children}</h3>;
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="list-decimal pl-5 flex flex-col gap-2 marker:text-gold-light marker:tabular-nums">{children}</ol>;
}

function Points({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-5 flex flex-col gap-2 marker:text-gold-light">{children}</ul>;
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="border-l-2 border-gold pl-4 text-ink">{children}</p>;
}
