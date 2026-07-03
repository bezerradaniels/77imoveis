-- =====================================================================
-- 77IMÓVEIS — Migração 30: Contratos manuais de plano (gestão admin)
-- =====================================================================
-- Permite ao admin vender/gerenciar planos personalizados sem passar pelo
-- checkout automático (Stripe). Um contrato manual é o registro comercial +
-- histórico de ciclo de vida; quando ativo ele SINCRONIZA uma linha em
-- `subscriptions` (gateway='manual') para que toda a lógica de acesso já
-- existente (limites de imóveis, resumo do painel) continue funcionando.
-- Idempotente: pode ser reaplicada com segurança.
-- =====================================================================

-- Status do contrato manual. 'expirado' também é DERIVADO em tempo de leitura
-- (quando ends_at < now), mas existe como valor armazenável para o processo
-- de expiração/cron (fase 2).
do $$
begin
  if not exists (select 1 from pg_type where typname = 'manual_contract_status') then
    create type manual_contract_status as enum
      ('agendado', 'ativo', 'pausado', 'cancelado', 'expirado');
  end if;
end$$;

-- ---------------------------------------------------------------------
-- Tabela principal: contratos manuais de plano
-- ---------------------------------------------------------------------
create table if not exists public.manual_contracts (
  id                  uuid primary key default uuid_generate_v4(),
  company_id          uuid not null references public.companies(id) on delete cascade,
  plan_id             uuid references public.plans(id),          -- plano base opcional
  plan_name           text not null,                            -- nome exibido do plano
  plan_type           text,                                     -- corretor / imobiliaria / personalizado
  max_active_listings integer not null default 1,               -- limite de imóveis ativos
  included_featured   integer not null default 0,               -- destaques inclusos
  city_scope          jsonb,                                    -- [city_id,...] ou null = todas
  duration_days       integer not null,
  starts_at           timestamptz not null default now(),
  ends_at             timestamptz not null,
  payment_method      text not null default 'cortesia'
                        check (payment_method in
                          ('dinheiro','pix','transferencia','cartao_manual','fatura','cortesia','outro')),
  payment_status      text not null default 'pendente'
                        check (payment_status in ('pendente','pago','parcial','isento')),
  amount              numeric(12,2),
  auto_renew          boolean not null default false,
  status              manual_contract_status not null default 'ativo',
  paused_at           timestamptz,
  remaining_days_snapshot integer,                              -- dias restantes ao pausar
  internal_notes      text,
  public_notes        text,
  created_by          uuid references public.profiles(id),
  updated_by          uuid references public.profiles(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists idx_manual_contracts_company on public.manual_contracts (company_id);
create index if not exists idx_manual_contracts_status  on public.manual_contracts (status);
create index if not exists idx_manual_contracts_ends    on public.manual_contracts (ends_at);

drop trigger if exists trg_manual_contracts_updated on public.manual_contracts;
create trigger trg_manual_contracts_updated before update on public.manual_contracts
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- Extensões em subscriptions: ligação ao contrato manual + overrides
-- de limite (para planos totalmente personalizados sem plano do catálogo).
-- ---------------------------------------------------------------------
alter table public.subscriptions
  add column if not exists manual_contract_id  uuid references public.manual_contracts(id) on delete set null,
  add column if not exists max_listings_override integer,
  add column if not exists featured_override     integer,
  add column if not exists custom_plan_name      text;

-- Planos manuais totalmente personalizados não têm plano do catálogo:
-- permitir subscription sem plan_id (o nome vem de custom_plan_name).
alter table public.subscriptions alter column plan_id drop not null;

create index if not exists idx_subs_manual_contract
  on public.subscriptions (manual_contract_id)
  where manual_contract_id is not null;

-- ---------------------------------------------------------------------
-- Histórico de ciclo de vida (compartilhável com contratos de publicidade
-- na fase 2 via contract_type).
-- ---------------------------------------------------------------------
create table if not exists public.contract_status_history (
  id            uuid primary key default uuid_generate_v4(),
  contract_type text not null default 'plan',        -- 'plan' | 'ad' (fase 2)
  contract_id   uuid not null,
  action        text not null,                        -- create / activate / pause / ...
  from_status   text,
  to_status     text,
  admin_id      uuid references public.profiles(id),
  reason        text,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists idx_contract_history_ref
  on public.contract_status_history (contract_type, contract_id, created_at desc);

-- ---------------------------------------------------------------------
-- RLS: acesso só admin/moderador (is_admin()). O service_role (server
-- actions) ignora RLS de qualquer forma; estas policies protegem o acesso
-- direto via anon/authenticated.
-- ---------------------------------------------------------------------
alter table public.manual_contracts        enable row level security;
alter table public.contract_status_history enable row level security;

drop policy if exists manual_contracts_admin on public.manual_contracts;
create policy manual_contracts_admin on public.manual_contracts
  for all using (is_admin()) with check (is_admin());

drop policy if exists contract_history_admin on public.contract_status_history;
create policy contract_history_admin on public.contract_status_history
  for all using (is_admin()) with check (is_admin());

-- FIM DO ARQUIVO 30_manual_contracts.sql
