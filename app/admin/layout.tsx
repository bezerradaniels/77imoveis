import { redirect } from 'next/navigation';
import { LayoutDashboard, Home, Building2, Users, MapPin, CreditCard, Megaphone, Store, UserCog, UserSquare, FileText } from 'lucide-react';
import { getProfile } from '@/lib/auth';
import { SidebarLink } from '@/components/layout/SidebarLink';
import { LogoutButton } from '@/components/layout/LogoutButton';
import { slugify } from '@/lib/format';
import { logout } from '@/app/painel/actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin — 77Imóveis', robots: { index: false, follow: false, nocache: true } };

const nav = [
  { href: '/admin',          label: 'Visão geral', icon: LayoutDashboard },
  { href: '/admin/imoveis',  label: 'Imóveis',     icon: Home },
  { href: '/admin/empresas', label: 'Empresas',    icon: Building2 },
  { href: '/admin/corretores', label: 'Corretores', icon: Users },
  { href: '/admin/usuarios', label: 'Usuários',    icon: Users },
  { href: '/admin/clientes', label: 'Clientes',    icon: UserSquare },
  { href: '/admin/contratos', label: 'Contratos',  icon: FileText },
  { href: '/admin/cidades',  label: 'Cidades',     icon: MapPin },
  { href: '/admin/planos',   label: 'Planos',      icon: CreditCard },
  { href: '/admin/publicidade', label: 'Publicidade', icon: Megaphone },
  { href: '/admin/vitrines', label: 'Vitrines',    icon: Store },
  { href: '/admin/perfil',   label: 'Meu perfil',  icon: UserCog },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile || !['admin', 'moderador'].includes(profile.role)) redirect('/painel');
  const nome = profile.full_name?.split(' ')[0] ?? 'Admin';

  return (
    <>
      {/* Sidebar — só desktop */}
      <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-64 overflow-hidden border-r border-border bg-surface text-text lg:flex lg:flex-col">
        <div className="flex h-full flex-col gap-5 px-4 py-6">
          <div>
            <p className="text-lg font-bold leading-tight">Olá, {nome}</p>
            <p className="mt-1 text-sm font-medium text-muted">Administração do portal</p>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Navegação admin">
            {nav.map(({ href, label, icon: Icon }) => (
              <SidebarLink
                key={href}
                href={href}
                exact={href === '/admin'}
                buttonId={`admin_nav_${slugify(label)}`}
                buttonText={label}
                buttonLocation="admin_sidebar"
                section="admin_nav"
                className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-semibold text-text transition hover:bg-primary-soft"
              >
                <Icon size={18} className="text-primary" />
                {label}
              </SidebarLink>
            ))}
          </nav>

          <form action={logout}>
            <LogoutButton />
          </form>
        </div>
      </aside>

      {/* Conteúdo */}
      <div data-painel-shell className="min-h-screen bg-internal lg:pl-64">
        {/* Nav móvel — tabs com scroll horizontal */}
        <nav className="no-scrollbar flex gap-1 overflow-x-auto border-b border-border bg-surface px-3 py-2 lg:hidden">
          {nav.map(({ href, label, icon: Icon }) => (
            <SidebarLink
              key={href}
              href={href}
              exact={href === '/admin'}
              buttonId={`admin_mobile_nav_${slugify(label)}`}
              buttonText={label}
              buttonLocation="admin_mobile_nav"
              section="admin_nav"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-text transition hover:bg-primary-soft"
            >
              <Icon size={14} />
              {label}
            </SidebarLink>
          ))}
        </nav>

        <div className="mx-auto max-w-5xl px-4 py-6">
          {children}
        </div>
      </div>
    </>
  );
}
