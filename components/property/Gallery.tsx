import { ImageOff } from 'lucide-react';

type Img = { url: string; alt?: string | null };

// Galeria de fotos do imóvel: capa grande + miniaturas. Sem JS (bom p/ SEO/perf).
export function Gallery({ images, title }: { images: Img[]; title: string }) {
  const list = images.length ? images : [{ url: '/placeholder.svg', alt: title }];
  const [cover, ...rest] = list;

  return (
    <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2">
      <img
        src={cover.url}
        alt={cover.alt ?? title}
        className="aspect-[4/3] w-full rounded-xl object-cover md:col-span-2 md:row-span-2 md:aspect-auto md:h-full"
      />
      {rest.slice(0, 4).map((im, i) => (
        <img
          key={i}
          src={im.url}
          alt={im.alt ?? title}
          loading="lazy"
          className="hidden aspect-[4/3] w-full rounded-lg object-cover md:block"
        />
      ))}
      {!images.length && (
        <span className="hidden items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs text-muted md:flex md:col-span-2">
          <ImageOff size={14} /> Sem fotos
        </span>
      )}
    </div>
  );
}
