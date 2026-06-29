-- 14_property_contact_methods.sql
-- Permite escolher múltiplas formas de contato no anúncio e separa WhatsApp de telefone fixo.

alter table properties
  add column if not exists contact_phone text,
  add column if not exists contact_methods text[] not null default array['whatsapp']::text[];

update properties
set contact_methods = case
  when show_phone = false then array['formulario']::text[]
  when contact_pref in ('whatsapp','telefone','formulario') then array[contact_pref]::text[]
  else array['whatsapp']::text[]
end
where contact_methods = array['whatsapp']::text[]
  and (show_phone = false or contact_pref is distinct from 'whatsapp');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'properties_contact_methods_valid'
      and conrelid = 'properties'::regclass
  ) then
    alter table properties
      add constraint properties_contact_methods_valid
      check (
        cardinality(contact_methods) > 0
        and contact_methods <@ array['whatsapp','telefone','formulario']::text[]
      );
  end if;
end $$;

notify pgrst, 'reload schema';
