import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { getStorefrontBySlug } from '@/lib/data';
import { PropertyCard } from '@/components/property/PropertyCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { localBusinessLd } from '@/lib/seo/jsonld';
import { pageMetadata, swapRegion, REGION } from '@/lib/seo/meta';

export const revalidate = 300;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://77imoveis.com.br';
const shouldUnoptimize = (src: string) => src.endsWith('.svg') || (/^https?:\/\//.test(src) && !src.includes('.supabase.co'));

function readableTextOn(hex: string) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return '#10231d';
  const [r, g, b] = match.slice(1).map((v) => parseInt(v, 16));
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.55 ? '#10231d' : '#ffffff';
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const res = await getStorefrontBySlug(params.slug);
  // Vitrine inexistente ou inativa: não indexar.
  if (!res || res.storefront.status !== 'ativo') {
    return { title: 'Vitrine não encontrada', robots: { index: false, follow: false } };
  }
  const s: any = res.storefront;
  const name = s.companies?.trade_name ?? 'Vitrine';
  const title = s.headline || `${name} — Imóveis no ${REGION}`;
  const description = s.about || `Imóveis anunciados por ${name} no ${REGION}, na Bahia. Veja o catálogo completo e fale direto pelo WhatsApp.`;
  return pageMetadata({
    title,
    description,
    path: `/vitrine/${s.slug}`,
    images: [s.cover_url || s.logo_url],
    type: 'profile',
  });
}

export default async function VitrinePublicaPage({ params }: { params: { slug: string } }) {
  const res = await getStorefrontBySlug(params.slug);
  // RLS só expõe vitrine ativa para visitantes; senão não existe publicamente.
  if (!res || res.storefront.status !== 'ativo') notFound();

  const s: any = res.storefront;
  const c = s.companies;
  const accent = s.accent_color || '#0ea5e9';
  const accentText = readableTextOn(accent);
  const wa = s.show_whatsapp && (c.whatsapp || c.phone) ? `https://wa.me/55${(c.whatsapp || c.phone).replace(/\D/g, '')}` : null;

  return (
    <main>
      <JsonLd data={localBusinessLd({ name: c.trade_name, url: `${SITE}/vitrine/${s.slug}`, logo: s.logo_url, phone: c.whatsapp || c.phone, city: '' })} />

      {/* Cabeçalho com a marca da empresa */}
      <header className="relative">
        <div className="relative h-40 w-full overflow-hidden bg-border sm:h-56" style={!s.cover_url ? { background: accent } : undefined}>
          {s.cover_url && (
            <Image
              src={s.cover_url}
              alt=""
              fill
              priority
              sizes="100vw"
              unoptimized={shouldUnoptimize(s.cover_url)}
              className="object-cover"
            />
          )}
        </div>
        <div className="mx-auto -mt-10 max-w-6xl px-4">
          <div className="flex items-end gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-4 border-bg bg-surface">
              {s.logo_url && (
                <Image
                  src={s.logo_url}
                  alt={c.trade_name}
                  fill
                  sizes="80px"
                  unoptimized={shouldUnoptimize(s.logo_url)}
                  className="object-cover"
                />
              )}
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-bold" style={{ color: accent }}>{s.headline || c.trade_name}</h1>
              <p className="text-sm text-muted">{c.trade_name}</p>
            </div>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="mb-2 ml-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold" style={{ background: accent, color: accentText }}>
                <MessageCircle size={16} /> Falar conosco
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {s.about && <p className="mb-6 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted">{swapRegion(s.about)}</p>}

        <h2 className="mb-3 text-xl font-semibold">Imóveis ({res.properties.length})</h2>
        {res.properties.length ? (
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,200px)]">
            {res.properties.map((p) => <PropertyCard key={p.slug} {...p} />)}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">Sem imóveis ativos no momento.</p>
        )}
      </div>
    </main>
  );
}
