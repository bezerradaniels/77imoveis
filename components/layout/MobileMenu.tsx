'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LogIn, Menu, X } from 'lucide-react';
import { hasAuthCookie } from '@/lib/has-auth-cookie';
import { trackButtonClick } from '@/lib/analytics';

const links = [
  { href: '/imoveis/venda', label: 'Venda' },
  { href: '/imoveis/aluguel', label: 'Aluguel' },
  { href: '/planos-e-precos', label: 'Planos' },
];

export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    setLogged(hasAuthCookie());
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const authHref = logged ? '/painel' : '/entrar';
  const authLabel = logged ? 'Painel' : 'Login';
  const AuthIcon = logged ? LayoutDashboard : LogIn;

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-border bg-surface text-text md:hidden"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/35"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[82vw] max-w-[340px] flex-col border-l border-border bg-surface p-5">
            <div className="mb-6 flex items-center justify-between gap-4">
              <Link href="/" className="inline-flex min-h-11 items-center text-2xl font-extrabold tracking-tight">
                <span className="text-link">77</span>
                <span className="text-text">imóveis</span>
              </Link>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-border text-muted"
              >
                <X size={19} />
              </button>
            </div>

            <Link
              href={authHref}
              onClick={() => {
                setOpen(false);
                trackButtonClick({
                  button_id: 'mobile_menu_auth_button',
                  button_text: authLabel,
                  button_location: 'mobile_sidebar',
                  section: 'mobile_navigation',
                  destination_url: authHref,
                });
              }}
              className="mb-4 flex min-h-12 items-center gap-3 rounded-xl border border-border bg-bg px-4 text-sm font-bold text-text"
            >
              <AuthIcon size={18} className="text-link" />
              {authLabel}
            </Link>

            <nav className="space-y-1" aria-label="Menu mobile">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setOpen(false);
                    trackButtonClick({
                      button_id: `mobile_menu_${item.label.toLowerCase()}_button`,
                      button_text: item.label,
                      button_location: 'mobile_sidebar',
                      section: 'mobile_navigation',
                      destination_url: item.href,
                    });
                  }}
                  className="flex min-h-12 items-center rounded-xl px-4 text-sm font-bold text-text hover:bg-bg"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
