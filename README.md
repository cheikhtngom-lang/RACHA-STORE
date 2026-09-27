# Racha Store

Boutique en ligne, frontend Next.js. Le backend Supabase n'est pas encore branché : toutes les données (produits, catégories) viennent de `src/data/` et sont pensées pour être remplacées par des appels Supabase sans changer les composants.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** : design system de marque défini dans `src/app/globals.css` (`@theme`)
- **Radix UI** : primitives accessibles (dialog, accordion, tabs, select, etc.)
- **Zustand** (+ `persist`) : panier, liste de souhaits, session démo, état d'UI
- **sonner** : notifications toast

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Domaine

Le site ne doit pas être lancé publiquement tant qu'un nom de domaine personnalisé n'est pas branché.
Une fois le domaine connecté, définir la variable d'environnement :

```bash
NEXT_PUBLIC_SITE_URL=https://www.votre-domaine.com
```

Tant qu'elle est absente, toutes les pages sont servies en `noindex` (pas d'indexation par Google).

## Structure

- `src/app/` : pages (App Router), favicon et icônes
- `src/components/` : UI (`ui/`), layout, produit, panier, checkout, compte, home
- `src/data/` : catalogue produits et catégories (mock, à remplacer par Supabase)
- `src/store/` : état client (panier, wishlist, session démo)
- `src/lib/` : utilitaires (formatage prix, types, configuration du site)

## Base de données Supabase

Dans Supabase > SQL Editor, exécuter dans cet ordre :

1. `supabase/migrations/20260927120000_initial_schema.sql` : tables, sécurité (RLS), fonctions, bucket photos
2. `supabase/seed.sql` : catégories et produits d'exemple (à remplacer par le vrai catalogue)

| Table | Rôle |
| --- | --- |
| `categories`, `products` | Catalogue, lisible par tous (produits `is_active` uniquement) |
| `profiles` | Prénom, nom, téléphone du client, créé automatiquement à l'inscription |
| `addresses`, `wishlist_items` | Adresses et favoris, visibles uniquement par leur propriétaire |
| `orders`, `order_items` | Commandes, créées uniquement via la fonction `create_order` |
| `promo_codes` | Codes promo, vérifiés via `check_promo_code`, jamais listables |
| `newsletter_subscribers`, `contact_messages` | Formulaires du pied de page et de la page contact |

`create_order` recalcule prix, remise et frais de port à partir de la base et décrémente le stock dans la même transaction : le navigateur n'envoie que les produits, quantités, couleurs et tailles.

La boutique se gère depuis le tableau de bord Supabase (Table Editor) : produits, stock, statut des commandes, codes promo, messages. Les photos produits se déposent dans Storage > `products`.

Variables d'environnement : voir `.env.example`. Le site n'a besoin d'aucune clé secrète.

Branché : catalogue (`src/lib/catalog.ts`, cache 60 s), comptes clients (`@supabase/ssr`, e-mails dans `supabase/templates/`), commandes via `create_order`, adresses, favoris, newsletter et contact.

Reste à brancher : le paiement en ligne (Wave, Orange Money, carte) et les notifications de nouvelle commande. D'ici là, les commandes sont enregistrées au statut `pending`.
