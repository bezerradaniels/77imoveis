import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Gift } from 'lucide-react';
import { adminGetUser } from '@/lib/data';
import { FreeForeverToggle } from '@/components/admin/FreeForeverToggle';

export const dynamic = 'force-dynamic';

const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleDateString('pt-BR') : '—');

export default async function UserDetail({ params }: { params: { id: string } }) {
  const user = await adminGetUser(params.id);
  if (!user) notFound();
  const u = user as any;
  const properties = (u.properties ?? []) as any[];

  const facts: [string, string][] = [
    ['Nome', u.full_name ?? '—'],
    ['E-mail', u.email ?? '—'],
    ['Telefone', u.phone ?? '—'],
    ['WhatsApp', u.whatsapp ?? '—'],
    ['Papel', u.role],
    ['Cidade', u.cities?.name ?? '—'],
    ['Situação', u.is_active ? 'Ativo' : 'Desativado'],
    ['Cadastrado em', fmtDate(u.created_at)],
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/usuarios" className="inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Usuários
      </Link>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold">{u.full_name ?? '(sem nome)'}</h1>
              <span className="rounded bg-bg px-1.5 py-0.5 text-xs">{u.role}</span>
              {!u.is_active && <span className="rounded bg-danger/15 px-1.5 py-0.5 text-xs text-danger">Desativado</span>}
              {u.free_forever && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                  <Gift size={12} /> Cortesia vitalícia
                </span>
              )}
            </div>
          </div>
          <FreeForeverToggle entity="profile" id={u.id} active={!!u.free_forever} />
        </div>

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        {u.free_forever && (
          <p className="mt-4 rounded-lg bg-success/10 p-3 text-xs text-success">
            Cortesia vitalícia concedida em {fmtDate(u.free_forever_since)} — sem o limite de 1 imóvel ativo.
          </p>
        )}
      </div>

      {/* Empresas do usuário */}
      {!!u.companies?.length && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-bold">Empresas ({u.companies.length})</h2>
          <ul className="divide-y divide-border">
            {u.companies.map((co: any) => (
              <li key={co.id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/admin/empresas/${co.id}`} className="text-link hover:underline">{co.trade_name}</Link>
                <span className="flex items-center gap-2 text-xs text-muted">
                  {co.free_forever && <Gift size={12} className="text-success" />}
                  {co.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Imóveis do usuário */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-bold">Imóveis ({properties.length})</h2>
        {properties.length ? (
          <ul className="divide-y divide-border">
            {properties.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/imovel/${p.slug}`} target="_blank" className="truncate text-link hover:underline">{p.title}</Link>
                <span className="ml-2 shrink-0 text-xs text-muted">{p.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nenhum imóvel cadastrado.</p>
        )}
      </div>
    </div>
  );
}
