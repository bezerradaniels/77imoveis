import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  DEFAULT_MAX_IMAGE_UPLOAD_SIZE,
  IMAGE_UPLOAD_CONFIG,
  formatFileSize,
  type ImageUploadContext,
} from './config';

type ImageSource = File | Buffer | Uint8Array | ArrayBuffer;

export type OptimizeImageInput = {
  file: ImageSource;
  context: ImageUploadContext;
  entityId?: string;
  originalFileName?: string;
  mimeType?: string;
};

export type OptimizedImageResult = {
  buffer: Buffer;
  fileName: string;
  filePath: string;
  contentType: 'image/webp';
  width: number;
  height: number;
  size: number;
};

const allowedMimeTypes = new Set<string>(ALLOWED_IMAGE_MIME_TYPES);
const allowedExtensions = new Set<string>(ALLOWED_IMAGE_EXTENSIONS);
const allowedSharpFormats = new Set(['jpeg', 'png', 'webp', 'avif']);

function isFileLike(file: unknown): file is File {
  return typeof File !== 'undefined' && file instanceof File;
}

async function toBuffer(file: ImageSource) {
  if (Buffer.isBuffer(file)) return file;
  if (file instanceof Uint8Array) return Buffer.from(file);
  if (file instanceof ArrayBuffer) return Buffer.from(file);
  if (isFileLike(file)) return Buffer.from(await file.arrayBuffer());
  throw new Error('Arquivo de imagem inválido.');
}

function extensionFrom(name?: string) {
  const ext = name?.split('.').pop()?.toLowerCase().trim();
  return ext && ext !== name ? ext : '';
}

function numberFromEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function clampQuality(value: number) {
  return Math.min(100, Math.max(1, Math.round(value)));
}

function safePathSegment(value?: string) {
  return (value || 'geral')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'geral';
}

export async function optimizeImageToWebP(input: OptimizeImageInput): Promise<OptimizedImageResult> {
  const config = IMAGE_UPLOAD_CONFIG[input.context];
  const file = input.file;
  const originalFileName = input.originalFileName ?? (isFileLike(file) ? file.name : undefined);
  const mimeType = input.mimeType ?? (isFileLike(file) ? file.type : undefined);

  if (mimeType && !allowedMimeTypes.has(mimeType)) {
    throw new Error('Use uma imagem JPG, PNG, WebP ou AVIF.');
  }

  const extension = extensionFrom(originalFileName);
  if (originalFileName && (!extension || !allowedExtensions.has(extension))) {
    throw new Error('Use uma imagem JPG, PNG, WebP ou AVIF.');
  }

  const buffer = await toBuffer(file);
  const maxSize = numberFromEnv('IMAGE_UPLOAD_MAX_BYTES', DEFAULT_MAX_IMAGE_UPLOAD_SIZE);
  if (!buffer.length) throw new Error('Arquivo de imagem vazio.');
  if (buffer.length > maxSize) throw new Error(`A imagem precisa ter até ${formatFileSize(maxSize)}.`);

  const image = sharp(buffer, { failOn: 'error' }).rotate();
  const metadata = await image.metadata();
  if (!metadata.format || !allowedSharpFormats.has(metadata.format)) {
    throw new Error('Não foi possível validar esta imagem.');
  }
  if (!metadata.width || !metadata.height) {
    throw new Error('Não foi possível identificar as dimensões da imagem.');
  }

  const quality = clampQuality(numberFromEnv('IMAGE_WEBP_QUALITY', config.quality));
  const resized = metadata.width > config.maxWidth
    ? image.resize({ width: config.maxWidth, withoutEnlargement: true })
    : image;
  const output = await resized.webp({ quality, effort: 4 }).toBuffer();
  const outMeta = await sharp(output).metadata();
  const fileName = `${randomUUID()}.webp`;

  return {
    buffer: output,
    fileName,
    filePath: `${config.folder}/${safePathSegment(input.entityId)}/${fileName}`,
    contentType: 'image/webp',
    width: outMeta.width ?? metadata.width,
    height: outMeta.height ?? metadata.height,
    size: output.byteLength,
  };
}
