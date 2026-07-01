import type { SupabaseClient } from '@supabase/supabase-js';
import { IMAGE_BUCKET, type ImageUploadContext } from './config';
import { optimizeImageToWebP } from './optimizeImage';

export type UploadOptimizedImageInput = {
  supabase: SupabaseClient<any>;
  file: File | Buffer | Uint8Array | ArrayBuffer;
  context: ImageUploadContext;
  entityId?: string;
  originalFileName?: string;
  mimeType?: string;
  bucketName?: string;
};

export async function uploadOptimizedImageToSupabase(input: UploadOptimizedImageInput) {
  const bucketName = input.bucketName ?? IMAGE_BUCKET;
  const optimized = await optimizeImageToWebP(input);
  const { data, error } = await input.supabase.storage
    .from(bucketName)
    .upload(optimized.filePath, optimized.buffer, {
      contentType: optimized.contentType,
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const path = data?.path ?? optimized.filePath;
  const publicUrl = input.supabase.storage.from(bucketName).getPublicUrl(path).data.publicUrl;
  return { ...optimized, path, publicUrl };
}
