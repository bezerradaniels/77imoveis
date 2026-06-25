import Link from 'next/link';
import { Plus, Home, MessageSquare, Building2, Store, Shield } from 'lucide-react';
import { getProfile } from '@/lib/auth';

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
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Olá, {nome} 👋</h1>
          <p className="text-sm text-muted">
            Conta {roleLabel[profile?.role ?? 'particular']} · {profile?.email}
          </p>
        </div>
        <Link
          href="/painel/imoveis/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-white"
        >
          <Plus size={18} /> Novo anúncio
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/painel/imoveis"
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-5 hover:bg-bg"
        >
          <Home size={22} className="text-primary" />
          <div>
            <p className="font-medium">Meus imóveis</p>
            <p className="text-sm text-muted">Criar, editar, ativar ou pausar</p>
          </div>
        </Link>
        <Link
          href="/painel/contatos"
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-5 hover:bg-bg"
        >
          <MessageSquare size={22} className="text-primary" />
          <div>
            <p className="font-medium">Contatos recebidos</p>
            <p className="text-sm text-muted">Leads dos seus anúncios</p>
          </div>
        </Link>
        <Link
          href="/painel/empresa"
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-5 hover:bg-bg"
        >
          <Building2 size={22} className="text-primary" />
          <div>
            <p className="font-medium">{profile?.role === 'profissional' ? 'Minha empresa' : 'Tornar-se profissional'}</p>
            <p className="text-sm text-muted">Perfil de empresa, vitrine e mais imóveis</p>
          </div>
        </Link>
        <Link
          href="/painel/vitrine"
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-5 hover:bg-bg"
        >
          <Store size={22} className="text-primary" />
          <div>
            <p className="font-medium">Minha vitrine</p>
            <p className="text-sm text-muted">Página própria com seus imóveis</p>
          </div>
        </Link>
        {['admin', 'moderador'].includes(profile?.role ?? '') && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/5 p-5 hover:bg-primary/10"
          >
            <Shield size={22} className="text-primary" />
            <div>
              <p className="font-medium">Administração</p>
              <p className="text-sm text-muted">Moderação, empresas, usuários, cidades</p>
            </div>
          </Link>
        )}
      </div>
    </main>
  );
}
