-- Racha Store : vidéos de la page d'accueil (produits, motion design, publicité)
-- À exécuter dans Supabase > SQL Editor, après 20261026120000_vide_dressing.sql.
-- Peut être relancé sans risque.
--
-- La gérante ajoute les vidéos MP4 dans l'administration (/admin/videos). Elles
-- remplacent le bloc « Édition limitée » de l'accueil et passent l'une après
-- l'autre. Aucune vidéo active : la section n'apparaît pas.

-- ---------------------------------------------------------------------------
-- 1. Table des vidéos
-- ---------------------------------------------------------------------------

create table if not exists public.home_videos (
  id uuid primary key default gen_random_uuid(),
  video_url text not null check (char_length(video_url) <= 500 and video_url ~ '^https://'),
  -- Image d'attente tirée de la vidéo au moment de l'envoi.
  poster_url text check (poster_url is null or (char_length(poster_url) <= 500 and poster_url ~ '^https://')),
  title text not null default '' check (char_length(title) <= 60),
  body text not null default '' check (char_length(body) <= 200),
  button_label text not null default '' check (char_length(button_label) <= 40),
  -- Page du site (/produit/robe-wax) ou adresse complète en https.
  button_url text not null default '' check (button_url = '' or (char_length(button_url) <= 300 and button_url ~ '^(/|https://)')),
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists home_videos_position_idx on public.home_videos (position, created_at);

drop trigger if exists home_videos_set_updated_at on public.home_videos;
create trigger home_videos_set_updated_at
  before update on public.home_videos
  for each row execute function public.set_updated_at();

alter table public.home_videos enable row level security;

grant select on public.home_videos to anon, authenticated;
grant insert, update, delete on public.home_videos to authenticated;

drop policy if exists "Vidéos actives visibles par tous" on public.home_videos;
create policy "Vidéos actives visibles par tous"
  on public.home_videos for select
  to anon, authenticated
  using (is_active);

drop policy if exists "Admin : voir toutes les vidéos" on public.home_videos;
create policy "Admin : voir toutes les vidéos"
  on public.home_videos for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admin : ajouter des vidéos" on public.home_videos;
create policy "Admin : ajouter des vidéos"
  on public.home_videos for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admin : modifier les vidéos" on public.home_videos;
create policy "Admin : modifier les vidéos"
  on public.home_videos for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admin : supprimer des vidéos" on public.home_videos;
create policy "Admin : supprimer des vidéos"
  on public.home_videos for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- 2. Stockage des fichiers MP4 (bucket « videos », public en lecture)
-- ---------------------------------------------------------------------------

-- 50 Mo par fichier : le plafond d'envoi de l'offre gratuite Supabase.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', true, 52428800, array['video/mp4'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admin : lister les vidéos" on storage.objects;
create policy "Admin : lister les vidéos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'videos' and (select public.is_admin()));

drop policy if exists "Admin : envoyer des vidéos" on storage.objects;
create policy "Admin : envoyer des vidéos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'videos' and (select public.is_admin()));

drop policy if exists "Admin : remplacer des vidéos" on storage.objects;
create policy "Admin : remplacer des vidéos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'videos' and (select public.is_admin()))
  with check (bucket_id = 'videos' and (select public.is_admin()));

drop policy if exists "Admin : supprimer des vidéos" on storage.objects;
create policy "Admin : supprimer des vidéos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'videos' and (select public.is_admin()));
