-- =====================================================================
-- 77IMÓVEIS — Esquema do banco de dados (PostgreSQL / Supabase)
-- Arquivo 01: ESTRUTURA (tabelas, enums, índices)
-- Mercado: DDD 77 — Bahia, Brasil  |  Idioma do conteúdo: pt-BR
-- =====================================================================
-- Ordem de execução no Supabase SQL Editor:
--   01_schema.sql  ->  02_rls.sql  ->  03_seed.sql
-- =====================================================================

-- Extensões necessárias --------------------------------------------------
create extension if not exists "uuid-ossp";   -- uuid_generate_v4()
create extension if not exists "pg_trgm";      -- autocomplete (cidade/bairro)
create extension if not exists "postgis";      -- busca por raio no mapa
create extension if not exists "unaccent";     -- busca ignorando acentos

create or replace function normalize_location_name(value text)
returns text
language sql
immutable
as $$
  select trim(regexp_replace(lower(unaccent(coalesce(value, ''))), '[^a-z0-9]+', ' ', 'g'));
$$;

create or replace function slugify_location_name(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(unaccent(coalesce(value, ''))), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function set_location_identity()
returns trigger
language plpgsql
as $$
begin
  new.name = trim(regexp_replace(new.name, '\s+', ' ', 'g'));
  new.normalized_name = normalize_location_name(new.name);
  if new.slug is null or btrim(new.slug) = '' then
    new.slug = slugify_location_name(new.name);
  else
    new.slug = slugify_location_name(new.slug);
  end if;
  return new;
end;
$$;

create or replace function ensure_neighborhood_matches_city()
returns trigger
language plpgsql
as $$
declare
  hood_city_id uuid;
begin
  if new.neighborhood_id is null then
    return new;
  end if;

  select city_id into hood_city_id
  from neighborhoods
  where id = new.neighborhood_id;

  if hood_city_id is null or hood_city_id is distinct from new.city_id then
    raise exception 'NEIGHBORHOOD_CITY_MISMATCH'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

-- =====================================================================
-- 1. TIPOS / ENUMS
-- =====================================================================

create type user_role          as enum ('particular', 'profissional', 'admin', 'moderador');
create type company_type        as enum (
  'imobiliaria', 'corretor_autonomo', 'construtora', 'engenharia_civil',
  'arquitetura', 'topografia', 'incorporadora', 'material_construcao',
  'energia_solar', 'seguranca', 'financiamento', 'pintura', 'pedreiro',
  'eletrica', 'hidraulica', 'outro'
);
create type listing_status      as enum ('rascunho', 'ativo', 'pausado', 'arquivado', 'em_moderacao', 'reprovado');
create type negotiation_type    as enum ('venda', 'aluguel', 'temporada', 'lancamento');
create type price_visibility    as enum ('publico', 'sob_consulta');
create type lead_status         as enum ('novo', 'em_contato', 'visita', 'proposta', 'fechado', 'perdido');
create type lead_channel        as enum ('formulario', 'whatsapp', 'telefone', 'ligacao');
create type plan_interval       as enum ('mensal', 'anual', 'unico');
create type subscription_status as enum ('ativa', 'pendente', 'inadimplente', 'cancelada', 'trial');
create type payment_status      as enum ('pendente', 'pago', 'estornado', 'falhou', 'cancelado');
create type payment_method      as enum ('pix', 'boleto', 'cartao_credito');
create type banner_slot         as enum ('home_topo', 'home_meio', 'busca_lateral', 'busca_lista', 'imovel_rodape', 'empresa_pagina', 'blog');
create type feature_status      as enum ('ativo', 'expirado', 'pendente_pagamento');

-- =====================================================================
-- 2. LOCALIZAÇÃO (cidades e bairros do DDD 77)
-- =====================================================================

create table cities (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,                 -- "Vitória da Conquista"
  normalized_name text not null,               -- "vitoria da conquista"
  slug          text not null unique,          -- "vitoria-da-conquista"
  state         char(2) not null default 'BA',
  ddd           smallint not null default 77,
  ibge_code     text,
  latitude      double precision,
  longitude     double precision,
  geom          geography(Point, 4326),        -- gerado a partir de lat/lng
  is_featured   boolean not null default false,-- destaque na home/marketing
  population     integer,
  -- SEO
  seo_title       text,
  seo_description  text,
  intro_text      text,                        -- texto de autoridade tópica (GEO)
  created_at    timestamptz not null default now(),
  unique (state, normalized_name)
);
create index idx_cities_slug      on cities (slug);
create index idx_cities_name_trgm on cities using gin (name gin_trgm_ops);
create index idx_cities_geom      on cities using gist (geom);
create trigger trg_cities_identity before insert or update of name, slug
on cities for each row execute function set_location_identity();

create table neighborhoods (
  id          uuid primary key default uuid_generate_v4(),
  city_id     uuid not null references cities(id) on delete cascade,
  name        text not null,                   -- "Centro"
  normalized_name text not null,               -- "centro"
  slug        text not null,                   -- "centro"
  latitude    double precision,
  longitude   double precision,
  geom        geography(Point, 4326),
  seo_title       text,
  seo_description  text,
  created_at  timestamptz not null default now(),
  unique (city_id, normalized_name),
  unique (city_id, slug)
);
create index idx_neigh_city      on neighborhoods (city_id);
create index idx_neigh_name_trgm on neighborhoods using gin (name gin_trgm_ops);
create trigger trg_neighborhoods_identity before insert or update of name, slug
on neighborhoods for each row execute function set_location_identity();

-- =====================================================================
-- 3. USUÁRIOS E EMPRESAS
-- =====================================================================
-- Os usuários de autenticação ficam em auth.users (Supabase).
-- profiles estende auth.users com dados públicos do app.

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null default 'particular',
  role_intent text check (role_intent in ('particular','profissional')),
  role_choice_made_at timestamptz,
  full_name   text,
  email       text,
  phone       text,
  whatsapp    text,
  avatar_url  text,
  city_id     uuid references cities(id),
  -- limite de anúncios para PARTICULAR é 1 (regra de negócio no app + trigger)
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table companies (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid not null references profiles(id) on delete cascade,
  type          company_type not null,
  legal_name    text,                          -- razão social
  trade_name    text not null,                 -- nome fantasia (exibido)
  slug          text not null unique,
  cnpj          text,
  creci         text,                          -- registro de corretor/imobiliária
  description   text,
  logo_url      text,
  cover_url     text,
  email         text,
  phone         text,
  whatsapp      text,
  website       text,
  instagram     text,
  facebook      text,
  business_hours jsonb,                         -- {"seg":"08:00-18:00", ...}
  address       text,
  city_id       uuid references cities(id),
  neighborhood_id uuid references neighborhoods(id),
  is_verified   boolean not null default false, -- selo verificado (admin)
  is_featured   boolean not null default false, -- empresa em destaque (pago)
  featured_until timestamptz,
  -- SEO
  seo_title       text,
  seo_description  text,
  status        text not null default 'ativo',  -- ativo/pausado/bloqueado
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_companies_owner on companies (owner_id);
create index idx_companies_type  on companies (type);
create index idx_companies_city  on companies (city_id);
create index idx_companies_slug  on companies (slug);
create trigger trg_companies_neighborhood_city
before insert or update of city_id, neighborhood_id on companies
for each row execute function ensure_neighborhood_matches_city();

-- Cidades de atuação da empresa (N:N) ----------------------------------
create table company_cities (
  company_id uuid references companies(id) on delete cascade,
  city_id    uuid references cities(id) on delete cascade,
  primary key (company_id, city_id)
);

-- Especialidades da empresa (texto livre normalizado) ------------------
create table specialties (
  id   uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique
);
create table company_specialties (
  company_id   uuid references companies(id) on delete cascade,
  specialty_id uuid references specialties(id) on delete cascade,
  primary key (company_id, specialty_id)
);

-- Corretores vinculados a uma imobiliária ------------------------------
create table brokers (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references companies(id) on delete cascade,
  profile_id  uuid references profiles(id),
  name        text not null,
  creci       text,
  phone       text,
  whatsapp    text,
  photo_url   text,
  created_at  timestamptz not null default now()
);

-- =====================================================================
-- 4. TABELAS NORMALIZADAS DE CATÁLOGO DO IMÓVEL
-- =====================================================================

create table property_types (              -- Casa, Apartamento, Terreno...
  id    uuid primary key default uuid_generate_v4(),
  name  text not null unique,
  slug  text not null unique,
  icon  text,
  sort  smallint not null default 0
);

create table availabilities (              -- À venda, Para aluguel, Lançamento...
  id    uuid primary key default uuid_generate_v4(),
  name  text not null unique,
  slug  text not null unique,
  sort  smallint not null default 0
);

create table features (                    -- Piscina, Churrasqueira, Aceita pet...
  id        uuid primary key default uuid_generate_v4(),
  name      text not null unique,
  slug      text not null unique,
  category  text,                          -- lazer / seguranca / proximidades / acessibilidade
  icon      text
);

-- =====================================================================
-- 5. IMÓVEIS (anúncios)
-- =====================================================================

create table properties (
  id              uuid primary key default uuid_generate_v4(),
  owner_id        uuid not null references profiles(id) on delete cascade,
  company_id      uuid references companies(id) on delete set null,
  broker_id       uuid references brokers(id) on delete set null,

  title           text not null,
  slug            text not null unique,         -- "casa-3-quartos-bairro-recreio-vitoria-da-conquista"
  description     text,
  reference_code  text unique,                  -- código público único do anúncio (ex.: IMV-8C7CC360)

  property_type_id uuid not null references property_types(id),
  negotiation     negotiation_type not null,    -- venda/aluguel/temporada/lancamento

  -- Localização
  city_id         uuid not null references cities(id),
  neighborhood_id uuid references neighborhoods(id),
  street          text,
  number          text,
  complement      text,
  zipcode         text,
  latitude        double precision,
  longitude       double precision,
  geom            geography(Point, 4326),
  hide_exact_location boolean not null default false,  -- mostra só o bairro no mapa

  -- Informações básicas
  bedrooms        smallint default 0,
  suites          smallint default 0,
  bathrooms       smallint default 0,
  garages         smallint default 0,
  built_area      numeric(10,2),                -- m² construído
  land_area       numeric(12,2),                -- m² terreno
  floor           smallint,                     -- andar
  total_floors    smallint,

  -- Preços
  price_visibility price_visibility not null default 'publico',
  price           numeric(14,2),                -- valor de venda OU aluguel mensal
  condo_fee       numeric(12,2),                -- condomínio
  iptu            numeric(12,2),                -- IPTU (anual)
  accepts_financing boolean default true,
  accepts_mcmv      boolean not null default false, -- Minha Casa Minha Vida
  accepts_exchange  boolean default false,      -- aceita permuta

  -- Estado do anúncio
  status          listing_status not null default 'rascunho',
  is_featured     boolean not null default false,
  featured_until  timestamptz,
  views_count     integer not null default 0,
  leads_count     integer not null default 0,

  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_prop_status      on properties (status);
create index idx_prop_owner       on properties (owner_id);
create index idx_prop_company     on properties (company_id);
create index idx_prop_city        on properties (city_id);
create index idx_prop_neigh       on properties (neighborhood_id);
create index idx_prop_type        on properties (property_type_id);
create index idx_prop_negotiation on properties (negotiation);
create index idx_prop_price       on properties (price);
create index idx_prop_geom        on properties using gist (geom);
-- busca textual title+description ignorando acento:
create index idx_prop_search on properties using gin (
  to_tsvector('portuguese', coalesce(title,'') || ' ' || coalesce(description,''))
);
create trigger trg_properties_neighborhood_city
before insert or update of city_id, neighborhood_id on properties
for each row execute function ensure_neighborhood_matches_city();

-- Fotos do imóvel (1:N, ordenadas) -------------------------------------
create table property_images (
  id          uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties(id) on delete cascade,
  url         text not null,
  alt         text,                             -- texto alternativo (SEO/acessibilidade)
  sort        smallint not null default 0,
  is_cover    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index idx_prop_images on property_images (property_id);

-- Características do imóvel (N:N normalizado) ---------------------------
create table property_features (
  property_id uuid references properties(id) on delete cascade,
  feature_id  uuid references features(id) on delete cascade,
  primary key (property_id, feature_id)
);

-- Disponibilidades aplicadas ao imóvel (N:N) ---------------------------
create table property_availabilities (
  property_id     uuid references properties(id) on delete cascade,
  availability_id uuid references availabilities(id) on delete cascade,
  primary key (property_id, availability_id)
);

-- Favoritos ------------------------------------------------------------
create table favorites (
  profile_id  uuid references profiles(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (profile_id, property_id)
);

-- =====================================================================
-- 6. LEADS (contatos recebidos)
-- =====================================================================

create table leads (
  id           uuid primary key default uuid_generate_v4(),
  property_id  uuid references properties(id) on delete set null,
  company_id   uuid references companies(id) on delete set null,
  owner_id     uuid references profiles(id) on delete set null, -- quem recebe
  name         text not null,
  email        text,
  phone        text,
  message      text,
  channel      lead_channel not null default 'formulario',
  status       lead_status not null default 'novo',
  -- anti-spam / auditoria
  ip_address   inet,
  user_agent   text,
  created_at   timestamptz not null default now()
);
create index idx_leads_property on leads (property_id);
create index idx_leads_owner    on leads (owner_id);
create index idx_leads_company  on leads (company_id);
create index idx_leads_status   on leads (status);

-- =====================================================================
-- 7. MONETIZAÇÃO (planos, assinaturas, pagamentos, destaques, banners)
-- =====================================================================

create table plans (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,                -- "Gratuito", "Profissional 50", ...
  slug            text not null unique,
  audience        text not null default 'b2b',  -- b2c / b2b
  max_active_listings integer not null,         -- limite de imóveis ativos
  price           numeric(12,2) not null default 0,
  interval        plan_interval not null default 'mensal',
  included_featured smallint not null default 0,-- destaques inclusos/mês
  highlight       boolean not null default false,-- "mais popular"
  benefits        jsonb,                         -- ["Selo verificado", ...]
  is_active       boolean not null default true,
  sort            smallint not null default 0,
  created_at      timestamptz not null default now()
);

create table subscriptions (
  id              uuid primary key default uuid_generate_v4(),
  company_id      uuid not null references companies(id) on delete cascade,
  plan_id         uuid not null references plans(id),
  status          subscription_status not null default 'trial',
  -- referência no gateway (Asaas / Mercado Pago / Stripe)
  gateway         text not null default 'asaas',
  gateway_customer_id text,
  gateway_subscription_id text,
  current_period_start timestamptz,
  current_period_end   timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_subs_company on subscriptions (company_id);

create table payments (
  id              uuid primary key default uuid_generate_v4(),
  company_id      uuid references companies(id) on delete set null,
  subscription_id uuid references subscriptions(id) on delete set null,
  description     text,
  amount          numeric(12,2) not null,
  method          payment_method,
  status          payment_status not null default 'pendente',
  gateway         text not null default 'asaas',
  gateway_payment_id text,
  pix_qr_code     text,
  boleto_url      text,
  invoice_url     text,
  paid_at         timestamptz,
  created_at      timestamptz not null default now()
);
create index idx_payments_company on payments (company_id);
create index idx_payments_status  on payments (status);

-- Destaque avulso de imóvel (pago por anúncio) -------------------------
create table listing_features (
  id           uuid primary key default uuid_generate_v4(),
  property_id  uuid not null references properties(id) on delete cascade,
  payment_id   uuid references payments(id),
  days         smallint not null,               -- 7 / 15 / 30
  amount       numeric(12,2) not null,
  status       feature_status not null default 'pendente_pagamento',
  starts_at    timestamptz,
  ends_at      timestamptz,
  created_at   timestamptz not null default now()
);

create table coupons (
  id          uuid primary key default uuid_generate_v4(),
  code        text not null unique,
  description text,
  discount_type text not null default 'percent', -- percent / fixed
  discount_value numeric(12,2) not null,
  max_uses    integer,
  used_count  integer not null default 0,
  valid_until timestamptz,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table banners (
  id          uuid primary key default uuid_generate_v4(),
  title       text,
  image_url   text not null,
  target_url  text not null,
  slot        banner_slot not null,
  city_id     uuid references cities(id),        -- segmentação opcional por cidade
  is_active   boolean not null default true,
  starts_at   timestamptz,
  ends_at     timestamptz,
  impressions integer not null default 0,
  clicks      integer not null default 0,
  created_at  timestamptz not null default now()
);
create index idx_banners_slot on banners (slot) where is_active;

-- =====================================================================
-- 8. CMS / BLOG / SEO
-- =====================================================================

create table blog_categories (
  id   uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique
);

create table blog_posts (
  id           uuid primary key default uuid_generate_v4(),
  category_id  uuid references blog_categories(id),
  author_id    uuid references profiles(id),
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  content      text,                            -- markdown/HTML
  cover_url    text,
  -- SEO/GEO
  seo_title       text,
  seo_description  text,
  faq          jsonb,                            -- [{q,a}] -> JSON-LD FAQPage
  is_published boolean not null default false,
  published_at timestamptz,
  views_count  integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index idx_blog_published on blog_posts (is_published, published_at desc);

-- Páginas de SEO geradas/dinâmicas (landing por cidade+tipo etc.) ------
create table seo_pages (
  id           uuid primary key default uuid_generate_v4(),
  path         text not null unique,            -- "/imoveis/vitoria-da-conquista/casas"
  title        text,
  meta_description text,
  h1           text,
  intro_html   text,
  faq          jsonb,
  is_indexable boolean not null default true,
  updated_at   timestamptz not null default now()
);

-- =====================================================================
-- 9. ADMIN / AUDITORIA / MODERAÇÃO
-- =====================================================================

create table moderation_queue (
  id           uuid primary key default uuid_generate_v4(),
  entity_type  text not null,                   -- property / company / review
  entity_id    uuid not null,
  reason       text,
  status       text not null default 'pendente',-- pendente/aprovado/reprovado
  reviewed_by  uuid references profiles(id),
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);

create table audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  actor_id    uuid references profiles(id),
  action      text not null,                    -- "property.update", "user.ban"...
  entity_type text,
  entity_id   uuid,
  metadata    jsonb,
  ip_address  inet,
  created_at  timestamptz not null default now()
);
create index idx_audit_actor on audit_logs (actor_id);

create table site_settings (
  key   text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 10. TRIGGERS E FUNÇÕES DE APOIO
-- =====================================================================

-- 10.1 updated_at automático
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_profiles_updated   before update on profiles    for each row execute function set_updated_at();
create trigger trg_companies_updated   before update on companies   for each row execute function set_updated_at();
create trigger trg_properties_updated  before update on properties  for each row execute function set_updated_at();
create trigger trg_subs_updated        before update on subscriptions for each row execute function set_updated_at();
create trigger trg_blog_updated        before update on blog_posts  for each row execute function set_updated_at();

-- 10.2 geom a partir de lat/lng
create or replace function sync_geom() returns trigger as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.geom = ST_SetSRID(ST_MakePoint(new.longitude, new.latitude), 4326)::geography;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_cities_geom   before insert or update on cities        for each row execute function sync_geom();
create trigger trg_neigh_geom    before insert or update on neighborhoods for each row execute function sync_geom();
create trigger trg_prop_geom     before insert or update on properties    for each row execute function sync_geom();

-- 10.3 cria profile automaticamente quando um usuário se cadastra
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone, whatsapp, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'whatsapp', new.raw_user_meta_data->>'phone'),
    'particular'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 10.4 REGRA DE NEGÓCIO: PARTICULAR só pode ter 1 imóvel ATIVO
--      Ao tentar ativar o 2º, o app deve oferecer a migração para B2B.
create or replace function enforce_particular_limit() returns trigger as $$
declare
  v_role       user_role;
  active_count integer;
begin
  if new.status = 'ativo' then
    select role into v_role from profiles where id = new.owner_id;
    if v_role = 'particular' then
      select count(*) into active_count
        from properties
       where owner_id = new.owner_id and status = 'ativo' and id <> new.id;
      if active_count >= 1 then
        raise exception 'LIMITE_PARTICULAR: Conta Particular permite apenas 1 imóvel ativo. Migre para um plano profissional (B2B).';
      end if;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_particular_limit
  before insert or update of status on properties
  for each row execute function enforce_particular_limit();

-- 10.5 contador de leads no imóvel
create or replace function bump_leads_count() returns trigger as $$
begin
  if new.property_id is not null then
    update properties set leads_count = leads_count + 1 where id = new.property_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_leads_count after insert on leads
  for each row execute function bump_leads_count();

-- =====================================================================
-- 11. FUNÇÃO DE BUSCA POR RAIO (mapa)  — usada pelo app
-- =====================================================================
create or replace function properties_within_radius(
  center_lat double precision,
  center_lng double precision,
  radius_km  double precision
) returns setof properties as $$
  select *
    from properties
   where status = 'ativo'
     and geom is not null
     and ST_DWithin(
           geom,
           ST_SetSRID(ST_MakePoint(center_lng, center_lat),4326)::geography,
           radius_km * 1000
         );
$$ language sql stable;

-- FIM DO ARQUIVO 01_schema.sql
