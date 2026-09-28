-- Racha Store : bandeau d'annonces qui défile en haut de la boutique
-- À exécuter une seule fois dans Supabase > SQL Editor, après 20260928160000_analytics.sql.
--
-- La gérante écrit les annonces dans l'administration (/admin/annonces) :
-- soldes, nouvelle collection, fermeture exceptionnelle... Le site n'affiche
-- que les annonces actives dont les dates sont en cours.

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(btrim(message)) between 1 and 140),
  -- Page du site (/boutique/chaussures) ou adresse complète en https.
  link_url text check (link_url is null or (char_length(link_url) <= 500 and link_url ~ '^(/|https://)')),
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint announcements_dates check (starts_at is null or ends_at is null or ends_at > starts_at)
);

create index announcements_position_idx on public.announcements (position, created_at);

alter table public.announcements enable row level security;

grant select on public.announcements to anon, authenticated;
grant insert, update, delete on public.announcements to authenticated;

create policy "Annonces en cours visibles par tous"
  on public.announcements for select
  to anon, authenticated
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
  );

create policy "Admin : voir toutes les annonces"
  on public.announcements for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admin : ajouter des annonces"
  on public.announcements for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admin : modifier les annonces"
  on public.announcements for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admin : supprimer des annonces"
  on public.announcements for delete
  to authenticated
  using ((select public.is_admin()));

-- Annonces de départ : le texte affiché jusqu'ici dans le bandeau.
insert into public.announcements (message, position) values
  ('Livraison offerte dès 100 000 F CFA', 0),
  ('Retours gratuits sous 30 jours', 1);
