-- 77IMOVEIS - Migracao 23: dono da empresa nao pode auto-aprovar corretor
-- Problema: brokers_rw era uma policy unica "for all" — o dono da empresa
-- conseguia dar UPDATE direto nas colunas de aprovacao (status, verified_at,
-- approved_at, rejected_at, disabled_at) do proprio corretor, sem passar
-- pelo admin. O fluxo legitimo do dono (app/painel/empresa/actions.ts) so
-- faz delete+insert (nunca seta essas colunas — usa o default da tabela),
-- e o fluxo do admin (app/admin/actions.ts) usa a service role, que ignora
-- RLS. Ou seja, essa trava so fecha uma chamada direta via API/JS client.

drop policy if exists brokers_rw on brokers;

create policy brokers_insert on brokers for insert
  with check (exists (select 1 from companies c where c.id = company_id and (c.owner_id = auth.uid() or is_admin())));

create policy brokers_delete on brokers for delete
  using (exists (select 1 from companies c where c.id = company_id and (c.owner_id = auth.uid() or is_admin())));

create policy brokers_update on brokers for update
  using (exists (select 1 from companies c where c.id = company_id and (c.owner_id = auth.uid() or is_admin())))
  with check (
    exists (select 1 from companies c where c.id = company_id and (c.owner_id = auth.uid() or is_admin()))
    and (
      is_admin()
      or (
        status is not distinct from (select b.status from brokers b where b.id = brokers.id)
        and verified_at is not distinct from (select b.verified_at from brokers b where b.id = brokers.id)
        and approved_at is not distinct from (select b.approved_at from brokers b where b.id = brokers.id)
        and rejected_at is not distinct from (select b.rejected_at from brokers b where b.id = brokers.id)
        and disabled_at is not distinct from (select b.disabled_at from brokers b where b.id = brokers.id)
      )
    )
  );
