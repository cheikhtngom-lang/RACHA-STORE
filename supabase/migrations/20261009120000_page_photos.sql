-- Racha Store : photos des pages Connexion et Inscription
-- À exécuter une seule fois dans Supabase > SQL Editor, après 20260929200000_paiement_paydunya.sql.
--
-- La gérante change ces photos dans /admin/parametres (onglet « Connexion et
-- inscription »). Une seule ligne (id = true). Photo vide : la photo par
-- défaut du site.

create table public.page_photos (
  id boolean primary key default true check (id),
  login_image_url text check (login_image_url is null or (char_length(login_image_url) <= 500 and login_image_url ~ '^https://')),
  signup_image_url text check (signup_image_url is null or (char_length(signup_image_url) <= 500 and signup_image_url ~ '^https://')),
  updated_at timestamptz not null default now()
);

create trigger page_photos_set_updated_at
  before update on public.page_photos
  for each row execute function public.set_updated_at();

alter table public.page_photos enable row level security;

grant select on public.page_photos to anon, authenticated;
grant update on public.page_photos to authenticated;

create policy "Photos des pages visibles par tous"
  on public.page_photos for select
  to anon, authenticated
  using (true);

create policy "Admin : modifier les photos des pages"
  on public.page_photos for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into public.page_photos (id) values (true);
