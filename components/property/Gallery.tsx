'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand, Heart, ImageOff, Images, Share2, X } from 'lucide-react';

type Img = { url: string; alt?: string | null };

// Imagens externas (não-Supabase) e SVG passam direto pelo next/image sem otimizar.
const shouldUnoptimize = (src: string) =>
  src.endsWith('.svg') || (/^https?:\/\//.test(src) && !src.includes('.supabase.co'));

// Galeria premium do imóvel: capa grande com carrossel, miniaturas e lightbox
// em tela cheia. É a âncora visual da página. Client component (interativa).
export function Gallery({
  images,
  title,
  badge,
  featured,
}: {
  images: Img[];
  title: string;
  badge?: string;
  featured?: boolean;
}) {
  const list = images.length ? images : [{ url: '/placeholder.svg', alt: title }];
  const n = list.length;
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const go = useCallback((d: number) => setI((p) => (p + d + n) % n), [n]);

  // Teclado no lightbox + trava o scroll do fundo.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, go]);

  const cur = list[i];
  const thumbs = list.slice(0, 5);
  const extra = n - thumbs.length;

  return (
    <div>
      {/* Imagem principal */}
      <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-subtle">
        <Image
          key={cur.url}
          src={cur.url}
          alt={cur.alt ?? title}
          fill
          priority={i === 0}
          sizes="(min-width: 1024px) 760px, 100vw"
          unoptimized={shouldUnoptimize(cur.url)}
          className="cursor-zoom-in object-cover"
          onClick={() => setOpen(true)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25" />

        {/* Selos */}
        <div className="absolute left-4 top-4 flex gap-2">
          {badge && (
            <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-on-primary shadow-sm">
              {badge}
            </span>
          )}
          {featured && (
            <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-text shadow-sm">
              Destaque
            </span>
          )}
        </div>

        {/* Ações */}
        <div className="absolute right-4 top-4 flex gap-2">
          <button
            type="button"
            aria-label="Compartilhar"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-text shadow-sm transition hover:bg-white"
          >
            <Share2 size={18} />
          </button>
          <button
            type="button"
            aria-label="Favoritar"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-text shadow-sm transition hover:bg-white"
          >
            <Heart size={18} />
          </button>
        </div>

        {/* Setas */}
        {n > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-text opacity-0 shadow-md transition hover:bg-white group-hover:opacity-100 max-lg:opacity-100"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-text opacity-0 shadow-md transition hover:bg-white group-hover:opacity-100 max-lg:opacity-100"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Contador + ver todas */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
          <Images size={14} /> {i + 1} / {n}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-[13px] font-bold text-text shadow-sm transition hover:bg-white"
        >
          <Expand size={15} /> Ver todas
        </button>

        {!images.length && (
          <span className="absolute inset-0 flex items-center justify-center gap-1.5 text-sm text-muted">
            <ImageOff size={16} /> Sem fotos
          </span>
        )}
      </div>

      {/* Miniaturas */}
      {n > 1 && (
        <div className="mt-2.5 grid grid-cols-5 gap-2.5">
          {thumbs.map((im, k) => {
            const last = k === thumbs.length - 1 && extra > 0;
            return (
              <button
                type="button"
                key={k}
                onClick={() => (last ? setOpen(true) : setI(k))}
                aria-label={last ? 'Ver todas as fotos' : `Foto ${k + 1}`}
                className="relative aspect-[4/3] overflow-hidden rounded-xl outline-offset-[-3px] transition"
                style={{ outline: i === k ? '3px solid var(--primary)' : '3px solid transparent' }}
              >
                <Image
                  src={im.url}
                  alt={im.alt ?? title}
                  fill
                  sizes="150px"
                  unoptimized={shouldUnoptimize(im.url)}
                  className="object-cover"
                />
                {last && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-bold text-white">
                    +{extra}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-[#0a0f0c]/95"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            <X size={22} />
          </button>
          <div className="relative h-[74vh] w-[88vw] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={cur.url}
              alt={cur.alt ?? title}
              fill
              sizes="90vw"
              unoptimized={shouldUnoptimize(cur.url)}
              className="object-contain"
            />
          </div>
          {n > 1 && (
            <div className="mt-5 flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                aria-label="Anterior"
                onClick={() => go(-1)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                <ChevronLeft size={24} />
              </button>
              <span className="text-sm font-medium text-white/80">{i + 1} / {n}</span>
              <button
                type="button"
                aria-label="Próxima"
                onClick={() => go(1)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
