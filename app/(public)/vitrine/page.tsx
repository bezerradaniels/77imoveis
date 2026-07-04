import Image from 'next/image';
import Link from 'next/link';
import { Store, MessageCircle } from 'lucide-react';
import { getActiveStorefronts } from '@/lib/data';
import { pageMetadata, REGION } from '@/lib/seo/meta';

export const revalidate = 300;
const shouldUnoptimize = (src: string) => src.endsWith('.svg') || (/^https?:\/\//.test(src) && !src.includes('.supabase.co'));

export const metadata = pageMetadata({
  title: `Vitrines de imobiliárias e empresas no ${REGION}`,
  description: `Catálogos e vitrines próprias de imobiliárias, corretores e empresas no ${REGION}, na Bahia. Veja os imóveis e fale direto pelo WhatsApp.`,
  path: '/vitrine',
});

export default async function VitrinesPage() {
  const storefronts = await getActiveStorefronts();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Catálogos e vitrines</h1>
      <p className="mb-6 text-muted">Veja páginas próprias de imobiliárias, corretores e empresas da região.</p>

      {storefronts.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {storefronts.map((s: any) => {
            const company = Array.isArray(s.companies) ? s.companies[0] : s.companies;
            const title = s.headline || company?.trade_name || 'Vitrine';
            const wa = company?.whatsapp || company?.phone;
            return (
              <Link
                key={s.slug}
                href={`/vitrine/${s.slug}`}
                className="overflow-hidden rounded-xl border border-border bg-surface transition hover:-translate-y-0.5 hover:border-primary/40"
              >
                <div className="relative flex aspect-[5/2] items-center justify-center overflow-hidden bg-border" style={!s.cover_url ? { background: s.accent_color || '#0ea5e9' } : undefined}>
                  {s.cover_url && (
                    <Image
                      src={s.cover_url}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      unoptimized={shouldUnoptimize(s.cover_url)}
                      className="object-cover"
                    />
                  )}
                  {!s.cover_url && <Store className="text-white" />}
                </div>
                <div className="flex gap-3 p-4">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-bg">
                    {s.logo_url ? (
                      <Image
                        src={s.logo_url}
                        alt=""
                        fill
                        sizes="48px"
                        unoptimized={shouldUnoptimize(s.logo_url)}
                        className="object-cover"
                      />
                    ) : (
                      <Store size={20} className="text-muted" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-1 font-semibold">{title}</h2>
                    {company?.trade_name && <p className="text-sm text-muted">{company.trade_name}</p>}
                    {wa && (
                      <p className="mt-2 inline-flex items-center gap-1 text-sm text-link">
                        <MessageCircle size={14} /> Atendimento por WhatsApp
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Store className="mx-auto mb-2 text-muted" />
          <p className="text-muted">Ainda não há vitrines ativas.</p>
          <Link href="/profissionais" className="mt-4 inline-flex rounded-full border border-primary/25 bg-primary-soft px-4 py-2 font-semibold text-primary hover:bg-primary-soft-hover">
            Ver profissionais
          </Link>
        </div>
      )}
    </main>
  );
}
