-- Racha Store : protections avant lancement
-- À exécuter une seule fois dans Supabase > SQL Editor, après 20260927190000_admin.sql.
--
-- 1. Longueur maximale des champs saisis sur le site (un robot ne peut plus
--    envoyer des textes de plusieurs mégaoctets).
-- 2. Anti-spam : nombre limité de messages, d'inscriptions à la newsletter et
--    de commandes sur une courte période.
-- 3. Index pour les listes de l'administration.

-- ---------------------------------------------------------------------------
-- 1. Longueurs maximales
-- ---------------------------------------------------------------------------

alter table public.contact_messages
  add constraint contact_messages_lengths check (
    char_length(first_name) <= 100
    and char_length(last_name) <= 100
    and char_length(email) <= 254
    and char_length(subject) <= 200
  ),
  add constraint contact_messages_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

alter table public.newsletter_subscribers
  add constraint newsletter_subscribers_email_length check (char_length(email) <= 254);

alter table public.profiles
  add constraint profiles_lengths check (
    char_length(first_name) <= 100
    and char_length(last_name) <= 100
    and char_length(coalesce(phone, '')) <= 30
  );

alter table public.addresses
  add constraint addresses_lengths check (
    char_length(label) <= 50
    and char_length(full_name) <= 200
    and char_length(coalesce(phone, '')) <= 30
    and char_length(address) <= 300
    and char_length(coalesce(address_complement, '')) <= 300
    and char_length(coalesce(postal_code, '')) <= 20
    and char_length(city) <= 100
    and char_length(country) <= 100
  );

alter table public.orders
  add constraint orders_lengths check (
    char_length(email) <= 254
    and char_length(first_name) <= 100
    and char_length(last_name) <= 100
    and char_length(phone) <= 30
    and char_length(address) <= 300
    and char_length(coalesce(address_complement, '')) <= 300
    and char_length(coalesce(postal_code, '')) <= 20
    and char_length(city) <= 100
    and char_length(country) <= 100
    and char_length(coalesce(notes, '')) <= 2000
  ),
  add constraint orders_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- ---------------------------------------------------------------------------
-- 2. Anti-spam
-- Les messages d'erreur (code P0001) sont affichés tels quels sur le site.
-- ---------------------------------------------------------------------------

create index contact_messages_email_created_idx on public.contact_messages (lower(email), created_at desc);
create index orders_email_created_idx on public.orders (email, created_at desc);
create index orders_phone_created_idx on public.orders (phone, created_at desc);

-- Formulaire de contact : 3 messages par adresse en 10 minutes, 50 au total par heure.
create or replace function public.throttle_contact_messages()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*) from public.contact_messages
    where lower(email) = lower(new.email) and created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception 'Trop de messages envoyés. Réessayez dans quelques minutes.';
  end if;

  if (select count(*) from public.contact_messages where created_at > now() - interval '1 hour') >= 50 then
    raise exception 'Le formulaire est momentanément saturé. Réessayez plus tard ou appelez-nous.';
  end if;

  return new;
end;
$$;

create trigger contact_messages_throttle
  before insert on public.contact_messages
  for each row execute function public.throttle_contact_messages();

-- Newsletter : 100 nouvelles inscriptions par heure au maximum.
create or replace function public.throttle_newsletter()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.newsletter_subscribers where created_at > now() - interval '1 hour') >= 100 then
    raise exception 'Inscriptions momentanément suspendues. Réessayez plus tard.';
  end if;
  return new;
end;
$$;

create trigger newsletter_subscribers_throttle
  before insert on public.newsletter_subscribers
  for each row execute function public.throttle_newsletter();

-- Commandes : une commande réserve du stock ; un robot pourrait vider la
-- boutique avec de fausses commandes. 5 commandes par e-mail ou par téléphone
-- en une heure, 60 au total en 10 minutes.
create or replace function public.throttle_orders()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*) from public.orders
    where (email = new.email or phone = new.phone) and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Trop de commandes en peu de temps. Contactez-nous pour finaliser votre achat.';
  end if;

  if (select count(*) from public.orders where created_at > now() - interval '10 minutes') >= 60 then
    raise exception 'Trop de commandes en cours. Réessayez dans quelques minutes.';
  end if;

  return new;
end;
$$;

create trigger orders_throttle
  before insert on public.orders
  for each row execute function public.throttle_orders();

-- ---------------------------------------------------------------------------
-- 3. Index des listes de l'administration
-- ---------------------------------------------------------------------------

create index orders_created_at_idx on public.orders (created_at desc);
create index newsletter_subscribers_created_at_idx on public.newsletter_subscribers (created_at desc);
create index products_position_idx on public.products (position);
