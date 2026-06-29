'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getNeighborhoods } from '@/lib/data';
import { slugify } from '@/lib/format';

type Result = { ok?: true; error?: string };

export type NegotiationInput = {
  negotiation: string;
  price: number | null;
  priceVisibility: 'publico' | 'sob_consulta';
};

export type PropertyInput = {
  id?: string;
  title: string;
  description?: string;
  typeId: string;
  citySlug: string;
  cityId: string;
  neighborhoodId?: string;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  garages?: number;
  builtArea?: number | null;
  landArea?: number | null;
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
export async function saveProperty(input: PropertyInput): Promise<{ id?: string; error?: string }> {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: 'Sessão expirada. Entre novamente.' };
  if (!input.negotiations.length) return { error: 'Escolha ao menos uma modalidade (venda, aluguel…).' };

  if (input.neighborhoodId) {
    const { data: neighborhood } = await sb
      .from('neighborhoods')
      .select('id')
      .eq('id', input.neighborhoodId)
      .eq('city_id', input.cityId)
      .maybeSingle();
    if (!neighborhood) return { error: 'Selecione novamente o bairro do imóvel.' };
  }

  const { data: company } = await sb
    .from('companies')
    .select('id')
    .eq('owner_id', auth.user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  const primary = input.negotiations[0];
  const publishStatus = input.publish
    ? process.env.REQUIRE_LISTING_MODERATION === 'true'
      ? 'em_moderacao'
      : 'ativo'
    : 'rascunho';
  const initialStatus = input.id ? publishStatus : 'rascunho';
  const base: Record<string, any> = {
    owner_id: auth.user.id,
    title: input.title,
    description: input.description || null,
    property_type_id: input.typeId,
    city_id: input.cityId,
    neighborhood_id: input.neighborhoodId || null,
    bedrooms: input.bedrooms ?? 0,
    suites: input.suites ?? 0,
    bathrooms: input.bathrooms ?? 0,
    garages: input.garages ?? 0,
    built_area: input.builtArea ?? null,
    land_area: input.landArea ?? null,
    negotiation: primary.negotiation,
    price: primary.price,
    price_visibility: primary.priceVisibility,
    status: initialStatus,
    published_at: initialStatus === 'ativo' ? new Date().toISOString() : null,
  };

  let id = input.id;
  if (company?.id || !id) base.company_id = company?.id ?? null;
  if (id) {
    const { error } = await sb.from('properties').update(base).eq('id', id);
    if (error) return { error: friendly(error.message) };
  } else {
    const referenceCode = await uniqueReferenceCode(sb);
    base.reference_code = referenceCode;
    base.slug = await uniqueSlug(sb, slugify(`${input.title}-${input.citySlug}-${referenceCode}`));
    const { data, error } = await sb.from('properties').insert(base).select('id').single();
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
  return { id };
}

function friendly(msg: string) {
  if (process.env.NODE_ENV === 'development') console.error('[saveProperty]', msg);
  if (msg.includes('LIMITE_PARTICULAR'))
    return 'Você já tem 1 anúncio ativo no plano Particular. Crie um perfil profissional para publicar mais imóveis.';
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
export async function setPropertyStatus(id: string, status: string): Promise<Result> {
  const patch: Record<string, any> = { status };
  if (status === 'ativo') patch.published_at = new Date().toISOString();
  const { error } = await createClient().from('properties').update(patch).eq('id', id);
  revalidatePath('/painel/imoveis');
  if (!error) return { ok: true };
  // O trigger do banco bloqueia o 2º imóvel ativo de conta Particular.
  if (error.message.includes('LIMITE_PARTICULAR'))
    return { error: 'Você já tem 1 anúncio ativo no plano Particular. Crie um perfil profissional para publicar mais imóveis.' };
  return { error: 'Não foi possível atualizar o anúncio.' };
}

export async function deleteProperty(id: string): Promise<Result> {
  const { error } = await createClient().from('properties').delete().eq('id', id);
  revalidatePath('/painel/imoveis');
  return error ? { error: 'Não foi possível excluir.' } : { ok: true };
}
