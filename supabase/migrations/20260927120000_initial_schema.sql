-- Racha Store : schéma initial
-- À exécuter une seule fois dans Supabase > SQL Editor, avant supabase/seed.sql.
-- Montants en F CFA (entiers, pas de centimes).

-- ---------------------------------------------------------------------------
-- Utilitaires
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  image_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sku text not null unique,
  name text not null,
  category_id uuid not null references public.categories (id) on delete restrict,
  subcategory text,
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price > price),
  short_description text not null default '',
  description text not null default '',
  details text[] not null default '{}',
  materials text,
  care text,
  images text[] not null default '{}',
  -- [{"name": "Noir", "hex": "#1A1A1A"}, ...]
  colors jsonb not null default '[]' check (jsonb_typeof(colors) = 'array'),
  sizes text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  is_new boolean not null default false,
  is_best_seller boolean not null default false,
  is_limited boolean not null default false,
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Clients
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crée le profil à l'inscription, à partir des métadonnées envoyées par le formulaire.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'Domicile',
  full_name text not null,
  phone text,
  address text not null,
  address_complement text,
  postal_code text,
  city text not null default 'Dakar',
  country text not null default 'Sénégal',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses (user_id);
create unique index addresses_one_default_per_user on public.addresses (user_id) where is_default;

create table public.wishlist_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------------------------------------------------------------------------
-- Codes promo et commandes
-- ---------------------------------------------------------------------------

create table public.promo_codes (
  code text primary key check (code = upper(code)),
  percent_off integer not null check (percent_off between 1 and 100),
  is_active boolean not null default true,
  starts_at timestamptz,
  expires_at timestamptz,
  max_uses integer check (max_uses > 0),
  times_used integer not null default 0,
  created_at timestamptz not null default now()
);

create type public.order_status as enum ('pending', 'paid', 'shipped', 'delivered', 'cancelled');
create type public.shipping_method as enum ('standard', 'express');

create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique
    default ('RS-' || lpad(nextval('public.order_number_seq')::text, 6, '0')),
  user_id uuid references auth.users (id) on delete set null,
  status public.order_status not null default 'pending',
  email text not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  address text not null,
  address_complement text,
  postal_code text,
  city text not null,
  country text not null default 'Sénégal',
  shipping_method public.shipping_method not null default 'standard',
  subtotal integer not null check (subtotal >= 0),
  discount integer not null default 0 check (discount >= 0),
  shipping_cost integer not null default 0 check (shipping_cost >= 0),
  total integer not null check (total >= 0),
  promo_code text references public.promo_codes (code) on update cascade on delete set null,
  payment_method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Les nom, SKU et prix sont copiés au moment de l'achat : modifier ou supprimer
-- un produit ne change pas les anciennes commandes.
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  sku text not null,
  image_url text,
  color text,
  size text,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total integer generated always as (unit_price * quantity) stored
);

create index order_items_order_id_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- Newsletter et contact
-- ---------------------------------------------------------------------------

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  subject text not null,
  message text not null check (char_length(message) <= 5000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Sécurité (Row Level Security)
-- Sans politique, une table est inaccessible depuis le site. Le tableau de bord
-- Supabase et la clé secrète passent outre : c'est là que la boutique se gère.
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.promo_codes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;

grant select on public.categories, public.products to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.addresses, public.wishlist_items to authenticated;
grant select on public.orders, public.order_items to authenticated;
grant insert on public.contact_messages to anon, authenticated;

create policy "Catégories visibles par tous"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Produits actifs visibles par tous"
  on public.products for select
  to anon, authenticated
  using (is_active);

create policy "Lire son profil"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Modifier son profil"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Gérer ses adresses"
  on public.addresses for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Gérer sa liste de souhaits"
  on public.wishlist_items for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Lire ses commandes"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Lire les articles de ses commandes"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = (select auth.uid())
    )
  );

create policy "Envoyer un message"
  on public.contact_messages for insert
  to anon, authenticated
  with check (is_read = false);

-- ---------------------------------------------------------------------------
-- Fonctions appelées par le site
-- ---------------------------------------------------------------------------

-- Renvoie le pourcentage de remise, ou null si le code n'est pas utilisable.
create or replace function public.check_promo_code(p_code text)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select percent_off
  from public.promo_codes
  where code = upper(trim(p_code))
    and is_active
    and (starts_at is null or starts_at <= now())
    and (expires_at is null or expires_at > now())
    and (max_uses is null or times_used < max_uses);
$$;

