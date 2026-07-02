-- =====================================================================
-- 77IMOVEIS — Migração 24: planos e preços atualizados
-- Planos mensais fixos + opção anual com desconto.
-- =====================================================================

-- Mantém histórico de assinaturas antigas, mas tira os planos antigos da vitrine.
update public.plans
set is_active = false
where slug in (
  'profissional-free',
  'profissional-30',
  'profissional-80',
  'imobiliaria-ilimitada',
  'corretor-autonomo-profissional',
  'corretor-autonomo-profissional-anual',
  'corretor-basico',
  'corretor-pro',
  'corretor-max',
  'empresa-start',
  'empresa-pro',
  'empresa-lider'
);

insert into public.plans (
  name, slug, audience, max_active_listings, price, interval,
  included_featured, highlight, benefits, sort, is_active
) values
  (
    'Particular Gratuito', 'particular-gratuito', 'b2c', 1, 0, 'mensal',
    0, false,
    '["1 imóvel ativo gratuito","Botão de WhatsApp","Formulário de contato","Página otimizada para o Google"]'::jsonb,
    1, true
  ),

  (
    'Corretor Essencial', 'corretor-essencial-mensal', 'corretor_autonomo', 10, 19.90, 'mensal',
    0, false,
    '["Até 10 imóveis ativos","Perfil profissional no portal","Leads por WhatsApp e formulário"]'::jsonb,
    10, true
  ),
  (
    'Corretor Essencial Anual', 'corretor-essencial-anual', 'corretor_autonomo', 10, 190.80, 'anual',
    0, false,
    '["Até 10 imóveis ativos","Perfil profissional no portal","Leads por WhatsApp e formulário","Desconto no pagamento anual"]'::jsonb,
    11, true
  ),
  (
    'Corretor Pro', 'corretor-pro-mensal', 'corretor_autonomo', 30, 39.90, 'mensal',
    2, true,
    '["Até 30 imóveis ativos","2 destaques por mês","Vitrine do corretor","Prioridade na busca"]'::jsonb,
    12, true
  ),
  (
    'Corretor Pro Anual', 'corretor-pro-anual', 'corretor_autonomo', 30, 382.80, 'anual',
    24, false,
    '["Até 30 imóveis ativos","24 destaques por ano","Vitrine do corretor","Prioridade na busca","Desconto no pagamento anual"]'::jsonb,
    13, true
  ),
  (
    'Corretor Max', 'corretor-max-mensal', 'corretor_autonomo', 80, 69.90, 'mensal',
    5, false,
    '["Até 80 imóveis ativos","5 destaques por mês","Vitrine premium","Mais visibilidade regional"]'::jsonb,
    14, true
  ),
  (
    'Corretor Max Anual', 'corretor-max-anual', 'corretor_autonomo', 80, 670.80, 'anual',
    60, false,
    '["Até 80 imóveis ativos","60 destaques por ano","Vitrine premium","Mais visibilidade regional","Desconto no pagamento anual"]'::jsonb,
    15, true
  ),

  (
    'Empresa Start', 'empresa-start-mensal', 'b2b', 50, 79.90, 'mensal',
    0, false,
    '["Até 50 imóveis ativos","Vitrine da empresa","Até 3 usuários","Leads por WhatsApp e formulário"]'::jsonb,
    20, true
  ),
  (
    'Empresa Start Anual', 'empresa-start-anual', 'b2b', 50, 766.80, 'anual',
    0, false,
    '["Até 50 imóveis ativos","Vitrine da empresa","Até 3 usuários","Leads por WhatsApp e formulário","Desconto no pagamento anual"]'::jsonb,
    21, true
  ),
  (
    'Empresa Pro', 'empresa-pro-mensal', 'b2b', 150, 149.90, 'mensal',
    10, true,
    '["Até 150 imóveis ativos","10 destaques por mês","Equipe com corretores","Vitrine da empresa"]'::jsonb,
    22, true
  ),
  (
    'Empresa Pro Anual', 'empresa-pro-anual', 'b2b', 150, 1438.80, 'anual',
    120, false,
    '["Até 150 imóveis ativos","120 destaques por ano","Equipe com corretores","Vitrine da empresa","Desconto no pagamento anual"]'::jsonb,
    23, true
  ),
  (
    'Empresa Líder', 'empresa-lider-mensal', 'b2b', 400, 249.90, 'mensal',
    20, false,
    '["Até 400 imóveis ativos","20 destaques por mês","Vitrine premium","Prioridade regional"]'::jsonb,
    24, true
  ),
  (
    'Empresa Líder Anual', 'empresa-lider-anual', 'b2b', 400, 2398.80, 'anual',
    240, false,
    '["Até 400 imóveis ativos","240 destaques por ano","Vitrine premium","Prioridade regional","Desconto no pagamento anual"]'::jsonb,
    25, true
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

insert into public.site_settings (key, value) values
  (
    'vitrine_precos',
    '[{"dias":30,"preco":49.90,"label":"30 dias"},{"dias":90,"preco":119.90,"label":"90 dias"},{"dias":365,"preco":399.90,"label":"1 ano"}]'::jsonb
  ),
  (
    'produtos_avulsos',
    '[
      {"slug":"destaque_7","nome":"Destaque simples","dias":7,"preco":9.90,"tipo":"listing_feature"},
      {"slug":"destaque_15","nome":"Destaque forte","dias":15,"preco":19.90,"tipo":"listing_feature"},
      {"slug":"destaque_30","nome":"Super destaque","dias":30,"preco":34.90,"tipo":"listing_feature"},
      {"slug":"topo_cidade_tipo_7","nome":"Topo cidade + tipo","dias":7,"preco":49.90,"tipo":"listing_feature"},
      {"slug":"topo_cidade_tipo_15","nome":"Topo cidade + tipo","dias":15,"preco":89.90,"tipo":"listing_feature"},
      {"slug":"topo_cidade_tipo_30","nome":"Topo cidade + tipo","dias":30,"preco":149.90,"tipo":"listing_feature"},
      {"slug":"vitrine_30","nome":"Vitrine avulsa","dias":30,"preco":49.90,"tipo":"storefront"},
      {"slug":"vitrine_90","nome":"Vitrine avulsa","dias":90,"preco":119.90,"tipo":"storefront"},
      {"slug":"vitrine_365","nome":"Vitrine avulsa","dias":365,"preco":399.90,"tipo":"storefront"},
      {"slug":"banner_cidade_7","nome":"Banner cidade","dias":7,"preco":74.90,"tipo":"banner"},
      {"slug":"banner_cidade_30","nome":"Banner cidade","dias":30,"preco":249.90,"tipo":"banner"},
      {"slug":"banner_home_7","nome":"Banner regional/home","dias":7,"preco":199.90,"tipo":"banner"},
      {"slug":"banner_home_30","nome":"Banner regional/home","dias":30,"preco":649.90,"tipo":"banner"},
      {"slug":"banner_romaria_30","nome":"Banner romaria/temporada","dias":30,"preco":299.90,"tipo":"banner"}
    ]'::jsonb
  )
on conflict (key) do update set
  value = excluded.value,
  updated_at = now();
