-- =====================================================================
-- 77IMÓVEIS — Arquivo 06: MERGE DE MODALIDADES + modalidade ROMARIA
-- Um mesmo imóvel pode ter VÁRIAS negociações ao mesmo tempo
-- (ex.: venda + aluguel, aluguel + temporada), cada uma com seu preço.
-- Nova modalidade: 'romaria' (locação de temporada em período de romaria,
-- relevante para Bom Jesus da Lapa). Aplicado após 01..05.
-- =====================================================================

-- 1) Nova modalidade no enum (rodar fora de transação que a utilize)
alter type negotiation_type add value if not exists 'romaria';

-- 2) Tabela do merge: N modalidades por imóvel
create table property_negotiations (
  property_id      uuid not null references properties(id) on delete cascade,
  negotiation      negotiation_type not null,        -- venda/aluguel/temporada/romaria/lancamento
  price            numeric(14,2),
  price_visibility price_visibility not null default 'publico',
  unit             text,                              -- 'total' | 'mes' | 'diaria'
  is_primary       boolean not null default false,    -- modalidade principal (rótulo/SEO)
  created_at       timestamptz not null default now(),
  primary key (property_id, negotiation)
);
create index idx_propneg_property on property_negotiations (property_id);
create index idx_propneg_neg      on property_negotiations (negotiation);

-- 3) Espelha a modalidade PRINCIPAL de volta em properties
--    (mantém card/URL/SEO com uma leitura simples de properties).
create or replace function sync_primary_negotiation() returns trigger as $$
declare
  pid uuid := coalesce(new.property_id, old.property_id);
  rec record;
begin
  select negotiation, price, price_visibility into rec
    from property_negotiations
   where property_id = pid
   order by is_primary desc, created_at asc
   limit 1;
  if found then
    update properties
       set negotiation = rec.negotiation,
           price = rec.price,
           price_visibility = rec.price_visibility
     where id = pid;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public, extensions;

create trigger trg_sync_primary_negotiation
  after insert or update or delete on property_negotiations
  for each row execute function sync_primary_negotiation();

revoke execute on function public.sync_primary_negotiation() from public, anon, authenticated;

-- 4) RLS
alter table property_negotiations enable row level security;
create policy propneg_read on property_negotiations for select using (true);
create policy propneg_rw on property_negotiations for all
  using (exists (select 1 from properties p where p.id = property_id and (p.owner_id = auth.uid() or is_admin())))
  with check (exists (select 1 from properties p where p.id = property_id and (p.owner_id = auth.uid() or is_admin())));

-- Observações:
--  * properties.negotiation / price / price_visibility continuam existindo,
--    mas agora representam a MODALIDADE PRINCIPAL (sincronizada pelo trigger).
--  * A busca por modalidade deve consultar property_negotiations
--    (ex.: imóveis 'à venda' = join em property_negotiations where negotiation='venda').
--  * unit: 'total' (venda/lançamento), 'mes' (aluguel), 'diaria' (temporada/romaria).
-- FIM DO ARQUIVO 06_merge_negociacoes.sql
