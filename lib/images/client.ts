'use client';

import { deleteUploadedImages, uploadOptimizedImage } from '@/app/actions/images';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  DEFAULT_MAX_IMAGE_UPLOAD_SIZE,
  formatFileSize,
  type ImageUploadContext,
} from './config';

const allowedMimeTypes = new Set<string>(ALLOWED_IMAGE_MIME_TYPES);

export function validateImageFile(file: File) {
  if (!allowedMimeTypes.has(file.type)) throw new Error('Use uma imagem JPG, PNG, WebP ou AVIF.');
  if (file.size > DEFAULT_MAX_IMAGE_UPLOAD_SIZE)
    throw new Error(`A imagem precisa ter até ${formatFileSize(DEFAULT_MAX_IMAGE_UPLOAD_SIZE)}.`);
}

export async function uploadImageFile(file: File, context: ImageUploadContext, entityId?: string) {
  validateImageFile(file);
  const form = new FormData();
  form.append('file', file);
  form.append('context', context);
  if (entityId) form.append('entityId', entityId);
  const result = await uploadOptimizedImage(form);
  if ('error' in result) throw new Error(result.error);
  return result;
}

export async function cleanupUploadedImages(refs: (string | null | undefined)[]) {
  const clean = refs.filter(Boolean) as string[];
  if (!clean.length) return;
  try {
    await deleteUploadedImages(clean);
  } catch {}
}
