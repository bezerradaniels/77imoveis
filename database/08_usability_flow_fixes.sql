-- =====================================================================
-- 77IMÓVEIS — Arquivo 08: AJUSTES DE FLUXO/USABILIDADE
-- Persistência da intenção de perfil, telefone/WhatsApp no cadastro e
-- associação segura de anúncios profissionais à empresa do usuário.
-- Aplicar após 01..07.
-- =====================================================================

alter table profiles
  add column if not exists role_intent text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_role_intent_check'
  ) then
    alter table profiles
      add constraint profiles_role_intent_check
      check (role_intent in ('particular','profissional'));
  end if;
end$$;

-- Atualiza o trigger de criação de profile para não perder telefone/WhatsApp
-- quando o projeto exige confirmação de e-mail.
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone, whatsapp, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'whatsapp', new.raw_user_meta_data->>'phone'),
    'particular'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Backfill: se um usuário já tem empresa e imóveis sem company_id, vincula
-- ao primeiro perfil empresarial criado por ele.
with first_company as (
  select distinct on (owner_id) id, owner_id
    from companies
   where status = 'ativo'
   order by owner_id, created_at asc
)
update properties p
   set company_id = fc.id
  from first_company fc
 where p.owner_id = fc.owner_id
   and p.company_id is null;

-- FIM DO ARQUIVO 08_usability_flow_fixes.sql
