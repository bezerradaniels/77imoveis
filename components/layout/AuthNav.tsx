'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, LogIn, LogOut, UserPlus } from 'lucide-react';
import { logout } from '@/app/painel/actions';
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
      <div className="inline-flex min-h-11 items-center gap-2 text-sm leading-none">
        <Link
          href="/entrar"
          onClick={() => trackButtonClick({
            button_id: 'header_login_button',
            button_text: 'Login',
            button_location: 'header',
            section: 'header',
            destination_url: '/entrar',
          })}
          className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-text transition-colors hover:text-link-hover"
        >
          <LogIn size={16} strokeWidth={2} className="shrink-0" />
          Login
        </Link>
        <span className="inline-flex min-h-11 items-center text-text/55">ou</span>
        <Link
          href="/cadastro"
          onClick={() => trackButtonClick({
            button_id: 'header_signup_button',
            button_text: 'Criar conta',
            button_location: 'header',
            section: 'header',
            destination_url: '/cadastro',
          })}
          className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-text transition-colors hover:text-link-hover"
        >
          <UserPlus size={16} strokeWidth={2} className="shrink-0" />
          Criar conta
        </Link>
      </div>
    );

  return (
    <div className="inline-flex min-h-11 items-center gap-2 text-sm leading-none">
      <Link
        href="/painel"
        onClick={() => trackButtonClick({
          button_id: 'header_dashboard_button',
          button_text: 'Painel',
          button_location: 'header',
          section: 'header',
          destination_url: '/painel',
        })}
        className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-text transition-colors hover:text-link-hover"
      >
        <LayoutDashboard size={16} strokeWidth={2} className="shrink-0" />
        Painel
      </Link>
      <span className="inline-flex min-h-11 items-center text-text/55">ou</span>
      <form action={logout} className="inline-flex min-h-11 items-center">
        <button
          type="submit"
          onClick={() => trackButtonClick({
            button_id: 'header_logout_button',
            button_text: 'Sair',
            button_location: 'header',
            section: 'header',
            destination_url: '/entrar',
          })}
          className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-text transition-colors hover:text-link-hover"
        >
          <LogOut size={16} strokeWidth={2} className="shrink-0" />
          Sair
        </button>
      </form>
    </div>
  );
}
