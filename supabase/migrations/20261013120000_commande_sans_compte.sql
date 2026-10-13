-- Racha Store : commande sans compte, payée par Wave, Orange Money ou à la livraison
-- À exécuter une seule fois dans Supabase > SQL Editor, après 20261009120000_page_photos.sql.
--
-- Le client ne crée plus de compte et ne paie plus en ligne. Il choisit Wave ou
-- Orange Money (envoi du montant au numéro de la boutique) ou le paiement à la
-- livraison. La commande arrive « À valider » (statut pending) ; la gérante
-- vérifie le paiement ou appelle le client, puis la passe en « Validée » (paid).
-- Les commandes et paiements PayDunya déjà enregistrés ne changent pas.

-- ---------------------------------------------------------------------------
-- 1. Commandes : e-mail facultatif, paiement choisi, téléphone comparable
-- ---------------------------------------------------------------------------

alter table public.orders alter column email drop not null;

alter table public.orders
  add column transaction_ref text check (char_length(transaction_ref) <= 60);

-- NOT VALID : les anciennes commandes ne sont pas revérifiées.
alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method is null or payment_method in ('wave', 'orange_money', 'cash', 'PayDunya')) not valid;

-- Les 9 derniers chiffres du téléphone : « +221 77 123 45 67 » et « 771234567 »
-- désignent le même client (limite anti-abus, historique dans l'administration).
alter table public.orders
  add column phone_key text generated always as (right(regexp_replace(phone, '\D', '', 'g'), 9)) stored;

create index orders_phone_key_idx on public.orders (phone_key, created_at desc);

-- ---------------------------------------------------------------------------
-- 2. Numéro qui reçoit les paiements Wave et Orange Money (/admin/parametres)
-- ---------------------------------------------------------------------------

alter table public.shop_settings
  add column payment_phone text check (payment_phone is null or char_length(payment_phone) <= 30);

update public.shop_settings set payment_phone = phones[1] where payment_phone is null;

-- ---------------------------------------------------------------------------
-- 3. Anti-abus : une commande réserve du stock, même payée à la livraison.
--    3 commandes par jour pour un même téléphone, 5 par heure pour un même
--    e-mail, 60 au total en 10 minutes.
-- ---------------------------------------------------------------------------

create or replace function public.throttle_orders()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Trigger BEFORE : phone_key n'est pas encore calculée, on la recalcule.
  if (
    select count(*) from public.orders
    where phone_key = right(regexp_replace(new.phone, '\D', '', 'g'), 9)
      and created_at > now() - interval '1 day'
  ) >= 3 then
    raise exception 'Trop de commandes avec ce numéro aujourd''hui. Écrivez-nous sur WhatsApp pour finaliser votre achat.';
  end if;

  if new.email is not null and (
    select count(*) from public.orders
    where email = new.email and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Trop de commandes en peu de temps. Contactez-nous pour finaliser votre achat.';
  end if;

  if (select count(*) from public.orders where created_at > now() - interval '10 minutes') >= 60 then
    raise exception 'Trop de commandes en cours. Réessayez dans quelques minutes.';
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. create_order : moyen de paiement, numéro de transaction, champ piège
-- ---------------------------------------------------------------------------

-- Nouveaux paramètres facultatifs : l'ancien site (appel à 4 paramètres)
-- continue de fonctionner jusqu'à la mise en ligne du nouveau.
drop function public.create_order(jsonb, jsonb, public.shipping_method, text);

-- p_customer       : {"email" (facultatif), "first_name", "last_name", "phone",
--                     "address", "address_complement", "postal_code", "city", "country"}
-- p_items          : [{"product_id", "quantity", "color", "size"}, ...]
-- p_payment_method : 'wave', 'orange_money' ou 'cash' (à la livraison)
-- p_transaction_ref: numéro de transaction Wave ou Orange Money, facultatif
-- p_website        : champ invisible du formulaire, rempli seulement par les robots
create function public.create_order(
  p_customer jsonb,
  p_items jsonb,
  p_shipping_method public.shipping_method default 'standard',
  p_promo_code text default null,
  p_payment_method text default null,
  p_transaction_ref text default null,
  p_website text default null
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
  v_email text := nullif(lower(trim(p_customer ->> 'email')), '');
  v_transaction text;
  v_order public.orders%rowtype;
begin
  if nullif(trim(p_website), '') is not null then
    raise exception 'Commande refusée';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Le panier est vide';
  end if;

  if coalesce(trim(p_customer ->> 'first_name'), '') = ''
     or coalesce(trim(p_customer ->> 'last_name'), '') = ''
     or coalesce(trim(p_customer ->> 'phone'), '') = ''
     or coalesce(trim(p_customer ->> 'address'), '') = ''
     or coalesce(trim(p_customer ->> 'city'), '') = '' then
    raise exception 'Coordonnées de livraison incomplètes';
  end if;

  if char_length(regexp_replace(p_customer ->> 'phone', '\D', '', 'g')) < 8 then
    raise exception 'Coordonnées : numéro de téléphone incomplet';
  end if;

  if v_email is not null and (char_length(v_email) > 254 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$') then
    raise exception 'Coordonnées : adresse e-mail invalide';
  end if;

  if p_payment_method is not null and p_payment_method not in ('wave', 'orange_money', 'cash') then
    raise exception 'Moyen de paiement invalide';
  end if;

  -- Le numéro de transaction n'a de sens que pour Wave et Orange Money.
  if p_payment_method in ('wave', 'orange_money') then
    v_transaction := left(nullif(trim(p_transaction_ref), ''), 60);
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
    shipping_method, subtotal, discount, shipping_cost, total, promo_code,
    payment_method, transaction_ref
  )
  values (
    auth.uid(),
    v_email,
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
    v_promo,
    p_payment_method,
    v_transaction
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

revoke execute on function public.create_order(jsonb, jsonb, public.shipping_method, text, text, text, text) from public;
grant execute on function public.create_order(jsonb, jsonb, public.shipping_method, text, text, text, text) to anon, authenticated;
