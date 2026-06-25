// =====================================================================
// ACESSO A DADOS — todas as consultas ao banco ficam AQUI.
// Quer mudar o que aparece numa página? Edite a função correspondente.
// =====================================================================
import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase/types';

const hasEnv = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Cliente de leitura pública (sem login). A segurança vem da RLS no banco.
const db = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );

export type Negotiation = 'venda' | 'aluguel' | 'temporada' | 'romaria' | 'lancamento';

export type CardProperty = {
  slug: string;
  title: string;
  price: number | null;
  priceVisibility: 'publico' | 'sob_consulta';
  negotiation: Negotiation;
  bedrooms?: number;
  bathrooms?: number;
  garages?: number;
  builtArea?: number | null;
  cityName?: string;
  neighborhoodName?: string | null;
  coverUrl: string;
  isFeatured?: boolean;
};

const PLACEHOLDER = '/placeholder.svg';

// Converte uma linha do banco no formato usado pelo PropertyCard.
function toCard(p: any): CardProperty {
  const cover = (p.property_images ?? []).find((i: any) => i.is_cover) ?? p.property_images?.[0];
  return {
    slug: p.slug,
    title: p.title,
    price: p.price,
    priceVisibility: p.price_visibility,
    negotiation: p.negotiation,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    garages: p.garages,
    builtArea: p.built_area,
    cityName: p.cities?.name,
    neighborhoodName: p.neighborhoods?.name,
    coverUrl: cover?.url ?? PLACEHOLDER,
    isFeatured: p.is_featured,
  };
}

const PROP_SELECT =
  'slug,title,price,price_visibility,negotiation,bedrooms,bathrooms,garages,built_area,is_featured,cities(name,slug),neighborhoods(name),property_images(url,is_cover)';

export async function getFeaturedCities() {
  if (!hasEnv()) return [];
  const { data } = await db()
    .from('cities')
    .select('name,slug')
    .eq('is_featured', true)
    .order('population', { ascending: false, nullsFirst: false });
  return data ?? [];
}

export async function getPropertyTypes() {
  if (!hasEnv()) return [];
  const { data } = await db().from('property_types').select('name,slug,icon').order('sort');
  return data ?? [];
}

export async function getFeaturedProperties(negotiation: Negotiation, limit = 4): Promise<CardProperty[]> {
  if (!hasEnv()) return [];
  const { data } = await db()
    .from('properties')
    .select(PROP_SELECT)
    .eq('status', 'ativo')
    .eq('negotiation', negotiation)
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(limit);
  return (data ?? []).map(toCard);
}

// =====================================================================
// LISTAGEM / BUSCA  (/[cidade]/[tipo])
// =====================================================================

// Cidade pelo slug da URL (com textos de SEO/GEO). null se não existir.
export async function getCityBySlug(slug: string) {
  if (!hasEnv()) return null;
  const { data } = await db()
    .from('cities')
    .select('id,name,slug,state,intro_text,seo_title,seo_description')
    .eq('slug', slug)
    .maybeSingle();
  return data;
}

// Resolve o tipo de imóvel a partir do segmento da URL (plural ou singular):
// "casas" → Casa, "salas-comerciais"/"sala-comercial" → Sala Comercial.
export async function getTypeByUrlSlug(tipoUrl: string) {
  if (!hasEnv()) return null;
  const singular = tipoUrl.replace(/s$/, '');
  const { data } = await db()
    .from('property_types')
    .select('id,name,slug')
    .in('slug', [tipoUrl, singular])
    .limit(1);
  return data?.[0] ?? null;
}

export type SearchFilters = {
  cityId?: string;
  typeId?: string;
  negotiation?: Negotiation;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'recentes' | 'menor-preco' | 'maior-preco';
  page?: number;
  perPage?: number;
};

// Busca de imóveis ativos com filtros. Retorna a página e o total (paginação).
// A busca por modalidade consulta property_negotiations (um imóvel pode ter várias).
export async function searchProperties(
  f: SearchFilters,
): Promise<{ items: CardProperty[]; total: number }> {
  if (!hasEnv()) return { items: [], total: 0 };
  const perPage = f.perPage ?? 12;
  const page = Math.max(1, f.page ?? 1);
  const from = (page - 1) * perPage;

  const select = f.negotiation
    ? `${PROP_SELECT},property_negotiations!inner(negotiation,price,price_visibility)`
    : PROP_SELECT;

  let q = db().from('properties').select(select, { count: 'exact' }).eq('status', 'ativo');
  if (f.cityId) q = q.eq('city_id', f.cityId);
  if (f.typeId) q = q.eq('property_type_id', f.typeId);
  if (f.negotiation) q = q.eq('property_negotiations.negotiation', f.negotiation);
  if (f.bedrooms) q = q.gte('bedrooms', f.bedrooms);
  if (f.minPrice != null) q = q.gte('price', f.minPrice);
  if (f.maxPrice != null) q = q.lte('price', f.maxPrice);

  if (f.sort === 'menor-preco') q = q.order('price', { ascending: true, nullsFirst: false });
  else if (f.sort === 'maior-preco') q = q.order('price', { ascending: false, nullsFirst: false });
  else q = q.order('is_featured', { ascending: false }).order('published_at', { ascending: false });

  const { data, count } = await q.range(from, from + perPage - 1);

  const items = (data ?? []).map((p: any) => {
    const card = toCard(p);
    // Ao filtrar por modalidade, mostra o preço daquela modalidade (não o principal).
    const neg = p.property_negotiations?.[0];
    if (neg) {
      card.negotiation = neg.negotiation;
      card.price = neg.price;
      card.priceVisibility = neg.price_visibility;
    }
    return card;
  });
  return { items, total: count ?? 0 };
}

// =====================================================================
// PÁGINA DO IMÓVEL  (/imovel/[slug])
// =====================================================================

// Slugs de todos os imóveis ativos (para generateStaticParams).
export async function getActivePropertySlugs(): Promise<string[]> {
  if (!hasEnv()) return [];
  const { data } = await db().from('properties').select('slug').eq('status', 'ativo');
  return (data ?? []).map((p: any) => p.slug);
}

// Imóvel completo pelo slug (com fotos, modalidades, características e contato).
export async function getPropertyBySlug(slug: string) {
  if (!hasEnv()) return null;
  const { data } = await db()
    .from('properties')
    .select(
      '*,cities(name,slug,state),neighborhoods(name,slug),property_types(name,slug),' +
        'property_images(url,alt,sort,is_cover),' +
        'property_negotiations(negotiation,price,price_visibility,unit,is_primary),' +
        'property_features(features(name,slug,icon)),' +
        'companies(trade_name,slug,phone,whatsapp,logo_url),' +
        'profiles(full_name,phone,whatsapp)',
    )
    .eq('slug', slug)
    .eq('status', 'ativo')
    .maybeSingle();
  return data;
}
