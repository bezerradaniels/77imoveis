-- =====================================================================
-- 77IMÓVEIS — Migração 15: Define daniel.ddsb@gmail.com como admin
-- =====================================================================

update public.profiles
set role = 'admin'
where email = 'daniel.ddsb@gmail.com';
