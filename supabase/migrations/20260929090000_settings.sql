-- Racha Store : paramètres de la boutique (/admin/parametres)
-- À exécuter une seule fois dans Supabase > SQL Editor, après 20260928200000_announcements.sql.
--
-- 1. shop_settings : coordonnées affichées sur le site (pied de page, page
--    Contact, confidentialité), lisibles par tous, modifiables par les administrateurs.
-- 2. admin_settings : réglages internes (destinataires de l'e-mail « Nouvelle
--    commande »), réservés aux administrateurs.
-- Chaque table n'a qu'une ligne (id = true).

-- ---------------------------------------------------------------------------
-- 1. Coordonnées de la boutique
-- ---------------------------------------------------------------------------

create table public.shop_settings (
  id boolean primary key default true check (id),
  -- Vide : aucun e-mail affiché, les clients écrivent depuis le formulaire de contact.
  contact_email text
    check (char_length(contact_email) <= 254 and contact_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  -- Tels qu'affichés ; le premier est le numéro principal (en-tête, page Contact).
  phones text[] not null default '{}'
    check (cardinality(phones) <= 5 and char_length(array_to_string(phones, '')) <= 150),
  address text not null check (char_length(btrim(address)) between 3 and 200),
  opening_hours text not null default '' check (char_length(opening_hours) <= 120),
  instagram_url text check (instagram_url is null or (char_length(instagram_url) <= 200 and instagram_url ~ '^https://')),
  tiktok_url text check (tiktok_url is null or (char_length(tiktok_url) <= 200 and tiktok_url ~ '^https://')),
  updated_at timestamptz not null default now()
);

create trigger shop_settings_set_updated_at
  before update on public.shop_settings
  for each row execute function public.set_updated_at();

alter table public.shop_settings enable row level security;

grant select on public.shop_settings to anon, authenticated;
grant update on public.shop_settings to authenticated;

create policy "Coordonnées de la boutique visibles par tous"
  on public.shop_settings for select
  to anon, authenticated
  using (true);

create policy "Admin : modifier les coordonnées de la boutique"
  on public.shop_settings for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Valeurs de départ : ni e-mail ni quartier affichés, à la demande de la propriétaire.
insert into public.shop_settings (contact_email, phones, address, opening_hours, instagram_url, tiktok_url)
values (
  null,
  array['+221 76 630 52 62', '+33 7 51 22 66 11'],
  'Dakar, Sénégal',
  'Du lundi au samedi, de 10h à 19h',
  'https://www.instagram.com/racha_store_221',
  'https://www.tiktok.com/@racha2200'
);

-- ---------------------------------------------------------------------------
-- 2. Réglages internes
-- ---------------------------------------------------------------------------

create table public.admin_settings (
  id boolean primary key default true check (id),
  -- Destinataires de l'e-mail « Nouvelle commande ». Vide : variable
  -- ORDER_NOTIFICATION_EMAILS de Vercel.
  order_emails text[] not null default '{}'
    check (cardinality(order_emails) <= 5 and char_length(array_to_string(order_emails, '')) <= 1300),
  updated_at timestamptz not null default now()
);

create trigger admin_settings_set_updated_at
  before update on public.admin_settings
  for each row execute function public.set_updated_at();

alter table public.admin_settings enable row level security;

grant select, update on public.admin_settings to authenticated;

create policy "Admin : lire les réglages internes"
  on public.admin_settings for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admin : modifier les réglages internes"
  on public.admin_settings for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into public.admin_settings (order_emails) values (array['sy.ndeyetacko@gmail.com']);
