-- Racha Store : « Prêt-à-porter » devient « Vide dressing » et
-- « Sacs & Maroquinerie » devient « Sacs ».
-- À exécuter une seule fois dans Supabase > SQL Editor, après 20261013120000_commande_sans_compte.sql.
-- Peut être relancé sans effet : les anciens slugs n'existent plus.
--
-- Les adresses changent aussi : /boutique/pret-a-porter et
-- /boutique/sacs-maroquinerie redirigent vers les nouvelles (next.config.ts).
-- Les produits restent rattachés à leur catégorie (lien par id, pas par slug).

update public.categories
set slug = 'vide-dressing',
    name = 'Vide dressing',
    description = 'Friperie et fins de série : robes, chemises, vestes et pantalons.'
where slug = 'pret-a-porter';

update public.categories
set slug = 'sacs',
    name = 'Sacs',
    description = 'Cabas, sacs bandoulière et sacs de voyage.'
where slug = 'sacs-maroquinerie';
