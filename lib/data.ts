// =====================================================================
// ACESSO A DADOS — todas as consultas ao banco ficam AQUI.
// Quer mudar o que aparece numa página? Edite a função correspondente.
// =====================================================================
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from './supabase/server';
import type { Database } from './supabase/types';
import { publicCompanyTypeValues } from './constants';

// Cookie que guarda a empresa em foco no painel ('pessoal' = perfil pessoal).
export const ACTIVE_COMPANY_COOKIE = 'active_company';

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
type PublicCompanyType = (typeof publicCompanyTypeValues)[number];
type ListingStatus = Database['public']['Enums']['listing_status'];
const listingStatuses: ListingStatus[] = ['ativo', 'rascunho', 'pausado', 'arquivado', 'em_moderacao', 'reprovado'];
const activeCompanyStatuses = ['ativo'];

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
  advertiserName?: string | null;
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
    advertiserName: p.companies?.trade_name ?? p.profiles?.full_name ?? null,
    coverUrl: cover?.url ?? PLACEHOLDER,
    isFeatured: p.is_featured,
  };
}

const PROP_SELECT =
  'slug,reference_code,title,price,price_visibility,negotiation,bedrooms,bathrooms,garages,built_area,is_featured,cities(name,slug),neighborhoods(name),companies(trade_name),profiles!properties_owner_id_fkey(full_name),property_images(url,is_cover)';

