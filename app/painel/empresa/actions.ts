'use server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ACTIVE_COMPANY_COOKIE } from '@/lib/data';
import { slugify } from '@/lib/format';
import { companyInputSchema, firstZodError } from '@/lib/validation';
import { replaceCompanyBrokers } from '@/lib/brokers';
import type { Database } from '@/lib/supabase/types';

type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];
type CompanyType = Database['public']['Enums']['company_type'];

const ALLOWED_COMPANY_TYPES: CompanyType[] = ['imobiliaria', 'corretor_autonomo', 'construtora', 'incorporadora'];

export type CompanyInput = {
  id?: string;
  type: string;
  tradeName: string;
  legalName?: string;
  cnpj?: string;
  creci?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  instagram?: string;
  cityId?: string;
  logoUrl?: string;
  coverUrl?: string;
  address?: string;
  cityIds: string[];
  specialtyIds: string[];
  businessHours: Record<string, string>;
  // Opcional: os corretores são gerenciados em página própria (/painel/corretores).
  // Só são alterados quando explicitamente enviados (ex.: pelo wizard de onboarding).
  brokers?: { name: string; creci?: string; phone?: string; whatsapp?: string; photoUrl?: string }[];
};

async function uniqueSlug(sb: any, base: string, excludeId?: string) {
  let slug = base || 'empresa';
  let n = 1;
  for (;;) {
    const { data } = await sb.from('companies').select('id').eq('slug', slug).maybeSingle();
    if (!data || data.id === excludeId) return slug;
    slug = `${base}-${++n}`;
  }
}

// Cria/edita a empresa do usuário e o promove a PROFISSIONAL.
export async function saveCompany(input: CompanyInput): Promise<{ slug?: string; error?: string }> {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: 'Sessão expirada. Entre novamente.' };

  const parsed = companyInputSchema.safeParse(input);
  if (!parsed.success) return { error: firstZodError(parsed.error, 'Revise os campos do perfil.') };

  const companyType = input.type as CompanyType;
  if (!ALLOWED_COMPANY_TYPES.includes(companyType)) return { error: 'Escolha um tipo profissional válido.' };

  const base: CompanyUpdate & Omit<CompanyInsert, 'slug'> = {
    owner_id: auth.user.id,
    type: companyType,
    trade_name: input.tradeName.trim(),
    legal_name: input.legalName || null,
    cnpj: input.cnpj || null,
    creci: input.creci || null,
    description: input.description || null,
    phone: input.phone || null,
    whatsapp: input.whatsapp || null,
    email: input.email || null,
    website: input.website || null,
    instagram: input.instagram || null,
    city_id: input.cityId || null,
    logo_url: input.logoUrl || null,
    cover_url: input.coverUrl || null,
    address: input.address || null,
    business_hours: input.businessHours,
    status: 'ativo',
  };

  // Com input.id → edita aquela empresa; sem id → cria uma NOVA (multi-empresa).
  let id = input.id;
  let slug: string;
  if (id) {
    const { data, error } = await sb.from('companies').update(base).eq('id', id).select('slug').single();
    if (error) return { error: 'Não foi possível salvar a empresa.' };
    slug = data!.slug;
  } else {
    slug = await uniqueSlug(sb, slugify(input.tradeName));
    const insertPayload: CompanyInsert = { ...base, slug };
    const { data, error } = await sb.from('companies').insert(insertPayload).select('id,slug').single();
    if (error) return { error: 'Não foi possível criar a empresa.' };
    id = data!.id;
    // Foca a empresa recém-criada no painel.
    cookies().set(ACTIVE_COMPANY_COOKIE, id!, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  }

  // Erro genérico para as etapas relacionais: sem checar cada `{ error }`, uma
  // falha aqui deixaria a empresa salva mas as relações incompletas — e a UI
  // mostraria falso sucesso.
  const relError = 'A empresa foi salva, mas não foi possível gravar todos os dados (cidades, especialidades ou corretores). Revise e salve novamente.';

  // Cidades de atuação (N:N).
  const { error: cityDelError } = await sb.from('company_cities').delete().eq('company_id', id);
  if (cityDelError) return { error: relError };
  if (input.cityIds.length) {
    const { error } = await sb.from('company_cities').insert(input.cityIds.map((city_id) => ({ company_id: id, city_id })));
    if (error) return { error: relError };
  }

  // Especialidades (N:N).
  const { error: specDelError } = await sb.from('company_specialties').delete().eq('company_id', id);
  if (specDelError) return { error: relError };
  if (input.specialtyIds.length) {
    const { error } = await sb.from('company_specialties').insert(
      input.specialtyIds.map((specialty_id) => ({ company_id: id, specialty_id })),
    );
    if (error) return { error: relError };
  }

  // Corretores avulsos existem apenas para imobiliárias nesta fase.
  if (input.type !== 'imobiliaria') {
    const { error } = await sb.from('brokers').delete().eq('company_id', id);
    if (error) return { error: relError };
  } else if (input.brokers) {
    // Substituição atômica (RPC transacional, com fallback e rollback).
    const { error } = await replaceCompanyBrokers(
      sb,
      id!,
      input.brokers.map((b) => ({
        name: b.name,
        creci: b.creci || null,
        phone: b.phone || null,
        whatsapp: b.whatsapp || null,
        photo_url: b.photoUrl || null,
      })),
    );
    if (error) return { error: relError };
  }

  await sb.from('profiles').update({
    role_intent: 'profissional',
    role_choice_made_at: new Date().toISOString(),
  }).eq('id', auth.user.id);

  // Promove a conta a PROFISSIONAL (sem rebaixar admin/moderador).
  await sb.from('profiles').update({ role: 'profissional' }).eq('id', auth.user.id).eq('role', 'particular');

  revalidatePath('/painel', 'layout');
  revalidatePath(`/empresa/${slug}`);
  return { slug };
}
