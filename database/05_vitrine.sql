-- =====================================================================
-- 77IMÓVEIS — Arquivo 05: VITRINE (catálogo próprio da imobiliária)
-- Página exclusiva (/vitrine/{slug}) com a marca da empresa (logo, cor,
-- capa) reunindo todos os imóveis ativos dela. Ativação avulsa por
-- período (30/90/365 dias). Aplicado após 01->02->03->04.
-- =====================================================================

create table storefronts (
  id            uuid primary key default uuid_generate_v4(),
  company_id    uuid not null unique references companies(id) on delete cascade,
  slug          text not null unique,            -- /vitrine/{slug}
  headline      text,
  about         text,
  accent_color  text default '#0891b2',
  logo_url      text,
  cover_url     text,
  show_whatsapp boolean not null default true,
  -- ativação por período (avulso) — controlada SÓ pelo pagamento
  status        feature_status not null default 'pendente_pagamento',
  activated_at  timestamptz,
  expires_at    timestamptz,
  views_count   integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_storefronts_company on storefronts (company_id);
create index idx_storefronts_slug    on storefronts (slug);

create trigger trg_storefronts_updated before update on storefronts
  for each row execute function set_updated_at();

create table storefront_activations (
  id            uuid primary key default uuid_generate_v4(),
  storefront_id uuid not null references storefronts(id) on delete cascade,
  payment_id    uuid references payments(id),
  days          smallint not null,
  amount        numeric(12,2) not null,
  status        feature_status not null default 'pendente_pagamento',
  starts_at     timestamptz,
  ends_at       timestamptz,
  created_at    timestamptz not null default now()
);
create index idx_sf_activations_storefront on storefront_activations (storefront_id);

-- PROTEÇÃO: só o pagamento (service role) ativa/define validade.
-- O dono edita a aparência, mas não consegue se ativar sozinho.
create or replace function guard_storefront_status() returns trigger as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    if tg_op = 'INSERT' then
      new.status := 'pendente_pagamento';
      new.activated_at := null;
      new.expires_at := null;
    elsif tg_op = 'UPDATE' then
      new.status := old.status;
      new.activated_at := old.activated_at;
      new.expires_at := old.expires_at;
    end if;
  end if;
  return new;
end;
$$ language plpgsql set search_path = public, extensions;

create trigger trg_guard_storefront_status
  before insert or update on storefronts
  for each row execute function guard_storefront_status();

alter table storefronts            enable row level security;
alter table storefront_activations enable row level security;

create policy storefronts_read on storefronts for select
  using (
    (status = 'ativo' and (expires_at is null or expires_at > now()))
    or exists (select 1 from companies c where c.id = company_id and c.owner_id = auth.uid())
    or is_admin()
  );
create policy storefronts_insert on storefronts for insert
  with check (exists (select 1 from companies c where c.id = company_id and c.owner_id = auth.uid()));
create policy storefronts_update on storefronts for update
  using (exists (select 1 from companies c where c.id = company_id and c.owner_id = auth.uid()) or is_admin())
  with check (exists (select 1 from companies c where c.id = company_id and c.owner_id = auth.uid()) or is_admin());
create policy storefronts_delete on storefronts for delete
  using (exists (select 1 from companies c where c.id = company_id and c.owner_id = auth.uid()) or is_admin());

create policy sf_activations_read on storefront_activations for select
  using (exists (select 1 from storefronts s join companies c on c.id = s.company_id
                 where s.id = storefront_id and c.owner_id = auth.uid()) or is_admin());

insert into site_settings (key, value) values
  ('vitrine_precos',
   '[{"dias":30,"preco":49.90,"label":"30 dias"},{"dias":90,"preco":119.90,"label":"90 dias"},{"dias":365,"preco":399.90,"label":"1 ano"}]'::jsonb)
on conflict (key) do nothing;

-- FIM DO ARQUIVO 05_vitrine.sql
