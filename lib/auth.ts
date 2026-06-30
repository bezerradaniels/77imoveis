// Helpers de autenticação no servidor. Leitura da sessão e do profile.
import { createClient } from './supabase/server';

const hasEnv = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getUser() {
  if (!hasEnv()) return null;
  const { data } = await createClient().auth.getUser();
  return data.user;
}

export type Profile = {
  id: string;
  role: 'particular' | 'profissional' | 'admin' | 'moderador';
  full_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  is_active: boolean;
  role_choice_made_at: string | null;
  role_intent: 'particular' | 'profissional' | null;
};

// Profile do usuário logado (ou null). Inclui o papel para regras de UI.
export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;
  const { data } = await createClient()
    .from('profiles')
    .select('id,role,full_name,email,phone,whatsapp,is_active,role_choice_made_at,role_intent')
    .eq('id', user.id)
    .maybeSingle();
  if (!data || !(data as Profile).is_active) return null;
  return data as Profile;
}
