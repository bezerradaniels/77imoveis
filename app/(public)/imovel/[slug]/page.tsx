import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BedDouble, Bath, Car, Ruler, LandPlot, DoorOpen, Check, MapPin, ChevronRight } from 'lucide-react';
import { getPropertyBySlug } from '@/lib/data';
import { brl } from '@/lib/format';
import { Gallery } from '@/components/property/Gallery';
import { ContactCard } from '@/components/property/ContactCard';
import { MobileContactBar } from '@/components/property/MobileContactBar';
import { JsonLd } from '@/components/seo/JsonLd';
import { realEstateListingLd, breadcrumbLd } from '@/lib/seo/jsonld';

export const dynamic = 'force-dynamic';
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://77imoveis.com.br';

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

  const contact = p.companies?.whatsapp || p.companies?.phone || p.profiles?.whatsapp || p.profiles?.phone;
  const phone = p.companies?.phone || p.companies?.whatsapp || p.profiles?.phone || p.profiles?.whatsapp;
  const wa = whatsappLink(contact, p.title);
  const anunciante = p.companies?.trade_name || p.profiles?.full_name || undefined;
  const showMap = p.latitude && p.longitude && !p.hide_exact_location;

  return (
    <main className="pb-24 lg:pb-12">
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

      <div className="mx-auto max-w-6xl px-4 pt-4 lg:pt-6">
        <nav aria-label="trilha" className="mb-4 hidden items-center gap-1 text-sm text-muted md:flex">
          <Link href="/" className="hover:text-text">Início</Link>
          <ChevronRight size={14} />
          <Link href={`/${p.cities?.slug}`} className="hover:text-text">{p.cities?.name}</Link>
          <ChevronRight size={14} />
          <Link href={`/${p.cities?.slug}/${p.property_types?.slug}s`} className="hover:text-text">{p.property_types?.name}</Link>
        </nav>

        <Gallery images={images} title={p.title} />
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
        <article>
          <header className="border-b border-border py-6 lg:py-8">
            <h1 className="max-w-3xl text-2xl font-semibold leading-tight md:text-3xl">{p.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted md:text-base">
              <MapPin size={15} />
              {p.neighborhoods?.name ? `${p.neighborhoods.name}, ` : ''}
              {p.cities?.name} - {p.cities?.state ?? 'BA'}
            </p>
          </header>

          {!!specs.length && (
            <section className="border-b border-border py-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specs.map((s, i) => (
                <span key={i} className="inline-flex min-h-12 items-center gap-3 rounded-lg bg-surface px-3 py-2 text-sm">
                  <s.Icon size={18} className="shrink-0 text-primary" /> {s.label}
                </span>
              ))}
              </div>
            </section>
          )}

          {p.description && (
            <section className="border-b border-border py-6 lg:py-8">
              <h2 className="mb-3 text-xl font-semibold">Descrição</h2>
              <p className="max-w-3xl whitespace-pre-line text-base leading-7 text-muted">{p.description}</p>
            </section>
          )}

          {!!features.length && (
            <section className="border-b border-border py-6 lg:py-8">
              <h2 className="mb-4 text-xl font-semibold">Características</h2>
              <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {features.map((f: any) => (
                  <li key={f.slug} className="inline-flex items-center gap-3 text-sm text-text">
                    <Check size={17} className="shrink-0 text-success" /> {f.name}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(p.condo_fee || p.iptu) && (
            <section className="border-b border-border py-6">
              <h2 className="mb-4 text-xl font-semibold">Custos do imóvel</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {p.condo_fee ? (
                  <span className="rounded-lg bg-surface p-4 text-sm">
                    <span className="block text-muted">Condomínio</span>
                    <b className="mt-1 block text-base">{brl(p.condo_fee)}</b>
                  </span>
                ) : null}
                {p.iptu ? (
                  <span className="rounded-lg bg-surface p-4 text-sm">
                    <span className="block text-muted">IPTU</span>
                    <b className="mt-1 block text-base">{brl(p.iptu)}/ano</b>
                  </span>
                ) : null}
              </div>
            </section>
          )}

          {showMap && (
            <section className="border-b border-border py-6 lg:py-8">
              <h2 className="mb-3 text-xl font-semibold">Localização</h2>
              <a
                href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface"
              >
                <MapPin size={16} className="text-primary" /> Ver no mapa
              </a>
            </section>
          )}
        </article>

        {/* Desktop: sidebar fixa. Mobile: barra inferior + modal (abaixo). */}
        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start lg:pt-8">
          <ContactCard negotiations={negotiations} anunciante={anunciante} wa={wa} phone={phone} slug={p.slug} title={p.title} />
        </aside>
      </div>

      <MobileContactBar negotiations={negotiations} anunciante={anunciante} wa={wa} phone={phone} slug={p.slug} title={p.title} />
    </main>
  );
}
