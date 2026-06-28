'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Mostra "Entrar" ou "Painel/Sair" conforme a sessão — no cliente, para
// não tornar as páginas públicas dinâmicas (mantém o cache/SEO).
export function AuthNav() {
  const [logged, setLogged] = useState<boolean | null>(null);

  useEffect(() => {
    let unsub = () => {};
    try {
      const sb = createClient();
      sb.auth.getSession().then(({ data }) => setLogged(!!data.session));
      const { data } = sb.auth.onAuthStateChange((_e, session) => setLogged(!!session));
      unsub = () => data.subscription.unsubscribe();
    } catch {
      setLogged(false);
    }
    return unsub;
  }, []);

  if (logged === null) return <span className="h-8 w-16" aria-hidden />;

  if (!logged)
    return (
      <Link href="/entrar" className="text-sm font-bold text-text/75 transition-colors hover:text-primary">
        Login
      </Link>
    );

  return (
    <Link
      href="/painel"
      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-white"
    >
      <LayoutDashboard size={15} /> Painel
    </Link>
  );
}
