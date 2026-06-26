import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// "Anunciar" leva ao cadastro (visitante) ou direto ao novo anúncio (logado).
export default async function AnunciarPage() {
  const user = await getUser();
  if (!user) redirect('/cadastro');

  const sb = createClient();
  const [{ data: profile }, { data: companies }] = await Promise.all([
    sb.from('profiles').select('role_intent').eq('id', user.id).maybeSingle(),
    sb.from('companies').select('id').eq('owner_id', user.id).limit(1),
  ]);

  if ((profile as any)?.role_intent === 'profissional' && !companies?.length) redirect('/painel/empresa');
  redirect('/painel/imoveis/novo');
}
