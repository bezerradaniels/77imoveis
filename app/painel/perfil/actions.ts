'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type ProfileInput = {
  fullName: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  avatarUrl?: string;
  cityId?: string;
};

// Atualiza o perfil do usuário logado (nome, contatos, foto e cidade).
// Usado tanto no painel do anunciante quanto no admin — cada um edita o próprio perfil.
export async function updateProfile(input: ProfileInput): Promise<{ error?: string } | { ok: true }> {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: 'Sessão expirada. Entre novamente.' };
  if (!input.fullName.trim()) return { error: 'Informe seu nome.' };

  const { error } = await sb
    .from('profiles')
    .update({
      full_name: input.fullName.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      whatsapp: input.whatsapp?.trim() || null,
      avatar_url: input.avatarUrl || null,
      city_id: input.cityId || null,
    })
    .eq('id', auth.user.id);

  if (error) return { error: 'Não foi possível salvar o perfil.' };

  revalidatePath('/painel');
  revalidatePath('/painel/perfil');
  revalidatePath('/admin/perfil');
  return { ok: true };
}
