'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { trackButtonClick } from '@/lib/analytics';

const items = [
  { href: '/', label: 'Início', Icon: Home, active: (p: string) => p === '/' },
  { href: '/vitoria-da-conquista', label: 'Buscar', Icon: Search, active: (p: string) => p !== '/' && !p.startsWith('/anunciar') && !p.startsWith('/painel') && !p.startsWith('/admin') },
  { href: '/anunciar', label: 'Anunciar', Icon: Home, iconClassName: 'text-black', active: (p: string) => p.startsWith('/anunciar') },
  { href: '/painel', label: 'Conta', Icon: User, active: (p: string) => p.startsWith('/painel') || p.startsWith('/admin') || p.startsWith('/entrar') },
];

// Barra de navegação inferior — só no celular. Escondida na página do imóvel
// (lá a barra de contato assume o rodapé).
export function MobileBottomBar() {
  const pathname = usePathname();
  if (pathname.startsWith('/imovel/') || pathname.startsWith('/painel')) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-surface md:hidden">
      {items.map(({ href, label, Icon, iconClassName, active }) => {
        const on = active(pathname);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => trackButtonClick({
              button_id: `mobile_bottom_${label.toLowerCase()}_button`,
              button_text: label,
              button_location: 'mobile_bottom_bar',
              section: 'mobile_navigation',
              destination_url: href,
            })}
            className={cn('flex min-h-14 flex-col items-center justify-center gap-0.5 py-2 text-[11px]', on ? 'text-link' : 'text-muted')}
          >
            <Icon size={20} className={iconClassName} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
