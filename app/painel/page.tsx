import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2, CreditCard, Home, MessageSquare, Shield, Store, UserCog, Users } from 'lucide-react';
import { getProfile } from '@/lib/auth';
import { getMyCompany } from '@/lib/data';
import { TrackEventOnMount } from '@/components/analytics/TrackEventOnMount';
import { ANALYTICS_EVENTS } from '@/lib/analytics';
import { logout } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Painel', robots: { index: false } };

const roleLabel: Record<string, string> = {
  particular: 'Particular',
  profissional: 'Profissional',
  admin: 'Administrador',
  moderador: 'Moderador',
};

export default async function PainelPage() {
  const profile = await getProfile();
  if (profile?.role === 'admin') redirect('/admin');
  const company = profile?.role === 'profissional' ? await getMyCompany() : null;
  const isProfessional = profile?.role === 'profissional' && !!company;
  const showBrokers = company?.type === 'imobiliaria';
  const nome = profile?.full_name?.split(' ')[0] ?? 'bem-vindo';
  const accountLabel =
    company?.type === 'corretor_autonomo'
      ? 'Corretor autônomo'
      : company?.type === 'imobiliaria'
        ? 'Imobiliária'
        : company?.type === 'construtora'
          ? 'Construtora'
          : roleLabel[profile?.role ?? 'particular'];

  const cards = [
    {
      href: '/painel/imoveis',
      icon: Home,
      label: 'Meus imóveis',
      description: isProfessional && company?.type === 'corretor_autonomo'
        ? '1 grátis, mais imóveis com plano'
        : 'Criar, editar, ativar ou pausar',
    },
    { href: '/painel/contatos', icon: MessageSquare, label: 'Contatos recebidos', description: 'Leads dos seus anúncios' },
    {
      href: '/painel/empresa',
      icon: Building2,
      label: isProfessional ? 'Perfil profissional' : 'Atuar profissionalmente',
      description: isProfessional
        ? 'Dados públicos, contatos e cidades'
        : 'Virar corretor autônomo, imobiliária ou construtora',
    },
    ...(showBrokers
      ? [{ href: '/painel/corretores', icon: Users, label: 'Equipe de corretores', description: 'Cadastro avulso da imobiliária' }]
      : []),
    ...(isProfessional
      ? [
          { href: '/painel/vitrine', icon: Store, label: 'Minha vitrine', description: 'Página própria com seus imóveis' },
          { href: '/painel/planos', icon: CreditCard, label: 'Planos e upgrade', description: 'Limites, destaques e recursos profissionais' },
        ]
      : []),
    { href: '/painel/perfil', icon: UserCog, label: 'Meu perfil', description: 'Nome, foto, contatos e cidade' },
  ];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 dark:bg-bg">
      <TrackEventOnMount
        eventName={ANALYTICS_EVENTS.dashboardView}
        params={{ user_role: profile?.role ?? 'unknown', section: 'dashboard_home' }}
      />
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Olá, {nome} 👋</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted">
            <span>Conta {accountLabel}</span>
            <span aria-hidden>·</span>
            <form action={logout}>
              <button type="submit" className="font-medium text-link hover:text-link-hover">
                Sair
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-surface p-4 hover:bg-bg"
              >
                <Icon size={20} className="text-link" />
                <div>
                  <p className="font-medium">{card.label}</p>
                  <p className="text-xs text-muted">{card.description}</p>
                </div>
              </Link>
            );
          })}
          {['admin', 'moderador'].includes(profile?.role ?? '') && (
            <Link
              href="/admin"
              className="flex items-center gap-2.5 rounded-lg border border-primary/40 bg-primary/5 p-4 hover:bg-primary/10"
            >
              <Shield size={20} className="text-link" />
              <div>
                <p className="font-medium">Administração</p>
                <p className="text-xs text-muted">Moderação, empresas, usuários, cidades</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
