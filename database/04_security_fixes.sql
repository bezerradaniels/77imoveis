-- =====================================================================
-- 77IMÓVEIS — Arquivo 04: AJUSTES DE SEGURANÇA (pós-auditoria Supabase)
-- Aplicado no projeto após rodar 01->02->03. Corrige os apontamentos
-- do "Security Advisor".
-- =====================================================================

-- 1) RLS que faltou em duas tabelas
alter table coupons       enable row level security;
alter table site_settings enable row level security;

create policy coupons_admin on coupons for all using (is_admin()) with check (is_admin());

create policy site_settings_read  on site_settings for select using (true);
create policy site_settings_admin on site_settings for all using (is_admin()) with check (is_admin());

-- 2) search_path fixo nas funções (boa prática)
alter function public.set_updated_at()            set search_path = public, extensions;
alter function public.sync_geom()                 set search_path = public, extensions;
alter function public.handle_new_user()           set search_path = public, extensions;
alter function public.enforce_particular_limit()  set search_path = public, extensions;
alter function public.bump_leads_count()          set search_path = public, extensions;
alter function public.properties_within_radius(double precision, double precision, double precision) set search_path = public, extensions;
alter function public.auth_role()                 set search_path = public, extensions;
alter function public.is_admin()                  set search_path = public, extensions;

-- 3) handle_new_user é só gatilho: tirar da API pública
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Observações (avisos restantes, aceitáveis):
--  * spatial_ref_sys: tabela interna do PostGIS, não é possível/necessário ativar RLS.
--  * extensões em "public" (postgis/pg_trgm/unaccent): aviso comum no Supabase, sem risco.
--  * leads_insert / audit_insert com WITH CHECK (true): proposital
--    (qualquer visitante pode enviar um lead; o anti-spam fica na Edge Function).
--  * auth_role()/is_admin() executáveis: necessárias para as políticas RLS.
-- FIM DO ARQUIVO 04_security_fixes.sql
