import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2, CreditCard, Home, LogOut, MessageSquare, Plus, Shield, Store, UserCog, Users } from 'lucide-react';
import { getProfile } from '@/lib/auth';
import { getMyCompany, getMyCompanies } from '@/lib/data';
import { CompanySwitcher } from '@/components/painel/CompanySwitcher';
import { logout } from './actions';

// Área logada (painel do anunciante): nunca deve ser indexada por buscadores.
// Definir aqui cobre TODAS as páginas filhas (/painel/*) de uma só vez.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

const nav = {
  properties: { href: '/painel/imoveis', label: 'Meus imóveis', icon: Home },
  leads: { href: '/painel/contatos', label: 'Contatos recebidos', icon: MessageSquare },
  company: { href: '/painel/empresa', label: 'Perfil profissional', icon: Building2 },
  becomePro: { href: '/painel/empresa', label: 'Atuar profissionalmente', icon: Building2 },
  brokers: { href: '/painel/corretores', label: 'Equipe de corretores', icon: Users },
  storefront: { href: '/painel/vitrine', label: 'Minha vitrine', icon: Store },
  plans: { href: '/painel/planos', label: 'Planos e upgrade', icon: CreditCard },
  profile: { href: '/painel/perfil', label: 'Meu perfil', icon: UserCog },
};

const roleLabel: Record<string, string> = {
  particular: 'Particular',
  profissional: 'Profissional',
  admin: 'Administrador',
  moderador: 'Moderador',
};

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (profile?.role === 'admin') redirect('/admin');
  const showAdmin = profile?.role === 'moderador';
  const nome = profile?.full_name?.split(' ')[0] ?? 'bem-vindo';

  // Empresa ativa (cookie) + lista de empresas para o seletor.
  const isPro = profile?.role === 'profissional';
  const [company, companies] = await Promise.all([
    isPro ? getMyCompany() : Promise.resolve(null),
    isPro ? getMyCompanies() : Promise.resolve([]),
  ]);
  const showBrokers = company?.type === 'imobiliaria';
  const isProfessional = profile?.role === 'profissional' && !!company;
  const accountLabel =
    company?.type === 'corretor_autonomo'
      ? 'Corretor autônomo'
      : company?.type === 'imobiliaria'
        ? 'Imobiliária'
        : company?.type === 'construtora'
          ? 'Construtora'
          : roleLabel[profile?.role ?? 'particular'];
  const items = isProfessional
    ? [
        nav.properties,
        nav.leads,
        nav.company,
        ...(showBrokers ? [nav.brokers] : []),
        nav.storefront,
        nav.plans,
        nav.profile,
      ]
    : [nav.properties, nav.leads, nav.becomePro, nav.profile];

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-64 overflow-hidden bg-slate-200 text-slate-900 lg:flex lg:flex-col">
        <div className="flex h-full flex-col gap-5 px-4 py-6">
          <div>
            <p className="text-lg font-bold leading-tight">Olá, {nome}</p>
            <p className="mt-1 text-sm font-medium text-slate-600">Conta {accountLabel}</p>
          </div>

          {companies.length > 0 && (
            <CompanySwitcher companies={companies} activeId={company?.id ?? null} />
          )}

          <Link
            href="/painel/imoveis/novo"
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-primary bg-[#e0f2fe] px-3 py-2 text-sm font-bold text-primary hover:bg-[#bae6fd]"
          >
            <Plus size={16} /> Novo anúncio
          </Link>

          <nav className="space-y-1" aria-label="Navegação do painel">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white/65"
                >
                  <Icon size={18} className="text-primary" />
                  {item.label}
                </Link>
              );
            })}
            {showAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white/65"
              >
                <Shield size={18} className="text-primary" />
                Administração
              </Link>
            )}
          </nav>

          <form action={logout} className="mt-auto">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-sm font-semibold text-slate-900 transition hover:bg-white/65"
            >
              <LogOut size={18} className="text-primary" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div data-painel-shell className="min-h-screen bg-slate-100 dark:bg-bg lg:pl-64">
        {children}
      </div>
    </>
  );
}
