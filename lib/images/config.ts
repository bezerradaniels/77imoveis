export const IMAGE_BUCKET = process.env.NEXT_PUBLIC_IMAGE_BUCKET ?? 'imoveis';

export const DEFAULT_MAX_IMAGE_UPLOAD_SIZE = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'] as const;

export const IMAGE_UPLOAD_CONFIG = {
  property: { maxWidth: 1600, quality: 80, folder: 'properties' },
  propertyThumbnail: { maxWidth: 600, quality: 78, folder: 'properties/thumbnails' },
  city: { maxWidth: 1600, quality: 80, folder: 'cities' },
  banner: { maxWidth: 1920, quality: 82, folder: 'banners' },
  advertisement: { maxWidth: 1920, quality: 82, folder: 'ads' },
  logo: { maxWidth: 512, quality: 85, folder: 'logos' },
  avatar: { maxWidth: 512, quality: 85, folder: 'avatars' },
  broker: { maxWidth: 512, quality: 85, folder: 'brokers' },
  companyCover: { maxWidth: 1920, quality: 82, folder: 'companies/covers' },
  storefrontCover: { maxWidth: 1920, quality: 82, folder: 'storefronts/covers' },
  blogCover: { maxWidth: 1600, quality: 80, folder: 'blog' },
} as const;

export type ImageUploadContext = keyof typeof IMAGE_UPLOAD_CONFIG;

export function isImageUploadContext(value: unknown): value is ImageUploadContext {
  return typeof value === 'string' && value in IMAGE_UPLOAD_CONFIG;
}

export function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / 1024 / 1024)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} bytes`;
}
