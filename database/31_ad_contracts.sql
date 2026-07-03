-- =====================================================================
-- 77IMÓVEIS — Migração 31: Contratos de publicidade (banners como contrato)
-- =====================================================================
-- Estende a tabela `banners` para funcionar como um CONTRATO comercial de
-- publicidade gerenciado manualmente pelo admin (vinculado a um cliente,
-- com forma/status de pagamento, período, prioridade, imagens desktop/mobile,
-- renovação automática comercial e ciclo de vida). O display continua
-- controlado por `is_active` + janela de datas (compatível com a policy
-- pública `banners_read_active`). O histórico usa contract_status_history
-- (contract_type='ad'). Idempotente.
-- =====================================================================

alter table public.banners
  add column if not exists company_id      uuid references public.companies(id) on delete set null,
  add column if not exists internal_name   text,
  add column if not exists image_url_mobile text,
  add column if not exists priority        integer not null default 0,
  add column if not exists auto_renew      boolean not null default false,
  add column if not exists payment_method  text
                            check (payment_method is null or payment_method in
                              ('dinheiro','pix','transferencia','cartao_manual','fatura','cortesia','outro')),
  add column if not exists payment_status  text not null default 'pendente'
                            check (payment_status in ('pendente','pago','parcial','isento')),
  add column if not exists amount          numeric(12,2),
  add column if not exists duration_days   integer,
  add column if not exists status          manual_contract_status not null default 'ativo',
  add column if not exists internal_notes  text,
  add column if not exists created_by      uuid references public.profiles(id),
  add column if not exists updated_by      uuid references public.profiles(id),
  add column if not exists updated_at      timestamptz not null default now();

-- Índice do carrossel: banners ativos por slot, ordenados por prioridade.
create index if not exists idx_banners_slot_active_priority
  on public.banners (slot, priority desc) where is_active;
create index if not exists idx_banners_company on public.banners (company_id) where company_id is not null;
create index if not exists idx_banners_ends on public.banners (ends_at);

drop trigger if exists trg_banners_updated on public.banners;
create trigger trg_banners_updated before update on public.banners
  for each row execute function set_updated_at();

-- FIM DO ARQUIVO 31_ad_contracts.sql
