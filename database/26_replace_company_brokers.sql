-- 77IMOVEIS - Migracao 26: substituicao atomica da equipe de corretores
-- Problema (auditoria 14, achados #2 e #3): saveBrokers/saveCompany faziam
-- delete + insert sem transacao. Se o insert falhasse, a imobiliaria ficava
-- SEM corretores (a equipe antiga ja tinha sido apagada). O app hoje tem um
-- fallback em codigo que restaura a equipe anterior, mas o correto e uma
-- operacao transacional no banco.
--
-- Esta funcao roda como SECURITY INVOKER (padrao): o delete e o insert
-- respeitam as policies brokers_delete/brokers_insert (owner_id = auth.uid()
-- ou is_admin), e a funcao inteira executa numa unica transacao — ou toda a
-- nova equipe entra, ou a antiga permanece. Nao precisa de service_role.

create or replace function public.replace_company_brokers(
  p_company_id uuid,
  p_brokers jsonb
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.brokers where company_id = p_company_id;

  insert into public.brokers (company_id, name, creci, email, phone, whatsapp, photo_url)
  select
    p_company_id,
    b->>'name',
    nullif(b->>'creci', ''),
    nullif(b->>'email', ''),
    nullif(b->>'phone', ''),
    nullif(b->>'whatsapp', ''),
    nullif(b->>'photo_url', '')
  from jsonb_array_elements(coalesce(p_brokers, '[]'::jsonb)) as b
  where coalesce(btrim(b->>'name'), '') <> '';
end;
$$;

grant execute on function public.replace_company_brokers(uuid, jsonb) to authenticated;
