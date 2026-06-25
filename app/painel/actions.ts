'use server';
import { revalidatePath } from 'next/cache';
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

async function uniqueSlug(sb: any, base: string, excludeId?: string) {
  let slug = base || 'imovel';
  let n = 1;
  for (;;) {
    const { data } = await sb.from('properties').select('id').eq('slug', slug).maybeSingle();
    if (!data || data.id === excludeId) return slug;
    slug = `${base}-${++n}`;
  }
}

// Cria ou edita um imóvel + modalidades + características + fotos.
export async function saveProperty(input: PropertyInput): Promise<{ id?: string; error?: string }> {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: 'Sessão expirada. Entre novamente.' };
  if (!input.negotiations.length) return { error: 'Escolha ao menos uma modalidade (venda, aluguel…).' };

  const primary = input.negotiations[0];
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
    status: input.publish ? 'ativo' : 'rascunho',
    published_at: input.publish ? new Date().toISOString() : null,
  };

  let id = input.id;
  if (id) {
    const { error } = await sb.from('properties').update(base).eq('id', id);
    if (error) return { error: friendly(error.message) };
  } else {
    base.slug = await uniqueSlug(sb, slugify(`${input.title}-${input.citySlug}`));
    const { data, error } = await sb.from('properties').insert(base).select('id').single();
    if (error) return { error: friendly(error.message) };
    id = data!.id;
  }

  // Modalidades (substitui tudo). A 1ª é a principal.
  await sb.from('property_negotiations').delete().eq('property_id', id);
  await sb.from('property_negotiations').insert(
    input.negotiations.map((n, i) => ({
      property_id: id,
      negotiation: n.negotiation,
      price: n.priceVisibility === 'sob_consulta' ? null : n.price,
      price_visibility: n.priceVisibility,
      is_primary: i === 0,
    })),
  );

  // Características (substitui tudo).
  await sb.from('property_features').delete().eq('property_id', id);
  if (input.featureIds.length)
    await sb.from('property_features').insert(
      input.featureIds.map((feature_id) => ({ property_id: id, feature_id })),
    );

  // Fotos (substitui tudo; 1ª é a capa).
  await sb.from('property_images').delete().eq('property_id', id);
  if (input.images.length)
    await sb.from('property_images').insert(
      input.images.map((url, i) => ({ property_id: id, url, sort: i, is_cover: i === 0 })),
    );

  revalidatePath('/painel/imoveis');
  return { id };
}

function friendly(msg: string) {
  if (msg.includes('LIMITE_PARTICULAR'))
    return 'Conta Particular permite só 1 imóvel ativo. Salve como rascunho ou migre para um plano profissional.';
  return 'Não foi possível salvar o anúncio. Verifique os campos e tente novamente.';
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
    return { error: 'Conta Particular permite só 1 imóvel ativo. Migre para um plano profissional.' };
  return { error: 'Não foi possível atualizar o anúncio.' };
}

export async function deleteProperty(id: string): Promise<Result> {
  const { error } = await createClient().from('properties').delete().eq('id', id);
  revalidatePath('/painel/imoveis');
  return error ? { error: 'Não foi possível excluir.' } : { ok: true };
}
