import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });
config();

const execute = process.argv.includes('--execute');

const idColumns: Record<string, string> = {
  property_images: 'id',
  profiles: 'id',
  companies: 'id',
  brokers: 'id',
  storefronts: 'id',
  banners: 'id',
  blog_posts: 'id',
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Defina ${name} no .env.local.`);
  return value;
}

async function main() {
  const supabase: any = createClient(requiredEnv('NEXT_PUBLIC_SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase
    .from('image_migration_backup')
    .select('*')
    .not('new_value', 'is', null)
    .order('migrated_at', { ascending: false });

  if (error) throw new Error(error.message);
  console.log(execute ? 'EXECUTE: restaurando referencias antigas.' : 'DRY-RUN: nenhuma referencia sera alterada.');

  let restored = 0;
  let skipped = 0;
  for (const row of data ?? []) {
    const item = row as any;
    const idColumn = idColumns[item.table_name];
    if (!idColumn) {
      skipped += 1;
      console.warn(`[skip] tabela sem mapeamento: ${item.table_name}`);
      continue;
    }
    if (!execute) {
      console.log(`[dry-run] ${item.table_name}.${item.column_name} ${item.record_id}: ${item.new_value} -> ${item.old_value}`);
      continue;
    }
    const { data: updated, error: updateError } = await supabase
      .from(item.table_name)
      .update({ [item.column_name]: item.old_value })
      .eq(idColumn, item.record_id)
      .eq(item.column_name, item.new_value)
      .select(idColumn);
    if (updateError) {
      skipped += 1;
      console.error(`[erro] ${item.table_name}.${item.column_name} ${item.record_id}: ${updateError.message}`);
      continue;
    }
    if (!updated?.length) {
      skipped += 1;
      console.warn(`[skip] ${item.table_name}.${item.column_name} ${item.record_id}: valor atual nao bate com o backup.`);
      continue;
    }
    restored += 1;
    console.log(`[ok] ${item.table_name}.${item.column_name} ${item.record_id}`);
  }

  console.log(`\nRestaurados: ${restored}`);
  console.log(`Ignorados: ${skipped}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
