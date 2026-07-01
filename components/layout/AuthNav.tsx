'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { hasAuthCookie } from '@/lib/has-auth-cookie';
import { trackButtonClick } from '@/lib/analytics';

export function AuthNav() {
  const pathname = usePathname();
  const [logged, setLogged] = useState<boolean | null>(null);

  // Reavalia a cada navegação — após login/logout o cookie já está atualizado.
  useEffect(() => {
    setLogged(hasAuthCookie());
  }, [pathname]);

  if (logged === null) return <span className="h-11 w-24" aria-hidden />;

  if (!logged)
    return (
      <Link href="/entrar" className="inline-flex min-h-11 items-center text-sm font-bold text-text/75 transition-colors hover:text-link-hover">
        <span
          onClick={() => trackButtonClick({
            button_id: 'header_login_button',
            button_text: 'Acessar painel',
            button_location: 'header',
            section: 'header',
            destination_url: '/entrar',
          })}
        >
          Acessar painel
        </span>
      </Link>
    );

  return (
    <Link
      href="/painel"
      onClick={() => trackButtonClick({
        button_id: 'header_dashboard_button',
        button_text: 'Painel',
        button_location: 'header',
        section: 'header',
        destination_url: '/painel',
      })}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] border border-primary bg-[#e0f2fe] px-3 py-2 text-sm font-bold text-primary hover:bg-[#bae6fd]"
    >
      <LayoutDashboard size={15} /> Painel
    </Link>
  );
}
