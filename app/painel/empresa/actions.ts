'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/format';

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
  brokers: { name: string; creci?: string; phone?: string; whatsapp?: string; photoUrl?: string }[];
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
  if (!input.tradeName.trim() || !input.type) return { error: 'Informe o tipo e o nome da empresa.' };

  const base: Record<string, any> = {
    owner_id: auth.user.id,
    type: input.type,
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

  let id = input.id;
  let slug: string;
  if (id) {
    const { data, error } = await sb.from('companies').update(base).eq('id', id).select('slug').single();
    if (error) return { error: 'Não foi possível salvar a empresa.' };
    slug = data!.slug;
  } else {
    slug = await uniqueSlug(sb, slugify(input.tradeName));
    const { data, error } = await sb.from('companies').insert({ ...base, slug }).select('id,slug').single();
    if (error) return { error: 'Não foi possível criar a empresa.' };
    id = data!.id;
  }

  // Cidades de atuação (N:N).
  await sb.from('company_cities').delete().eq('company_id', id);
  if (input.cityIds.length)
    await sb.from('company_cities').insert(input.cityIds.map((city_id) => ({ company_id: id, city_id })));

  // Especialidades (N:N).
  await sb.from('company_specialties').delete().eq('company_id', id);
  if (input.specialtyIds.length)
    await sb.from('company_specialties').insert(
      input.specialtyIds.map((specialty_id) => ({ company_id: id, specialty_id })),
    );

  // Corretores (substitui a lista completa a cada salvamento).
  await sb.from('brokers').delete().eq('company_id', id);
  if (input.brokers.length)
    await sb.from('brokers').insert(
      input.brokers.map((b) => ({
        company_id: id,
        name: b.name,
        creci: b.creci || null,
        phone: b.phone || null,
        whatsapp: b.whatsapp || null,
        photo_url: b.photoUrl || null,
      })),
    );

  // Promove a conta a PROFISSIONAL (sem rebaixar admin/moderador).
  await sb.from('profiles').update({ role: 'profissional' }).eq('id', auth.user.id).eq('role', 'particular');

  revalidatePath('/painel');
  revalidatePath(`/empresa/${slug}`);
  return { slug };
}
