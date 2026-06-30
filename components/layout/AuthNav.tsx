'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { hasAuthCookie } from '@/lib/has-auth-cookie';

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
      className="inline-flex items-center gap-1.5 rounded-[10px] border border-primary bg-[#e0f2fe] px-3 py-2 text-sm font-bold text-primary hover:bg-[#bae6fd]"
    >
      <LayoutDashboard size={15} /> Painel
    </Link>
  );
}
