-- 77IMOVEIS - Migracao 19: controles administrativos seguros para corretores.

alter table brokers add column if not exists status text not null default 'ativo';
alter table brokers add column if not exists verified_at timestamptz;
alter table brokers add column if not exists approved_at timestamptz;
alter table brokers add column if not exists rejected_at timestamptz;
alter table brokers add column if not exists disabled_at timestamptz;
alter table brokers add column if not exists updated_at timestamptz not null default now();

alter table brokers drop constraint if exists brokers_status_check;
alter table brokers
  add constraint brokers_status_check
  check (status in ('ativo','pendente','aprovado','reprovado','inativo','arquivado','removido'));

create index if not exists idx_brokers_status on brokers (status);
create index if not exists idx_brokers_company_status on brokers (company_id, status);

drop trigger if exists trg_brokers_updated on brokers;
create trigger trg_brokers_updated before update on brokers
for each row execute function set_updated_at();

drop policy if exists brokers_read on brokers;
create policy brokers_read on brokers for select
  using (
    (status in ('ativo','aprovado') and exists (
      select 1 from companies c
      where c.id = company_id and c.status = 'ativo'
    ))
    or exists (
      select 1 from companies c
      where c.id = company_id and (c.owner_id = auth.uid() or is_admin())
    )
  );
