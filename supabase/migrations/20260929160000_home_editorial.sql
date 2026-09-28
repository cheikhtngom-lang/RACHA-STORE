-- Racha Store : bloc mis en avant de la page d'accueil (photo et texte)
-- À exécuter une seule fois dans Supabase > SQL Editor, après 20260929140000_tenues_africaines.sql.
--
-- La gérante change la photo et le texte dans /admin/parametres (onglet
-- « Page d'accueil »). Une seule ligne (id = true). Photo vide : la photo
-- par défaut du site (femme en grand boubou).

create table public.home_editorial (
  id boolean primary key default true check (id),
  image_url text check (image_url is null or (char_length(image_url) <= 500 and image_url ~ '^https://')),
  eyebrow text not null default '' check (char_length(eyebrow) <= 40),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  body text not null default '' check (char_length(body) <= 400),
  button_label text not null default '' check (char_length(button_label) <= 50),
  -- Page du site (/boutique/tenues-africaines) ou adresse complète en https.
  button_url text not null default '' check (button_url = '' or (char_length(button_url) <= 300 and button_url ~ '^(/|https://)')),
  updated_at timestamptz not null default now()
);

create trigger home_editorial_set_updated_at
  before update on public.home_editorial
  for each row execute function public.set_updated_at();

alter table public.home_editorial enable row level security;

grant select on public.home_editorial to anon, authenticated;
grant update on public.home_editorial to authenticated;

create policy "Bloc d'accueil visible par tous"
  on public.home_editorial for select
  to anon, authenticated
  using (true);

create policy "Admin : modifier le bloc d'accueil"
  on public.home_editorial for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into public.home_editorial (eyebrow, title, body, button_label, button_url)
values (
  'Couture africaine',
  'Grand boubou, taille basse, ndokette et kaftan',
  'Robes en wax, ensembles pagne et boubous brodés en bazin riche : les coupes de la couture africaine, pour le quotidien comme pour les cérémonies. Chaque fiche produit indique le tissu et les conseils d''entretien.',
  'Voir nos types de couture africaine',
  '/boutique/tenues-africaines'
);
