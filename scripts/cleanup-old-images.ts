import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { IMAGE_BUCKET } from '../lib/images/config';
import { storagePathFromPublicUrl } from '../lib/images/deleteStorageImage';

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
    .order('migrated_at', { ascending: true });

  if (error) throw new Error(error.message);
  console.log(execute ? 'EXECUTE: removendo originais antigos do Storage.' : 'DRY-RUN: nenhum arquivo sera removido.');

  let removable = 0;
  let removed = 0;
  let skipped = 0;
  for (const row of data ?? []) {
    const item = row as any;
    const idColumn = idColumns[item.table_name];
    const oldPath = storagePathFromPublicUrl(item.old_value, IMAGE_BUCKET);
    if (!idColumn || !oldPath) {
      skipped += 1;
      continue;
    }

    const { data: current, error: currentError } = await supabase
      .from(item.table_name)
      .select(item.column_name)
      .eq(idColumn, item.record_id)
      .maybeSingle();
    if (currentError || !current || (current as any)[item.column_name] === item.old_value) {
      skipped += 1;
      console.warn(`[skip] ${oldPath}: ainda em uso, registro ausente ou erro de leitura.`);
      continue;
    }

    removable += 1;
    if (!execute) {
      console.log(`[dry-run] removeria ${oldPath}`);
      continue;
    }

    const { error: removeError } = await supabase.storage.from(IMAGE_BUCKET).remove([oldPath]);
    if (removeError) {
      skipped += 1;
      console.error(`[erro] ${oldPath}: ${removeError.message}`);
      continue;
    }
    removed += 1;
    console.log(`[ok] removido ${oldPath}`);
  }

  console.log(`\nRemoviveis: ${removable}`);
  console.log(`Removidos: ${removed}`);
  console.log(`Ignorados: ${skipped}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
