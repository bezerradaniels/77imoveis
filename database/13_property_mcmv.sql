-- 13_property_mcmv.sql
-- Indica se o imóvel aceita Minha Casa Minha Vida.
-- Default false para não marcar imóveis antigos sem confirmação do anunciante.

alter table properties
  add column if not exists accepts_mcmv boolean not null default false;
