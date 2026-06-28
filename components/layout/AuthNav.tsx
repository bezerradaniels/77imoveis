'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

// Detecta a sessão pela presença do cookie de auth do Supabase, SEM carregar o
// SDK do Supabase nas páginas públicas (mantém o bundle leve e o cache/SEO).
// É só para alternar "Login"/"Painel": o middleware é quem protege as rotas.
function hasAuthCookie() {
  if (typeof document === 'undefined') return false;
  const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
    .replace(/^https?:\/\//, '')
    .split('.')[0];
  if (!ref) return false;
  return document.cookie.split('; ').some((c) => c.startsWith(`sb-${ref}-auth-token`));
}

export function AuthNav() {
  const pathname = usePathname();
  const [logged, setLogged] = useState<boolean | null>(null);

  // Reavalia a cada navegação — após login/logout o cookie já está atualizado.
  useEffect(() => {
    setLogged(hasAuthCookie());
  }, [pathname]);

  if (logged === null) return <span className="h-8 w-16" aria-hidden />;

  if (!logged)
    return (
      <Link href="/entrar" className="text-sm font-bold text-text/75 transition-colors hover:text-link-hover">
        Login
      </Link>
    );

  return (
    <Link
      href="/painel"
      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-on-primary"
    >
      <LayoutDashboard size={15} /> Painel
    </Link>
  );
}
