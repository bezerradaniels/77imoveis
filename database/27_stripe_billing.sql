-- =====================================================================
-- 77IMÓVEIS — Migração 27: Migração de gateway Asaas → Stripe
-- =====================================================================
-- Contexto: as cobranças (assinaturas e avulsos) passam a ser feitas via
-- Stripe. O banco live não tinha o schema de billing da migração 20, então
-- esta migração é auto-suficiente (tudo com IF NOT EXISTS): cria as colunas
-- genéricas de gateway, a tabela de eventos de webhook, e o price do Stripe
-- por plano.

-- Customer do gateway por empresa (reusado entre cobranças).
alter table public.companies
  add column if not exists gateway_customer_id text;

-- Colunas genéricas de pagamento.
alter table public.payments
  add column if not exists external_reference text,
  add column if not exists gateway_payload jsonb;

create unique index if not exists idx_payments_gateway_payment
  on public.payments (gateway, gateway_payment_id)
  where gateway_payment_id is not null;

create unique index if not exists idx_payments_external_reference
  on public.payments (external_reference)
  where external_reference is not null;

-- Eventos de webhook (idempotência por (gateway, event_id)).
create table if not exists public.payment_webhook_events (
  id uuid primary key default uuid_generate_v4(),
  gateway text not null default 'stripe',
  event_id text not null,
  event_name text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (gateway, event_id)
);

-- Sem policies: só o service_role (webhook) acessa.
alter table public.payment_webhook_events enable row level security;

-- Price recorrente do Stripe por plano (populado por scripts/setup-stripe-plans.ts).
alter table public.plans
  add column if not exists stripe_price_id text;

-- Novos registros nascem como 'stripe'. Linhas antigas permanecem.
alter table public.subscriptions alter column gateway set default 'stripe';
alter table public.payments      alter column gateway set default 'stripe';

-- O webhook busca a assinatura por (gateway, gateway_subscription_id).
create index if not exists idx_subs_gateway_sub
  on public.subscriptions (gateway, gateway_subscription_id)
  where gateway_subscription_id is not null;
