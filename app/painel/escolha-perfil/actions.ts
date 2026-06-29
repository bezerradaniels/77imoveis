'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type RoleIntent = 'particular' | 'profissional';

// Marca a escolha (Particular ou Profissional) como feita e guarda a intenção
// para retomar o fluxo correto se o usuário sair no meio do onboarding.
export async function chooseRole(target: RoleIntent): Promise<{ error?: string } | never> {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect('/entrar');

  const { data, error } = await sb
    .from('profiles')
    .update({
      role_choice_made_at: new Date().toISOString(),
      role_intent: target,
    })
    .eq('id', auth.user.id)
    .select('id')
    .maybeSingle();

  if (error) {
    return { error: 'Não foi possível salvar sua escolha. Tente novamente.' };
  }

  if (!data) {
    return { error: 'Seu perfil ainda não foi criado. Saia e entre novamente para continuar.' };
  }

  revalidatePath('/painel');
  redirect(target === 'particular' ? '/painel' : '/painel/empresa');
}
