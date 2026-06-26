import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { getStorefrontBySlug } from '@/lib/data';
import { PropertyCard } from '@/components/property/PropertyCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { localBusinessLd } from '@/lib/seo/jsonld';

export const revalidate = 300;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://77imoveis.com.br';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const res = await getStorefrontBySlug(params.slug);
  if (!res) return {};
  const s: any = res.storefront;
  const name = s.companies?.trade_name ?? 'Vitrine';
  const title = s.headline || `${name} — Imóveis`;
  return {
    title,
    description: (s.about ?? '').slice(0, 155) || `Imóveis de ${name} no DDD 77.`,
    alternates: { canonical: `${SITE}/vitrine/${s.slug}` },
  };
}

export default async function VitrinePublicaPage({ params }: { params: { slug: string } }) {
  const res = await getStorefrontBySlug(params.slug);
  // RLS só expõe vitrine ativa para visitantes; senão não existe publicamente.
  if (!res || res.storefront.status !== 'ativo') notFound();

  const s: any = res.storefront;
  const c = s.companies;
  const accent = s.accent_color || '#0891b2';
  const wa = s.show_whatsapp && (c.whatsapp || c.phone) ? `https://wa.me/55${(c.whatsapp || c.phone).replace(/\D/g, '')}` : null;

  return (
    <main>
      <JsonLd data={localBusinessLd({ name: c.trade_name, url: `${SITE}/vitrine/${s.slug}`, logo: s.logo_url, phone: c.whatsapp || c.phone, city: '' })} />

      {/* Cabeçalho com a marca da empresa */}
      <header className="relative">
        <div className="h-40 w-full bg-border sm:h-56" style={s.cover_url ? { backgroundImage: `url(${s.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: accent }} />
        <div className="mx-auto -mt-10 max-w-6xl px-4">
          <div className="flex items-end gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border-4 border-bg bg-surface">
              {s.logo_url && <img src={s.logo_url} alt={c.trade_name} className="h-full w-full object-cover" />}
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-bold" style={{ color: accent }}>{s.headline || c.trade_name}</h1>
              <p className="text-sm text-muted">{c.trade_name}</p>
            </div>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="mb-2 ml-auto inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: accent }}>
                <MessageCircle size={16} /> Falar conosco
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {s.about && <p className="mb-6 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted">{s.about}</p>}

        <h2 className="mb-3 text-xl font-semibold">Imóveis ({res.properties.length})</h2>
        {res.properties.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {res.properties.map((p) => <PropertyCard key={p.slug} {...p} />)}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">Sem imóveis ativos no momento.</p>
        )}
      </div>
    </main>
  );
}
