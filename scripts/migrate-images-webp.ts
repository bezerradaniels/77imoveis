import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { IMAGE_BUCKET, type ImageUploadContext } from '../lib/images/config';
import { storagePathFromPublicUrl } from '../lib/images/deleteStorageImage';
import { optimizeImageToWebP } from '../lib/images/optimizeImage';
import { uploadOptimizedImageToSupabase } from '../lib/images/uploadOptimizedImage';

config({ path: '.env.local' });
config();

type ImageColumn = {
  table: string;
  idColumn: string;
  column: string;
  context: ImageUploadContext;
};

const IMAGE_COLUMNS: ImageColumn[] = [
  { table: 'property_images', idColumn: 'id', column: 'url', context: 'property' },
  { table: 'profiles', idColumn: 'id', column: 'avatar_url', context: 'avatar' },
  { table: 'companies', idColumn: 'id', column: 'logo_url', context: 'logo' },
  { table: 'companies', idColumn: 'id', column: 'cover_url', context: 'companyCover' },
  { table: 'brokers', idColumn: 'id', column: 'photo_url', context: 'broker' },
  { table: 'storefronts', idColumn: 'id', column: 'logo_url', context: 'logo' },
  { table: 'storefronts', idColumn: 'id', column: 'cover_url', context: 'storefrontCover' },
  { table: 'banners', idColumn: 'id', column: 'image_url', context: 'banner' },
  { table: 'blog_posts', idColumn: 'id', column: 'cover_url', context: 'blogCover' },
];

const execute = process.argv.includes('--execute');
const dryRun = !execute;

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Defina ${name} no .env.local.`);
  return value;
}

function isWebP(ref: string) {
  return /\.webp(?:\?|$)/i.test(ref);
}

function mimeFromPath(path: string) {
  if (/\.jpe?g(?:\?|$)/i.test(path)) return 'image/jpeg';
  if (/\.png(?:\?|$)/i.test(path)) return 'image/png';
  if (/\.webp(?:\?|$)/i.test(path)) return 'image/webp';
  if (/\.avif(?:\?|$)/i.test(path)) return 'image/avif';
  return undefined;
}

function pct(oldSize: number, newSize: number) {
  if (!oldSize) return '0%';
  return `${Math.round(((oldSize - newSize) / oldSize) * 100)}%`;
}

async function main() {
  const supabase: any = createClient(requiredEnv('NEXT_PUBLIC_SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });

  const stats = {
    total: 0,
    alreadyWebP: 0,
    toConvert: 0,
    converted: 0,
    invalid: 0,
    failed: 0,
    originalBytes: 0,
    webpBytes: 0,
  };

  console.log(dryRun ? 'DRY-RUN: nenhuma imagem sera enviada e nenhum registro sera atualizado.' : 'EXECUTE: imagens serao convertidas e referencias atualizadas.');
  console.log(`Bucket: ${IMAGE_BUCKET}\n`);

  for (const def of IMAGE_COLUMNS) {
    const { data, error } = await supabase
      .from(def.table)
      .select(`${def.idColumn},${def.column}`)
      .not(def.column, 'is', null);

    if (error) {
      stats.failed += 1;
      console.error(`[${def.table}.${def.column}] falha ao listar: ${error.message}`);
      continue;
    }

    for (const row of data ?? []) {
      const recordId = String((row as any)[def.idColumn]);
      const oldValue = String((row as any)[def.column] ?? '').trim();
      if (!oldValue) continue;
      stats.total += 1;

      if (isWebP(oldValue)) {
        stats.alreadyWebP += 1;
        continue;
      }

      stats.toConvert += 1;
      const oldPath = storagePathFromPublicUrl(oldValue, IMAGE_BUCKET);
      if (!oldPath) {
        stats.invalid += 1;
        console.warn(`[skip] ${def.table}.${def.column} ${recordId}: referencia externa ou invalida (${oldValue})`);
        continue;
      }

      const { data: blob, error: downloadError } = await supabase.storage.from(IMAGE_BUCKET).download(oldPath);
      if (downloadError || !blob) {
        stats.failed += 1;
        console.error(`[erro] ${oldPath}: download falhou (${downloadError?.message ?? 'sem blob'})`);
        continue;
      }

      const buffer = Buffer.from(await blob.arrayBuffer());
      stats.originalBytes += buffer.byteLength;

      try {
        if (dryRun) {
          const optimized = await optimizeImageToWebP({
            file: buffer,
            context: def.context,
            entityId: recordId,
            originalFileName: oldPath,
            mimeType: blob.type || mimeFromPath(oldPath),
          });
          stats.webpBytes += optimized.size;
          console.log(`[dry-run] ${oldPath} -> ${optimized.filePath} | ${buffer.byteLength} -> ${optimized.size} bytes (${pct(buffer.byteLength, optimized.size)})`);
          continue;
        }

        const uploaded = await uploadOptimizedImageToSupabase({
          supabase,
          bucketName: IMAGE_BUCKET,
          file: buffer,
          context: def.context,
          entityId: recordId,
          originalFileName: oldPath,
          mimeType: blob.type || mimeFromPath(oldPath),
        });
        stats.webpBytes += uploaded.size;

        const { error: backupError } = await supabase.from('image_migration_backup').insert({
          table_name: def.table,
          record_id: recordId,
          column_name: def.column,
          old_value: oldValue,
          new_value: uploaded.publicUrl,
        });
        if (backupError) {
          await supabase.storage.from(IMAGE_BUCKET).remove([uploaded.path]);
          throw new Error(`backup falhou: ${backupError.message}`);
        }

        const { error: updateError } = await supabase
          .from(def.table)
          .update({ [def.column]: uploaded.publicUrl })
          .eq(def.idColumn, recordId);
        if (updateError) {
          await supabase.storage.from(IMAGE_BUCKET).remove([uploaded.path]);
          throw new Error(`update falhou: ${updateError.message}`);
        }

        stats.converted += 1;
        console.log(`[ok] ${def.table}.${def.column} ${recordId}: ${oldPath} -> ${uploaded.path} | ${buffer.byteLength} -> ${uploaded.size} bytes (${pct(buffer.byteLength, uploaded.size)})`);
      } catch (error) {
        stats.failed += 1;
        console.error(`[erro] ${def.table}.${def.column} ${recordId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  console.log('\nResumo');
  console.log(`Total encontrado: ${stats.total}`);
  console.log(`Ja WebP: ${stats.alreadyWebP}`);
  console.log(`Para converter: ${stats.toConvert}`);
  console.log(`Convertidos: ${stats.converted}`);
  console.log(`Invalidos/externos: ${stats.invalid}`);
  console.log(`Falhas: ${stats.failed}`);
  if (stats.originalBytes) {
    console.log(`Estimativa/resultado: ${stats.originalBytes} -> ${stats.webpBytes} bytes (${pct(stats.originalBytes, stats.webpBytes)} de reducao)`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
