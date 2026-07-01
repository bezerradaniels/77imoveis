-- 77IMOVEIS - Migracao 21: backup de referencias de imagens migradas para WebP

create table if not exists image_migration_backup (
  id uuid primary key default uuid_generate_v4(),
  table_name text not null,
  record_id text not null,
  column_name text not null,
  old_value text not null,
  new_value text,
  migrated_at timestamptz not null default now()
);

create index if not exists idx_image_migration_backup_lookup
  on image_migration_backup (table_name, record_id, column_name, migrated_at desc);

alter table image_migration_backup enable row level security;
