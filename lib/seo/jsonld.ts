// Geradores de JSON-LD (Schema.org) para SEO/GEO.

export function realEstateListingLd(p: {
  title: string; url: string; images: string[]; price: number | null;
  city: string; state?: string; lat?: number | null; lng?: number | null;
  description?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: p.title,
    url: p.url,
    image: p.images,
    description: p.description,
    ...(p.price != null && {
      offers: { '@type': 'Offer', price: p.price, priceCurrency: 'BRL' },
    }),
    address: {
      '@type': 'PostalAddress',
      addressLocality: p.city,
      addressRegion: p.state ?? 'BA',
      addressCountry: 'BR',
    },
    ...(p.lat != null && p.lng != null && {
      geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng },
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

export function localBusinessLd(c: {
  name: string; url: string; logo?: string; phone?: string; city: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: c.name, url: c.url, image: c.logo, telephone: c.phone,
    address: { '@type': 'PostalAddress', addressLocality: c.city, addressRegion: 'BA', addressCountry: 'BR' },
  };
}

// O componente <JsonLd /> que injeta estes objetos no <head> está em
// components/seo/JsonLd.tsx (arquivo .tsx por conter JSX).
