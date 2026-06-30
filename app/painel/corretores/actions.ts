'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_TYPES = ['imobiliaria'];

export type BrokerInput = { name: string; creci?: string; email?: string; phone?: string; whatsapp?: string };

// Salva a equipe de corretores da empresa do usuário (substitui a lista inteira).
// Disponível apenas para imobiliárias nesta fase.
export async function saveBrokers(brokers: BrokerInput[]): Promise<{ error?: string } | { ok: true }> {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: 'Sessão expirada. Entre novamente.' };

  const { data: company } = await sb
    .from('companies')
    .select('id,type')
    .eq('owner_id', auth.user.id)
    .maybeSingle();

  if (!company) return { error: 'Empresa não encontrada.' };
  if (!ALLOWED_TYPES.includes(company.type)) {
    return { error: 'Disponível apenas para imobiliárias.' };
  }

  await sb.from('brokers').delete().eq('company_id', company.id);

  const clean = brokers.filter((b) => b.name.trim());
  if (clean.length) {
    const { error } = await sb.from('brokers').insert(
      clean.map((b) => ({
        company_id: company.id,
        name: b.name.trim(),
        creci: b.creci?.trim() || null,
        email: b.email?.trim() || null,
        phone: b.phone?.trim() || null,
        whatsapp: b.whatsapp?.trim() || null,
      })),
    );
    if (error) return { error: 'Não foi possível salvar os corretores.' };
  }

  revalidatePath('/painel/corretores');
  return { ok: true };
}
