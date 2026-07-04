'use client';
import { usePathname } from 'next/navigation';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { cn } from '@/lib/cn';

type Props = Omit<React.ComponentProps<typeof TrackedLink>, 'href'> & {
  href: string;
  // exact: só marca ativo na rota exata (ex.: /admin, senão pegaria todas as filhas).
  exact?: boolean;
  activeClassName?: string;
};

// Link de navegação do painel/admin com estado "página atual" (aria-current).
export function SidebarLink({ exact, activeClassName = 'bg-primary-soft text-primary', className, href, ...props }: Props) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <TrackedLink
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(className, active && activeClassName)}
      {...props}
    />
  );
}
