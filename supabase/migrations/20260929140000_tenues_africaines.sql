-- Racha Store : catégorie « Tenues africaines » et bandeau d'annonces à jour
-- À exécuter une seule fois dans Supabase > SQL Editor, après 20260928200000_announcements.sql.
-- Peut être relancé sans créer de doublon.

-- 1. Nouvelle catégorie, placée après les autres. La photo s'ajoute dans
--    l'administration (Catégories > Modifier).
insert into public.categories (slug, name, description, position)
select
  'tenues-africaines',
  'Tenues africaines',
  'Boubous, ensembles et robes en wax, bazin riche et tissus africains.',
  coalesce(max(position), -1) + 1
from public.categories
on conflict (slug) do nothing;

-- 2. Bandeau : les retours sous 30 jours ne sont plus proposés (seul un
--    article défectueux est échangé ou remboursé) ; la livraison se fait 7j/7,
--    au Sénégal et partout dans le monde.
delete from public.announcements where message = 'Retours gratuits sous 30 jours';

-- Sans FROM : aucune ligne insérée si l'annonce existe déjà.
insert into public.announcements (message, position)
select
  'Livraison 7j/7, au Sénégal et partout dans le monde',
  (select coalesce(max(position), -1) + 1 from public.announcements)
where not exists (
  select 1 from public.announcements where message = 'Livraison 7j/7, au Sénégal et partout dans le monde'
);
