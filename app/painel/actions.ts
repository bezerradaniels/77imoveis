'use server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import { getListingPublishGate, getNeighborhoods, ACTIVE_COMPANY_COOKIE } from '@/lib/data';
import { slugify } from '@/lib/format';
import { propertyInputSchema, firstZodError } from '@/lib/validation';

type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

// Define a empresa em foco no painel ('pessoal' = perfil pessoal).
export async function setActiveCompany(companyId: string) {
  cookies().set(ACTIVE_COMPANY_COOKIE, companyId || 'pessoal', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  revalidatePath('/painel', 'layout');
}

type Result = { ok?: true; error?: string };

export type NegotiationInput = {
  negotiation: Database['public']['Enums']['negotiation_type'];
  price: number | null;
  priceVisibility: 'publico' | 'sob_consulta';
};

export type PropertyInput = {
  id?: string;
  title: string;
  description?: string;
  shortDescription?: string;
  typeId: string;
  citySlug: string;
  cityId: string;
  neighborhoodId?: string;
  // Endereço
  street?: string;
  number?: string;
  complement?: string;
  zipcode?: string;
  hideExactLocation?: boolean;
  // Detalhes
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  garages?: number;
  builtArea?: number | null;
  landArea?: number | null;
  floor?: number | null;
  condoName?: string;
  furnished?: string | null;
  condition?: string | null;
  availability?: string;
  // Preço e condições
  condoFee?: number | null;
  iptu?: number | null;
  acceptsFinancing?: boolean;
  acceptsMcmv?: boolean;
  acceptsExchange?: boolean;
  negotiable?: boolean;
  // Mídia
  videoUrl?: string;
  tourUrl?: string;
  // Contato do anúncio
  contactName?: string;
  contactCompany?: string;
  contactWhatsapp?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactMethods?: string[];
  contactPref?: string;
  showPhone?: boolean;
  leadEmail?: string;
  brokerId?: string | null;
  negotiations: NegotiationInput[];
  featureIds: string[];
  images: string[];
  publish: boolean;
};

// Bairros de uma cidade (usado no dropdown dependente do formulário).
export async function loadNeighborhoods(cityId: string) {
  return getNeighborhoods(cityId);
}

export async function logout() {
  await createClient().auth.signOut();
  redirect('/entrar');
}

async function uniqueSlug(sb: any, base: string, excludeId?: string) {
  let slug = base || 'imovel';
  let n = 1;
  for (;;) {
    const { data } = await sb.from('properties').select('id').eq('slug', slug).maybeSingle();
    if (!data || data.id === excludeId) return slug;
    slug = `${base}-${++n}`;
  }
}

async function uniqueReferenceCode(sb: any) {
  for (;;) {
    const code = `IMV-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const { data } = await sb.from('properties').select('id').eq('reference_code', code).maybeSingle();
    if (!data) return code;
  }
}

// Cria ou edita um imóvel + modalidades + características + fotos.
export async function saveProperty(input: PropertyInput): Promise<{ id?: string; slug?: string; status?: string; error?: string }> {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: 'Sessão expirada. Entre novamente.' };

  const parsed = propertyInputSchema.safeParse(input);
  if (!parsed.success) return { error: firstZodError(parsed.error, 'Revise os campos do anúncio.') };

  if (input.neighborhoodId) {
    const { data: neighborhood } = await sb
      .from('neighborhoods')
      .select('id')
      .eq('id', input.neighborhoodId)
      .eq('city_id', input.cityId)
      .maybeSingle();
    if (!neighborhood) return { error: 'Selecione novamente o bairro do imóvel.' };
  }

  const publishGate = await getListingPublishGate(auth.user.id, input.id);
  if (input.publish && !publishGate.allowed) {
    return {
      error: 'Corretor autônomo pode manter 1 imóvel ativo gratuitamente. Para publicar mais imóveis, assine um plano profissional.',
    };
  }

  const primary = input.negotiations[0];
  const publishStatus = input.publish
    ? process.env.REQUIRE_LISTING_MODERATION === 'true'
      ? 'em_moderacao'
      : 'ativo'
    : 'rascunho';
  const initialStatus = input.id ? publishStatus : 'rascunho';
  const base: PropertyUpdate & Omit<PropertyInsert, 'slug'> = {
    owner_id: auth.user.id,
    title: input.title,
    description: input.description || null,
    short_description: input.shortDescription || null,
    property_type_id: input.typeId,
    city_id: input.cityId,
    neighborhood_id: input.neighborhoodId || null,
    street: input.street || null,
    number: input.number || null,
    complement: input.complement || null,
    zipcode: input.zipcode || null,
    hide_exact_location: input.hideExactLocation ?? false,
    bedrooms: input.bedrooms ?? 0,
    suites: input.suites ?? 0,
    bathrooms: input.bathrooms ?? 0,
    garages: input.garages ?? 0,
    built_area: input.builtArea ?? null,
    land_area: input.landArea ?? null,
    floor: input.floor ?? null,
    condo_name: input.condoName || null,
    furnished: input.furnished || null,
    condition: input.condition || null,
    availability: input.availability || 'disponivel',
    condo_fee: input.condoFee ?? null,
    iptu: input.iptu ?? null,
    accepts_financing: input.acceptsFinancing ?? false,
    accepts_mcmv: input.acceptsMcmv ?? false,
    accepts_exchange: input.acceptsExchange ?? false,
    negotiable: input.negotiable ?? true,
    video_url: input.videoUrl || null,
    tour_url: input.tourUrl || null,
    contact_name: input.contactName || null,
    contact_company: input.contactCompany || null,
    contact_whatsapp: input.contactWhatsapp || null,
    contact_phone: input.contactPhone || null,
    contact_email: input.contactEmail || null,
    contact_methods: input.contactMethods?.length ? input.contactMethods : [input.contactPref || 'whatsapp'],
    contact_pref: input.contactPref || 'whatsapp',
    show_phone: input.showPhone ?? true,
    lead_email: input.leadEmail || null,
    broker_id: input.brokerId || null,
    negotiation: primary.negotiation,
    price: primary.price,
    price_visibility: primary.priceVisibility,
    status: initialStatus,
    published_at: initialStatus === 'ativo' ? new Date().toISOString() : null,
  };

  let id = input.id;
  // company_id é definido só na CRIAÇÃO (pela empresa ativa). Em edição, nunca
  // sobrescrevemos — evita migrar o imóvel para outra empresa ao editar com
  // outra empresa ativa no seletor.
  if (!id) base.company_id = publishGate.companyId;
  if (id) {
    const { error } = await sb.from('properties').update(base).eq('id', id);
    if (error) return { error: friendly(error.message) };
  } else {
    const referenceCode = await uniqueReferenceCode(sb);
    const insertPayload: PropertyInsert = {
      ...base,
      reference_code: referenceCode,
      slug: await uniqueSlug(sb, slugify(`${input.title}-${input.citySlug}-${referenceCode}`)),
    };
    const { data, error } = await sb.from('properties').insert(insertPayload).select('id').single();
    if (error) return { error: friendly(error.message) };
    id = data!.id;
  }

  // Modalidades (substitui tudo). A 1ª é a principal.
  const { error: negDeleteError } = await sb.from('property_negotiations').delete().eq('property_id', id);
  if (negDeleteError) return { error: friendly(negDeleteError.message) };
  const { error: negInsertError } = await sb.from('property_negotiations').insert(
    input.negotiations.map((n, i) => ({
      property_id: id,
      negotiation: n.negotiation,
      price: n.priceVisibility === 'sob_consulta' ? null : n.price,
      price_visibility: n.priceVisibility,
      is_primary: i === 0,
    })),
  );
  if (negInsertError) return { error: friendly(negInsertError.message) };

  // Características (substitui tudo).
  const { error: featuresDeleteError } = await sb.from('property_features').delete().eq('property_id', id);
  if (featuresDeleteError) return { error: friendly(featuresDeleteError.message) };
  if (input.featureIds.length)
    {
      const { error: featuresInsertError } = await sb.from('property_features').insert(
      input.featureIds.map((feature_id) => ({ property_id: id, feature_id })),
      );
      if (featuresInsertError) return { error: friendly(featuresInsertError.message) };
    }

  // Fotos (substitui tudo; 1ª é a capa).
  const { error: imagesDeleteError } = await sb.from('property_images').delete().eq('property_id', id);
  if (imagesDeleteError) return { error: friendly(imagesDeleteError.message) };
  if (input.images.length)
    {
      const { error: imagesInsertError } = await sb.from('property_images').insert(
      input.images.map((url, i) => ({ property_id: id, url, sort: i, is_cover: i === 0 })),
      );
      if (imagesInsertError) return { error: friendly(imagesInsertError.message) };
    }

  if (!input.id && publishStatus !== 'rascunho') {
    const { error: publishError } = await sb
      .from('properties')
      .update({
        status: publishStatus,
        published_at: publishStatus === 'ativo' ? new Date().toISOString() : null,
      })
      .eq('id', id);
    if (publishError) return { error: friendly(publishError.message) };
  }

  revalidatePath('/painel/imoveis');
  const { data: saved } = await sb.from('properties').select('slug,status').eq('id', id).maybeSingle();
  if (saved?.slug) revalidatePath(`/imovel/${saved.slug}`);
  if (input.citySlug) revalidatePath(`/${input.citySlug}`);
  revalidatePath('/imoveis');
  revalidatePath('/');
  return { id, slug: saved?.slug, status: saved?.status };
}

function friendly(msg: string) {
  if (process.env.NODE_ENV === 'development') console.error('[saveProperty]', msg);
  if (msg.includes('schema cache'))
    return 'O banco ainda não está com as migrations mais recentes. Aplique os arquivos novos em /database e tente salvar novamente.';
  if (msg.includes('LIMITE_PARTICULAR'))
    return 'Você já tem 1 anúncio ativo no plano Particular. Crie um perfil profissional para publicar mais imóveis.';
  if (msg.includes('LIMITE_CORRETOR_AUTONOMO'))
    return 'Corretor autônomo pode manter 1 imóvel ativo gratuitamente. Para publicar mais imóveis, assine um plano profissional.';
  if (msg.includes('row-level security'))
    return 'Você não tem permissão para salvar esse anúncio. Saia e entre novamente.';
  if (msg.includes('invalid input syntax for type uuid') && msg.includes('property_type_id'))
    return 'Selecione novamente o tipo do imóvel.';
  if (msg.includes('violates foreign key constraint') && msg.includes('property_type_id'))
    return 'Selecione novamente o tipo do imóvel.';
  if (msg.includes('violates foreign key constraint') && msg.includes('city_id'))
    return 'Selecione novamente a cidade do imóvel.';
  if (msg.includes('violates foreign key constraint') && msg.includes('neighborhood_id'))
    return 'Selecione novamente o bairro do imóvel.';
  if (msg.includes('NEIGHBORHOOD_CITY_MISMATCH'))
    return 'O bairro selecionado não pertence à cidade do imóvel.';
  if (msg.includes('duplicate key') && msg.includes('properties_slug_key'))
    return 'Já existe um anúncio com esse título nessa cidade. Ajuste o título e tente novamente.';
  return process.env.NODE_ENV === 'development'
    ? `Não foi possível salvar o anúncio: ${msg}`
    : 'Não foi possível salvar o anúncio. Verifique os campos e tente novamente.';
}

// Altera o status de um imóvel (ativar/pausar/arquivar). RLS garante que é do dono.
export async function setPropertyStatus(
  id: string,
  status: Database['public']['Enums']['listing_status'],
): Promise<Result> {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: 'Sessão expirada. Entre novamente.' };

  if (status === 'ativo') {
    const gate = await getListingPublishGate(auth.user.id, id);
    if (!gate.allowed) {
      return {
        error: 'Corretor autônomo pode manter 1 imóvel ativo gratuitamente. Para ativar mais imóveis, assine um plano profissional.',
      };
    }
  }

  const patch: PropertyUpdate = { status };
  if (status === 'ativo') patch.published_at = new Date().toISOString();
  const { error } = await sb.from('properties').update(patch).eq('id', id);
  revalidatePath('/painel/imoveis');
  if (!error) return { ok: true };
  // O trigger do banco bloqueia o 2º imóvel ativo de conta Particular.
  if (error.message.includes('LIMITE_PARTICULAR'))
    return { error: 'Você já tem 1 anúncio ativo no plano Particular. Crie um perfil profissional para publicar mais imóveis.' };
  if (error.message.includes('LIMITE_CORRETOR_AUTONOMO'))
    return { error: 'Corretor autônomo pode manter 1 imóvel ativo gratuitamente. Para ativar mais imóveis, assine um plano profissional.' };
  return { error: 'Não foi possível atualizar o anúncio.' };
}

export async function deleteProperty(id: string): Promise<Result> {
  const { error } = await createClient().from('properties').update({ status: 'arquivado', is_featured: false }).eq('id', id);
  revalidatePath('/painel/imoveis');
  revalidatePath('/imoveis');
  revalidatePath('/');
  return error ? { error: 'Não foi possível remover o anúncio.' } : { ok: true };
}
