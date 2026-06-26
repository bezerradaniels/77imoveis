// =====================================================================
// ACESSO A DADOS — todas as consultas ao banco ficam AQUI.
// Quer mudar o que aparece numa página? Edite a função correspondente.
// =====================================================================
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from './supabase/server';
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
  'slug,reference_code,title,price,price_visibility,negotiation,bedrooms,bathrooms,garages,built_area,is_featured,cities(name,slug),neighborhoods(name),property_images(url,is_cover)';

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
  const { data } = await db().from('property_types').select('id,name,slug,icon').order('sort');
  return data ?? [];
}

// Contagem de imóveis ativos por slug de cidade (para os cards da home).
export async function getCityCounts(): Promise<Record<string, number>> {
  if (!hasEnv()) return {};
  const { data } = await db().from('properties').select('cities(slug)').eq('status', 'ativo');
  const m: Record<string, number> = {};
  for (const r of (data ?? []) as any[]) {
    const s = r.cities?.slug;
    if (s) m[s] = (m[s] ?? 0) + 1;
  }
  return m;
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

export async function getHomeProperties(limit = 24): Promise<CardProperty[]> {
  if (!hasEnv()) return [];
  const { data } = await db()
    .from('properties')
    .select(PROP_SELECT)
    .eq('status', 'ativo')
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
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

export async function getCitySearchInsights(cityId: string, citySlug: string) {
  if (!hasEnv()) {
    return {
      activeProperties: 0,
      companies: 0,
      neighborhoods: [] as { name: string; slug: string }[],
      cities: [] as { name: string; slug: string }[],
    };
  }

  const head = { count: 'exact' as const, head: true };
  const [properties, companies, neighborhoods, cities] = await Promise.all([
    db().from('properties').select('*', head).eq('status', 'ativo').eq('city_id', cityId),
    db().from('companies').select('*', head).eq('status', 'ativo').eq('city_id', cityId),
    db().from('neighborhoods').select('name,slug').eq('city_id', cityId).order('name').limit(6),
    db().from('cities').select('name,slug').neq('slug', citySlug).order('population', { ascending: false, nullsFirst: false }).limit(12),
  ]);

  return {
    activeProperties: properties.count ?? 0,
    companies: companies.count ?? 0,
    neighborhoods: neighborhoods.data ?? [],
    cities: cities.data ?? [],
  };
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
  if (f.minPrice != null) q = q.gte(f.negotiation ? 'property_negotiations.price' : 'price', f.minPrice);
  if (f.maxPrice != null) q = q.lte(f.negotiation ? 'property_negotiations.price' : 'price', f.maxPrice);

  if (f.sort === 'menor-preco')
    q = f.negotiation
      ? q.order('price', { ascending: true, nullsFirst: false, foreignTable: 'property_negotiations' } as any)
      : q.order('price', { ascending: true, nullsFirst: false });
  else if (f.sort === 'maior-preco')
    q = f.negotiation
      ? q.order('price', { ascending: false, nullsFirst: false, foreignTable: 'property_negotiations' } as any)
      : q.order('price', { ascending: false, nullsFirst: false });
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

// Slugs públicos de todos os imóveis ativos (para generateStaticParams/sitemap).
export async function getActivePropertySlugs(): Promise<string[]> {
  if (!hasEnv()) return [];
  const { data } = await db().from('properties').select('slug').eq('status', 'ativo');
  return (data ?? []).map((p: any) => p.slug);
}

// =====================================================================
// PAINEL (consultas autenticadas — usam a sessão + RLS do dono)
// =====================================================================

export type DashProperty = {
  id: string;
  slug: string;
  title: string;
  status: string;
  price: number | null;
  priceVisibility: 'publico' | 'sob_consulta';
  negotiation: Negotiation;
  cityName?: string;
  coverUrl: string;
  views: number;
  leads: number;
};

// ID do usuário logado (as policies de leitura são públicas, então filtramos por dono).
async function authUserId(): Promise<string | null> {
  const { data } = await createServerClient().auth.getUser();
  return data.user?.id ?? null;
}

// Imóveis do usuário logado (todos os status, para o painel).
export async function getMyProperties(): Promise<DashProperty[]> {
  if (!hasEnv()) return [];
  const uid = await authUserId();
  if (!uid) return [];
  const { data } = await createServerClient()
    .from('properties')
    .select(
      'id,slug,title,status,price,price_visibility,negotiation,views_count,leads_count,cities(name),property_images(url,is_cover)',
    )
    .eq('owner_id', uid)
    .order('updated_at', { ascending: false });
  return (data ?? []).map((p: any) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    status: p.status,
    price: p.price,
    priceVisibility: p.price_visibility,
    negotiation: p.negotiation,
    cityName: p.cities?.name,
    coverUrl:
      (p.property_images ?? []).find((i: any) => i.is_cover)?.url ??
      p.property_images?.[0]?.url ??
      PLACEHOLDER,
    views: p.views_count ?? 0,
    leads: p.leads_count ?? 0,
  }));
}

// Listas para os formulários (cidades, bairros, características).
export async function getCitiesAll() {
  if (!hasEnv()) return [];
  const { data } = await db().from('cities').select('id,name,slug').order('name');
  return data ?? [];
}

export async function getNeighborhoods(cityId: string) {
  if (!hasEnv()) return [];
  const { data } = await db().from('neighborhoods').select('id,name').eq('city_id', cityId).order('name');
  return data ?? [];
}

export async function getFeaturesAll() {
  if (!hasEnv()) return [];
  const { data } = await db().from('features').select('id,name,slug,category').order('category');
  return data ?? [];
}

// Imóvel do dono para edição (todas as relações editáveis).
export async function getPropertyForEdit(id: string) {
  if (!hasEnv()) return null;
  const { data } = await createServerClient()
    .from('properties')
    .select(
      '*,property_negotiations(negotiation,price,price_visibility,is_primary),' +
        'property_features(feature_id),property_images(url,sort,is_cover)',
    )
    .eq('id', id)
    .maybeSingle();
  return data;
}

// Empresa do usuário logado (para o onboarding/edição). Inclui cidades e especialidades.
export async function getMyCompany() {
  if (!hasEnv()) return null;
  const uid = await authUserId();
  if (!uid) return null;
  const { data } = await createServerClient()
    .from('companies')
    .select('*,company_cities(city_id),company_specialties(specialty_id),brokers(*)')
    .eq('owner_id', uid)
    .order('created_at', { ascending: true })
    .limit(1);
  return data?.[0] ?? null;
}

export async function getSpecialties() {
  if (!hasEnv()) return [];
  const { data } = await db().from('specialties').select('id,name,slug').order('name');
  return data ?? [];
}

// =====================================================================
// DIRETÓRIO DE PROFISSIONAIS / EMPRESAS (público)
// =====================================================================

// Slugs de empresas ativas (para o sitemap).
export async function getActiveCompanySlugs(): Promise<string[]> {
  if (!hasEnv()) return [];
  const { data } = await db().from('companies').select('slug').eq('status', 'ativo');
  return (data ?? []).map((c: any) => c.slug);
}

export async function getCompanies(type?: string) {
  if (!hasEnv()) return [];
  let q = db()
    .from('companies')
    .select('trade_name,slug,type,city_id,logo_url,is_verified,is_featured,cities(name)')
    .eq('status', 'ativo');
  if (type) q = q.eq('type', type);
  const { data } = await q
    .order('is_featured', { ascending: false })
    .order('trade_name');
  return data ?? [];
}

// Empresa pública pelo slug (perfil + especialidades + imóveis ativos).
export async function getCompanyBySlug(slug: string) {
  if (!hasEnv()) return null;
  const { data } = await db()
    .from('companies')
    .select(
      '*,cities(name,slug),company_specialties(specialties(name,slug))',
    )
    .eq('slug', slug)
    .eq('status', 'ativo')
    .maybeSingle();
  if (!data) return null;
  const { data: props } = await db()
    .from('properties')
    .select(PROP_SELECT)
    .eq('company_id', (data as any).id)
    .eq('status', 'ativo')
    .order('is_featured', { ascending: false })
    .limit(24);
  return { company: data, properties: (props ?? []).map(toCard) };
}

// =====================================================================
// VITRINE (catálogo próprio da empresa)
// =====================================================================

// Empresa + vitrine do usuário logado (para o editor). storefront pode ser null.
export async function getMyStorefront() {
  if (!hasEnv()) return { company: null, storefront: null };
  const uid = await authUserId();
  if (!uid) return { company: null, storefront: null };
  const sb = createServerClient();
  const { data: companies } = await sb
    .from('companies')
    .select('id,trade_name,slug,logo_url,whatsapp,phone')
    .eq('owner_id', uid)
    .limit(1);
  const company = companies?.[0] ?? null;
  if (!company) return { company: null, storefront: null };
  const { data: storefront } = await sb
    .from('storefronts')
    .select('*')
    .eq('company_id', (company as any).id)
    .maybeSingle();
  return { company, storefront };
}

// Valor de uma configuração do site (jsonb). Ex.: tabela de preços da vitrine.
export async function getSiteSetting(key: string) {
  if (!hasEnv()) return null;
  const { data } = await db().from('site_settings').select('value').eq('key', key).maybeSingle();
  return (data as any)?.value ?? null;
}

export async function getPlans() {
  if (!hasEnv()) return [];
  const { data } = await db()
    .from('plans')
    .select('name,slug,audience,max_active_listings,price,interval,included_featured,highlight,benefits')
    .eq('is_active', true)
    .order('sort');
  return data ?? [];
}

// Vitrine pública (só ativa, via RLS) + imóveis ativos da empresa.
export async function getStorefrontBySlug(slug: string) {
  if (!hasEnv()) return null;
  const { data: sf } = await db()
    .from('storefronts')
    .select('*,companies(id,trade_name,slug,whatsapp,phone,website,instagram)')
    .eq('slug', slug)
    .maybeSingle();
  if (!sf) return null;
  const { data: props } = await db()
    .from('properties')
    .select(PROP_SELECT)
    .eq('company_id', (sf as any).companies.id)
    .eq('status', 'ativo')
    .order('is_featured', { ascending: false })
    .limit(48);
  return { storefront: sf, properties: (props ?? []).map(toCard) };
}

export async function getActiveStorefronts() {
  if (!hasEnv()) return [];
  const { data } = await db()
    .from('storefronts')
    .select('slug,headline,about,logo_url,cover_url,accent_color,companies(trade_name,slug,whatsapp,phone)')
    .eq('status', 'ativo')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getActiveStorefrontSlugs(): Promise<string[]> {
  if (!hasEnv()) return [];
  const { data } = await db()
    .from('storefronts')
    .select('slug')
    .eq('status', 'ativo')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
  return (data ?? []).map((s: any) => s.slug);
}

// Contatos (leads) recebidos pelo usuário logado.
export async function getMyLeads() {
  if (!hasEnv()) return [];
  const { data } = await createServerClient()
    .from('leads')
    .select('id,name,email,phone,message,channel,status,created_at,properties(title,slug)')
    .order('created_at', { ascending: false })
    .limit(200);
  return data ?? [];
}

// Referência de contato de um imóvel ativo (para gravar o lead com o dono certo).
export async function getPropertyContactRef(slug: string) {
  if (!hasEnv()) return null;
  const { data } = await db()
    .from('properties')
    .select('id,owner_id,company_id')
    .eq('slug', slug)
    .eq('status', 'ativo')
    .maybeSingle();
  return data as { id: string; owner_id: string; company_id: string | null } | null;
}

// =====================================================================
// ADMIN (consultas autenticadas; a policy is_admin() libera acesso total)
// =====================================================================

export async function adminCounts() {
  if (!hasEnv()) return null;
  const sb = createServerClient();
  const head = { count: 'exact' as const, head: true };
  const [props, ativos, moderacao, companies, leads, users] = await Promise.all([
    sb.from('properties').select('*', head),
    sb.from('properties').select('*', head).eq('status', 'ativo'),
    sb.from('properties').select('*', head).eq('status', 'em_moderacao'),
    sb.from('companies').select('*', head),
    sb.from('leads').select('*', head),
    sb.from('profiles').select('*', head),
  ]);
  return {
    properties: props.count ?? 0,
    ativos: ativos.count ?? 0,
    moderacao: moderacao.count ?? 0,
    companies: companies.count ?? 0,
    leads: leads.count ?? 0,
    users: users.count ?? 0,
  };
}

export async function adminListProperties(status?: string) {
  if (!hasEnv()) return [];
  let q = createServerClient()
    .from('properties')
    .select('id,slug,title,status,is_featured,price,price_visibility,negotiation,created_at,cities(name),profiles!properties_owner_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (status) q = q.eq('status', status);
  const { data } = await q;
  return data ?? [];
}

export async function adminListCompanies() {
  if (!hasEnv()) return [];
  const { data } = await createServerClient()
    .from('companies')
    .select('id,trade_name,slug,type,status,is_verified,is_featured,cities(name)')
    .order('created_at', { ascending: false })
    .limit(200);
  return data ?? [];
}

export async function adminListUsers() {
  if (!hasEnv()) return [];
  const { data } = await createServerClient()
    .from('profiles')
    .select('id,full_name,email,phone,role,created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  return data ?? [];
}

export async function adminListCities() {
  if (!hasEnv()) return [];
  const { data } = await createServerClient()
    .from('cities')
    .select('id,name,slug,is_featured,population,neighborhoods(count)')
    .order('name');
  return data ?? [];
}

// Imóvel completo pelo slug (com fotos, modalidades, características e contato).
export async function getPropertyBySlug(slug: string) {
  if (!hasEnv()) return null;

  const select =
    '*,cities(name,slug,state),neighborhoods(name,slug),property_types(name,slug),' +
    'property_images(url,alt,sort,is_cover),' +
    'property_negotiations(negotiation,price,price_visibility,unit,is_primary),' +
    'property_features(features(name,slug,icon)),' +
    'companies(trade_name,slug,phone,whatsapp,logo_url),' +
    'profiles!properties_owner_id_fkey(full_name,phone,whatsapp)';

  const query = db()
    .from('properties')
    .select(select)
    .eq('status', 'ativo');

  const code = slug.match(/(?:^|-)imv-[a-z0-9]+$/i)?.[0]?.replace(/^-/, '').toUpperCase();
  const { data } = code
    ? await query.eq('reference_code', code).maybeSingle()
    : await query.eq('slug', slug).maybeSingle();

  if (data || code) return data;

  const { data: fallback } = await db()
    .from('properties')
    .select(select)
    .eq('status', 'ativo')
    .ilike('slug', `${slug}-imv-%`)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  return fallback;
}
