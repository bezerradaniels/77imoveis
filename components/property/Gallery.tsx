import { ImageOff } from 'lucide-react';

type Img = { url: string; alt?: string | null };

// Galeria de fotos do imóvel: capa grande + miniaturas. Sem JS (bom p/ SEO/perf).
export function Gallery({ images, title }: { images: Img[]; title: string }) {
  const list = images.length ? images : [{ url: '/placeholder.svg', alt: title }];
  const [cover, ...rest] = list;
  const visibleRest = rest.slice(0, 4);

  return (
    <div className="relative grid gap-2 overflow-hidden rounded-[30px] bg-surface md:grid-cols-4 md:grid-rows-2">
      <img
        src={cover.url}
        alt={cover.alt ?? title}
        className="aspect-video w-full object-cover md:col-span-2 md:row-span-2 md:aspect-auto md:h-[430px]"
      />
      {visibleRest.map((im, i) => (
        <div key={i} className="relative hidden md:block">
          <img
            src={im.url}
            alt={im.alt ?? title}
            loading="lazy"
            className="h-full min-h-0 w-full object-cover"
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
