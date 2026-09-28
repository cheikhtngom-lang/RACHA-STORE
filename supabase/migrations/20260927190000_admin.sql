-- Racha Store : espace d'administration (/admin)
-- À exécuter une seule fois dans Supabase > SQL Editor, après le schéma initial.
-- Déclarez ensuite le ou les comptes administrateurs (voir la fin du fichier).
--
-- Le site n'utilise que la clé publishable : chaque droit de l'administration
-- passe par les règles RLS ci-dessous, qui vérifient public.is_admin().

-- ---------------------------------------------------------------------------
-- Administrateurs
-- ---------------------------------------------------------------------------

-- Aucune politique ni aucun droit : la liste ne se modifie que depuis Supabase.
-- (Un champ « is_admin » dans profiles serait modifiable par le client lui-même.)
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------

grant insert, update, delete on public.categories, public.products to authenticated;

create policy "Admin : ajouter des catégories"
  on public.categories for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admin : modifier les catégories"
  on public.categories for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Refusé par la base tant qu'un produit est rangé dans la catégorie.
create policy "Admin : supprimer des catégories"
  on public.categories for delete
  to authenticated
  using ((select public.is_admin()));

create policy "Admin : voir aussi les produits retirés de la vente"
  on public.products for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admin : ajouter des produits"
  on public.products for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admin : modifier les produits"
  on public.products for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Les anciennes commandes gardent leur copie du nom, du SKU et du prix.
create policy "Admin : supprimer des produits"
  on public.products for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Commandes
-- ---------------------------------------------------------------------------

-- Seule la note interne se modifie directement ; le statut passe par
-- admin_set_order_status, qui gère le stock.
grant update (notes) on public.orders to authenticated;

create policy "Admin : lire toutes les commandes"
  on public.orders for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admin : annoter les commandes"
  on public.orders for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admin : lire tous les articles commandés"
  on public.order_items for select
  to authenticated
  using ((select public.is_admin()));

-- Change le statut d'une commande. L'annulation remet les articles en stock et
-- libère l'utilisation du code promo ; une commande annulée ne change plus.
create or replace function public.admin_set_order_status(
  p_order_id uuid,
  p_status public.order_status
)
returns public.order_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current public.order_status;
  v_promo text;
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux administrateurs';
  end if;

  select status, promo_code into v_current, v_promo
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Commande introuvable';
  end if;

  if v_current = p_status then
    return v_current;
  end if;

  if v_current = 'cancelled' then
    raise exception 'Une commande annulée ne peut plus changer de statut';
  end if;

  if p_status = 'cancelled' then
    update public.products p
    set stock = p.stock + i.quantity
    from (
      select product_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = p_order_id and product_id is not null
      group by product_id
    ) i
    where p.id = i.product_id;

    if v_promo is not null then
      update public.promo_codes
      set times_used = greatest(times_used - 1, 0)
      where code = v_promo;
    end if;
  end if;

  update public.orders set status = p_status where id = p_order_id;
  return p_status;
end;
$$;

revoke execute on function public.admin_set_order_status(uuid, public.order_status) from public, anon;
grant execute on function public.admin_set_order_status(uuid, public.order_status) to authenticated;

-- ---------------------------------------------------------------------------
-- Codes promo
-- ---------------------------------------------------------------------------

-- Le code et son compteur d'utilisations ne se modifient pas à la main.
grant select, insert, delete on public.promo_codes to authenticated;
grant update (percent_off, is_active, starts_at, expires_at, max_uses) on public.promo_codes to authenticated;

create policy "Admin : lire les codes promo"
  on public.promo_codes for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admin : créer des codes promo"
  on public.promo_codes for insert
  to authenticated
  with check ((select public.is_admin()) and times_used = 0);

create policy "Admin : modifier les codes promo"
  on public.promo_codes for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Un code déjà utilisé reste dans l'historique des commandes : on le désactive.
create policy "Admin : supprimer les codes jamais utilisés"
  on public.promo_codes for delete
  to authenticated
  using ((select public.is_admin()) and times_used = 0);

-- ---------------------------------------------------------------------------
-- Messages et newsletter
-- ---------------------------------------------------------------------------

grant select, delete on public.contact_messages, public.newsletter_subscribers to authenticated;
grant update (is_read) on public.contact_messages to authenticated;

create policy "Admin : lire les messages"
  on public.contact_messages for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admin : marquer les messages comme lus"
  on public.contact_messages for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admin : supprimer des messages"
  on public.contact_messages for delete
  to authenticated
  using ((select public.is_admin()));

create policy "Admin : lire les abonnés"
  on public.newsletter_subscribers for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admin : désinscrire un abonné"
  on public.newsletter_subscribers for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Photos (bucket « products », public en lecture)
-- ---------------------------------------------------------------------------

-- Le site réduit les photos avant l'envoi ; la limite protège contre les oublis.
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'products';

create policy "Admin : lister les photos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'products' and (select public.is_admin()));

create policy "Admin : envoyer des photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products' and (select public.is_admin()));

create policy "Admin : remplacer des photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'products' and (select public.is_admin()))
  with check (bucket_id = 'products' and (select public.is_admin()));

create policy "Admin : supprimer des photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products' and (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Déclarer un administrateur
-- Le compte doit d'abord exister (inscription sur le site, e-mail confirmé).
-- Remplacez l'adresse puis exécutez ces deux lignes :
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'adresse@exemple.com';
--
-- Retirer un administrateur :
--   delete from public.admins
--   where user_id = (select id from auth.users where email = 'adresse@exemple.com');
-- ---------------------------------------------------------------------------
