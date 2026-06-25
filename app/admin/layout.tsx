import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin', robots: { index: false } };

const nav = [
  { href: '/admin', label: 'Visão geral' },
  { href: '/admin/imoveis', label: 'Imóveis' },
  { href: '/admin/empresas', label: 'Empresas' },
  { href: '/admin/usuarios', label: 'Usuários' },
  { href: '/admin/cidades', label: 'Cidades' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile || !['admin', 'moderador'].includes(profile.role)) redirect('/painel');

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-3 text-2xl font-bold">Administração</h1>
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-border pb-2">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-surface hover:text-text"
          >
            {n.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
