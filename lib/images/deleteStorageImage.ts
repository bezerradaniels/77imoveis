import type { SupabaseClient } from '@supabase/supabase-js';
import { IMAGE_BUCKET } from './config';

export function storagePathFromPublicUrl(value: string, bucketName = IMAGE_BUCKET) {
  const ref = value.trim();
  if (!ref || ref.startsWith('/')) return null;
  if (!/^https?:\/\//i.test(ref)) return ref.replace(/^\/+/, '');

  try {
    const url = new URL(ref);
    const markers = [
      `/storage/v1/object/public/${bucketName}/`,
      `/storage/v1/object/sign/${bucketName}/`,
    ];
    const marker = markers.find((item) => url.pathname.includes(item));
    if (!marker) return null;
    return decodeURIComponent(url.pathname.slice(url.pathname.indexOf(marker) + marker.length));
  } catch {
    return null;
  }
}

export async function deleteStorageImages(
  supabase: SupabaseClient<any>,
  refs: string[],
  bucketName = IMAGE_BUCKET,
) {
  const paths = [...new Set(refs.map((ref) => storagePathFromPublicUrl(ref, bucketName)).filter(Boolean) as string[])];
  if (!paths.length) return { paths, error: null };
  const { error } = await supabase.storage.from(bucketName).remove(paths);
  return { paths, error };
}
