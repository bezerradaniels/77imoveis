import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ChevronRight, Clock } from 'lucide-react';
import { getPropertyBySlug, getRelatedProperties } from '@/lib/data';
import { brl } from '@/lib/format';
import { Gallery } from '@/components/property/Gallery';
import { ContactCard, negoLabel } from '@/components/property/ContactCard';
import { MobileContactBar } from '@/components/property/MobileContactBar';
import { PropertySpecs } from '@/components/property/PropertySpecs';
import { AmenitiesCard } from '@/components/property/AmenitiesCard';
import { NegotiationCard } from '@/components/property/NegotiationCard';
import { RelatedProperties } from '@/components/property/RelatedProperties';
import { JsonLd } from '@/components/seo/JsonLd';
import { TrackEventOnMount } from '@/components/analytics/TrackEventOnMount';
import { ANALYTICS_EVENTS } from '@/lib/analytics';
import { realEstateListingLd, breadcrumbLd } from '@/lib/seo/jsonld';
import { pageMetadata, regionalize, swapRegion, REGION } from '@/lib/seo/meta';

// ISR: a página é renderizada e cacheada por 5 min (TTFB/LCP rápidos e menos
// carga no banco). Imóveis novos aparecem na 1ª visita (cache miss); edições
// se propagam em até 5 min. Não usa cookies/headers, então é seguro cachear.
export const revalidate = 300;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://77imoveis.com.br';

// Transação em linguagem natural (para título/descrição e GEO/LLM).
const NEG_TEXT: Record<string, string> = {
  venda: 'à venda',
  aluguel: 'para alugar',
  temporada: 'para temporada',
  romaria: 'para romaria',
  lancamento: 'em lançamento',
};

// Especificações principais em texto curto e factual ("3 quartos · 2 banheiros").
function specBits(p: any): string[] {
  const b: string[] = [];
  if (p.bedrooms) b.push(`${p.bedrooms} ${p.bedrooms > 1 ? 'quartos' : 'quarto'}`);
  if (p.bathrooms) b.push(`${p.bathrooms} ${p.bathrooms > 1 ? 'banheiros' : 'banheiro'}`);
  if (p.garages) b.push(`${p.garages} ${p.garages > 1 ? 'vagas' : 'vaga'}`);
  if (p.built_area) b.push(`${Number(p.built_area)} m²`);
  return b;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProperty(params.slug);
  if (!p) return { title: 'Imóvel não encontrado', robots: { index: false, follow: false } };

  const typeName = p.property_types?.name ?? 'Imóvel';
  const cityName = p.cities?.name as string | undefined;
  const neighborhood = p.neighborhoods?.name as string | undefined;
  const neg = NEG_TEXT[p.negotiation] ?? '';
  const locale = [neighborhood, cityName].filter(Boolean).join(', ') || REGION;

  // Título: lidera com o título do anúncio (único) e garante a cidade.
  const base = (p.title ?? '').trim();
  const cityInTitle = !!cityName && base.toLowerCase().includes(cityName.toLowerCase());
  const core = cityName && !cityInTitle ? `${base} em ${cityName}` : base;

  // Descrição: factual e única, montada a partir de dados estruturados.
  const priceTxt =
    p.price != null && p.price_visibility !== 'sob_consulta'
      ? brl(Number(p.price)) + (p.negotiation === 'aluguel' ? '/mês' : '')
      : 'valor sob consulta';
  const lead = `${typeName} ${neg} em ${locale}`.replace(/\s+/g, ' ').trim();
  const built = [lead, specBits(p).join(' · '), priceTxt].filter(Boolean).join('. ') + '.';
  const description = p.description ? `${built} ${regionalize(p.description)}` : built;

  const cover = sortedImages(p)[0]?.url;
  return pageMetadata({
    title: core,
    description,
    path: `/imovel/${p.slug}`,
    images: [cover],
    type: 'article',
  });
}

// Memoização por requisição: evita consultar o banco 2x (metadata + página).
const getProperty = cache((slug: string): Promise<any> => getPropertyBySlug(slug));

function sortedImages(p: any) {
  return [...(p.property_images ?? [])].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort - b.sort,
  );
}

