-- Tabelas já utilizadas pelo código (verificado em src/features/properties)

-- 1. Tabela de Imóveis
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete cascade,
  slug text unique,
  
  -- Informações básicas
  title text not null,
  description text,
  purpose text not null, -- venda, aluguel, temporada
  type text not null, -- casa, apartamento, etc
  status text default 'rascunho', -- rascunho, ativo, inativo
  
  -- Endereço
  state text,
  city text,
  neighborhood text,
  address text,
  cep text,
  
  -- Características
  bedrooms int default 0,
  suites int default 0,
  bathrooms int default 0,
  parking_spots int default 0,
  area_m2 float,
  
  -- Valores
  price float,
  rent float,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz
);

-- 2. Tabela de Fotos dos Imóveis
create table if not exists public.property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  url text not null,
  storage_path text, -- para deletar do bucket depois
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 3. Bucket de Storage (necessário criar no painel do Supabase)
-- Nome: property-photos
-- Acesso: Público

-- 4. Tabela de Perfis (Falta implementar no código para substituir a lógica de e-mail mockado)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text check (role in ('usuario', 'corretor', 'imobiliaria')),
  
  -- Campos específicos de corretor
  creci text, 
  bio text,
  cities text[],        -- Array de cidades atendidas
  specialties text,     -- Texto livre ou array
  experience text,      -- Tempo de experiência
  
  -- Campos específicos de imobiliária (legado ou simples)
  agency_name text, 

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Tabela de Imobiliárias (Agências)
-- Para usuários (donos) cadastrarem suas imobiliárias
create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  creci_pj text,
  cnpj text,
  phone text,
  email text,
  address text,
  city text,
  description text, -- Added
  logo_url text,
  
  created_at timestamptz default now()
);

-- Trigger para criar perfil automaticamente ao cadastrar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'usuario'); -- Default role
  return new;
end;
$$ language plpgsql security definer;

-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();
