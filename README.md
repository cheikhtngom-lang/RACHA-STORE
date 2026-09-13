# Racha Store

Boutique en ligne haut de gamme — frontend Next.js. Le backend Supabase n'est pas encore branché : toutes les données (produits, catégories, avis) viennent de `src/data/` et sont pensées pour être remplacées par des appels Supabase sans changer les composants.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** — design system de marque défini dans `src/app/globals.css` (`@theme`)
- **Radix UI** — primitives accessibles (dialog, accordion, tabs, select, etc.)
- **Framer Motion** — micro-interactions et animations au scroll
- **Zustand** (+ `persist`) — panier, liste de souhaits, session démo, état d'UI
- **sonner** — notifications toast

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app/` — pages (App Router)
- `src/components/` — UI (`ui/`), layout, produit, panier, checkout, compte, home
- `src/data/` — catalogue produits/catégories/témoignages (mock, à remplacer par Supabase)
- `src/store/` — état client (panier, wishlist, session démo)
- `src/lib/` — utilitaires (formatage prix, types)

## Points de branchement Supabase (à venir)

Les fonctions `getProductBySlug`, `getProductsByCategory`, etc. dans `src/data/products.ts` sont les points d'entrée à remplacer par des requêtes Supabase. L'authentification démo (`src/store/auth-store.ts`) est prête à être remplacée par `@supabase/ssr`.