// Link do WhatsApp com mensagem pronta (interesse ou agendamento).
function whatsappLink(number: string | null | undefined, text: string) {
  if (!number) return null;
  let digits = number.replace(/\D/g, '');
  if (!digits.startsWith('55')) digits = '55' + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

// "há X dias" simples a partir de published_at.
function postedAgo(iso?: string | null) {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'hoje';
  if (days === 1) return 'há 1 dia';
  if (days < 30) return `há ${days} dias`;
  const m = Math.floor(days / 30);
  return m <= 1 ? 'há 1 mês' : `há ${m} meses`;
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

  const contactMethods = Array.isArray(p.contact_methods) && p.contact_methods.length
    ? p.contact_methods
    : [p.contact_pref ?? 'whatsapp'];
  const directContact = p.show_phone !== false;
  const whatsappNumber = p.contact_whatsapp || p.companies?.whatsapp || p.profiles?.whatsapp || p.companies?.phone || p.profiles?.phone;
  const phoneNumber = p.contact_phone || p.companies?.phone || p.profiles?.phone || p.contact_whatsapp || p.companies?.whatsapp || p.profiles?.whatsapp;
  const wa = directContact && contactMethods.includes('whatsapp')
    ? whatsappLink(whatsappNumber, `Olá! Tenho interesse no imóvel "${p.title}" anunciado no 77Imóveis.`)
    : null;
  const phone = directContact && contactMethods.includes('telefone') ? phoneNumber : null;
  const showLeadForm = contactMethods.includes('formulario') || (!wa && !phone);
  const anunciante = p.contact_company || p.contact_name || p.companies?.trade_name || p.profiles?.full_name || undefined;
  const advertiserLogo = p.companies?.logo_url || undefined;
  const showMap = p.latitude && p.longitude && !p.hide_exact_location;
  const posted = postedAgo(p.published_at);

  const locationLines = [
    !p.hide_exact_location && p.street ? `${p.street}${p.number ? `, ${p.number}` : ''}` : null,
    p.neighborhoods?.name,
    p.cities?.name ? `${p.cities.name} - ${p.cities?.state ?? 'BA'}` : null,
  ]
    .filter(Boolean);

  const related = await getRelatedProperties(p.city_id, p.property_type_id, p.slug, 8);

  // Props compartilhadas pelo card de desktop e pelo bottom sheet de mobile.
  const cardProps = {
    negotiations: negotiations as any,
    anunciante,
    advertiserLogo,
    acceptsFinancing: p.accepts_financing,
    acceptsMcmv: p.accepts_mcmv,
    acceptsExchange: p.accepts_exchange,
    wa,
    phone,
    showLeadForm,
    slug: p.slug,
    title: p.title,
  };

  return (
    <main className="pb-28 lg:pb-12">
      <TrackEventOnMount
        eventName={ANALYTICS_EVENTS.propertyView}
        params={{
          property_slug: p.slug,
          property_type: p.property_types?.name,
          property_status: p.status,
          city: p.cities?.name,
          state: p.cities?.state ?? 'BA',
          negotiation: p.negotiation,
          source_component: 'property_detail_page',
        }}
      />
      <JsonLd
        data={realEstateListingLd({
          title: p.title,
          url,
          images: images.map((i: any) => i.url),
          price: p.price,
          priceVisibility: p.price_visibility,
          city: p.cities?.name,
          state: p.cities?.state,
          neighborhood: p.neighborhoods?.name,
          street: p.street,
          number: p.number,
          postalCode: p.zipcode,
          propertyType: p.property_types?.name,
          negotiation: p.negotiation,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          builtArea: p.built_area ? Number(p.built_area) : null,
          landArea: p.land_area ? Number(p.land_area) : null,
          datePosted: p.published_at,
          lat: showMap ? p.latitude : null,
          lng: showMap ? p.longitude : null,
          description: p.description,
          provider: anunciante
            ? { name: anunciante, url: p.companies?.slug ? `${SITE}/empresa/${p.companies.slug}` : undefined }
            : null,
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
        {/* Trilha (breadcrumb) */}
        <nav aria-label="trilha" className="mb-4 hidden items-center gap-1 text-sm text-muted md:flex">
          <Link href="/" className="hover:text-text">Início</Link>
          <ChevronRight size={14} />
          <Link href={`/${p.cities?.slug}`} className="hover:text-text">{p.cities?.name}</Link>
          <ChevronRight size={14} />
          <Link href={`/${p.cities?.slug}/${p.property_types?.slug}s`} className="hover:text-text">
            {p.property_types?.name}
          </Link>
          <ChevronRight size={14} />
          <span className="truncate text-text">{p.neighborhoods?.name ?? p.title}</span>
        </nav>

        {/* HERO: galeria (esquerda) + card de conversão fixo (direita) */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_372px] lg:gap-10">
          <div>
            <Gallery
              images={images}
              title={p.title}
              badge={negoLabel[p.negotiation] ?? p.negotiation}
              featured={p.is_featured}
            />

            {/* Blocos de conteúdo */}
            <div className="mt-6 space-y-5">
              {/* 1. Identidade */}
              <section className="rounded-2xl border border-border p-6">
                <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
                  {p.reference_code && (
                    <span className="rounded-full border border-border bg-subtle px-2.5 py-1 text-[11px] font-bold text-link">
                      Cód. {p.reference_code}
                    </span>
                  )}
                  {posted && (
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      <Clock size={13} /> Anunciado {posted}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-extrabold leading-tight tracking-tight md:text-[28px]">{p.title}</h1>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-muted md:text-[15px]">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-link" />
                  <span className="flex flex-col gap-0.5 md:block">
                    {locationLines.map((line, i) => (
                      <span key={`${line}-${i}`} className="block md:inline">
                        {line}
                        {i < locationLines.length - 1 && <span className="hidden md:inline"> · </span>}
                      </span>
                    ))}
                  </span>
                </p>
              </section>

              {/* 2. Ficha técnica */}
              <PropertySpecs
                bedrooms={p.bedrooms}
                suites={p.suites}
                bathrooms={p.bathrooms}
                garages={p.garages}
                builtArea={p.built_area}
                landArea={p.land_area}
                floor={p.floor}
                totalFloors={p.total_floors}
              />

              {/* 3. Descrição */}
              {p.description && (
                <section className="rounded-2xl border border-border p-6">
                  <h2 className="mb-3 text-lg font-bold">Descrição</h2>
                  <p className="whitespace-pre-line text-[15px] leading-7 text-muted">{swapRegion(p.description)}</p>
                </section>
              )}

              {/* 4. Comodidades */}
              <AmenitiesCard features={features} />

              {/* 5. Formas de negociação */}
              <NegotiationCard
                negotiation={p.negotiation}
                acceptsFinancing={p.accepts_financing}
                acceptsMcmv={p.accepts_mcmv}
                acceptsExchange={p.accepts_exchange}
              />

              {/* 6. Custos */}
              {(p.condo_fee || p.iptu) && (
                <section className="rounded-2xl border border-border p-6">
                  <h2 className="mb-4 text-lg font-bold">Custos do imóvel</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {p.condo_fee ? (
                      <div className="rounded-xl bg-subtle p-4">
                        <span className="block text-xs text-muted">Condomínio</span>
                        <b className="mt-1 block text-base">
                          {brl(p.condo_fee)}
                          <span className="font-medium text-muted">/mês</span>
                        </b>
                      </div>
                    ) : null}
                    {p.iptu ? (
                      <div className="rounded-xl bg-subtle p-4">
                        <span className="block text-xs text-muted">IPTU</span>
                        <b className="mt-1 block text-base">
                          {brl(p.iptu)}
                          <span className="font-medium text-muted">/ano</span>
                        </b>
                      </div>
                    ) : null}
                  </div>
                </section>
              )}

              {/* 7. Localização */}
              {showMap && (
                <section className="rounded-2xl border border-border p-6">
                  <h2 className="mb-3 text-lg font-bold">Localização</h2>
                  <a
                    href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-subtle"
                  >
                    <MapPin size={16} className="text-link" /> Ver no mapa
                  </a>
                </section>
              )}
            </div>
          </div>

          {/* Desktop: card fixo (sticky). Mobile: CTA flutuante + sheet (abaixo). */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <ContactCard {...cardProps} />
          </aside>
        </div>

        {/* 8. Imóveis parecidos */}
        <RelatedProperties items={related} cityName={p.cities?.name} citySlug={p.cities?.slug} />
      </div>

      <MobileContactBar {...cardProps} />
    </main>
  );
}
