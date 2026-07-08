-- =====================================================================
-- 77IMÓVEIS — Migração 32: Gratuidade vitalícia (cortesia permanente)
-- =====================================================================
-- Permite ao admin conceder acesso profissional GRÁTIS e SEM EXPIRAÇÃO a
-- empresas (inclui corretor autônomo), corretores e usuários particulares.
-- Modelado como flag booleana (código enxuto), lida diretamente pelo gating
-- do app:
--   • empresas: imóveis ilimitados + assinatura ativa (cortesia) + vitrine + selo.
--   • corretores: selo verificado (cortesia permanente).
--   • particulares: sem o limite de 1 imóvel ativo.
-- Idempotente: pode ser reaplicada com segurança.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Colunas de cortesia nas três entidades.
-- ---------------------------------------------------------------------
-- OBS: free_forever_by é um uuid de auditoria SEM foreign key de propósito —
-- uma FK para profiles criaria um 2º relacionamento profiles<->{companies,brokers}
-- e tornaria os embeds do PostgREST ambíguos (PGRST201) nas listas de admin.
alter table public.companies
  add column if not exists free_forever       boolean not null default false,
  add column if not exists free_forever_since timestamptz,
  add column if not exists free_forever_by    uuid;

alter table public.brokers
  add column if not exists free_forever       boolean not null default false,
  add column if not exists free_forever_since timestamptz,
  add column if not exists free_forever_by    uuid;

alter table public.profiles
  add column if not exists free_forever       boolean not null default false,
  add column if not exists free_forever_since timestamptz,
  add column if not exists free_forever_by    uuid;

-- Se uma versão anterior desta migração criou as FKs, remove-as (idempotente).
alter table public.companies drop constraint if exists companies_free_forever_by_fkey;
alter table public.brokers   drop constraint if exists brokers_free_forever_by_fkey;
alter table public.profiles  drop constraint if exists profiles_free_forever_by_fkey;

-- ---------------------------------------------------------------------
-- Trigger do limite de particular: cortesia vitalícia libera o teto de 1.
-- ---------------------------------------------------------------------
create or replace function enforce_particular_limit() returns trigger as $$
declare
  v_role       user_role;
  v_free       boolean;
  active_count integer;
begin
  if new.status = 'ativo' then
    select role, free_forever into v_role, v_free from profiles where id = new.owner_id;
    if v_role = 'particular' and not coalesce(v_free, false) then
      select count(*) into active_count
        from properties
       where owner_id = new.owner_id and status = 'ativo' and id <> new.id;
      if active_count >= 1 then
        raise exception 'LIMITE_PARTICULAR: Conta Particular permite apenas 1 imóvel ativo. Migre para um plano profissional (B2B).';
      end if;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

-- FIM DO ARQUIVO 32_free_forever.sql
