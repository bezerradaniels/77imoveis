-- =====================================================================
-- 77IMÓVEIS — Arquivo 09: CÓDIGO PÚBLICO ÚNICO POR ANÚNCIO
-- Mantém slugs legíveis com o nome do imóvel, mas adiciona um código
-- estável para evitar duplicidade e resolver URLs com segurança.
-- Aplicar após 08.
-- =====================================================================

update properties
   set reference_code = 'IMV-' || upper(substr(replace(id::text, '-', ''), 1, 8))
 where reference_code is null
    or reference_code = '';

create unique index if not exists properties_reference_code_key
  on properties (reference_code);

update properties
   set slug = regexp_replace(slug, '-imv-[a-z0-9]+$', '') || '-' || lower(reference_code)
 where reference_code is not null
   and slug !~* '-imv-[a-z0-9]+$';

-- FIM DO ARQUIVO 09_property_public_codes.sql
