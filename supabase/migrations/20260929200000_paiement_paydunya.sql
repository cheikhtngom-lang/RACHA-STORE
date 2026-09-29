-- Racha Store : paiement en ligne avec PayDunya (Wave, Orange Money, carte bancaire)
-- À exécuter une seule fois dans Supabase > SQL Editor, après 20260929160000_home_editorial.sql.
--
-- Parcours : create_order crée la commande « En attente de paiement », puis le
-- serveur du site ouvre une facture PayDunya (une ligne dans payments) et y
-- envoie le client. Au retour du client et à la notification de PayDunya, le
-- serveur redemande le statut de la facture à l'API PayDunya, puis appelle
-- record_paydunya_payment : la commande passe à « Payée » une seule fois, quel
-- que soit le nombre d'appels.
--
-- Seul le serveur (clé secrète) écrit dans payments ; les administrateurs la lisent.

alter table public.orders add column paid_at timestamptz;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  provider text not null default 'paydunya' check (provider = 'paydunya'),
  -- Jeton de la facture PayDunya.
  token text not null unique check (char_length(token) <= 200),
  -- test : facture ouverte avec les clés de test PayDunya, aucun argent reçu.
  mode text not null check (mode in ('test', 'live')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled', 'failed')),
  amount integer not null check (amount >= 0),
  -- Montant confirmé par PayDunya au paiement.
  amount_paid integer check (amount_paid >= 0),
  checkout_url text not null check (char_length(checkout_url) <= 500),
  receipt_url text check (char_length(receipt_url) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index payments_order_id_idx on public.payments (order_id, created_at desc);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

alter table public.payments enable row level security;

grant select on public.payments to authenticated;
grant select, insert on public.payments to service_role;

create policy "Admin : lire les paiements"
  on public.payments for select
  to authenticated
  using ((select public.is_admin()));

-- Enregistre le statut d'une facture, tel que renvoyé par l'API PayDunya.
-- Renvoie :
--   paid              la commande vient de passer à « Payée »
--   already_recorded  paiement déjà enregistré (appel en double)
--   pending, cancelled, failed  pas de paiement reçu
--   unknown           facture inconnue
--   amount_mismatch   montant payé différent du total : commande non modifiée
--   order_cancelled   paiement reçu sur une commande annulée
--   duplicate         deuxième paiement reçu pour une commande déjà payée
-- Les trois derniers cas demandent une vérification (remboursement).
create or replace function public.record_paydunya_payment(
  p_token text,
  p_status text,
  p_amount integer,
  p_receipt_url text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments%rowtype;
  v_order public.orders%rowtype;
begin
  -- Le verrou fait attendre un second appel simultané (retour du client et
  -- notification PayDunya) jusqu'à la fin du premier.
  select * into v_payment from public.payments where token = p_token for update;
  if not found then
    return 'unknown';
  end if;

  if v_payment.status = 'completed' then
    return 'already_recorded';
  end if;

  if p_status in ('cancelled', 'failed') then
    update public.payments set status = p_status where id = v_payment.id;
    return p_status;
  end if;

  if p_status is distinct from 'completed' then
    return 'pending';
  end if;

  update public.payments
  set status = 'completed',
      amount_paid = p_amount,
      receipt_url = nullif(p_receipt_url, ''),
      completed_at = now()
  where id = v_payment.id;

  select * into v_order from public.orders where id = v_payment.order_id for update;

  if p_amount is distinct from v_order.total then
    return 'amount_mismatch';
  end if;

  if v_order.status = 'cancelled' then
    return 'order_cancelled';
  end if;

  if v_order.status <> 'pending' then
    return 'duplicate';
  end if;

  update public.orders
  set status = 'paid', paid_at = now(), payment_method = 'PayDunya'
  where id = v_order.id;

  return 'paid';
end;
$$;

revoke execute on function public.record_paydunya_payment(text, text, integer, text) from public, anon, authenticated;
grant execute on function public.record_paydunya_payment(text, text, integer, text) to service_role;
