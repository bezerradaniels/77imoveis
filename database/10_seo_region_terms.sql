-- =====================================================================
-- 77IMÓVEIS — Arquivo 10: termos públicos de região (SEO/GEO)
-- Troca o jargão interno "DDD 77" / "região 77" pelo termo público
-- "Oeste da Bahia" nos campos de texto que aparecem para o usuário.
-- O app já sanitiza isso em tempo de render; esta migração apenas
-- limpa os dados na origem. É idempotente (seguro rodar várias vezes).
-- Ordem: rodar depois de 03_seed.sql.
-- =====================================================================

-- Cidades: descrição de SEO + texto de autoridade tópica (intro_text).
update cities set
  seo_description = replace(replace(replace(replace(
      seo_description,
      'da região do DDD 77', 'do Oeste da Bahia'),
      'na região do DDD 77', 'no Oeste da Bahia'),
      'região do DDD 77',    'região do Oeste da Bahia'),
      'DDD 77',              'Oeste da Bahia'),
  intro_text = replace(replace(replace(replace(
      intro_text,
      'da região do DDD 77', 'do Oeste da Bahia'),
      'na região do DDD 77', 'no Oeste da Bahia'),
      'região do DDD 77',    'região do Oeste da Bahia'),
      'DDD 77',              'Oeste da Bahia')
where seo_description ilike '%DDD 77%' or intro_text ilike '%DDD 77%';

-- Empresas: textos públicos (descrição + SEO).
update companies set
  description = replace(replace(replace(replace(
      description,
      'da região do DDD 77', 'do Oeste da Bahia'),
      'na região do DDD 77', 'no Oeste da Bahia'),
      'região do DDD 77',    'região do Oeste da Bahia'),
      'DDD 77',              'Oeste da Bahia'),
  seo_description = replace(replace(replace(replace(
      seo_description,
      'da região do DDD 77', 'do Oeste da Bahia'),
      'na região do DDD 77', 'no Oeste da Bahia'),
      'região do DDD 77',    'região do Oeste da Bahia'),
      'DDD 77',              'Oeste da Bahia')
where description ilike '%DDD 77%' or seo_description ilike '%DDD 77%';

-- Vitrines (storefronts): título e "sobre".
update storefronts set
  about = replace(replace(replace(replace(
      about,
      'da região do DDD 77', 'do Oeste da Bahia'),
      'na região do DDD 77', 'no Oeste da Bahia'),
      'região do DDD 77',    'região do Oeste da Bahia'),
      'DDD 77',              'Oeste da Bahia'),
  headline = replace(headline, 'DDD 77', 'Oeste da Bahia')
where about ilike '%DDD 77%' or headline ilike '%DDD 77%';

-- Imóveis: título e descrição dos anúncios.
update properties set
  title = replace(title, 'DDD 77', 'Oeste da Bahia'),
  description = replace(replace(replace(replace(
      description,
      'da região do DDD 77', 'do Oeste da Bahia'),
      'na região do DDD 77', 'no Oeste da Bahia'),
      'região do DDD 77',    'região do Oeste da Bahia'),
      'DDD 77',              'Oeste da Bahia')
where title ilike '%DDD 77%' or description ilike '%DDD 77%';
