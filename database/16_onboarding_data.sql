-- =====================================================================
-- 77IMÓVEIS — Migração 16: Campo onboarding_data em profiles
-- Armazena as respostas do wizard de cadastro como JSON flexível.
-- =====================================================================

alter table profiles add column if not exists onboarding_data jsonb;
