'use server';

import { createClient } from '@/lib/supabase/server';
import { IMAGE_BUCKET, isImageUploadContext } from '@/lib/images/config';
import { deleteStorageImages } from '@/lib/images/deleteStorageImage';
import { uploadOptimizedImageToSupabase } from '@/lib/images/uploadOptimizedImage';

function isUploadFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

export async function uploadOptimizedImage(formData: FormData) {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: 'Sessão expirada. Entre novamente.' };

  const file = formData.get('file');
  const context = formData.get('context');
  if (!isUploadFile(file) || file.size === 0) return { error: 'Selecione uma imagem válida.' };
  if (!isImageUploadContext(context)) return { error: 'Contexto de imagem inválido.' };
  if (['advertisement', 'banner', 'blogCover', 'city'].includes(context)) {
    const { data: profile } = await sb
      .from('profiles')
      .select('role,is_active')
      .eq('id', auth.user.id)
      .maybeSingle();
    if (!(profile as any)?.is_active || !['admin', 'moderador'].includes((profile as any)?.role)) {
      return { error: 'Sem permissão para enviar esta imagem.' };
    }
  }

  try {
    const uploaded = await uploadOptimizedImageToSupabase({
      supabase: sb,
      bucketName: IMAGE_BUCKET,
      file,
      context,
      entityId: String(formData.get('entityId') || auth.user.id),
      originalFileName: file.name,
      mimeType: file.type,
    });
    return {
      ok: true,
      url: uploaded.publicUrl,
      path: uploaded.path,
      width: uploaded.width,
      height: uploaded.height,
      size: uploaded.size,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível enviar a imagem.';
    if (process.env.NODE_ENV === 'development') console.error('[uploadOptimizedImage]', error);
    return { error: message.includes('Bucket') ? 'Bucket "imoveis" ausente no Storage.' : message };
  }
}

export async function deleteUploadedImages(refs: string[]) {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: 'Sessão expirada. Entre novamente.' };
  const { error } = await deleteStorageImages(sb, refs.slice(0, 100), IMAGE_BUCKET);
  return error ? { error: 'Não foi possível limpar imagens antigas.' } : { ok: true };
}
