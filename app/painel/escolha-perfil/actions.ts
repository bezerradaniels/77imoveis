'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/format';
import type { Database } from '@/lib/supabase/types';

type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];
type CompanyType = Database['public']['Enums']['company_type'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

type RoleKey = 'pessoal' | 'corretor_autonomo' | 'imobiliaria' | 'construtora' | 'incorporadora';
type ProfessionalRoleKey = Exclude<RoleKey, 'pessoal'> & CompanyType;

const professionalTypes: ProfessionalRoleKey[] = ['corretor_autonomo', 'imobiliaria', 'construtora', 'incorporadora'];
const defaultTradeName: Record<ProfessionalRoleKey, string> = {
  corretor_autonomo: 'Meu perfil de corretor',
  imobiliaria: 'Minha imobiliária',
  construtora: 'Minha construtora',
  incorporadora: 'Minha incorporadora',
};

export async function completeOnboarding(
  roleKey: RoleKey,
  answers: Record<string, string>,
): Promise<{ error?: string } | never> {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect('/entrar');
  const uid = auth.user.id;

  const isPro = roleKey !== 'pessoal';
  const companyType = isPro ? (roleKey as ProfessionalRoleKey) : null;
  if (companyType && !professionalTypes.includes(companyType)) {
    return { error: 'Escolha um tipo profissional válido.' };
  }
  const cityId = answers.city_id || null;

  // Campos essenciais do perfil. Profissionais já entram com role 'profissional'
  // (não rebaixa admin/moderador, por isso o filtro por role atual).
  const update: ProfileUpdate = {
    role_intent: isPro ? 'profissional' : 'particular',
    role_choice_made_at: new Date().toISOString(),
    city_id: cityId,
  };

  const { error: profileError } = await sb
    .from('profiles')
    .update(update)
    .eq('id', uid);

  if (profileError) return { error: 'Não foi possível salvar. Tente novamente.' };

  // onboarding_data é opcional (coluna pode não existir ainda) — falha aqui é ignorada.
  await sb.from('profiles').update({ onboarding_data: { roleKey, ...answers } }).eq('id', uid);

  // Promove a conta a PROFISSIONAL (sem rebaixar admin/moderador).
  if (isPro) {
    await sb.from('profiles').update({ role: 'profissional' }).eq('id', uid).eq('role', 'particular');
  }

  // Cria/atualiza a entidade profissional única da conta.
  if (companyType) {
    const { data: profile } = await sb.from('profiles').select('full_name').eq('id', uid).maybeSingle();
    const { data: existingRows } = await sb.from('companies').select('id,slug,trade_name').eq('owner_id', uid)
      .order('created_at', { ascending: true }).limit(1);
    const existing = existingRows?.[0] ?? null;

    const fallbackName = companyType === 'corretor_autonomo'
      ? profile?.full_name || defaultTradeName[companyType]
      : defaultTradeName[companyType];
    const tradeName = answers.trade_name?.trim() || (companyType === 'corretor_autonomo' ? fallbackName : existing?.trade_name) || fallbackName;
    const companyPatch: CompanyUpdate & Pick<CompanyInsert, 'type' | 'trade_name'> = {
      type: companyType,
      trade_name: tradeName,
      city_id: cityId,
      creci: answers.creci?.trim() || null,
      cnpj: answers.cnpj?.trim() || null,
      status: 'ativo',
    };

    if (existing) {
      const { error } = await sb.from('companies').update(companyPatch).eq('id', existing.id);
      if (error) return { error: 'Não foi possível atualizar seu perfil profissional.' };
      if (companyType !== 'imobiliaria') {
        await sb.from('brokers').delete().eq('company_id', existing.id);
      }
    } else {
      const insertPayload: CompanyInsert = {
        owner_id: uid,
        slug: `${slugify(tradeName) || 'empresa'}-${uid.slice(0, 6)}`,
        ...companyPatch,
      };
      const { error } = await sb.from('companies').insert(insertPayload);
      if (error) return { error: 'Não foi possível criar seu perfil profissional.' };
    }
  }

  revalidatePath('/painel');
  redirect('/painel');
}
