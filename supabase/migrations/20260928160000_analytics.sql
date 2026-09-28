-- Racha Store : statistiques de l'administration (/admin/statistiques)
-- À exécuter une seule fois dans Supabase > SQL Editor, après 20260928090000_hardening.sql.
--
-- 1. Mesure d'audience maison : visites et pages vues par jour, sans cookie ni
--    adresse IP (compteurs agrégés, aucune donnée sur le visiteur).
-- 2. admin_analytics : tous les chiffres de la page Statistiques, calculés ici
--    et réservés aux administrateurs.
-- Fuseau : Africa/Dakar (UTC toute l'année).

-- ---------------------------------------------------------------------------
-- 1. Mesure d'audience
-- ---------------------------------------------------------------------------

create table public.site_visits_daily (
  day date not null,
  source text not null,
  device text not null,
  visits integer not null default 0,
  primary key (day, source, device)
);

create table public.page_views_daily (
  day date not null,
  path text not null,
  views integer not null default 0,
  primary key (day, path)
);

-- Aucune politique : écrites par track_page_view, lues par admin_analytics.
alter table public.site_visits_daily enable row level security;
alter table public.page_views_daily enable row level security;

-- Appelée par le site à chaque page affichée. Une « visite » est comptée à la
-- première page d'une session de navigation, avec sa provenance.
create or replace function public.track_page_view(
  p_path text,
  p_new_visit boolean default false,
  p_source text default null,
  p_device text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day date := (now() at time zone 'Africa/Dakar')::date;
  v_path text := lower(coalesce(p_path, ''));
begin
  -- Seules les pages qui existent sont comptées une à une : un robot qui
  -- invente des adresses ne peut pas remplir la table.
  if v_path ~ '^/produit/[a-z0-9-]+$' then
    if not exists (select 1 from public.products where slug = substr(v_path, 10)) then
      v_path := 'autre';
    end if;
  elsif v_path ~ '^/boutique/[a-z0-9-]+$' then
    if not exists (select 1 from public.categories where slug = substr(v_path, 11)) then
      v_path := 'autre';
    end if;
  elsif v_path like '/compte%' then
    v_path := '/compte';
  elsif v_path not in (
    '/', '/boutique', '/a-propos', '/contact', '/faq', '/livraison-retours', '/cgv',
    '/mentions-legales', '/confidentialite', '/panier', '/checkout', '/checkout/confirmation',
    '/liste-de-souhaits'
  ) then
    v_path := 'autre';
  end if;

  insert into public.page_views_daily as v (day, path, views)
  values (v_day, v_path, 1)
  on conflict (day, path) do update set views = v.views + 1;

  if p_new_visit then
    insert into public.site_visits_daily as s (day, source, device, visits)
    values (
      v_day,
      case when p_source in ('instagram', 'tiktok', 'facebook', 'google', 'whatsapp', 'direct') then p_source else 'autre' end,
      case when p_device = 'mobile' then 'mobile' else 'ordinateur' end,
      1
    )
    on conflict (day, source, device) do update set visits = s.visits + 1;
  end if;
end;
$$;

revoke execute on function public.track_page_view(text, boolean, text, text) from public;
grant execute on function public.track_page_view(text, boolean, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Chiffres de la page Statistiques
-- ---------------------------------------------------------------------------

-- p_days : 7, 30 ou 90 jours (par jour), ou 365 (12 derniers mois, par mois).
-- Chaque indicateur est comparé à la période précédente de même durée.
-- « Chiffre d'affaires encaissé » = commandes payées, expédiées ou livrées.
create or replace function public.admin_analytics(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Africa/Dakar')::date;
  v_days integer := case when p_days in (7, 30, 90, 365) then p_days else 30 end;
  v_monthly boolean := p_days = 365;
  v_from date;
  v_prev_from date;
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux administrateurs';
  end if;

  if v_monthly then
    v_from := (date_trunc('month', v_today::timestamp) - interval '11 months')::date;
    v_prev_from := (v_from - interval '12 months')::date;
  else
    v_from := v_today - (v_days - 1);
    v_prev_from := v_from - v_days;
  end if;

  with
  o as (
    select id, status, total, discount, email, city, shipping_method, promo_code,
           (created_at at time zone 'Africa/Dakar')::date as day
    from public.orders
    where created_at >= v_prev_from::timestamp at time zone 'Africa/Dakar'
  ),
  cur as (select * from o where day >= v_from),
  visit_rows as (
    select day, source, device, visits
    from public.site_visits_daily
    where day >= v_prev_from
  ),
  buckets as (
    select g::date as bucket
    from generate_series(
      v_from::timestamp,
      case when v_monthly then date_trunc('month', v_today::timestamp) else v_today::timestamp end,
      case when v_monthly then interval '1 month' else interval '1 day' end
    ) g
  ),
  order_buckets as (
    select case when v_monthly then date_trunc('month', day::timestamp)::date else day end as bucket,
           count(*) filter (where status <> 'cancelled') as orders,
           coalesce(sum(total) filter (where status in ('paid', 'shipped', 'delivered')), 0) as revenue
    from cur
    group by 1
  ),
  visit_buckets as (
    select case when v_monthly then date_trunc('month', day::timestamp)::date else day end as bucket,
           sum(visits) as visits
    from visit_rows
    where day >= v_from
    group by 1
  ),
  series as (
    select b.bucket,
           coalesce(ob.orders, 0) as orders,
           coalesce(ob.revenue, 0) as revenue,
           coalesce(vb.visits, 0) as visits
    from buckets b
    left join order_buckets ob on ob.bucket = b.bucket
    left join visit_buckets vb on vb.bucket = b.bucket
  ),
  kpis as (
    select
      coalesce(sum(total) filter (where day >= v_from and status in ('paid', 'shipped', 'delivered')), 0) as revenue,
      coalesce(sum(total) filter (where day < v_from and status in ('paid', 'shipped', 'delivered')), 0) as revenue_prev,
      count(*) filter (where day >= v_from and status <> 'cancelled') as orders,
      count(*) filter (where day < v_from and status <> 'cancelled') as orders_prev,
      coalesce(sum(total) filter (where day >= v_from and status <> 'cancelled'), 0) as orders_value,
      coalesce(sum(total) filter (where day < v_from and status <> 'cancelled'), 0) as orders_value_prev,
      count(*) filter (where day >= v_from and status in ('paid', 'shipped', 'delivered')) as collected,
      count(*) filter (where day >= v_from and status = 'cancelled') as cancelled,
      count(*) filter (where day >= v_from) as all_orders,
      count(*) filter (where day >= v_from and status <> 'cancelled' and shipping_method = 'express') as express
    from o
  ),
  visit_kpis as (
    select
      coalesce(sum(visits) filter (where day >= v_from), 0) as visits,
      coalesce(sum(visits) filter (where day < v_from), 0) as visits_prev,
      coalesce(sum(visits) filter (where day >= v_from and device = 'mobile'), 0) as mobile
    from visit_rows
  ),
  sold as (
    select i.product_id, i.product_name, i.quantity, i.line_total
    from public.order_items i
    join cur c on c.id = i.order_id
    where c.status <> 'cancelled'
  ),
  buyers as (
    select distinct email from cur where status <> 'cancelled'
  )
  select jsonb_build_object(
    'period', jsonb_build_object('from', v_from, 'to', v_today, 'days', v_days, 'monthly', v_monthly),
    'kpis', (
      select jsonb_build_object(
        'revenue', k.revenue, 'revenue_prev', k.revenue_prev,
        'orders', k.orders, 'orders_prev', k.orders_prev,
        'orders_value', k.orders_value, 'orders_value_prev', k.orders_value_prev,
        'collected', k.collected, 'cancelled', k.cancelled, 'all_orders', k.all_orders,
        'express', k.express,
        'visits', vk.visits, 'visits_prev', vk.visits_prev, 'mobile_visits', vk.mobile,
        'items_sold', (select coalesce(sum(quantity), 0) from sold),
        'buyers', (select count(*) from buyers),
        'repeat_buyers', (
          select count(*) from buyers b
          where (select count(*) from public.orders x where x.email = b.email and x.status <> 'cancelled') >= 2
        ),
        'page_views', (select coalesce(sum(views), 0) from public.page_views_daily where day >= v_from),
        'new_accounts', (select count(*) from public.profiles where (created_at at time zone 'Africa/Dakar')::date >= v_from),
        'new_subscribers', (select count(*) from public.newsletter_subscribers where (created_at at time zone 'Africa/Dakar')::date >= v_from),
        'messages', (select count(*) from public.contact_messages where (created_at at time zone 'Africa/Dakar')::date >= v_from),
        'active_products', (select count(*) from public.products where is_active),
        'out_of_stock', (select count(*) from public.products where is_active and stock = 0),
        'low_stock', (select count(*) from public.products where is_active and stock between 1 and 3)
      )
      from kpis k, visit_kpis vk
    ),
    'series', (
      select coalesce(jsonb_agg(jsonb_build_object('date', bucket, 'revenue', revenue, 'orders', orders, 'visits', visits) order by bucket), '[]'::jsonb)
      from series
    ),
    'statuses', (
      select coalesce(jsonb_agg(jsonb_build_object('status', status, 'count', n)), '[]'::jsonb)
      from (select status, count(*) as n from cur group by status) s
    ),
    'categories', (
      -- position : la couleur d'une catégorie suit la catégorie, pas son rang.
      select coalesce(jsonb_agg(jsonb_build_object('name', name, 'position', position, 'revenue', revenue, 'quantity', quantity) order by revenue desc), '[]'::jsonb)
      from (
        select coalesce(cat.name, 'Produits supprimés') as name,
               min(cat.position) as position,
               sum(s.line_total) as revenue,
               sum(s.quantity) as quantity
        from sold s
        left join public.products p on p.id = s.product_id
        left join public.categories cat on cat.id = p.category_id
        group by 1
      ) c
    ),
    'top_products', (
      select coalesce(jsonb_agg(jsonb_build_object('name', product_name, 'quantity', quantity, 'revenue', revenue) order by quantity desc, revenue desc), '[]'::jsonb)
      from (
        select product_name, sum(quantity) as quantity, sum(line_total) as revenue
        from sold
        group by product_name
        order by 2 desc, 3 desc
        limit 8
      ) t
    ),
    'most_viewed', (
      select coalesce(jsonb_agg(jsonb_build_object('name', name, 'views', views, 'sold', sold_qty) order by views desc), '[]'::jsonb)
      from (
        select p.name,
               sum(v.views) as views,
               coalesce((select sum(s.quantity) from sold s where s.product_id = p.id), 0) as sold_qty
        from public.page_views_daily v
        join public.products p on v.path = '/produit/' || p.slug
        where v.day >= v_from
        group by p.id, p.name
        order by 2 desc
        limit 8
      ) mv
    ),
    'sources', (
      select coalesce(jsonb_agg(jsonb_build_object('source', source, 'visits', n) order by n desc), '[]'::jsonb)
      from (select source, sum(visits) as n from visit_rows where day >= v_from group by source) src
    ),
    'cities', (
      select coalesce(jsonb_agg(jsonb_build_object('city', city, 'orders', n) order by n desc), '[]'::jsonb)
      from (
        select initcap(lower(trim(city))) as city, count(*) as n
        from cur
        where status <> 'cancelled'
        group by 1
        order by 2 desc
        limit 6
      ) ct
    ),
    'weekdays', (
      select coalesce(jsonb_agg(jsonb_build_object('dow', dow, 'orders', n) order by dow), '[]'::jsonb)
      from (
        select extract(isodow from day)::int as dow, count(*) as n
        from cur
        where status <> 'cancelled'
        group by 1
      ) wd
    ),
    'promo_codes', (
      select coalesce(jsonb_agg(jsonb_build_object('code', promo_code, 'uses', n, 'discount', d) order by n desc), '[]'::jsonb)
      from (
        select promo_code, count(*) as n, sum(discount) as d
        from cur
        where promo_code is not null and status <> 'cancelled'
        group by 1
        order by 2 desc
        limit 5
      ) pc
    )
  )
  into v_result;

  return v_result;
end;
$$;

revoke execute on function public.admin_analytics(integer) from public, anon;
grant execute on function public.admin_analytics(integer) to authenticated;
