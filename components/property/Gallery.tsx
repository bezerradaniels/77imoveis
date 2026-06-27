import Image from 'next/image';
import { ImageOff } from 'lucide-react';

type Img = { url: string; alt?: string | null };

// Galeria de fotos do imóvel: capa grande + miniaturas. Sem JS (bom p/ SEO/perf).
export function Gallery({ images, title }: { images: Img[]; title: string }) {
  const list = images.length ? images : [{ url: '/placeholder.svg', alt: title }];
  const [cover, ...rest] = list;
  const visibleRest = rest.slice(0, 4);

  return (
    <div className="relative grid gap-2 overflow-hidden rounded-2xl bg-subtle md:grid-cols-4 md:grid-rows-2">
      <div className="relative aspect-video w-full overflow-hidden md:col-span-2 md:row-span-2 md:aspect-auto md:h-[430px]">
        <Image
          src={cover.url}
          alt={cover.alt ?? title}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          unoptimized={cover.url.endsWith('.svg')}
          className="object-cover"
        />
      </div>
      {visibleRest.map((im, i) => (
        <div key={i} className="relative hidden overflow-hidden md:block">
          <Image
            src={im.url}
            alt={im.alt ?? title}
            fill
            sizes="25vw"
            unoptimized={im.url.endsWith('.svg')}
            className="object-cover"
          />
          {i === visibleRest.length - 1 && images.length > 1 && (
            <span className="absolute bottom-4 right-4 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold shadow-sm">
              Mostrar fotos
            </span>
          )}
        </div>
      ))}
      {!images.length && (
        <span className="hidden items-center justify-center gap-1 border border-dashed border-border text-xs text-muted md:flex md:col-span-2">
          <ImageOff size={14} /> Sem fotos
        </span>
      )}
      {images.length > 1 && (
        <span className="absolute bottom-3 right-3 rounded-full bg-surface/95 px-3 py-1 text-xs font-medium shadow-sm md:hidden">
          {images.length} fotos
        </span>
      )}
    </div>
  );
}
