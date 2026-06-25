import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { JsonLd } from '@/components/seo/JsonLd';
import { realEstateListingLd, breadcrumbLd } from '@/lib/seo/jsonld';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://77imoveis.com.br';

// Só tenta falar com o Supabase se as variáveis estiverem configuradas.
// Assim o primeiro build funciona mesmo antes do banco estar pronto.
const hasSupabase =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Pré-gera uma página para cada imóvel ativo (quando o banco existir).
export async function generateStaticParams() {
  if (!hasSupabase) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('properties')
      .select('slug')
      .eq('status', 'ativo');
    return (data ?? []).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

async function getProperty(slug: string) {
  if (!hasSupabase) return null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('properties')
      .select(
        '*, cities(name,slug), neighborhoods(name,slug), property_images(url,alt,sort,is_cover), property_types(name,slug)',
      )
      .eq('slug', slug)
      .eq('status', 'ativo')
      .single();
    return data;
  } catch {
    return null;
  }
}

// Metadata dinâmica por imóvel (title, description, OG).
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProperty(params.slug);
  if (!p) return {};
  const title = `${p.title} | 77Imóveis`;
  const description = (p.description ?? '').slice(0, 155);
  const url = `${SITE}/imovel/${p.slug}`;
  const cover = p.property_images?.find((i: any) => i.is_cover)?.url;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, images: cover ? [cover] : [], type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: cover ? [cover] : [] },
  };
}

export default async function ImovelPage({ params }: { params: { slug: string } }) {
  const p = await getProperty(params.slug);
  if (!p) notFound();

  const url = `${SITE}/imovel/${p.slug}`;
  const images = (p.property_images ?? []).map((i: any) => i.url);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      {/* Dados estruturados para Google e buscadores de IA */}
      <JsonLd data={realEstateListingLd({
        title: p.title, url, images, price: p.price,
        city: p.cities?.name, lat: p.latitude, lng: p.longitude, description: p.description,
      })} />
      <JsonLd data={breadcrumbLd([
        { name: 'Início', url: SITE },
        { name: p.cities?.name, url: `${SITE}/${p.cities?.slug}` },
        { name: p.property_types?.name, url: `${SITE}/${p.cities?.slug}/${p.property_types?.slug}s` },
        { name: p.title, url },
      ])} />

      <nav aria-label="trilha" className="mb-4 text-sm text-muted">
        <a href="/">Início</a> › <a href={`/${p.cities?.slug}`}>{p.cities?.name}</a> › {p.title}
      </nav>

      <article>
        <h1 className="text-2xl font-bold text-text">{p.title}</h1>
        <p className="mt-1 text-muted">
          {p.neighborhoods?.name ? `${p.neighborhoods.name}, ` : ''}{p.cities?.name} - BA
        </p>
        {/* Galeria, infos, mapa e formulário de lead entram aqui (ver componentes). */}
      </article>
    </main>
  );
}
