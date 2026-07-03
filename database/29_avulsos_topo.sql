-- =====================================================================
-- 77IMÓVEIS — Migração 29: avulsos (destaque × topo) e prioridade de busca
-- =====================================================================
-- Contexto: o hub "Assinatura e compras" passa a vender Destaque e Topo da
-- busca separadamente. Destaque continua usando properties.is_featured; Topo
-- usa properties.boosted_until (prioridade por cidade/tipo, com validade).

-- Distingue o tipo de feature comprada.
alter table public.listing_features
  add column if not exists feature_type text not null default 'destaque';

-- Vigência da prioridade "Topo da busca" no imóvel.
alter table public.properties
  add column if not exists boosted_until timestamptz;

create index if not exists idx_props_boosted
  on public.properties (boosted_until)
  where boosted_until is not null;
