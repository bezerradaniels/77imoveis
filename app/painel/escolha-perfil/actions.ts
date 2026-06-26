'use server';
import { createClient } from '@/lib/supabase/server';

type RoleIntent = 'particular' | 'profissional';

// Marca a escolha (Particular ou Profissional) como feita e guarda a intenção
// para retomar o fluxo correto se o usuário sair no meio do onboarding.
export async function chooseRole(target: RoleIntent) {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return;
  await sb
    .from('profiles')
    .update({
      role_choice_made_at: new Date().toISOString(),
      role_intent: target,
    })
    .eq('id', auth.user.id);
}
