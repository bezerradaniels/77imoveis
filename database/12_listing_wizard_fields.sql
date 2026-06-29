-- 12_listing_wizard_fields.sql
-- Campos extras coletados no novo fluxo "Publicar imóvel" (wizard de 9 etapas).
-- Tudo nullable / com default seguro para não exigir backfill nos imóveis já existentes.

alter table properties
  add column if not exists furnished         text    check (furnished is null or furnished in ('sim','nao','parcial')),
  add column if not exists condition         text    check (condition is null or condition in ('novo','usado','em_construcao','reformado')),
  add column if not exists availability       text    not null default 'disponivel' check (availability in ('disponivel','reservado','vendido','alugado')),
  add column if not exists condo_name         text,
  add column if not exists negotiable         boolean not null default true,
  add column if not exists video_url          text,
  add column if not exists tour_url           text,
  add column if not exists short_description  text,
  -- Contato do anúncio (gera o botão de WhatsApp e o formulário na página do imóvel).
  add column if not exists contact_name       text,
  add column if not exists contact_company    text,
  add column if not exists contact_whatsapp   text,
  add column if not exists contact_phone      text,
  add column if not exists contact_email      text,
  add column if not exists contact_methods    text[]  not null default array['whatsapp']::text[] check (
    cardinality(contact_methods) > 0 and contact_methods <@ array['whatsapp','telefone','formulario']::text[]
  ),
  add column if not exists contact_pref       text    default 'whatsapp' check (contact_pref is null or contact_pref in ('whatsapp','formulario','telefone')),
  add column if not exists show_phone         boolean not null default true,
  add column if not exists lead_email         text;
