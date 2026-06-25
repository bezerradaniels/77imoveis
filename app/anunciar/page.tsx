import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// "Anunciar" leva ao cadastro (visitante) ou direto ao novo anúncio (logado).
export default async function AnunciarPage() {
  const user = await getUser();
  redirect(user ? '/painel/imoveis/novo' : '/cadastro');
}
