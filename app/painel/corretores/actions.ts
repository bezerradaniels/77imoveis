'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { replaceCompanyBrokers } from '@/lib/brokers';

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

  const { error } = await replaceCompanyBrokers(
    sb,
    company.id,
    brokers.map((b) => ({
      name: b.name,
      creci: b.creci?.trim() || null,
      email: b.email?.trim() || null,
      phone: b.phone?.trim() || null,
      whatsapp: b.whatsapp?.trim() || null,
    })),
  );
  if (error) return { error };

  revalidatePath('/painel/corretores');
  return { ok: true };
}
