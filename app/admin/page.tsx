import Link from 'next/link';
import { Home, Building2, Users, MessageSquare, Clock, CheckCircle2, UserRoundCheck } from 'lucide-react';
import { adminCounts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const c = await adminCounts();
  const cards = [
    { label: 'Imóveis (total)', value: c?.properties, Icon: Home, href: '/admin/imoveis' },
    { label: 'Imóveis ativos', value: c?.ativos, Icon: CheckCircle2, href: '/admin/imoveis?status=ativo' },
    { label: 'Em moderação', value: c?.moderacao, Icon: Clock, href: '/admin/imoveis?status=em_moderacao' },
    { label: 'Empresas', value: c?.companies, Icon: Building2, href: '/admin/empresas' },
    { label: 'Corretores', value: c?.brokers, Icon: UserRoundCheck, href: '/admin/corretores' },
    { label: 'Usuários', value: c?.users, Icon: Users, href: '/admin/usuarios' },
    { label: 'Leads', value: c?.leads, Icon: MessageSquare, href: '/admin/imoveis' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <Link key={card.label} href={card.href} className="rounded-xl border border-border bg-surface p-4 hover:bg-bg">
          <card.Icon size={20} className="text-link" />
          <p className="mt-2 text-2xl font-bold tabular-nums">{card.value ?? '—'}</p>
          <p className="text-sm text-muted">{card.label}</p>
        </Link>
      ))}
    </div>
  );
}
