// Mode d'emploi de l'administration, onglet par onglet, pour la gérante.
// Affiché par /admin/guide et téléchargeable en PDF (/admin/guide/pdf) : les
// deux lisent ce fichier. À tenir à jour quand un onglet change.
// Dans les textes, **mot** est en gras.

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "heading"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "points"; items: string[] }
  | { type: "note"; text: string };

export type GuideChapter = { id: string; title: string; href?: string; blocks: GuideBlock[] };

export const GUIDE_INTRO = "Comment utiliser chaque onglet de l'administration. Revenez ici dès que vous avez un doute.";

export const GUIDE_CHAPTERS: GuideChapter[] = [
  {
    id: "quotidien",
    title: "Au quotidien",
    blocks: [
      {
        type: "p",
        text: "L'administration se trouve à l'adresse www.rachamarket.com/admin. Connectez-vous avec votre compte habituel du site : il n'y a pas de mot de passe à part. Depuis la boutique, le bouton « Administration » de l'en-tête (ou du menu sur téléphone) vous ramène ici, et « Voir la boutique », en bas du menu, vous renvoie sur le site.",
      },
      {
        type: "p",
        text: "« Se déconnecter » est toujours en bas du menu de gauche sur ordinateur, et en haut à droite de l'écran sur téléphone.",
      },
      {
        type: "p",
        text: "Les pastilles dorées du menu comptent ce qui reste à traiter : les commandes en attente ou payées à côté de « Commandes », les messages non lus à côté de « Messages ».",
      },
      { type: "heading", text: "La routine conseillée" },
      {
        type: "steps",
        items: [
          "Ouvrez le Tableau de bord : les cartes « À expédier », « À encaisser » et « Messages » montrent ce qui attend.",
          "Préparez les commandes payées. Passez-les en « Expédiée » quand le colis part, puis en « Livrée » à la remise.",
          "Répondez aux messages de la page Contact.",
          "Regardez la liste « Stock faible » et mettez à jour le stock des produits réapprovisionnés.",
        ],
      },
    ],
  },
  {
    id: "notifications",
    title: "E-mails et WhatsApp reçus",
    blocks: [
      {
        type: "p",
        text: "Vous êtes prévenue de chaque commande, même sans être connectée à l'administration. Les e-mails partent aux adresses choisies dans Paramètres, onglet Boutique.",
      },
      {
        type: "points",
        items: [
          "**« Nouvelle commande »** : envoyé dès qu'un client valide son panier, avant le paiement. La commande est « En attente de paiement ».",
          "**« Commande payée »** : PayDunya a confirmé le paiement. C'est le signal pour préparer le colis.",
          "**« Paiement à vérifier »** : paiement reçu deux fois, paiement sur une commande annulée, ou montant différent du total. Ouvrez la commande et suivez l'avertissement en rouge du panneau « Paiement ».",
          "**Message WhatsApp d'un client** : après son achat, le client peut vous envoyer le récapitulatif de sa commande sur WhatsApp, au numéro principal de la boutique (le premier numéro dans Paramètres, onglet Boutique). Le message donne le numéro de commande, les articles, le total et la ville de livraison.",
        ],
      },
      {
        type: "note",
        text: "Le client peut modifier le message WhatsApp avant de l'envoyer : ne vous fiez pas à la ligne « Paiement : reçu ». Ouvrez le lien « Suivi de la commande » à la fin du message. Cette page affiche le vrai statut, sans connexion : « Paiement reçu » veut dire que l'argent est arrivé. Vous pouvez aussi chercher le numéro de commande dans l'onglet Commandes.",
      },
    ],
  },
  {
    id: "tableau-de-bord",
    title: "Tableau de bord",
    href: "/admin",
    blocks: [
      { type: "p", text: "La première page après la connexion : ce qui attend une action de votre part, puis les ventes." },
      {
        type: "points",
        items: [
          "**À encaisser** : commandes enregistrées dont le paiement n'est pas encore arrivé.",
          "**À expédier** : commandes payées, à préparer et à envoyer.",
          "**Ventes du mois** : total des commandes payées, expédiées ou livrées depuis le 1er du mois.",
          "**Messages** : messages de la page Contact pas encore lus.",
          "**30 derniers jours** : chiffre d'affaires encaissé, commandes, visites et panier moyen, comparés aux 30 jours d'avant.",
          "**En attente de paiement** : les 5 dernières commandes non payées. Cliquez pour ouvrir la commande.",
          "**Stock faible** : produits en vente avec 3 pièces ou moins. Cliquez sur un produit pour corriger son stock.",
        ],
      },
      {
        type: "p",
        text: "Les cartes « À encaisser », « À expédier » et « Messages » ouvrent la liste correspondante. Le bouton « Nouveau produit » ouvre la fiche d'ajout.",
      },
    ],
  },
  {
    id: "statistiques",
    title: "Statistiques",
    href: "/admin/statistiques",
    blocks: [
      {
        type: "p",
        text: "Choisissez la période en haut de la page : 7 jours, 30 jours, 90 jours ou 12 mois. Chaque chiffre est comparé à la période précédente de même durée : en vert quand c'est mieux, en rouge quand c'est moins bien.",
      },
      {
        type: "points",
        items: [
          "**Chiffre d'affaires encaissé** : commandes payées, expédiées ou livrées. Les commandes annulées ne comptent pas.",
          "**Panier moyen** et **taux de conversion** : montant moyen d'une commande, et nombre de commandes pour 100 visites.",
          "**D'où viennent les visiteurs** : WhatsApp, Instagram, TikTok, Google, accès direct… Utile pour savoir quelles publications marchent.",
          "**Ventes par catégorie**, **produits les plus vendus** et **les plus consultés** : un produit très vu mais peu vendu mérite un meilleur prix, de meilleures photos ou plus de stock.",
          "**Commandes par jour de la semaine** et **villes de livraison** : pour choisir quand publier et organiser les livraisons.",
        ],
      },
      { type: "p", text: "Les visites sont comptées depuis le 28 septembre 2026, sans cookie : les chiffres plus anciens sont à zéro." },
    ],
  },
  {
    id: "commandes",
    title: "Commandes",
    href: "/admin/commandes",
    blocks: [
      {
        type: "p",
        text: "Toutes les commandes du site, de la plus récente à la plus ancienne. Les onglets filtrent par statut, la barre de recherche trouve une commande par numéro (RS-…), nom, téléphone ou e-mail. « Afficher plus » charge la suite.",
      },
      { type: "heading", text: "Les statuts" },
      {
        type: "points",
        items: [
          "**En attente de paiement** : la commande est enregistrée et les articles sont réservés dans le stock, mais l'argent n'est pas encore arrivé.",
          "**Payée** : PayDunya a confirmé le paiement. Le statut change tout seul, vous n'avez rien à faire.",
          "**Expédiée** : à choisir quand le colis part chez le livreur.",
          "**Livrée** : à choisir quand le client a reçu son colis.",
          "**Annulée** : les articles reviennent dans le stock et le code promo éventuel peut resservir. C'est définitif.",
        ],
      },
      { type: "heading", text: "Traiter une commande" },
      {
        type: "steps",
        items: [
          "Ouvrez la commande depuis la liste. Le panneau « Articles » donne chaque pièce avec sa couleur, sa taille et sa référence (SKU).",
          "Vérifiez l'adresse et le mode de livraison (standard ou express, à traiter en priorité) dans le panneau « Livraison ».",
          "Contactez le client si besoin avec les boutons « Écrire sur WhatsApp » (message déjà rédigé), « Appeler » ou « Envoyer un e-mail ».",
          "Dans le panneau « Statut », cliquez sur « Expédiée » quand le colis part, puis sur « Livrée » à la remise.",
          "Notez ce qui doit être retenu dans « Note interne » (livreur, date de remise…), puis « Enregistrer la note ». Le client ne la voit jamais.",
        ],
      },
      { type: "heading", text: "Le panneau Paiement" },
      {
        type: "p",
        text: "Il liste les paiements PayDunya de la commande, avec un lien « Voir le reçu ». La mention « test, aucun argent reçu » signale un paiement d'essai. Un message en rouge apparaît si un paiement est en double, arrive sur une commande annulée ou ne correspond pas au total.",
      },
      {
        type: "note",
        text: "Annuler une commande ne rembourse pas le client : faites le remboursement depuis votre compte PayDunya. Ne passez une commande en « Payée » à la main que si l'argent est bien arrivé sur votre compte PayDunya.",
      },
    ],
  },
  {
    id: "produits",
    title: "Produits",
    href: "/admin/produits",
    blocks: [
      {
        type: "p",
        text: "La liste de tous les produits, avec recherche par nom ou par SKU et filtre par catégorie. Un produit marqué « Retiré de la vente » est masqué sur le site mais conservé.",
      },
      { type: "heading", text: "Ajouter ou modifier un produit" },
      { type: "p", text: "Cliquez sur « Ajouter un produit », ou sur un produit de la liste pour le modifier. La fiche est découpée en panneaux :" },
      {
        type: "points",
        items: [
          "**Informations** : le nom, l'accroche (une phrase affichée sous le prix et dans Google) et la description.",
          "**Photos** : « Ajouter des photos » accepte plusieurs photos d'un coup, directement depuis le téléphone ; elles sont réduites automatiquement. La première est la photo principale. Les flèches changent l'ordre, la croix retire une photo. Le format portrait (plus haut que large) rend le mieux.",
          "**Couleurs et tailles** : pour chaque couleur, une teinte et un nom affiché (ex. Camel). Tailles séparées par des virgules : S, M, L ou 38, 39, 40. Sans couleur ni taille, le client n'a rien à choisir.",
          "**Détails** : les points clés (un par ligne), les matières (wax, bazin riche…) et l'entretien.",
          "**Prix et stock** : le prix en F CFA, en chiffres seuls (25000). Le prix barré, facultatif, est l'ancien prix et doit être plus élevé. Le stock baisse à chaque commande et remonte si elle est annulée ; à 0, le produit s'affiche « Épuisé » et ne peut plus être commandé. Le SKU se crée tout seul si vous le laissez vide.",
          "**Rangement** : la catégorie, le type (ex. Robes, affiché au-dessus du nom), l'ordre d'affichage (du plus petit au plus grand) et l'adresse de la page, créée à partir du nom.",
          "**Visibilité** : « En vente sur le site », les badges « Nouveau » et « Édition limitée », et « Meilleure vente » pour le filtre du même nom.",
        ],
      },
      { type: "p", text: "Terminez par « Ajouter le produit » ou « Enregistrer », en bas de la page. Le site est mis à jour aussitôt." },
      {
        type: "note",
        text: "Pour arrêter de vendre un produit, décochez « En vente sur le site » plutôt que de le supprimer : vous gardez sa fiche et ses photos. « Supprimer le produit » efface la fiche et les photos ; les commandes déjà passées gardent leur détail. Évitez de changer l'adresse de la page d'un produit déjà partagé : l'ancien lien ne fonctionnerait plus.",
      },
    ],
  },
  {
    id: "categories",
    title: "Catégories",
    href: "/admin/categories",
    blocks: [
      { type: "p", text: "Les rubriques de la boutique. Leur ordre est celui du menu et des rubriques de la page d'accueil." },
      {
        type: "steps",
        items: [
          "« Ajouter une catégorie », ou « Modifier » sur une catégorie existante.",
          "Indiquez le nom, la description (affichée en tête de la page de la catégorie), une photo et l'ordre d'affichage.",
          "« Enregistrer ».",
        ],
      },
      {
        type: "p",
        text: "L'adresse de la page (/boutique/…) est créée à partir du nom et ne change plus ensuite, même si vous renommez la catégorie. « Supprimer » n'apparaît que pour une catégorie vide : déplacez d'abord ses produits vers une autre catégorie.",
      },
    ],
  },
  {
    id: "codes-promo",
    title: "Codes promo",
    href: "/admin/codes-promo",
    blocks: [
      {
        type: "p",
        text: "Le client tape le code dans son panier ; la remise, en pourcentage, s'applique aux articles, pas à la livraison.",
      },
      {
        type: "steps",
        items: [
          "« Créer un code ».",
          "Le code : de 3 à 30 lettres, chiffres ou tirets, sans espace (ex. TABASKI15).",
          "La remise en %, puis si besoin une date de début, une date de fin (incluse) et un nombre d'utilisations maximum (vide : illimité, chaque commande compte pour une).",
          "Laissez « Code actif » coché et enregistrez.",
        ],
      },
      {
        type: "p",
        text: "Le statut de chaque code s'affiche dans la liste : Actif, Programmé (pas encore commencé), Expiré, Épuisé ou Désactivé. « Désactiver » arrête un code tout de suite. Le texte d'un code ne se modifie plus après sa création, et seul un code jamais utilisé peut être supprimé : sinon, désactivez-le.",
      },
    ],
  },
  {
    id: "annonces",
    title: "Annonces",
    href: "/admin/annonces",
    blocks: [
      {
        type: "p",
        text: "Les messages du bandeau noir qui défile en haut de la boutique : soldes, nouvelle collection, fermeture exceptionnelle… L'« Aperçu du bandeau » montre ce que voient les visiteurs en ce moment.",
      },
      {
        type: "steps",
        items: [
          "« Nouvelle annonce ».",
          "Le texte : court et précis, 140 caractères au plus (ex. « Soldes : -30 % sur les sacs jusqu'au 15 octobre »).",
          "Le lien, facultatif : une page du site (ex. /boutique/chaussures) ou une adresse complète en https://.",
          "Des dates de début et de fin si l'annonce est temporaire : elle s'affiche et disparaît toute seule.",
          "Laissez « Afficher sur le site » coché et enregistrez.",
        ],
      },
      {
        type: "p",
        text: "Les flèches changent l'ordre de passage, « Masquer » retire une annonce du bandeau sans la supprimer. Sans annonce en ligne, le bandeau disparaît de la boutique.",
      },
    ],
  },
  {
    id: "messages",
    title: "Messages",
    href: "/admin/messages",
    blocks: [
      {
        type: "p",
        text: "Les messages envoyés depuis la page Contact du site. Un point doré signale un message non lu ; l'onglet « Non lus » n'affiche qu'eux.",
      },
      {
        type: "points",
        items: [
          "Cliquez sur un message pour le lire en entier : il passe en « lu ».",
          "« Répondre » ouvre votre messagerie avec l'adresse du client et le sujet déjà remplis.",
          "« Marquer comme non lu » le garde en évidence, « Supprimer » l'efface définitivement.",
        ],
      },
    ],
  },
  {
    id: "newsletter",
    title: "Newsletter",
    href: "/admin/newsletter",
    blocks: [
      {
        type: "p",
        text: "Les adresses e-mail inscrites depuis le pied de page du site. Le site ne fait que les collecter : il n'envoie pas lui-même de newsletter.",
      },
      {
        type: "points",
        items: [
          "« Exporter (CSV) » télécharge la liste, à importer dans votre outil d'envoi d'e-mails.",
          "« Retirer » supprime une adresse, par exemple quand une personne demande à ne plus rien recevoir.",
        ],
      },
    ],
  },
  {
    id: "parametres",
    title: "Paramètres",
    href: "/admin/parametres",
    blocks: [
      { type: "heading", text: "Onglet Mon compte" },
      {
        type: "points",
        items: [
          "**Profil** : votre prénom, votre nom et votre téléphone (jamais affiché sur le site).",
          "**Adresse e-mail de connexion** : un lien de confirmation part à la nouvelle adresse ; le changement se fait quand vous l'ouvrez.",
          "**Mot de passe** : le mot de passe actuel, puis le nouveau deux fois (8 caractères minimum).",
          "**Appareils connectés** : « Se déconnecter partout » ferme le compte sur tous les appareils, en cas de téléphone perdu ou d'ordinateur partagé.",
        ],
      },
      { type: "heading", text: "Onglet Boutique" },
      {
        type: "points",
        items: [
          "**Coordonnées affichées sur le site** : l'e-mail de contact (laissé vide, aucun e-mail n'est affiché), les téléphones, l'adresse, les horaires, Instagram et TikTok. Le premier téléphone est le numéro principal : c'est lui qui reçoit les commandes envoyées sur WhatsApp par les clients.",
          "**E-mail « Nouvelle commande »** : les adresses qui reçoivent les e-mails de commande et de paiement (5 au plus). Elles ne sont pas affichées sur le site.",
        ],
      },
      { type: "heading", text: "Onglet Page d'accueil" },
      {
        type: "p",
        text: "Le bloc mis en avant sur l'accueil : une photo (en hauteur de préférence), un petit titre doré, un titre, un texte de 400 caractères au plus et un bouton avec la page qu'il ouvre (ex. /boutique/tenues-africaines). « Remettre la photo par défaut » revient à la photo d'origine. Pensez à cliquer sur « Enregistrer ».",
      },
      { type: "heading", text: "Onglet Connexion et inscription" },
      {
        type: "p",
        text: "La grande photo affichée à côté du formulaire des pages Connexion et Inscription (sur ordinateur et tablette, pas sur téléphone). Pour chaque page, « Choisir une photo », de préférence en hauteur, puis « Enregistrer ». « Remettre la photo par défaut » revient à la photo d'origine.",
      },
    ],
  },
  {
    id: "problemes",
    title: "En cas de problème",
    blocks: [
      {
        type: "points",
        items: [
          "**Une page affiche une erreur ou reste sur « Chargement… »** : vérifiez la connexion internet et actualisez la page.",
          "**Un client dit avoir payé mais la commande est « En attente de paiement »** : la confirmation de PayDunya peut prendre une minute. Ouvrez la commande et regardez le panneau « Paiement », puis vérifiez dans votre compte PayDunya avant de changer le statut à la main.",
          "**Un client veut annuler** : ouvrez sa commande, « Annuler la commande », puis remboursez-le depuis PayDunya s'il avait déjà payé.",
          "**Une modification n'apparaît pas sur le site** : vérifiez que vous avez bien cliqué sur « Enregistrer » (un message de confirmation s'affiche en bas de l'écran), puis actualisez la page de la boutique.",
        ],
      },
    ],
  },
];

// « **Payée** : … » → [{ text: "Payée", bold: true }, { text: " : …", bold: false }].
export function richText(text: string) {
  return text
    .split(/\*\*(.+?)\*\*/)
    .map((part, i) => ({ text: part, bold: i % 2 === 1 }))
    .filter((segment) => segment.text);
}
