'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, User } from 'lucide-react';
import { cn } from '@/lib/cn';

const items = [
  { href: '/', label: 'Início', Icon: Home, active: (p: string) => p === '/' },
  { href: '/vitoria-da-conquista', label: 'Buscar', Icon: Search, active: (p: string) => p !== '/' && !p.startsWith('/anunciar') && !p.startsWith('/painel') && !p.startsWith('/admin') },
  { href: '/anunciar', label: 'Anunciar', Icon: PlusCircle, active: (p: string) => p.startsWith('/anunciar') },
  { href: '/painel', label: 'Conta', Icon: User, active: (p: string) => p.startsWith('/painel') || p.startsWith('/admin') || p.startsWith('/entrar') },
];

// Barra de navegação inferior — só no celular. Escondida na página do imóvel
// (lá a barra de contato assume o rodapé).
export function MobileBottomBar() {
  const pathname = usePathname();
  if (pathname.startsWith('/imovel/')) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-surface md:hidden">
      {items.map(({ href, label, Icon, active }) => {
        const on = active(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={cn('flex flex-col items-center gap-0.5 py-2 text-[11px]', on ? 'text-primary' : 'text-muted')}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
