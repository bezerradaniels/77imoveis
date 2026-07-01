-- =====================================================================
-- 77IMÓVEIS — Migração 20: Integração Asaas e preços de lançamento
-- =====================================================================

alter table public.companies
  add column if not exists gateway_customer_id text;

alter table public.payments
  add column if not exists external_reference text,
  add column if not exists gateway_payload jsonb;

create unique index if not exists idx_payments_gateway_payment
  on public.payments (gateway, gateway_payment_id)
  where gateway_payment_id is not null;

create unique index if not exists idx_payments_external_reference
  on public.payments (external_reference)
  where external_reference is not null;

create table if not exists public.payment_webhook_events (
  id uuid primary key default uuid_generate_v4(),
  gateway text not null default 'asaas',
  event_id text not null,
  event_name text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (gateway, event_id)
);

alter table public.payment_webhook_events enable row level security;

-- Catálogo promocional de lançamento: 50% dos valores sugeridos.
update public.plans
set is_active = false
where slug in (
  'profissional-30',
  'profissional-80',
  'imobiliaria-ilimitada',
  'corretor-autonomo-profissional',
  'corretor-autonomo-profissional-anual'
);

insert into public.plans (
  name, slug, audience, max_active_listings, price, interval,
  included_featured, highlight, benefits, sort, is_active
) values
  (
    'Corretor Básico', 'corretor-basico', 'corretor_autonomo', 10, 24.90, 'mensal',
    0, false,
    '["Até 10 imóveis ativos","Leads por WhatsApp e formulário","Perfil profissional no portal"]'::jsonb,
    10, true
  ),
  (
    'Corretor Pro', 'corretor-pro', 'corretor_autonomo', 30, 44.90, 'mensal',
    2, true,
    '["Até 30 imóveis ativos","2 destaques por mês","Vitrine do corretor","Prioridade na busca"]'::jsonb,
    11, true
  ),
  (
    'Corretor Max', 'corretor-max', 'corretor_autonomo', 80, 74.90, 'mensal',
    5, false,
    '["Até 80 imóveis ativos","5 destaques por mês","Vitrine completa","Mais visibilidade regional"]'::jsonb,
    12, true
  ),
  (
    'Empresa Start', 'empresa-start', 'b2b', 50, 74.90, 'mensal',
    0, false,
    '["Até 50 imóveis ativos","Vitrine da empresa","Até 3 usuários","2 meses grátis no lançamento"]'::jsonb,
    20, true
  ),
  (
    'Empresa Pro', 'empresa-pro', 'b2b', 150, 149.90, 'mensal',
    10, true,
    '["Até 150 imóveis ativos","10 destaques por mês","Equipe com corretores","2 meses grátis no lançamento"]'::jsonb,
    21, true
  ),
  (
    'Empresa Líder', 'empresa-lider', 'b2b', 400, 249.90, 'mensal',
    20, false,
    '["Até 400 imóveis ativos","20 destaques por mês","Vitrine premium","Prioridade regional","2 meses grátis no lançamento"]'::jsonb,
    22, true
  )
on conflict (slug) do update set
  name = excluded.name,
  audience = excluded.audience,
  max_active_listings = excluded.max_active_listings,
  price = excluded.price,
  interval = excluded.interval,
  included_featured = excluded.included_featured,
  highlight = excluded.highlight,
  benefits = excluded.benefits,
  sort = excluded.sort,
  is_active = excluded.is_active;
