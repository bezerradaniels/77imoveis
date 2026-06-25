import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BedDouble, Bath, Car, Ruler, LandPlot, DoorOpen, Check, MapPin, MessageCircle } from 'lucide-react';
import { getPropertyBySlug, getActivePropertySlugs } from '@/lib/data';
import { brl, priceLabel } from '@/lib/format';
import { Gallery } from '@/components/property/Gallery';
import { LeadForm } from '@/components/property/LeadForm';
import { JsonLd } from '@/components/seo/JsonLd';
import { realEstateListingLd, breadcrumbLd } from '@/lib/seo/jsonld';

export const revalidate = 300;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://77imoveis.com.br';

const negoLabel: Record<string, string> = {
  venda: 'Venda',
  aluguel: 'Aluguel',
  temporada: 'Temporada',
  romaria: 'Romaria',
  lancamento: 'Lançamento',
};

// Pré-gera uma página para cada imóvel ativo.
export async function generateStaticParams() {
  return (await getActivePropertySlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProperty(params.slug);
  if (!p) return {};
  const title = `${p.title} | 77Imóveis`;
  const description = (p.description ?? '').slice(0, 155);
  const url = `${SITE}/imovel/${p.slug}`;
  const cover = sortedImages(p)[0]?.url;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, images: cover ? [cover] : [], type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: cover ? [cover] : [] },
  };
}

// Memoização por requisição: evita consultar o banco 2x (metadata + página).
const getProperty = cache((slug: string): Promise<any> => getPropertyBySlug(slug));

function sortedImages(p: any) {
  return [...(p.property_images ?? [])].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort - b.sort,
  );
}

// Monta o link do WhatsApp com mensagem pronta.
function whatsappLink(number: string | null | undefined, title: string) {
  if (!number) return null;
  let digits = number.replace(/\D/g, '');
  if (!digits.startsWith('55')) digits = '55' + digits;
  const text = encodeURIComponent(`Olá! Tenho interesse no imóvel "${title}" anunciado no 77Imóveis.`);
  return `https://wa.me/${digits}?text=${text}`;
}

export default async function ImovelPage({ params }: { params: { slug: string } }) {
  const p = await getProperty(params.slug);
  if (!p) notFound();

  const url = `${SITE}/imovel/${p.slug}`;
  const images = sortedImages(p);

  // Modalidades (venda/aluguel/...) — usa o merge; se vazio, cai no principal.
  const negotiations =
    p.property_negotiations?.length
      ? [...p.property_negotiations].sort((a: any, b: any) => Number(b.is_primary) - Number(a.is_primary))
      : [{ negotiation: p.negotiation, price: p.price, price_visibility: p.price_visibility }];

  const features = (p.property_features ?? []).map((f: any) => f.features).filter(Boolean);

  const specs = [
    p.bedrooms && { Icon: BedDouble, label: `${p.bedrooms} quartos` },
    p.suites && { Icon: DoorOpen, label: `${p.suites} suítes` },
    p.bathrooms && { Icon: Bath, label: `${p.bathrooms} banheiros` },
    p.garages && { Icon: Car, label: `${p.garages} vagas` },
    p.built_area && { Icon: Ruler, label: `${p.built_area} m² construídos` },
    p.land_area && { Icon: LandPlot, label: `${p.land_area} m² de terreno` },
  ].filter(Boolean) as { Icon: any; label: string }[];

  const contact = p.companies?.whatsapp || p.profiles?.whatsapp;
  const phone = p.companies?.phone || p.profiles?.phone;
  const wa = whatsappLink(contact, p.title);
  const showMap = p.latitude && p.longitude && !p.hide_exact_location;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <JsonLd
        data={realEstateListingLd({
          title: p.title,
          url,
          images: images.map((i: any) => i.url),
          price: p.price,
          city: p.cities?.name,
          lat: p.latitude,
          lng: p.longitude,
          description: p.description,
        })}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Início', url: SITE },
          { name: p.cities?.name, url: `${SITE}/${p.cities?.slug}` },
          { name: p.property_types?.name, url: `${SITE}/${p.cities?.slug}/${p.property_types?.slug}s` },
          { name: p.title, url },
        ])}
      />

      <nav aria-label="trilha" className="mb-4 text-sm text-muted">
        <Link href="/">Início</Link> › <Link href={`/${p.cities?.slug}`}>{p.cities?.name}</Link> ›{' '}
        <Link href={`/${p.cities?.slug}/${p.property_types?.slug}s`}>{p.property_types?.name}</Link>
      </nav>

      <Gallery images={images} title={p.title} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <article className="space-y-6">
          <header>
            <h1 className="text-2xl font-bold">{p.title}</h1>
            <p className="mt-1 flex items-center gap-1 text-muted">
              <MapPin size={15} />
              {p.neighborhoods?.name ? `${p.neighborhoods.name}, ` : ''}
              {p.cities?.name} - {p.cities?.state ?? 'BA'}
            </p>
          </header>

          {!!specs.length && (
            <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-surface p-4">
              {specs.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-2 text-sm">
                  <s.Icon size={18} className="text-primary" /> {s.label}
                </span>
              ))}
            </div>
          )}

          {p.description && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">Descrição</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{p.description}</p>
            </section>
          )}

          {!!features.length && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">Características</h2>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {features.map((f: any) => (
                  <li key={f.slug} className="inline-flex items-center gap-2 text-sm text-muted">
                    <Check size={15} className="text-success" /> {f.name}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(p.condo_fee || p.iptu) && (
            <section className="flex flex-wrap gap-6 text-sm">
              {p.condo_fee ? <span>Condomínio: <b>{brl(p.condo_fee)}</b></span> : null}
              {p.iptu ? <span>IPTU: <b>{brl(p.iptu)}/ano</b></span> : null}
            </section>
          )}

          {showMap && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">Localização</h2>
              <a
                href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary"
              >
                <MapPin size={15} /> Ver no mapa
              </a>
            </section>
          )}
        </article>

        {/* Coluna de preço e contato (fixa no desktop) */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card">
            <div className="space-y-1">
              {negotiations.map((n: any) => (
                <div key={n.negotiation} className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-muted">{negoLabel[n.negotiation] ?? n.negotiation}</span>
                  <span className="text-lg font-bold tabular-nums">
                    {priceLabel({ price: n.price, priceVisibility: n.price_visibility, negotiation: n.negotiation })}
                  </span>
                </div>
              ))}
            </div>

            {(p.companies?.trade_name || p.profiles?.full_name) && (
              <p className="text-sm text-muted">
                Anunciante: <b className="text-text">{p.companies?.trade_name || p.profiles?.full_name}</b>
              </p>
            )}

            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1FA855] font-semibold text-white hover:opacity-90"
              >
                <MessageCircle size={18} /> Conversar no WhatsApp
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone.replace(/\D/g, '')}`}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border font-medium hover:bg-bg"
              >
                Ligar: {phone}
              </a>
            )}
            <div className="border-t border-border pt-4">
              <p className="mb-2 text-sm font-medium">Enviar mensagem ao anunciante</p>
              <LeadForm slug={p.slug} title={p.title} />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
