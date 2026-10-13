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
        text: "L'administration se trouve à l'adresse www.rachamarket.com/admin, ou par le lien « Espace gérante » tout en bas du site. Connectez-vous avec votre adresse e-mail et votre mot de passe : les clients, eux, n'ont pas de compte. Une fois connectée, le bouton « Administration » de l'en-tête (ou du menu sur téléphone) vous ramène ici, et « Voir la boutique », en bas du menu, vous renvoie sur le site.",
      },
      {
        type: "p",
        text: "« Se déconnecter » est toujours en bas du menu de gauche sur ordinateur, et en haut à droite de l'écran sur téléphone.",
      },
      {
        type: "p",
        text: "Les pastilles dorées du menu comptent ce qui reste à traiter : les commandes à valider ou validées à côté de « Commandes », les messages non lus à côté de « Messages ».",
      },
      { type: "heading", text: "La routine conseillée" },
      {
        type: "steps",
        items: [
          "Ouvrez le Tableau de bord : les cartes « À valider », « À expédier » et « Messages » montrent ce qui attend.",
          "Validez les nouvelles commandes : pour Wave ou Orange Money, vérifiez sur votre téléphone que l'argent est arrivé ; pour un paiement à la livraison, appelez le client. Cliquez ensuite sur « Validée ».",
          "Préparez les commandes validées. Passez-les en « Expédiée » quand le colis part, puis en « Livrée » à la remise.",
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
          "**« Nouvelle commande »** : envoyé dès qu'un client valide sa commande. Elle est « À valider ». L'e-mail donne le moyen de paiement choisi (Wave, Orange Money ou à la livraison) et le numéro de transaction si le client l'a indiqué.",
          "**Message WhatsApp d'un client** : juste après sa commande, WhatsApp s'ouvre chez le client avec le récapitulatif déjà rédigé ; il vous l'envoie au numéro principal de la boutique (le premier numéro dans Paramètres, onglet Boutique). Le message donne le numéro de commande, les articles, le total, le moyen de paiement et la ville de livraison. Le client peut y joindre la capture de son paiement.",
          "**« Commande payée »** et **« Paiement à vérifier »** : ces e-mails ne concernent plus que d'anciennes commandes payées en ligne avec PayDunya.",
        ],
      },
      {
        type: "note",
        text: "Le client peut modifier le message WhatsApp avant de l'envoyer : vérifiez toujours la commande dans l'onglet Commandes (cherchez son numéro RS-…). Pour Wave et Orange Money, ne validez qu'après avoir vu l'argent arriver sur votre téléphone.",
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
          "**À valider** : commandes reçues, à vérifier (paiement Wave ou Orange Money à contrôler, ou client à appeler pour un paiement à la livraison).",
          "**À expédier** : commandes validées, à préparer et à envoyer.",
          "**Ventes du mois** : total des commandes validées, expédiées ou livrées depuis le 1er du mois.",
          "**Messages** : messages de la page Contact pas encore lus.",
          "**30 derniers jours** : chiffre d'affaires validé, commandes, visites et panier moyen, comparés aux 30 jours d'avant.",
          "**À valider** (liste) : les 5 dernières commandes pas encore validées. Cliquez pour ouvrir la commande.",
          "**Stock faible** : produits en vente avec 3 pièces ou moins. Cliquez sur un produit pour corriger son stock.",
        ],
      },
      {
        type: "p",
        text: "Les cartes « À valider », « À expédier » et « Messages » ouvrent la liste correspondante. Le bouton « Nouveau produit » ouvre la fiche d'ajout.",
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
          "**Chiffre d'affaires validé** : commandes validées, expédiées ou livrées. Les commandes à valider et les commandes annulées ne comptent pas.",
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
          "**À valider** : la commande est enregistrée et les articles sont réservés dans le stock. Le paiement Wave ou Orange Money est à vérifier, ou le client est à appeler pour un paiement à la livraison.",
          "**Validée** : à choisir quand l'argent Wave ou Orange Money est arrivé sur votre téléphone, ou quand le client a confirmé une commande payée à la livraison.",
          "**Expédiée** : à choisir quand le colis part chez le livreur.",
          "**Livrée** : à choisir quand le client a reçu son colis (et payé le livreur pour un paiement à la livraison).",
          "**Annulée** : les articles reviennent dans le stock et le code promo éventuel peut resservir. C'est définitif.",
        ],
      },
      { type: "heading", text: "Traiter une commande" },
      {
        type: "steps",
        items: [
          "Ouvrez la commande depuis la liste. Le panneau « Articles » donne chaque pièce avec sa couleur, sa taille et sa référence (SKU).",
          "Regardez le panneau « Paiement » : le moyen choisi et, pour Wave ou Orange Money, le numéro de transaction indiqué par le client. Vérifiez sur votre téléphone que le montant est arrivé ; pour un paiement à la livraison, appelez le client.",
          "Sous le nom du client, une étiquette indique « Nouveau client » ou ses commandes passées avec le même numéro (livrées, en cours, annulées). Un nouveau client mérite un appel avant d'envoyer le livreur.",
          "Vérifiez l'adresse et le mode de livraison (standard ou express, à traiter en priorité) dans le panneau « Livraison ».",
          "Dans le panneau « Statut », cliquez sur « Validée », puis sur « Expédiée » quand le colis part, et sur « Livrée » à la remise.",
          "« Écrire sur WhatsApp » ouvre un message adapté à l'étape de la commande, avec le lien de suivi du client. « Appeler » et « Envoyer un e-mail » (si le client a donné son e-mail) sont juste en dessous.",
          "Notez ce qui doit être retenu dans « Note interne » (livreur, date de remise…), puis « Enregistrer la note ». Le client ne la voit jamais.",
        ],
      },
      { type: "heading", text: "Le panneau Paiement" },
      {
        type: "p",
        text: "Il indique le moyen choisi par le client : Wave, Orange Money ou à la livraison, avec le numéro de transaction s'il l'a indiqué. Les anciennes commandes payées en ligne affichent aussi leurs paiements PayDunya, avec un lien « Voir le reçu ».",
      },
      {
        type: "note",
        text: "Ne validez jamais une commande Wave ou Orange Money avant d'avoir vu l'argent arriver. Une commande à valider garde ses articles réservés : si le client ne répond pas sous 48 h, annulez-la pour remettre les articles en vente. Annuler ne rembourse pas : si le client avait déjà payé, renvoyez-lui l'argent depuis votre téléphone.",
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
          "**Numéro Wave et Orange Money** : le numéro auquel les clients envoient leur paiement, affiché au moment de la commande et sur la page de suivi. Laissé vide, c'est le numéro principal.",
          "**E-mail « Nouvelle commande »** : les adresses qui reçoivent les e-mails de commande (5 au plus). Elles ne sont pas affichées sur le site.",
        ],
      },
      { type: "heading", text: "Onglet Page d'accueil" },
      {
        type: "p",
        text: "Le bloc mis en avant sur l'accueil : une photo (en hauteur de préférence), un petit titre doré, un titre, un texte de 400 caractères au plus et un bouton avec la page qu'il ouvre (ex. /boutique/tenues-africaines). « Remettre la photo par défaut » revient à la photo d'origine. Pensez à cliquer sur « Enregistrer ».",
      },
      { type: "heading", text: "Onglet Page de connexion" },
      {
        type: "p",
        text: "La grande photo affichée à côté du formulaire de connexion de l'Espace gérante (sur ordinateur et tablette, pas sur téléphone). « Choisir une photo », de préférence en hauteur, puis « Enregistrer ». « Remettre la photo par défaut » revient à la photo d'origine.",
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
          "**Un client dit avoir payé mais vous ne voyez rien** : demandez-lui la capture du paiement sur WhatsApp et vérifiez l'historique Wave ou Orange Money de votre téléphone avant de valider.",
          "**Un client veut annuler** : ouvrez sa commande, « Annuler la commande ». S'il avait déjà payé par Wave ou Orange Money, renvoyez-lui l'argent depuis votre téléphone.",
          "**Une commande semble fausse** (numéro qui ne répond pas, client injoignable) : annulez-la, les articles reviennent en stock. Le site limite déjà un même numéro à 3 commandes par jour.",
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