export async function getFeaturedCities() {
  if (!hasEnv()) return [];
  const { data } = await db()
    .from('cities')
    .select('id,name,slug')
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
      neighborhoods: [] as { id: string; name: string; slug: string }[],
      cities: [] as { name: string; slug: string }[],
    };
  }

  const head = { count: 'exact' as const, head: true };
  const [properties, companies, neighborhoods, cities] = await Promise.all([
    db().from('properties').select('*', head).eq('status', 'ativo').eq('city_id', cityId),
    db().from('companies').select('*', head).in('status', activeCompanyStatuses).eq('city_id', cityId),
    db().from('neighborhoods').select('id,name,slug').eq('city_id', cityId).order('name'),
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
  typeIds?: string[]; // múltipla escolha de tipo (ex.: casa + apartamento)
  neighborhoodId?: string;
  negotiations?: Negotiation[];
  acceptsExchange?: boolean;
  text?: string; // busca livre por título (usada pelo SearchAction do schema)
  bedrooms?: string[]; // '1' | '2' | '3' | '4+' (múltipla escolha)
  bathrooms?: string[];
  garages?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: 'recentes' | 'menor-preco' | 'maior-preco';
  page?: number;
  perPage?: number;
};

// Busca de imóveis ativos com filtros. Retorna a página e o total (paginação).
// A busca por modalidade consulta property_negotiations (um imóvel pode ter várias).
// Com 2+ modalidades marcadas, resolve os ids batendo antes (evita duplicar a
// linha do imóvel quando ele bate em mais de uma modalidade selecionada).
export async function searchProperties(
  f: SearchFilters,
): Promise<{ items: CardProperty[]; total: number }> {
  if (!hasEnv()) return { items: [], total: 0 };
  const perPage = f.perPage ?? 12;
  const page = Math.max(1, f.page ?? 1);
  const from = (page - 1) * perPage;
  const single = f.negotiations?.length === 1 ? f.negotiations[0] : undefined;
  const multi = (f.negotiations?.length ?? 0) > 1;

  let matchedIds: string[] | undefined;
  if (multi) {
    const { data: negos } = await db()
      .from('property_negotiations')
      .select('property_id')
      .in('negotiation', f.negotiations!);
    matchedIds = [...new Set((negos ?? []).map((n: any) => n.property_id))];
    if (!matchedIds.length) return { items: [], total: 0 };
  }

  const select = single
    ? `${PROP_SELECT},property_negotiations!inner(negotiation,price,price_visibility)`
    : PROP_SELECT;

  let q = db().from('properties').select(select, { count: 'exact' }).eq('status', 'ativo');
  if (f.cityId) q = q.eq('city_id', f.cityId);
  if (f.typeIds?.length) q = q.in('property_type_id', f.typeIds);
  else if (f.typeId) q = q.eq('property_type_id', f.typeId);
  if (f.neighborhoodId) q = q.eq('neighborhood_id', f.neighborhoodId);
  // Busca livre por título (saneada para não quebrar o filtro ilike).
  const text = f.text?.replace(/[%,]/g, ' ').trim();
  if (text) q = q.ilike('title', `%${text}%`);
  if (single) q = q.eq('property_negotiations.negotiation', single);
  if (matchedIds) q = q.in('id', matchedIds);
  if (f.acceptsExchange) q = q.eq('accepts_exchange', true);
  const orList = (column: string, values?: string[]) =>
    values?.length ? values.map((v) => (v === '4+' ? `${column}.gte.4` : `${column}.eq.${v}`)).join(',') : undefined;
  const bedroomsOr = orList('bedrooms', f.bedrooms);
  if (bedroomsOr) q = q.or(bedroomsOr);
  const bathroomsOr = orList('bathrooms', f.bathrooms);
  if (bathroomsOr) q = q.or(bathroomsOr);
  const garagesOr = orList('garages', f.garages);
  if (garagesOr) q = q.or(garagesOr);
  if (f.minPrice != null) q = q.gte(single ? 'property_negotiations.price' : 'price', f.minPrice);
  if (f.maxPrice != null) q = q.lte(single ? 'property_negotiations.price' : 'price', f.maxPrice);

  if (f.sort === 'menor-preco')
    q = single
      ? q.order('price', { ascending: true, nullsFirst: false, foreignTable: 'property_negotiations' } as any)
      : q.order('price', { ascending: true, nullsFirst: false });
  else if (f.sort === 'maior-preco')
    q = single
      ? q.order('price', { ascending: false, nullsFirst: false, foreignTable: 'property_negotiations' } as any)
      : q.order('price', { ascending: false, nullsFirst: false });
  else q = q
    .order('boosted_until', { ascending: false, nullsFirst: false }) // Topo da busca (avulso pago)
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false });

  const { data, count } = await q.range(from, from + perPage - 1);

  const items = (data ?? []).map((p: any) => {
    const card = toCard(p);
    // Ao filtrar por uma única modalidade, mostra o preço daquela modalidade (não o principal).
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

// Imóveis parecidos: mesma cidade (e mesmo tipo, quando houver), excluindo o
// próprio anúncio. Se faltarem do mesmo tipo, completa com outros da cidade.
export async function getRelatedProperties(
  cityId: string,
  typeId: string | null,
  excludeSlug: string,
  limit = 8,
): Promise<CardProperty[]> {
  if (!hasEnv() || !cityId) return [];

  let q = db()
    .from('properties')
    .select(PROP_SELECT)
    .eq('status', 'ativo')
    .eq('city_id', cityId)
    .neq('slug', excludeSlug);
  if (typeId) q = q.eq('property_type_id', typeId);

  const { data } = await q
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  let items = (data ?? []).map(toCard);

  // Fallback: poucos do mesmo tipo → completa com outros imóveis da cidade.
  if (items.length < 4 && typeId) {
    const { data: more } = await db()
      .from('properties')
      .select(PROP_SELECT)
      .eq('status', 'ativo')
      .eq('city_id', cityId)
      .neq('slug', excludeSlug)
      .order('is_featured', { ascending: false })
      .limit(limit);
    const seen = new Set(items.map((i) => i.slug));
    for (const row of more ?? []) {
      const c = toCard(row);
      if (!seen.has(c.slug)) {
        items.push(c);
        seen.add(c.slug);
      }
    }
    items = items.slice(0, limit);
  }

  return items;
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
  // Escopo pela empresa ativa: contexto pessoal mostra imóveis sem empresa;
  // contexto de empresa mostra os imóveis daquela empresa.
  const company = await getMyCompany();
  let q = createServerClient()
    .from('properties')
    .select(
      'id,slug,title,status,price,price_visibility,negotiation,views_count,leads_count,cities(name),property_images(url,is_cover)',
    )
    .eq('owner_id', uid);
  q = company ? q.eq('company_id', company.id) : q.is('company_id', null);
  const { data } = await q.order('updated_at', { ascending: false });
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
  const { data } = await db().from('neighborhoods').select('id,name,slug').eq('city_id', cityId).order('name');
  return data ?? [];
}

// Bairros agrupados por slug da cidade — alimenta o autocomplete do hero
// (sugestões do bairro restritas à cidade escolhida).
export async function getNeighborhoodsByCity(): Promise<Record<string, { value: string; label: string }[]>> {
  if (!hasEnv()) return {};
  const { data } = await db().from('neighborhoods').select('name,slug,cities(slug)').order('name');
  const map: Record<string, { value: string; label: string }[]> = {};
  for (const n of (data ?? []) as any[]) {
    const citySlug = n.cities?.slug;
    if (!citySlug) continue;
    (map[citySlug] ??= []).push({ value: n.slug, label: n.name });
  }
  return map;
}

export async function getFeaturesAll() {
  if (!hasEnv()) return [];
  const { data } = await db().from('features').select('id,name,slug,category').order('category');
  return data ?? [];
}

// Imóvel do dono para edição (todas as relações editáveis).
// Restrito ao dono (ou admin/moderador) — evita que qualquer usuário logado
// leia dados de imóveis de terceiros trocando o id na URL do painel.
export async function getPropertyForEdit(id: string) {
  if (!hasEnv()) return null;
  const uid = await authUserId();
  if (!uid) return null;
  const client = createServerClient();
  const { data: profile } = await client.from('profiles').select('role').eq('id', uid).maybeSingle();
  const isAdmin = ['admin', 'moderador'].includes((profile as any)?.role);

  let query = client
    .from('properties')
    .select(
      '*,property_negotiations(negotiation,price,price_visibility,is_primary),' +
        'property_features(feature_id),property_images(url,sort,is_cover),' +
        'companies(brokers(id,name,email,whatsapp,phone))',
    )
    .eq('id', id);
  if (!isAdmin) query = query.eq('owner_id', uid);

  const { data } = await query.maybeSingle();
  return data;
}

// Empresas do usuário logado (lista enxuta para o seletor de empresa ativa).
export async function getMyCompanies() {
  if (!hasEnv()) return [];
  const uid = await authUserId();
  if (!uid) return [];
  const { data } = await createServerClient()
    .from('companies')
    .select('id,type,trade_name,slug,status')
    .eq('owner_id', uid)
    .order('created_at', { ascending: true });
  return data ?? [];
}

// Empresa em foco no painel, lida do cookie. 'pessoal' (ou cookie ausente sem
// empresas) significa contexto pessoal → null.
export function getActiveCompanyId(): string | null {
  return cookies().get(ACTIVE_COMPANY_COOKIE)?.value ?? null;
}

// Empresa ATIVA do usuário (cookie → valida posse → fallback na primeira).
// Inclui cidades, especialidades e corretores. Retorna null no contexto pessoal.
export async function getMyCompany() {
  if (!hasEnv()) return null;
  const uid = await authUserId();
  if (!uid) return null;
  const active = getActiveCompanyId();
  if (active === 'pessoal') return null;

  const sb = createServerClient();
  const sel = '*,company_cities(city_id),company_specialties(specialty_id),brokers(*)';
  if (active) {
    const { data } = await sb.from('companies').select(sel).eq('owner_id', uid).eq('id', active).maybeSingle();
    if (data) return data;
  }
  // Sem cookie válido → primeira empresa do usuário (ou null se não tiver nenhuma).
  const { data } = await sb.from('companies').select(sel).eq('owner_id', uid)
    .order('created_at', { ascending: true }).limit(1);
  return data?.[0] ?? null;
}

export type ListingPublishGate = {
  companyId: string | null;
  companyType: string | null;
  allowed: boolean;
  activeCount: number;
  maxActive: number;
  needsUpgrade: boolean;
};

// Regra de publicação do corretor autônomo:
// 1 imóvel ativo grátis; acima disso precisa de assinatura ativa/trial.
export async function getListingPublishGate(userId: string, excludePropertyId?: string): Promise<ListingPublishGate> {
  if (!hasEnv()) {
    return { companyId: null, companyType: null, allowed: true, activeCount: 0, maxActive: 1, needsUpgrade: false };
  }

  const sb = createServerClient();
  const active = getActiveCompanyId();
  let company: any = null;
  if (active && active !== 'pessoal') {
    ({ data: company } = await sb.from('companies').select('id,type').eq('owner_id', userId).eq('id', active).maybeSingle());
  }
  if (!company && active !== 'pessoal') {
    ({ data: company } = await sb.from('companies').select('id,type').eq('owner_id', userId)
      .order('created_at', { ascending: true }).limit(1).maybeSingle());
  }

  const companyId = (company as any)?.id ?? null;
  const companyType = (company as any)?.type ?? null;
  if (companyType !== 'corretor_autonomo') {
    return { companyId, companyType, allowed: true, activeCount: 0, maxActive: 100000, needsUpgrade: false };
  }

  const now = new Date().toISOString();
  const { data: subscriptions } = await sb
    .from('subscriptions')
    .select('status,current_period_end,max_listings_override,plans(max_active_listings)')
    .eq('company_id', companyId)
    .in('status', ['ativa', 'trial'])
    .or(`current_period_end.is.null,current_period_end.gt.${now}`)
    .order('created_at', { ascending: false })
    .limit(3);

  // Planos manuais personalizados definem o limite via override (sem plano do catálogo).
  const subscribedLimit = Math.max(
    0,
    ...((subscriptions ?? []) as any[]).map((s) =>
      Number(s.max_listings_override ?? s.plans?.max_active_listings ?? 0),
    ),
  );
  const maxActive = subscribedLimit || 1;

  let q = sb
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'ativo');
  if (excludePropertyId) q = q.neq('id', excludePropertyId);
  const { count } = await q;
  const activeCount = count ?? 0;

  return {
    companyId,
    companyType,
    allowed: activeCount < maxActive,
    activeCount,
    maxActive,
    needsUpgrade: maxActive <= 1 && activeCount >= 1,
  };
}

// Perfil completo do usuário logado (para edição em /painel/perfil e /admin/perfil).
export async function getMyProfile() {
  if (!hasEnv()) return null;
  const uid = await authUserId();
  if (!uid) return null;
  const { data } = await createServerClient()
    .from('profiles')
    .select('id,full_name,email,phone,whatsapp,avatar_url,city_id')
    .eq('id', uid)
    .maybeSingle();
  return data ?? null;
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
  const { data } = await db()
    .from('companies')
    .select('slug')
    .eq('status', 'ativo')
    .in('type', [...publicCompanyTypeValues]);
  return (data ?? []).map((c: any) => c.slug);
}

export async function getCompanies(type?: string) {
  if (!hasEnv()) return [];
  let q = db()
    .from('companies')
    .select('trade_name,slug,type,city_id,logo_url,is_verified,is_featured,cities!companies_city_id_fkey(name)')
    .eq('status', 'ativo');
  if (type) {
    if (!publicCompanyTypeValues.includes(type as PublicCompanyType)) return [];
    q = q.eq('type', type as PublicCompanyType);
  } else {
    q = q.in('type', [...publicCompanyTypeValues]);
  }
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
      '*,cities!companies_city_id_fkey(name,slug),company_specialties(specialties(name,slug))',
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
  // Respeita a empresa ativa (cookie), não "a primeira" do usuário.
  const company = await getMyCompany();
  if (!company) return { company: null, storefront: null };
  const { data: storefront } = await createServerClient()
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

export async function getMyBillingOverview() {
  if (!hasEnv()) {
    return { company: null, subscription: null, manualContract: null, activeProperties: 0, latestPayment: null };
  }

  const company = await getMyCompany();
  if (!company) return { company: null, subscription: null, manualContract: null, activeProperties: 0, latestPayment: null };

  const sb = createServerClient();
  const companyId = (company as any).id;
  const [subscription, manualContract, properties, payment] = await Promise.all([
    sb
      .from('subscriptions')
      .select('id,status,current_period_start,current_period_end,cancel_at_period_end,created_at,manual_contract_id,max_listings_override,custom_plan_name,plans(name,slug,price,interval,max_active_listings,included_featured)')
      .eq('company_id', companyId)
      .in('status', ['ativa', 'trial', 'pendente', 'inadimplente'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb
      .from('manual_contracts')
      .select('id,plan_name,status,payment_method,payment_status,max_active_listings,included_featured,starts_at,ends_at,public_notes')
      .eq('company_id', companyId)
      .not('status', 'in', '("cancelado")')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'ativo'),
    sb
      .from('payments')
      .select('id,status,amount,invoice_url,boleto_url,created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    company,
    subscription: subscription.data,
    manualContract: manualContract.data,
    activeProperties: properties.count ?? 0,
    latestPayment: payment.data,
  };
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
  const [props, ativos, moderacao, companies, brokers, leads, users] = await Promise.all([
    sb.from('properties').select('*', head),
    sb.from('properties').select('*', head).eq('status', 'ativo'),
    sb.from('properties').select('*', head).eq('status', 'em_moderacao'),
    sb.from('companies').select('*', head),
    sb.from('brokers').select('*', head),
    sb.from('leads').select('*', head),
    sb.from('profiles').select('*', head),
  ]);
  return {
    properties: props.count ?? 0,
    ativos: ativos.count ?? 0,
    moderacao: moderacao.count ?? 0,
    companies: companies.count ?? 0,
    brokers: brokers.count ?? 0,
    leads: leads.count ?? 0,
    users: users.count ?? 0,
  };
}

export async function adminListProperties(status?: string, search?: string) {
  if (!hasEnv()) return [];
  let q = createServerClient()
    .from('properties')
    .select('id,slug,title,status,is_featured,price,price_visibility,negotiation,created_at,cities(name),profiles!properties_owner_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (status && listingStatuses.includes(status as ListingStatus)) q = q.eq('status', status as ListingStatus);
  const text = search?.replace(/[%,]/g, ' ').trim();
  if (text) q = q.ilike('title', `%${text}%`);
  const { data } = await q;
  return data ?? [];
}

export async function adminListCompanies(filters: { status?: string; cityId?: string; text?: string } = {}) {
  if (!hasEnv()) return [];
  let q = createServerClient()
    .from('companies')
    .select('id,trade_name,legal_name,email,phone,whatsapp,slug,type,status,is_verified,is_featured,cities!companies_city_id_fkey(id,name),brokers(count),properties(count)')
    .order('created_at', { ascending: false })
    .limit(200);
  if (filters.status) q = q.eq('status', filters.status);
  else q = q.neq('status', 'removido');
  if (filters.cityId) q = q.eq('city_id', filters.cityId);
  const text = filters.text?.replace(/[%,]/g, ' ').trim();
  if (text) q = q.or(`trade_name.ilike.%${text}%,legal_name.ilike.%${text}%,email.ilike.%${text}%`);
  const { data } = await q;
  return data ?? [];
}

export async function adminListUsers(filters: { role?: string; status?: string; text?: string } = {}) {
  if (!hasEnv()) return [];
  let q = createServerClient()
    .from('profiles')
    .select('id,full_name,email,phone,whatsapp,role,is_active,created_at,companies(count),brokers(count),properties(count)')
    .order('created_at', { ascending: false })
    .limit(200);
  if (filters.role && ['particular', 'profissional', 'admin', 'moderador'].includes(filters.role)) q = q.eq('role', filters.role as any);
  if (filters.status === 'active') q = q.eq('is_active', true);
  if (filters.status === 'blocked') q = q.eq('is_active', false);
  if (!filters.status) q = q.eq('is_active', true);
  const text = filters.text?.replace(/[%,]/g, ' ').trim();
  if (text) q = q.or(`full_name.ilike.%${text}%,email.ilike.%${text}%,phone.ilike.%${text}%`);
  const { data } = await q;
  return data ?? [];
}

export async function adminListBrokers(filters: { status?: string; companyId?: string; cityId?: string; text?: string } = {}) {
  if (!hasEnv()) return [];
  let q = createServerClient()
    .from('brokers')
    .select('id,name,email,creci,phone,whatsapp,photo_url,status,verified_at,approved_at,rejected_at,disabled_at,created_at,companies!brokers_company_id_fkey(id,trade_name,slug,city_id,cities!companies_city_id_fkey(id,name)),profiles(id,full_name,email),properties(count)')
    .order('created_at', { ascending: false })
    .limit(200);
  if (filters.status) q = q.eq('status' as any, filters.status);
  else q = q.neq('status' as any, 'removido');
  if (filters.companyId) q = q.eq('company_id', filters.companyId);
  if (filters.cityId) q = q.eq('companies.city_id', filters.cityId);
  const text = filters.text?.replace(/[%,]/g, ' ').trim();
  if (text) q = q.or(`name.ilike.%${text}%,email.ilike.%${text}%,creci.ilike.%${text}%`);
  const { data } = await q;
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

export async function adminListNeighborhoods() {
  if (!hasEnv()) return [];
  const { data } = await createServerClient()
    .from('neighborhoods')
    .select('id,name,slug,created_at,cities(id,name,slug),properties(count),companies(count)')
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

export async function adminListSubscriptions() {
  if (!hasEnv()) return [];
  const { data } = await createServerClient()
    .from('subscriptions')
    .select('id,status,current_period_end,cancel_at_period_end,created_at,plans(name,slug,price,interval),companies(trade_name,slug)')
    .order('created_at', { ascending: false })
    .limit(200);
  return data ?? [];
}

export async function adminListBanners() {
  if (!hasEnv()) return [];
  const { data } = await createServerClient()
    .from('banners')
    .select('id,title,image_url,target_url,slot,is_active,impressions,clicks,created_at,cities(name)')
    .order('created_at', { ascending: false })
    .limit(200);
  return data ?? [];
}

export async function adminListStorefronts() {
  if (!hasEnv()) return [];
  const { data } = await createServerClient()
    .from('storefronts')
    .select('id,slug,headline,status,activated_at,expires_at,views_count,created_at,companies(trade_name,slug)')
    .order('created_at', { ascending: false })
    .limit(200);
  return data ?? [];
}
