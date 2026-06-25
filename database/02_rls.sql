-- =====================================================================
-- 77IMÓVEIS — Arquivo 02: SEGURANÇA (Row Level Security)
-- Princípio: conteúdo público é legível por todos; escrita só do dono;
-- admin/moderador têm acesso total. Catálogo é leitura pública.
-- =====================================================================

-- Função auxiliar: papel do usuário logado ----------------------------
create or replace function auth_role() returns user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function is_admin() returns boolean as $$
  select coalesce(auth_role() in ('admin','moderador'), false);
$$ language sql stable security definer;

-- ---------------------------------------------------------------------
-- Habilita RLS em todas as tabelas relevantes
-- ---------------------------------------------------------------------
alter table profiles                enable row level security;
alter table companies               enable row level security;
alter table company_cities          enable row level security;
alter table company_specialties     enable row level security;
alter table brokers                 enable row level security;
alter table properties              enable row level security;
alter table property_images         enable row level security;
alter table property_features       enable row level security;
alter table property_availabilities enable row level security;
alter table favorites               enable row level security;
alter table leads                   enable row level security;
alter table subscriptions           enable row level security;
alter table payments                enable row level security;
alter table listing_features        enable row level security;
alter table blog_posts              enable row level security;
alter table moderation_queue        enable row level security;
alter table audit_logs              enable row level security;

-- Catálogo e localização: LEITURA PÚBLICA, escrita só admin -----------
alter table cities          enable row level security;
alter table neighborhoods   enable row level security;
alter table property_types  enable row level security;
alter table availabilities  enable row level security;
alter table features        enable row level security;
alter table specialties     enable row level security;
alter table plans           enable row level security;
alter table banners         enable row level security;
alter table blog_categories enable row level security;
alter table seo_pages       enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'cities','neighborhoods','property_types','availabilities','features',
    'specialties','plans','blog_categories','seo_pages'
  ] loop
    execute format('create policy %I_read_all on %I for select using (true);', t, t);
    execute format('create policy %I_admin_write on %I for all using (is_admin()) with check (is_admin());', t, t);
  end loop;
end$$;

-- Banners: leitura pública só dos ativos -------------------------------
create policy banners_read_active on banners for select using (is_active or is_admin());
create policy banners_admin on banners for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------
create policy profiles_read_public on profiles for select using (true);
create policy profiles_update_self on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin       on profiles for all    using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- COMPANIES  (públicas para leitura; dono edita; admin tudo)
-- ---------------------------------------------------------------------
create policy companies_read   on companies for select using (status = 'ativo' or owner_id = auth.uid() or is_admin());
create policy companies_insert on companies for insert with check (owner_id = auth.uid());
create policy companies_update on companies for update using (owner_id = auth.uid() or is_admin()) with check (owner_id = auth.uid() or is_admin());
create policy companies_delete on companies for delete using (owner_id = auth.uid() or is_admin());

-- Tabelas auxiliares da empresa: dono da empresa controla -------------
create policy company_cities_rw on company_cities for all
  using (exists (select 1 from companies c where c.id = company_id and (c.owner_id = auth.uid() or is_admin())))
  with check (exists (select 1 from companies c where c.id = company_id and (c.owner_id = auth.uid() or is_admin())));
create policy company_cities_read on company_cities for select using (true);

create policy company_spec_rw on company_specialties for all
  using (exists (select 1 from companies c where c.id = company_id and (c.owner_id = auth.uid() or is_admin())))
  with check (exists (select 1 from companies c where c.id = company_id and (c.owner_id = auth.uid() or is_admin())));
create policy company_spec_read on company_specialties for select using (true);

create policy brokers_read on brokers for select using (true);
create policy brokers_rw on brokers for all
  using (exists (select 1 from companies c where c.id = company_id and (c.owner_id = auth.uid() or is_admin())))
  with check (exists (select 1 from companies c where c.id = company_id and (c.owner_id = auth.uid() or is_admin())));

-- ---------------------------------------------------------------------
-- PROPERTIES  (somente ATIVO é público; dono vê/edita os seus)
-- ---------------------------------------------------------------------
create policy properties_read_public on properties for select
  using (status = 'ativo' or owner_id = auth.uid() or is_admin());
create policy properties_insert on properties for insert with check (owner_id = auth.uid());
create policy properties_update on properties for update
  using (owner_id = auth.uid() or is_admin()) with check (owner_id = auth.uid() or is_admin());
create policy properties_delete on properties for delete
  using (owner_id = auth.uid() or is_admin());

-- Imagens / características: seguem o dono do imóvel --------------------
create policy prop_images_read on property_images for select using (true);
create policy prop_images_rw on property_images for all
  using (exists (select 1 from properties p where p.id = property_id and (p.owner_id = auth.uid() or is_admin())))
  with check (exists (select 1 from properties p where p.id = property_id and (p.owner_id = auth.uid() or is_admin())));

create policy prop_features_read on property_features for select using (true);
create policy prop_features_rw on property_features for all
  using (exists (select 1 from properties p where p.id = property_id and (p.owner_id = auth.uid() or is_admin())))
  with check (exists (select 1 from properties p where p.id = property_id and (p.owner_id = auth.uid() or is_admin())));

create policy prop_avail_read on property_availabilities for select using (true);
create policy prop_avail_rw on property_availabilities for all
  using (exists (select 1 from properties p where p.id = property_id and (p.owner_id = auth.uid() or is_admin())))
  with check (exists (select 1 from properties p where p.id = property_id and (p.owner_id = auth.uid() or is_admin())));

-- ---------------------------------------------------------------------
-- FAVORITES  (privados do usuário)
-- ---------------------------------------------------------------------
create policy favorites_rw on favorites for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ---------------------------------------------------------------------
-- LEADS  (qualquer um pode CRIAR; só o destinatário/dono lê)
-- ---------------------------------------------------------------------
create policy leads_insert on leads for insert with check (true);
create policy leads_read on leads for select
  using (owner_id = auth.uid()
      or exists (select 1 from companies c where c.id = company_id and c.owner_id = auth.uid())
      or is_admin());
create policy leads_update on leads for update
  using (owner_id = auth.uid() or is_admin()) with check (owner_id = auth.uid() or is_admin());

-- ---------------------------------------------------------------------
-- MONETIZAÇÃO  (dono da empresa lê os seus; escrita via service_role)
-- ---------------------------------------------------------------------
create policy subs_read on subscriptions for select
  using (exists (select 1 from companies c where c.id = company_id and c.owner_id = auth.uid()) or is_admin());
create policy payments_read on payments for select
  using (exists (select 1 from companies c where c.id = company_id and c.owner_id = auth.uid()) or is_admin());
create policy listing_feat_read on listing_features for select
  using (exists (select 1 from properties p where p.id = property_id and p.owner_id = auth.uid()) or is_admin());
-- Observação: INSERT/UPDATE de subscriptions/payments é feito pelos
-- webhooks do gateway usando a SERVICE ROLE KEY (ignora RLS).

-- ---------------------------------------------------------------------
-- BLOG  (publicados são públicos; admin gerencia)
-- ---------------------------------------------------------------------
create policy blog_read on blog_posts for select using (is_published or is_admin());
create policy blog_admin on blog_posts for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- MODERAÇÃO / AUDITORIA  (só admin/moderador)
-- ---------------------------------------------------------------------
create policy moderation_admin on moderation_queue for all using (is_admin()) with check (is_admin());
create policy audit_read on audit_logs for select using (is_admin());
create policy audit_insert on audit_logs for insert with check (true);

-- FIM DO ARQUIVO 02_rls.sql