create or replace function public.subscribe_newsletter(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_email is null or trim(p_email) !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Adresse e-mail invalide';
  end if;
  insert into public.newsletter_subscribers (email)
  values (lower(trim(p_email)))
  on conflict (email) do nothing;
end;
$$;

-- Crée une commande de façon atomique. Les prix, la remise et les frais de port
-- sont recalculés ici à partir de la base : le navigateur n'envoie que les
-- produits, quantités, couleurs et tailles. Le stock est décrémenté dans la
-- même transaction, donc deux clients ne peuvent pas acheter la dernière pièce.
--
-- p_customer : {"email", "first_name", "last_name", "phone", "address",
--               "address_complement", "postal_code", "city", "country"}
-- p_items    : [{"product_id", "quantity", "color", "size"}, ...]
create or replace function public.create_order(
  p_customer jsonb,
  p_items jsonb,
  p_shipping_method public.shipping_method default 'standard',
  p_promo_code text default null
)
returns table (order_id uuid, order_number text, total integer)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  -- Mêmes règles que sur le site : port offert dès 100 000 F CFA.
  c_free_shipping_threshold constant integer := 100000;
  c_standard_shipping constant integer := 5000;
  c_express_shipping constant integer := 10000;

  v_item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
  v_subtotal integer := 0;
  v_promo text;
  v_percent integer;
  v_discount integer := 0;
  v_shipping integer;
  v_order public.orders%rowtype;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Le panier est vide';
  end if;

  if coalesce(trim(p_customer ->> 'email'), '') = ''
     or coalesce(trim(p_customer ->> 'first_name'), '') = ''
     or coalesce(trim(p_customer ->> 'last_name'), '') = ''
     or coalesce(trim(p_customer ->> 'phone'), '') = ''
     or coalesce(trim(p_customer ->> 'address'), '') = ''
     or coalesce(trim(p_customer ->> 'city'), '') = '' then
    raise exception 'Coordonnées de livraison incomplètes';
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'quantity')::integer;
    if v_qty is null or v_qty < 1 or v_qty > 20 then
      raise exception 'Quantité invalide';
    end if;

    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid and is_active
    for update;

    if not found then
      raise exception 'Produit introuvable ou retiré de la vente';
    end if;

    if cardinality(v_product.sizes) > 0
       and not coalesce((v_item ->> 'size') = any (v_product.sizes), false) then
      raise exception 'Taille invalide pour %', v_product.name;
    end if;

    if jsonb_array_length(v_product.colors) > 0
       and not exists (
         select 1 from jsonb_array_elements(v_product.colors) c
         where c ->> 'name' = v_item ->> 'color'
       ) then
      raise exception 'Couleur invalide pour %', v_product.name;
    end if;

    if v_product.stock < v_qty then
      raise exception 'Stock insuffisant pour %', v_product.name;
    end if;

    update public.products set stock = stock - v_qty where id = v_product.id;
    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  if nullif(trim(p_promo_code), '') is not null then
    v_promo := upper(trim(p_promo_code));
    v_percent := public.check_promo_code(v_promo);
    if v_percent is null then
      raise exception 'Code promo invalide';
    end if;
    v_discount := floor(v_subtotal * v_percent / 100.0);
    update public.promo_codes set times_used = times_used + 1 where code = v_promo;
  end if;

  v_shipping := case
    when v_subtotal >= c_free_shipping_threshold then 0
    when p_shipping_method = 'express' then c_express_shipping
    else c_standard_shipping
  end;

  insert into public.orders (
    user_id, email, first_name, last_name, phone,
    address, address_complement, postal_code, city, country,
    shipping_method, subtotal, discount, shipping_cost, total, promo_code
  )
  values (
    auth.uid(),
    lower(trim(p_customer ->> 'email')),
    trim(p_customer ->> 'first_name'),
    trim(p_customer ->> 'last_name'),
    trim(p_customer ->> 'phone'),
    trim(p_customer ->> 'address'),
    nullif(trim(p_customer ->> 'address_complement'), ''),
    nullif(trim(p_customer ->> 'postal_code'), ''),
    trim(p_customer ->> 'city'),
    coalesce(nullif(trim(p_customer ->> 'country'), ''), 'Sénégal'),
    p_shipping_method,
    v_subtotal,
    v_discount,
    v_shipping,
    v_subtotal - v_discount + v_shipping,
    v_promo
  )
  returning * into v_order;

  insert into public.order_items (
    order_id, product_id, product_name, sku, image_url, color, size, unit_price, quantity
  )
  select
    v_order.id, p.id, p.name, p.sku, p.images[1],
    nullif(i ->> 'color', ''), nullif(i ->> 'size', ''),
    p.price, (i ->> 'quantity')::integer
  from jsonb_array_elements(p_items) i
  join public.products p on p.id = (i ->> 'product_id')::uuid;

  return query select v_order.id, v_order.order_number, v_order.total;
end;
$$;

revoke execute on function public.check_promo_code(text) from public;
revoke execute on function public.subscribe_newsletter(text) from public;
revoke execute on function public.create_order(jsonb, jsonb, public.shipping_method, text) from public;
grant execute on function public.check_promo_code(text) to anon, authenticated;
grant execute on function public.subscribe_newsletter(text) to anon, authenticated;
grant execute on function public.create_order(jsonb, jsonb, public.shipping_method, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Stockage des photos produits (bucket public, envoi depuis le tableau de bord)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;
