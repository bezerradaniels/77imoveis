// Geradores de JSON-LD (Schema.org) para SEO/GEO/LLM.
// Entidades consistentes ajudam buscadores e IA a entender o portal:
// site, organização, imóveis (listings), imobiliárias/corretores e a região.
import { SITE_URL, SITE_NAME, REGION, STATE, DEFAULT_OG_IMAGE } from './meta';

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

// WebSite + SearchAction: descreve a busca do marketplace para buscadores/IA.
export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'pt-BR',
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/imoveis?busca={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Organização (marca do portal) — entidade central para GEO/Knowledge Graph.
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    description: `Portal imobiliário regional do ${REGION}: casas, apartamentos, terrenos e imóveis comerciais à venda e para alugar, com imobiliárias, corretores e construtoras locais.`,
    areaServed: { '@type': 'AdministrativeArea', name: `${REGION}, Bahia, Brasil` },
    knowsLanguage: 'pt-BR',
  };
}

const businessFunction = (negotiation?: string | null) =>
  negotiation === 'venda' || negotiation === 'lancamento'
    ? 'http://purl.org/goodrelations/v1#Sell'
    : 'http://purl.org/goodrelations/v1#LeaseOut';

// Anúncio de imóvel — descreve o imóvel, endereço, geo, atributos e oferta.
export function realEstateListingLd(p: {
  title: string; url: string; images: string[]; price: number | null;
  city: string; state?: string; neighborhood?: string | null;
  street?: string | null; number?: string | null; postalCode?: string | null;
  lat?: number | null; lng?: number | null; description?: string;
  propertyType?: string | null; negotiation?: string | null;
  bedrooms?: number | null; bathrooms?: number | null;
  builtArea?: number | null; landArea?: number | null;
  priceVisibility?: 'publico' | 'sob_consulta'; datePosted?: string | null;
  provider?: { name: string; url?: string } | null;
}) {
  const streetAddress = [p.street, p.number].filter(Boolean).join(', ') || undefined;
  const rooms = (p.bedrooms ?? 0) > 0 ? p.bedrooms! : undefined;
  const baths = (p.bathrooms ?? 0) > 0 ? p.bathrooms! : undefined;
  const hasPrice = p.price != null && p.priceVisibility !== 'sob_consulta';

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: p.title,
    url: p.url,
    ...(p.images.length && { image: p.images }),
    ...(p.description && { description: p.description }),
    ...(p.propertyType && { category: p.propertyType }),
    ...(p.datePosted && { datePosted: p.datePosted }),
    address: {
      '@type': 'PostalAddress',
      ...(streetAddress && { streetAddress }),
      ...(p.neighborhood && { addressNeighborhood: p.neighborhood }),
      addressLocality: p.city,
      addressRegion: p.state ?? STATE,
      ...(p.postalCode && { postalCode: p.postalCode }),
      addressCountry: 'BR',
    },
    ...(p.lat != null && p.lng != null && {
      geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng },
    }),
    ...(rooms && { numberOfRooms: rooms }),
    ...(baths && { numberOfBathroomsTotal: baths }),
    ...(p.builtArea && {
      floorSize: { '@type': 'QuantitativeValue', value: p.builtArea, unitCode: 'MTK' },
    }),
    ...(p.landArea && {
      additionalProperty: {
        '@type': 'PropertyValue', name: 'Área do terreno', value: p.landArea, unitCode: 'MTK',
      },
    }),
    ...(hasPrice && {
      offers: {
        '@type': 'Offer',
        price: p.price,
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        businessFunction: businessFunction(p.negotiation),
        ...(p.provider && {
          seller: {
            '@type': 'RealEstateAgent',
            name: p.provider.name,
            ...(p.provider.url && { url: p.provider.url }),
          },
        }),
      },
    }),
  };
}

// Lista de itens (resultados da busca) — ajuda buscadores e IA a entenderem a página.
export function itemListLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.name, url: it.url,
    })),
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.name, item: it.url,
    })),
  };
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

// Imobiliária / corretor / empresa — entidade local com área de atuação.
export function realEstateAgentLd(c: {
  name: string; url: string; logo?: string | null; image?: string | null;
  phone?: string | null; city?: string | null; description?: string | null;
  specialties?: string[]; sameAs?: (string | null | undefined)[];
}) {
  const sameAs = (c.sameAs ?? []).filter(Boolean) as string[];
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${c.url}#agent`,
    name: c.name,
    url: c.url,
    ...(c.logo && { logo: c.logo }),
    ...((c.image || c.logo) && { image: c.image || c.logo }),
    ...(c.phone && { telephone: c.phone }),
    ...(c.description && { description: c.description }),
    address: {
      '@type': 'PostalAddress',
      ...(c.city && { addressLocality: c.city }),
      addressRegion: STATE,
      addressCountry: 'BR',
    },
    areaServed: { '@type': 'AdministrativeArea', name: `${REGION}, Bahia` },
    ...(c.specialties?.length && { knowsAbout: c.specialties }),
    ...(sameAs.length && { sameAs }),
    parentOrganization: { '@id': ORG_ID },
  };
}

export function localBusinessLd(c: {
  name: string; url: string; logo?: string; phone?: string; city: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: c.name, url: c.url, image: c.logo, telephone: c.phone,
    areaServed: { '@type': 'AdministrativeArea', name: `${REGION}, Bahia` },
    address: {
      '@type': 'PostalAddress',
      ...(c.city && { addressLocality: c.city }),
      addressRegion: STATE,
      addressCountry: 'BR',
    },
  };
}

// O componente <JsonLd /> que injeta estes objetos no <head> está em
// components/seo/JsonLd.tsx (arquivo .tsx por conter JSX).
