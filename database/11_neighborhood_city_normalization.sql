-- =====================================================================
-- 77IMÓVEIS — Arquivo 11: normalização cidade/bairro
-- Garante que bairros sejam únicos dentro da cidade, não globalmente.
-- =====================================================================

create extension if not exists "unaccent";

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

alter table cities add column if not exists normalized_name text;
alter table neighborhoods add column if not exists normalized_name text;

update cities
set
  name = trim(regexp_replace(name, '\s+', ' ', 'g')),
  normalized_name = normalize_location_name(name),
  slug = slugify_location_name(slug)
where normalized_name is null
   or normalized_name <> normalize_location_name(name)
   or slug <> slugify_location_name(slug)
   or name <> trim(regexp_replace(name, '\s+', ' ', 'g'));

update neighborhoods
set
  name = trim(regexp_replace(name, '\s+', ' ', 'g')),
  normalized_name = normalize_location_name(name),
  slug = slugify_location_name(slug)
where normalized_name is null
   or normalized_name <> normalize_location_name(name)
   or slug <> slugify_location_name(slug)
   or name <> trim(regexp_replace(name, '\s+', ' ', 'g'));

-- Consolida cidades duplicadas por estado + nome normalizado.
with ranked as (
  select
    id,
    first_value(id) over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as rn
  from cities
),
dupes as (
  select id, keep_id
  from ranked
  where rn > 1
)
update profiles p
set city_id = d.keep_id
from dupes d
where p.city_id = d.id;

with ranked as (
  select
    id,
    first_value(id) over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as rn
  from cities
),
dupes as (
  select id, keep_id
  from ranked
  where rn > 1
)
update companies c
set city_id = d.keep_id
from dupes d
where c.city_id = d.id;

with ranked as (
  select
    id,
    first_value(id) over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as rn
  from cities
),
dupes as (
  select id, keep_id
  from ranked
  where rn > 1
)
update properties p
set city_id = d.keep_id
from dupes d
where p.city_id = d.id;

with ranked as (
  select
    id,
    first_value(id) over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as rn
  from cities
),
dupes as (
  select id, keep_id
  from ranked
  where rn > 1
)
update neighborhoods n
set city_id = d.keep_id
from dupes d
where n.city_id = d.id;

with ranked as (
  select
    id,
    first_value(id) over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as rn
  from cities
),
dupes as (
  select id, keep_id
  from ranked
  where rn > 1
)
update banners b
set city_id = d.keep_id
from dupes d
where b.city_id = d.id;

with ranked as (
  select
    id,
    first_value(id) over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as rn
  from cities
),
dupes as (
  select id, keep_id
  from ranked
  where rn > 1
)
insert into company_cities (company_id, city_id)
select cc.company_id, d.keep_id
from company_cities cc
join dupes d on d.id = cc.city_id
on conflict do nothing;

with ranked as (
  select
    id,
    first_value(id) over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as rn
  from cities
),
dupes as (
  select id, keep_id
  from ranked
  where rn > 1
)
delete from company_cities cc
using dupes d
where cc.city_id = d.id;

with ranked as (
  select
    id,
    first_value(id) over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by state, normalized_name
      order by is_featured desc, population desc nulls last, created_at asc, id asc
    ) as rn
  from cities
),
dupes as (
  select id, keep_id
  from ranked
  where rn > 1
)
delete from cities c
using dupes d
where c.id = d.id;

-- Consolida bairros duplicados dentro da mesma cidade.
with ranked as (
  select
    id,
    first_value(id) over (
      partition by city_id, normalized_name
      order by created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by city_id, normalized_name
      order by created_at asc, id asc
    ) as rn
  from neighborhoods
),
dupes as (
  select id, keep_id
  from ranked
  where rn > 1
)
update properties p
set neighborhood_id = d.keep_id
from dupes d
where p.neighborhood_id = d.id;

with ranked as (
  select
    id,
    first_value(id) over (
      partition by city_id, normalized_name
      order by created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by city_id, normalized_name
      order by created_at asc, id asc
    ) as rn
  from neighborhoods
),
dupes as (
  select id, keep_id
  from ranked
  where rn > 1
)
update companies c
set neighborhood_id = d.keep_id
from dupes d
where c.neighborhood_id = d.id;

with ranked as (
  select
    id,
    first_value(id) over (
      partition by city_id, normalized_name
      order by created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by city_id, normalized_name
      order by created_at asc, id asc
    ) as rn
  from neighborhoods
),
dupes as (
  select id, keep_id
  from ranked
  where rn > 1
)
delete from neighborhoods n
using dupes d
where n.id = d.id;

-- Corrige relações antigas em que o bairro não pertence à cidade do registro.
update properties p
set neighborhood_id = matched.id
from neighborhoods current_hood
join neighborhoods matched
  on matched.normalized_name = current_hood.normalized_name
where p.neighborhood_id = current_hood.id
  and current_hood.city_id is distinct from p.city_id
  and matched.city_id = p.city_id;

update properties p
set neighborhood_id = null
from neighborhoods current_hood
where p.neighborhood_id = current_hood.id
  and current_hood.city_id is distinct from p.city_id;

update companies c
set neighborhood_id = matched.id
from neighborhoods current_hood
join neighborhoods matched
  on matched.normalized_name = current_hood.normalized_name
where c.neighborhood_id = current_hood.id
  and current_hood.city_id is distinct from c.city_id
  and matched.city_id = c.city_id;

update companies c
set neighborhood_id = null
from neighborhoods current_hood
where c.neighborhood_id = current_hood.id
  and current_hood.city_id is distinct from c.city_id;

alter table cities alter column normalized_name set not null;
alter table neighborhoods alter column normalized_name set not null;

alter table cities
  drop constraint if exists cities_state_normalized_name_key,
  add constraint cities_state_normalized_name_key unique (state, normalized_name);

alter table neighborhoods
  drop constraint if exists neighborhoods_city_id_normalized_name_key,
  add constraint neighborhoods_city_id_normalized_name_key unique (city_id, normalized_name);

drop trigger if exists trg_cities_identity on cities;
create trigger trg_cities_identity before insert or update of name, slug
on cities for each row execute function set_location_identity();

drop trigger if exists trg_neighborhoods_identity on neighborhoods;
create trigger trg_neighborhoods_identity before insert or update of name, slug
on neighborhoods for each row execute function set_location_identity();

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

drop trigger if exists trg_properties_neighborhood_city on properties;
create trigger trg_properties_neighborhood_city
before insert or update of city_id, neighborhood_id on properties
for each row execute function ensure_neighborhood_matches_city();

drop trigger if exists trg_companies_neighborhood_city on companies;
create trigger trg_companies_neighborhood_city
before insert or update of city_id, neighborhood_id on companies
for each row execute function ensure_neighborhood_matches_city();
