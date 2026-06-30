-- =====================================================================
-- 77IMÓVEIS — Migração 17: Fluxo profissional simplificado
-- Conta pessoal -> corretor autônomo / imobiliária / construtora.
-- =====================================================================

-- Cada conta pode ser dona de no máximo uma entidade profissional.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'companies_owner_unique'
      and conrelid = 'public.companies'::regclass
  ) then
    alter table public.companies
      add constraint companies_owner_unique unique (owner_id);
  end if;
end $$;

-- Plano específico para corretor autônomo: sem assinatura, o app limita a 1
-- imóvel ativo; com assinatura ativa/trial, usa max_active_listings do plano.
insert into plans (
  name,
  slug,
  audience,
  max_active_listings,
  price,
  interval,
  included_featured,
  highlight,
  benefits,
  sort
) values
  (
    'Corretor Autônomo Profissional',
    'corretor-autonomo-profissional',
    'corretor_autonomo',
    10,
    49.90,
    'mensal',
    1,
    true,
    '["Até 10 imóveis ativos","Perfil profissional próprio","Vitrine pública","1 destaque por mês","Contatos pelo WhatsApp e formulário"]'::jsonb,
    2
  ),
  (
    'Corretor Autônomo Profissional Anual',
    'corretor-autonomo-profissional-anual',
    'corretor_autonomo',
    10,
    499.00,
    'anual',
    12,
    false,
    '["Até 10 imóveis ativos","Perfil profissional próprio","Vitrine pública","12 destaques por ano","Economia no pagamento anual"]'::jsonb,
    3
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
  is_active = true;
