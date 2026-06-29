import Link from 'next/link';
import { Building2, CreditCard, Home, MessageSquare, Shield, Store } from 'lucide-react';
import { getProfile } from '@/lib/auth';
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
  const nome = profile?.full_name?.split(' ')[0] ?? 'bem-vindo';

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 dark:bg-bg">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Olá, {nome} 👋</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted">
            <span>Conta {roleLabel[profile?.role ?? 'particular']}</span>
            <span aria-hidden>·</span>
            <form action={logout}>
              <button type="submit" className="font-medium text-link hover:text-link-hover">
                Sair
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/painel/imoveis"
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface p-4 hover:bg-bg"
          >
            <Home size={20} className="text-link" />
            <div>
              <p className="font-medium">Meus imóveis</p>
              <p className="text-xs text-muted">Criar, editar, ativar ou pausar</p>
            </div>
          </Link>
          <Link
            href="/painel/contatos"
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface p-4 hover:bg-bg"
          >
            <MessageSquare size={20} className="text-link" />
            <div>
              <p className="font-medium">Contatos recebidos</p>
              <p className="text-xs text-muted">Leads dos seus anúncios</p>
            </div>
          </Link>
          <Link
            href="/painel/empresa"
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface p-4 hover:bg-bg"
          >
            <Building2 size={20} className="text-link" />
            <div>
              <p className="font-medium">
                {profile?.role === 'profissional' ? 'Minha empresa' : 'Tornar-se profissional'}
              </p>
              <p className="text-xs text-muted">Perfil de empresa, vitrine e mais imóveis</p>
            </div>
          </Link>
          <Link
            href="/painel/vitrine"
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface p-4 hover:bg-bg"
          >
            <Store size={20} className="text-link" />
            <div>
              <p className="font-medium">Minha vitrine</p>
              <p className="text-xs text-muted">Página própria com seus imóveis</p>
            </div>
          </Link>
          <Link
            href="/painel/planos"
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface p-4 hover:bg-bg"
          >
            <CreditCard size={20} className="text-link" />
            <div>
              <p className="font-medium">Planos e upgrade</p>
              <p className="text-xs text-muted">Limites, destaques e recursos profissionais</p>
            </div>
          </Link>
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
